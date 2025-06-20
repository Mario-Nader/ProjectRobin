


async function view_scores(req,res){
  let  patrols = await patrol.find({"name":{$ne:"kadr"}}).exec();
  return patrols
}