"use strict";

window.appUri = {
    BaseUri: "",
    AttachmentUri: ""
};



angular.module('xMoney',
    [
        'ngSanitize',
        'ui.router',
        'infinite-scroll',
        'lrInfiniteScroll',
        'highcharts-ng',
        'nsPopover',
        'angular-gestures',
        'ngDialog',
        'xDate',
        'fcsa-number',
        'pasvaz.bindonce',
        'angularFileUpload',
        'mobiscroll-datetime'
    ]
)

    .config(function ($stateProvider, $urlRouterProvider, ngDialogProvider) {

        ngDialogProvider.setDefaults({
            className: 'ngdialog-theme-default',
            plain: false,
            showClose: false,
            closeByDocument: true,
            closeByEscape: true,
            appendTo: true
        });

        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'views/app.html',
                controller: 'AppController',
                resolve: {
                    global: function ($rootScope, $q){
                        console.log('run');
                        var defer = $q.defer();

                        try{
                            var _config = localStorage.getItem('Global');
                            window.appUri = JSON.parse(_config);
                            $rootScope.AttachmentUri = appUri.AttachmentUri;
                        }catch(e){
                            $rootScope.logout();
                        }
                        
                        defer.resolve({});

                        return defer.promise;
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    settings: function (xService, SETTINGS, $q, $rootScope) {
                        
                        /*
                         * Load toan bo settings vao factory truoc khi vao ung dung
                         * */

                        var defer = $q.defer();

                        if (!xService.getSystemSetting() || _.size(xService.getSystemSetting()) == 0) {
                            var _setting = {
                                LimitRecordDefault: 10,
                                LimitRecordWhenNextPage: 5
                            };
                            xService.setSystemSetting(_setting);
                        }


                        SETTINGS.loadSettings([ // Ten file config tuong ung trong settings_xml
                            'Menu',
                            'global'

                        ], function (err, resp) {
                            if (err) {
                                defer.resolve();
                            } else {

                                $rootScope._Menu = resp[0].Menu;

                                localStorage.setItem('Global', JSON.stringify({
                                    BaseUri: resp[1].BaseUri,
                                    AttachmentUri: resp[1].AttachmentUri
                                }));

                                appUri = {
                                    BaseUri: resp[1].BaseUri,
                                    AttachmentUri: resp[1].AttachmentUri
                                };


                                setDefaultState($rootScope._Menu[0].Url);
                                defer.resolve(resp);
                            }

                        });
                        return defer.promise;
                    }
                }


            })



            .state('app.list', {
                url: '/list/:state',
                templateUrl: 'views/xList/list.html',
                controller: 'appListController'
            })

            .state('app.detail', {
                url: '/detail/:state/:id',
                templateUrl: 'views/xList/detail.html',
                controller: 'appDetailController'
            })


            .state('app.tasksDiagram', {
                url: '/tasks/diagrams/:url',
                templateUrl: 'views/tasks/diagram.html'
            })


            /*
             * Contract
             * */

            .state('app.contractsDiagram', {
                url: '/contracts/diagrams/:url',
                templateUrl: 'views/contracts/diagram.html'
            })


            .state('app.projectsDiagram', {
                url: '/projects/diagrams/:url',
                templateUrl: 'views/projects/diagram.html'
            })

            /*
             * Product
             * */

            .state('app.productsDiagram', {
                url: '/products/diagrams/:url',
                templateUrl: 'views/products/diagram.html'
            })

            .state('app.notification', {
                url: '/notification',
                templateUrl: 'views/xList/notification.html',
                controller: 'NotificationCtrl'
            })
            .state('app.DetailNotification', {
                url: '/notification/:url',
                templateUrl: 'views/xList/DetailNotification.html',
                controller: 'DetailNotificationCtrl'
            })

            .state('app.settings', {
                url: '/settings',
                templateUrl: 'views/settings/setting.html',
                controller: 'settingCtrl'
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })
    .run(['$rootScope', '$state', 'SETTINGS', 'ngDialog', '$location', '$urlRouter', 'xService',
        function ($rootScope, $state, SETTINGS, ngDialog, $location, $urlRouter, xService) {


            var listModalId = [];

            $rootScope.stateHistory = {};

            $rootScope.stateSettingFile = "";


            $rootScope.$on('ngDialog.opened', function (e, $dialog) {
                listModalId.push($dialog.attr('id'));
            });
            $rootScope.$on('ngDialog.closed', function (e, $dialog) {
                listModalId.splice(listModalId.indexOf($dialog.attr('id')), 1);
            });


            /*
             * Listen when user touch in back button
             * */
            document.addEventListener("backbutton", function (e) {
                if (listModalId.length > 0) {
                    ngDialog.closeAll();
                } else {
                    if (window.history.length > 0) {
                        window.history.back();
                    } else {

                    }
                }

                e.preventDefault();
                return false;
            }, false);


            $rootScope.$state = $state;

            $rootScope.closeKeyboard = function () {
                if (window.hasOwnProperty('cordova')) {
                    SoftKeyboard.hide();
                } else {
                    console.log('not plugin keyboard');
                }
            };

            $rootScope.logout = function () {
                clearStorage();
                $state.go('login');
            };


            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {    
                    
                    if (toState.name == 'login') {
                        if (window.localStorage.getItem('LoggedOnUser') != null) {
                            event.preventDefault();
                            $state.go('app.list', {state: getDefaultState()});
                        }
                    }

                    if (toState.name.indexOf('app') !== -1) {

                        var stateInfo = {
                            name: toState.name,
                            params: toParams
                        };


                        SETTINGS.getSettings('Menu', function (err, _menu) {

                            for (var i = 0, j = _menu['Menu'].length; i < j; i++) {

                                if (_menu['Menu'][i].Url == toParams.state) {

                                    $rootScope.stateSettingFile = _menu['Menu'][i].SettingFile;

                                    $rootScope.stateHistory[_menu['Menu'][i].NameEn] = stateInfo;

                                    $rootScope.menuIndex = i;
                                    break;

                                } else {
                                    for (var k = 0, l = _menu['Menu'][i].SubMenu.length; k < l; k++) {

                                        if (_menu['Menu'][i].SubMenu[k].Url == toParams.state) {

                                            $rootScope.stateSettingFile = _menu['Menu'][i].SubMenu[k].SettingFile;
                                            $rootScope.stateHistory[_menu['Menu'][i].NameEn] = stateInfo;
                                            $rootScope.menuIndex = i;
                                            break;
                                        } else if (_menu['Menu'][i].SubMenu[k].Url == toParams.url) {
                                            $rootScope.stateSettingFile = _menu['Menu'][i].SettingFile;
                                            $rootScope.stateHistory[_menu['Menu'][i].NameEn] = stateInfo;
                                            $rootScope.menuIndex = i;
                                            break;
                                        }
                                    }
                                }
                            }
                        });


                        if (!window.localStorage.getItem('LoggedOnUser')) {
                            event.preventDefault();
                            clearStorage();
                            $state.go('login');
                        }
                    }
                });


        }]);


//A little hack to add an $off() method to $scopes.
(function () {
    var injector = angular.injector(['ng']),
        rootScope = injector.get('$rootScope');
    rootScope.constructor.prototype.$off = function (eventName, fn) {
        if (this.$$listeners) {
            var eventArr = this.$$listeners[eventName];
            if (eventArr) {
                for (var i = 0; i < eventArr.length; i++) {
                    if (eventArr[i] === fn) {
                        eventArr.splice(i, 1);
                    }
                }
            }
        }
    }
}());