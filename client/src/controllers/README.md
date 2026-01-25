# Authentication Controller Documentation

## Overview
The `AuthController` is a centralized authentication controller following industry-standard MVC (Model-View-Controller) architecture patterns. It handles all authentication-related API calls and business logic for the CraftzLK application.

## File Location
```
client/src/controllers/auth.controller.js
```

## Architecture Pattern
- **Pattern**: MVC (Model-View-Controller)
- **Type**: Static Class Controller
- **Purpose**: Centralize authentication logic and API endpoint management
- **Benefits**: 
  - Single source of truth for auth operations
  - Easy to maintain and test
  - Consistent error handling
  - Reusable across components

## Features

### ✅ User Registration
- Handles new user registration
- Validates and trims input data
- Returns standardized response format

### ✅ User Login
- Email/password authentication
- Automatic token storage
- User data persistence in localStorage

### ✅ Google OAuth Authentication
- Google Sign-In integration
- Token management
- User profile synchronization

### ✅ Session Management
- Token storage and retrieval
- User authentication status check
- Logout functionality

### ✅ Helper Methods
- Get current user data
- Get access/refresh tokens
- Check authentication status

## API Methods

### 1. Register
```javascript
AuthController.register(userData)
```

**Parameters:**
```javascript
{
  firstName: string,  // User's first name
  lastName: string,   // User's last name
  email: string,      // User's email address
  phone: string       // User's phone number
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: object | null
}
```

**Example Usage:**
```javascript
const result = await AuthController.register({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "0712345678"
});

if (result.success) {
  console.log("Registration successful!");
}
```

---

### 2. Login
```javascript
AuthController.login(credentials)
```

**Parameters:**
```javascript
{
  email: string,     // User's email address
  password: string   // User's password
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    user: object,
    accessToken: string,
    refreshToken: string
  }
}
```

**Example Usage:**
```javascript
const result = await AuthController.login({
  email: "john@example.com",
  password: "mypassword123"
});

if (result.success) {
  const user = AuthController.getCurrentUser();
  console.log("Welcome back,", user.name);
}
```

---

### 3. Google OAuth
```javascript
AuthController.googleAuth(accessToken, userInfo)
```

**Parameters:**
```javascript
accessToken: string,  // Google OAuth access token
userInfo: {          // Google user information object
  email: string,
  name: string,
  picture: string,
  id: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: {
    user: object,
    accessToken: string,
    refreshToken: string
  }
}
```

**Example Usage:**
```javascript
const result = await AuthController.googleAuth(
  googleAccessToken,
  googleUserInfo
);

if (result.success) {
  console.log("Google Sign-In successful!");
}
```

---

### 4. Logout
```javascript
AuthController.logout()
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: null
}
```

**Example Usage:**
```javascript
const result = AuthController.logout();
console.log(result.message); // "Logout successful"
```

---

### 5. Check Authentication Status
```javascript
AuthController.isAuthenticated()
```

**Returns:** `boolean`

**Example Usage:**
```javascript
if (AuthController.isAuthenticated()) {
  console.log("User is logged in");
} else {
  console.log("User is not logged in");
}
```

---

### 6. Get Current User
```javascript
AuthController.getCurrentUser()
```

**Returns:**
```javascript
{
  name: string,
  email: string,
  userId: string,
  image: string | null
} | null
```

**Example Usage:**
```javascript
const user = AuthController.getCurrentUser();
if (user) {
  console.log("Current user:", user.name);
}
```

---

### 7. Get Access Token
```javascript
AuthController.getAccessToken()
```

**Returns:** `string | null`

**Example Usage:**
```javascript
const token = AuthController.getAccessToken();
```

---

### 8. Get Refresh Token
```javascript
AuthController.getRefreshToken()
```

**Returns:** `string | null`

**Example Usage:**
```javascript
const refreshToken = AuthController.getRefreshToken();
```

---

### 9. Forgot Password
```javascript
AuthController.forgotPassword(email)
```

**Parameters:**
```javascript
email: string  // User's email address
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: object | null
}
```

