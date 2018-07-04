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
        setAlert: null,
        progressAlert: null,
        memo: null,
        emailNotification: null
    },
    socketId: null,
    statusPercentage: {
        danger: 95,
        warning: 70
    }
}

function getDashboardData() {
    return DASHBOARD_DATA;
}

const progressAlertEnum = {
    0: 'On every 50% progress',
    1: 'On every 25% progress',
    2: 'On every 20% progress',
    3: 'On every 10% progress',
    getValue: function(str) {
        for (let i in this) {
            if (this[i] === str) {
                return i;
            }
        }
    }
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
        if (e.date) {
            DASHBOARD_DATA.addReminder.dueDate = e.date._d;
        }
    });
    $("#startDate").on("change.datetimepicker", function (e) {
        if (e.date) {
            DASHBOARD_DATA.addReminder.startDate = e.date._d;
        }
        if ($(this).val()) {
            $('#alertFormGroup').show();
        }
        else {
            $('#alertFormGroup').hide();
        }
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
        else {
            DASHBOARD_DATA.editReminder.startDate = null;
        }
        if ($(this).val()) {
            $('#editAlertFormGroup').show();
        }
        else {
            $('#editAlertFormGroup').hide();
            $('#editSetAlert').prop('checked', false);
            DASHBOARD_DATA.editReminder.setAlert = false;
        }
    });
    $('#editSetAlert').change(function(){
        DASHBOARD_DATA.editReminder.setAlert = $(this).is(':checked');
    })
    $('#editProgressAlert').change(function(){
        DASHBOARD_DATA.editReminder.progressAlert = progressAlertEnum[$(this).val()];
    })
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
            setAlert: $('#setAlert').is(':checked'),
            progressAlert: progressAlertEnum[$('#progressAlert').val()],
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
                setAlert: DASHBOARD_DATA.editReminder.setAlert,
                progressAlert: DASHBOARD_DATA.editReminder.progressAlert,
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

        $('#editSetAlert').prop('checked', $(this).data('setAlert'));
        $('#editProgressAlert').val(progressAlertEnum.getValue($(this).data('progressAlert')));

        if($(this).data('memo') != 'undefined') {
            $('#editMemo').val($(this).data('memo')).trigger('change');
        }
        $('#editEmailNotification').prop('checked', $(this).data('emailNotification'));

        for (let field in DASHBOARD_DATA.editReminder) {
            if ($(this).data(field) != 'undefined') {
                DASHBOARD_DATA.editReminder[field] = $(this).data(field);
            }
        }

        if (!$('#editStartDate').val()){
            $('#editAlertFormGroup').hide();
        }
        if (!$('#editSetAlert').is(':checked')) {
            $('#editProgressAlert').hide();
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

function handleChangeOnAlertCheckBox() {
    $('#setAlert').change(function(){
        if ($(this).is(':checked') && $('#startDate').val()) {
            $('#progressAlert').show();
        }
        else {
            $('#progressAlert').hide();
        }
    })

    $('#editSetAlert').change(function(){
        if ($(this).is(':checked') && $('#editStartDate').val()) {
            $('#editProgressAlert').show();
        }
        else {
            $('#editProgressAlert').hide();
        }
    })
}

function handleClickOnSpeechToTextButton() {
    $('#speechToTextBtn').click(function(){
        $('#start-record-btn').show();
        $('#pause-record-btn').hide();
    })
}

function renderRemindersPartialPage() {
    $.getJSON('/reminder', function(reminders){
        data = [
            {status: "Warning", percent: 0, count: 0},
            {status: "Need attention", percent: 0, count: 0},
            {status: "In progress", percent: 0, count: 0}
        ]
        const total = reminders.length;
        for (let reminder of reminders) {
            if(reminder.percentProgress >= DASHBOARD_DATA.statusPercentage.danger) {
                data[0].count++;
                data[0].percent = parseInt(data[0].count * 100 / total);
            }
            else if (reminder.percentProgress >= DASHBOARD_DATA.statusPercentage.warning) {
                data[1].count++;
                data[1].percent = parseInt(data[1].count * 100 / total);
            }
            else {
                data[2].count++;
                data[2].percent = parseInt(data[2].count * 100 / total);
            }
        }

        //Display arc for clock when no data
        if (total === 0) {
            data[2].count++;
            data[2].percent = 0;
        }

        change(data);
        renderReminders(reminders);
    })
}

function renderReminders(reminders) {
    let cardBgColorClass;
    let titleColorClass;
    let dateColorClass;

    $('#reminder-container').html("");

    for (let reminder of reminders) {
        if (reminder.percentProgress >= DASHBOARD_DATA.statusPercentage.danger) {
            cardBgColorClass = 'bg-danger';
            titleColorClass = 'text-white';
            dateColorClass = 'text-white';
        }
        else if (reminder.percentProgress >= DASHBOARD_DATA.statusPercentage.warning) {
            cardBgColorClass = 'bg-warning';
            titleColorClass = 'text-white';
            dateColorClass = 'text-white';
        }
        else {
            cardBgColorClass = '';
            titleColorClass = '';
            dateColorClass = 'grey-text';
        }
        $('#reminder-container').append(`
            <div
                class="js-reminder reminder card m-3 ${cardBgColorClass}"
                data-id="${reminder.id}"
                data-title="${reminder.title}"
                data-due-date="${reminder.dueDate}"
                data-start-date="${reminder.startDate}"
                data-set-alert="${reminder.setAlert}"
                data-progress-alert="${reminder.progressAlert}"
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
        if (notification.display) {
            const item = $(`<div class="notification animated fadeInRight alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>Reminder: <span class="notification-title">${notification.title}</span></strong>
            <div class="notification-body">${notification.body}</div>
            </div>`).hide().show();
            $('body').append(item);
        }
        renderRemindersPartialPage();
    })
}

function initialzeHiddenElements() {
    $('#alertFormGroup').hide();
    $('#progressAlert').hide();
}

function clearAddReminderForm() {
    DASHBOARD_DATA.addReminder.dueDate = null;
    DASHBOARD_DATA.addReminder.startDate = null;

    $('#title').val('').trigger('change');
    $('#dueDate').datetimepicker('date', null);
    $('#startDate').datetimepicker('date', null);
    $('#dueDate')
        .removeClass('datetimepicker-input')
        .trigger('change')
        .addClass('datetimepicker-input');
    $('#startDate')
        .removeClass('datetimepicker-input')
        .trigger('change')
        .addClass('datetimepicker-input');
    $('#setAlert').prop('checked', false);
    $('#progressAlert').val(0).trigger('change');;

    $('#memo').val('').trigger('change');;
    $('#emailNotification').prop('checked', false);
}

function initializeDashboard() {
    initialzeHiddenElements();
    initializeSocketIO();
    initializeDateTimePicker();
    handleChangeOnAddReminder();
    handleChangeOnEditReminder();
    handelSubmitOnAddReminderForm();
    handelSubmitOnEditReminderForm();
    handleClickOnReminder();
    handleDeleteOnReminder();
    handleChangeOnAlertCheckBox();
    handleClickOnSpeechToTextButton();
    renderRemindersPartialPage();
}

$(initializeDashboard);