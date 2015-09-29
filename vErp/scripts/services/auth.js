'use strict';

angular.module('xMoney')
    .factory('auth', [ "$http", '$state', '$rootScope', function ($http, $state, $rootScope) {
        $http.defaults.useXDomain = true;

        return {

            getUser: function () {
                return JSON.parse(getItemLocalStorage(localStorageConstant.LoggedOnUser)) || {};
            },
            login: function (username, password, server, callback) {
                var me = this;
                var loginParams = {
                    RequestClass: 'BPM',
                    RequestAction: 'SignIn',
                    Account: username,
                    Password: password
                };


                if (server) {
                    loginParams.DataServer = server;
                } else if (loginParams.hasOwnProperty("DataServer")) {
                    delete loginParams.DataServer;
                }

                $http({
                    url: appUri.BaseUri,
                    method: "POST",
                    data: loginParams,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    transformRequest: function (data) {
                        return $.param(data);
                    }
                }).success(function (data) {
                    if (data) {
                        me.setSessionId(data);
                        me.loadUserInfomation(data);
                        callback(null, data);
                        return false;
                    }
                    else {
                        callback(true, null);
                        return false;
                    }
                }).error(function (err) {
                    alert("Không kết nối được tới server. Vui lòng thử lại");
                    callback(true, null);
                    return false;
                })
            },
            setSessionId: function (sessionId) {
                setItemLocalStorage(localStorageConstant.SessionId, sessionId);
            },
            getSessionId: function () {
                return getItemLocalStorage(localStorageConstant.SessionId) || null;
            },

            loadUserInfomation: function (sessionId) {
                var params = {
                    RequestAction: 'GetUserInformation',
                    RequestClass: 'BPM',
                    SessionId: sessionId
                };

                $http({
                    url: appUri.BaseUri+"/userInfo",
                    method: "POST",
                    data: params,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    transformRequest: function (data) {

                        return $.param(data);
                    }
                }).success(function (data) {
	                console.log("Data User", data);
                    var user = {};
                    if (data.UserDS.User != undefined) {
                        user = data.UserDS.User.length > 0 ? data.UserDS.User[0] : data.UserDS.User;
                        setItemLocalStorage(localStorageConstant.UserId, user.UserId);
                        try {
                            var userData = $.xml2json(user.Data, true);
                            user.Email = userData.Data[0].Dynamic[0].Email[0].text;
                            var avatar = userData.Data[0].Dynamic[0].Avatar[0].text;
                            if (avatar != null && avatar != undefined) {
                                user.Avatar = settings.account_avatar_path + avatar;
                            } else {
                                user.Avatar = "/assets/img/none-avatar.png";
                            }
                        } catch (e) {
                            user.Avatar = "/assets/img/none-avatar.png";
                        }

                        user.Roles = [];
                        user.Groups = [];
                        if (data.UserDS.Group != undefined) {
                            var arrGroup = data.UserDS.Group.length > 0 ? data.UserDS.Group : [data.UserDS.Group];
                            for (var i = 0; i < arrGroup.length; i++) {
                                switch (arrGroup[i].GroupType) {
                                    case "0":
                                        user.Roles.push(arrGroup[i]);
                                        if ((user.DefaultRoleId == undefined | user.DefaultRoleId == null) & arrGroup[i].GroupId != undefined) {
                                            user.DefaultRoleId = arrGroup[i].GroupId;
                                            user.DefaultRoleName = arrGroup[i].GroupName;
                                        }
                                        break;
                                    case "1":
                                        user.Groups.push(arrGroup[i]);
                                        if ((user.DefaultGroupId == undefined | user.DefaultGroupId == null) & arrGroup[i].GroupId != undefined) {
                                            user.DefaultGroupId = arrGroup[i].GroupId;
                                            user.DefaultGroupName = arrGroup[i].GroupName;
                                        }
                                        break;
                                }
                            }
                        }

                        if (user != null) {
                            //lưu thông tin người dùng

                            setItemLocalStorage(localStorageConstant.LoggedOnUser, JSON.stringify(user));
                            $rootScope.logonUser = user;
                            $state.go('app.list', {'state': getDefaultState()}); // Go to dashboard state
                        }
                    } else {
                        alert('Không tìm thấy thông tin tài khoản này. Vui lòng thử lại');
                    }
                }).error(function (error) {
                    alert("Không kết nối được tới server. Vui lòng thử lại");

                });

            }

        };
    }]);
