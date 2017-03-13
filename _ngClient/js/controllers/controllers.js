var appControllers = angular.module('appControllers', []);


appControllers.controller('PlaceboCtrl', ['$rootScope','$scope'  ,
    function($rootScope,$scope) {
        // a global controller in case needed
        console.log("PlaceboCtrl");

        $rootScope.recaptchaCodeAvailable = false;

    }]); // PlaceboCtrl

appControllers.controller('HomeCtrl', ['$scope' ,
    function($scope) {

        $scope.name= "Daly Dinners";

    }]); // HomeCtrl