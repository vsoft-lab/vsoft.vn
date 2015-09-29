angular.module('xMoney')
	.directive('reportTaskByTarget', function (xService, ngDialog, $timeout, SETTINGS) {
		return {
			restrict: 'E',
			scope: {},
			link: function ($scope, element, attrs) {

				$scope.date = {};
				$scope.diagramReady = false;
				$scope.hasResult = true;

				$scope.showFilter = (attrs.showFilter) ? true : false;

				var getRangeDateOfMonthAgo = function () {
					return {
						StartDate: moment().subtract(30, 'days').format("YYYY-MM-DD"),
						EndDate: moment().format("YYYY-MM-DD")
					}
				};

				SETTINGS.getSettings('requests/tasks', function (err, config) {
                    var params = JSON.parse(JSON.stringify(config['SearchTask']));
                    angular.extend(params, {OrderFields:'PlanStartDate DESC'});
                    params.StartIndex = 1;
                    params.EndIndex = 1;


                    xService.requestServer(params, function (err, resp){
                        if(!err){
                            var PlanStartDate = resp.datasource[0].PlanStartDate;

                            getRangeDateOfMonthAgo = function (){
                                return {
                                    StartDate: moment(PlanStartDate).subtract(30, 'days').format("YYYY-MM-DD"),
                                    EndDate: moment(PlanStartDate).format("YYYY-MM-DD")
                                }
                            };

                            $timeout(function (){
                                init();
                            });
                        }
                    })
                });

				function init(){


					$scope.searchQuery = {};

					$scope.searchConfigSelect = [
						{
							"caption": "Nhân sự",
							"model": "Worker",
							"source": {
								RequestAction: "SearchUsers",
								RequestClass: "BPM",
								StaticFields: "UserId;Username",
								limit: 100,
								start: 0
							},
							display: ["UserId", "Username"]
						},
						{
							"caption": "Dự án",
							"model": "Project",
							"source": {
								RequestAction: "SearchProject",
								RequestClass: "Tasks",
								limit: 100,
								start: 0
							},
							display: ["Id", "Name"]
						},
						{
							"caption": "Trạng thái",
							"model": "State",
							"staticSource": {
								"4": 'Đã lập kế hoạch',
								"8": 'Đã phân công',
								"16": 'Công việc phát sinh',
								"64": 'Quá hạn',
								"128": 'Đang thực hiện'
							}
						}
					];

					var getSelectData = function (model, callback) {
						angular.forEach($scope.searchConfigSelect, function (v, k) {
							if (v.model == model) {
								if(v.hasOwnProperty('source')){
									xService.requestServer(v.source, function (err, resp) {
										if (err) {
											callback(err, null);
										} else {
											var opts = [];
											angular.forEach(resp.datasource, function (vv) {
												var obj = {};
												obj['value'] = vv[v.display[0]];
												obj['caption'] = vv[v.display[1]];
												obj['model'] = v.model;
												opts.push(obj);
											});
											callback(null, opts);
										}
									});

								}else if(v.hasOwnProperty('staticSource')){
									var opts = [];
									for(var property in v.staticSource){
										var obj = {};
										obj['value'] = property;
										obj['caption'] = v.staticSource[property];
										obj['model'] = v.model;
										opts.push(obj);
									}
									callback(null, opts);
								}
							}
						})

					};

					var generateQuery = function (callback) {
	                    var searchParams = {},
	                        conditionField = [];

	                    angular.forEach($scope.searchQuery, function (v, k) {
	                        if (angular.isObject(v)) {
	                            var arr = [];
	                            var state = 0;
	                            angular.forEach(v, function (value, key) {
	                                if (value == true) {
	                                    if(isGuid(key)){
	                                        arr.push(key);
	                                    }else {
	                                        state += parseInt(key);
	                                    }
	                                }
	                            });
	                            if(state){
	                                searchParams[k] = state;
	                            }else {
	                                var arrStr = arr.join(';');
	                                searchParams[k] = arrStr;
	                            }
	                            
	                        } else {
	                            searchParams[k] = v;
	                        }
	                        conditionField.push(k);
	                    });
	                    conditionField = conditionField.join(';');
	                    callback(searchParams, conditionField);
	                };


					$scope.openModalSearch = function (model) {
						modalSearch = ngDialog.open(
							{
								template: './views/tasks/diagrams/modal/tasks-modal.html',
								showClose: false,
								scope: $scope
							}
						);
						getSelectData(model, function (err, data) {
							$scope.optionData = data;
						})
					};

					/*
					 *
					 *
					 *
					 *
					 *
					 *
					 *
					 * */

					var params = {
						RequestAction: "SummaryTaskByTarget",
						RequestClass: "Tasks",
						ConditionFields: "StartDate;EndDate;DateType;",
						DateType: "PlanStartDate"
					};

					angular.extend(params, getRangeDateOfMonthAgo());


					$scope.chartByProjectSeries = [
						{"name": "Công việc", "data": [], type: "column"}, // Name : 'xMoney, xFace' ,
						{"name": "Khối lựơng MH", "data": [], type: "column"}
					];

					$scope.chartByProjectConfig = {
						options: {
							chart: {
								type: 'areaspline'
							},
							plotOptions: {
								series: {
									stacking: ''
								}
							}
						},
						xAxis: {
							categories: []
						},
						yAxis: {
							title: {
								text: ''
							}
						},
						series: $scope.chartByProjectSeries,
						title: {
							text: 'Theo mục tiêu'
						},
						credits: {
							enabled: false
						},
						loading: false,
						size: {}
					};


					var loadChart = function (loadParams) {
						loadParams = (loadParams) ? loadParams : params;

						xService.requestServerNative(loadParams, function (err, resp) {
							if (err) return toastr.error('Xảy ra sự có khi kết nối đến serve');

							if (!resp.TaskReportDS.TaskSummary) {

								$scope.hasResult = false;

							} else {
								var data;
								/*= resp.TaskReportDS.TaskSummary;*/
								data = (angular.isArray(resp.TaskReportDS.TaskSummary)) ? resp.TaskReportDS.TaskSummary : [resp.TaskReportDS.TaskSummary];
								$scope.chartByProjectData = data;
								var chartData = {};
								chartData['Tasks'] = [];
								chartData['MH'] = [];
								chartData['Category'] = [];

								try {
									angular.forEach(data, function (value, key) {
										chartData['Tasks'].push(parseInt(value.Tasks));
										chartData['Category'].push(value.Unit);
										chartData['MH'].push(parseInt(value.MH));

									});

								}
								catch (err) {
									$scope.hasResult = true;
									return false;
								}

								$scope.chartByProjectSeries[0].data = chartData['Tasks'];
								$scope.chartByProjectSeries[1].data = chartData['MH'];
								$scope.chartByProjectConfig.xAxis.categories = _.compact(chartData['Category']);


								$scope.chartByProjectConfig.options.chart.type = (chartData['Category'].length) > 5 ? 'bar' : 'column';
								$scope.chartByProjectConfig.options.chart.height = (chartData['Category'].length) > 5 ? chartData['Category'].length * 115 : 400;
								$scope.diagramReady = true;
							}

						})

					};


					loadChart();


					$scope.onSearch = function (start, end) {
						var param = {
							RequestAction: "SummaryTaskByTarget",
							RequestClass: "Tasks",
							ConditionFields: "StartDate;EndDate;DateType;",
							DateType: "PlanStartDate"
						};
						angular.extend(param, getRangeDateOfMonthAgo());

						var conditionFields = '';

						if ($scope.date.startDate != null && $scope.date.startDate != undefined && $scope.date.startDate != '') {
							param.StartDate = moment($scope.date.startDate).format("YYYY-MM-DD");
						}

						if ($scope.date.endDate != null && $scope.date.endDate != undefined && $scope.date.endDate != '') {
							param.EndDate = moment($scope.date.endDate).format("YYYY-MM-DD");
						}

						if (param.StartDate != undefined && param.EndDate != undefined) {
							/*conditionFields += "DateType;";
							 param.DateType = "PublishedDate";*/
						} else {
							delete param.StartDate;
							delete param.EndDate;
						}


						generateQuery(function (data, conditionalField) {
							angular.extend(param, data);
							conditionFields += conditionalField;
							param["ConditionFields"] += conditionFields;

							loadChart(param);
						});
					}
				}
			},
			templateUrl: 'views/tasks/diagrams/reportTaskByTarget.html'
		}
	});