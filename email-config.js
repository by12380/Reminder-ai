const nodemailer = require('nodemailer');
const { GMAIL_USERNAME, GMAIL_PASSWORD } = require('./config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: GMAIL_USERNAME,
           pass: GMAIL_PASSWORD
    }
});

module.exports = { transporter };