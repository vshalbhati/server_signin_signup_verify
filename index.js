const express = require('express');
const port = 3000;

const app = express();
const bodyParser = require('body-parser');

require('./db');
require('./models/User');


const authRoutes = require('./routes/authRoutes');
const requireToken = require("./Middlewares/AuthTokenRequired");

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.json());
app.use(authRoutes);

app.get('/', requireToken, (req, res) => {
    res.send('This is home page');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})