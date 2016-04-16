// Code goes here
var myApp = angular.module('myApp', ['ngTouch','jkuri.gallery']);

myApp.controller('testController', ['$scope',function($scope) {
    $scope.images = [
        {
            thumb: 'images/thumbs/1.jpg',
            img: 'images/1.jpg',
            downloadSrc: 'images/1.jpg',
            description: 'Image 1'
        },
        {
            thumb: 'images/thumbs/2.jpg',
            img: 'images/2.jpg',
            downloadSrc: 'images/2.jpg',
            description: 'Image 2'

        },
        {
            thumb: 'images/thumbs/3.jpg',
            img: 'images/3.jpg',
            downloadSrc: 'images/3.jpg',
            description: 'Image 3'},
        {
            thumb: 'images/thumbs/4.jpg',
            img: 'images/4.jpg',  description: 'Image 4'}
    ];
}]);