const schedule = require('node-schedule');
const { transporter } = require('./email-config');
const { GMAIL_USERNAME } = require('./config');

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
                  console.log(info);
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