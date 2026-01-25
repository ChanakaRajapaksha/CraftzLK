import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import AuthController from "../../controllers/auth.controller";
import "../SignIn/signin.css";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);
    
    // Clear any existing tokens on forgot password page
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const result = await AuthController.forgotPassword(data.email);

      if (result.success) {
        toast.success(result.message || "Password reset link sent to your email!");
        
        // Redirect to sign in page after 3 seconds
        setTimeout(() => {
          setIsLoading(false);
          history("/signIn");
        }, 3000);
      } else {
        setIsLoading(false);
        toast.error(result.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("[ForgotPassword.onSubmit] Error:", error);
      setIsLoading(false);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="signin-page-container">
      {/* Left Panel - Banner Image */}
      <div className="signin-left-panel">
        <img
          className="signin-banner-image"
          src={`${import.meta.env.BASE_URL}images/SignIn-banner.jpg`}
          alt="Forgot password banner"
        />
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="signin-right-panel">
        <div className="signin-card">
          {/* Header */}
          <div className="signin-header">
            <p className="signin-header-small">Reset your password</p>
            <h1 className="signin-header-title">Forgot Password?</h1>
            <p className="signin-header-subtitle">
              Enter your email address and we'll send you a link to reset your password
            </p>
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
                    id="forgot-password-email"
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

            <Button
              type="submit"
              className="signin-button"
              disabled={isLoading}
              fullWidth
            >
              {isLoading === true ? (
                <CircularProgress size={24} className="loading-spinner" />
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="signup-link-wrapper" style={{ marginTop: "1.5rem" }}>
              <Link to="/signIn" className="back-to-signin-link">
                <ArrowBackIcon style={{ fontSize: "1rem", marginRight: "0.5rem" }} />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
