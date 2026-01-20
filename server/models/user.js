const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if user is not using OAuth
            return !this.googleId && this.authProvider !== 'google';
        },
        validate: {
            validator: function(value) {
                // If user is OAuth, password is not required
                if (this.googleId || this.authProvider === 'google') {
                    return true;
                }
                // For non-OAuth users, password must be at least 8 characters
                return value && value.length >= 8;
            },
            message: 'Password must be at least 8 characters for non-OAuth users'
        },
        select: false // Don't include password in queries by default
    },
    // Google OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    images: [{
        type: String,
        required: false
    }],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // Authentication fields
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date,
        deviceInfo: String,
        ipAddress: String
    }],
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Account security
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    // OTP for verification
    otp: String,
    otpExpires: Date,
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ resetPasswordToken: 1 });

// Pre-save middleware to hash password
// Use promise-based hook (no `next` arg) to avoid "next is not a function"
userSchema.pre('save', async function() {
    // Skip password hashing if password is not modified or if user is using OAuth
    if (!this.isModified('password') || !this.password || this.googleId) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Pre-save middleware to update updatedAt (promise-based, no next)
userSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    // Check if user has a password (OAuth users don't have passwords)
    if (!this.password) {
        return false;
    }
    
    // Check if candidate password is provided
    if (!candidatePassword) {
        return false;
    }
    
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Transform JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    delete userObject.otp;
    delete userObject.otpExpires;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
