'use strict';

angular.module('adf.widget.sensummary')
  .service('sensuService', function($q, $http, githubApiUrl){
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
  });
