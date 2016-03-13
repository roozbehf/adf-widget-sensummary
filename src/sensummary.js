'use strict';

angular.module('adf.widget.sensummary', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('sensummary', {
        title: 'Sensummary',
        description: 'Summary of Sensu Check Reports',
        templateUrl: '{widgetsPath}/sensummary/view.html',
        reload: true,
        edit: {
          templateUrl: '{widgetsPath}/sensummary/edit.html'
        },
        config: {
          // senserver: "http://139.162.152.72:4567",
          // uchiwa_url: "http://139.162.151.87/uchiwa/#/client/Site%20PoC"
        },
        controller: 'sensummaryCtrl',
        controllerAs: 'swc'
      });
  })
