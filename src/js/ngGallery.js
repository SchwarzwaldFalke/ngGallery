(function () {
    'use-strict';

    angular.module('jkuri.gallery', []).directive('ngGallery', ngGallery);

    ngGallery.$inject = ['$document', '$timeout', '$q', '$templateCache'];

    function ngGallery($document, $timeout, $q, $templateCache) {

        var defaults = {
            baseClass: 'ng-gallery',
            thumbClass: 'ng-thumb',
            templateUrl: 'ng-gallery.html'
        };

        var keys_codes = {
            enter: 13,
            esc: 27,
            left: 37,
            right: 39
        };

        function setScopeValues(scope, attrs) {
            scope.baseClass = scope.class || defaults.baseClass;
            scope.thumbClass = scope.thumbClass || defaults.thumbClass;
            scope.thumbsNum = scope.thumbsNum || 3; // should be odd
        }

        var template_url = defaults.templateUrl;
        // Set the default template
        $templateCache.put(template_url,
            '<div class="{{ baseClass }}">' +
            '  <div ng-repeat="i in images" class="ng-gallery-thumbs">' +
            '    <a class="delete-icon" uib-tooltip="{{ deleteTooltipText }}" ng-click="deleteNgGalleryImage($index)" ng-show="showDeleteIcons()"><i class="fa fa-times"></i></a>' +
            '    <img ng-src="{{ i.thumb }}" class="{{ thumbClass }}" ng-click="openGallery($index)" alt="Image {{ $index + 1 }}" />' +
            '  </div>' +
            '</div>' +
            '<div class="ng-overlay" ng-show="opened">' +
            '</div>' +
            '<div class="ng-gallery-content" unselectable="on" ng-show="opened" ng-swipe-left="nextImage()" ng-swipe-right="prevImage()">' +
            '  <div class="uil-ring-css" ng-show="loading"><div></div></div>' +
            '  <div class="image-controls">' +
            '    <a class="close-popup" ng-click="closeGallery()"><i class="fa fa-close"></i></a>' +
            '    <a href="{{getImageDownloadSrc()}}" target="_blank" ng-show="showImageDownloadButton()" class="download-image"><i class="fa fa-download"></i></a>' +
            '    <a ng-click="deleteNgGalleryImage(index)" ng-show="showDeleteIcons()" class="delete-image"><i class="fa fa-trash"></i></a>' +
            '  </div>' +
            '  <a class="nav-left" ng-click="prevImage()"><i class="fa fa-angle-left"></i></a>' +
            '  <img ondragstart="return false;" draggable="false" ng-src="{{ img }}" ng-click="nextImage()" ng-show="!loading" class="effect" />' +
            '  <a class="nav-right" ng-click="nextImage()"><i class="fa fa-angle-right"></i></a>' +
            '  <span class="info-text">{{ index + 1 }}/{{ images.length }} - {{ description }}</span>' +
            '  <div class="ng-thumbnails-wrapper">' +
            '    <div class="ng-thumbnails slide-left">' +
            '      <div ng-repeat="i in images">' +
            '        <img ng-src="{{ i.thumb }}" ng-class="{\'active\': index === $index}" ng-click="changeImage($index)" />' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );

        return {
            restrict: 'EA',
            scope: {
                images: '=',
                thumbsNum: '@',
                hideOverflow: '=',
                deleteIcons: '@',
                onDelete: '&', // on delete callback
                customConfirm: '=', // Allows to use custom confirm
                confirmDelete: '=', // User must return true or false to remove image from object
                deleteTooltipText: '=', // Show hide delete tooltip
            },
            controller: [
                '$scope',
                function ($scope) {
                    $scope.$on('openGallery', function (e, args) {
                        $scope.openGallery(args.index);
                    });
                }
            ],
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || defaults.templateUrl;
            },
            link: function (scope, element, attrs) {
                setScopeValues(scope, attrs);

                if (scope.thumbsNum >= 11) {
                    scope.thumbsNum = 11;
                }

                var $body = $document.find('body');
                var $thumbwrapper = angular.element(element[0].querySelectorAll('.ng-thumbnails-wrapper'));
                var $thumbnails = angular.element(element[0].querySelectorAll('.ng-thumbnails'));
                var confirmDeleteWatch;

                scope.index = 0;
                scope.opened = false;

                scope.thumb_wrapper_width = 0;
                scope.thumbs_width = 0;

                var loadImage = function (i) {
                    var deferred = $q.defer();
                    var image = new Image();

                    image.onload = function () {
                        scope.loading = false;
                        if (typeof this.complete === false || this.naturalWidth === 0) {
                            deferred.reject();
                        }
                        deferred.resolve(image);
                    };

                    image.onerror = function () {
                        deferred.reject();
                    };

                    image.src = scope.images[i].img;
                    scope.loading = true;

                    return deferred.promise;
                };

                var showImage = function (i) {
                    loadImage(scope.index).then(function (resp) {
                        scope.img = resp.src;
                        smartScroll(scope.index);
                    });
                    scope.description = scope.images[i].description || '';
                };

                scope.showImageDownloadButton = function () {
                    if (scope.images[scope.index] == null || scope.images[scope.index].downloadSrc == null) return
                    var image = scope.images[scope.index];
                    return angular.isDefined(image.downloadSrc) && 0 < image.downloadSrc.length;
                };

                scope.getImageDownloadSrc = function () {
                    if (scope.images[scope.index] == null || scope.images[scope.index].downloadSrc == null) return
                    return scope.images[scope.index].downloadSrc;
                };

                scope.showDeleteIcons = function () {
                  if (scope.deleteIcons == 'false') return
                  return scope.deleteIcons
                }

                scope.deleteNgGalleryImage = function (i) {
                  if (scope.images[i] == null) return
                  var image = scope.images[i];

                  if (scope.customConfirm) {
                      scope.onDelete({ image: image });

                      if (confirmDeleteWatch){
                          confirmDeleteWatch();
                      }

                      confirmDeleteWatch = scope.$watch('confirmDelete', function (newValue, oldValue) {
                          if (angular.isDefined(newValue) && newValue === true) {
                            if (scope.images.splice(i, 1)) {
                                if (scope.images.length == 0) {
                                    return scope.closeGallery();
                                }
                                scope.confirmDelete = false;
                                scope.changeImage((scope.images.length - 1));
                            }
                        }
                      });

                  } else {
                    if (confirm('Are you sure you want to delete ' + (image.name || 'this image') + '?')) {
                        scope.onDelete({ image: image }); // onDelete callback
                        if (scope.images.splice(i, 1)) {
                            if (scope.images.length == 0) {
                                return scope.closeGallery();
                            }
                            scope.changeImage((scope.images.length - 1));
                        }
                    }
                  }


                }

                scope.changeImage = function (i) {
                    scope.index = i;
                    showImage(i);
                };

                scope.nextImage = function () {
                    scope.index += 1;
                    if (scope.index === scope.images.length) {
                        scope.index = 0;
                    }
                    showImage(scope.index);
                };

                scope.prevImage = function () {
                    scope.index -= 1;
                    if (scope.index < 0) {
                        scope.index = scope.images.length - 1;
                    }
                    showImage(scope.index);
                };

                scope.openGallery = function (i) {
                    if (typeof i !== undefined) {
                        scope.index = i;
                        showImage(scope.index);
                    }
                    scope.opened = true;
                    if (scope.hideOverflow) {
                        $('body').css({overflow: 'hidden'});
                    }

                    $timeout(function () {
                        var calculatedWidth = calculateThumbsWidth();
                        scope.thumbs_width = calculatedWidth.width;
                        //Add 1px, otherwise some browsers move the last image into a new line
                        var thumbnailsWidth = calculatedWidth.width + 1;
                        $thumbnails.css({width: thumbnailsWidth + 'px'});
                        $thumbwrapper.css({width: calculatedWidth.visible_width + 'px'});
                        smartScroll(scope.index);
                    });
                };

                scope.closeGallery = function () {
                    scope.opened = false;
                    if (scope.hideOverflow) {
                        $('body').css({overflow: ''});
                    }
                };

                $body.bind('keydown', function (event) {
                    if (!scope.opened) {
                        return;
                    }
                    var which = event.which;
                    if (which === keys_codes.esc) {
                        scope.closeGallery();
                    } else if (which === keys_codes.right || which === keys_codes.enter) {
                        scope.nextImage();
                    } else if (which === keys_codes.left) {
                        scope.prevImage();
                    }

                    scope.$apply();
                });

                var calculateThumbsWidth = function () {
                    var width = 0,
                        visible_width = 0;
                    angular.forEach($thumbnails.find('img'), function (thumb) {
                        width += thumb.clientWidth;
                        width += 10; // margin-right
                        visible_width = thumb.clientWidth + 10;
                    });
                    return {
                        width: width,
                        visible_width: visible_width * scope.thumbsNum
                    };
                };

                var smartScroll = function (index) {
                    $timeout(function () {
                        var len = scope.images.length,
                            width = scope.thumbs_width,
                            item_scroll = parseInt(width / len, 10),
                            i = index + 1;
                            $thumbwrapper[0].scrollLeft =  (i * item_scroll) - (scope.thumbsNum * item_scroll) + item_scroll;
                    }, 100);
                };

            }
        };
    }
})();
