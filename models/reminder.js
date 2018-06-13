const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
    title: { type: String, required: true },
    dueDate: Date,
    startDate: Date,
    memo: String,
    user_id: String
})

module.exports = mongoose.model('Reminder', reminderSchema);