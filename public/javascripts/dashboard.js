const APP_DATA = {
    addReminder: {
        dueDate: null,
        startDate: null
    },
    editReminder: {
        id: null,
        title: null,
        dueDate: null,
        startDate: null,
        memo: null
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
            //Refresh page
            window.location = '/dashboard';
        })
    })
}

function handleReminderDelete() {
    $('#reminder-container').on('click', '.js-close-reminder', function(){
        const id = $(this).closest('.js-reminder').data('id');
        bootbox.confirm({
            message: "Are you sure you want to remove this reminder?",
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            size: 'small',
            callback: function(result){
                if(result){
                    $.ajax({
                        url: `/reminder/${id}`,
                        method: 'delete',
                    }).done(function(){
                        window.location = '/dashboard';
                    }).fail(function(err){
                        console.log(err);
                    })
                }
            }
        });
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
            <div
                class="js-reminder card m-3 ${cardBgColorClass}"
                data-id="${reminder.id}"
                data-title="${reminder.title}"
                data-due-date="${reminder.dueDate}"
                data-start-date="${reminder.startDate}"
                data-memo="${reminder.memo}">

                <div class="card-body">
                    <button type="button" class="js-close-reminder close-reminder close waves-effect waves-light" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
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
    handleReminderDelete();
    renderRemindersPartialPage();
}

$(initializeDashboard);