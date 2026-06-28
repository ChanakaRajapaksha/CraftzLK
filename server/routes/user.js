const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const asyncHandler = require('../middleware/asyncHandler');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(
  '/upload',
  upload.array('images'),
  asyncHandler(userController.upload.bind(userController))
);
router.post('/signup', asyncHandler(userController.signup.bind(userController)));
router.post(
  '/verifyAccount/resendOtp',
  asyncHandler(userController.resendOtp.bind(userController))
);
router.put(
  '/verifyAccount/emailVerify/:id',
  asyncHandler(userController.emailVerify.bind(userController))
);
router.post('/verifyemail', asyncHandler(userController.verifyEmail.bind(userController)));
router.post('/signin', asyncHandler(userController.signin.bind(userController)));
router.put(
  '/changePassword/:id',
  asyncHandler(userController.changePassword.bind(userController))
);
router.get('/', asyncHandler(userController.list.bind(userController)));
router.get('/get/count', asyncHandler(userController.getCount.bind(userController)));
router.post(
  '/authWithGoogle',
  asyncHandler(userController.authWithGoogle.bind(userController))
);
router.delete(
  '/deleteImage',
  asyncHandler(userController.deleteImage.bind(userController))
);
router.post(
  '/forgotPassword',
  asyncHandler(userController.forgotPassword.bind(userController))
);
router.post(
  '/forgotPassword/changePassword',
  asyncHandler(userController.forgotPasswordChange.bind(userController))
);
router.get('/:id', asyncHandler(userController.getById.bind(userController)));
router.delete('/:id', asyncHandler(userController.remove.bind(userController)));
router.put('/:id', asyncHandler(userController.update.bind(userController)));

module.exports = router;
