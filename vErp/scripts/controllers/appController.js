angular.module('xMoney')
	.controller('AppController', 
		function ($scope, $rootScope, auth, SETTINGS, $state, $location, xService, $timeout, $interval) {


		// Auto request every 30 min to keep session id


		var intervalRequestKeepSessionId = $interval(function (){
			var reqParams = {
				RequestAction: 'GetUserInformation',
                RequestClass: 'BPM'
			};

			xService.requestServer(reqParams, function(err, resp){

			});
		}, 1800000); //1800000 : 30min


		$scope.$on('$destroy',function(){
		    if(intervalRequestKeepSessionId){
		        $interval.cancel(intervalRequestKeepSessionId);
		    }
		});


		SETTINGS.getSettings('Menu', function (err, _menu) {
			$scope.xMenu = _menu['Menu'];
			$rootScope.menuIndex = 0;


			$scope.myStyle = {
				'float': 'left',
				'margin-left': '0px',
				'display': 'block'
			};


			$scope.moveRight = function () {
				var marginLeft = +$scope.myStyle['margin-left'].replace('px', '') + -100;

				if (marginLeft === 0) {
					$scope.leftdisabled = true;
				}
				else {
					$scope.leftdisabled = false;
				}

				if (marginLeft === -(($scope.items.length - 3) * 100)) {
					$scope.rightdisabled = true;
				}
				else {
					$scope.rightdisabled = false;
				}

				$scope['margin-left'] = marginLeft + 'px';
				document.getElementById('infoMargin').innerHTML = marginLeft;
				return $scope['margin-left'];

			};

			$scope.moveLeft = function () {
				var marginLeft = +$scope.myStyle['margin-left'].replace('px', '') + 100;

				if (marginLeft === 0) {
					$scope.leftdisabled = true;
				}
				else {
					$scope.leftdisabled = false;
				}

				if (marginLeft === -700) {
					$scope.rightdisabled = true;
				}
				else {
					$scope.rightdisabled = false;
				}

				$scope['margin-left'] = marginLeft + 'px';
				document.getElementById('infoMargin').innerHTML = marginLeft;
				return $scope['margin-left'];
			};

			$scope.xMenuRight = $scope.xMenu[0].SubMenu;

			$scope.runMenu = function (menuIndex) {

				$rootScope.menuIndex = _menu['Menu'].indexOf($scope.xMenu[menuIndex]);
				$scope.xMenuRight = $scope.xMenu[menuIndex].SubMenu;

				var tmp = $scope.xMenu.slice(menuIndex, $scope.xMenu.length);
				var tmp1 = $scope.xMenu.slice(0, menuIndex);
				$scope.xMenu = tmp.concat(tmp1);
			};


			$scope.closeRightMenu = function () {
				$scope.goCats = false;
			};

			$scope.runCatsMenu = function (){
				$scope.goCats = !$scope.goCats;
				$rootScope.$broadcast('CLOSE_NAV_MENU');
			}

			$scope.swipeLeft = function (eee, state) {

				var removed = $scope.xMenu.splice(0, 1);
				$scope.xMenu.push(removed[0]);

				$scope.xMenuRight = $scope.xMenu[0].SubMenu;
				$rootScope.menuIndex = _menu['Menu'].indexOf($scope.xMenu[0]);


				if ($rootScope.stateHistory[$scope.xMenu[0].NameEn]) {
					var stateInfo = $rootScope.stateHistory[$scope.xMenu[0].NameEn];

					$state.go(stateInfo.name, stateInfo.params);

				} else {
					$state.go('app.list', {state: $scope.xMenu[0].Url});
				}



			};

			$scope.swipeRight = function () {
				var length = $scope.xMenu.length - 1;
				var removed = $scope.xMenu.splice(length, 1);

				$scope.xMenu.unshift(removed[0]);
				$rootScope.menuIndex = _menu['Menu'].indexOf($scope.xMenu[0]);
				$scope.xMenuRight = $scope.xMenu[0].SubMenu;


				if ($rootScope.stateHistory[$scope.xMenu[0].NameEn]) {
					var stateInfo = $rootScope.stateHistory[$scope.xMenu[0].NameEn];
					$state.go(stateInfo.name, stateInfo.params);
				} else {
					$state.go('app.list', {state: $scope.xMenu[0].Url});
				}
			};

			$scope.MenuClass = 'close';

			$scope.swipeRightTop = function (el) {
				$scope.MenuClass = 'open';
			};

			$scope.swipeLeftTop = function (el) {
				$scope.MenuClass = 'close';
			};


			$scope.changeStateMenuBar = function (stateName, stateParams, menuConfig) {
				
				
				if ($rootScope.stateHistory[menuConfig.NameEn]) {
					var stateInfo = $rootScope.stateHistory[menuConfig.NameEn];

					$state.go(stateInfo.name, stateInfo.params);

				} else {
					$state.go(stateName, stateParams);
				}
			}


			/* Notification Invoke */



			$scope.notifySourceParams = {};
			
			$scope.notificationDataSource = {};
			$scope.notificationTotal = {};
			$scope.notificationSetting = {};
			$scope.notificationCount = 18;






			var getSourceParams = function (sourceStr, callback){
				var source = sourceStr.split('.');
				SETTINGS.getSettings('requests/' + source[0], function (err, config) {
					callback(err, config[source[1]]);
				});
			};

			var getDataSource = function (params, config, callback){

				if(config.hasOwnProperty('DistanceDateFromToday')){
					params['StartDate'] = moment().format("YYYY-MM-DD");
					params['EndDate'] = moment().add(parseInt(config.DistanceDateFromToday), 'days').format("YYYY-MM-DD");
				}

				if(config.hasOwnProperty('ConditionFieldByUid')){
					params[config.ConditionFieldByUid] = auth.getUser().UserId
				}
				
				params['StartIndex'] = 1;
				params['EndIndex'] = config.RecordShow || 3;
				
				xService.requestServer(params, function (err, resp) {
					callback(err, resp)
				});
			};

			SETTINGS.getSettings('notifications', function (err, setting){
				if(!err){

					var listTask = [];

					$scope.notificationSetting = JSON.parse(JSON.stringify(setting));
					$scope.Tabs = $scope.notificationSetting.Tabs;

					angular.forEach(setting.Tabs, function (v, k){
						if (v.hasOwnProperty('Source')) {
							if (typeof v.Source == 'string') {

								listTask.push(function (callback){
									getSourceParams(v.Source, function (err, params){
										$scope.notifySourceParams[v.Source] = params;

										getDataSource(params, v, function (err, resp){
											$scope.notificationDataSource[v.Source] = resp.datasource;
											$scope.notificationTotal[v.Source] = resp.totalcount;
											//$scope.notificationCount += $scope.notificationDataSource[v.Source].length;
											callback(err, resp)
										})
									})
								})

							}
						}
					});

					async.series(listTask, function (err, resp) {
						$timeout(function (){
							init(JSON.stringify(setting));

						});
					})


				}
			});

			function init(setting){
			    

			}

			$scope.checkPermission = function (menu){
				if (menu.Roles != undefined) {
			        var denyRoles = [], allowRoles = [];

			        angular.forEach(menu.Roles, function (roleIds, roleType){
		        		switch (roleType) {
			                case "Deny":
		                        denyRoles = (_.isArray(roleIds)) ? roleIds : [roleIds];
			                    break;
			                case "Allow":
		                        allowRoles = (_.isArray(roleIds)) ? roleIds : [roleIds];
			                    break;
			            }
			        })
			        
			        var parameters = JSON.parse(getItemLocalStorage(localStorageConstant.LoggedOnUser));

			        
			        //Check for Deny Roles
			        if (denyRoles != null & denyRoles != undefined) if (denyRoles.length > 0)
			        	console.log('denyRoles', denyRoles);
			        	for (var i = 0; i < denyRoles.length; i++) {
				            for (var j = 0; j < parameters.Roles.length; j++){
			            		console.log(parameters.Roles[j].GroupId, denyRoles)
				            	if(parameters.Roles[j].GroupId.toLowerCase() == denyRoles[i].toLowerCase()){
				            		
									return false;
				            	}
				            }
			            };

			        //Check for Allow Roles

			        if (allowRoles == null | allowRoles == undefined) return true;
			        if (allowRoles.length < 1) return true;

					for (var i = 0; i < allowRoles.length; i++) {
						for (var j = 0; j < parameters.Roles.length; j++){
				            if(parameters.Roles[j].GroupId.toLowerCase() == allowRoles[i].toLowerCase()){

				            	return true;
				            }
			        	}
					}
			        
			        return false;
			    }
			    return true;
			}









		});
	});
