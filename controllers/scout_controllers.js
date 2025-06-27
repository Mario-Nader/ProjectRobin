const Patrol  = require('../modules/patrol_module')
const Land = require('../modules/Land_module')


async function view_scores(req,res){
  let  patrols = await Patrol.find({"name":{$ne:"kadr"}}).exec();
  let lands = await Land.find().exec()
  res.status(200).send({"patrols":patrols,"lands":lands})
}

module.exports = {view_scores}