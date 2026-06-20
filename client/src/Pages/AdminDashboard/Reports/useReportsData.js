import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../../../utils/api";
import { getDashboardSampleData } from "../Dashboard/dashboardSampleData";
import { normalizeOrder } from "../Orders/orderUtils";

export default function useReportsData() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    Promise.all([
      fetchDataFromApi("/api/orders/").catch(() => null),
      fetchDataFromApi("/api/products").catch(() => null),
      fetchDataFromApi("/api/category").catch(() => null),
      fetchDataFromApi("/api/customers").catch(() => null),
    ])
      .then(([ordersRes, productsRes, categoryRes, customersRes]) => {
        const orderList = Array.isArray(ordersRes)
          ? ordersRes
          : ordersRes?.orderList || [];
        const productList = productsRes?.products || productsRes?.productList || productsRes || [];
        const categoryList =
          categoryRes?.categoryList ||
          categoryRes?.categories ||
          (Array.isArray(categoryRes) ? categoryRes : []);
        const customerList = customersRes?.customerList || customersRes?.customers || [];

        if (orderList.length || (Array.isArray(productList) && productList.length)) {
          setOrders(orderList.map(normalizeOrder).filter(Boolean));
          setProducts(Array.isArray(productList) ? productList : []);
          setCategories(Array.isArray(categoryList) ? categoryList : []);
          setTotalCustomers(
            customerList.length ||
              new Set(orderList.map((order) => order.email).filter(Boolean)).size
          );
          setUsingSampleData(false);
        } else {
          const sample = getDashboardSampleData();
          setOrders(sample.orders.map(normalizeOrder).filter(Boolean));
          setProducts(sample.products);
          setCategories(sample.catData.categoryList);
          setTotalCustomers(sample.totalCustomers);
          setUsingSampleData(true);
        }
      })
      .catch(() => {
        const sample = getDashboardSampleData();
        setOrders(sample.orders.map(normalizeOrder).filter(Boolean));
        setProducts(sample.products);
        setCategories(sample.catData.categoryList);
        setTotalCustomers(sample.totalCustomers);
        setUsingSampleData(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    orders,
    products,
    categories,
    totalCustomers,
    usingSampleData,
    loading,
  };
}
