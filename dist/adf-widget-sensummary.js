(function(window, undefined) {'use strict';


angular.module('adf.widget.sensummary', ['adf.provider'])
  .config(["dashboardProvider", function(dashboardProvider){
    dashboardProvider
      .widget('sensummary', {
        title: 'Sensummary',
        description: 'A summary view of Sensu health status',
        templateUrl: '{widgetsPath}/sensummary/src/view.html',
        edit: {
          templateUrl: '{widgetsPath}/sensummary/src/edit.html'
        }
      });
  }]);

angular.module("adf.widget.sensummary").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/sensummary/src/edit.html","<form role=form><div class=form-group><label for=sample>Sample</label> <input type=text class=form-control id=sample ng-model=config.sample placeholder=\"Enter sample\"></div></form>");
$templateCache.put("{widgetsPath}/sensummary/src/view.html","<div><h1>Widget view</h1><p>Content of {{config.sample}}</p></div>");}]);})(window);