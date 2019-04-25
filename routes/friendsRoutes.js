const express = require('express');
const router = express.Router();
const friendCtrl = require('../controllers/friends');
const AuthHelper = require('../Helpers/AuthHelper');

router.post('/follow-user', AuthHelper.VerifyToken, friendCtrl.FollowUser);

router.post('/unfollow-user', AuthHelper.VerifyToken, friendCtrl.UnFollowUser);
router.post('/mark/:id', AuthHelper.VerifyToken, friendCtrl.MarkNotificaition);
router.post(
  '/mark-all',
  AuthHelper.VerifyToken,
  friendCtrl.MarkAllNotifications
);

module.exports = router;
