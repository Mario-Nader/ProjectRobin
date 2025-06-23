const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = 3000;
const {connectDB} = require('./DB.js');
const authRoute = require('./routes/authRoutes.js')
const cpRoute = require('./routes/cpRoutes.js')
const chefRoute = require('./routes/chefRoutes.js')
const scoutRoute = require('./routes/scoutRoutes.js')
app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
app.use(cookieParser());
app.use(express.json());
app.use('/Chef',chefRoute)
app.use('/CP',cpRoute)
app.use('/Scout',scoutRoute)
app.use('/authen',authRoute)


