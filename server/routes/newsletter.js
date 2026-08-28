const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const asyncHandler = require("../middleware/asyncHandler");
const { authorize } = require("../middleware/auth");

const adminOnly = authorize("admin");

router.post("/subscribe", asyncHandler(newsletterController.subscribe.bind(newsletterController)));
router.post("/status", asyncHandler(newsletterController.status.bind(newsletterController)));
router.post("/resend-confirmation", asyncHandler(newsletterController.resendConfirmation.bind(newsletterController)));
router.get("/confirm/:token", asyncHandler(newsletterController.confirm.bind(newsletterController)));
router.get("/confirm", asyncHandler(newsletterController.confirm.bind(newsletterController)));
router.post("/unsubscribe", asyncHandler(newsletterController.unsubscribe.bind(newsletterController)));
router.get("/unsubscribe/:token", asyncHandler(newsletterController.unsubscribe.bind(newsletterController)));
router.get("/unsubscribe", asyncHandler(newsletterController.unsubscribe.bind(newsletterController)));

router.get("/", adminOnly, asyncHandler(newsletterController.list.bind(newsletterController)));

module.exports = router;
