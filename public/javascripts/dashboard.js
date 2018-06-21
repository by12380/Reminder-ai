const APP_DATA = {
    addReminder: {
        dueDate: null,
        startDate: null
    },
    timeInterval: null
}

function initializeDateTimePicker() {
    $('#dueDate').datetimepicker();

    $('#startDate').datetimepicker({
        buttons: {
            showClear: true,
        },
        icons: {
            clear: 'fa fa-trash-o'
        }
    });
}

function handleChangeOnDateTimePicker() {
    $("#dueDate").on("change.datetimepicker", function (e) {
        APP_DATA.addReminder.dueDate = e.date._d;
        console.log(APP_DATA.addReminder.dueDate);
    });
    $("#startDate").on("change.datetimepicker", function (e) {
        APP_DATA.addReminder.startDate = e.date._d;
        console.log(APP_DATA.addReminder.startDate);
    });
}

function handelSubmitOnReminderForm() {
    $('#addReminderForm').submit(function(e){
        e.preventDefault();
        $.post('/reminder', {
            title: $('#title').val(),
            dueDate: APP_DATA.addReminder.dueDate,
            startDate: APP_DATA.addReminder.startDate
        }, function(){
            renderRemindersPartialPage();
        })
    })
}

function renderRemindersPartialPage() {
    $.getJSON('/reminder', function(reminders){
        renderReminders(reminders);
    })
    clearInterval(APP_DATA.timeInterval);
    APP_DATA.timeInterval = setInterval(function(){
        $.getJSON('/reminder', function(reminders){
            renderReminders(reminders);
        })
    }, 60000)
}

function renderReminders(reminders) {
    let cardBgColorClass;
    let titleColorClass;
    let dateColorClass;

    $('#reminder-container').html("");

    for (let reminder of reminders) {
        if (reminder.percentProgress >= 90) {
            cardBgColorClass = 'bg-danger';
            titleColorClass = 'text-white';
            dateColorClass = 'text-white';
        } else {
            cardBgColorClass = '';
            titleColorClass = '';
            dateColorClass = 'grey-text';
        }
        $('#reminder-container').append(`
            <div class="card m-3 ${cardBgColorClass}">
                <!-- Card content -->
                <div class="card-body">
                    <!-- Text -->
                    <p class="mb-1 ${titleColorClass}">${reminder.title}</p>
                    <p class="date m-0 ${dateColorClass}">${moment(reminder.dueDate).fromNow()}</p>
                </div>
            </div>
        `);
    }
}

function initializeDashboard() {
    initializeDateTimePicker();
    handleChangeOnDateTimePicker();
    handelSubmitOnReminderForm();
    renderRemindersPartialPage();
}

$(initializeDashboard);