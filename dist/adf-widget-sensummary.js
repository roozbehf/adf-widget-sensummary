(function(window, undefined) {'use strict';


angular.module('adf.widget.sensummary', ['adf.provider'])
  .config(["dashboardProvider", function(dashboardProvider){
    dashboardProvider
      .widget('sensummary', {
        title: 'Sensummary',
        description: 'Summary of Sensu Check Reports',
        templateUrl: '{widgetsPath}/sensummary/src/view.html',
        reload: true,
        edit: {
          templateUrl: '{widgetsPath}/sensummary/src/edit.html'
        },
        config: {
          // senserver: "http://139.162.152.72:4567",
          // uchiwa_url: "http://139.162.151.87/uchiwa/#/client/Site%20PoC"
        },
        controller: 'sensummaryCtrl',
        controllerAs: 'swc'
      });
  }])

angular.module("adf.widget.sensummary").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/sensummary/src/edit.html","<form role=form><div class=form-group><label for=sensuAPI>Sensu API</label> <input type=text class=form-control id=sensuAPI ng-model=config.senserver></div><div class=form-group><label for=uchiwaURL>Uchiwa URL for the Datacenter</label> <input type=text class=form-control id=uchiwaURL ng-model=config.uchiwa_url></div></form>");
$templateCache.put("{widgetsPath}/sensummary/src/view.html","<div><div class=\"alert alert-info\" ng-if=!data>Please point the widget to a Sensu server in the configuration.</div><div ng-if=data><sensu-nodes data=data></sensu-nodes></div></div>");}]);
//   PoC of an D3 View for a Sensummary Dashboard
//   (as an AngularJS directive)
//
//   (c) 2015-2016 Roozbeh Farahbod
//   Thanks to Gregory Hilkert (http://blog.ideahaven.co) for his good tutorial on D3 and AngularJS

