const express = require('express')
const router = express.Router()
const cp_controller = require('../controllers/cp_controllers')
const auth = require('../controllers/auth_controllers')
// ,auth.authenMid,auth.verifyUser,
router.use(auth.authenMid,auth.verifyUser)

router.patch('/transport/process',cp_controller.transport)

router.get('/transport',cp_controller.twoLandsResources)
router.patch('/buy',cp_controller.buy)
router.get('/plant',cp_controller.getPlant)
router.patch('/plant/process',cp_controller.plant)
router.




module.exports = router