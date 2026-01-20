const mongoose = require('mongoose');

const compareListSchema = mongoose.Schema({
    productTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});

compareListSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

compareListSchema.set('toJSON', {
    virtuals: true,
});

exports.CompareList = mongoose.model('CompareList', compareListSchema);
exports.compareListSchema = compareListSchema;
