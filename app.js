const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require("cors")
const app = express();
const port = 3000;
const {connectDB} = require('./DB.js');
const authRoute = require('./routes/authRoutes.js')
const cpRoute = require('./routes/cpRoutes.js')
const chefRoute = require('./routes/chefRoutes.js')
const scoutRoute = require('./routes/scoutRoutes.js')
const Scout = require('./modules/scout_module.js')
const mongoose = require('mongoose');

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.post("/test-scout", async (req, res) => {

console.log("▶ Connected:", mongoose.connection.readyState === 1 ? "Yes" : "No");
console.log("▶ Scout model is using collection:", Scout.collection.name);

const { name } = req.body;
console.log("▶ Name received from req.body:", name);

const allScouts = await Scout.find({});
console.log("▶ All scouts in DB:", allScouts.map(s => s.name));

const scout = await Scout.findOne({ name }).exec();
console.log("▶ Result of Scout.findOne({ name }):", scout);

res.json({ name, scout });

});

app.use('/Chef',chefRoute)
app.use('/CP',cpRoute)
app.use('/Scout',scoutRoute)
app.use('/authen',authRoute)

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
