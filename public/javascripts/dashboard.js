const DASHBOARD_DATA = {
    addReminder: {
        dueDate: null,
        startDate: null
    },
    editReminder: {
        id: null,
        title: null,
        dueDate: null,
        startDate: null,
        memo: null,
        emailNotification: null
    },
    socketId: null,
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

    $('#editDueDate').datetimepicker();

    $('#editStartDate').datetimepicker({
        buttons: {
            showClear: true,
        },
        icons: {
            clear: 'fa fa-trash-o'
        }
    });
}

function handleChangeOnAddReminder() {
    $("#dueDate").on("change.datetimepicker", function (e) {
        DASHBOARD_DATA.addReminder.dueDate = e.date._d;
    });
    $("#startDate").on("change.datetimepicker", function (e) {
        DASHBOARD_DATA.addReminder.startDate = e.date._d;
    });
}

function handleChangeOnEditReminder() {
    $("#editTitle").change(function(){
        DASHBOARD_DATA.editReminder.title = $(this).val();
    })
    $("#editDueDate").on("change.datetimepicker", function (e) {
        if (e.date) {
            DASHBOARD_DATA.editReminder.dueDate = e.date._d;
        }
    });
    $("#editStartDate").on("change.datetimepicker", function (e) {
        if (e.date) {
            DASHBOARD_DATA.editReminder.startDate = e.date._d;
        }
    });
    $("#editMemo").change(function(){
        DASHBOARD_DATA.editReminder.memo = $(this).val();
    })
    $("#editEmailNotification").change(function(){
        DASHBOARD_DATA.editReminder.emailNotification = $(this).is(':checked');
    })
}

function handelSubmitOnAddReminderForm() {
    $('#addReminderForm').submit(function(e){
        e.preventDefault();
        $.post('/reminder', {
            title: $('#title').val(),
            dueDate: DASHBOARD_DATA.addReminder.dueDate,
            startDate: DASHBOARD_DATA.addReminder.startDate,
            memo: $('#memo').val(),
            emailNotification: $('#emailNotification').is(':checked')
        }, function(){
            //Refresh page
            window.location = '/dashboard';
        })
    })
}

function handelSubmitOnEditReminderForm() {
    $('#editReminderForm').submit(function(e){
        e.preventDefault();
        $.ajax({
            url: `/reminder/${DASHBOARD_DATA.editReminder.id}`,
            data: {
                title: DASHBOARD_DATA.editReminder.title,
                dueDate: DASHBOARD_DATA.editReminder.dueDate,
                startDate: DASHBOARD_DATA.editReminder.startDate,
                memo: DASHBOARD_DATA.editReminder.memo,
                emailNotification: DASHBOARD_DATA.editReminder.emailNotification
            },
            method: 'put'
        }).done(function(){
            window.location = '/dashboard';
        }).fail(function(err){
            console.log(err);
        })
    })
}

function handleClickOnReminder() {
    $('#reminder-container').on('click', '.js-reminder', function(){
        for (let field in DASHBOARD_DATA.editReminder) {
            DASHBOARD_DATA.editReminder[field] = null;
        }

        $('#editTitle').val($(this).data('title')).trigger('change');
        $('#editDueDate').datetimepicker('date', new Date($(this).data('dueDate')));
        $('#editStartDate').datetimepicker('date', $(this).data('startDate') ? new Date($(this).data('startDate')) : null);
        $('#editDueDate')
            .removeClass('datetimepicker-input')
            .trigger('change')
            .addClass('datetimepicker-input');
        $('#editStartDate')
        .removeClass('datetimepicker-input')
        .trigger('change')
        .addClass('datetimepicker-input');
        if($(this).data('memo') != 'undefined') {
            $('#editMemo').val($(this).data('memo')).trigger('change');
        }
        $('#editEmailNotification').prop('checked', $(this).data('emailNotification'))

        for (let field in DASHBOARD_DATA.editReminder) {
            if ($(this).data(field) != 'undefined') {
                DASHBOARD_DATA.editReminder[field] = $(this).data(field);
            }
        }
        $('#editReminderBtn').click();
    })
}

function handleDeleteOnReminder() {
    $('#reminder-container').on('click', '.js-close-reminder', function(e){
        e.stopPropagation();
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
                data-memo="${reminder.memo}"
                data-email-notification="${reminder.emailNotification}">

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

function initializeSocketIO() {
    const socket = io()
    socket.on('connect', function() {
        DASHBOARD_DATA.socketId = socket.io.engine.id;
        $.ajax({
            url: '/socketId',
            data: {
                socketId: DASHBOARD_DATA.socketId
            },
            method: 'put'
        })
    });
    socket.on('notification', function(notification){
        const item = $(`<div class="notification animated fadeInRight alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>Reminder: </strong>${notification.title}
            <div>${notification.body}</div>
            </div>`).hide().show();
        $('body').append(item);
        renderRemindersPartialPage();
    })
}

function initializeDashboard() {
    initializeSocketIO();
    initializeDateTimePicker();
    handleChangeOnAddReminder();
    handleChangeOnEditReminder();
    handelSubmitOnAddReminderForm();
    handelSubmitOnEditReminderForm();
    handleClickOnReminder();
    handleDeleteOnReminder();
    renderRemindersPartialPage();
}

$(initializeDashboard);