// Code goes here
var myApp = angular.module('myApp', ['ngTouch', 'jkuri.gallery']);

myApp.controller('testController', ['$scope', function ($scope) {
    $scope.images = [
        {
            thumb: 'images/thumbs/4.jpg',
            img: 'images/4.jpg', description: 'Image 4'
        }
    ];
}]);