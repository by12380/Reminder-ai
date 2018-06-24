const schedule = require('node-schedule');
const { transporter } = require('./email-config');
const { GMAIL_USERNAME } = require('./config');
const User = require('./models/user');
const Notification = require('./models/notifications');

const notificationScheduler = {
    add: function(id, scheduledDateTime, emailNotification, title, body, receiverEmail, hostEmail = GMAIL_USERNAME, smtpClient = transporter) {
        const that = this;
        schedule.scheduleJob(id, scheduledDateTime, async function(){
            if (emailNotification) {
                //Schedule email delivery
                await smtpClient.sendMail({
                    from: hostEmail,
                    to: receiverEmail,
                    subject: title,
                    html: body
                }, function (err, info) {
                    if(err)
                    console.log(err)
                    else
                    console.log(`Email notification for job id: ${id} sent - ${info.messageId}`);
                });
            }
            const { getSocketIO } = require('./app');
            const io = getSocketIO();
            await User.findOne({'local.email': receiverEmail}).then((user) => {
                if (io.sockets.connected[user.socketId]) {
                    io.sockets.connected[user.socketId]
                        .emit('notification', {title: title, body: body});
                }
            })
            console.log(`Scheduled job id: ${id} complete`);
            await Notification.findByIdAndRemove(id).then(function(){
                that.remove(id);
                console.log(`Removed scheduled job id: ${id}`);
            })
        });
        console.log(`Added schedule: ${id}`);
    },
    addAll: function(notifications){
        for (let notification of notifications){
            this.add(
                notification.id, notification.scheduledDateTime, notification.emailNotification,
                notification.title, notification.body, notification.userEmail);
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