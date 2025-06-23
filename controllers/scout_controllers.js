const patrol  = require('../modules/patrol_module')
const land = require('../modules/Land_module')


async function view_scores(req,res){
  let  patrols = await patrol.find({"name":{$ne:"kadr"}}).exec();
  let lands = await land.find().exec()
  res.status(200).send({"patrols":patrols,"lands":lands})
}

module.exports = {view_scores}