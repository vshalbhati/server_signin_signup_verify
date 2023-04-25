const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model("User");
require('dotenv').config();
const app = express();



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({error: "You must be loggin in, key not given"});
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload)=>{
        if(err){
            return res.status(401).json({error: "You must be logged in, token invalid"});
        }

        const {_id} = payload;
        User.findById(_id).then(userdata =>{
            req.user = userdata;
            next();
        })
    });
}