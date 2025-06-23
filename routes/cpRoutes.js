const express = require('express')
const router = express.Router()
const cp_controller = require('../controllers/cp_controllers')
const auth = require('../controllers/auth_controllers')
// ,auth.authenMid,auth.verifyUser,


router.patch('/transport/process',auth.authenMid,auth.verifyUser,cp_controller.transport)





module.exports = router