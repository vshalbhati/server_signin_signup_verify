const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

require('dotenv').config();


async function mailer(receiveremail, code) {
    let transporter = nodemailer.createTransport({
      name:'example.com',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "kidtomen@gmail.com", // generated ethereal user
        pass: "lamluqgvxpihmrui", // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'contrv', // sender address
      to: `${receiveremail}`, // list of receivers
      subject: "Signup Verification", // Subject line
      text: `Your verification code is ${code}`, // plain text body
      html: `<b> Your verification code is ${code}</b>`, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

router.post('/signup', async (req,res) =>{
    // res.send('This is signup page');
    // console.log('send by client -', req.body);
    const {username, email, password} = req.body;
    User.findOne({email : email})
      .then(
        async(savedUser) =>{
            if(savedUser){
                return res.status(422).send({error:"Invalid credentials"});
            }
            const user = new User({
                username,
                email,
                password
            })
            try{
                await user.save();
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
                res.send({message:"User Registered Successfully",token});
            }
            catch(err){
                console.log('db err ',err);
                return res.status(422).send({error: err.message});
            }
        }
      )
})

router.post('/verify',(req,res) =>{
    console.log('send by client -', req.body);
    const {username, email, password} = req.body;
    if(!username|| !email || !password){
        return res.status(422).send({error:"Please fill all the info"});
    }

    User.findOne({email : email})
      .then(
        async(savedUser) =>{
            if(savedUser){
                return res.status(422).send({error:"Invalid credentials"});
            }
            try {
                
                let verificationCode = Math.floor(100000 + Math.random() * 900000); 
                let user = [
                    {
                        username,
                        email,
                        password,
                        verificationCode,
                    }
                ]
                await mailer(email, verificationCode);
                res.send({message: "Verification code has been sent to your email!", udata : user});
            }
            catch(err){
                console.log(err);
            }
        }
      )

    
})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(422).json({ erro: "Any fiels is not fielding"});
    }
    const savedUser = await User.findOne({ email: email})

    if(!savedUser){
        return res.status(422).json({error: "Invalid credentials"});
    }

    try{
        bcrypt.compare(password, savedUser.password, (err, result) => {
            if(result){
                const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET);
                res.send({token});
            }
            else{
                return res.status(422).json({error: "Invalid credentials"});
            }
        })
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;