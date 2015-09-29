'use strict';
angular.module('xMoney')

	.controller('LoginCtrl', ["$scope", "xService", '$http', 'auth', '$filter', '$state',
		function ($scope, xService, $http, auth, $filter, $state) {


			/*if(window.localStorage.getItem('loginInfo')){
			 $state.go('app.tasks.list');
			 return false;
			 }*/

			$scope.loginProcess = false;
			var setLoginInfo = function (info) {
				if (info) {
					window.localStorage.setItem('loginInfo', JSON.stringify({
						username: info.username,
						password: info.password,
						isRemember: true
					}))
				} else {
					window.localStorage.setItem('loginInfo', null);
				}
			};

			var getLoginInfo = function () {
				var info = window.localStorage.getItem('loginInfo');

				if (info) {
					return JSON.parse(info);
				}

				return {
					username: '',
					password: '',
					isRemember: false

				}
			};


			$scope.loginField = getLoginInfo();


			$scope.login = function (loginInfo) {

				$scope.loginProcess = true;

				if (window.hasOwnProperty('cordova')) {
					SoftKeyboard.hide();
					cordova.plugins.Keyboard.close();
				} else {
					console.log('not plugin keyboard');
				}

				if (loginInfo.username == '' && loginInfo.password == '') {
					toastr.warning('Vui lòng nhập đầy đủ thông tin.');
					return false;
				}

				var dataServer = (loginInfo.DataServer) ? loginInfo.DataServer : null;

				/*$ionicLoading.show({
				 template: 'Đang đăng nhập..',
				 noBackdrop: true
				 });*/


				if (loginInfo.isRemember) {
					setLoginInfo({
						username: loginInfo.username,
						password: loginInfo.password
					})
				} else {
					setLoginInfo(null);
				}


				auth.login(loginInfo.username, loginInfo.password, dataServer, function (err, resp) {
					$scope.loginProcess = false;
					/*$ionicLoading.hide();*/
					if (err) {
						toastr.warning('Tên đăng nhập hoặc mật khẩu không đúng');
					} else {
						if (window.cordova && window.cordova.plugins.Keyboard) {
							cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
						}

					}
				})

			};

		}]);