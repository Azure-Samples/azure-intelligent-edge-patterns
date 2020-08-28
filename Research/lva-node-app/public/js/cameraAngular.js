    //create angular module and assign controller + scope
    angular.module('cameraAngularApp', [])
    .controller('cameraController', ['$scope', cameraController]);

  /**
   * cameraController is used to allow user to add new cameras. All functions on scope variable declared within larger body function
   * @param {scope param} $scope 
   */
  function cameraController($scope) 
  {
    //Only scope variable
    $scope.cameras = [
    ];

    $scope.addCamera = function() {
      $scope.cameras.push({name:'', url:'', username:'', password:''});
    };

    /**
     * after user has entered camera values, get rid of form
     */
    $scope.submitNewCamera = function() 
    {
      $scope.cameras=[];
    };

    /**
     * delete camera user is building
     * @param {camera user clicked on to remove} cameraToRemove 
     */
    $scope.removeCamera = function(cameraToRemove) {
      var index = $scope.cameras.indexOf(cameraToRemove);
      $scope.cameras.splice(index, 1);
    };
  }
  
  /*
  Copyright 2020 Google Inc. All Rights Reserved.
  Use of this source code is governed by an MIT-style license that
  can be found in the LICENSE file at http://angular.io/license
  */