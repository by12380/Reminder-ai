const schedule = require('node-schedule');
const { transporter } = require('./email-config');
const { GMAIL_USERNAME } = require('./config');

const emailScheduler = {
    add: function(id, scheduledDateTime, subject, body, receiver, sender = GMAIL_USERNAME, smtpClient = transporter) {
        schedule.scheduleJob(id, scheduledDateTime, function(){
            smtpClient.sendMail({
                from: sender,
                to: receiver,
                subject: subject,
                html: body
            }, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
            })
        });
        console.log(`Added schedule: ${id}`);
    },
    addAll: function(scheduledEmails){
        for (let scheduledEmail of scheduledEmails){
            this.add(
                scheduledEmail.id, scheduledEmail.scheduledDateTime, scheduledEmail.subject,
                scheduledEmail.body, scheduledEmail.receiver
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

module.exports = { emailScheduler };