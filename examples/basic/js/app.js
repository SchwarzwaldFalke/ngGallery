// Code goes here
var myApp = angular.module('myApp', ['ngTouch','jkuri.gallery']);

myApp.controller('testController', ['$scope',function($scope) {
    $scope.images = [
        {
            thumb: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/thumbs/1.jpg',
            img: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/1.jpg',
            downloadSrc: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/1.jpg',
            description: 'Image 1'
        },
        {
            thumb: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/thumbs/2.jpg',
            img: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/2.jpg',
            downloadSrc: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/2.jpg',
            description: 'Image 2'

        },
        {
            thumb: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/thumbs/3.jpg',
            img: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/3.jpg',
            downloadSrc: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/3.jpg',
            description: 'Image 3'},
        {
            thumb: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/thumbs/4.jpg',
            img: 'https://raw.githubusercontent.com/SchwarzwaldFalke/ngGallery/master/images/4.jpg',  description: 'Image 4'}
    ];
}]);