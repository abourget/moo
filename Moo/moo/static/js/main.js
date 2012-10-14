angular.module('moo', [])
  // http://docs.angularjs.org/guide/di, see section "Inline Annotation" for the best way to declare these things.
  .controller("MooCtrl", function($scope) {
    $scope.who = 'Bobby';
    console.log("We're up!");
  })
