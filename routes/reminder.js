const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Reminder = require('../models/reminder');
const Notification = require('../models/notifications');
const fawn = require('fawn');
const moment = require('moment');
const { notificationScheduler } = require('../notificationScheduler');

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

    //Default due date is now
    if(!req.body.dueDate || !Date.parse(req.body.dueDate)) {
        req.body.dueDate = new Date();
    }

    //Default start date is null if exists
    if(req.body.startDate && !Date.parse(req.body.startDate)) {
        req.body.startDate = null;
    }


    const task = fawn.Task();
    const reminder = new Reminder({
        title: req.body.title,
        dueDate: req.body.dueDate,
        startDate: req.body.startDate,
        memo: req.body.memo,
        setAlert: req.body.setAlert,
        progressAlert: req.body.progressAlert,
        emailNotification: req.body.emailNotification,
        user_id: req.user.id
    });

    const notifications = createNotifications(reminder, req);

    task.save('reminders', reminder);
    for (let notification of notifications) {
        task.save('notifications', notification);
    }

    task
    .run()
    .then(() => {
        for (let notification of notifications){
            notificationScheduler.add(
                notification.id, notification.scheduledDateTime, notification.display, notification.emailNotification,
                notification.title, notification.body, notification.userEmail
            );
        }
        res.status(201).json(reminder)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' }) });

})

router.put('/:id', ensureLoggedIn(), async function(req, res){

    //Default due date is now
    if(!req.body.dueDate || !Date.parse(req.body.dueDate)) {
        req.body.dueDate = new Date();
    }

    //Default start date is null if exists
    if(req.body.startDate && !Date.parse(req.body.startDate)) {
        req.body.startDate = null;
    }

    const reminder = await Reminder.findById(req.params.id);
    const notifications = await Notification.find({reminder_id: req.params.id});

    if (!reminder) {
        res.status(404).json({ message: `Item with id: ${req.params._id} not found` });
    }

    const newReminder = new Reminder({
        title: req.body.title,
        dueDate: req.body.dueDate,
        startDate: req.body.startDate,
        setAlert: req.body.setAlert,
        progressAlert: req.body.progressAlert,
        memo: req.body.memo,
        emailNotification: req.body.emailNotification,
        user_id: req.user.id
    });
    const newNotifications = createNotifications(newReminder, req);

    const task = fawn.Task();
    //Remove old reminder and associated scheduled emails
    task.remove("reminders", {_id: reminder._id});
    task.remove("notifications", {reminder_id: req.params.id});
    //Create new reminder and assicuated scheduled emails
    task.save('reminders', newReminder);
    for (let notification of newNotifications) {
        task.save('notifications', notification);
    }
    task
    .run()
    .then(() => {
        for (let notification of notifications){
            notificationScheduler.remove(notification.id);
        }
        for (let notification of newNotifications){
            notificationScheduler.add(
                notification.id, notification.scheduledDateTime, notification.display, notification.emailNotification,
                notification.title, notification.body, notification.userEmail
            );
        }
        res.status(201).json(newReminder);
    })
    .catch(err => {
        res.status(500).json({ message: 'Internal server error' });
    });
})

router.delete('/:id', ensureLoggedIn(), async function(req, res){
    const reminder = await Reminder.findById(req.params.id);
    const notifications = await Notification.find({reminder_id: req.params.id});

    if (!reminder) {
        res.status(404).json({ message: `Item with id: ${req.params._id} not found` });
    }

    const task = fawn.Task();
    task.remove("reminders", {_id: reminder._id});
    task.remove("notifications", {reminder_id: req.params.id});
    task
    .run()
    .then(() => {
        for (let notification of notifications){
            notificationScheduler.remove(notification.id);
        }
        res.status(204).end();
    })
    .catch(err => {
        res.status(500).json({ message: 'Internal server error' });
    });
})

function createNotifications(reminder, req){
    const notifications = [];

    const start = moment(reminder.startDate);
    const due = moment(reminder.dueDate);
    const diff = due.diff(start);

    if(reminder.setAlert) {

        let fraction;
        switch(parseInt(progressAlertEnum.getValue(reminder.progressAlert))) {
            case 0:
                fraction = 2;
                break;
            case 1:
                fraction = 4;
                break;
            case 2:
                fraction = 5;
                break;
            case 3:
                fraction = 10;
                break;
        }

        let timeIncrement = diff / fraction;
        let percentIncrement = 100 / fraction;
        let percentProgress = percentIncrement;
        for (let i = 1; i < fraction; i++, percentProgress += percentIncrement) {
            let notification = new Notification({
                scheduledDateTime: start.add(timeIncrement),
                title: `${reminder.title}`,
                body: reminder.memo,
                userEmail: req.user.local.email,
                percentProgress: percentProgress,
                emailNotification: reminder.emailNotification,
                reminder_id: reminder.id
            })
            notifications.push(notification);
        }
    }

    //Defualt push notification at 70% progress
    if (reminder.startDate) {
        notifications.push(new Notification({
            scheduledDateTime: moment(reminder.startDate).add(diff*70/100),
            title: `${reminder.title}`,
            body: reminder.memo,
            userEmail: req.user.local.email,
            percentProgress: 70,
            display: false,
            emailNotification: false,
            reminder_id: reminder.id
        }));
    }

    //Defualt push notification at 100% progress
    notifications.push(new Notification({
        scheduledDateTime: reminder.dueDate,
        title: `${reminder.title}`,
        body: reminder.memo,
        userEmail: req.user.local.email,
        percentProgress: 100,
        emailNotification: reminder.emailNotification,
        reminder_id: reminder.id
    }));


    return notifications;
}

const progressAlertEnum = {
    0: 'On every 50% progress',
    1: 'On every 25% progress',
    2: 'On every 20% progress',
    3: 'On every 10% progress',
    getValue: function(str) {
        for (let i in this) {
            if (this[i] === str) {
                return i;
            }
        }
    }
}

module.exports = router;