angular.module('adf.widget.sensummary')
  .directive('sensuNodes', ['$window', '$timeout', '$interval',
    function($window, $timeout, $interval) {
      return {
        restrict: 'E',
        scope: {
          data: '=',
          senserver: '=',
          label: '@',
          onClick: '&'
        },
        link: function(scope, ele, attrs) {
            var svg,
              bubbleRadius = 30,
              defaultWidth, defaultHeight,
              width, height;

            $window.onresize = function() {
              scope.$apply();
            };

            scope.$watch(function() {
              return angular.element($window)[0].innerWidth;
            }, function() {
              scope.render(scope.data);
            });

            scope.$watch('data', function(newData) {
              scope.render(newData);
            }, true);

            scope.render = function(data) {
              if (!data) return;

              if (!svg) {
                defaultWidth = 1.7 * Math.sqrt(bubbleRadius * bubbleRadius * scope.data.nodes.length);
                defaultHeight = defaultWidth;

                width = defaultWidth;
                height = defaultHeight;

                svg = d3.select(ele[0])
                  .append('svg')
                  .attr("width", "100%")
                  .attr("height", "100%")
                  .attr("class", "bubble");
              }

              svg.selectAll('*').remove();

              var force = d3.layout.force()
                .nodes(d3.values(data.nodes))
                .gravity(0.5)
                .distance(30)
                .charge(-7 * bubbleRadius)
                .size([width, height])
                .start();

              force.linkDistance(width/2);

              var node = svg.selectAll(".node")
                .data(data.nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .call(force.drag);

              var toolTip = function(d) {
                var statusReport;

                switch (d.status) {
                  case 0:
                    statusReport = "<span style='color: green' class='glyphicon glyphicon-ok-sign'></span>";
                    break;

                  case 1:
                    statusReport = "<span style='color: yellow' class='glyphicon glyphicon-exclamation-sign'></span>";
                    break;

                  case 2:
                    statusReport = "<span style='color: red' class='glyphicon glyphicon-remove-sign'></span>";
                    break;

                  default:
                    statusReport = "<span class='glyphicon glyphicon-question-sign'></span>"
                }
                return statusReport + " " + d.name
                          + "<br><span style='color: #888888' class='glyphicon glyphicon-refresh'></span> "
                          + "<span class='updatetime'>updated " + d.lastUpdate + "</span>";
              };

              var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(toolTip);

              node.call(tip);

              var nodeBubble = function (d) {
                switch (d.status) {
                  case 0: return "sensummary/src/img/circle-green.svg";
                  case 1: return "sensummary/src/img/circle-yellow.svg";
                  case 2: return "sensummary/src/img/circle-red.svg";
                  default: return "sensummary/src/img/circle-grey.svg";
                }
              };

              node.append("image")
                .attr("xlink:href", nodeBubble)
                .attr("x", -12)
                .attr("y", -12)
                .attr("width", bubbleRadius)
                .attr("height", bubbleRadius)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on('dblclick', function (d) {
                  if (d.url != null) {
                    window.open(d.url, '_blank');
                  }
                });

              // node.append("text")
              //   .attr("dx", 12)
              //   .attr("dy", ".35em")
              //   .attr("class", "textdata")
              //   .text(function(d) { return d.name; });

              force.on("tick", function() {
                node.attr("transform", function(d) {
                  return "translate(" + d.x + ", " + d.y + ")";
                })
              });


            };
        }}
  }]);

//   PoC of an AngularJS Application for a Sensummary Dashboard
//   (c) 2015-2016 Roozbeh Farahbod

angular.module('adf.widget.sensummary')
  .controller('sensummaryCtrl', ['$scope', '$http', 'config', function($scope, $http, config, commits) {
    var data = {
      nodes: []
    };
    $scope.senserver = config.senserver;
    $scope.uchiwa_url = config.uchiwa_url;
    $scope.sensuConfig = true;

    var notifyDataChange = function() {
      $scope.data = data;
      console.log("All node data is loaded.");
      $scope.$apply();
    };

    var getClients = new Promise(function(resolve, reject) {
      $http.get($scope.senserver + "/clients")
        .success(function(response) {
          for (var ci in response) {
            var cname = response[ci].name;
            var node = {
              name: cname,
              status: -1,
              url: ($scope.uchiwa_url ? ($scope.uchiwa_url + "/" + cname) : null),
              lastUpdate: "few seconds ago"
            };
            data.nodes.push(node);
          }
          resolve();
          console.log("Fetched the node list.");
        })
    });

    var getStatus = function() {
      return new Promise(function(resolve, reject) {
        var statusPromises = [];
        for (var ni in data.nodes) {
          statusPromises.push(new Promise(function(sresolve, sreject) {
            var node = data.nodes[ni];
            $http.get($scope.senserver + "/clients/" + node.name + "/history")
              .success(function(checksResponse) {
                node.status = -1;
                for (var cci in checksResponse) {
                  var check = checksResponse[cci];
                  node.status = Math.max(node.status, check.last_status);
                }
                console.log("Fetched node status of '" + node.name + "' as " + node.status);
                sresolve();
              });
          }));
        }
        Promise.all(statusPromises).then(resolve());
      });
    };

    getClients
      .then(getStatus)
      .then(notifyDataChange);

  }]);



angular.module('adf.widget.sensummary')
  .service('sensuService', ["$q", "$http", "githubApiUrl", function($q, $http, githubApiUrl){
    return {
      getCommits: function(path){
        var deferred = $q.defer();
        var url = githubApiUrl + path + '/commits?callback=JSON_CALLBACK';
        $http.jsonp(url)
          .success(function(data){
            if (data && data.meta){
              var status = data.meta.status;
              if ( status < 300 ){
                deferred.resolve(data.data);
              } else {
                deferred.reject(data.data.message);
              }
            }
          })
          .error(function(){
            deferred.reject();
          });
        return deferred.promise;
      }
    };
  }]);
})(window);