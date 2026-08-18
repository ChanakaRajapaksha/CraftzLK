import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./responsive.css";
import "./ChatBox.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomeGate from "./Pages/Home/HomeGate.jsx";
import Collections from "./Pages/Collections/index.jsx";
import CategoryBrowseRedirect from "./Pages/CategoryBrowseRedirect/index.jsx";
import ProductDetailsRouter from "./Pages/ProductDetailsRouter.jsx";
import Header from "./Components/Header/index.jsx";
import HomePageFooter from "./Components/HomePageFooter";
import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import ProductModal from "./Components/ProductModal/index.jsx";
import Cart from "./Pages/Cart/index.jsx";
import SignIn from "./Pages/SignIn/index.jsx";
import SignUp from "./Pages/SignUp/index.jsx";
import MyList from "./Pages/MyList/index.jsx";
import Checkout from "./Pages/Checkout/index.jsx";
import ThankYou from "./Pages/ThankYou/index.jsx";
import Orders from "./Pages/Orders/index.jsx";
import Gifts from "./Pages/Gifts/index.jsx";
import Eco from "./Pages/Eco/index.jsx";
import About from "./Pages/About/index.jsx";
import MyAccount from "./Pages/MyAccount/index.jsx";
import SearchPage from "./Pages/Search/index.jsx";
import VerifyOTP from "./Pages/VerifyOTP/index.jsx";
import ChangePassword from "./Pages/ChangePassword/index.jsx";
import ForgotPassword from "./Pages/ForgotPassword/index.jsx";
import ResetPassword from "./Pages/ResetPassword/index.jsx";
import { deleteData, editData, fetchDataFromApi, postData } from "./utils/api";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { clearAuth, initializeAuth, revalidateAuth, selectIsLoggedIn, setAuthUser } from "./store/slices/authSlice";
import { setSessionExpiredHandler } from "./utils/sessionEvents";
import HandcraftAlert from "./Components/HandcraftAlert";
import CartDrawer from "./Components/CartDrawer";
import { getSampleProductById } from "./data/sampleProductDetails";
import {
  addToLocalCart,
  buildCartPayloadFromSample,
  cartLineKey,
  clearGuestCartStorage,
  isSampleProductId,
  readGuestCart,
  removeFromLocalCart,
  updateLocalCartQty,
  writeGuestCart,
} from "./utils/cartHelpers";
import Compare from "./Pages/Compare/index.jsx";
import { Toaster } from "sonner";
import AdminGuard from "./Components/AdminDashboard/AdminGuard";
import AuthGuard from "./Components/AuthGuard";
import AdminLayout from "./Components/AdminDashboard/AdminLayout";
import AdminDashboardHome from "./Pages/AdminDashboard/Dashboard/index.jsx";
import CategoryList from "./Pages/AdminDashboard/Categories/CategoryList";
import AddCategory from "./Pages/AdminDashboard/Categories/AddCategory";
import EditCategory from "./Pages/AdminDashboard/Categories/EditCategory";
import SubCategoryList from "./Pages/AdminDashboard/Categories/SubCategoryList";
import AddSubCategory from "./Pages/AdminDashboard/Categories/AddSubCategory";
import EditSubCategory from "./Pages/AdminDashboard/Categories/EditSubCategory";
import ArtisanList from "./Pages/AdminDashboard/Artisans/ArtisanList";
import AddArtisan from "./Pages/AdminDashboard/Artisans/AddArtisan";
import EditArtisan from "./Pages/AdminDashboard/Artisans/EditArtisan";
import ProductList from "./Pages/AdminDashboard/Products/ProductList";
import ProductUpload from "./Pages/AdminDashboard/Products/ProductUpload";
import ProductDetails from "./Pages/AdminDashboard/Products/ProductDetails";
import ProductEdit from "./Pages/AdminDashboard/Products/ProductEdit";
import AddProductRAMS from "./Pages/AdminDashboard/Products/AddProductRAMS";
import AddProductWeight from "./Pages/AdminDashboard/Products/AddProductWeight";
import AddProductSize from "./Pages/AdminDashboard/Products/AddProductSize";
import HomeMainBannerList from "./Pages/AdminDashboard/Banners/HomeMainBannerList";
import HomeMainBannerForm from "./Pages/AdminDashboard/Banners/HomeMainBannerForm";
import BannersList from "./Pages/AdminDashboard/Banners/BannersList";
import SlideBannerForm from "./Pages/AdminDashboard/Banners/SlideBannerForm";
import HomeSideBannersList from "./Pages/AdminDashboard/Banners/HomeSideBannersList";
import SideBannerForm from "./Pages/AdminDashboard/Banners/SideBannerForm";
import HomeBottomBannersList from "./Pages/AdminDashboard/Banners/HomeBottomBannersList";
import BottomBannerForm from "./Pages/AdminDashboard/Banners/BottomBannerForm";
import AdminOrders from "./Pages/AdminDashboard/Orders/index.jsx";
import OrderDetails from "./Pages/AdminDashboard/Orders/OrderDetails.jsx";
import CustomerList from "./Pages/AdminDashboard/Customers/CustomerList";
import CustomerDetails from "./Pages/AdminDashboard/Customers/CustomerDetails";
import CouponList from "./Pages/AdminDashboard/Promotions/CouponList";
import AddCoupon from "./Pages/AdminDashboard/Promotions/AddCoupon";
import EditCoupon from "./Pages/AdminDashboard/Promotions/EditCoupon";
import DiscountList from "./Pages/AdminDashboard/Promotions/DiscountList";
import AddDiscount from "./Pages/AdminDashboard/Promotions/AddDiscount";
import EditDiscount from "./Pages/AdminDashboard/Promotions/EditDiscount";
import PromoBannerList from "./Pages/AdminDashboard/Promotions/PromoBannerList";
import AddPromoBanner from "./Pages/AdminDashboard/Promotions/AddPromoBanner";
import EditPromoBanner from "./Pages/AdminDashboard/Promotions/EditPromoBanner";
import HomepageSectionsList from "./Pages/AdminDashboard/HomepageContent/HomepageSectionsList";
import FeaturedProductsSection from "./Pages/AdminDashboard/HomepageContent/FeaturedProductsSection";
import TrendingProductsSection from "./Pages/AdminDashboard/HomepageContent/TrendingProductsSection";
import NewArrivalsSection from "./Pages/AdminDashboard/HomepageContent/NewArrivalsSection";
import BestSellersSection from "./Pages/AdminDashboard/HomepageContent/BestSellersSection";
import PopularCategoriesSection from "./Pages/AdminDashboard/HomepageContent/PopularCategoriesSection";
import ReviewList from "./Pages/AdminDashboard/Reviews/ReviewList";
import QuestionList from "./Pages/AdminDashboard/Questions/QuestionList";
import StockList from "./Pages/AdminDashboard/Inventory/StockList";
import StockAdjustment from "./Pages/AdminDashboard/Inventory/StockAdjustment";
import ShippingMethodList from "./Pages/AdminDashboard/Shipping/ShippingMethodList";
import AddShippingMethod from "./Pages/AdminDashboard/Shipping/AddShippingMethod";
import EditShippingMethod from "./Pages/AdminDashboard/Shipping/EditShippingMethod";
import PaymentMethodList from "./Pages/AdminDashboard/Payments/PaymentMethodList";
import EditPaymentMethod from "./Pages/AdminDashboard/Payments/EditPaymentMethod";
import TransactionList from "./Pages/AdminDashboard/Payments/TransactionList";
import SalesReports from "./Pages/AdminDashboard/Reports/SalesReports";
import ProductReports from "./Pages/AdminDashboard/Reports/ProductReports";
import CustomerReports from "./Pages/AdminDashboard/Reports/CustomerReports";
import CmsPageList from "./Pages/AdminDashboard/Cms/CmsPageList";
import AddCmsPage from "./Pages/AdminDashboard/Cms/AddCmsPage";
import EditCmsPage from "./Pages/AdminDashboard/Cms/EditCmsPage";
import NotificationSettingsPage from "./Pages/AdminDashboard/Notifications/NotificationSettingsPage";
import NotificationTemplateList from "./Pages/AdminDashboard/Notifications/NotificationTemplateList";
import EditNotificationTemplate from "./Pages/AdminDashboard/Notifications/EditNotificationTemplate";
import GeneralSettings from "./Pages/AdminDashboard/Settings/GeneralSettings";
import { DEFAULT_STORE_LOGO, applyDocumentFavicon, applyStoreBrandFromSettings } from "./utils/storeBrand";

