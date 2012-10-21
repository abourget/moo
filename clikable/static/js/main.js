$(function() {
  var NUM_QUESTIONS = 7;
  var selected = {question: -1};

  function select_question() {
    selected.question = (selected.question + 1) % NUM_QUESTIONS;

    $('.question').hide();
    var quest = selected.question + 1;
    $('.q' + quest).show();
    console.log("SELECTED q" + quest);
  };
  select_question();  // first question

  $('.cell').bind('click', function(ev) {
    var data = {type: "answer",
                question: selected.question + 1,
                answer: $(this).text()}
    $.post('/event', data);
    console.log("EVENT", data);

    select_question();  // next question please
  });

  // onReady
  $.post('/event', {type: "pageview"});
});
