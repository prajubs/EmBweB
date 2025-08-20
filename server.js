require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // your Gmail
        pass: process.env.EMAIL_PASS,  // your App Password
    }
});

// Verify transporter
transporter.verify((err, success) => {
    if (err) {
        console.error('❌ Error with email transporter:', err);
    } else {
        console.log('✅ Mail server ready to send emails');
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to receive project request
app.post('/send-project', (req, res) => {
    const { name, mailid, projectname, message, budget, refLink } = req.body;

    if (!name || !mailid || !projectname) {
        return res.json({ success: false, error: "Missing required fields" });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // sender name (but from your email)
        to: process.env.EMAIL_USER,                   // you receive it
        replyTo: mailid,                              // if you hit reply → goes to sender
        subject: `📩 New Project Request: ${name}`,
        text: `
Name: ${name}
Mail ID: ${mailid}
Project Name: ${projectname}
Description: ${message}
Budget: ${budget}
Reference: ${refLink}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sending email:', error);
            res.json({ success: false, error: error.message });
        } else {
            console.log('✅ Email sent: ' + info.response);
            res.json({ success: true });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
