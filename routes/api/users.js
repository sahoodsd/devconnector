const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route   GET api/users
//@desc    Register routes
//@access  public

router.post(
  '/',
  [
    check('name', 'name is required.').not().notEmpty(),
    check('email', 'Please enter a valid email.').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters.',
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      //if user exist
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          error: [{ msg: 'User already exist!' }],
        });
      }

      //use gravatar
      const avatar = gravatar.url(email, {
        s: '500',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //encrypt the password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        },
      );

    } catch (err) {
      console.log(err.message);
      return res.status(500).send('server error');
    }
  },
);

module.exports = router;
