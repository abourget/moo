
angular.module('moo', [])
  .controller("MooCtrl", function($scope, $socketio) {
    console.log("We're here");
    $scope.who = 'Mama';
    $scope.sine = 'waiting';
    $scope.speed = 1;

    $scope.live_sine = []
    $socketio.on("sine", function(data) {
      $scope.sine = data.value;
      $scope.live_sine.push(data.value);
    });

    $socketio.emit("boo");

    $scope.$watch("speed", function(newVal) {
      $socketio.emit("new_speed", parseFloat(newVal));
    });

    $scope.clik_data = [];
    $socketio.on("clik", function(data) {
      console.log("CLIK DATA IN", data);
      $scope.clik_data.push(data);
    });
  })


  .factory("$socketio", function($rootScope) {
    var socket = io.connect('/stat');
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
   * </my-live-graph>
   *
   * 'data' is an array of [timestamp, value]
   * 'max_delta' is the time window to keep visible, in miliseconds.
   */
  .directive('myLiveGraph', function($compile, $interpolate) {
    return {
      restrict: "EA",
      scope: {
        data: "="  // make this an Array, that can grow
      },
      link: function($scope, $element, $attr) {
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
          if (!data.length) { return; }
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
            .call(yAxis);

          svg_g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
        });


      }
    }
  })

  /**
   * Example:
   *
   * <my-bar-graph data="clik_data" type="answer" field="loser">
   * </my-bar-graph>
   *
   * [yas] elisp error! is either 'pageview' or 'answer'
   *  is either 'loser' or 'winner', will only work with 'answer' though.
   */
  .directive('myBarGraph', function($compile, $interpolate) {
    return {
      restrict: "EA",
      scope: {
        data: "=",  // make this an Array, that can grow
        type: "@",  // 'pageview' or 'answer'
        field: "@"  // 'loser' or 'winner' (otherwise, use 1 as value)
      },
      link: function($scope, $element, $attr) {
        /**
         * put our data into bins, based on "stamp"
         */
        var field_name = $attr.field || $attr.type; // loser, winner or pageview

        function binize(data) {
          var binsum = {};
          angular.forEach(data, function(el, i) {
            var bin = Math.floor(el.stamp / 10);

            if (binsum[bin] === undefined) {
              binsum[bin] = {bin: bin * 10,  // restore bin value
                             loser: 0,
                             winner: 0,
                             pageview: 0,
                             any: 0};
            }

            var current_field = (el.type == 'pageview' ? 'pageview' :
                                 el.winner ? 'winner' : 'loser');
            binsum[bin][current_field] += 1;
            binsum[bin].any += 1;
          });


          var res = [];
          angular.forEach(binsum, function(v, k) {
            res.push(v);
          });

          return res;
        }

        var width = $attr.width || 960;
        var height = $attr.height || 200;
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = parseInt(width) - margin.left - margin.right,
        height = parseInt(height) - margin.top - margin.bottom;

        $scope.$watch('data.length', function(new_length) {
          var data = binize($scope.data);

          var x = d3.time.scale()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.bin; }));
          var y = d3.scale.linear()
            .range([0, height])
            .domain([d3.max(data, function(d) {

              return d3.max([d.loser, d.winner, d.pageview]);
            }), 0]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

          d3.select($element[0]).select('svg').remove();

          var vis = d3.select($element[0])
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

          vis.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr("x", function(d, i) { return margin.left + (width / data.length * i) })
            .attr("y", function(d) { return y(d[field_name]) + margin.top })
            .attr("width", width / data.length - 3)
            .attr("height", function(d) { return height - y(d[field_name]) })
            .attr("fill", 'steelblue');

          vis.selectAll('text')
            .data(data)
            .enter()
            .append("text")
            .text(function(d, i) {
              return d[field_name];
            })
            .attr("x", function(d, i) {
              return margin.left + (width / data.length * (i + 0.5));
            })
            .attr("y", function(d, i) {
              return y(d[field_name]) + margin.top - 5;
            })
            .classed("bar_label", true)
          ;

          // Renew axis
          vis.selectAll('.axis').remove();

          vis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
            .call(xAxis);

          vis.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(yAxis);

        }); // end $watch

      }
    }
  })
