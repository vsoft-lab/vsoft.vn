'use strict';


angular.module('xMoney')

    .controller('DetailNotificationCtrl',
    ["$scope", "xService", 'SETTINGS', '$timeout', '$state', 'auth',
        function ($scope, xService, SETTINGS, $timeout, $state, auth) {


            var getSourceParams = function (sourceStr, callback) {
                if (_.isString(sourceStr)) {
                    var source = sourceStr.split('.');
                    SETTINGS.getSettings('requests/' + source[0], function (err, config) {
                        callback(err, config[source[1]]);
                    });
                } else {
                    callback(null, sourceStr);
                }
            };

            var getDataSource = function (params, config, callback) {

                if (config.hasOwnProperty('DistanceDateFromToday')) {
                    params['StartDate'] = moment().format("YYYY-MM-DD");
                    params['EndDate'] = moment().add(parseInt(config.DistanceDateFromToday), 'days').format("YYYY-MM-DD");
                }

                if (config.hasOwnProperty('ConditionFieldByUid')) {
                    params[config.ConditionFieldByUid] = auth.getUser().UserId
                }

                xService.requestServer(params, function (err, resp) {
                    callback(err, resp)
                });
            };


            SETTINGS.getSettings('notifications', function (err, setting) {
                if (!err) {
                    $timeout(function () {
                        init(JSON.stringify(setting));
                    })
                }
            });

            function init(setting) {
                var NotifySetting = JSON.parse(setting);
                $scope.notifyDataSource = [];
                $scope.dataLoaded = false;

                $scope.indexCurrentSetting = parseInt(_.last($state.params.url.split('-')));

                $scope.currentNotifySetting = NotifySetting.Tabs[$scope.indexCurrentSetting];

                getSourceParams($scope.currentNotifySetting.Source, function (err, resp) {
                    if (!err) {

                        $scope.currentNotifySetting.Source = resp;

                        resp['StartIndex'] = 1;
                        resp['EndIndex'] = xService.getSystemSetting().LimitRecordDefault;

                        getDataSource(resp, $scope.currentNotifySetting, function (err, resp) {
                            $scope.dataLoaded = true;
                            if (!err) {
                                $scope.notifyDataSource = resp.datasource;
                            }
                        })
                    }
                });

                $scope.loadMore = function () {
                    getSourceParams($scope.currentNotifySetting.Source, function (err, resp) {
                        if (!err) {
                            console.log('leu leu leu', resp);

                            /*getDataSource(resp, $scope.currentNotifySetting, function(err, resp){
                             $scope.dataLoaded = true;
                             if(!err){
                             $scope.notifyDataSource = resp.datasource;
                             }
                             })*/
                        }
                    });
                }
            }


        }]);