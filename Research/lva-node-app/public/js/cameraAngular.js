    angular.module('myApp2', [])
    .controller('cameraController', ['$scope', cameraController]);

  function cameraController($scope) {
    $scope.name = 'Julia';
    $scope.cameras = [
    ];
    $scope.existingCameras=[];
    $scope.greet = function() {
      alert($scope.name);
    };
  
    $scope.addcamera = function() {
      $scope.cameras.push({name:'', url:'', username:'', password:''});
    };


    $scope.submitNewCamera = function(cookies) 
    {
      $scope.cameras.forEach((cam) => 
      {                
        //remove semicolon characters
        $.each(cam, function(k, v){
          v=v.replace(/;/g, "");
      });
        $scope.existingCameras.push({name: cam.name, url: cam.url, username: cam.username, password: cam.password});
      });
      $scope.cameras=[];
    };

    $scope.removecamera = function(cameraToRemove) {
      var index = $scope.cameras.indexOf(cameraToRemove);
      if(index==-1)
      {
        index = $scope.existingCameras.indexOf(cameraToRemove);
        $scope.existingCameras.splice(index, 1);
      }
      else $scope.cameras.splice(index, 1);
    };
  
    $scope.clearcamera = function(camera) {
      camera.name = '';
      camera.url = '';
      camera.username = '';
      camera.password = '';
    };
  }
  
  /*
  Copyright 2020 Google Inc. All Rights Reserved.
  Use of this source code is governed by an MIT-style license that
  can be found in the LICENSE file at http://angular.io/license
  */