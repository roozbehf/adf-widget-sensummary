'use strict';

angular.module('adf.widget.sensummary', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('sensummary', {
        title: 'Sensummary',
        description: 'A summary view of Sensu health status',
        templateUrl: '{widgetsPath}/sensummary/src/view.html',
        edit: {
          templateUrl: '{widgetsPath}/sensummary/src/edit.html'
        }
      });
  });
