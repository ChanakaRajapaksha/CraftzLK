import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./responsive.css";
import "./ChatBox.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home/index.jsx";
import Listing from "./Pages/Listing/index.jsx";
import ProductDetails from "./Pages/ProductDetails/index.jsx";
import Header from "./Components/Header/index.jsx";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Footer from "./Components/Footer/index.jsx";
import ProductModal from "./Components/ProductModal/index.jsx";
import Cart from "./Pages/Cart/index.jsx";
import SignIn from "./Pages/SignIn/index.jsx";
import SignUp from "./Pages/SignUp/index.jsx";
import MyList from "./Pages/MyList/index.jsx";
import Checkout from "./Pages/Checkout/index.jsx";
import Orders from "./Pages/Orders/index.jsx";
import MyAccount from "./Pages/MyAccount/index.jsx";
import SearchPage from "./Pages/Search/index.jsx";
import VerifyOTP from "./Pages/VerifyOTP/index.jsx";
import ChangePassword from "./Pages/ChangePassword/index.jsx";
import ForgotPassword from "./Pages/ForgotPassword/index.jsx";
import ResetPassword from "./Pages/ResetPassword/index.jsx";
import { fetchDataFromApi, postData, restoreSession } from "./utils/api";
import HandcraftAlert from "./Components/HandcraftAlert";
import Compare from "./Pages/Compare/index.jsx";
import { Toaster } from "sonner";

// Default context value so consumers never get undefined (e.g. before Provider mounts or in edge cases)
const defaultContextValue = {
  setisHeaderFooterShow: () => {},
  setEnableFilterTab: () => {},
  setUser: () => {},
  setIsLogin: () => {},
};
const MyContext = createContext(defaultContextValue);

// Routes that should NOT show header/footer
const noHeaderFooterRoutes = ['/signIn', '/signUp', '/verifyOTP', '/changePassword', '/forgot-password', '/reset-password'];

