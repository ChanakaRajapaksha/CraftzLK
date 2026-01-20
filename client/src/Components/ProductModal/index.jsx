import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { useContext, useEffect, useState } from 'react';
import QuantityBox from '../QuantityBox';
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineCompareArrows } from "react-icons/md";
import { MyContext } from '../../App';
import ProductZoom from '../ProductZoom';
import { IoCartSharp } from "react-icons/io5";
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { FaHeart } from "react-icons/fa";


const ProductModal = (props) => {

    const [productQuantity, setProductQuantity] = useState();
    const [chengeQuantity, setchengeQuantity] = useState(0);
    let [cartFields, setCartFields] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeSize, setActiveSize] = useState(null);
    const [tabError, setTabError] = useState(false);
    const [isAddedToMyList, setSsAddedToMyList] = useState(false);
    const [addToMycompareList, setAddToMyCompareList] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        if (props?.data?.productRam.length === 0 && props?.data?.productWeight.length === 0 && props?.data?.size.length === 0) {
            setActiveSize(1);
        }

        const user = JSON.parse(localStorage.getItem("user"));

        fetchDataFromApi(`/api/my-list?productId=${props?.data?.id}&userId=${user?.userId}`).then((res) => {
            if (res.length !== 0) {
                setSsAddedToMyList(true);
            }
        })

        fetchDataFromApi(`/api/compare-list?productId=${props?.data?.id}&userId=${user?.userId}`).then((res) => {
            if (res.length !== 0) {
                setAddToMyCompareList(true);
            }
        })

    }, [])


    const quantity = (val) => {
        setProductQuantity(val);
        setchengeQuantity(val)
    }

    const isActive = (index) => {
        setActiveSize(index);
        setTabError(false);
    }

    // const selectedItem = (item, quantityVal) => {
    //     if (chengeQuantity !== 0) {
    //         setIsLoading(true);
    //         const user = JSON.parse(localStorage.getItem("user"));
    //         cartFields.productTitle = item?.productTitle
    //         cartFields.image = item?.image
    //         cartFields.rating = item?.rating
    //         cartFields.price = item?.price
    //         cartFields.quantity = quantityVal
    //         cartFields.subTotal = parseInt(item?.price * quantityVal)
    //         cartFields.productId = item?.id
    //         cartFields.userId = user?.userId

    //         //console.log(item?._id)

    //         editData(`/api/cart/${item?._id}`, cartFields).then((res) => {
    //             setTimeout(() => {
    //                 setIsLoading(false);
    //                 const user = JSON.parse(localStorage.getItem("user"));
    //                 fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
    //                     setCartData(res);
    //                 })
    //             }, 1000)
    //         })
    //     }

    // }


    const addtoCart = () => {

        if (activeSize !== null) {
            const user = JSON.parse(localStorage.getItem("user"));

            cartFields.productTitle = props?.data?.name
            cartFields.image = props?.data?.images[0]
            cartFields.rating = props?.data?.rating
            cartFields.price = props?.data?.price
            cartFields.quantity = productQuantity
            cartFields.subTotal = parseInt(props?.data?.price * productQuantity)
            cartFields.productId = props?.data?.id
            cartFields.countInStock = props?.data?.countInStock
            cartFields.userId = user?.userId


            context.addToCart(cartFields);
        } else {
            setTabError(true);
        }

    }


    const addToMyList = (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user !== undefined && user !== null && user !== "") {
            const data = {
                productTitle: props?.data?.name,
                image: props?.data?.images[0],
                rating: props?.data?.rating,
                price: props?.data?.price,
                productId: id,
                userId: user?.userId
            }
            postData(`/api/my-list/add/`, data).then((res) => {
                if (res.status !== false) {
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: "the product added in my list"
                    })
                } else {
                    context.setAlertBox({
                        open: true,
                        error: true,
                        msg: res.msg
                    })
                }

            })
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please Login to continue"
            })
        }

    }

    const addToMyCompareList = (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user !== undefined && user !== null && user !== "") {
          const data = {
            productTitle: props?.data?.name,
                image: props?.data?.images[0],
                rating: props?.data?.rating,
                price: props?.data?.price,
                productId: id,
                userId: user?.userId,
          };
          postData(`/api/compare-list/add/`, data).then((res) => {
            if (res.status !== false) {
              context.setAlertBox({
                open: true,
                error: false,
                msg: "the product added in Compare list",
              });
    
              fetchDataFromApi(
                `/api/compare-list?productId=${id}&userId=${user?.userId}`
              ).then((res) => {
                if (res.length !== 0) {
                  setSsAddedToMyList(true);
                }
              });
            } else {
              context.setAlertBox({
                open: true,
                error: true,
                msg: res.msg,
              });
            }
          });
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please Login to continue",
          });
        }
      };


    return (
        <>
            <Dialog open={context.isOpenProductModal} className="productModal" onClose={() => context.setisOpenProductModal(false)}>
                <Button className='close_' onClick={() => context.setisOpenProductModal(false)}><MdClose /></Button>
                <h4 class="mb-1 font-weight-bold pr-5">{props?.data?.name}</h4>
                <div className='d-flex align-items-center'>
                    <div className='d-flex align-items-center mr-4'>
                        <span>Brands:</span>
                        <span className='ml-2'><b>{props?.data?.brand}</b> </span>
                    </div>

                    <Rating name="read-only" value={parseInt(props?.data?.rating)} size="small" precision={0.5} readOnly />
                </div>


                <hr />


                <div className='row mt-2 productDetaileModal'>
                    <div className='col-md-5'>
                        <ProductZoom images={props?.data?.images} discount={props?.data?.discount} />
                    </div>

                    <div className='col-md-7'>
                        <div className='d-flex info align-items-center mb-3'>
                            <span className='oldPrice lg mr-2'>Rs: {props?.data?.oldPrice}</span>
                            <span className='netPrice text-danger lg'>Rs: {props?.data?.price}</span>
                        </div>

                        <span className="badge bg-success">IN STOCK</span>

                        <p className='mt-3'>Rs: {props?.data?.description}</p>



                        {
                            props?.data?.productRam?.length !== 0 &&
                            <div className='productSize d-flex align-items-center'>
                                <span>RAM:</span>
                                <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                    {
                                        props?.data?.productRam?.map((item, index) => {
                                            return (
                                                <li className='list-inline-item'><a className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                            )
                                        })
                                    }

                                </ul>
                            </div>
                        }


                        {
                            props?.data?.size?.length !== 0 &&
                            <div className='productSize d-flex align-items-center'>
                                <span>Size:</span>
                                <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                    {
                                        props?.data?.size?.map((item, index) => {
                                            return (
                                                <li className='list-inline-item'><a className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                            )
                                        })
                                    }

                                </ul>
                            </div>
                        }


                        {
                            props?.data?.productWeight?.length !== 0 &&
                            <div className='productSize d-flex align-items-center'>
                                <span>Weight:</span>
                                <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                    {
                                        props?.data?.productWeight?.map((item, index) => {
                                            return (
                                                <li className='list-inline-item'><a className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                            )
                                        })
                                    }

                                </ul>
                            </div>
                        }



                        <div className='d-flex align-items-center actions_'>
                            <QuantityBox quantity={quantity} item={props?.data} />

                            <Button className='btn-blue bg-red btn-lg btn-big btn-round ml-3' onClick={() => addtoCart()}><IoCartSharp />
                                {
                                    context.addingInCart === true ? "adding..." : " Add to cart"
                                }
                            </Button>
                        </div>


                        <div className='d-flex align-items-center mt-5 actions'>
                            <Button className='btn-round btn-sml' variant="outlined" onClick={() => addToMyList(props?.data?.id)} >

                                {/* {
                                    isAddedToMyList === true ?
                                    <>
                                        <FaHeart className="text-danger" />
                                        &nbsp; ADDED TO WISHLIST
                                    </>

                                    :

                                <>
                                    <IoIosHeartEmpty />
                                    &nbsp; ADD TO WISHLIST
                                </>
                                } */}

                                 <IoIosHeartEmpty />&nbsp; ADD TO WISHLIST
                            </Button>
                            <Button className='btn-round btn-sml ml-3' variant="outlined" onClick={() => addToMyCompareList(props?.data?.id)}>
                                {
                                    addToMycompareList === true ?
                                    <>
                                        <MdOutlineCompareArrows className="text-danger" />
                                        &nbsp; ADDED TO COMPARE LIST
                                    </>

                                    :

                                <>
                                    <MdOutlineCompareArrows />
                                    &nbsp; ADD TO COMPARE LIST
                                </>
                                }
                            </Button>
                        </div>

                    </div>

                </div>



            </Dialog>
        </>
    )
}

export default ProductModal;