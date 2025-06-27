const express = require('express')
const router = express.Router()
const chef_controller = require('../controllers/chef_controllers')
const auth = require('../controllers/auth_controllers')

router.use(auth.authenMid,auth.verifyUser)
router.get('/harvest',chef_controller.getharvest)
router.patch('/harvest/process',chef_controller.harvest)
router.get('/view-scores',chef_controller.view_scores)
router.patch('/watering',chef_controller.watering)
router.patch('/update-scores',chef_controller.update_scores)

module.exports = router