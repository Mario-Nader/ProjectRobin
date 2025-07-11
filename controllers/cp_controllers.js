const Land = require("../modules/Land_module")
const Patrol = require("../modules/patrol_module")
const Asset = require("../modules/assets_module")
const Scout = require("../modules/scout_module")

async function buy(req,res){//need to add comment here
  console.log(req.body.landNo)
  const landNumber = parseInt(req.body.landNo)
  console.log(landNumber)
  let land = null
  let user = await Scout.findById(req.id).exec();//grab the user by the ID
  // //if the user is a cp he can buy items by using the patrols resources 
    let quantity = parseInt(req.body.quantity);//extracting the type and quantity from the request
    let type = await Asset.findOne({asset:req.body.type}).exec();
    let pat = await Patrol.findOne({_id : user.patrol}).exec();
    if (landNumber !== 0){
     land = await Land.findOne({land_no:landNumber}).exec()//the request will contain the land number
     console.log(land)
    }
    if(!type){
      return res.status(400).send({
        message:"this asset doesn't exist"
      })
    }
    if(!pat){
      return res.status(400).send({
        message:"this patrol doesn't exist"
      })
    }
    console.log("")
    if(pat.coins >= (type.cost * quantity)){//check the balance of the patrol to see if it is sufficient
      let item = assetMap(type.asset)
      if(item == "tot_workshops" | item == "tot_sol" |item == "tot_houses"| item  == "soil" | item == "watermelon" |item == "wheat" | item == "apple"){//dealing with land specific purchases
        if(landNumber == 0){
          return res.status(400).send({message:"you need land number to purchase this item"})
        }
        if(!land.patrol_ID.equals(pat.id)){
          return res.status(400).send({message:"this patrol doesn't own this land"})
        }
        if(item == "tot_workshops"){
              if(land.workshop == true){
                res.status(400).send({
                  message:"the land has already a workshop"
                })
              }else{
                if(quantity != 1){
                  res.status(400).send({message:"you can't buy more than one workshop in one land"})
                }else if(land.workshop == true){
                  return res.status(400).send({message:"you can't build another workshop in this land"})
                }
                else{
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
                    land.soils.empty = land.soils.empty + quantity 
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
      if(landNumber !== 0){
      await land.save();
      }
      await pat.save();
      res.status(200).send({
        message:"purchase done successful"
      })
    }else{//if the balance in not sufficient
      res.status(401).send({
        message:"no enough coins"
      })
    }
 
}

async function getBuy(req,res){
  try{
  let pat = await Patrol.findOne({name : req.patrol}).exec()
  let quantity = req.body.quantity
  let type =  req.body.type
  let asset = await Asset.findOne({asset : type}).exec()
  let cost  = asset.cost * quantity
  return res.status(200).send({"cost" : cost , "coins": pat.coins})
  }catch(err){
    console.log(err.message)
    return res.status(500).send({message:"error in getBuy"})
  } 
}

//must do a function that return all the costs on the get method on the /buy route
function assetMap(name){//map the name in the assets with the names in the patrol module the work with the buy function
 switch(name) {
  case "soldier":
    return "tot_sol";
  case "horse":
    return "tot_horses"
  case "cart":
    return "tot_carts"
  case "workshop":
    return "tot_workshops"
  case "house":
    return "tot_houses"
  default:
    return name
}
}

//process
async function transport(req,res)
{
  try{
    // let id = req.id
    // let user = await Scout.findById(id).exec()
    //if the user is a cp he can preform the action
    let patrolName = req.patrol
    let pat = await Patrol.findOne({name:patrolName}).exec();
    let initialNo = req.body.intialLand
    console.log(initialNo)
    let finalNo= req.body.finalLand
    let initial = await Land.findOne({land_no : initialNo}).exec()
    console.log(initial)
    let final = await Land.findOne({land_no : finalNo}).exec()
    if(initialNo == finalNo){//if both numbers are equal
      res.status(400).send({message:"both lands are the same land"})
    }else if( ! initial.patrol_ID.equals(pat._id) && ! final.patrol_ID.equals(pat._id)){//the two lands are not owned by the patrol
          res.status(400).send({
              message:"the patrol doesn't own both lands"
          })
      }else if(! initial.patrol_ID.equals(pat._id)){//the inital land only is not owned by the patrol
          res.status(400),send({
              message:"the patrol doesn't own the inital land"
          })
      }else if(! final.patrol_ID.equals(pat._id)){//the final land is not owned by the patrol
          res.status(400).send({message:"the patrol doesn't own the final land"})
      }else{
          let typeName = req.body.typeName
          let type = await Asset.findOne({asset : typeName}).exec()
          let quantity = req.body.quantity
          let horses = req.body.horses
          let rentHorses = req.body.rentHorses
          let carts = req.body.carts
          let rentCarts = req.body.rentCarts
          let neededPower
          let power
          if(pat.tot_horses < horses || pat.tot_carts < carts || pat.rentCart < rentCarts || pat.rentHorse < rentHorses){//the patrol doesn't have the required means
          return res.status(400).send({message:"patrol doesn't have the given number of means"})
        }
          if(type.asset == "soldier"){
              if(initial.soldiers <= quantity){//the land doesn't have enough soldiers to send and keep at least one soldier in the land
                  res.status(400).send({message:"the inital land doesn't have enough resources"})
              }else{// calculating the needed power for soldiers
                   neededPower = quantity
                   power = horses + rentHorses + (carts * 5)  +  (rentCarts * 5)
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
                   neededPower = quantity
                   power = horses + rentHorses + (carts * 3)  +  (rentCarts * 3)
              }
              if(neededPower > power){//if the trasportation means don't cover the needed power
                return res.status(400).send({message:"the transportation power is not enough"})
              }else{
                  if(power - neededPower >= 3 && (carts + rentCarts) != 0){// if cart(s) can be removed and still cover the power needed
                  let removed  = (power - neededPower) / 3
                  return res.status(400).send({message:`you can remove at least ${removed} carts`})
              }else if(power - neededPower >= 1 && (horses + rentHorses) != 0){// if horse(s) can be removed and still cover the power needed
                  let removed  = power - neededPower
                  return res.status(400).send({message:`you can remove at least ${removed} horses`})
              }else{// subtracting the used rent items as it is one-use only
                  initial.inventory[type.asset] -= quantity
                  final.inventory[type.asset] += quantity
                  await initial.save()
                  await final.save()
                  pat.rentHorse -= rentHorses
                  pat.rentCart -= rentCarts
                  await pat.save()
                  return res.status(204).send({message:"was transported successfully"})
              }
              }
          }
      }
  }catch(err){
    console.log(err)
    return res.status(500).send({message:"error in transport"})
  }

}



async function singleLandResources(landNo){
  try{
  let land = await Land.findOne({land_no:landNo}).exec()
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
  let starting = await singleLandResources(req.body.initialLandNo)
  let finishing = await singleLandResources(req.body.finalLandNo)
  console.log(starting)
  console.log(finishing)

  return res.status(200).send({starting,finishing})
  }catch(err){
    console.log(err)
    return res.status(500).send({message:"internal server error in the twoLandsResources"})
  }
}



async function getPlant(req,res){
  try{
  let land = await Land.findOne({land_no:req.body.landNo}).exec()
  let patrol = await Patrol.findOne({name:req.patrol}).exec()
  if(! land.patrol_ID.equals(patrol.id)){
    return res.status(400).send({message:`the ${(patrol.name).charAt(0).toUpperCase() + (patrol.name).slice(1)} does not own this land`})
  }if(req.body.landNo > 33 ||  req.body.landNo < 1){
    return res.status(400).send({message:"enter a valid land number"})
  }
  let landSoils = {
    "empty":land.soils.empty,
    "apple":land.soils.apple,
    "watermelon":land.soils.watermelon,
    "wheat":land.soils.wheat
  }
  let scout = await Scout.findById(req.id).exec()
  let pat = await Patrol.findById(scout.patrol).exec()
  let seeds = {
    "apple":pat.appleSeeds,
    "watermelon":pat.watermelonSeeds,
    "wheat":pat.wheatSeeds
  }
  res.status(200).send({
    "landSoil":landSoils,
    "seeds":seeds
  })
}catch(err){
  console.log(err)
  res.status(500).send({message:"an error happened in getplant please try again later"})
}
}


function seedMap(seedName){
  switch(seedName){
    case "wheatSeeds":
      return "wheat"
    case "appleSeeds":
      return "apple"
    case "watermelonSeeds":
      return "watermelon"
    default:
      return "invalid"
  }
}



async function plant(req,res){
  let landnum = req.body.landNo
  let land = await Land.findOne({land_no : landnum}).exec()
  let targetSoil = req.body.targetSoil
  let targetSeed = req.body.targetSeed//the target seed name will come in plural form in the request
  let seedType = seedMap(targetSeed)
  let pat = await Patrol.findOne({name : req.patrol}).exec()
  console.log(req.patrol)
  if(pat[targetSeed] == 0){
    return res.status(400).send({message:"the patrol has no seeds of that kind"})
  }else if(land.soils[targetSoil] == 0){
    return res.status(400).send({message:"the land doesn't have that kind of soil"})
  }else if(seedType == targetSoil){
   return res.status(400).send({message:"the soil is already of that kind"})
  }else{
    if(seedType == "invalid"){
      res.status(400).send({message:"the seed type is invalid"})
    }else{
      pat[targetSeed] -= 1
      land.soils[targetSoil] -= 1
      pat.soils[targetSoil] -= 1
      land.soils[seedType] += 1
      pat.soils[seedType] += 1
      await pat.save()
      await land.save()
      return res.status(200).send({message:"planting is done successfully"})
      }
  }
}



async function watering(req,res){//watering may end up in the chef controllers
  let patrol = await Patrol.findOne({name:req.patrol}).exec()
  let watering = await Asset.findOne({asset:"farming"}).exec()
  if(patrol.farming){
    res.status(400).send({message:"the patrol already watered it's plants"})
  }else if(patrol.coins < watering.cost){
    res.status(400).send({message:"the patrol doesn't have enough money for watering their plants"})
  }
  else{
    patrol.farming = true
    patrol.coins -= watering.cost
    await patrol.save()
    res.status(200).send({message:"the plants were watered successfully"})
  }
}



async function viewMap(){
  let landArr = await Land.find().exec()
  return landArr;  
}

async function getAttackKadr(req,res){
  try{
  let patName = req.patrol
  let patrol = await Patrol.findOne({name : patName}).exec()
  let attackedLand = await Land.findOne({land_no : req.body.landNo}).exec()
  let land = await Land.findOne({land_no : req.body.attackedLand})
  let conditions = attackedLand.conditions
  let qualifications = {}
  qualifications.soldiers = patrol.tot_sol
  qualifications.houses = patrol.tot_houses
  qualifications.inLandSoldiers = land.soldiers
  qualifications.coins = patrol.coins
  return res.status(200).send({"conditions":conditions ,"qualifications":qualifications})
  }catch(err){
    console.log(err.message)
    return res.status(500).send({message:"error in getAttackKadr functions"})
  }
}

async function attackKadr(req,res){
  try{
  let land = await Land.findOne({land_no : req.body.landNo}).exec()
  let attackedLand = await Land.findOne({land_no : req.body.attackedLand})
  let kadr = await Patrol.findOne({name : "kadr"}).exec()
  if(! land.patrol_ID.equals(kadr.id)){
    return res.status(400).send({message : "the land doesn't belong to kadr"})
  }
  let patrol = await Patrol.findOne({name : req.patrol}).exec()
  let conditions = land.conditions
  let qualifications = {}
  qualifications.soldiers = patrol.tot_sol
  qualifications.houses = patrol.tot_houses 
  qualifications.lands = patrol.tot_lands
  qualifications.coins = patrol.coins
  let quals = ["soldiers" , "apples", "wheats","watermelons", "soils",
    "houses","lands","coins"]
  let qualified = ! (quals.some(element=>{
    return(qualifications[element] < conditions[element])
  }))
  if(! qualified){
    return res.status(400).send({message:"you are not qualified"})
  }else{
    return attack(req,res)
  }
}catch(err){
  console.log(err.message)
  return res.status(500).send({message : "error in attackKadr"})
}
}



// async function checkAttack(req,res){
//   let landNo = req.body.landNo
//   let land = await Land.findOne({land_no : landNo}).exec()
//   let kadr = await Patrol.findOne({name : "kadr"}).exec()
//   if(land.patrol_ID.equals(kadr.id)){
//     return 
//   }
// }

async function attack(req,res){
  try{
  let {initialL,attackedL,initalPatrol,attackedPatrol} = req.body
  let initialLand = await Land.findOne({land_no : initialL}).exec()
  let attackedLand = await Land.findOne({land_no : attackedL}).exec()
  let initialPat = await Patrol.findOne({name:initalPatrol}).exec()
  let attackedPat = await Patrol.findOne({name:attackedPatrol}).exec()
  let adjacent = initialLand.adjacent
  let adj = adjacent.some(element => element === attackedLand.land_no)
  if(!adj){
    return res.status(400).send({message:"the two lands are not adjacent"})
  }
  if(req.patrol !== initialPat.name){
    return res.status(400).send({message:"you don't belong to this patrol"})
  }else if(! initialPat._id.equals(initialLand.patrol_ID)){
    return res.status(400).send({message:"the patrol doesn't own this land"})
  }else if(initialLand.soldiers - attackedLand.soldiers < 2){
    return res.status(400).send({message:"not enough soldiers to attack"})
  }else{
    let soldiers = initialLand.soldiers
    soldiers -= attackedLand.soldiers
    attackedPat.tot_sol -= attackedLand.soldiers
    initialPat.tot_sol -= attackedLand.soldiers
    if(soldiers % 2 == 0){
      initialLand.soldiers = soldiers / 2
      attackedLand.soldiers = soldiers / 2
    }else{
      initialLand.soldiers = Math.floor(soldiers / 2) + 1
      attackedLand.soldiers = Math.floor(soldiers / 2)
    }
    attackedLand.patrol_ID = initialPat._id
    attackedPat.tot_lands -= 1
    initialPat.tot_lands += 1
    attackedPat.tot_soil -= attackedLand.soil_no
    initialPat.tot_soil += attackedLand.soil_no
    attackedPat.tot_houses -= attackedLand.houses
    initialPat.tot_houses += attackedLand.houses
    if(attackedLand.workshop){
      initialPat.tot_workshops += 1
      attackedPat.tot_workshops -= 1
    }
    initialPat.wheat += attackedLand.inventory.wheat
    initialPat.apple += attackedLand.inventory.apple
    initialPat.watermelon += attackedLand.inventory.watermelon
    attackedPat.wheat -= attackedLand.inventory.wheat
    attackedPat.apple -= attackedLand.inventory.apple
    attackedPat.watermelon -= attackedLand.inventory.watermelon
    initialPat.soils.apple += attackedLand.soils.apple
    initialPat.soils.wheat += attackedLand.soils.wheat
    initialPat.soils.watermelon += attackedLand.soils.watermelon
    initialPat.soils.empty += attackedLand.soils.empty
    attackedPat.soils.apple -= attackedLand.soils.apple
    attackedPat.soils.wheat -= attackedLand.soils.wheat
    attackedPat.soils.watermelon -= attackedLand.soils.watermelon
    attackedPat.soils.empty -= attackedLand.soils.empty
    initialPat.fed += attackedLand.fed
    attackedPat.fed -= attackedLand.fed
    await attackedLand.save()
    await attackedPat.save()
    await initialLand.save()
    await initialPat.save()
    return res.status(200).send({message:"the attack was done successfully"})
  }
}catch(err){
  console.log(err)
  return res.status(500).send({message:"error in the attack function"})
}
}



async function feeding(req,res){
  let {numberOfHouses,landNo,watermelon,apple,wheat} = req.body
  let land = await Land.findOne({land_no : landNo}).exec()
  let user = await Scout.findOne({_id : req.id}).exec()
  let patrol = await Patrol.findOne({_id : user.patrol}).exec()
  if(! land.patrol_ID.equals(patrol._id)){
    return res.status(400).send({message : "this patrol doesn't own this land"})
  }
  if(numberOfHouses > land.houses || numberOfHouses < 0 || numberOfHouses > (land.houses - land.fed)){
    return res.status(400).send({message:"invalid number of houses"})
  } 
  let unfed = land.houses - land.fed
  if(unfed === 0){
    return res.status(400).send({
      message:"the land is already fed"
    })
  }
  let neededFood = unfed * 5
  let food = (watermelon * 4) + (wheat) + (apple * 2)
  if(neededFood > food){
    return res.status(400).send({message:"not enough food"})
  }
  if(land.inventory.apple < apple || land.inventory.wheat < wheat || land.inventory.watermelon < watermelon){
    return res.status(400).send({message:"you don't have enough resources in this land"})
  }
  let exceeded = {
    watermelons:0,
    apples:0,
    wheats:0
  }
  if(neededFood < food){
    let ex = 0;
    if(food - neededFood > 4 && watermelon > 0){
      ex = parseInt(food - neededFood / 4)
      if (watermelon >= ex){
        exceeded.watermelons = ex
      }else{
        exceeded.watermelons = watermelon
      }
      food -= exceeded.watermelons * 5
    }
    if(food - neededFood > 2 && apple > 0){
      ex = parseInt(food - neededFood / 2)
      if (apple >= ex){
        exceeded.apples = ex
      }else{
        exceeded.apples = apple
      }
      food -= exceeded.apples * 2
    }
    if(food - neededFood > 1 && wheat > 0){
      ex = parseInt(food - neededFood)
      if (wheat >= ex){
        exceeded.wheats = ex
      }else{
        exceeded.wheats = wheat
      }
      food -= exceeded.wheats
    }
    return res.status(400).send({message:"you could remove all of these crops","exceeded":exceeded})
  }else{
    land.fed += numberOfHouses
    patrol.fed += numberOfHouses
    await land.save()
    await patrol.save()
    return res.status(200).send({message:"feeding done successfully"})
  }

  
}



module.exports = {buy,transport,twoLandsResources,getPlant,plant,watering,feeding,attack,getAttackKadr,getBuy,attackKadr}