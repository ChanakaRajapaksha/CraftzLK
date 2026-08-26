import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { slugFromPathname } from "../AdminDashboard/Cms/cmsFormDefaults";
import "./CmsPage.css";

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function CmsPageContent({ page }) {
  const content = String(page.content || "").trim();

  if (!content || page.isComingSoon) {
    return (
      <div className="cms-page__coming-soon">
        <span className="cms-page__coming-soon-badge">Coming soon</span>
        <h2 className="cms-page__coming-soon-title">We&apos;re preparing this page</h2>
        <p className="cms-page__coming-soon-text">
          {page.title} will be available here shortly. Check back soon for updates from CraftzLK.
        </p>
      </div>
    );
  }

  if (looksLikeHtml(content)) {
    return (
      <div
        className="cms-page__content cms-page__content--html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="cms-page__content cms-page__content--text">
      {content.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function CmsPageView({ slug: forcedSlug }) {
  const location = useLocation();
  const context = useContext(MyContext);
  const slug = useMemo(
    () => forcedSlug || slugFromPathname(location.pathname),
    [forcedSlug, location.pathname]
  );
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    fetchDataFromApi(`/api/cms-pages/public/${slug}`)
      .then((res) => {
        if (!res || res.success === false || !res.title) {
          setPage(null);
          setNotFound(true);
          return;
        }
        setPage(res);
      })
      .catch(() => {
        setPage(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);
    context?.setEnableFilterTab?.(false);
  }, [context, slug]);

  useEffect(() => {
    if (!page?.title) return;
    const metaTitle = page.seo?.metaTitle || `${page.title} | CraftzLK`;
    document.title = metaTitle;

    const description = page.seo?.metaDescription || "";
    let meta = document.querySelector('meta[name="description"]');
    if (description) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [page]);

  if (loading) {
    return (
      <div className="cms-page">
        <div className="cms-page__container">
          <p className="cms-page__loading">Loading page…</p>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/" replace />;
  }

  const heroImage = page.images?.[0];

  return (
    <div className="cms-page">
      <div className="cms-page__container">
        <nav className="cms-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="cms-page__breadcrumb-current">{page.title}</span>
        </nav>

        <header className="cms-page__hero">
          <p className="cms-page__eyebrow">CraftzLK</p>
          <h1 className="cms-page__title">{page.title}</h1>
          {heroImage ? (
            <div className="cms-page__hero-image-wrap">
              <img src={heroImage} alt="" className="cms-page__hero-image" />
            </div>
          ) : null}
        </header>

        <CmsPageContent page={page} />

        {page.images?.length > 1 ? (
          <div className="cms-page__gallery">
            {page.images.slice(1).map((image) => (
              <img key={image} src={image} alt="" className="cms-page__gallery-image" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
