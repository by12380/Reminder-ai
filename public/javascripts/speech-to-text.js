const SpeechToText = function() {
  try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
  }
  catch(e)
  {
      $('#speechToTextBtn').remove();
      renderDisabledSpeechToTextBtn();
      return;
  }

  var noteTextarea = $('#note-textarea');
  var noteContent = '';

  $('#pause-record-btn').hide();
  $('#progress-spinner').hide();

    /*-----------------------------
        Voice Recognition
  ------------------------------*/

  // If false, the recording will stop after a few seconds of silence.
  // When true, the silence period is longer (about 15 seconds),
  // allowing us to keep recording even when the user pauses.
  recognition.continuous = true;

  // This block is called every time the Speech APi captures a line.
  recognition.onresult = function(event) {

    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far.
    // We only need the current one.
    var current = event.resultIndex;

    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    // Add the current transcript to the contents of our Note.
    // There is a weird bug on mobile, where everything is repeated twice.
    // There is no official solution so far so we have to handle an edge case.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

    if(!mobileRepeatBug) {
      noteContent += transcript;
      noteTextarea.html(noteContent);
    }
  };

  recognition.onstart = function() {
    noteContent = '';
    $('#start-record-btn').hide();
    $('#pause-record-btn').show();
  }

  recognition.onspeechend = function() {
    $('#progress-spinner').show();
    $('#pause-record-btn').hide();
    const data = {transcript: noteTextarea.html()};
    $.post('/reminder-ai', data, function(reminder){
      $('#progress-spinner').hide();
      $('#start-record-btn').show();
      $('#speechToTextModal').modal('hide');
      clearAddReminderForm();
      bindDataToAddReminderForm(reminder);
      $('#addReminderForm').submit();
    }).fail(function(error){
      $('#progress-spinner').hide();
      $('#start-record-btn').show();
      console.log(error);
    })
  }

  recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
      console.log('No speech was detected. Try again.');
    };
  }

  $('#start-record-btn').on('click', function(e) {
      if (noteContent.length) {
        noteContent += ' ';
      }
      recognition.start();
    });


  $('#pause-record-btn').on('click', function(e) {
    $('#pause-record-btn').hide();
    recognition.stop();
  });

  function bindDataToAddReminderForm(reminder) {
    // console.log(reminder);
    if (reminder.title) {
      let title = reminder.title;
      title = title.charAt(0).toUpperCase() + title.slice(1);
      $('#title').val(title).trigger('change');
    }
    if (reminder.dueDate) {
      $('#dueDate').datetimepicker('date', new Date(reminder.dueDate));
      $('#dueDate')
        .removeClass('datetimepicker-input')
        .trigger('change')
        .addClass('datetimepicker-input');
      const DASHBOARD_DATA = getDashboardData();
      DASHBOARD_DATA.addReminder.dueDate = reminder.dueDate;
    }
    if (reminder.memo) {
      $('#memo').val(reminder.memo).trigger('change');
    }
  }

  $('#speechToTextModal').on('hide.bs.modal', function(){
    recognition.stop();
  })

  function renderDisabledSpeechToTextBtn() {
    $('#speechToTextBtnContainer').append(`
      <span class="d-inline-block" tabindex="0" data-toggle="tooltip" title="No browser support">
        <button  id="speechToTextBtn" type="button" class="btn btn-warning px-3 mr-3 microphone-btn" style="pointer-events: none;" disabled><i class="fa fa-microphone" aria-hidden="true"></i></button>
      </span>
    `)
  }

}();