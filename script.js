(function () {



  angular.module('app', [])
    .controller('MainController', function ($scope, $window, $document) {
    })
    .directive('ppInverseScrolling', function ($window, $document) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {},
        template: '<div ng-transclude ng-style="{transform: \'translateY(\' + yTranslate + \'px)\'}"></div>',
        link: function (scope, element) {
          function getRelativePosition () {
            var scrollHeight = $document[0].body.offsetHeight - $window.innerHeight;
            if (scrollHeight > 0) {
              return $window.pageYOffset / scrollHeight;
            } else {
              return 0;
            }
          }

          function getYTranslate () {
            var scrollHeight = $window.innerHeight - element[0].offsetHeight;
            if (scrollHeight > 0) {
              return Math.min($window.pageYOffset + scrollHeight * getRelativePosition(), $document[0].body.offsetHeight - element[0].offsetHeight);
            } else {
              return 0;
            }
          }

          scope.yTranslate = 0;

          angular.element($window).on('scroll', function () {
            scope.$apply(function () {
              scope.yTranslate = getYTranslate();
            });
          });
        }
      };
    });

})();
