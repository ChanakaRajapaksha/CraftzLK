import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import "./InfoSample.css";

const CARD_ICONS = {
  gift: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8V21M3 12h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8c-2-3-5-3-5 0s3 3 5 0 5-3 5 0-3-3-5 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 22 7v10l-10 5L2 17V7l10-5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M12 22V12M2 7l10 5 10-5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  rings: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="14" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="14" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c-4-3-8-8-8-14a8 8 0 0 1 16 0c0 6-4 11-8 14Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M12 22V8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  recycle: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 19H4l1-4M17 19h3l-1-4M12 3v4M8.5 7.5 6 5M15.5 7.5 18 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 15-2 4h10l-2-4" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
  seed: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s-6-4.5-6-10a6 6 0 0 1 12 0c0 5.5-6 10-6 10Z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 12V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15 18H9M14 6h4l3 4v8h-2" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 20c0-3.5 3.5-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15 20c0-2.5 2-4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 2 2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.8L6 22l1.5-7.3L2 10l7.1-1.1L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  ),
};

export default function InfoSampleLayout({
  breadcrumbLabel,
  eyebrow,
  eyebrowIcon,
  title,
  lead,
  stats = [],
  cards = [],
  cardsColumns = 2,
  sections = [],
  quote,
  highlights = [],
  primaryCta,
  secondaryCta,
  contact,
}) {
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);
    context?.setEnableFilterTab?.(false);
  }, [context]);

  return (
    <div className="info-page">
      <div className="info-page__container">
        <nav className="info-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="info-page__breadcrumb-current">{breadcrumbLabel}</span>
        </nav>

        <div className="info-page__hero">
          <p className="info-page__eyebrow">
            {eyebrowIcon}
            {eyebrow}
          </p>
          <h1 className="info-page__title">{title}</h1>
          <p className="info-page__lead">{lead}</p>
        </div>

        {stats.length > 0 && (
          <div className="info-page__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="info-page__stat">
                <span className="info-page__stat-value">{stat.value}</span>
                <span className="info-page__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <ul
            className={`info-page__cards${
              cardsColumns === 3 ? " info-page__cards--cols-3" : ""
            }`}
          >
            {cards.map((card, index) => (
              <li
                key={card.title}
                className="info-page__card"
                style={{ "--card-index": index }}
              >
                <span className="info-page__card-icon">{CARD_ICONS[card.icon]}</span>
                <h2 className="info-page__card-title">{card.title}</h2>
                <p className="info-page__card-text">{card.text}</p>
              </li>
            ))}
          </ul>
        )}

        {quote && (
          <blockquote className="info-page__quote">
            <p>{quote}</p>
          </blockquote>
        )}

        {sections.map((section) => (
          <section key={section.title} className="info-page__section">
            <h2 className="info-page__section-title">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section === sections[sections.length - 1] && highlights.length > 0 && (
              <ul className="info-page__highlights">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {(primaryCta || secondaryCta) && (
          <div className="info-page__actions">
            {primaryCta && (
              <Link to={primaryCta.to} className="info-page__btn info-page__btn--primary">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link to={secondaryCta.to} className="info-page__btn info-page__btn--ghost">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}

        {contact && (
          <p className="info-page__contact">
            {contact.text}{" "}
            {contact.phone && (
              <a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                {contact.phoneDisplay || contact.phone}
              </a>
            )}
            {contact.email && (
              <>
                {" "}
                or{" "}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
