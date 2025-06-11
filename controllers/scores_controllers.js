const patrol = require('../modules/patrol_module')
const scout = rqeuire('../modules/scout_module')
const assets = require('../modules/assets_module')
async function view_scores(req,res){
  let  patrols = await patrol.find({"name":{$ne:"kadr"}}).exec();
  return patrols
}


async function update_scores(req,res){
  let user = scout.findById(req.id);
  if(user.chef == true){
    let num = req.num;
    let pat_name = patrol;
    let patrol = await patrol.find({name:patrol_name}).exec()
    patrol.coins = patrol.coins + num;
    await patrol.save();
  }else{
    res.status(401).send({
      message:"unauthorized access"
    })
  }
}


async function buy(req,res){
  let user = scout.findById(req.id);
  if(user.cp == true){
      let quantity = parseInt(req.quantity);
      let type = await assets.find({asset:req.type}).exec();
      let pat = await patrol.find({name:req.name}).exec();
      if(!type){
        res.status(400).send({
          message:"this asset don't exist"
        })
      }
      if(!pat){
        res.status(400).send({
          message:"this patrol doesn't exist"
        })
      }
      if(pat.coins >= (type.cost * quantity)){
        pat.coint = pat.coing - (type.cost * quantity);
        let item = assetMap(type.asset)
        pat[item] = pat[item] + quantity
        await pat.save();
        res.status(200).send({
          message:"purchase done successful"
        })
      }
  }else{
        res.status(401).send({
          message:"unautherized access"
        })
  }
}



function assetMap(name){
 switch(name) {
  case soldier:
    return "tot_sol";
  case horse:
    return "tot_horses"
  case cart:
    return "tot_carts"
  case workshop:
    return "tot_workshops"
  case house:
    return "tot_houses"
  default:
    return name
}
}


module.exports = {view_scores,update_scores,buy}
