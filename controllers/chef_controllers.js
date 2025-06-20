


async function view_scores(req,res){
  let  patrols = await patrol.find({"name":{$ne:"kadr"}}).exec();
  return patrols
}

async function update_scores(req,res){
  let user = scout.findById(req.id);
  let Chefpat = patrol.findById(user.patrol)
  if(Chefpat.name == "kadr"){
    //num->incrementation or decrementation amound where the decremntation is presented as a negative amount
    //pat_name is the name of the patrol to extract the patrol from the database
    let num = req.num;
    let pat_name = req.patrol;
    let pat = await patrol.find({name:pat_name}).exec()
    //updating the coin amount of the patrol and saving the new coin amount
    pat.coins = pat.coins + num;
    await pat.save();
  }else{//the user is not a chef therfore don't have the premession to preforme such process
    res.status(401).send({
      message:"unauthorized access"
    })
  }
}