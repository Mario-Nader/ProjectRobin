const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = 3000;
const {connectDB} = require('./DB.js');
const authRoute = require('./routes/authRoutes.js')
const usersRoute = require('./routes/usersRoutes.js')
const todoRoute = require('./routes/todoRoutes.js')
app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
app.use(cookieParser());
app.use(express.json());
app.use('/user',usersRoute)
app.use('/todo',todoRoute)
app.use('/auth',authRoute)


