import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { MyContext } from "../../../App";
import CountryDropdown from "../../CountryDropdown";
import Logo from "../../../assets/images/logo.png";
import { RiLogoutCircleRFill } from "react-icons/ri";

const Navigation = (props) => {
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [isOpenSubMenuIndex, setIsOpenSubMenuIndex] = useState(null);
  const [isOpenSubMenu_, setIsOpenSubMenu_] = useState(false);

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    setIsOpenNav(props.isOpenNav);
  }, [props.isOpenNav]);

  const IsOpenSubMenu = (index) => {
    setIsOpenSubMenuIndex(index);
    setIsOpenSubMenu_(!isOpenSubMenu_);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    context.setIsLogin(false);
    history("/signIn");
  };

  return (
    <nav>
      <div className="container">
        <div className="row">
          <div className="col-sm-2 navPart1 ">
            <div className="catWrapper">
              <Button
                className="allCatTab align-items-center res-hide"
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                <span className="icon1 mr-2">
                  <IoIosMenu />
                </span>
                <span className="text">ALL CATEGORIES</span>
                <span className="icon2  ml-2">
                  <FaAngleDown />
                </span>
              </Button>

              <div
                className={`sidebarNav ${
                  isopenSidebarVal === true ? "open" : ""
                }`}
              >
                <ul>
                  {props.navData?.map((item, index) => {
                    return (
                      <li>
                        <Link to={`/products/category/${item?._id}`}>
                          <Button>
                            <img
                              src={item?.images[0]}
                              width="20"
                              className="mr-2"
                            />{" "}
                            {item?.name} <FaAngleRight className="ml-auto" />
                          </Button>
                        </Link>
                        {item?.children?.length !== 0 && (
                          <div className="submenu">
                            {item?.children?.map((subCat, key) => {
                              return (
                                <Link
                                  to={`/products/subCat/${subCat?._id}`}
                                  key={key}
                                >
                                  <Button>{subCat?.name}</Button>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`col-sm-10 navPart2 d-flex align-items-center res-nav-wrapper ${
              isOpenNav === true ? "open" : "close"
            }`}
          >
            <div className="res-nav-overlay" onClick={props.closeNav}></div>

            <div className="res-nav">
              {context.windowWidth < 992 && (
                <div className="pl-3">
                  <Link to="/" className="logo">
                    <img src={Logo} alt="logo" />
                  </Link>
                </div>
              )}

              <ul className="list list-inline ml-auto">
                {context.windowWidth < 992 && (
                  <>
                    <li className="list-inline-item">
                      <div className="p-3">
                        {context.countryList.length !== 0 &&
                          context.windowWidth < 992 && <CountryDropdown />}
                      </div>
                    </li>
                  </>
                )}
                
                {props.navData
                  .filter((item, idx) => idx < 6)
                  .map((item, index) => {
                    return (
                      <li className="list-inline-item">
                        <Link
                          to={`/products/category/${item?._id}`}
                          onClick={props.closeNav}
                        >
                          <Button>
                            <img
                              src={item?.images[0]}
                              width="20"
                              className="mr-2"
                            />{" "}
                            {item?.name}
                          </Button>
                        </Link>

                        {item?.children?.length !== 0 &&
                          context.windowWidth < 992 && (
                            <span
                              className={`arrow ${
                                isOpenSubMenuIndex === index &&
                                isOpenSubMenu_ === true &&
                                "rotate"
                              }`}
                              onClick={() => IsOpenSubMenu(index)}
                            >
                              <FaAngleDown />
                            </span>
                          )}

                        {item?.children?.length !== 0 && (
                          <div
                            className={`submenu ${
                              isOpenSubMenuIndex === index &&
                              isOpenSubMenu_ === true &&
                              "open"
                            }`}
                          >
                            {item?.children?.map((subCat, key) => {
                              return (
                                <Link
                                  to={`/products/subCat/${subCat?._id}`}
                                  key={key}
                                  onClick={props.closeNav}
                                >
                                  <Button>{subCat?.name}</Button>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
              {context.windowWidth < 992 && (
                <>
                  {context?.isLogin === false ? (
                    <div className="pt-3 pl-3 pr-3">
                      <Link to="/signIn">
                        <Button className="btn-blue w-100 btn-big">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-3 pl-3 pr-3"  onClick={logout}>
                       <Button className="btn-blue w-100 btn-big">
                         <RiLogoutCircleRFill/> Logout
                        </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
