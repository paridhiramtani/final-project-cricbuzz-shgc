const express = require("express");
const router = express.Router();
const userLogin = require("../Model/userLogin");
const nodemailer = require("nodemailer");
const fs = require("fs");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load image for email attachment
const dirName = `${__dirname}/cb1.png`;
// Check if file exists to prevent server crash if image is missing
let svgData = null;
try {
  svgData = fs.readFileSync(dirName);
} catch (error) {
  console.warn("Warning: Email attachment image (cb1.png) not found.");
}

// GET all users (Optional: Good for debugging, secure this in production!)
router.get("/", async (req, res) => {
  try {
    const usersLogin = await userLogin.find();
    res.status(200).json(usersLogin);
  } catch (err) {
    res.status(404).json({
      mesg: err.mesg,
    });
  }
});

// SIGNUP Route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await userLogin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user
    const newUser = new userLogin({
      name,
      email,
      password: hashedPassword // Save the hash, NEVER plain text
    });

    await newUser.save();
    
    // Send success response immediately so the UI doesn't wait for email
    res.status(201).json({ message: 'User created successfully.' });

    // 4. Send Email (Async)
    sendWelcomeEmail(name, email);

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await userLogin.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // 3. Generate JWT Token
        const token = jwt.sign(
            { email: user.email, userId: user._id, name: user.name },
            process.env.JWT_SECRET || 'fallback_secret_key', // Use .env
            { expiresIn: "1h" }
        );

        // Return token and success message
        res.status(200).json({ 
            msg: "Login success", 
            token: token,
            userId: user._id 
        });
    } else {
      return res.status(401).json({ msg: "Password not match" });
    }

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Helper Function for Sending Email
async function sendWelcomeEmail(name, email) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Skipping email: EMAIL_USER or EMAIL_PASS not set in .env");
        return;
    }

    let htmlContent = `<html>
      <head>
        <style>
        body { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #009270; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f8f8; padding: 10px; text-align: center; }
        img.header-image { width: 100px; filter: brightness(0) invert(1); }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:cricbuzzImage" class="header-image" alt="Cricbuzz">
        </div>
        <div class="content">
          <b>Hello ${name},</b><br><br>
          You have successfully signed up!<br>
          <i>Welcome to Cricbuzz web. Enjoy the features!</i>
        </div>
        <div class="footer">
          <p>&copy; 2025 Cricbuzz Clone</p>
        </div>
      </body>
    </html>`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Prepare attachments (only if image exists)
    const attachments = [];
    if (svgData) {
        attachments.push({
            filename: "cb1.png",
            content: svgData,
            contentType: "image/png", // Changed to image/png based on extension
            cid: "cricbuzzImage",
        });
    }

    try {
        let info = await transporter.sendMail({
            from: `"Cricbuzz Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Successfully Signup Confirmation",
            html: htmlContent,
            attachments: attachments,
        });
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = router;
