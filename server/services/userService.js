const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload');
const { sendEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

function getImageNameFromUrl(imgUrl) {
  const urlArr = imgUrl.split('/');
  const image = urlArr[urlArr.length - 1];
  return image.split('.')[0];
}

async function sendEmailFun(to, subject, text, html) {
  const result = await sendEmail(to, subject, text, html);
  if (result.success) {
    return true;
  }
  return false;
}

class UserService {
  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
        files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${files[i].filename}`);
        }
      );
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
  }

  async signup(body) {
    const { name, phone, email, password, isAdmin } = body;
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    let user;

    const existingUser = await User.findOne({ email: email });
    const existingUserByPh = await User.findOne({ phone: phone });

    if (existingUser) {
      return {
        status: 'FAILED',
        msg: 'User already exist with this email!',
      };
    }

    if (existingUserByPh) {
      return {
        status: 'FAILED',
        msg: 'User already exist with this phone number!',
      };
    }

    if (existingUser) {
      const hashPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashPassword;
      existingUser.otp = verifyCode;
      existingUser.otpExpires = Date.now() + 600000;
      await existingUser.save();
      user = existingUser;
    } else {
      const hashPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        phone,
        password: hashPassword,
        isAdmin,
        otp: verifyCode,
        otpExpires: Date.now() + 600000,
      });

      await user.save();
    }

    sendEmailFun(email, 'Verify Email', '', 'Your OTP is ' + verifyCode);

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return {
      success: true,
      message: 'User registered successfully! Please verify your email.',
      token: token,
    };
  }

  async resendOtp(body) {
    const { email } = body;
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return {
        success: true,
        message: 'OTP SEND',
        otp: verifyCode,
        existingUserId: existingUser._id,
      };
    }

    return null;
  }

  async emailVerify(id, body) {
    const { email, otp } = body;
    const existingUser = await User.findOne({ email: email });

    console.log(existingUser);

    if (existingUser) {
      await User.findByIdAndUpdate(
        id,
        {
          name: existingUser.name,
          email: email,
          phone: existingUser.phone,
          password: existingUser.password,
          images: existingUser.images,
          isAdmin: existingUser.isAdmin,
          isVerified: existingUser.isVerified,
          otp: otp,
          otpExpires: Date.now() + 600000,
        },
        { new: true }
      );
    }

    sendEmailFun(email, 'Verify Email', '', 'Your OTP is ' + otp);

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return {
      success: true,
      message: 'OTP SEND',
      token: token,
    };
  }

  async verifyEmail(body) {
    const { email, otp } = body;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return { success: true, message: 'OTP verified successfully' };
    } else if (!isCodeValid) {
      const error = new Error('Invalid OTP');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    } else {
      const error = new Error('OTP expired');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }
  }

  async signin(body) {
    const { email, password } = body;
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      error.payload = { error: true, msg: error.message };
      throw error;
    }

    if (existingUser.isVerified === false) {
      return {
        error: true,
        isVerify: false,
        msg: 'Your account is not active yet please verify your account first or Sign Up with a new user',
        isUnverified: true,
      };
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      const error = new Error('Invailid credentials');
      error.statusCode = 400;
      error.payload = { error: true, msg: error.message };
      throw error;
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return {
      user: existingUser,
      token: token,
      msg: 'User Authenticated',
    };
  }

  async changePassword(id, body) {
    const { name, phone, email, password, newPass, images } = body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return { notFound: true, payload: { error: true, msg: 'User not found!' } };
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return { wrongPassword: true, payload: { error: true, msg: 'current password wrong' } };
    }

    let newPassword;

    if (newPass) {
      newPassword = bcrypt.hashSync(newPass, 10);
    } else {
      newPassword = existingUser.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: name,
        phone: phone,
        email: email,
        password: newPassword,
        images: images,
      },
      { new: true }
    );

    if (!user) {
      const error = new Error('The user cannot be Updated!');
      error.statusCode = 400;
      error.payload = { error: true, msg: error.message };
      throw error;
    }

    return user;
  }

  async list() {
    const userList = await User.find();
    return { userList, isFalsy: !userList };
  }

  async getById(id) {
    const user = await User.findById(id);
    return { user, isFalsy: !user };
  }

  async remove(id) {
    const user = await User.findByIdAndDelete(id);
    return user;
  }

  async getCount() {
    const userCount = await User.countDocuments();
    return { userCount, isEmpty: !userCount };
  }

  async authWithGoogle(body) {
    const { name, phone, email, password, images, isAdmin } = body;
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      const result = await User.create({
        name: name,
        phone: phone,
        email: email,
        password: password,
        images: images,
        isAdmin: isAdmin,
        isVerified: true,
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return {
        user: result,
        token: token,
        msg: 'User Login Successfully!',
      };
    }

    const user = await User.findOne({ email: email });
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return {
      user: user,
      token: token,
      msg: 'User Login Successfully!',
    };
  }

  async update(id, body, uploadedImages) {
    const { name, phone, email } = body;

    const userExist = await User.findById(id);

    let newPassword;
    if (body.password) {
      newPassword = bcrypt.hashSync(body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: name,
        phone: phone,
        email: email,
        password: newPassword,
        images: uploadedImages,
      },
      { new: true }
    );

    return user;
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    return cloudinary.uploader.destroy(imageName, (error, result) => {});
  }

  async forgotPassword(body) {
    const { email } = body;
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return { status: 'FAILED', msg: 'User not exist with this email!' };
    }

    if (existingUser) {
      existingUser.otp = verifyCode;
      existingUser.otpExpires = Date.now() + 600000;
      await existingUser.save();
    }

    sendEmailFun(email, 'Verify Email', '', 'Your OTP is ' + verifyCode);

    return {
      success: true,
      status: 'SUCCESS',
      message: 'OTP Send',
    };
  }

  async forgotPasswordChange(body) {
    const { email, newPass } = body;
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      const hashPassword = await bcrypt.hash(newPass, 10);
      existingUser.password = hashPassword;
      await existingUser.save();
    }

    return {
      success: true,
      status: 'SUCCESS',
      message: 'Password change successfully',
    };
  }
}

module.exports = new UserService();
