const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Reminder = require('../models/reminder');
const ScheduledEmail = require('../models/scheduled-email');
const fawn = require('fawn');

const router = express.Router();

router.get('/', ensureLoggedIn(), function(req, res){
    Reminder
        .find({user_id: req.user.id})
        .sort({ dueDate: 1 })
        .then( reminders => {
            res.status(200).json(reminders.map((reminder) => {
                return reminder.serialize();
            }));
        })
        .catch( () => { res.status(500).json({ message: 'Internal server error' })})
})

router.post('/', ensureLoggedIn(), function(req, res){

    const task = fawn.Task();
    const reminder = new Reminder({
        title: req.body.title,
        dueDate: req.body.dueDate,
        startDate: req.body.startDate,
        memo: req.body.memo,
        user_id: req.user.id
    });
    const scheduledEmails = createScheduledEmails(reminder, req);

    task.save('reminders', reminder);
    for (let scheduledEmail of scheduledEmails) {
        task.save('scheduledemails', scheduledEmail);
    }

    task
    .run()
    .then(() => { res.status(201).json(reminder) })
    .catch(err => { res.status(500).json({ message: 'Internal server error' }) });

})

function createScheduledEmails(reminder, req){
    const scheduledEmails = [];
    if(!reminder.startDate){
        const scheduledEmail = new ScheduledEmail({
            scheduledDateTime: reminder.dueDate,
            subject: `Reminder: ${reminder.title}`,
            body: reminder.memo,
            receiver: req.user.local.email,
            reminder_id: reminder.id
        })
        scheduledEmails.push(scheduledEmail);
    }
    return scheduledEmails;
}

module.exports = router;