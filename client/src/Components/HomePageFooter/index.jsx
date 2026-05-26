import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./HomePageFooter.css";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "New arrivals", to: "/products" },
      { label: "Best sellers", to: "/products" },
      { label: "Categories", to: "/products" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { label: "Help center", to: "#" },
      { label: "Shipping & delivery", to: "#" },
      { label: "Returns & refunds", to: "#" },
      { label: "Track your order", to: "/orders" },
    ],
  },
  {
    title: "CraftzLK",
    links: [
      { label: "Our story", to: "#" },
      { label: "Artisans & makers", to: "#" },
      { label: "Sustainability", to: "#" },
      { label: "Contact us", to: "#" },
    ],
  },
];

/** Site footer chrome only — ends at copyright row (no extra content below). */
export default function HomePageFooter() {
  return (
    <footer className="home-page-footer" aria-label="Site footer">
      <div className="home-page-footer__chrome">
        <div className="home-page-footer__chrome-inner">
          <div className="home-page-footer__grid">
            <div className="home-page-footer__brand">
              <Link to="/" className="home-page-footer__logo">
                <img src="/images/craftzlk.png" alt="CraftzLK" />
              </Link>
              <p className="home-page-footer__tagline">
                Authentic handmade, eco-friendly, and premium homestyle products from
                Sri Lankan artisans.
              </p>
            </div>

            {FOOTER_LINKS.map((col) => (
              <nav key={col.title} className="home-page-footer__col" aria-label={col.title}>
                <h3 className="home-page-footer__col-title">{col.title}</h3>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="home-page-footer__newsletter">
              <h3 className="home-page-footer__col-title">Stay in touch</h3>
              <p>Offers, new arrivals, and maker stories — straight to your inbox.</p>
              <form className="home-page-footer__form" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Email for newsletter"
                />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="home-page-footer__bottom">
            <p className="home-page-footer__copy">
              © {new Date().getFullYear()} CraftzLK. All rights reserved.
            </p>
            <ul className="home-page-footer__socials">
              <li>
                <Link to="#" aria-label="Facebook">
                  <FaFacebookF />
                </Link>
              </li>
              <li>
                <Link to="#" aria-label="X (Twitter)">
                  <FaXTwitter />
                </Link>
              </li>
              <li>
                <Link to="#" aria-label="Instagram">
                  <FaInstagram />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
