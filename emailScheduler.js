const schedule = require('node-schedule');
const { transporter } = require('./email-config');
const { GMAIL_USERNAME } = require('./config');

const emailScheduler = {
    add: function(id, scheduledDateTime, sender = GMAIL_USERNAME, receiver, subject, body, smtpClient = transporter) {
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
        console.log('job added!');
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