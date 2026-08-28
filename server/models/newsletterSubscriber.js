const mongoose = require("mongoose");

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please enter a valid email address"],
    },
    status: {
      type: String,
      enum: ["pending", "subscribed", "unsubscribed"],
      default: "pending",
    },
    source: {
      type: String,
      default: "Footer",
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
      select: false,
    },
    confirmationTokenExpires: {
      type: Date,
      select: false,
    },
    confirmedToken: {
      type: String,
      select: false,
    },
    unsubscribeToken: {
      type: String,
      select: false,
    },
    subscribedAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    lastConfirmationSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

newsletterSubscriberSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.confirmationToken;
    delete ret.confirmationTokenExpires;
    delete ret.confirmedToken;
    delete ret.unsubscribeToken;
    return ret;
  },
});

newsletterSubscriberSchema.index({ status: 1, createdAt: -1 });
newsletterSubscriberSchema.index({ confirmedToken: 1 }, { sparse: true });

exports.NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);
exports.EMAIL_REGEX = EMAIL_REGEX;
