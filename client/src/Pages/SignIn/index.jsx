import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useForm, Controller } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";

import GoogleImg from "../../assets/images/googleImg.png";
import AuthController from "../../controllers/auth.controller";
import { editData } from "../../utils/api";
import "./signin.css";

// Google OAuth - No Firebase needed

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenVerifyEmailBox, setIsOpenVerifyEmailBox] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

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

  const onSubmit = async (data) => {
    try {
      if (isOpenVerifyEmailBox) {
        // Verify email flow
        setIsLoading(true);
        editData("/api/user/verify-email", {
          email: data.email,
        }).then((res) => {
          if (res.status === true) {
            toast.success("Verification email sent successfully!");
          } else {
            toast.error(res.msg || "Failed to send verification email.");
          }
          setIsLoading(false);
        });
      } else {
        // Login flow using AuthController
        setIsLoading(true);
        
        const result = await AuthController.login({
          email: data.email,
          password: data.password,
        });

        if (result.success) {
          // Get user data from controller
          const user = AuthController.getCurrentUser();

          // Update context
          context.setUser(user);
          context.setIsLogin(true);
          context.setisHeaderFooterShow(true);

          toast.success(result.message || "Login successful!");
          history("/");
        } else {
          toast.error(result.message || "Login failed. Please try again.");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[SignIn.onSubmit] Error:", error);
      setIsLoading(false);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const signInWithGoogle = () => {
    if (!window.google) {
      toast.error("Google Sign-In is loading. Please wait a moment and try again.");
      return;
    }

    try {
      window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            toast.error("Google Sign-In failed. Please try again.");
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

            // Call AuthController googleAuth method
            const result = await AuthController.googleAuth(response.access_token, userInfo);

            if (result.success) {
              // Get user data from controller
              const user = AuthController.getCurrentUser();

              // Update context
              context.setIsLogin(true);
              
              // Small delay to ensure isLogin is processed first
              setTimeout(() => {
                context.setUser(user);
                context.setisHeaderFooterShow(true);
                toast.success(result.message || "Google Sign-In successful!");
                history("/");
              }, 50);
            } else {
              toast.error(result.message || "Google Sign-In failed. Please try again.");
            }
          } catch (error) {
            console.error('[SignIn.signInWithGoogle] Error:', error);
            toast.error("An error occurred during Google Sign-In. Please try again.");
          }
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('[SignIn.signInWithGoogle] Initialization error:', error);
      toast.error("Google Sign-In is not available. Please try again later.");
    }
  };

  const forgotPassword = () => {
    history("/forgot-password");
  };

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
          <form className="signin-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group-modern">
              <label className="form-label-modern">Email address</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="signin-email"
                    type="email"
                    variant="outlined"
                    className="signin-input"
                    placeholder="Enter your email"
                    error={!!errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon className="input-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              {errors.email && (
                <span className="form-error-text">{errors.email.message}</span>
              )}
            </div>

            {isOpenVerifyEmailBox === false ? (
              <>
                <div className="form-group-modern">
                  <label className="form-label-modern">Password</label>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="signin-password"
                        type="password"
                        variant="outlined"
                        className="signin-input"
                        placeholder="Enter your password"
                        error={!!errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon className="input-icon" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  {errors.password && (
                    <span className="form-error-text">{errors.password.message}</span>
                  )}
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
