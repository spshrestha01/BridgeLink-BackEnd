const express = require('express');
const router = express.Router();
const MessageCtrl = require('../controllers/message');
const AuthHelper = require('../Helpers/AuthHelper');

router.get(
  '/chat-messages/:sender_Id/:receiver_Id',
  AuthHelper.VerifyToken,
  MessageCtrl.GetAllMessages
);

router.post(
  '/chat-messages/:sender_Id/:receiver_Id',
  AuthHelper.VerifyToken,
  MessageCtrl.SendMessage
);

router.get(
  '/receivers-messages/:sender/:receiver',
  AuthHelper.VerifyToken,
  MessageCtrl.MarkReceiverMessages
);

router.get(
  '/mark-all-messages',
  AuthHelper.VerifyToken,
  MessageCtrl.MarkAllMessages
);

module.exports = router;
