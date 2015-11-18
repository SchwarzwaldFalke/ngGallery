angular.module('jkuri.gallery', [])

    .directive('ngGallery', ['$document', '$timeout', '$q', '$templateCache', function ($document, $timeout, $q, $templateCache) {
        'use strict';

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
            scope.deletable = attrs.deletable || false;
            scope.previewImages = [];
        }

        var template_url = defaults.templateUrl;
        // Set the default template
        $templateCache.put(template_url,
            '<div class="{{ baseClass }}">' +
            '<div class="ng-gallery-arrow ng-gallery-arrow-left" ng-class="{\'ng-gallery-arrow-disabled\':!canPaginateLeft}"><i class="fa fa-arrow-left"></i></div>' +
            '<div class="ng-gallery-arrow ng-gallery-arrow-right" ng-class="{\'ng-gallery-arrow-disabled\':!canPaginateRight}"><i class="fa fa-arrow-right"></i></div>' +
            '<div class="ng-gallery-thumb-wrapper">' +
            '  <div ng-repeat="i in previewImages">' +
            '    <img ng-src="{{ i.thumb }}" class="{{ thumbClass }}" ng-click="openGallery(i.number)" alt="Image {{ $index + 1 }}" />' +
            '  </div>' +
            '</div>' +
            '</div>' +
            '<div class="ng-overlay" ng-show="opened">' +
            '</div>' +
            '<div class="ng-gallery-content" ng-show="opened">' +
            '  <div class="uil-ring-css" ng-show="loading"><div></div></div>' +
            '  <a class="close-popup" ng-click="closeGallery()"><i class="fa fa-close"></i></a>' +
            '  <a class="nav-left" ng-click="prevImage()"><i class="fa fa-angle-left"></i></a>' +
            '  <img ng-src="{{ img }}" ng-click="nextImage()" ng-show="!loading" class="effect" />' +
            '  <a class="nav-right" ng-click="nextImage()"><i class="fa fa-angle-right"></i></a>' +
            '  <a class="nav-delete" ng-click="deleteImage()" ng-show="deletable"><i class="fa fa-trash-o"></i></a>' +
            '  <span class="info-text">{{ index + 1 }}/{{ images.length }}{{ (description) ? " - " + description : "" }}</span>' +
            '  <div class="ng-thumbnails-wrapper">' +
            '    <div class="ng-thumbnails slide-left">' +
            '      <div ng-repeat="i in images">' +
            '        <img ng-src="{{ i.thumb }}" ng-class="{\'active\': index === $index}" ng-click="changeImage($index)" />' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );

        var previewPaginator = {
            page: 1,
            elementsPerPage: 15,
            scope: null,
            updatePreview: function () {
                $timeout(function () {
                    var previews = [],
                        startIndex = previewPaginator.elementsPerPage * (previewPaginator.page - 1),
                        endIndex = previewPaginator.elementsPerPage * previewPaginator.page;
                    previewPaginator.images.forEach(function (value, index) {
                        if (index >= startIndex && index <= endIndex) {
                            value.number = index;
                            previews.push(value);
                        }
                    });
                    previewPaginator.scope.previewImages = previews;
                    previewPaginator.scope.$apply();
                }, 0);

            },
            setImages: function (images) {
                this.images = images;
            },
            init: function (scope, images) {
                this.scope = scope;
                this.setImages(images);
                this.updatePreview();
            },
            images: [],
            nextPage: function () {
                if (previewPaginator.canPaginateRight()) {
                    this.page++;
                    this.updatePreview()
                }
            },
            previousPage: function () {
                if (this.canPaginateLeft()) {
                    this.page--;
                    this.updatePreview()
                }
            },
            canPaginateLeft: function () {
                return previewPaginator.page > 1;
            },
            canPaginateRight: function () {
                return (previewPaginator.images.length > previewPaginator.page * previewPaginator.elementsPerPage);
            }
        };

        return {
            restrict: 'EA',
            scope: {
                images: '=',
                thumbsNum: '@'
            },
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || defaults.templateUrl;
            },
            link: function (scope, element, attrs) {
                setScopeValues(scope, attrs);

                scope.$watch('images', function (newVal, oldVal) {
                    if (newVal) {
                        previewPaginator.init(scope, newVal);
                    }
                });

                scope.$watch('previewImages', function () {
                    scope.canPaginateLeft = previewPaginator.canPaginateLeft();
                    scope.canPaginateRight = previewPaginator.canPaginateRight();
                });



                if (scope.thumbsNum >= 11) {
                    scope.thumbsNum = 11;
                }

                var $body = $document.find('body');
                var $previewNextButton = element.find('.ng-gallery-arrow-right'),
                    $previewPrevButton = element.find('.ng-gallery-arrow-left');
                $previewNextButton.bind('click', function () {
                    previewPaginator.nextPage();
                });
                $previewPrevButton.bind('click', function () {
                    previewPaginator.previousPage();
                });


                var $thumbwrapper = angular.element(document.querySelectorAll('.ng-thumbnails-wrapper'));
                var $thumbnails = angular.element(document.querySelectorAll('.ng-thumbnails'));

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

                scope.changeImage = function (i) {
                    scope.index = i;
                    loadImage(scope.index).then(function (resp) {
                        scope.img = resp.src;
                        smartScroll(scope.index);
                    });
                };

                scope.nextImage = function () {
                    scope.index += 1;
                    if (scope.index === scope.images.length) {
                        scope.index = 0;
                    }
                    showImage(scope.index);
                };

                scope.deleteImage = function () {
                    if (scope.images.length === 1) {
                        scope.images = [];
                        scope.closeGallery();
                    } else {
                        scope.images.splice(scope.index, 1);
                        scope.prevImage();
                    }
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

                    $timeout(function () {
                        var calculatedWidth = calculateThumbsWidth();
                        scope.thumbs_width = calculatedWidth.width;
                        $thumbnails.css({width: calculatedWidth.width + 'px'});
                        $thumbwrapper.css({width: calculatedWidth.visible_width + 'px'});
                        smartScroll(scope.index);
                    });
                };

                scope.closeGallery = function () {
                    scope.opened = false;
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
                            current_scroll = $thumbwrapper[0].scrollLeft,
                            item_scroll = parseInt(width / len, 10),
                            i = index + 1,
                            s = Math.ceil(len / i);

                        $thumbwrapper[0].scrollLeft = 0;
                        $thumbwrapper[0].scrollLeft = i * item_scroll - (s * item_scroll);
                    }, 100);
                };

            }
        };

    }]);
