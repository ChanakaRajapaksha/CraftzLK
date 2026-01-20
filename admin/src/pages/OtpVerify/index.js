import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import OtpBox from "../../components/OtpBox";

const VerifyAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const history = useNavigate();
  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, []);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const verify = (e) => {
    e.preventDefault();
    const obj = {
      otp: otp,
      email: localStorage.getItem("userEmail"),
    };

    postData(`/api/user/verifyemail`, obj).then((res) => {
      if (res?.success === true) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: res?.message,
        });
        setIsLoading(false);
        localStorage.removeItem("userEmail");
        history("/login");
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res?.message,
        });
        setIsLoading(false);
      }
    });
  };

  return (
    <>
      <section className="loginSection">
        <div className="loginBox">
          <Link to={"/"} className="d-flex align-items-center flex-column logo">
            <span className="ml-2 LOGINSIGHUP_TEXT">ECOMMERCE</span>
          </Link>
          <div className="wrapper mt-3 card border text-center">
            <form  onSubmit={verify}>
              <img src={"/shield.png"} width="80px"/>
              <p className="text-center mt-3">
                OTP has been sent to <b>{localStorage.getItem("userEmail")}</b>
              </p>

              <OtpBox length={6} onChange={handleOtpChange} />

              <div className="form-group mt-3 row">
                <Button type="submit" className="btn-blue btn-lg w-100 btn-big">
                  {isLoading === true ? <CircularProgress /> : "Verify OTP "}
                </Button>
              </div>
            </form>
          </div>

          <div className="wrapper mt-3 card border footer p-3">
            <span className="text-center">
              <Link to={"/"} className="link color ml-2">
                Resend OTP
              </Link>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default VerifyAccount;
