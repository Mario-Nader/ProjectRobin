const Land = require("../modules/Land_module")
const Patrol = require("../modules/patrol_module")
const Asset = require("../modules/assets_module")
const Scout = require("../modules/scout_module")


async function view_scores(req,res){
  let  patrols = await Patrol.find({"name":{$ne:"kadr"}}).exec();
  return patrols
}

async function update_scores(req,res){
  let user = await Scout.findById(req.id).exec()
  if(user){
  if((await Patrol.findById(user.patrol).exec()).name == "kadr"){
    let pats = await Patrol.find({name:{$ne :"kadr"}},{_id:0,name:1,coins:1}).exec()
    let points = req.body
    for(let pat in pats){
      if(pats.hasOwnProperty(key)){
        pat.coins += points[pat]//the requset contains the patrol names as written in the DB with their scores 
      }
    }
    Promise.all(pats.map(pat =>pat.save()))
  }else{
    return res.status(401).send({message:"must be a chef to update score"})
  }
}else{
  return res.status(403).send({message:"must be logged in to do this action"})
}
}

async function getharvest(req,res){
  try{
  let patrol = await Patrol.find({"name":{$ne:"kadr"}},{
    name:1,
    "soils.apple":1,
    "soils.watermelon":1,
    "soils.wheat":1,
    farming:1,
    _id:0
  }).exec()
  let pats = patrol.reduce((acc,p)=>{
    if(p.farming){
    acc[p.name]={
      "watermelon":p.soils.watermelon,
      "apple":p.soils.apple,
      "wheat":p.soils.wheat
    };
  }else{
    acc[p.name] = {
      "watermelon":0,
      "apple":0,
      "wheat":0
    }
  }
    return acc;
  },{})
  return res.status(200).send({"patrols":pats})
}catch(err){
  console.log(err)
  return res.status(500).send({message:"error in getting harverst data please try again later"})
}
}

async function watering(req,res){
  let id = req.id
  let chef = await Scout.findById(id).exec()
  if(!chef){
    return res.status(404).send({message:"chef not found"})
  }
  let chPat = await Patrol.findById(chef.patrol,{name:1,_id:0}).exec()
  if(chPat.name == "kadr"){
  let pat = req.patrol
  let patrol = await Patrol.findOne({name:pat},{_id:1,farming:1}).exec()
  if(patrol){
  if(patrol.farming){
    return res.status(400).send({message:"this patrol has already watered their plants"})
  }else{
    patrol.farming = true
    await Patrol.save()
    return res.status(200).send({message:"the plants were watered successfully"})
  }
}else{
  return res.status(403).send({message:"must be a chef to water the plants"})
}
}else{
  return res.status(400).send({message:"this patrol doesn't exist"})
}
}

async function harvest(req, res) {
  try{
  let farmings = await Patrol.find({name:{$ne : "kadr"}},{
    _id:1,
    farming:1
  }).exec()
  let kadrID = await Patrol.find({name : "kadr"},{_id:1}).exec()
  let pats = farmings.reduce((acc,pat)=>{
    acc[pat._id] = pat.farming
    return acc
  },{})
  let landArr  = await Land.find({patrol_ID : {$ne : kadrID}})//reduce the number of lands by excluding the leaders' lands
  landArr.forEach((element)=>{
    if(pats[element.patrol_ID]){
      element.inventory.apple += element.soils.apple
      element.inventory.watermelon += element.soils.watermelon
      element.inventory.wheat += element.soils.wheat
    }
  })
  let chuncksize = 10 //this is chunck size saves to reduce the risk of overloading the connections with the databases
  for(let i = 0; i < landArr.length(); i += chuncksize){
    let chunck = landArr.slice(i , i + chuncksize)
    await Promise.all(chunck.map(land => land.save()))
  }
  farmings.forEach((element) => {element.farming = false})
  await Promise.all(farmings.map(pat => pat.save()))
  res.status(200).send({message:"harvest done successfully"})
}
catch(err){
    console.log(err)
    res.status(500).send({message:"error in harvesting please try again later"})
  }
}


module.exports = {view_scores,getharvest,harvest,watering,update_scores}