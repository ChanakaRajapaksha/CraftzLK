import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";

import GoogleImg from "../../assets/images/googleImg.png";
import AuthController from "../../controllers/auth.controller";
import "../SignIn/signin.css";

// Google OAuth - No Firebase needed

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Call AuthController register method
      const result = await AuthController.register(data);

      if (result.success) {
        toast.success(
          result.message ||
            "Registration successful! A temporary password has been sent to your email.",
        );

        // Clear form
        reset();

        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          setIsLoading(false);
          history("/signIn");
        }, 2000);
      } else {
        setIsLoading(false);
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("[SignUp.onSubmit] Error:", error);
      setIsLoading(false);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const signInWithGoogle = () => {
    if (!window.google) {
      toast.error(
        "Google Sign-In is loading. Please wait a moment and try again.",
      );
      return;
    }

    try {
      window.google.accounts.oauth2
        .initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "email profile",
          callback: async (response) => {
            if (response.error) {
              console.error("Google OAuth error:", response.error);
              toast.error("Google Sign-In failed. Please try again.");
              return;
            }

            try {
              // Get user info from Google
              const userInfoResponse = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${response.access_token}`,
                  },
                },
              );

              if (!userInfoResponse.ok) {
                throw new Error("Failed to fetch user info");
              }

              const userInfo = await userInfoResponse.json();

              // Call AuthController googleAuth method
              const result = await AuthController.googleAuth(
                response.access_token,
                userInfo,
              );

              if (result.success) {
                // Update context
                const user = AuthController.getCurrentUser();
                context.setIsLogin(true);

                // Small delay to ensure isLogin is processed first
                setTimeout(() => {
                  context.setUser(user);
                  context.setisHeaderFooterShow(true);
                  toast.success(result.message || "Google Sign-In successful!");
                  history("/");
                }, 50);
              } else {
                toast.error(
                  result.message || "Google Sign-In failed. Please try again.",
                );
              }
            } catch (error) {
              console.error("[SignUp.signInWithGoogle] Error:", error);
              toast.error(
                "An error occurred during Google Sign-In. Please try again.",
              );
            }
          },
        })
        .requestAccessToken();
    } catch (error) {
      console.error("[SignUp.signInWithGoogle] Initialization error:", error);
      toast.error("Google Sign-In is not available. Please try again later.");
    }
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

      {/* Right Panel - Sign-Up Form */}
      <div className="signin-right-panel">
        <div className="signin-card">
          {/* Header */}
          <div className="signin-header">
            <p className="signin-header-small">Create your account</p>
            <h1 className="signin-header-title">Sign Up</h1>
            <p className="signin-header-subtitle">
              Enter your details to get started
            </p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group-modern">
                <label className="form-label-modern">First Name</label>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: "First name can only contain letters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="signup-first-name"
                      type="text"
                      variant="outlined"
                      className="signin-input"
                      placeholder="Enter your first name"
                      error={!!errors.firstName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon className="input-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                {errors.firstName && (
                  <span className="form-error-text">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div className="form-group-modern">
                <label className="form-label-modern">Last Name</label>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: "Last name can only contain letters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="signup-last-name"
                      type="text"
                      variant="outlined"
                      className="signin-input"
                      placeholder="Enter your last name"
                      error={!!errors.lastName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon className="input-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                {errors.lastName && (
                  <span className="form-error-text">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Email address</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="signup-email"
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

            <div className="form-group-modern">
              <label className="form-label-modern">Phone Number</label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^(\+94)?[0-9]{9,10}$/,
                    message:
                      "Please enter a valid phone number (e.g., 0712345678 or +94712345678)",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="signup-phone"
                    type="tel"
                    variant="outlined"
                    className="signin-input"
                    placeholder="Enter your phone number"
                    error={!!errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon className="input-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              {errors.phone && (
                <span className="form-error-text">{errors.phone.message}</span>
              )}
              <p className="form-helper-text">
                A temporary password will be sent to your email after
                registration. It will expire in 24 hours.
              </p>
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
                "Sign Up"
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
              sx={{ color: "#fff5e6" }}
            >
              <img src={GoogleImg} alt="Google" className="google-icon" />
              <span style={{ color: "#fff5e6" }}>Continue with Google</span>
            </Button>

            <div className="signup-link-wrapper">
              <p className="signup-text">
                Already have an account?{" "}
                <Link to="/signIn" className="signup-link">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
