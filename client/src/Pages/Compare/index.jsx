import React from 'react';
import { Link } from "react-router-dom";
import Rating from '@mui/material/Rating';
import { IoIosClose } from "react-icons/io";
import Button from '@mui/material/Button';

import compare from '../../assets/images/compare.png';
import { MyContext } from "../../App";
import { useContext, useEffect, useState } from "react";
import { deleteData, fetchDataFromApi } from "../../utils/api";
import { FaHome } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaCodeCompare } from "react-icons/fa6";
import Checkbox from '@mui/material/Checkbox';

const Compare = () => {
    
   
        const [selectedProducts, setSelectedProducts] = useState([]);
        const [comparisonResult, setComparisonResult] = useState(null);
        const [myCompareListData, setmyCompareListData] = useState([]);
        const [isLoading, setIsLoading] = useState(false);
        const context = useContext(MyContext);
        const [isLogin,setIsLogin]  = useState(false);
    
        const history = useNavigate();
    
        useEffect(() => {
            window.scrollTo(0,0)
            
            const token = localStorage.getItem("token");
            if(token!=="" && token!==undefined  && token!==null){
              setIsLogin(true);
            }
            else{
              history("/signIn");
            }
    
            
            const user = JSON.parse(localStorage.getItem("user"));
            fetchDataFromApi(`/api/compare-list?userId=${user?.userId}`).then((res) => {
                setmyCompareListData(res);
            })
    
            
        context.setEnableFilterTab(false);
        }, []);

        const handleSelectProduct = (product) => {
        let updatedSelection = [...selectedProducts];
        if (updatedSelection.some(p => p._id === product._id)) {
            updatedSelection = updatedSelection.filter(p => p._id !== product._id);
        } else if (updatedSelection.length < 2) {
            updatedSelection.push(product);
        }
        setSelectedProducts(updatedSelection);
    };
    
    
        const removeItem = (id) => {
            setIsLoading(true);
            deleteData(`/api/compare-list/${id}`).then((res) => {
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: "item removed from Compare List!"
                })
    
                const user = JSON.parse(localStorage.getItem("user"));
                fetchDataFromApi(`/api/compare-list?userId=${user?.userId}`).then((res) => {
                    setmyCompareListData(res);
                    setIsLoading(false);
                })
    
            })
        }

        const compareProducts = async () => {
    if (selectedProducts.length !== 2) {
        alert("Please select exactly two products to compare.");
        return;
    }
    if (selectedProducts[0].subcategory !== selectedProducts[1].subcategory) {
        alert("Cannot compare products from different subcategories.");
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch("/api/compare-products", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product1Id: selectedProducts[0]._id,
                product2Id: selectedProducts[1]._id
            })
        });

        const text = await response.text();  // Log raw response
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                setComparisonResult(data);
            } else {
                alert(data.message || "Error comparing products.");
            }
        } catch (error) {
            console.error("JSON Parse Error: ", text);
            alert("Unexpected server response. Check backend logs.");
        }
    } catch (error) {
        console.error("Comparison API Error:", error);
    }
    setIsLoading(false);
};


    
  return (
   <>

            <section className="section cartPage">
                <div className="container">

                    <div className="myListTableWrapper">
                        <h2 className="hd mb-1">Compare List</h2>
                        <p>There are <b className="text-red">{myCompareListData?.length}</b> products in your Compare List</p>
                        {
                            myCompareListData?.length !== 0 ?

                                <div className="row">
                                    <div className="col-md-12 pr-5">

                                        <div className="table-responsive myListTable">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th width="50%">Product</th>
                                                        <th width="15%">Unit Price</th>
                                                        <th width="10%">Remove</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        myCompareListData?.length !== 0 && myCompareListData?.map((item, index) => {
                                                            return (
                                                                <tr>
                                                                    <td width="50%"><Checkbox checked={selectedProducts.some(p => p._id === item._id)}
                                                                    onChange={() => handleSelectProduct(item)} />
                                                                        <Link to={`/product/${item?.productId}`}>
                                                                            <div className="d-flex align-items-center cartItemimgWrapper">
                                                                                <div className="imgWrapper">
                                                                                    <img src={item?.image}
                                                                                        className="w-100" alt={item?.productTitle} />
                                                                                </div>

                                                                                <div className="info px-3">
                                                                                    <h6>
                                                                                        {item?.productTitle}

                                                                                    </h6>
                                                                                    <Rating name="read-only" value={item?.rating} readOnly size="small" />
                                                                                </div>

                                                                            </div>
                                                                        </Link>
                                                                    </td>
                                                                    <td width="15%">Rs {item?.price}</td>


                                                                    <td width="10%"><span className="remove" onClick={() => removeItem(item?._id)}><IoIosClose /></span></td>
                                                                </tr>
                                                            )
                                                        })
                                                    }


                                                </tbody>
                                            </table>

                                            <div>
                                                <h2 className="hd mb-1">Important Note</h2>
                                                <p>You can only compare <b className="text-red">two products</b> from the <b className="text-red">same category</b> at a time. Products from <b className="text-red">different categories cannot be compared</b>. 🚀</p>
                                                    <br/>
                                                <Button className="btn-blue btn-lg btn-big btn-round bg-red" onClick={compareProducts}>
                                                 <FaCodeCompare/>&nbsp;&nbsp;&nbsp;Compare
                                                </Button> <br/><br/>

                                            {comparisonResult && (
                                                <table className="table mt-3">
                                                    <thead>
                                                        <tr>
                                                            <th>{selectedProducts[0].productTitle}</th>
                                                            <th>{selectedProducts[1].productTitle}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(comparisonResult).map((key) => (
                                                            <tr key={key}>
                                                                <td>{comparisonResult.product1} </td>
                                                                <td>{comparisonResult.product2}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <h6>{comparisonResult.comparison}</h6>
                                                </table>
                                            )}
                                                
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                :


                                <div className="empty d-flex align-items-center justify-content-center flex-column">
                                    <img src={compare} width="150" />
                                    <h3>Compare List is currently empty</h3>
                                    <br />
                                    <Link to="/"> <Button className='btn-blue bg-red btn-lg btn-big btn-round'><FaHome /> &nbsp; Continue Shopping</Button></Link>
                                </div>


                        }


                    </div>

                </div>
            </section>

            {isLoading === true && <div className="loadingOverlay"></div>}


        </>
  );
}

export default Compare;
