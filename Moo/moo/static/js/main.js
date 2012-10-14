angular.module('moo', [])
  // http://docs.angularjs.org/guide/di, see section "Inline Annotation" for the best way to declare these things.
  .controller("MooCtrl", function($scope, $socketio) {
    console.log("We're up!");
    $scope.who = 'Mama';
    $scope.cpu = 'waiting';

    $socketio.on('cpu', function(data) {
      $scope.cpu = data.cpu;
    });
  })
  .factory("$socketio", function($rootScope) {
    var socket = io.connect('/cpu');
    //socket.emit('noop');  // establishes the Namespace on the server
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  })
