const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users');
const AuthHelper = require('../Helpers/AuthHelper');

router.get('/users', AuthHelper.VerifyToken, userCtrl.GetAllUsers);
router.get('/user/:id', AuthHelper.VerifyToken, userCtrl.GetUser);
router.get(
  '/username/:username',
  AuthHelper.VerifyToken,
  userCtrl.GetUserByName
);

router.post('/user/view-profile', AuthHelper.VerifyToken, userCtrl.ProfileView);

router.post(
  '/change-password',
  AuthHelper.VerifyToken,
  userCtrl.ChangePassword
);

module.exports = router;
