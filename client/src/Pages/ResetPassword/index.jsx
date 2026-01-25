import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import LockIcon from "@mui/icons-material/Lock";
import { useForm, Controller } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";

import AuthController from "../../controllers/auth.controller";
import "../SignIn/signin.css";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const context = useContext(MyContext);
  const history = useNavigate();
  
  const token = searchParams.get("token");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const password = watch("password");

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);

    // Clear any existing tokens since they're invalid after password reset
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Check if token exists
    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      setTimeout(() => {
        history("/forgot-password");
      }, 2000);
    }
  }, [token]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const result = await AuthController.resetPassword({
        token: token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        toast.success(result.message || "Password reset successfully!");
        
        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          setIsLoading(false);
          history("/signIn");
        }, 2000);
      } else {
        setIsLoading(false);
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("[ResetPassword.onSubmit] Error:", error);
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
          alt="Reset password banner"
        />
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="signin-right-panel">
        <div className="signin-card">
          {/* Header */}
          <div className="signin-header">
            <p className="signin-header-small">Create new password</p>
            <h1 className="signin-header-title">Reset Password</h1>
            <p className="signin-header-subtitle">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group-modern">
              <label className="form-label-modern">New Password</label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
                    message: "Password must contain at least one letter and one number"
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="reset-password"
                    type="password"
                    variant="outlined"
                    className="signin-input"
                    placeholder="Enter new password"
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

            <div className="form-group-modern">
              <label className="form-label-modern">Confirm Password</label>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match"
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="reset-confirm-password"
                    type="password"
                    variant="outlined"
                    className="signin-input"
                    placeholder="Confirm new password"
                    error={!!errors.confirmPassword}
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
              {errors.confirmPassword && (
                <span className="form-error-text">{errors.confirmPassword.message}</span>
              )}
              <p className="form-helper-text">
                Password must be at least 6 characters and contain letters and numbers
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
                "Reset Password"
              )}
            </Button>

            <div className="signup-link-wrapper" style={{ marginTop: "1.5rem" }}>
              <p className="signup-text">
                Remember your password?{" "}
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

export default ResetPassword;
