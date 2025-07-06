const express = require('express')
const router = express.Router()
const Land = require('../modules/Land_module')
const auth = require('../controllers/auth_controllers')
router.post('/update',async (req,res)=>{
    await Land.updateMany({},{$set: {"fed" : 0}})
    return res.status(200).send({message:"daret ya sya3"})
})
router.post('/signup',auth.signup);
router.post('/login',auth.login);
router.post('/signout',auth.logout);

module.exports = router;