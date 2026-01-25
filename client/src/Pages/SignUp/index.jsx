import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";

import GoogleImg from "../../assets/images/googleImg.png";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";
import "../SignIn/signin.css";

// Google OAuth - No Firebase needed

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formfields, setFormfields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

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

  const onchangeInput = (e) => {
    setFormfields(() => ({
      ...formfields,
      [e.target.name]: e.target.value,
    }));
  };

  const register = (e) => {
    e.preventDefault();
    try {
      if (formfields.firstName.trim() === "" || formfields.lastName.trim() === "") {
        toast.error("First name and last name cannot be blank!");
        return false;
      }

      if (formfields.email === "") {
        toast.error("Email cannot be blank!");
        return false;
      }

      if (formfields.phone === "") {
        toast.error("Phone number cannot be blank!");
        return false;
      }

      setIsLoading(true);

      const payload = {
        firstName: formfields.firstName.trim(),
        lastName: formfields.lastName.trim(),
        email: formfields.email.trim(),
        phone: formfields.phone.trim(),
      };

      postData("/api/auth/register", payload)
        .then((res) => {
          if (res.success === true) {
            toast.success(res.message || "Registration successful! A temporary password has been sent to your email.");
            
            // Clear form
            setFormfields({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
            });

            // Redirect to sign in page after 2 seconds
            setTimeout(() => {
              history("/signIn");
            }, 2000);
          } else {
            setIsLoading(false);
            toast.error(res.message || "Registration failed");
          }
        })
        .catch((error) => {
          setIsLoading(false);
          console.error("Error posting data:", error);
          toast.error("Registration failed. Please try again.");
        });
    } catch (error) {
      console.log(error);
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
              const user = {
                name: userData.fullName || userData.firstName || userInfo.name || "",
                email: userData.email || userInfo.email || "",
                userId: userData.id || userData._id || "",
                image: userInfo.picture || userData.images?.[0] || userData.image || userData.picture || null,
              };

              // Store user data
              localStorage.setItem("user", JSON.stringify(user));

              // Update context - set isLogin first
              context.setIsLogin(true);
              
              // Small delay to ensure isLogin is processed first
              setTimeout(() => {
                context.setUser(user);
                context.setisHeaderFooterShow(true);

                toast.success("Google Sign-In successful!");

                history("/");
              }, 50);
            } else {
              toast.error(backendResponse.message || "Google Sign-In failed. Please try again.");
            }
          } catch (error) {
            console.error('Google Sign-In error:', error);
            toast.error("An error occurred during Google Sign-In. Please try again.");
          }
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
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
            <p className="signin-header-subtitle">Enter your details to get started</p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={register}>
            <div className="form-row">
              <div className="form-group-modern">
                <label className="form-label-modern">First Name</label>
                <TextField
                  id="signup-first-name"
                  type="text"
                  required
                  variant="outlined"
                  className="signin-input"
                  name="firstName"
                  onChange={onchangeInput}
                  placeholder="Enter your first name"
                  value={formfields.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon className="input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="form-group-modern">
                <label className="form-label-modern">Last Name</label>
                <TextField
                  id="signup-last-name"
                  type="text"
                  required
                  variant="outlined"
                  className="signin-input"
                  name="lastName"
                  onChange={onchangeInput}
                  placeholder="Enter your last name"
                  value={formfields.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon className="input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Email address</label>
              <TextField
                id="signup-email"
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

            <div className="form-group-modern">
              <label className="form-label-modern">Phone Number</label>
              <TextField
                id="signup-phone"
                type="tel"
                required
                variant="outlined"
                className="signin-input"
                name="phone"
                onChange={onchangeInput}
                placeholder="Enter your phone number"
                value={formfields.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon className="input-icon" />
                    </InputAdornment>
                  ),
                }}
              />
              <p className="form-helper-text">
                A temporary password will be sent to your email after registration. It will expire in 24 hours.
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
            >
              <img src={GoogleImg} alt="Google" className="google-icon" />
              <span>Continue with Google</span>
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
