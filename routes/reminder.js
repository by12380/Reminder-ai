const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const Reminder = require('../models/reminder');

const router = express.Router();

router.post('/', ensureLoggedIn(), function(req, res){
    Reminder.create({
        title: req.body.title,
        dueDate: req.body.dueDate,
        startDate: req.body.startDate,
        memo: req.body.memo,
        user_id: req.user.id
    }).then(reminder => {
        res.status(201).json(reminder);
    }).catch(err => {
        res.status(500).send('Internal server error');
    })
})

module.exports = router;