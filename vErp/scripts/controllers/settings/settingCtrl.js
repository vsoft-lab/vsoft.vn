angular.module('xMoney')
	.controller('settingCtrl', function ($scope, $rootScope, SETTINGS, $state, $location, xService, $timeout) {

		$scope.setting = xService.getSystemSetting();

		$scope.updateSetting = function (setting){
			xService.setSystemSetting(setting);
			toastr.success('Cập nhật thành công')
		}

	});
