const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    scheduledDateTime: Date,
    title: { type: String, required: true },
    body: String,
    userEmail: String,
    percentProgress: Number,
    emailNotification: Boolean,
    display: {type: Boolean, default: true},
    reminder_id: { type: String, required: true }
})

module.exports = mongoose.model('Notification', notificationSchema);