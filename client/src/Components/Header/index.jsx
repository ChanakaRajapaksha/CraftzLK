import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CountryDropdown from "../CountryDropdown/index.jsx";
import { FiUser } from "react-icons/fi";
import { IoBagOutline, IoPersonOutline, IoBagCheckOutline, IoLogOutOutline, IoGridOutline } from "react-icons/io5";
import SecondaryCategoryNav from "./SecondaryCategoryNav/index.jsx";
import { useContext } from "react";
import { MyContext } from "../../App";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { IoMdMenu } from "react-icons/io";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { FaAngleUp } from "react-icons/fa6";
import UserAvatarImgComponent from "../userAvatarImg";
import { FaRegUser } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import AuthController from "../../controllers/auth.controller";
import { useAppDispatch } from "../../store/hooks";
import { clearAuth } from "../../store/slices/authSlice";
import SearchBox from "./SearchBox/index.jsx";
import { getCartItemCount } from "../../utils/cartHelpers";
import { DEFAULT_STORE_LOGO } from "../../utils/storeBrand";

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
  const dispatch = useAppDispatch();
  const cartBadgeCount = getCartItemCount(context.cartData);

  const getUserRole = () => {
    if (context?.user?.role) return context.user.role;
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored)?.role : null;
    } catch {
      return null;
    }
  };
  const isAdmin = getUserRole() === "admin";

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
    dispatch(clearAuth());
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
    if (isOpenNav) {
      closeNav();
      return;
    }
    setIsOpenNav(true);
    context.setIsOpenNav(true);
    context.setIsBottomShow(false);
  };

  const closeNav = () => {
    setIsOpenNav(false);
    context.setIsOpenNav(false);
    context.setIsBottomShow(true);
  };

  useEffect(() => {
    if (!isOpenNav || context.windowWidth >= 992) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("mobile-nav-open");

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove("mobile-nav-open");
      window.scrollTo(0, scrollY);
    };
  }, [isOpenNav, context.windowWidth]);

  const openSearch = () => {
    setIsOpenSearch(true);
  };

  const closeSearch = () => {
    setIsOpenSearch(false);
  };

  useEffect(() => {
    if (!isOpenSearch) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("search-panel-open");

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.classList.remove("search-panel-open");
      window.scrollTo(0, scrollY);
    };
  }, [isOpenSearch]);

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
            <motion.aside
              className="global-search-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Search panel"
            >
              <SearchBox closeSearch={closeSearch} />
            </motion.aside>
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
                    style={{ display: context.windowWidth < 992 ? "none" : "inline-flex" }}
                  >
                    <IoIosSearch />
                  </Button>

                  {context.windowWidth < 992 && (
                    <Button className="circle toggleNav" onClick={openNav} aria-label={isOpenNav ? "Close menu" : "Open menu"}>
                      {isOpenNav ? <IoMdClose /> : <IoMdMenu />}
                    </Button>
                  )}

                </div>

                {/* Center section: logo only - true center because left/right have equal flex */}
                <div className="header-nav-center d-flex align-items-center justify-content-center">
                    <Link to={"/"} className="logo logo-blur-bg">
                      <motion.img
                        src={context.storeLogo || DEFAULT_STORE_LOGO}
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
                    {context.windowWidth < 992 && (
                      <div className="header-mobile-actions d-flex align-items-center">
                        <Button className="searchTrigger mobile-search-trigger" onClick={openSearch}>
                          <IoIosSearch />
                        </Button>

                        <div className="position-relative cartTab ml-2">
                          <Button
                            type="button"
                            className="circle ml-auto"
                            onClick={() => context.setCartDrawerOpen?.(true)}
                            aria-label="Open cart"
                          >
                            <IoBagOutline />
                          </Button>
                          <span className="count d-flex align-items-center justify-content-center">
                            {cartBadgeCount}
                          </span>
                        </div>
                      </div>
                    )}

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
                          {isAdmin && (
                            <Link to="/dashboard">
                              <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                  <IoGridOutline />
                                </ListItemIcon>
                                Dashboard
                              </MenuItem>
                            </Link>
                          )}
                          <MenuItem onClick={logout}>
                            <ListItemIcon>
                              <IoLogOutOutline />
                            </ListItemIcon>
                            Logout
                          </MenuItem>
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
                        <Button
                          type="button"
                          className="circle"
                          onClick={() => context.setCartDrawerOpen?.(true)}
                          aria-label="Open cart"
                        >
                          <IoBagOutline />
                        </Button>
                        <span className="count d-flex align-items-center justify-content-center">
                          {cartBadgeCount}
                        </span>
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

          <SecondaryCategoryNav
            navData={context.categoryData || []}
            isOpenNav={isOpenNav}
            closeNav={closeNav}
          />
        </div>

      </motion.div>
    </>
  );
};

export default Header;
