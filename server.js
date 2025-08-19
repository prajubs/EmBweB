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
app.use(express.static('public')); // frontend (HTML, CSS, JS) goes here

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // App Password
    }
});

// Verify transporter
transporter.verify((err, success) => {
    if (err) {
        console.error('❌ Error with email transporter:', err);
    } else {
        console.log('✅ Server is ready to send emails');
    }
});

// Endpoint to receive project request
app.post('/send-project', (req, res) => {
    const { name, email, message, budget, refLink } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: "Sender email is required!" });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // show project sender name
        to: process.env.EMAIL_USER,                   // your email to receive
        replyTo: email,                               // reply goes to sender
        subject: `New Project Request from ${name}`,
        text: `
        Project Name: ${name}
        Sender Email: ${email}
        Description: ${message}
        Budget: ${budget}
        Reference Link: ${refLink}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sending email:', error);
            res.json({ success: false });
        } else {
            console.log('✅ Email sent: ' + info.response);
            res.json({ success: true });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
