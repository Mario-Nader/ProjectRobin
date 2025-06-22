const Patrol = require("../modules/patrol_module")
const lands = require("../modules/Land_module")
const assets = require("../modules/assets_module")
const scouts = require("../modules/scout_module")

async function buy(req,res){//need to add comment here
  let user = scout.findById(req.id);//grab the user by the ID
  if(user.cp == true){//if the user is a cp he can buy items by using the patrols resources 
      let quantity = parseInt(req.quantity);//extracting the type and quantity from the request
      let type = await assets.find({asset:req.type}).exec();
      let pat = await patrol.find({name:req.name}).exec();
      if(!type){
        res.status(400).send({
          message:"this asset doesn't exist"
        })
      }
      if(!pat){
        res.status(400).send({
          message:"this patrol doesn't exist"
        })
      }
      if(pat.coins >= (type.cost * quantity)){//check the balance of the patrol to see if it is sufficient
        let item = assetMap(type.asset)
        if(item == "tot_workshops" | item == "tot_sol" |item == "tot_houses"| item  == "soil" | item == "watermelon" |item == "wheat" | item == "apple"){//dealing with land specific purchases
          let land = lands.findOne({land_no:req.landno})//the request will contain the land number
          if(item == "tot_workshops"){
                if(land.workshop == true){
                  res.status(400).send({
                    message:"the land has already a workshop"
                  })
                }else{
                  if(quantity != 1){
                    res.status(400).send({message:"you can't buy more than one workshop in one land"})
                  }else{
                    land.workshop = true;
                    pat.tot_workshops = pat.tot_workshops + 1
                  }
                }
          }else if(item == "tot_sol"){
                 land.soldiers = land.soldiers + quantity;
                 pat.tot_sol = pat.tot_sol + 1;
          }else if(item == "tot_houses"){// may need to change to make the chef controll the adding of houses not the cp
                  if(land.houses < 3){
                    land.houses = land.houses + quantity;
                    pat.tot_houses = pat.tot_houses + quantity;
                  }else{
                    res.status(400).send({
                      message:"the houses are already maximum on this land"
                    })
                  }
                }
          else if(item == "watermelon"){
                  land.inventory.watermelon = land.inventory.watermelon + quantity;
                  pat.watermelon += quantity;
          }else if(item == "wheat"){
                  land.inventory.wheat = land.inventory.wheat + quantity;
                  pat.wheat+=quantity;
          }else if (item == "apple"){
                  land.inventory.apple = land.inventory.apple + quantity;
                  pat.apple += quantity
          }else if(item == "soil"){
            if(land.soil_no < 5){
                    if(land.soil_no + quantity > 5){
                      res.status(400).send({
                        message: "the quantity is more than the allowed limit of soils in one land"
                      })
                    }else{
                      land.soil_no = land.soil_no + quantity;
                      land.crops.empty = land.crops.empty + quantity 
                      pat.tot_soil += quantity
                      pat.soils.empty += quantity
                    }
                  }else{
                    res.status(400).send({
                      message:"the soil limit in this land was reached"
                    })
                  }
                }
        }else{
          pat[item] = pat[item] + quantity  //incrementing the items
        }   
        pat.coins = pat.coins - (type.cost * quantity);
        await land.save();
        await pat.save();
        res.status(200).send({
          message:"purchase done successful"
        })
      }else{//if the balance in not sufficient
        res.status(401).send({
          message:"no enough coins"
        })
      }
  }else{
        res.status(401).send({
          message:"unautherized access"
        })
  }
}

