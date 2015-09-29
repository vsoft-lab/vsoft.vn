angular.module('xMoney')
    .directive('numberRic', ['$parse', '$filter', function ($parse, $filter) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                model: '&ngModel'
            },
            link: function (scope, element, attrs, ngModelCtrl) {

                scope.$watch(scope.model, function () {
                    if (scope.model && typeof scope.model == 'string') {
                        scope.model = $filter('currency')(convetToFloat(scope.model));
                    }
                })

            }
        };
    }])
    
    .directive('filterDate', function ($filter) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelController) {

                ngModelController.$parsers.push(function (data) {
                    //convert data from view format to model format
                    var date = moment(data, ["MM-DD-YYYY", "DD-MM-YYYY"]).format();

                    return date; //converted
                });

                ngModelController.$formatters.push(function (data) {
                    //convert data from model format to view format

                    return $filter('date')(data, 'dd-MM-yyyy'); //converted
                });
            }
        }
    })

    .filter('buildtitle', function () {
        return function (model, field,  prefix) {

            if (model) {
                var tit = field.split(';');

                var str = [];

                for (var i = 0; i < tit.length; i++) {
                    if (model.hasOwnProperty(tit[i])) {
                        str.push(model[tit[i]]);
                    }
                }
                return str.join(' : ');
            } else {
                return "";
            }
        }
    })

    .filter('builddata', function ($filter) { // Loc du lieu dau ra cho xlist
        return function (model, type, field) {

            if (model) {
                var Vmodel = model.hasOwnProperty(field) ? model[field] : null;

                switch (type) {
                    case 'number':
                        var int = parseInt(Vmodel);
                        return $filter('number')(int) || 0;
                        break;
                    case 'date':

                        var date = moment(Vmodel).format('DD-MM-YYYY');
                        if(date != 'Invalid date'){
                            return date;
                        }else {
                            return '';
                        }
                        break;
                    case 'money':
                        return $filter('number')(Vmodel);
                        break;
                    case 'percent':
                        return Vmodel + ' %';
                        break;
                    case 'select':
                        return model.hasOwnProperty(field + 'Name') ? model[field + 'Name'] : null;
                        break;
                    default:
                        return Vmodel || '';
                        break;
                }

            } else {
                return "";
            }

        }
    })


    .filter('formatmetric', function () { // Format so hang ngin 1000 = 1K
        return function (number) {

            function abbrNum(number, decPlaces) {
                number = parseInt(number);

                // 2 decimal places => 100, 3 => 1000, etc
                decPlaces = Math.pow(10, decPlaces);

                // Enumerate number abbreviations
                var abbrev = [ "K", "M", "B", "T" ];

                // Go through the array backwards, so we do the largest first
                for (var i = abbrev.length - 1; i >= 0; i--) {

                    // Convert array index to "1000", "1000000", etc
                    var size = Math.pow(10, (i + 1) * 3);

                    // If the number is bigger or equal do the abbreviation
                    if (size <= number) {
                        // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                        // This gives us nice rounding to a particular decimal place.
                        number = Math.round(number * decPlaces / size) / decPlaces;

                        // Handle special case where we round up to the next abbreviation
                        if ((number == 1000) && (i < abbrev.length - 1)) {
                            number = 1;
                            i++;
                        }

                        // Add the letter for the abbreviation
                        number += abbrev[i];

                        // We are done... stop
                        break;
                    }
                }

                if (isNaN(number) && !number.hasOwnProperty('length')) {
                    return 0
                } else {
                    return number;
                }
            }

            return abbrNum(number, 2);
        }
    })
    .directive('onScroll', ['$parse', '$ionicScrollDelegate', function ($parse, $ionicScrollDelegate) {
        return {
            restrict: 'A',

            link: function (scope, element, attrs, ngModelCtrl) {
                var elScroll;
                element.bind('scroll', function () {
                    elScroll = $(element).scrollTop();

                    /*console.log('elScroll', element, $ionicScrollDelegate.getScrollView(scope));*/
                });
            }
        };
    }])
    .directive("updateScope", function () {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {
                element.change(function () {
                    /*console.log(element.val());*/
                    ngModel.$setViewValue(element.val());
                    scope.$apply();
                })
            }
        }
    })
    .directive('inputName', function ($compile) {
        return {
            scope: {
                inputName: '&'
            },
            require: ['ngModel', '^form'],
            restrict: 'ECMA',
            link: function ($scope, $element, $attrs, ctrls) {
                ctrls[0].$name = $scope.inputName();
                
            }
        }
    })
    .directive('dateSelect', function () {
        return {
            scope: true,
            restrict: 'ECMA',
            link: function ($scope, $element) {
                $element.click(function () {
                    $element.siblings('input').css('display', 'block');
                    $element.siblings('input').focus();
                    console.log($element.siblings('input[type="date"]'));
                })
            }
        }
    })
    .directive('gestureDetect', function ( $rootScope) {

        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {

                var gestureType = attrs.gestureType;
                var func = function (event) {
                    switch (event.gesture.direction) {
                        case 'right':
                            $rootScope.$broadcast('$gesture.swipe.right');
                            break;
                        case 'left':
                            $rootScope.$broadcast('$gesture.swipe.left');
                            break;
                    }
                };
                switch (gestureType) {
                    case 'swipe':
                        ionic.gestures.on('swipe', func, elem);
                        break;
                    case 'swiperight':
                        ionic.gestures.on('swiperight', func, elem);
                        break;
                    case 'swipeleft':
                        ionic.gestures.on('swipeleft', func, elem);
                        break;
                    case 'doubletap':
                        ionic.gestures.on('doubletap', func, elem);
                        break;
                    case 'tap':
                        ionic.gestures.on('tap', func, elem);
                        break;
                }

            }
        }
    })
    .directive(
    'inputDate',
    ['$compile', '$parse', '$ionicModal', 'xService', '$ionicPopup', '$ionicPopover', '$filter', '$state', '$ionicLoading', '$window', '$timeout', '$rootScope', '$ionicSlideBoxDelegate',
        function ($compile, $parse, $ionicModal, xService, $ionicPopup, $ionicPopover, $filter, $state, $ionicLoading, $window, $timeout, $rootScope, $ionicSlideBoxDelegate) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                /*scope: {
                 data: '&'
                 },*/
                template: '<input type="date" ng-model="date" data-mode="date" style="display:none">' +
                    '<input type="text" value="{{date}}" >',
                compile: function (element, attr, linker) {
                    return function ($scope, $element, $attr, $ngModel) {
                        $scope.date = $ngModel.$modelValue;

                        console.log('bla b;la', $ngModel.$modelValue);
                        $scope.$watch('$ngModel', function (value) {
                            console.log('date change', value);
                        })
                        /*setTimeout(function (){
                         console.log($scope.data($scope))
                         }, 10000)*/


                    }
                }

            }
        }])

        .directive('dateformat', function ($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                    $(function () {
                        element = $(element);
                        var opts = {
                            theme: 'android-holo-light',     // Specify theme like: theme: 'ios' or omit setting to use default 
                            mode: 'scroller',       // Specify scroller mode like: mode: 'mixed' or omit setting to use default 
                            display: 'modal',
                            dateFormat: 'dd-mm-yyyy',
                            endYear: new Date().getFullYear() + 5,
                            startYear : new Date().getFullYear() - 10,
                            monthNamesShort: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                            buttons: [
                                        'set',
                                        'clear',
                                        'cancel'
                                    ],
                            delay: 0
                        };
                        element.mobiscroll().date(opts);
                        
                        element.on('change', function (event){
                            var newVal = element.val();

                            ngModelCtrl.$setViewValue(newVal);
                            ngModelCtrl.$render();
                            event.preventDefault();
                            scope.$apply();
                        });

                        ngModelCtrl.$parsers.push(function (data) {
                            //convert data from view format to model format
                            var date = moment(data, ["MM-DD-YYYY", "DD-MM-YYYY"]).format();

                            return date; //converted
                        });

                        ngModelCtrl.$formatters.push(function (data) {
                            //convert data from model format to view format

                            return $filter('date')(data, 'dd-MM-yyyy'); //converted
                        });
                    });
                }
            };
        });



