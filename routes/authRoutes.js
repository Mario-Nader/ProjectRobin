const express = require('express')
const router = express.Router()
const auth = require('../controllers/auth_controllers')
 
router.post('/signup',auth.signup);
router.post('/login',auth.login);
router.post('/signout',auth.logout);

module.exports = router;