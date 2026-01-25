# Password Reset Testing Guide

## 🧪 Manual Testing Steps

### Prerequisites
1. Backend server running on `http://localhost:4000`
2. Frontend server running on `http://localhost:5173`
3. MongoDB database connected
4. Email service configured (Gmail SMTP)
5. Test user account registered

---

## Test Case 1: Forgot Password - Valid Email

### Steps:
1. Navigate to `/signIn`
2. Click "Forgot Password?" link
3. Enter a valid registered email
4. Click "Send Reset Link"

### Expected Results:
- ✅ Success toast: "If the email exists, a password reset link has been sent"
- ✅ Email received in inbox within 30 seconds
- ✅ Email contains reset button/link
- ✅ Link format: `http://localhost:5173/reset-password?token=<64-char-token>`
- ✅ Redirect to SignIn page after 3 seconds

### Backend Verification:
```bash
# Check MongoDB for reset token
db.users.findOne({ email: "test@example.com" }, { resetPasswordToken: 1, resetPasswordExpires: 1 })
```

Expected output:
```json
{
  "_id": "...",
  "resetPasswordToken": "abc123...",
  "resetPasswordExpires": "2026-01-25T10:15:00.000Z"
}
```

---

## Test Case 2: Forgot Password - Invalid Email

### Steps:
1. Navigate to `/forgot-password`
2. Enter an email that doesn't exist
3. Click "Send Reset Link"

### Expected Results:
- ✅ Same success message (email enumeration prevention)
- ✅ No email sent (no error shown to user)
- ✅ Redirect to SignIn page after 3 seconds

---

## Test Case 3: Reset Password - Valid Token

### Steps:
1. Complete Test Case 1
2. Click reset link from email
3. Enter new password: `NewPass123`
4. Confirm password: `NewPass123`
5. Click "Reset Password"

### Expected Results:
- ✅ Success toast: "Password reset successfully!"
- ✅ Redirect to SignIn page after 2 seconds
- ✅ Can log in with new password
- ✅ Cannot log in with old password

### Backend Verification:
```bash
# Check that reset token is cleared
db.users.findOne({ email: "test@example.com" }, { resetPasswordToken: 1, resetPasswordExpires: 1, refreshTokens: 1 })
```

Expected output:
```json
{
  "_id": "...",
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  "refreshTokens": []  // All refresh tokens cleared
}
```

---

## Test Case 4: Reset Password - Expired Token

### Steps:
1. Complete Test Case 1
2. Wait 11 minutes (token expires in 10 minutes)
3. Click reset link from email
4. Enter new password
5. Click "Reset Password"

### Expected Results:
- ❌ Error toast: "Invalid or expired reset token"
- ✅ User stays on reset password page
- ✅ Password not changed

---

## Test Case 5: Reset Password - Invalid Token

### Steps:
1. Navigate to `/reset-password?token=invalid123`
2. Enter new password
3. Click "Reset Password"

### Expected Results:
- ❌ Error toast: "Invalid or expired reset token"
- ✅ Password not changed

---

## Test Case 6: Reset Password - Password Validation

### Test 6.1: Too Short
- Enter password: `Pass1` (5 characters)
- **Expected:** Error: "Password must be at least 6 characters"

### Test 6.2: No Numbers
- Enter password: `Password` (no numbers)
- **Expected:** Error: "Password must contain at least one letter and one number"

### Test 6.3: No Letters
- Enter password: `123456` (no letters)
- **Expected:** Error: "Password must contain at least one letter and one number"

### Test 6.4: Passwords Don't Match
- Password: `NewPass123`
- Confirm: `NewPass456`
- **Expected:** Error: "Passwords do not match"

### Test 6.5: Valid Password
- Password: `NewPass123`
- Confirm: `NewPass123`
- **Expected:** Success! Password reset

---

## Test Case 7: Session Invalidation

### Steps:
1. Log in to account (get access + refresh tokens)
2. Request password reset
3. Reset password successfully
4. Try to use old access token

### Expected Results:
- ✅ Old refresh tokens are invalidated
- ✅ User must log in again with new password
- ✅ All sessions on all devices are logged out

---

## Test Case 8: Email Validation

### Test 8.1: Empty Email
- Leave email blank
- Click "Send Reset Link"
- **Expected:** Error: "Email is required"

### Test 8.2: Invalid Email Format
- Enter: `notanemail`
- Click "Send Reset Link"
- **Expected:** Error: "Please enter a valid email address"

---

## Test Case 9: Token Reuse Prevention

### Steps:
1. Request password reset
2. Use token to reset password successfully
3. Try to use the same token again

### Expected Results:
- ❌ Error: "Invalid or expired reset token"
- ✅ Token is single-use only

---

## Test Case 10: Multiple Reset Requests

### Steps:
1. Request password reset for same email
2. Wait 1 minute
3. Request password reset again
4. Check which token works

### Expected Results:
- ✅ Only the latest token is valid
- ✅ First token is overwritten
- ✅ Both emails are received

---

## 📧 Email Testing