**Example Usage:**
```javascript
const result = await AuthController.forgotPassword("john@example.com");

if (result.success) {
  console.log("Password reset link sent!");
}
```

---

### 10. Reset Password
```javascript
AuthController.resetPassword(resetData)
```

**Parameters:**
```javascript
{
  token: string,              // Reset token from email link
  password: string,           // New password
  confirmPassword: string     // Confirm new password
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data: object | null
}
```

**Validation:**
- Checks if passwords match
- Validates password minimum length (6 characters)
- Validates password contains letters and numbers

**Example Usage:**
```javascript
const result = await AuthController.resetPassword({
  token: "abc123...",
  password: "NewPass123",
  confirmPassword: "NewPass123"
});

if (result.success) {
  console.log("Password reset successful!");
}
```

## Integration Examples

### SignUp Component
```javascript
import AuthController from "../../controllers/auth.controller";

const onSubmit = async (data) => {
  setIsLoading(true);
  
  const result = await AuthController.register(data);
  
  if (result.success) {
    toast.success(result.message);
    history("/signIn");
  } else {
    toast.error(result.message);
  }
  
  setIsLoading(false);
};
```

### SignIn Component
```javascript
import AuthController from "../../controllers/auth.controller";

const onSubmit = async (data) => {
  setIsLoading(true);
  
  const result = await AuthController.login(data);
  
  if (result.success) {
    const user = AuthController.getCurrentUser();
    context.setUser(user);
    context.setIsLogin(true);
    toast.success(result.message);
    history("/");
  } else {
    toast.error(result.message);
  }
  
  setIsLoading(false);
};
```

### Protected Route Check
```javascript
import AuthController from "../controllers/auth.controller";

const ProtectedRoute = ({ children }) => {
  if (!AuthController.isAuthenticated()) {
    return <Navigate to="/signIn" />;
  }
  return children;
};
```

### ForgotPassword Component
```javascript
import AuthController from "../../controllers/auth.controller";

const onSubmit = async (data) => {
  setIsLoading(true);
  
  const result = await AuthController.forgotPassword(data.email);
  
  if (result.success) {
    toast.success(result.message);
    setTimeout(() => {
      history("/signIn");
    }, 3000);
  } else {
    toast.error(result.message);
  }
  
  setIsLoading(false);
};
```

### ResetPassword Component
```javascript
import AuthController from "../../controllers/auth.controller";

const onSubmit = async (data) => {
  setIsLoading(true);
  
  const result = await AuthController.resetPassword({
    token: tokenFromURL,
    password: data.password,
    confirmPassword: data.confirmPassword
  });
  
  if (result.success) {
    toast.success(result.message);
    setTimeout(() => {
      history("/signIn");
    }, 2000);
  } else {
    toast.error(result.message);
  }
  
  setIsLoading(false);
};
```

## Error Handling

The controller implements consistent error handling:

```javascript
{
  success: false,
  message: "Descriptive error message",
  data: null
}
```

All methods use try-catch blocks and return standardized error responses.

## Data Storage

The controller manages localStorage automatically:

- **token**: JWT access token
- **refreshToken**: JWT refresh token
- **user**: User profile data (JSON stringified)

## Best Practices

1. **Always check success status** before proceeding with the response
2. **Use standardized response format** for consistency
3. **Handle errors gracefully** with user-friendly messages
4. **Don't expose sensitive data** in console logs (production)
5. **Keep tokens secure** - never expose in client-side logs

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- All API calls use HTTPS (configure in production)
- Sensitive data is excluded from responses
- Input validation is handled server-side

## Future Enhancements

- [ ] Add token refresh mechanism
- [ ] Implement token expiration handling
- [ ] Add remember me functionality
- [ ] Support for multiple authentication providers
- [ ] Add two-factor authentication (2FA)

## Maintenance

When updating authentication logic:
1. Update the controller methods first
2. Update component integrations
3. Test all authentication flows
4. Update this documentation

## Support

For issues or questions, contact the development team or refer to the main project documentation.
