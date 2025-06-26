const scouts = require('../modules/scout_module');
const patrols = require('../modules/patrol_module')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

function createToken(id){
    return jwt.sign({id},process.env.secretTokenString,{
        expiresIn: 24*60*60*30
    })
}

async function  signup(req,res){
    let {name,password,cp,patrol,chef} = req.body;
    try{
        let pat = await patrols.findOne({name:patrol})
        const scout = new scouts({
            name,
            password,
            cp,
            "patrol":pat._id,
            chef
        });
        token = createToken(scout._id);
        res.cookie('token',token,{httpOnly:true, maxAge:24*60*60*1000*30});
        await scout.save();
        res.status(201).json({
            "success": true,
            "message": "user registered successfully"
          });
    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"couldn't create the user"});
    }
}

async function login(req,res){
    let {name,password} = req.body;
    try{
        const scout = await scouts.findOne({name : name});
        if(scout){
                if(scout.password == password){
                    let rank = 0
                    if(scout.cp == true){
                        rank = 2
                    }else{
                        let patrol = await Patrols.findById(scout.patrol).exec()
                        if(patrol.name == "kadr"){
                            rank = 3
                        }else{
                            rank = 1
                        }
                    }
                    token = createToken(scout._id)
                    res.cookie("token",token,{httpOnly:true,maxAge:30*24*60*60*1000})
                    res.status(200).json({"success":true,"user":{"username":scout.name,"rank":rank}})
                }
                else{
                    res.status(400).json({"success":false,"msg":"the password is incorrect"});
                }
        }else{
            res.status(400).json({"success":false,"msg":"the user is not registred please create an accound first"})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"couldn't login"});
    }
}

function authenMid(req,res,next){
    const token = req.cookies.token;
    if(token){
        jwt.verify(token,process.env.secretTokenString,(err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.status(400).json({"msg":"you must be loged in to enter this page"})
            }else{
                next()
            }
        })
        
    }else{
        console.log(err.message);
        res.status(400).json({"msg":"you must be loged in to enter this page"})
    }
}

async function verifyUser(req,res,next){
    token = req.cookies.token;
    let id = 0;
    if(!token){
        res.status(401).json({"msg":"unauthorized access"});
    }else{
        jwt.verify(token,process.env.secretTokenString,(err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.status(401).json({"msg":"unauthorized access"});
            }else{
                 id = decodedToken.id;
            }
        })
    }
    const scout = await scouts.findById(id);
    if(!scout){
        res.status(404).json({"msg":"user not found"})
    }else{
        req.id = id;
        next();
    }
}

function logout(req,res){
    try{
    res.cookie('token',"",{httpOnly:true, maxAge:1});
    res.status(204).json({
        "success": true,
        "message": "User signed out successfully"
      })
    }catch(err){
        console.log(err);
    }
}
// router.post('/signout',)

module.exports = {signup,login,authenMid,verifyUser,logout}