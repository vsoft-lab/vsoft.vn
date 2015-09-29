'use strict';


angular.module('xMoney')
    .service('xService', ["$http", '$rootScope', 'auth', function ($http, $rootScope, auth) {

        $http.defaults.useXDomain = true;

        return {
            // Lấy dữ liệu từ trên server
            requestServer: function (paramsData, paramType, cb) {
                cb = (paramType && angular.isFunction(paramType)) ? paramType : cb;

                paramsData.SessionId = auth.getSessionId();

                var requestInfo = {
                    url: appUri.BaseUri,
                    method: "POST",
                    data: paramsData,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                };

                if (paramType !== 'json') {
                    _.extend(requestInfo, {
                            transformRequest: function (data) {
                                return $.param(data);
                            }
                        }
                    );
                }

                $http(requestInfo).success(function (data) {

                    var newsData = {
                        datasource: [],
                        totalcount: data.TotalCount
                    };
                    if (data.hasOwnProperty('Message') && data.Message == 'Exception raised, please contact administrator for more details!') {
                        toastr.warning('Phiên đăng nhập của bạn đã bị hêt hạn !');
                        $rootScope.logout();
                        return cb(true, null);
                    } else {
                        
                        if (data != undefined && data.Data != undefined && angular.isObject(data.Data)) {

                            for (var dsName in data.Data) {
                                for (var ds in data.Data[dsName]) {
                                    if (data.Data[dsName][ds].length > 0) {
                                        newsData.datasource = data.Data[dsName][ds];

                                    } else {
                                        newsData.datasource = [data.Data[dsName][ds]];

                                    }
                                }
                            }

                            return cb(null, newsData);
                        } else if (data != undefined && !(data.hasOwnProperty('success') || data.hasOwnProperty('msg'))) {

                            for (var dsName in data) {
                                for (var ds in data[dsName]) {
                                    if (data[dsName][ds].length > 0) {
                                        newsData.datasource = data[dsName][ds];
                                    } else {
                                        newsData.datasource = [data[dsName][ds]];
                                    }
                                }
                            }
                            return cb(null, newsData);
                        } else {

                            if (data.hasOwnProperty('success') | data.hasOwnProperty('msg')) {

                                return (data.success) ? cb(null, data) : cb(true, null);

                            } else {
                                return cb(true, null);
                            }

                        }
                    }

                }).error(function (err) {
                    return cb(err, null);
                })
            },

            getSettingsFromJson: function (jsonFile, callback) {
                var jsonContent;
                var jsonLink = jsonConfig.jsonSettingPath + jsonFile + ".json";
                $http.get(jsonLink, {transformResponse: null}).success(function (data) {
                    jsonContent = JSON.parse(data);
                    callback(jsonContent);
                }).error(function (data, status, headers, config) {
                    callback(null);
                });
            },
            // Lấy dữ liệu từ file XML
            getSettingsFromXML: function (xmlFile, callback) {
                var xmlContent;
                var xmlLink = xmlConfig.xmlSettingPath + xmlFile + ".xml";
                $http.get(xmlLink, {transformResponse: null}).success(function (data) {
                    xmlContent = $.xml2json(data, false);
                    console.log("Data XML to JSON:", xmlContent);
                    callback(xmlContent);
                }).error(function (data, status, headers, config) {
                    callback(null);
                });
            },

            // Lấy dữ liệu từ server nhưng không xử lý lại dữ liệu.
            requestServerNative: function (paramsData, paramType, cb) {

                cb = (paramType && angular.isFunction(paramType)) ? paramType : cb;

                paramsData.SessionId = auth.getSessionId();

                var requestInfo = {
                    url: appUri.BaseUri,
                    method: "POST",
                    data: paramsData,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                };

                if (paramType !== 'json') {
                    _.extend(requestInfo, {
                            transformRequest: function (data) {
                                return $.param(data);
                            }
                        }
                    );
                }

                $http(requestInfo).success(function (data) {
                    return cb(null, data);
                }).error(function (err) {
                    return cb(err, null);
                })
            },
            
            getSystemSetting: function (){
                var _setting = JSON.parse(getItemLocalStorage('SystemSetting'));
                return  _setting || {};
            },
            setSystemSetting: function (setting){
                 setItemLocalStorage('SystemSetting', JSON.stringify(setting));
            },
            setDefaultState: function (stateUrl){
                setItemLocalStorage('DefaultState', JSON.stringify(stateUrl));
            },
            getDefaultState: function (){
                var _setting = JSON.parse(getItemLocalStorage('DefaultState'));
                return  _setting || {};
            }
        }
    }
    ])
;