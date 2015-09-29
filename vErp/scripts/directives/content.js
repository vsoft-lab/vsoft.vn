angular.module('xMoney')
	.directive('myContent', function () {
		return {
			restrict: 'ECMA',
			transclude: false,
			link: function (scope, el, attr) {

			}
		}
	})


	.directive('fixHeight', function ($window) {
		return {
			restrict: 'ECMA',
			transclude: false,
			scope: {},
			link: function (scope, el, attr) {


				var ele = $(el[0]);
				ele.height(window.innerHeight - ele.offset().top);

				$(window).resize(function () {
					ele.height(window.innerHeight - ele.offset().top);
				});


			}
		}
	})

	.directive('myScroll', function () {
		return {
			restrict: 'ECMA',
			transclude: false,
			link: function (scope, el, attr) {
				angular.element(el).attr('id', 'iscroll-directive');
				new IScroll(el[0], {mouseWheel: true});
			}
		}
	})
	.directive('swipeLeft', function () {
		return {
			restrict: 'ECMA',
			transclude: false,
			link: function (scope, el, attr) {

				ionic.onGesture('swipe', function ($event) {

					if ($event.gesture.direction == 'left') {
						scope.$apply(attr.swipeLeft);
					}
				}, el[0]);
			}
		}
	})
	.directive('swipeRight', function () {
		return {
			restrict: 'ECMA',
			transclude: false,
			link: function (scope, el, attr) {

				ionic.onGesture('swipe', function ($event) {

					if ($event.gesture.direction == 'right') {
						scope.$apply(attr.swipeRight);
					}
				}, el[0]);
			}
		}
	})
	.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if (event.which === 13) {
					scope.$apply(function () {
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	});
