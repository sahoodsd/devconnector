const express = require('express');
const router = express.Router();

//@route   GET api/profile
//@desc    test routes
//@access  public

router.get('/', (req, res) => res.send('profile routes'));

module.exports = router;
