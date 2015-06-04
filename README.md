ngGallery
=========

Angular is only dependency (no jQuery).

#### Example 

Check out [the live demo](http://demo.jankuri.com/ngGallery/)

Install
-------

#### With bower:

    $ bower install ngGallery

#### Example Configuration

#### app.js
```js
angular.module('app', ['jkuri.gallery']).
  controller('Ctrl', function($scope, $document) {
    self.images = [
      {thumb: 'images/thumbs/1.jpg', img: 'images/1.jpg'},
		  {thumb: 'images/thumbs/2.jpg', img: 'images/2.jpg'},
		  {thumb: 'images/thumbs/3.jpg', img: 'images/3.jpg'},
		  {thumb: 'images/thumbs/4.jpg', img: 'images/4.jpg'},
		  {thumb: 'images/thumbs/5.jpg', img: 'images/5.jpg'},
		  {thumb: 'images/thumbs/6.jpg', img: 'images/6.jpg'}
    ];
  }
);
```

#### index.html
```html
<html ng-app="app">
<head>
	<title>ngGallery</title>
	<link rel="stylesheet" type="text/css" href="src/css/screen.css">
	<link rel="stylesheet" type="text/css" href="src/css/ngGallery.css">
</head>
<body ng-controller="Ctrl as ctrl">

<div class="content">
	<ng-gallery images="ctrl.images"></ng-gallery>
</div>

<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular.min.js"></script>
<script type="text/javascript" src="src/js/ngGallery.js"></script>
<script type="text/javascript" src="app.js"></script>
</body>
</html>
```

That's all. 
