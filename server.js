require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // if you keep your HTML/CSS in public folder

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Verify transporter
transporter.verify((err, success) => {
    if (err) {
        console.error('Error with email transporter:', err);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Endpoint to receive project request
app.post('/send-project', (req, res) => {
    const { name, message, budget, refLink } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // receive in same email
        subject: `New Project Request from ${name}`,
        text: `Project Name: ${name}\nProject Description: ${message}\nBudget: ${budget}\nReference Link: ${refLink}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.json({ success: false });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ success: true });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
