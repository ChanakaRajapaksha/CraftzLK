import { LuShirt } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { TbDiscount2 } from "react-icons/tb";
import { CiBadgeDollar } from "react-icons/ci";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import newsLetterImg from "../../assets/images/newsletter.png";
import Button from "@mui/material/Button";
import { IoMailOutline } from "react-icons/io5";
import {  useState } from "react";

const Footer = () => {
  const [bannerList, setBannerList] = useState([]);

  return (
    <>
      
      <section className="newsLetterSection mt-3 mb-3 d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="text-white mb-1">
                20% discount for your first order
              </p>
              <h3 className="text-white"> Join our MARKET-V newsletter...</h3>
              <p className="text-light">
                today and stay updated on <br/> the latest deals, exclusive discounts, and special offers!
              </p>

              <form className="mt-4">
                <IoMailOutline />
                <input type="text" placeholder="Your Email Address" />
                <Button>Subscribe</Button>
              </form>
            </div>

            <div className="col-md-6">
              <img src={newsLetterImg} />
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="container">
          <div className="topInfo row">
            <div className="col d-flex align-items-center">
              <span>
                <LuShirt />
              </span>
              <span className="ml-2">Everyday fresh products</span>
            </div>

            <div className="col d-flex align-items-center">
              <span>
                <TbTruckDelivery />
              </span>
              <span className="ml-2">Free delivery for order over RS:8000</span>
            </div>

            <div className="col d-flex align-items-center">
              <span>
                <TbDiscount2 />
              </span>
              <span className="ml-2">Daily Mega Discounts</span>
            </div>

            <div className="col d-flex align-items-center">
              <span>
                <CiBadgeDollar />
              </span>
              <span className="ml-2">Best price on the market</span>
            </div>
          </div>

          <div className="row mt-5 linksWrap">
            <div className="col">
              <h5>MARKET_V</h5>
              <ul>
                <li>
                  <Link to="#">About US</Link>
                </li>
                <li>
                  <Link to="#">Delivery Information</Link>
                </li>
                <li>
                  <Link to="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="#">Cuts & Sprouts</Link>
                </li>
                <li>
                  <Link to="#">Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="#">Contact Us</Link>
                </li>
                <li>
                  <Link to="#">Support Center</Link>
                </li>
              </ul>
            </div>

            <div className="col">
              <h5>CUSTOMER SERVICE</h5>
              <ul>
                <li>
                  <Link to="#">Help Center</Link>
                </li>
                <li>
                  <Link to="#">Returns & Refunds</Link>
                </li>
                <li>
                  <Link to="#">Shipping Policy</Link>
                </li>
                <li>
                  <Link to="#">Track Your Order</Link>
                </li>
                <li>
                  <Link to="#">FAQs</Link>
                </li>
                <li>
                  <Link to="#">Payment Methods</Link>
                </li>
                <li>
                  <Link to="#">Size Guide</Link>
                </li>
              </ul>
            </div>

            <div className="col">
              <h5>ABOUT US</h5>
              <ul>
                <li>
                  <Link to="#">Our Story</Link>
                </li>
                <li>
                  <Link to="#">Our Mission</Link>
                </li>
                <li>
                  <Link to="#">Sustainability</Link>
                </li>
                <li>
                  <Link to="#">Press</Link>
                </li>
                <li>
                  <Link to="#">Investor Relations</Link>
                </li>
                <li>
                  <Link to="#">Affilliate Program</Link>
                </li>
                <li>
                  <Link to="#">Partnerships</Link>
                </li>
              </ul>
            </div>

            <div className="col">
              <h5>QUICK LINKS</h5>
              <ul>
                <li>
                  <Link to="#">Home</Link>
                </li>
                <li>
                  <Link to="#">Best Sellers</Link>
                </li>
                <li>
                  <Link to="#">New Arrivals</Link>
                </li>
                <li>
                  <Link to="#">Featured Products</Link>
                </li>
                <li>
                  <Link to="#">Gift Cards</Link>
                </li>
                <li>
                  <Link to="#">Discount Offers</Link>
                </li>
                <li>
                  <Link to="#">Blog</Link>
                </li>
              </ul>
            </div>

            <div className="col">
              <h5>TOP CATEGORIES</h5>
              <ul>
                <li>
                  <Link to="#">Fashion</Link>
                </li>
                <li>
                  <Link to="#">Furniture</Link>
                </li>
                <li>
                  <Link to="#">Electronics</Link>
                </li>
                <li>
                  <Link to="#">Groceries</Link>
                </li>
                <li>
                  <Link to="#">Crafts</Link>
                </li>
                <li>
                  <Link to="#">Home & LifeStyle</Link>
                </li>
                <li>
                  <Link to="#">Industrial</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="copyright mt-3 pt-3 pb-3 d-flex">
            <p className="mb-0">Copyright 2024. All rights reserved</p>
            <ul className="list list-inline ml-auto mb-0 socials">
              <li className="list-inline-item">
                <Link to="#">
                  <FaFacebookF />
                </Link>
              </li>

              <li className="list-inline-item">
                <Link to="#">
                  <FaTwitter />
                </Link>
              </li>

              <li className="list-inline-item">
                <Link to="#">
                  <FaInstagram />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
