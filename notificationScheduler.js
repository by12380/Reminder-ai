const schedule = require('node-schedule');
const { transporter } = require('./email-config');
const { GMAIL_USERNAME } = require('./config');
const User = require('./models/user');

const notificationScheduler = {
    add: function(id, scheduledDateTime, title, body, receiverEmail, hostEmail = GMAIL_USERNAME, smtpClient = transporter) {
        schedule.scheduleJob(id, scheduledDateTime, function(){
            //Schedule email delivery
            smtpClient.sendMail({
                from: hostEmail,
                to: receiverEmail,
                subject: title,
                html: body
            }, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(`Email notification sent - ${info.messageId}`);
            });
            const { getSocketIO } = require('./app');
            const io = getSocketIO();
            User.findOne({'local.email': receiverEmail}).then((user) => {
                if (io.sockets.connected[user.socketId]) {
                    io.sockets.connected[user.socketId]
                        .emit('notification', {title: title, body: body});
                }
            })
            //TODO: Cancel schedule upon job completion
        });
        console.log(`Added schedule: ${id}`);
    },
    addAll: function(notifications){
        for (let notification of notifications){
            this.add(
                notification.id, notification.scheduledDateTime, notification.title,
                notification.body, notification.userEmail
            );
        }
    },
    remove: function(id) {
        schedule.cancelJob(id);
    },
    removeAll: function(){
        for(let key in schedule.scheduledJobs){
            schedule.scheduledJobs[key].cancel();
        }
    }
}

module.exports = { notificationScheduler };