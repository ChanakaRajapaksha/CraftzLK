import { motion } from "framer-motion";

const SKELETON_COUNT = 8;

const cardTransition = {
  initial: { opacity: 0, y: 10 },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: index * 0.04,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function SkeletonCard({ index }) {
  return (
    <motion.article
      className="collections-skeleton-card"
      aria-hidden="true"
      custom={index}
      variants={cardTransition}
      initial="initial"
      animate="animate"
    >
      <div className="collections-skeleton-card__shell">
        <div className="collections-skeleton-card__image" />
        <div className="collections-skeleton-card__panel">
          <div className="collections-skeleton-card__line collections-skeleton-card__line--title" />
          <div className="collections-skeleton-card__line collections-skeleton-card__line--price" />
          <div className="collections-skeleton-card__line collections-skeleton-card__line--meta" />
          <div className="collections-skeleton-card__line collections-skeleton-card__line--rating" />
          <div className="collections-skeleton-card__line collections-skeleton-card__line--stock" />
        </div>
      </div>
    </motion.article>
  );
}

export default function CollectionsCatalogLoading() {
  return (
    <div
      className="collections-skeleton-grid"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading products"
    >
      <span className="collections-skeleton-grid__label">Loading products…</span>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
}