// Default context value so consumers never get undefined (e.g. before Provider mounts or in edge cases)
const defaultContextValue = {
  setisHeaderFooterShow: () => {},
  setEnableFilterTab: () => {},
  setUser: () => {},
  setIsLogin: () => {},
  storeLogo: DEFAULT_STORE_LOGO,
  setStoreLogo: () => {},
  storeFavicon: "",
  setStoreFavicon: () => {},
};
const MyContext = createContext(defaultContextValue);

// Routes that should NOT show header/footer (admin dashboard uses its own layout)
const noHeaderFooterRoutes = ['/signIn', '/signUp', '/verifyOTP', '/changePassword', '/forgot-password', '/reset-password'];
const isAdminRoute = (pathname) => pathname.startsWith('/dashboard');

const OBSOLETE_STORAGE_KEYS = ["craftzlk_local_cart", "craftzlk_local_orders"];

function AppContent() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthInitialized, isAuthenticated } = useAppSelector((state) => state.auth);
  const isLogin = useAppSelector(selectIsLoggedIn);

  // Calculate initial header/footer visibility based on current route
  const shouldHideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState("");
  const [isOpenProductModal, setisOpenProductModal] = useState(false);
  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(!shouldHideHeaderFooter);
  const setIsLogin = (value) => {
    if (value === true) return;
    dispatch(clearAuth());
  };
  const setUser = (userData) => {
    if (userData) dispatch(setAuthUser(userData));
  };
  const [productData, setProductData] = useState([]);

  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setsubCategoryData] = useState([]);

  const refreshCategoryData = useCallback(() => {
    return fetchDataFromApi("/api/category/active")
      .then((res) => {
        const list = res?.categoryList || [];
        setCategoryData(list);

        const subCatArr = [];
        list.forEach((cat) => {
          if (cat?.children?.length) {
            cat.children.forEach((subCat) => subCatArr.push(subCat));
          }
        });
        setsubCategoryData(subCatArr);
        return list;
      })
      .catch(() => {
        setCategoryData([]);
        setsubCategoryData([]);
        return [];
      });
  }, []);
  const [addingInCart, setAddingInCart] = useState(false);
  const [addingCartProductId, setAddingCartProductId] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [cartData, setCartData] = useState([]);
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
  const [storeLogo, setStoreLogo] = useState(DEFAULT_STORE_LOGO);
  const [storeFavicon, setStoreFavicon] = useState("");

  useEffect(() => {
    OBSOLETE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    if (!isAuthInitialized) return;

    fetchDataFromApi("/api/settings")
      .then((res) => {
        const brand = applyStoreBrandFromSettings(res?.settings);
        setStoreLogo(brand.storeLogo);
        setStoreFavicon(brand.storeFavicon);
        applyDocumentFavicon(brand.storeFavicon);
      })
      .catch(() => {
        setStoreLogo(DEFAULT_STORE_LOGO);
        setStoreFavicon("");
        applyDocumentFavicon("");
      });
  }, [isAuthInitialized]);

  useEffect(() => {
    applyDocumentFavicon(storeFavicon);
  }, [storeFavicon]);

  useEffect(() => {
    dispatch(initializeAuth());
    setSessionExpiredHandler(() => dispatch(clearAuth()));

    const revalidate = () => dispatch(revalidateAuth());

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        revalidate();
      }
    };

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dispatch]);

  // Update header/footer visibility based on current route (hide on auth pages and admin dashboard)
  useEffect(() => {
    const shouldHide = noHeaderFooterRoutes.includes(location.pathname) || isAdminRoute(location.pathname);
    setisHeaderFooterShow(!shouldHide);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthInitialized) return;

    refreshCategoryData();
  }, [isAuthInitialized, refreshCategoryData]);

  useEffect(() => {
    if (!isAuthInitialized) return;

    if (!isAuthenticated) {
      setCartData(readGuestCart());
      return;
    }

    getCartData();
  }, [isLogin, isAuthInitialized, isAuthenticated]);

  useEffect(() => {
    if (!isAuthInitialized || !isAuthenticated) return;

    getCountry("https://countriesnow.space/api/v0.1/countries/");

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
  }, [isAuthInitialized, isAuthenticated, refreshCategoryData]);

  const getCartData = () => {
    if (!isLogin) return;

    fetchDataFromApi("/api/cart")
      .then((res) => {
        const apiItems = Array.isArray(res) ? res : [];
        setCartData((prev) => {
          const sampleItems = (Array.isArray(prev) ? prev : []).filter((item) =>
            isSampleProductId(item.productId)
          );
          return [
            ...apiItems,
            ...sampleItems.filter(
              (local) => !apiItems.some((api) => cartLineKey(api) === cartLineKey(local))
            ),
          ];
        });
      })
      .catch(() => {});
  };

  const syncSampleCartInState = (allItems) => {
    const items = Array.isArray(allItems) ? allItems : [];
    if (!isLogin) {
      setCartData(items);
      writeGuestCart(items);
      return;
    }

    const sampleOnly = items.filter((item) => isSampleProductId(item.productId));
    setCartData((prev) => {
      const apiItems = (Array.isArray(prev) ? prev : []).filter(
        (item) => !isSampleProductId(item.productId)
      );
      return [...apiItems, ...sampleOnly];
    });
  };

  const addHomeProductToCart = (productId) => {
    const product = getSampleProductById(productId);
    if (!product) return;
    const payload = buildCartPayloadFromSample(product, 1);
    addToCart(payload, { openDrawer: true, localOnly: true });
  };

  const updateCartItemQty = (itemId, quantity) => {
    const items = Array.isArray(cartData) ? cartData : [];
    const item = items.find((i) => i.id === itemId || i._id === itemId);
    if (!item) return;

    if (isSampleProductId(item.productId) || String(itemId).startsWith("local-")) {
      const next = updateLocalCartQty(items, itemId, quantity);
      syncSampleCartInState(next);
      return;
    }

    if (isLogin) {
      const qty = Math.max(1, quantity);
      editData(`/api/cart/${item._id || item.id}`, {
        productTitle: item.productTitle,
        image: item.image,
        rating: item.rating,
        price: item.price,
        quantity: qty,
        subTotal: parseInt(item.price, 10) * qty,
        productId: item.productId,
        variantLabel: item.variantLabel || "",
        variantSku: item.variantSku || "",
        countInStock: item.countInStock,
        userId: user?.userId,
      }).then(() => getCartData());
    }
  };

  const removeCartItem = (itemId) => {
    const items = Array.isArray(cartData) ? cartData : [];
    const item = items.find((i) => i.id === itemId || i._id === itemId);
    if (!item) return;

    if (isSampleProductId(item.productId) || String(itemId).startsWith("local-")) {
      const next = removeFromLocalCart(items, itemId);
      syncSampleCartInState(next);
      return;
    }

    if (isLogin) {
      deleteData(`/api/cart/${item._id || item.id}`).then(() => getCartData());
    }
  };

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

  const addToCart = (data, options = {}) => {
    const { openDrawer = false, localOnly = false } = options;
    const productId = data?.productId;
    setAddingInCart(true);
    setAddingCartProductId(productId ?? null);

    const finish = () => {
      setAddingInCart(false);
      setAddingCartProductId(null);
    };

    const applyLocal = () => {
      const current = Array.isArray(cartData) ? cartData : [];
      const next = addToLocalCart(current, data);
      syncSampleCartInState(next);
      if (openDrawer) setCartDrawerOpen(true);
      setAlertBox({
        open: true,
        error: false,
        msg: "Added to cart",
      });
      setTimeout(finish, 450);
    };

    if (localOnly || isSampleProductId(productId)) {
      applyLocal();
      return;
    }

    if (!isLogin) {
      applyLocal();
      return;
    }

    const payload = {
      ...data,
      userId: user?.userId || data.userId,
    };

    postData("/api/cart/add", payload)
      .then((res) => {
        if (res?.success === false || res?.status === false) {
          setAlertBox({
            open: true,
            error: true,
            msg: res?.msg || res?.message || "Failed to add item to cart.",
          });
          getCartData();
          return;
        }

        if (openDrawer) setCartDrawerOpen(true);
        setAlertBox({
          open: true,
          error: false,
          msg: res?.message || "Added to cart",
        });
        getCartData();
      })
      .catch((error) => {
        setAlertBox({
          open: true,
          error: true,
          msg: error?.response?.data?.msg || error?.response?.data?.message || "Failed to add item to cart.",
        });
      })
      .finally(finish);
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
    refreshCategoryData,
    openProductDetailsModal,
    alertBox,
    setAlertBox,
    addToCart,
    addHomeProductToCart,
    addingInCart,
    setAddingInCart,
    addingCartProductId,
    cartData,
    setCartData,
    getCartData,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartItemQty,
    removeCartItem,
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
    storeLogo,
    setStoreLogo,
    storeFavicon,
    setStoreFavicon,
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
        <Route path="/" exact={true} element={<HomeGate />} />
        <Route path="/collections" element={<Navigate to="/collections/all" replace />} />
        <Route path="/collections/all" exact={true} element={<Collections />} />
        <Route path="/collections/:categorySlug/:subcategorySlug" element={<Collections />} />
        <Route path="/collections/:categorySlug" element={<Collections />} />
        <Route
          path="/products/category/:id"
          exact={true}
          element={<CategoryBrowseRedirect />}
        />
        <Route
          path="/products/subCat/:id"
          exact={true}
          element={<CategoryBrowseRedirect />}
        />
        <Route
          exact={true}
          path="/product/:id"
          element={<ProductDetailsRouter />}
        />
        <Route exact={true} path="/cart" element={<Cart />} />
        <Route exact={true} path="/signIn" element={<SignIn />} />
        <Route exact={true} path="/signUp" element={<SignUp />} />
        <Route exact={true} path="/forgot-password" element={<ForgotPassword />} />
        <Route exact={true} path="/reset-password" element={<ResetPassword />} />
        <Route
          exact={true}
          path="/my-list"
          element={
            <AuthGuard>
              <MyList />
            </AuthGuard>
          }
        />
        <Route exact={true} path="/compare" element={<Compare />} />
        <Route exact={true} path="/checkout" element={<Checkout />} />
        <Route exact={true} path="/thank-you" element={<ThankYou />} />
        <Route
          exact={true}
          path="/orders"
          element={
            <AuthGuard>
              <Orders />
            </AuthGuard>
          }
        />
        <Route exact={true} path="/gifts" element={<Gifts />} />
        <Route exact={true} path="/eco" element={<Eco />} />
        <Route exact={true} path="/about" element={<About />} />
        <Route
          exact={true}
          path="/my-account"
          element={
            <AuthGuard>
              <MyAccount />
            </AuthGuard>
          }
        />
        <Route exact={true} path="/search" element={<SearchPage />} />
        <Route exact={true} path="/verifyOTP" element={<VerifyOTP />} />
        <Route exact={true} path="/changePassword" element={<AuthGuard><ChangePassword /></AuthGuard>} />

        {/* Admin dashboard (admin role only) */}
        <Route path="/dashboard" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="category" element={<CategoryList />} />
          <Route path="category/add" element={<AddCategory />} />
          <Route path="category/edit/:id" element={<EditCategory />} />
          <Route path="artisans" element={<ArtisanList />} />
          <Route path="artisans/add" element={<AddArtisan />} />
          <Route path="artisans/edit/:id" element={<EditArtisan />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="promotions/coupons" element={<CouponList />} />
          <Route path="promotions/coupons/add" element={<AddCoupon />} />
          <Route path="promotions/coupons/edit/:id" element={<EditCoupon />} />
          <Route path="promotions/discounts" element={<DiscountList />} />
          <Route path="promotions/discounts/add" element={<AddDiscount />} />
          <Route path="promotions/discounts/edit/:id" element={<EditDiscount />} />
          <Route path="promotions/banners" element={<PromoBannerList />} />
          <Route path="promotions/banners/add" element={<AddPromoBanner />} />
          <Route path="promotions/banners/edit/:id" element={<EditPromoBanner />} />
          <Route path="homepage" element={<HomepageSectionsList />} />
          <Route path="homepage/featured" element={<FeaturedProductsSection />} />
          <Route path="homepage/trending" element={<TrendingProductsSection />} />
          <Route path="homepage/new-arrivals" element={<NewArrivalsSection />} />
          <Route path="homepage/best-sellers" element={<BestSellersSection />} />
          <Route path="homepage/popular-categories" element={<PopularCategoriesSection />} />
          <Route path="reviews" element={<ReviewList />} />
          <Route path="questions" element={<QuestionList />} />
          <Route path="inventory/stock" element={<StockList />} />
          <Route path="inventory/adjust" element={<StockAdjustment />} />
          <Route path="shipping/methods" element={<ShippingMethodList />} />
          <Route path="shipping/methods/add" element={<AddShippingMethod />} />
          <Route path="shipping/methods/edit/:id" element={<EditShippingMethod />} />
          <Route path="payments/methods" element={<PaymentMethodList />} />
          <Route path="payments/methods/edit/:id" element={<EditPaymentMethod />} />
          <Route path="payments/transactions" element={<TransactionList />} />
          <Route path="reports/sales" element={<SalesReports />} />
          <Route path="reports/products" element={<ProductReports />} />
          <Route path="reports/customers" element={<CustomerReports />} />
          <Route path="cms/pages" element={<CmsPageList />} />
          <Route path="cms/pages/add" element={<AddCmsPage />} />
          <Route path="cms/pages/edit/:id" element={<EditCmsPage />} />
          <Route path="notifications" element={<NotificationSettingsPage />} />
          <Route path="notifications/templates" element={<NotificationTemplateList />} />
          <Route path="notifications/templates/edit/:id" element={<EditNotificationTemplate />} />
          <Route path="settings" element={<GeneralSettings />} />
          <Route path="subCategory" element={<SubCategoryList />} />
          <Route path="subCategory/add" element={<AddSubCategory />} />
          <Route path="subCategory/edit/:id" element={<EditSubCategory />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/upload" element={<ProductUpload />} />
          <Route path="product/details/:id" element={<ProductDetails />} />
          <Route path="product/edit/:id" element={<ProductEdit />} />
          <Route path="productRAMS/add" element={<AddProductRAMS />} />
          <Route path="productWEIGHT/add" element={<AddProductWeight />} />
          <Route path="productSIZE/add" element={<AddProductSize />} />
          <Route path="homeBannerSlide/list" element={<HomeMainBannerList />} />
          <Route path="homeBannerSlide/add" element={<HomeMainBannerForm />} />
          <Route path="homeBannerSlide/edit/:id" element={<HomeMainBannerForm />} />
          <Route path="banners" element={<BannersList />} />
          <Route path="banners/add" element={<SlideBannerForm />} />
          <Route path="banners/edit/:id" element={<SlideBannerForm />} />
          <Route path="homeSideBanners" element={<HomeSideBannersList />} />
          <Route path="homeSideBanners/add" element={<SideBannerForm />} />
          <Route path="homeSideBanners/edit/:id" element={<SideBannerForm />} />
          <Route path="homeBottomBanners" element={<HomeBottomBannersList />} />
          <Route path="homeBottomBanners/add" element={<BottomBannerForm />} />
          <Route path="homeBottomBanners/edit/:id" element={<BottomBannerForm />} />
        </Route>
      </Routes>

      {isHeaderFooterShow === true && <HomePageFooter />}

      {isOpenProductModal === true && <ProductModal data={productData} />}

      <CartDrawer />
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
