import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.png";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress";
import { editData, postData } from "../../utils/api";


const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    context.setisHeaderFooterShow(false);

    context.setEnableFilterTab(false);
  }, []);

  const [formfields, setFormfields] = useState({
    email:localStorage.getItem("userEmail"),
    newPass: "",
    confirmPass: "",
  });

  const onchangeInput = (e) => {
    setFormfields(() => ({
      ...formfields,
      [e.target.name]: e.target.value,
    }));
  };


  const changePass=(e)=>{
    e.preventDefault();

    if(formfields.newPass===""){
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter new password",
      });
      return false;
    }

    if(formfields.confirmPass===""){
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please confirm password",
      });
      return false;
    }


    if(formfields.newPass !== formfields.confirmPass){
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password and confirm password not match",
      });
      return false;
    }


    postData(`/api/user/forgotPassword/changePassword`, formfields).then((res) => {
        if(res.status==="SUCCESS"){
          context.setAlertBox({
            open: true,
            error: false,
            msg: res.message,
          });
          history("/signIn")
        }
    });

  }


  return (
    <section className="section signInPage">
      <div className="shape-bottom">
        {" "}
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
            <img src={Logo} />
          </div>

          <form className="mt-3" onSubmit={changePass}>
            <h2 className="mb-4">
              Change Password
            </h2>


            <div className="form-group position-relative">
            <TextField
              id="standard-basic"
              label="New Password"
              type="text"
              required
              variant="standard"
              className="w-100"
              name="newPass"
              onChange={onchangeInput}
            />
          </div>

            <div className="form-group position-relative">
              <TextField
                id="standard-basic"
                label="Confirm Password"
                type="text"
                required
                variant="standard"
                className="w-100"
                name="confirmPass"
                onChange={onchangeInput}
              />
            </div>

            <Button type="submit" className="btn-blue col btn-lg btn-big">
                {isLoading === true ? <CircularProgress /> : "Change Password"}
              </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
