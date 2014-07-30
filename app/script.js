(function () {



  angular.module('app', [])
    .controller('MainController', function ($scope, $window, $document) {
    })
    .factory('scroll', function ($window, $document) {
      return {
        getRelativePosition: function () {
          var scrollHeight = $document[0].body.offsetHeight - $window.innerHeight;
          if (scrollHeight > 0) {
            return $window.pageYOffset / scrollHeight;
          } else {
            return 0;
          }
        }
      };
    })
    .directive('ppInverseScrolling', function ($window, $document, scroll) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {},
        template: '<div ng-transclude ng-style="{transform: \'translateY(\' + yTranslate + \'px)\'}"></div>',
        link: function (scope, element) {
          function getYTranslate () {
            var scrollHeight = $window.innerHeight - element[0].offsetHeight;
            if (scrollHeight > 0) {
              return Math.min($window.pageYOffset + scrollHeight * scroll.getRelativePosition(), $document[0].body.offsetHeight - element[0].offsetHeight);
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
    })
    .directive('ppIridescent', function ($window, scroll) {
      return {
        link: function (scope, element, attrs) {
          function getRandomColor() {
            return Math.floor(Math.random() * 256);
          }

          function setColor (r, g, b) {
            function getFullColor () {
              return 'rgb(' + r + ', ' + g + ', ' + b + ')';
            }
            element.css({
              stroke: getFullColor(),
              fill: getFullColor()
            });
          }

          function getIntermediateColor (initial, final, relative) {
            return Math.round(initial + (final - initial) * relative);
          }

          var previousScrollDirection = 1,
              initialRed = previousRed = getRandomColor(),
              initialGreen = previousGreen = getRandomColor(),
              initialBlue = previousBlue = getRandomColor(),
              initialRelativePosition = previousRelativePosition = scroll.getRelativePosition(),
              finalRelativePosition = 1,
              finalRed = getRandomColor(),
              finalGreen = getRandomColor(),
              finalBlue = getRandomColor();

          angular.element($window).on('scroll', function () {
            var currentRelativePosition = scroll.getRelativePosition(),
                currentScrollDirection = (currentRelativePosition - previousRelativePosition > 0 ? 1 : -1);
            if (currentScrollDirection === previousScrollDirection) {

            } else {
              initialRelativePosition = previousRelativePosition;
              initialRed = previousRed;
              initialGreen = previousGreen;
              initialBlue = previousBlue;
              finalRelativePosition = (currentScrollDirection === 1 ? 1 : 0);
              finalRed = getRandomColor();
              finalGreen = getRandomColor();
              finalBlue = getRandomColor();
            }
            var colorRelativePosition = (currentRelativePosition - initialRelativePosition) / (finalRelativePosition - initialRelativePosition),
                currentRed = getIntermediateColor(initialRed, finalRed, colorRelativePosition),
                currentGreen = getIntermediateColor(initialGreen, finalGreen, colorRelativePosition),
                currentBlue = getIntermediateColor(initialBlue, finalBlue, colorRelativePosition);
            setColor(currentRed, currentGreen, currentBlue);
            previousRelativePosition = currentRelativePosition;
            previousScrollDirection = currentScrollDirection;
            previousRed = currentRed;
            previousGreen = currentGreen;
            previousBlue = currentBlue;
          });

          setColor(initialRed, initialGreen, initialBlue);
        }
      };
    })
    .directive('ppFunkyPath', function ($window, scroll) {
      return {
        type: 'svg',
        restrict: 'E',
        replace: true,
        templateUrl: 'funky-path-template.html',
        link: function (scope) {
          function setPathDefinition () {
            scope.pathDefinition =
              'M ' +
              currentVertices.map(function (vertex) {
                return '' + vertex.x + ' ' + vertex.y + ' ';
              }).join('L ') +
              'Z';
          }

          var lozengeVertices = [
            {x: 50, y: 0},
            {x: 100, y: 50},
            {x: 50, y: 100},
            {x: 0, y: 50}
          ], triangleVertices = [
            {x: 50, y: 0},
            {x: 93.3, y: 75},
            {x: 50, y: 75},
            {x: 6.7, y: 75}
          ];
          var currentVertices = angular.copy(lozengeVertices);

          setPathDefinition();

          angular.element($window).on('scroll', function () {
            var relativePosition = scroll.getRelativePosition();
            for (var i = 0; i < 4; i++) {
              ['x', 'y'].forEach(function (coord) {
                currentVertices[i][coord] = lozengeVertices[i][coord] + (triangleVertices[i][coord] - lozengeVertices[i][coord]) * relativePosition;
              });
            }
            scope.$apply(setPathDefinition);
          });
        }
      };
    });

})();