### Check Email Received:
- **Subject:** "Password Reset Request"
- **From:** "CraftzLK <your-email@gmail.com>"
- **To:** User's email
- **Content:**
  - Greeting with user's first name
  - Clear reset button
  - Expiration notice (10 minutes)
  - Security notice if not requested

### Email Button/Link:
- **Text:** "Reset Password"
- **URL:** Contains 64-character token
- **Styling:** Blue button, centered

---

## 🔧 API Testing (Postman/curl)

### Test Request Password Reset
```bash
curl -X POST http://localhost:4000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### Test Reset Password
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-token-from-email",
    "password": "NewPass123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

## 🛠️ Database Verification Queries

### Check Reset Token Created:
```javascript
db.users.findOne(
  { email: "test@example.com" },
  { resetPasswordToken: 1, resetPasswordExpires: 1 }
)
```

### Check Password Changed:
```javascript
// Before reset - save password hash
db.users.findOne({ email: "test@example.com" }, { password: 1 })

// After reset - compare password hash (should be different)
db.users.findOne({ email: "test@example.com" }, { password: 1 })
```

### Check Refresh Tokens Cleared:
```javascript
db.users.findOne(
  { email: "test@example.com" },
  { refreshTokens: 1 }
)
// Should return: { "refreshTokens": [] }
```

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Email Not Received
**Symptoms:** User submits email, but no email arrives

**Checks:**
1. Check console for email sending errors
2. Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
3. Verify Gmail app password (not regular password)
4. Check spam/junk folder
5. Verify `FRONTEND_URL` is correct

**Fix:**
```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

---

### Issue 2: Token Invalid Immediately
**Symptoms:** Token is invalid right after creation

**Checks:**
1. Check server time vs database time
2. Verify token is saved to database
3. Check token expiration calculation

**Fix:**
```javascript
// In authService.js, check this calculation:
const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
console.log('Token expires at:', resetTokenExpires);
```

---

### Issue 3: Password Not Hashed
**Symptoms:** Password stored in plain text

**Checks:**
1. Verify User model pre-save hook is working
2. Check bcrypt is installed
3. Verify password field is modified

**Fix:**
```javascript
// Check User model pre-save hook (should exist):
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
```

---

### Issue 4: CORS Errors
**Symptoms:** Frontend can't call backend API

**Fix:**
```javascript
// In server/index.js, add CORS middleware:
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## ✅ Testing Checklist

### Functional Tests
- [ ] Valid email sends reset link
- [ ] Invalid email shows generic success
- [ ] Email contains correct reset URL
- [ ] Valid token resets password
- [ ] Expired token shows error
- [ ] Invalid token shows error
- [ ] Password validation works
- [ ] Password mismatch shows error
- [ ] Old tokens are invalidated
- [ ] Refresh tokens are cleared

### Security Tests
- [ ] Email enumeration prevented
- [ ] Tokens are cryptographically secure
- [ ] Passwords are hashed (bcrypt)
- [ ] Tokens expire after 10 minutes
- [ ] Tokens are single-use
- [ ] Sessions invalidated on reset
- [ ] Rate limiting applied

### UI/UX Tests
- [ ] Error messages are clear
- [ ] Success messages are informative
- [ ] Loading states show during API calls
- [ ] Redirects work correctly
- [ ] Form validation is immediate
- [ ] Toast notifications styled correctly

### Email Tests
- [ ] Email delivered successfully
- [ ] Email template renders correctly
- [ ] Reset link is clickable
- [ ] User name appears in greeting
- [ ] Expiration time is mentioned
- [ ] Security notice is included

---

## 📊 Performance Testing

### Response Times
- Request password reset: < 500ms (excluding email sending)
- Reset password: < 200ms
- Email delivery: < 5 seconds

### Load Testing
```bash
# Use Apache Bench to test rate limiting
ab -n 200 -c 10 http://localhost:4000/api/auth/request-password-reset
```

Expected: Max 100 requests allowed per 15 minutes

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development/Staging/Production

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Valid Email | ✅ / ❌ | |
| TC2: Invalid Email | ✅ / ❌ | |
| TC3: Valid Token | ✅ / ❌ | |
| TC4: Expired Token | ✅ / ❌ | |
| TC5: Invalid Token | ✅ / ❌ | |
| TC6: Password Validation | ✅ / ❌ | |
| TC7: Session Invalidation | ✅ / ❌ | |
| TC8: Email Validation | ✅ / ❌ | |
| TC9: Token Reuse | ✅ / ❌ | |
| TC10: Multiple Requests | ✅ / ❌ | |

Issues Found:
1. 
2. 
3. 

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🚀 Production Checklist

Before deploying to production:
- [ ] All test cases pass
- [ ] Email service configured with production credentials
- [ ] FRONTEND_URL set to production domain
- [ ] HTTPS enabled (not HTTP)
- [ ] Rate limiting configured properly
- [ ] Error logging set up (e.g., Sentry)
- [ ] Email deliverability tested
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Documentation updated

---

**Happy Testing! 🎉**