function AppContent() {
  const location = useLocation();
  
  // Calculate initial header/footer visibility based on current route
  const shouldHideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState("");
  const [isOpenProductModal, setisOpenProductModal] = useState(false);
  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(!shouldHideHeaderFooter);
  const [isLogin, setIsLogin] = useState(false);
  const [productData, setProductData] = useState([]);

  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setsubCategoryData] = useState([]);
  const [addingInCart, setAddingInCart] = useState(false);

  const [cartData, setCartData] = useState();
  const [searchData, setSearchData] = useState([]);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [enableFilterTab, setEnableFilterTab] = useState(false);
  const [isOpenFilters, setIsOpenFilters] = useState(false);
  const [isBottomShow, setIsBottomShow] = useState(true);

  const [alertBox, setAlertBox] = useState({
    msg: "",
    error: false,
    open: false,
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    userId: "",
    image: null,
  });

  // Update header/footer visibility based on current route
  useEffect(() => {
    const shouldHide = noHeaderFooterRoutes.includes(location.pathname);
    setisHeaderFooterShow(!shouldHide);
  }, [location.pathname]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (
          user?.userId !== "" &&
          user?.userId !== undefined &&
          user?.userId !== null
        ) {
          fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [isLogin]);

  useEffect(() => {
    getCountry("https://countriesnow.space/api/v0.1/countries/");

    fetchDataFromApi("/api/category").then((res) => {
      setCategoryData(res.categoryList);

      const subCatArr = [];

      res.categoryList?.length !== 0 &&
        res.categoryList?.map((cat, index) => {
          if (cat?.children.length !== 0) {
            cat?.children?.map((subCat) => {
              subCatArr.push(subCat);
            });
          }
        });

      setsubCategoryData(subCatArr);
    });

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const location = localStorage.getItem("location");
    if (location !== null && location !== "" && location !== undefined) {
      setselectedCountry(location);
    } else {
      setselectedCountry("All");
      localStorage.setItem("location", "All");
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getCartData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.userId) {
          fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  // Restore session from refresh cookie (access token in memory; refresh token in httpOnly cookie)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const restored = await restoreSession();
      if (cancelled) return;
      if (restored) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && (userData.userId || userData.email)) {
              setUser(userData);
              setIsLogin(true);
            }
          } catch (_) {}
        }
      } else {
        localStorage.removeItem("user");
        setIsLogin(false);
        setUser({ name: "", email: "", userId: "", image: null });
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const openProductDetailsModal = (id, status) => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      setProductData(res);
      setisOpenProductModal(status);
    });
  };

  const getCountry = async (url) => {
    const responsive = await axios.get(url).then((res) => {
      setCountryList(res.data.data);
    });
  };

  const handleClose = () => {
    setAlertBox({
      open: false,
    });
  };

  const addToCart = (data) => {
    if (isLogin === true) {
      setAddingInCart(true);
      postData(`/api/cart/add`, data).then((res) => {
        if (res.status !== false) {
          setAlertBox({
            open: true,
            error: false,
            msg: "Item is added in the cart",
          });

          setTimeout(() => {
            setAddingInCart(false);
          }, 1000);

          getCartData();
        } else {
          setAlertBox({
            open: true,
            error: true,
            msg: res.msg,
          });
          setAddingInCart(false);
        }
      });
    } else {
      setAlertBox({
        open: true,
        error: true,
        msg: "Please login first",
      });
    }
  };

  const values = {
    countryList,
    setselectedCountry,
    selectedCountry,
    isOpenProductModal,
    setisOpenProductModal,
    isHeaderFooterShow,
    setisHeaderFooterShow,
    isLogin,
    setIsLogin,
    user,
    setUser,
    categoryData,
    setCategoryData,
    subCategoryData,
    setsubCategoryData,
    openProductDetailsModal,
    alertBox,
    setAlertBox,
    addToCart,
    addingInCart,
    setAddingInCart,
    cartData,
    setCartData,
    getCartData,
    searchData,
    setSearchData,
    windowWidth,
    isOpenNav,
    setIsOpenNav,
    setEnableFilterTab,
    enableFilterTab,
    setIsOpenFilters,
    isOpenFilters,
    setIsBottomShow,
    isBottomShow,
  };

  return (
    <MyContext.Provider value={values}>
      <Toaster position="top-right" richColors closeButton />
      <HandcraftAlert
        open={alertBox.open}
        onClose={handleClose}
        message={alertBox.msg}
        type={alertBox.error === false ? "success" : "error"}
      />

      {isHeaderFooterShow === true && <Header />}

      <Routes>
        <Route path="/" exact={true} element={<Home />} />
        <Route
          path="/products/category/:id"
          exact={true}
          element={<Listing />}
        />
        <Route
          path="/products/subCat/:id"
          exact={true}
          element={<Listing />}
        />
        <Route
          exact={true}
          path="/product/:id"
          element={<ProductDetails />}
        />
        <Route exact={true} path="/cart" element={<Cart />} />
        <Route exact={true} path="/signIn" element={<SignIn />} />
        <Route exact={true} path="/signUp" element={<SignUp />} />
        <Route exact={true} path="/forgot-password" element={<ForgotPassword />} />
        <Route exact={true} path="/reset-password" element={<ResetPassword />} />
        <Route exact={true} path="/my-list" element={<MyList />} />
        <Route exact={true} path="/compare" element={<Compare />} />
        <Route exact={true} path="/checkout" element={<Checkout />} />
        <Route exact={true} path="/orders" element={<Orders />} />
        <Route exact={true} path="/my-account" element={<MyAccount />} />
        <Route exact={true} path="/search" element={<SearchPage />} />
        <Route exact={true} path="/verifyOTP" element={<VerifyOTP />} />
        <Route exact={true} path="/changePassword" element={<ChangePassword />} />
      </Routes>
      {isHeaderFooterShow === true && <Footer />}

      {isOpenProductModal === true && <ProductModal data={productData} />}
    </MyContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
