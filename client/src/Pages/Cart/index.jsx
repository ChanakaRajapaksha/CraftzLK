import { Link } from "react-router-dom";
import Rating from '@mui/material/Rating';
import QuantityBox from "../../Components/QuantityBox";
import { IoIosClose } from "react-icons/io";
import Button from '@mui/material/Button';

import emprtCart from '../../assets/images/emptyCart.png';
import { MyContext } from "../../App";
import { useContext, useEffect, useState } from "react";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import { IoBagCheckOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

    const [cartData, setCartData] = useState([]);
    const [productQuantity, setProductQuantity] = useState();
    let [cartFields, setCartFields] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedQuantity, setselectedQuantity] = useState();
    const [chengeQuantity, setchengeQuantity] = useState(0);
    const [isLogin,setIsLogin]  = useState(false);

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        window.scrollTo(0,0)
        
    context.setEnableFilterTab(false);
        const token = localStorage.getItem("token");
        if(token!=="" && token!==undefined  && token!==null){
          setIsLogin(true);
        }
        else{
          history("/signIn");
        }

        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);
            setselectedQuantity(res?.quantity)
        })
    }, []);

    const quantity = (val) => {
        setProductQuantity(val);
        setchengeQuantity(val)
        context.getCartData();
    }


    const selectedItem = (item, quantityVal) => {
        if (chengeQuantity !== 0) {
            setIsLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            cartFields.productTitle = item?.productTitle
            cartFields.image = item?.image
            cartFields.rating = item?.rating
            cartFields.price = item?.price
            cartFields.quantity = quantityVal
            cartFields.subTotal = parseInt(item?.price * quantityVal)
            cartFields.productId = item?.id
            cartFields.userId = user?.userId

            //console.log(item?._id)

            editData(`/api/cart/${item?._id}`, cartFields).then((res) => {
                setTimeout(() => {
                    setIsLoading(false);
                    const user = JSON.parse(localStorage.getItem("user"));
                    fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
                        setCartData(res);
                    })
                }, 1000)
            })
        }

    }


    const removeItem = (id) => {
        setIsLoading(true);
        deleteData(`/api/cart/${id}`).then((res) => {
            context.setAlertBox({
                open: true,
                error: false,
                msg: "item removed from cart!"
            })

            const user = JSON.parse(localStorage.getItem("user"));
            fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
                setCartData(res);
                setIsLoading(false);
            })

            context.getCartData();

        })
    }

    return (
        <>

            <section className="section cartPage">
                <div className="container">
                    <h2 className="hd mb-1">Your Cart</h2>
                    <p>There are <b className="text-red">{cartData?.length}</b> products in your cart</p>

                    {
                        cartData?.length !== 0 ?

                            <div className="row">
                                <div className="col-md-9 pr-5">

                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th width="35%">Product</th>
                                                    <th width="15%">Unit Price</th>
                                                    <th width="25%">Quantity</th>
                                                    <th width="15%">Subtotal</th>
                                                    <th width="10%">Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    cartData?.length !== 0 && cartData?.map((item, index) => {
                                                        return (
                                                            <tr>
                                                                <td width="35%">
                                                                    <Link to={`/product/${item?.productId}`}>
                                                                        <div className="d-flex align-items-center cartItemimgWrapper">
                                                                            <div className="imgWrapper">
                                                                                <img src={item?.image}
                                                                                    className="w-100" alt={item?.productTitle} />
                                                                            </div>

                                                                            <div className="info px-3">
                                                                                <h6>
                                                                                    {item?.productTitle?.substr(0, 30) + '...'}

                                                                                </h6>
                                                                                <Rating name="read-only" value={item?.rating} readOnly size="small" />
                                                                            </div>

                                                                        </div>
                                                                    </Link>
                                                                </td>
                                                                <td width="15%">Rs {item?.price}</td>
                                                                <td width="25%">
                                                                    <QuantityBox quantity={quantity} item={item} selectedItem={selectedItem} value={item?.quantity} />
                                                                </td>
                                                                <td width="15%">Rs. {item?.subTotal}</td>
                                                                <td width="10%"><span className="remove" onClick={() => removeItem(item?._id)}><IoIosClose /></span></td>
                                                            </tr>
                                                        )
                                                    })
                                                }


                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="card border p-3 cartDetails">
                                        <h4>CART TOTALS</h4>

                                        <div className="d-flex align-items-center mb-3">
                                            <span>Subtotal</span>
                                            <span className="ml-auto text-red font-weight-bold">
                                            {
                                                (context.cartData?.length !== 0 ?
                                                    context.cartData?.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0)?.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })
                                            }
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center mb-3">
                                            <span>Shipping</span>
                                            <span className="ml-auto"><b>Free</b></span>
                                        </div>


                                        <div className="d-flex align-items-center">
                                            <span>Total</span>
                                            <span className="ml-auto text-red font-weight-bold">
                                            {
                                                (context.cartData?.length !== 0 ?
                                                    context.cartData?.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0)?.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })
                                            }
                                            </span>
                                        </div>


                                        <br />
                                        <Link to="/checkout">
                                            <Button className='btn-blue bg-red btn-lg btn-big'><IoBagCheckOutline /> &nbsp; Checkout</Button>
                                        </Link>

                                    </div>
                                </div>
                            </div>

                            :


                            <div className="empty d-flex align-items-center justify-content-center flex-column">
                                <img src={emprtCart} width="150" />
                                <h3>Your Cart is currently empty</h3>
                                <br />
                                <Link to="/"> <Button className='btn-blue bg-red btn-lg btn-big btn-round'><FaHome /> &nbsp; Continue Shopping</Button></Link>
                            </div>


                    }


                </div>
            </section>

            {isLoading === true && <div className="loadingOverlay"></div>}


        </>
    )
}

export default Cart;