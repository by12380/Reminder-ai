const mongoose = require('mongoose');
const moment = require('moment');

const reminderSchema = mongoose.Schema({
    title: { type: String, required: true },
    dueDate: Date,
    startDate: Date,
    memo: String,
    emailNotification: Boolean,
    setAlert: Boolean,
    progressAlert: String,
    user_id: String
})

reminderSchema.methods.getPercentProgress = function(){
    const dueDate = moment(this.dueDate);
    const startDate = moment(this.startDate);
    if (this.startDate) {
        return moment().diff(startDate) * 100 / dueDate.diff(startDate);
    }
    if(moment().diff(dueDate) > 0){
        return 100;
    }
    return 0;
}

reminderSchema.methods.serialize = function(){
    return {
        id: this.id,
        title: this.title,
        dueDate: this.dueDate,
        startDate: this.startDate,
        memo: this.memo,
        emailNotification: this.emailNotification,
        setAlert: this.setAlert,
        progressAlert: this.progressAlert,
        percentProgress: this.getPercentProgress()
    }
}

module.exports = mongoose.model('Reminder', reminderSchema);