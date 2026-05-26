export const FEED_PAGE_SIZE = 5;

export const PRODUCT_REVIEWS = [
  {
    id: 1,
    name: "Kawyanethma",
    verified: true,
    date: "04/07/2026",
    stars: 5,
    title: "Great product",
    body: "Fresh taste and beautiful packaging. Arrived well sealed and exactly as described.",
  },
  {
    id: 2,
    name: "Hasitha M.",
    verified: true,
    date: "04/05/2026",
    stars: 5,
    title: "Good",
    body: "Authentic homemade flavour. Will definitely order again from CraftzLK.",
  },
  {
    id: 3,
    name: "Anjula N.",
    verified: false,
    date: "04/02/2026",
    stars: 5,
    title: "Worth every rupee",
    body: "Quality is excellent for the price. Delivery was quick and support was friendly.",
  },
  {
    id: 4,
    name: "Dushari R.",
    verified: true,
    date: "03/28/2026",
    stars: 5,
    title: "Perfect for gifting",
    body: "Bought this as a gift and everyone loved it. Premium look and natural ingredients.",
  },
  {
    id: 5,
    name: "Tharushi P.",
    verified: true,
    date: "03/25/2026",
    stars: 4,
    title: "Very satisfied",
    body: "Taste is bold and fresh. One star off only because I wanted a slightly larger pack size.",
  },
  {
    id: 6,
    name: "Chamara W.",
    verified: false,
    date: "03/22/2026",
    stars: 5,
    title: "Highly recommend",
    body: "This is now a staple in our kitchen. No artificial aftertaste at all.",
  },
  {
    id: 7,
    name: "Nilmini F.",
    verified: true,
    date: "03/18/2026",
    stars: 5,
    title: "Excellent quality",
    body: "You can tell it is handmade with care. Packaging kept everything fresh in transit.",
  },
  {
    id: 8,
    name: "Roshan K.",
    verified: true,
    date: "03/14/2026",
    stars: 5,
    title: "Natural and clean",
    body: "Love that the ingredients list is short and honest. Tastes just like homemade.",
  },
  {
    id: 9,
    name: "Savindi J.",
    verified: false,
    date: "03/10/2026",
    stars: 4,
    title: "Nice packaging",
    body: "Eco-friendly box and delicious product inside. Will reorder soon.",
  },
  {
    id: 10,
    name: "Dinesh A.",
    verified: true,
    date: "03/06/2026",
    stars: 5,
    title: "Reminds me of home",
    body: "Living abroad, this brought back familiar flavours. Arrived safely and on time.",
  },
  {
    id: 11,
    name: "Iresha C.",
    verified: true,
    date: "03/02/2026",
    stars: 5,
    title: "Consistently good",
    body: "Third purchase of this item and quality has been consistent every time.",
  },
  {
    id: 12,
    name: "Sanduni L.",
    verified: false,
    date: "02/26/2026",
    stars: 5,
    title: "Love CraftzLK",
    body: "Found this store through a friend. Fast delivery and genuinely premium handmade goods.",
  },
];

export const PRODUCT_QUESTIONS = [
  {
    id: 1,
    name: "Tharux",
    date: "02/08/2025",
    question: "Is this suitable for daily use? Can we expect the same freshness after opening?",
    reply: {
      author: "CraftzLK",
      date: "02/11/2025",
      body: "Yes — once opened, store in a cool dry place or refrigerate as noted on the label. Most customers enjoy peak freshness for 2–3 weeks when stored properly.",
    },
  },
  {
    id: 2,
    name: "Nethmi",
    date: "01/15/2026",
    question: "Do you use any artificial preservatives in this product?",
    reply: {
      author: "CraftzLK",
      date: "01/16/2026",
      body: "No artificial preservatives are added. We use traditional preparation methods and natural ingredients only, with shelf-life guidance on each pack.",
    },
  },
  {
    id: 3,
    name: "Pradeep",
    date: "12/20/2025",
    question: "Can I include a gift message with my order?",
    reply: {
      author: "CraftzLK",
      date: "12/21/2025",
      body: "Absolutely. Add your message at checkout in the order notes and we will include a handwritten gift card at no extra charge.",
    },
  },
  {
    id: 4,
    name: "Ayodya",
    date: "11/08/2025",
    question: "How long does delivery usually take within Colombo?",
    reply: {
      author: "CraftzLK",
      date: "11/09/2025",
      body: "Colombo deliveries typically arrive within 1–2 business days. Outer districts may take 2–4 days depending on the courier route.",
    },
  },
  {
    id: 5,
    name: "Malith",
    date: "10/02/2025",
    question: "Is the packaging eco-friendly?",
    reply: {
      author: "CraftzLK",
      date: "10/03/2025",
      body: "Yes. We use recyclable boxes and minimal plastic wherever possible, with biodegradable padding for fragile handmade items.",
    },
  },
  {
    id: 6,
    name: "Shanika",
    date: "09/14/2025",
    question: "Can I order this in bulk for a corporate event?",
    reply: {
      author: "CraftzLK",
      date: "09/15/2025",
      body: "Yes — contact us via WhatsApp or email for bulk pricing. We can customise hampers and labels for corporate gifting.",
    },
  },
  {
    id: 7,
    name: "Ruwan",
    date: "08/30/2025",
    question: "What is the best before date on a new batch?",
    reply: {
      author: "CraftzLK",
      date: "08/31/2025",
      body: "Each batch is labelled with a best-before date at packing. We ship only from the latest production run so you receive maximum shelf life.",
    },
  },
];

export const FEED_SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
];

function parseFeedDate(dateStr) {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function sortProductReviews(reviews, sortBy) {
  const result = [...reviews];

  if (sortBy === "highest") {
    result.sort((a, b) => b.stars - a.stars || parseFeedDate(b.date) - parseFeedDate(a.date));
  } else if (sortBy === "lowest") {
    result.sort((a, b) => a.stars - b.stars || parseFeedDate(b.date) - parseFeedDate(a.date));
  } else {
    result.sort((a, b) => parseFeedDate(b.date) - parseFeedDate(a.date));
  }

  return result;
}

export function sortProductQuestions(questions) {
  return [...questions].sort((a, b) => parseFeedDate(b.date) - parseFeedDate(a.date));
}
