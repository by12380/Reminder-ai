const mongoose = require('mongoose');

const scheduledEmailSchema = mongoose.Schema({
    scheduledDateTime: Date,
    subject: { type: String, required: true },
    body: String,
    sender: String,
    receiver: String,
    reminder_id: { type: String, required: true }
})

module.exports = mongoose.model('ScheduledEmail', scheduledEmailSchema);