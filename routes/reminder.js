const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Reminder = require('../models/reminder');
const Notification = require('../models/notifications');
const fawn = require('fawn');
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
                notification.id, notification.scheduledDateTime, notification.emailNotification,
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
                notification.id, notification.scheduledDateTime, notification.emailNotification,
                notification.title, notification.body, notification.userEmail
            );
        }
        res.status(204).end()
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
    if(!reminder.startDate){
        const notification = new Notification({
            scheduledDateTime: reminder.dueDate,
            title: `${reminder.title}`,
            body: reminder.memo,
            userEmail: req.user.local.email,
            emailNotification: reminder.emailNotification,
            reminder_id: reminder.id
        })
        notifications.push(notification);
    }
    return notifications;
}

module.exports = router;