angular.module('moo', [])

  // http://docs.angularjs.org/guide/di, see section "Inline Annotation" for the best way to declare these things.
  .controller("MooCtrl", function($scope, $socketio) {
    console.log("We're up!");
    $scope.who = 'Mama';
    $scope.cpu = 'waiting';

    $scope.live_data = [];
    $socketio.on('cpu', function(data) {
      $scope.cpu = data.cpu;
      console.log("LIVE DATA COMING IN", data);
      $scope.live_data.push(data.live_data);
    });

    $scope.speed = 1.0;
    $scope.$watch('speed', function(newVal, oldVal) {
      console.log("CHANGING SPEED");
      $socketio.emit('new_speed', parseFloat(newVal));
    });
  })

  .factory("$socketio", function($rootScope) {
    var socket = io.connect('/cpu');

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

  /**
   * Example:
   *
   * <my-live-graph data="live_data" max_delta="300000">
   *     </my-live-graph>
   *
   * `data` is an array of [timestamp, value]
   * `max_delta` is the time window to keep visible, in miliseconds.
   */
  .directive('myLiveGraph', function($compile, $interpolate) {
    return {
      restrict: "EA",
      scope: {
        data: "="  // make this an Array, that can grow
      },
      link: function($scope, $element, $attr) {
        console.log($scope.max_delta);
        if (!$attr.maxDelta) {
          $scope.max_delta = null;
        } else {
          $scope.max_delta = parseFloat($attr.maxDelta);
        }
        var width = $attr.width || 960;
        var height = $attr.height || 500;
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = parseInt(width) - margin.left - margin.right,
            height = parseInt(height) - margin.top - margin.bottom;

        var parseDate = d3.time.format('%c').parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select($element[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);


        $scope.$watch('data.length', function(oldLen, newLen) {
          var data = $scope.data;
          if ($scope.max_delta) {
            var last_tm = data[data.length - 1][0];
            // Take out the number we need to have the max size
            for (var i = 0; i < data.length; i++ ) {
              var delta = last_tm - data[i][0];
              if (delta < $scope.max_delta) {
                if (i == 0) { break; }
                $scope.data = $scope.data.splice(i);
                break;
              }
            }
          }

          var line = d3.svg.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); });

          x.domain(d3.extent(data, function(d) { return d[0]; }));
          y.domain(d3.extent(data, function(d) { return d[1]; }));

          svg.select('g').remove();
          var svg_g = svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg_g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

          svg_g.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");

          svg_g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
        });


      }
    }
  })

;