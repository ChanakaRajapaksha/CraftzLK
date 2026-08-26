import Sidebar from "../../Components/Sidebar";
import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";
import { useSearchParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { MyContext } from "../../App";

const SearchPage = () => {
    const [productView, setProductView] = useState('four');
    const [productData, setProductData] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [searchParams] = useSearchParams();

    const context = useContext(MyContext);
    const query = searchParams.get("q")?.trim() || "";

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setEnableFilterTab(false);

        if (!query) {
            setProductData(context.searchData || []);
            return;
        }

        setisLoading(true);
        fetchDataFromApi(`/api/search?q=${encodeURIComponent(query)}`)
            .then((res) => {
                const products = Array.isArray(res) ? res : res?.products || [];
                setProductData(products);
                context.setSearchData(products);
            })
            .catch(() => {
                setProductData([]);
            })
            .finally(() => setisLoading(false));
    }, [query]);

    const filterData = (subCatId) => {
        setisLoading(true);

        fetchDataFromApi(`/api/products?subCatId=${subCatId}`).then((res) => {
            setProductData(res.products);
            setisLoading(false);
        })
    }

    const filterByPrice = (price, subCatId) => {
        setisLoading(true);

        fetchDataFromApi(`/api/products?minPrice=${price[0]}&maxPrice=${price[1]}&subCatId=${subCatId}`).then((res) => {
            setProductData(res.products)
            setisLoading(false);
        })
    }

    const filterByRating = (rating, subCatId) => {
        setisLoading(true);
        fetchDataFromApi(`/api/products?rating=${rating}&subCatId=${subCatId}`).then((res) => {
            setProductData(res.products)
            setisLoading(false);
        })
    }

    return (
        <>
            <section className="product_Listing_Page">
                <div className="container">
                    {query && (
                        <div className="search-page__heading mb-3">
                            <h2 className="mb-0">Search results for &ldquo;{query}&rdquo;</h2>
                            {!isLoading && (
                                <p className="mb-0 mt-1 text-muted">
                                    {productData?.length || 0} product{(productData?.length || 0) === 1 ? "" : "s"} found
                                </p>
                            )}
                        </div>
                    )}

                    <div className="productListing d-flex">
                        <Sidebar filterData={filterData} filterByPrice={filterByPrice} filterByRating={filterByRating}  isOpenFilter={isOpenFilter} />

                        <div className="content_right">

                            <div className="showBy mt-0 mb-3 d-flex align-items-center">
                                <div className="d-flex align-items-center btnWrapper">
                                    <Button className={productView === 'one' && 'act'} onClick={() => setProductView('one')}><IoIosMenu />
                                    </Button>

                                    <Button className={productView === 'three' && 'act'} onClick={() => setProductView('three')}>
                                        <CgMenuGridR /></Button>
                                    <Button className={productView === 'four' && 'act'} onClick={() => setProductView('four')}><TfiLayoutGrid4Alt /></Button>
                                </div>

                            </div>


                            <div className="productListing">
                                {
                                    isLoading === true ?
                                        <div className="loading d-flex align-items-center justify-content-center">
                                            <CircularProgress color="inherit" />
                                        </div>
                                        :

                                        <>
                                            {
                                                productData?.length !== 0 ? productData?.map((item, index) => {
                                                    return (
                                                        <ProductItem key={index} itemView={productView} item={item} />
                                                    )
                                                }) : (
                                                    <p className="search-page__empty">
                                                        {query
                                                            ? `No products found for "${query}".`
                                                            : "Enter a search term to find products."}
                                                    </p>
                                                )
                                            }
                                        </>

                                }



                            </div>




                        </div>
                    </div>
                </div>
            </section>




        </>
    )
}

export default SearchPage;
