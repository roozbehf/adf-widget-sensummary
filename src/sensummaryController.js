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
      console.log('got here');
      $scope.data = data;
      console.log("All node data is loaded.");
      $scope.$apply();
    };

    var getClients = new Promise(function(resolve, reject) {
      if ($scope.senserver) {
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
          } else {
            reject('The sensummary widget is not configured yet.');
          }
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
      .then(getStatus, function(reason) { return Promise.reject(reason);})
      .then(notifyDataChange, function(reason) { console.log(reason);});

  }]);
