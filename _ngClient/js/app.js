var dalyDinners = angular.module("dalyDinners", ['ngRoute', 'nrzLightify',
    'appControllers',    'ngResource' ]);


dalyDinners.run(function( ) {
    // editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

dalyDinners.config(['$routeProvider','$httpProvider', '$provide',  '$locationProvider',
    function($routeProvider, $httpProvider, $provide,  $locationProvider ) {
// You can not ask for instance during configuration phase - you can ask only for providers.	 

//  Force AngularJS to call our JSON Web Service with a 'GET' rather than an 'OPTION' 
//  Taken from: http://better-inter.net/enabling-cors-in-angular-js/	  
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $routeProvider.
        when('/home', {
            templateUrl: './partials/home.html',
            controller: 'HomeCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });

    }]);