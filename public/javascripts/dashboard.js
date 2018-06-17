const APP_DATA = {
    pickedDate: null,
    timeInterval: null
}

//Initaiize datetimepicker
$('#datetimepicker').datetimepicker();

function handleChangeOnDateTimePicker() {
    $("#datetimepicker").on("change.datetimepicker", function (e) {
        APP_DATA.pickedDate = e.date._d;
    });
}

function handelSubmitOnReminderForm() {
    $('#reminderForm').submit(function(e){
        e.preventDefault();
        $.post('/reminder', {
            title: $('#title').val(),
            dueDate: APP_DATA.pickedDate
        }, function(){
            renderRemindersPartialPage();
        })
    })
}

function renderRemindersPartialPage() {
    let reminders;
    if (APP_DATA.timeInterval) APP_DATA.timeInterval.clearInterval();
    $.getJSON('/reminder', function(result){
        reminders = result;
        renderReminders(reminders);
        APP_DATA.timeInterval = setInterval(function(){
            renderReminders(reminders);
        }, 60000)
    })

}

function renderReminders(reminders) {
    $('#reminder-container').html("");

    for (let reminder of reminders) {
        $('#reminder-container').append(`
            <div class="card m-3">
                <!-- Card content -->
                <div class="card-body">
                    <!-- Text -->
                    <p class="mb-1">${reminder.title}</p>
                    <p class="date grey-text m-0">${moment(reminder.dueDate).fromNow()}</p>
                </div>
            </div>
        `);
    }
}

function initializeDashboard() {
    handleChangeOnDateTimePicker();
    handelSubmitOnReminderForm();
    renderRemindersPartialPage();
}

$(initializeDashboard);