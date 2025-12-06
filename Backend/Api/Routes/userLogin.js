const bodyParser = require("body-parser")
const express = require("express")
const { default: mongoose } = require("mongoose")
const userLogin = require("../Model/userLogin")
const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

const dirName = `${__dirname}/cb1.png`
const svgData = fs.readFileSync(dirName)

router.get("/", async (req, res) => {
  try {
    const usersLogin = await userLogin.find().select('-password')
    res.status(200).json(usersLogin)
  } catch (err) {
    res.status(404).json({
      message: err.message,
    })
  }
})

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userLogin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // HASH PASSWORD HERE
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userLogin({
      name,
      email,
      password: hashedPassword // Save the hash, not the plain text
    });
    await newUser.save();
    
    // ... (Keep your email logic here) ...
    
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
    
    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    let htmlContent = `
    <html>
      <head>
        <style>
          body {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #cccccc;
            border-radius: 8px;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .header {
            background-color: #009270;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .footer {
            background-color: #f8f8f8;
            padding: 10px;
            text-align: center;
          }
          img.header-image {
            width: 100%;
            max-width: 100px;
            height: auto;
            filter: brightness(0) invert(1);
          }
          i {
            font-family:'Trebuchet MS', sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:cricbuzzImage" class="header-image" alt="Header Image">
        </div>
        <div class="content">
          <b>Hello ${name},</b><br>
          <br>
          You have successfully signed up...!<br>
          <i>Welcome to Cricbuzz web and enjoy the website's features.</i>
        </div>
        <div class="footer">
          <p>Created by Author: &copy; <i>Aesha Bhavsar</i> 2025</p>
        </div>
      </body>
    </html>`
    
    await transporter.sendMail({
      from: `"Cricbuzz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Successfully Signup Confirmation Cricbuzz.",
      html: htmlContent,
      attachments: [{
        filename: "cb1.png",
        content: svgData,
        contentType: "image/svg+xml",
        cid: "cricbuzzImage",
      }],
    })
    
    res.status(201).json({message: 'User created successfully.'})
    
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  const {email, password} = req.body

  try {
    const user = await userLogin.findOne({email})
    
    if (!user) {
      return res.status(400).json({message: 'User not found'})
    }
    
    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password not match" })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    
    res.status(200).json({ 
      message: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
