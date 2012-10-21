$(function() {
  var NUM_QUESTIONS = 3;
  var selected = {question: null};

  function select_question() {
    selected.question = ((Math.floor(Math.random() * 1000)) %
                         NUM_QUESTIONS) + 1;

    $('.question').hide();
    $('.q' + selected.question).show();
    console.log("SELECTED q" + selected.question);
  };
  select_question();  // first question

  $('.cell').bind('click', function(ev) {
    var data = {type: "answer",
                question: selected.question,
                answer: $(this).text()}
    $.post('/event', data);
    console.log("EVENT", data);

    select_question();  // next question please
  });

  // onReady
  $.post('/event', {type: "pageview"});
});
