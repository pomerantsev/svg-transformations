(function () {



  angular.module('app', [])
    .controller('MainController', function ($scope, $window, $document) {
    })
    .factory('utils', function () {
      return {
        safeApply: function (scope, callback) {
          var phase = scope.$root.$$phase;
          if(phase === '$apply' || phase === '$digest') {
            scope.$eval(callback);
          } else {
            scope.$apply(callback);
          }
        }
      };
    })
    .factory('scroll', function ($window, $document) {
      return {
        getRelativePosition: function () {
          var scrollHeight = $document[0].body.offsetHeight - $window.innerHeight;
          if (scrollHeight > 0) {
            return Math.max(Math.min($window.pageYOffset / scrollHeight, 1), 0);
          } else {
            return 0;
          }
        }
      };
    })
    .directive('ppInverseScrolling', function ($window, $document, utils, scroll) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {},
        templateUrl: 'inverse-scrolling-template.html',
        link: function (scope, element) {
          function getYTranslate () {
            var scrollHeight = $window.innerHeight - element[0].offsetHeight;
            if (scrollHeight > 0) {
              return Math.max(Math.min($window.pageYOffset + scrollHeight * scroll.getRelativePosition(), $document[0].body.offsetHeight - element[0].offsetHeight), 0);
            } else {
              return 0;
            }
          }

          function updateTranslate () {
            utils.safeApply(scope, function () {
              scope.yTranslate = getYTranslate();
            });
          }

          updateTranslate();

          angular.element($window).on('scroll', updateTranslate);
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

          var previousScrollDirection,
              initialRed = previousRed = getRandomColor(),
              initialGreen = previousGreen = getRandomColor(),
              initialBlue = previousBlue = getRandomColor(),
              initialRelativePosition = previousRelativePosition = scroll.getRelativePosition(),
              finalRelativePosition;

          angular.element($window).on('scroll', function () {
            var currentRelativePosition = scroll.getRelativePosition(),
                currentScrollDirection = (currentRelativePosition - previousRelativePosition > 0 ? 1 : -1);
            if (!previousScrollDirection || currentScrollDirection !== previousScrollDirection) {
              initialRelativePosition = previousRelativePosition;
              initialRed = previousRed;
              initialGreen = previousGreen;
              initialBlue = previousBlue;
              finalRelativePosition = (currentScrollDirection === 1 ? 1 : 0);
              finalRed = getRandomColor();
              finalGreen = getRandomColor();
              finalBlue = getRandomColor();
            }
            var colorRelativePosition = (finalRelativePosition === initialRelativePosition ? 0 : (currentRelativePosition - initialRelativePosition) / (finalRelativePosition - initialRelativePosition)),
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
    .directive('ppFunkyPath', function ($window, utils, scroll) {
      return {
        type: 'svg',
        restrict: 'E',
        replace: true,
        templateUrl: 'funky-path-template.html',
        link: function (scope) {
          function updatePath () {
            var relativePosition = scroll.getRelativePosition();
            if (relativePosition <= 0.5) {
              for (var i = 0; i < 4; i++) {
                ['x', 'y'].forEach(function (coord) {
                  currentVertices[i][coord] = lozengeVertices[i][coord] + (triangleVerticesWithOneAdditional[i][coord] - lozengeVertices[i][coord]) * relativePosition * 2;
                });
              }
              utils.safeApply(scope, function () {
                scope.pathDefinition =
                  'M ' +
                  currentVertices.map(function (vertex) {
                    return '' + vertex.x + ' ' + vertex.y + ' ';
                  }).join('L ') +
                  'Z';
              });
            } else {
              var radius = 50 / (2 * relativePosition - 1);
              utils.safeApply(scope, function () {
                scope.pathDefinition =
                  'M ' + triangleVertices[2].x + ' ' + triangleVertices[2].y + ' ' +
                  triangleVertices.map(function (vertex) {
                    return 'A ' + radius + ' ' + radius + ' 0 0 1 ' + vertex.x + ' ' + vertex.y + ' ';
                  });
              });
            }
          }

          var lozengeVertices = [
            {x: 50, y: 0},
            {x: 100, y: 50},
            {x: 50, y: 100},
            {x: 0, y: 50}
          ], triangleVerticesWithOneAdditional = [
            {x: 50, y: 0},
            {x: 93.3, y: 75},
            {x: 50, y: 75},
            {x: 6.7, y: 75}
          ], triangleVertices = [
            {x: 50, y: 0},
            {x: 93.3, y: 75},
            {x: 6.7, y: 75}
          ],
          minArcRadius = 50,
          currentVertices = angular.copy(lozengeVertices);

          updatePath();

          angular.element($window).on('scroll', updatePath);
        }
      };
    });

})();
