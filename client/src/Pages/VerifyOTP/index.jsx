import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.png";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import OtpBox from "../../Components/OtpBox";

const VerifyOTP = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState("");

  const context = useContext(MyContext);
  const history = useNavigate();

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  useEffect(() => {
    context.setisHeaderFooterShow(false);

    context.setEnableFilterTab(false);
  }, []);

  const verify = (e) => {
    e.preventDefault();
    const obj = {
      otp: otp,
      email: localStorage.getItem("userEmail"),
    };

    if (otp !== "") {
      const actionType = localStorage.getItem("actionType");

      postData(`/api/user/verifyemail`, obj).then((res) => {
        if (res?.success === true) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: res?.message,
          });
          setIsLoading(false);

          if (actionType !== "changePassword") {
            localStorage.removeItem("userEmail");
            history("/signIn");
          } else {
            history("/changePassword");
          }
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res?.message,
          });
          setIsLoading(false);
        }
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter OTP",
      });
    }
  };

  return (
    <section className="section signInPage otpPage">
      <div className="shape-bottom">
        <svg
          fill="#fff"
          id="Layer_1"
          x="0px"
          y="0px"
          viewBox="0 0 1921 819.8"
          style={{ enableBackground: "new 0 0 1921 819.8" }}
        >
          {" "}
          <path
            class="st0"
            d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
          ></path>{" "}
        </svg>
      </div>

      <div className="container">
        <div className="box card p-3 shadow border-0">
          <div className="text-center">
            <img src={"/shield.png"} width={"100px"} />
          </div>

          <form className="mt-3" onSubmit={verify}>
            <h2 className="mb-1 text-center">OTP Verification</h2>
            <p className="text-center text-light">
              OTP has been sent to <b>{localStorage.getItem("userEmail")}</b>
            </p>

            <OtpBox length={6} onChange={handleOtpChange} />

            <div className="d-flex align-items-center mt-3 mb-3 ">
              <Button type="submit" className="btn-blue col btn-lg btn-big">
                {isLoading === true ? <CircularProgress /> : "Verify OTP"}
              </Button>
            </div>

            <p className="text-center">
              <a className="border-effect cursor txt">Rend OTP</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VerifyOTP;
