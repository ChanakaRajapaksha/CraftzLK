import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CountryDropdown from "../CountryDropdown/index.jsx";
import { FiUser } from "react-icons/fi";
import { IoBagOutline, IoPersonOutline, IoBagCheckOutline, IoHeartOutline, IoLogOutOutline, IoGitCompareOutline, IoGridOutline } from "react-icons/io5";
import Navigation from "./Navigation/index.jsx";
import { useContext } from "react";
import { MyContext } from "../../App";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { IoMdMenu } from "react-icons/io";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { FaAngleUp } from "react-icons/fa6";
import UserAvatarImgComponent from "../userAvatarImg";
import { IoHomeOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { CiFilter } from "react-icons/ci";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import AuthController from "../../controllers/auth.controller";
import SearchBox from "./SearchBox/index.jsx";

const TOP_STRIP_CLOSED_KEY = "craftzlk_top_strip_closed";
const TOP_STRIP_HEIGHT_PX = 42;

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isTopStripVisible, setIsTopStripVisible] = useState(() => {
    try {
      return !localStorage.getItem(TOP_STRIP_CLOSED_KEY);
    } catch {
      return true;
    }
  });
  const [showTopStripAfterDelay, setShowTopStripAfterDelay] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const open = Boolean(anchorEl);

  const headerRef = useRef();
  const gotoTop = useRef();
  const lastScrollY = useRef(0);
  const context = useContext(MyContext);

  useEffect(() => {
    if (headerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
           setHeaderHeight(entry.target.offsetHeight);
        }
      });
      resizeObserver.observe(headerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const history = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    setAnchorEl(null);
    await AuthController.logout();
    context.setIsLogin(false);
    toast.success("Logout Successfully");
    history("/signIn");
  };

  useEffect(() => {
    const handleScroll = () => {
      let position = window.pageYOffset;
      if (gotoTop.current) {
        if (position > 500) {
          gotoTop.current.classList.add("show");
        } else {
          gotoTop.current.classList.remove("show");
        }
      }

      if (position > 100) {
        if (position > lastScrollY.current) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = position;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isTopStripVisible) return;
    const t = setTimeout(() => setShowTopStripAfterDelay(true), 1500);
    return () => clearTimeout(t);
  }, [isTopStripVisible, context.isLogin]);

  const openNav = () => {
    setIsOpenNav(!isOpenNav);
    context.setIsOpenNav(true);
    context.setIsBottomShow(false);
  };

  const closeNav = () => {
    setIsOpenNav(false);
    context.setIsOpenNav(false);
    context.setIsBottomShow(true);
  };

  const openSearch = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  const closeSearch = () => {
    setIsOpenSearch(false);
  };

  const closeTopStrip = () => {
    setIsTopStripVisible(false);
    try {
      localStorage.setItem(TOP_STRIP_CLOSED_KEY, "true");
    } catch (_) {}
  };

  const gotoTopScroll = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openFilter = () => {
    context?.setIsOpenFilters(!context?.isOpenFilters);
  };

  return (
    <>
      <AnimatePresence>
        {isOpenSearch && (
          <>
            <motion.div
              className="global-search-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeSearch}
            />
            <motion.div
              className="global-search-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="global-search-box">
                <SearchBox closeSearch={closeSearch} />
              </div>
              <button
                type="button"
                className="global-search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <IoMdClose aria-hidden="true" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Button className="gotoTop" ref={gotoTop} onClick={gotoTopScroll}>
        <FaAngleUp />
      </Button>

      {/* Top strip only: fixed at top, does not scroll */}
      <div className="header-top-strip-fixed">
        <AnimatePresence>
          {isTopStripVisible && showTopStripAfterDelay && (
            <motion.div
              key="top-strip"
              className="bg-blue"
              initial={{ height: 0 }}
              animate={{ height: TOP_STRIP_HEIGHT_PX }}
              exit={{ height: 0 }}
              transition={{
                duration: 1.0,
                ease: "easeInOut",
              }}
              style={{ overflow: "hidden" }}
            >
              <motion.div
                className="top-strip"
                style={{ minHeight: TOP_STRIP_HEIGHT_PX }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="container">
                  <p className="mb-0 mt-0 text-center">
                    Free Shipping on all orders over Rs 12,000!
                  </p>
                </div>
                <button
                  type="button"
                  className="top-strip-close"
                  onClick={closeTopStrip}
                  aria-label="Close"
                >
                  <IoMdClose aria-hidden="true" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer: reserves space so nav bar starts below the fixed strip */}
      <AnimatePresence>
        {isTopStripVisible && showTopStripAfterDelay && (
          <motion.div
            className="header-top-strip-spacer"
            initial={{ height: 0 }}
            animate={{ height: TOP_STRIP_HEIGHT_PX }}
            exit={{ height: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            style={{ display: "block", overflow: "hidden" }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Spacer for Fixed Header */}
      {headerHeight > 0 && (
         <div className="header-spacer" style={{ height: headerHeight }} />
      )}



      {/* Nav bar and everything below: Fixed */}
      <motion.div
        className="headerWrapperFixed"
        ref={headerRef}
        initial={{ top: 0, y: 0 }}
        animate={{
          top: isTopStripVisible && showTopStripAfterDelay ? TOP_STRIP_HEIGHT_PX : 0,
          y: isHeaderVisible ? "0%" : "-100%"
        }}
        transition={{
          top: { duration: 1.0, ease: "easeInOut" },
          y: { duration: 0.3, ease: "easeInOut" }
        }}
        style={{
          position: "fixed",
          zIndex: 10000,
          width: "100%",
          transition: "none", // Disable CSS transition to let Framer control it
        }}
      >
        <div className="headerWrapper">
          <header className="header">
            <div className="container">
              <div className="row header-nav-row">
                {/* Left section: search + mobile menu/cart - equal flex so logo stays centered */}
                <div className="header-nav-left logoWrapper d-flex align-items-center">
                  <Button
                    className="circle mr-2 searchTrigger"
                    onClick={openSearch}
                  >
                    <IoIosSearch />
                  </Button>

                  {context.windowWidth < 992 && (
                    <Button className="circle toggleNav" onClick={openNav}>
                      <IoMdMenu />
                    </Button>
                  )}

                  {context.windowWidth < 992 && (
                    <div className="position-relative cartTab ml-2">
                      <Link to="/cart" className="ml-auto">
                        <Button className="circle">
                          <IoBagOutline />
                        </Button>

                        <span className="count d-flex align-items-center justify-content-center">
                          {context.cartData?.length > 0
                            ? context.cartData?.length
                            : 0}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Center section: logo only - true center because left/right have equal flex */}
                <div className="header-nav-center d-flex align-items-center justify-content-center">
                    <Link to={"/"} className="logo logo-blur-bg">
                      <motion.img
                        src="/images/craftzlk.png"
                        alt="CraftzLK logo"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </Link>
                </div>

                {/* Right section: sign in or profile (same spot), then cart - equal flex to left */}
                <div className="header-nav-right part3 d-flex align-items-center justify-content-end">
                  <div className="header-nav-right-group d-flex align-items-center ml-auto">
                    {context.isLogin !== true && context.windowWidth > 992 && (
                      <Link to="/signIn" className="mr-3">
                        <Button className="btn-blue btn-round">Sign In</Button>
                      </Link>
                    )}
                    {context.isLogin === true && (
                      <div className="res-hide">
                        <Button
                          className="circle mr-3 d-flex align-items-center justify-content-center"
                          onClick={handleClick}
                          style={{
                            padding: 0,
                            minWidth: "40px",
                            width: "40px",
                            height: "40px",
                          }}
                        >
                          <UserAvatarImgComponent
                            img={context?.user?.image}
                            userName={
                              context?.user?.name
                                ? context?.user?.name?.toUpperCase()
                                : ""
                            }
                          />
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          id="accDrop"
                          open={open}
                          onClose={handleClose}
                          onClick={handleClose}
                          transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                          }}
                          anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                          }}
                        >
                          <div className="info d-flex align-items-center">
                            <div className="img">
                              <UserAvatarImgComponent
                                img={context?.user?.image}
                                userName={
                                  context?.user?.name
                                    ? context?.user?.name?.toUpperCase()
                                    : ""
                                }
                              />
                            </div>

                            <div className="ml-3">
                              <h5 className="mb-1 mt-0" style={{ color: "#000" }}>
                                {context?.user?.name}
                              </h5>
                              <h6 className="text-sml" style={{ color: "#000" }}>
                                {context?.user?.email}
                              </h6>
                            </div>
                          </div>

                          {context?.user?.role === "admin" && (
                            <Link to="/dashboard">
                              <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                  <IoGridOutline />
                                </ListItemIcon>
                                Dashboard
                              </MenuItem>
                            </Link>
                          )}
                          <Link to="/my-account">
                            <MenuItem onClick={handleClose}>
                              <ListItemIcon>
                                <IoPersonOutline />
                              </ListItemIcon>
                              My Account
                            </MenuItem>
                          </Link>
                          <Link to="/orders">
                            <MenuItem onClick={handleClose}>
                              <ListItemIcon>
                                <IoBagCheckOutline />
                              </ListItemIcon>
                              Orders
                            </MenuItem>
                          </Link>
                          <Link to="/my-list">
                            <MenuItem onClick={handleClose}>
                              <ListItemIcon>
                                <IoHeartOutline />
                              </ListItemIcon>
                              My List
                            </MenuItem>
                          </Link>
                          <MenuItem onClick={logout}>
                            <ListItemIcon>
                              <IoLogOutOutline />
                            </ListItemIcon>
                            Logout
                          </MenuItem>
                          <Link to="/compare">
                            <MenuItem onClick={handleClose}>
                              <ListItemIcon>
                                <IoGitCompareOutline />
                              </ListItemIcon>
                              Compare
                            </MenuItem>
                          </Link>
                        </Menu>
                      </div>
                    )}

                    <div className="ml-auto cartTab d-flex align-items-center">
                      {context.windowWidth > 1000 && (
                        <span className="price text-white">
                          {(context.cartData?.length !== 0
                            ? context.cartData
                                ?.map(
                                  (item) =>
                                    parseInt(item.price) * item.quantity,
                                )
                                .reduce((total, value) => total + value, 0)
                            : 0
                          )?.toLocaleString("en-US", {
                            style: "currency",
                            currency: "LKR",
                          })}
                        </span>
                      )}

                      <div className="position-relative ml-2 res-hide">
                        <Link to="/cart">
                          <Button className="circle">
                            <IoBagOutline />
                          </Button>
                          <span className="count d-flex align-items-center justify-content-center">
                            {context.cartData?.length > 0
                              ? context.cartData?.length
                              : 0}
                          </span>
                        </Link>
                      </div>

                      {context.windowWidth < 992 && (
                        <Button
                          className="circle ml-3 toggleNav res-hide"
                          onClick={openNav}
                        >
                          <IoMdMenu />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {context.categoryData?.length !== 0 && (
            <Navigation
              navData={context.categoryData}
              isOpenNav={isOpenNav}
              closeNav={closeNav}
            />
          )}
        </div>

        {context.windowWidth < 992 && context?.isBottomShow === true && (
          <div className="fixed-bottom-menu d-flex align-self-center justify-content-between">
            <Link to="/" onClick={() => setIsOpenSearch(false)}>
              <Button className="circle">
                <div className="d-flex align-items-center justify-content-center flex-column">
                  <IoHomeOutline />
                  <span className="title">Home</span>
                </div>
              </Button>
            </Link>

            {context.enableFilterTab === true && (
              <Button
                className="circle"
                onClick={() => {
                  openFilter();
                  setIsOpenSearch(false);
                }}
              >
                <div className="d-flex align-items-center justify-content-center flex-column">
                  <CiFilter />
                  <span className="title">Filters</span>
                </div>
              </Button>
            )}

            <Button className="circle" onClick={openSearch}>
              <div className="d-flex align-items-center justify-content-center flex-column">
                <IoIosSearch />
                <span className="title">Search</span>
              </div>
            </Button>

            <Link to="/my-list" onClick={() => setIsOpenSearch(false)}>
              <Button className="circle">
                <div className="d-flex align-items-center justify-content-center flex-column">
                  <IoMdHeartEmpty />
                  <span className="title">Wishlist</span>
                </div>
              </Button>
            </Link>

            <Link to="/orders" onClick={() => setIsOpenSearch(false)}>
              <Button className="circle">
                <div className="d-flex align-items-center justify-content-center flex-column">
                  <IoBagCheckOutline />
                  <span className="title">Orders</span>
                </div>
              </Button>
            </Link>

            <Link to="/my-account" onClick={() => setIsOpenSearch(false)}>
              <Button className="circle">
                <div className="d-flex align-items-center justify-content-center flex-column">
                  <FaRegUser />
                  <span className="title">Account</span>
                </div>
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Header;
