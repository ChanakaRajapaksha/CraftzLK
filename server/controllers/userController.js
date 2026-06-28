const userService = require('../services/userService');

let imagesArr = [];

class UserController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await userService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  }

  async signup(req, res) {
    const { name, phone, email, password, isAdmin } = req.body;

    try {
      const result = await userService.signup({ name, phone, email, password, isAdmin });

      if (result.status === 'FAILED') {
        res.json(result);
        return;
      }

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.json({ status: 'FAILED', msg: 'something went wrong' });
      return;
    }
  }

  async resendOtp(req, res) {
    const { email } = req.body;

    try {
      const result = await userService.resendOtp({ email });

      if (result) {
        return res.status(200).json(result);
      }
    } catch (error) {
      console.log(error);
      res.json({ status: 'FAILED', msg: 'something went wrong' });
      return;
    }
  }

  async emailVerify(req, res) {
    const { email, otp } = req.body;

    try {
      const result = await userService.emailVerify(req.params.id, { email, otp });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.json({ status: 'FAILED', msg: 'something went wrong' });
      return;
    }
  }

  async verifyEmail(req, res) {
    try {
      const result = await userService.verifyEmail(req.body);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      console.log('Error in verifyEmail', error);
      res
        .status(500)
        .json({ success: false, message: 'Error in verifying email' });
    }
  }

  async signin(req, res) {
    const { email, password } = req.body;

    try {
      const result = await userService.signin({ email, password });

      if (result.isUnverified) {
        res.json(result);
        return;
      }

      return res.status(200).send(result);
    } catch (error) {
      if (error.statusCode === 404) {
        res.status(404).json(error.payload);
        return;
      }
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      res.status(500).json({ error: true, msg: 'something went wrong' });
      return;
    }
  }

  async changePassword(req, res) {
    const { name, phone, email, password, newPass, images } = req.body;

    try {
      const result = await userService.changePassword(req.params.id, {
        name,
        phone,
        email,
        password,
        newPass,
        images,
      });

      if (result.notFound) {
        res.status(404).json(result.payload);
        return;
      }

      if (result.wrongPassword) {
        res.status(404).json(result.payload);
      } else {
        res.send(result);
      }
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      throw error;
    }
  }

  async list(req, res) {
    const { userList, isFalsy } = await userService.list();

    if (isFalsy) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  }

  async getById(req, res) {
    const { user, isFalsy } = await userService.getById(req.params.id);

    if (isFalsy) {
      res
        .status(500)
        .json({ message: 'The user with the given ID was not found.' });
    } else {
      res.status(200).send(user);
    }
  }

  async remove(req, res) {
    userService
      .remove(req.params.id)
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .json({ success: true, message: 'the user is deleted!' });
        } else {
          return res
            .status(404)
            .json({ success: false, message: 'user not found!' });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  }

  async getCount(req, res) {
    const { userCount, isEmpty } = await userService.getCount();

    if (isEmpty) {
      res.status(500).json({ success: false });
    }
    res.send({
      userCount: userCount,
    });
  }

  async authWithGoogle(req, res) {
    const { name, phone, email, password, images, isAdmin } = req.body;

    try {
      const result = await userService.authWithGoogle({
        name,
        phone,
        email,
        password,
        images,
        isAdmin,
      });

      return res.status(200).send(result);
    } catch (error) {
      console.log(error);
    }
  }

  async update(req, res) {
    const { name, phone, email } = req.body;

    const user = await userService.update(req.params.id, req.body, imagesArr);

    if (!user) return res.status(400).send('the user cannot be Updated!');

    res.send(user);
  }

  async deleteImage(req, res) {
    const response = await userService.deleteImage(req.query.img);

    if (response) {
      res.status(200).send(response);
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const result = await userService.forgotPassword({ email });

      if (result.status === 'FAILED') {
        res.json(result);
        return;
      }

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.json({ status: 'FAILED', msg: 'something went wrong' });
      return;
    }
  }

  async forgotPasswordChange(req, res) {
    const { email, newPass } = req.body;

    try {
      const result = await userService.forgotPasswordChange({ email, newPass });
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.json({ status: 'FAILED', msg: 'something went wrong' });
      return;
    }
  }
}

module.exports = new UserController();
