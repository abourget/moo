$(function() {
  var NUM_QUESTIONS = 6;
  var selected = {question: -1};

  function select_question() {
    selected.question = (selected.question + 1) % 6;

    $('.question').hide();
    $('.q' + (selected.question + 1)).show();
    console.log("SELECTED q" + (selected.question + 1));
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