function assetMap(name){//map the name in the assets with the names in the patrol module the work with the buy function
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
//process
async function transport(req,res)
{
    let id = req.id
    let user = await scouts.findById(id).exec()
if(user){
    if(user.cp == true){//if the user is a cp he can preform the action
    let patrolName = req.patrol
    let pat = await Patrol.findOne({name:patrolName}).exec();
    let initialNo = req.intialLand
    let finalNo= req.finalLand
    let initial = await lands.findOne({land_no : initialNo}).exec()
    let final = await lands.findOne({land_no : finalNo}).exec()
    if(initialNo == finalNo){//if both numbers are equal
      res.status(400).send({message:"both lands are the same land"})
    }else if(initial.patrol_ID != pat._id && final.patrol_ID != pat._id){//the two lands are not owned by the patrol
          res.status(400).send({
              message:"the patrol doesn't own both lands"
          })
      }else if(intial.patrol_ID != pat._id){//the inital land only is not owned by the patrol
          res.status(400),send({
              message:"the patrol doesn't own the inital land"
          })
      }else if(final.patrol_ID != pat._id){//the final land is not owned by the patrol
          res.status(400).send({message:"the patrol doesn't own the final land"})
      }else if(pat.tot_horses < horses || pat.tot_carts < carts || pat.rentCart < rentCarts || pat.rentHorse < rentHorses){//the patrol doesn't have the required means
          res.status(400).send({message:"patrol doesn't have the given number of means"})
      }else{
          let typeName = req.typeName
          let type = await assets.findOne({asset : typeName}).exec()
          let quantity = req.quantity
          let horses = req.horses
          let rentHorses = req.rentHorses
          let carts = req.carts
          let rentCarts = req.rentCarts
          if(type.asset == "soldier"){
              if(initial.soldiers <= quantity){//the land doesn't have enough soldiers to send and keep at least one soldier in the land
                  res.status(400).send({message:"the inital land doesn't have enough resources"})
              }else{// calculating the needed power for soldiers
                  let neededPower = quantity
                  let power = horses + rentHorses + (carts * 5)  +  (rentCarts * 5)
              }
              if(neededPower > power){//if the trasportation means don't cover the needed power
                res.status(400).send({message:"the transportation power is not enough"})
              }
          }else{
              if(initial.inventory[type.asset] < quantity){//the land doesn't have enough resources to send
                  res.status(400).send({
                      message:"the intial land doesn't have enough resources"
                  })
              }else{//calculating needed and provided power to trasnport (wheat / apple / watermelon)
                  let neededPower = quantity
                  let power = horses + rentHorses + (carts * 3)  +  (rentCarts * 3)
              }
              if(neededPower > power){//if the trasportation means don't cover the needed power
                res.status(400).send({message:"the transportation power is not enough"})
              }else{
                  if(power - neededPower >= 3 && (carts + rentCarts) != 0){// if cart(s) can be removed and still cover the power needed
                  let removed  = (power - neededPower) / 3
                  res.status(400).send({message:`you can remove at least ${removed} carts`})
              }else if(power - neededPower >= 1 && (horses + rentHorses) != 0){// if horse(s) can be removed and still cover the power needed
                  let removed  = power - neededPower
                  res.status(400).send({message:`you can remove at least ${removed} horses`})
              }else{// subtracting the used rent items as it is one-use only
                  initial.inventory[type.asset] -= quantity
                  final.inventory[type.asset] += quantity
                  await inital.save()
                  await final.save()
                  pat.rentHorse -= rentHorses
                  pat.rentCart -= rentCarts
                  await pat.save()
                  res.status(204).send({message:"was transported successfully"})
              }
              }
          }
      }
    }else{//if the user is not a CP he can't preform the action
        res.status(403).send(
            {
                message:"must be a CP to enter"
            }
        )
    }
}else{// if the user is not logged in at all
    res.status(401).send({message:"you must be logged in to perform the action"})
}
}

async function singleLandResources(landNo){
  try{
  let land = await lands.findOne({land_no:landNo}).exec()
  let landData = {
    "apple":land.inventory.apple,
    "watermelon":land.inventory.watermelon,
    "wheat":land.inventory.wheat,
    "soldiers":land.soldiers
  }
  return landData
  }catch(err){
    console.log(err)
  }

}

async function twoLandsResources(req,res) {
  try{
  let starting = await singleLandResources(req.initialLandNo)
  let finishing = await singleLandResources(req.finalLandNo)
  }catch(err){
    console.log(err)
    res.status(500).send({message:"internal server error in the twoLandsResources"})
  }
}


module.exports = {buy, transport}