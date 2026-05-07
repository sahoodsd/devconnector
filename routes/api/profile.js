const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route   GET api/profile/me
//@desc    get current user profile
//@access  private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar'],
    );
    if (!profile) {
      res.status(400).json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error!');
  }
});

//@route   post api/profile
//@desc    create or update current user profile
//@access  private

router.post('/', [
  auth,
  [
    check('status', 'status is required!').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true },
        );
        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }

    res.send('sss');
  },
]);

//@route   get api/profile
//@desc    get all profiles
//@access  public

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profile);
  } catch (err) {
    console.log(err.message);
  }
});

//@route   get api/profile/:user_id
//@desc    get all profiles
//@access  public

router.get('/:user_id', async (req, res) => {
  try {
    // console.log(req.params.user_id);
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found!' });
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found!' });
    }
  }
});

//@route   Delete api/profile
//@desc    delete profile, User & post
//@access  Private

router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove user posts

    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });

    //Remove User
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: 'User Deleted' });
  } catch (err) {
    console.log(err.message);
  }
});

//@route   PUT api/profile/experience
//@desc    add profile experience
//@access  Private

router.put(
  '/experience',
  [
    auth,
    check('title', 'Title is required.').not().isEmpty(),
    check('company', 'compnay is required.').not().isEmpty(),
    check('from', 'from is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, descreption } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      descreption,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.send(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route   Delete api/profile/experience/:exp_id
//@desc    delete profile experience
//@access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   PUT api/profile/education
//@desc    add profile education
//@access  Private

router.put(
  '/education',
  [
    auth,
    check('school', 'School is required.').not().isEmpty(),
    check('degree', 'degree is required.').not().isEmpty(),
    check('fieldofstudy', 'degree is required.').not().isEmpty(),
    check('from', 'from is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, descreption } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      descreption,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.send(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route   Delete api/profile/education/:edu_id
//@desc    delete profile education
//@access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
