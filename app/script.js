(function () {
  function utilsFactory () {
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
  }

  function scrollFactory ($window, $document) {
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
  }

  function inverseScrollingDirective ($window, $document, utils, scroll) {
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
  }

  function iridescentDirective ($window, scroll) {
    return {
      link: function (scope, element, attrs) {
        function getRandomColor() {
          function getRandomPrimaryColor () {
            return Math.floor(Math.random() * 256);
          }
          return [getRandomPrimaryColor(), getRandomPrimaryColor(), getRandomPrimaryColor()];
        }

        function setColor (color) {
          function getFullColor () {
            return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
          }
          element.css({
            stroke: getFullColor(),
            fill: getFullColor()
          });
        }

        function getIntermediateColor (initialColor, finalColor, relative) {
          var intermediateColor = [];
          for (var i = 0; i < 3; i++) {
            intermediateColor[i] = Math.round(initialColor[i] + (finalColor[i] - initialColor[i]) * relative);
          }
          return intermediateColor;
        }

        var previousScrollDirection,
            initialColor = getRandomColor(),
            previousColor = angular.copy(initialColor),
            initialRelativePosition = previousRelativePosition = scroll.getRelativePosition(),
            finalRelativePosition;

        setColor(initialColor);

        angular.element($window).on('scroll', function () {
          var currentRelativePosition = scroll.getRelativePosition(),
              currentScrollDirection = (currentRelativePosition - previousRelativePosition > 0 ? 1 : -1);
          if (!previousScrollDirection || currentScrollDirection !== previousScrollDirection) {
            initialRelativePosition = previousRelativePosition;
            initialColor = angular.copy(previousColor);
            finalRelativePosition = (currentScrollDirection === 1 ? 1 : 0);
            finalColor = getRandomColor();
          }
          var colorRelativePosition = (finalRelativePosition === initialRelativePosition ? 0 : (currentRelativePosition - initialRelativePosition) / (finalRelativePosition - initialRelativePosition)),
              currentColor = getIntermediateColor(initialColor, finalColor, colorRelativePosition);
          setColor(currentColor);
          previousRelativePosition = currentRelativePosition;
          previousScrollDirection = currentScrollDirection;
          previousColor = angular.copy(currentColor);
        });
      }
    };
  }

  function funkyPathDirective ($window, utils, scroll) {
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
          {x: 60, y: 10},
          {x: 110, y: 60},
          {x: 60, y: 110},
          {x: 10, y: 60}
        ], triangleVerticesWithOneAdditional = [
          {x: 60, y: 10},
          {x: 103.3, y: 85},
          {x: 60, y: 85},
          {x: 16.7, y: 85}
        ], triangleVertices = [
          {x: 60, y: 10},
          {x: 103.3, y: 85},
          {x: 16.7, y: 85}
        ],
        minArcRadius = 50,
        currentVertices = angular.copy(lozengeVertices);

        updatePath();

        angular.element($window).on('scroll', updatePath);
      }
    };
  }

  angular.module('app', [])
    .factory('utils', utilsFactory)
    .factory('scroll', scrollFactory)
    .directive('ppInverseScrolling', inverseScrollingDirective)
    .directive('ppIridescent', iridescentDirective)
    .directive('ppFunkyPath', funkyPathDirective);

})();
