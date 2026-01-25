import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

import GoogleImg from "../../assets/images/googleImg.png";
import CircularProgress from "@mui/material/CircularProgress";
import { editData, postData } from "../../utils/api";
import "./signin.css";

// Google OAuth - No Firebase needed

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenVerifyEmailBox, setIsOpenVerifyEmailBox] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const [formfields, setFormfields] = useState({
    email: "",
    password: "",
  });

  const onchangeInput = (e) => {
    setFormfields(() => ({
      ...formfields,
      [e.target.name]: e.target.value,
    }));
  };

  const login = (e) => {
    e.preventDefault();

    if (formfields.email === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "email can not be blank!",
      });
      return false;
    }

    if (isOpenVerifyEmailBox === false) {
      if (formfields.password === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "password can not be blank!",
        });
        return false;
      }

      setIsLoading(true);
      postData("/api/auth/login", formfields).then((res) => {
        try {
          if (res.success === true) {
            // Store access token
            localStorage.setItem("token", res.data.accessToken);
            
            // Store refresh token for token renewal
            localStorage.setItem("refreshToken", res.data.refreshToken);

            // Build user object with proper fallbacks
            const userData = res.data.user || {};
            const user = {
              name: userData.fullName || userData.firstName || "",
              email: userData.email || "",
              userId: userData.id || userData._id || "",
              image: userData.images?.[0] || userData.image || userData.picture || null,
            };

            // Store user data
            localStorage.setItem("user", JSON.stringify(user));

            // Update context
            context.setUser(user);
            context.setIsLogin(true);
            context.setisHeaderFooterShow(true);

            context.setAlertBox({
              open: true,
              error: false,
              msg: "Login successful!",
            });

            history("/");
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: res.message || "Login failed. Please try again.",
            });
          }
        } catch (error) {
          console.error("Login error:", error);
          context.setAlertBox({
            open: true,
            error: true,
            msg: "An error occurred. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(true);
      editData("/api/user/verify-email", {
        email: formfields.email,
      }).then((res) => {
        if (res.status === true) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Verification email sent successfully!",
          });
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg || "Failed to send verification email.",
          });
        }
        setIsLoading(false);
      });
    }
  };

  const signInWithGoogle = () => {
    if (!window.google) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Google Sign-In is loading. Please wait a moment and try again.",
      });
      return;
    }

    try {
      window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Google Sign-In failed. Please try again.",
            });
            return;
          }

          try {
            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${response.access_token}`
              }
            });

            if (!userInfoResponse.ok) {
              throw new Error('Failed to fetch user info');
            }

            const userInfo = await userInfoResponse.json();
            console.log('Google user info:', userInfo);

            // Send to backend
            const backendResponse = await postData("/api/auth/google", {
              token: response.access_token,
              userInfo: userInfo
            });

            if (backendResponse.success) {
              // Store tokens
              localStorage.setItem("token", backendResponse.data.accessToken);
              localStorage.setItem("refreshToken", backendResponse.data.refreshToken);

              // Build user object
              const userData = backendResponse.data.user || {};
              console.log('Backend user data:', userData);
              console.log('User images array:', userData.images);
              console.log('Google picture:', userInfo.picture);
              
              const user = {
                name: userData.fullName || userData.firstName || userInfo.name || "",
                email: userData.email || userInfo.email || "",
                userId: userData.id || userData._id || "",
                image: userInfo.picture || userData.images?.[0] || userData.image || userData.picture || null,
              };

              console.log('Final user object to store:', user);

              // Store user data
              localStorage.setItem("user", JSON.stringify(user));

              // Update context - set user AFTER setting isLogin
              console.log('Setting user in context:', user);
              context.setIsLogin(true);
              
              // Small delay to ensure isLogin is processed first
              setTimeout(() => {
                context.setUser(user);
                context.setisHeaderFooterShow(true);
                
                context.setAlertBox({
                  open: true,
                  error: false,
                  msg: "Google Sign-In successful!",
                });

                history("/");
              }, 50);
            } else {
              context.setAlertBox({
                open: true,
                error: true,
                msg: backendResponse.message || "Google Sign-In failed. Please try again.",
              });
            }
          } catch (error) {
            console.error('Google Sign-In error:', error);
            context.setAlertBox({
              open: true,
              error: true,
              msg: "An error occurred during Google Sign-In. Please try again.",
            });
          }
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Google Sign-In is not available. Please try again later.",
      });
    }
  };

  const forgotPassword = () => {
    if (formfields.email === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter your email address first",
      });
      return;
    }
    setIsOpenVerifyEmailBox(true);
  }

  return (
    <div className="signin-page-container">
      {/* Left Panel - Banner Image */}
      <div className="signin-left-panel">
        <img
          className="signin-banner-image"
          src={`${import.meta.env.BASE_URL}images/SignIn-banner.jpg`}
          alt="Sign in banner"
        />
      </div>

      {/* Right Panel - Sign-In Form */}
      <div className="signin-right-panel">
        <div className="signin-card">
          {/* Header */}
          <div className="signin-header">
            <p className="signin-header-small">Login your account</p>
            <h1 className="signin-header-title">
              {isOpenVerifyEmailBox === false ? "Welcome Back!" : "Verify Email"}
            </h1>
            {isOpenVerifyEmailBox === false && (
              <p className="signin-header-subtitle">Enter your email and password</p>
            )}
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={login}>
            <div className="form-group-modern">
              <label className="form-label-modern">Email address</label>
              <TextField
                id="signin-email"
                type="email"
                required
                variant="outlined"
                className="signin-input"
                name="email"
                onChange={onchangeInput}
                placeholder="Enter your email"
                value={formfields.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon className="input-icon" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {isOpenVerifyEmailBox === false ? (
              <>
                <div className="form-group-modern">
                  <label className="form-label-modern">Password</label>
                  <TextField
                    id="signin-password"
                    type="password"
                    required
                    variant="outlined"
                    className="signin-input"
                    name="password"
                    onChange={onchangeInput}
                    placeholder="Enter your password"
                    value={formfields.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon className="input-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="forgot-password-wrapper">
                  <a
                    className="forgot-password-link"
                    onClick={forgotPassword}
                  >
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="signin-button"
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading === true ? (
                    <CircularProgress size={24} className="loading-spinner" />
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="signin-divider">
                  <span className="signin-divider-line"></span>
                  <span className="signin-divider-text">or</span>
                  <span className="signin-divider-line"></span>
                </div>

                <Button
                  className="google-signin-button"
                  variant="outlined"
                  onClick={signInWithGoogle}
                  fullWidth
                  disabled={isLoading}
                >
                  <img src={GoogleImg} alt="Google" className="google-icon" />
                  <span>Continue with Google</span>
                </Button>

                <div className="signup-link-wrapper">
                  <p className="signup-text">
                    Don't have an account?{" "}
                    <Link to="/signUp" className="signup-link">
                      Create Account
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <Button
                type="submit"
                className="signin-button"
                disabled={isLoading}
                fullWidth
              >
                {isLoading === true ? (
                  <CircularProgress size={24} className="loading-spinner" />
                ) : (
                  "Verify Email"
                )}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
