'use strict';

angular.module('xMoney')
    .factory('SETTINGS', [ "$http", '$state', '$rootScope', 'xService', function ($http, $state, $rootScope, xService) {
        var settings = {};
        return {
            loadSettings: function (filename, callback) {
                filename = (_.isArray(filename)) ? filename : [filename];

                var _listSettingsTask = [],
                    file = "";

                angular.forEach(filename, function (file, key) {
                    _listSettingsTask.push(function (callback) {
                        xService.getSettingsFromXML(file, function (result) {
                            if (result) {
                                settings[file] = result;
                                callback(null, result);
                            } else {
                                callback(new Error('Can not get settings'));
                            }

                        })
                    })
                });


                try {
                    async.series(_listSettingsTask, function (err, resp) {
                        if (err) {
                            /*alert('load settings false');*/
                            console.log('Load setting false')
                        }

                        if (typeof callback == 'function') callback(err, resp);
                    })
                } catch (e) {

                }


            },
            getSettings: function (file, callback) {
                if (settings.hasOwnProperty(file)) {
                    callback(null, settings[file]);
                } else {
                    xService.getSettingsFromXML(file, function (result) {
                        if (result) {
                            settings[file] = result;
                            callback(null, result);
                        } else {
                            callback(new Error('Can not get settings'));
                        }

                    })
                }
                /*return settings[file];*/
            }
        }
    }]);