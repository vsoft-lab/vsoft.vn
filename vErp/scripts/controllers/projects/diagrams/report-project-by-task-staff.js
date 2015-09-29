//8.1.8 - Số lượng công việc theo đơn vị
var myApp = angular.module('xMoney');
myApp.directive('reportProjectByTaskStaff', function (xService, ngDialog) {
    return {
        restrict: 'E',
        scope: true,
        link: function ($scope, element, attrs) {
            var rootData = "TaskReportDS.TaskSummary";

            $scope.config = {};


            $scope.diagramReady = false;

            $scope.showReportTableDetail = false;
            $scope.showReportTableDetail = (attrs.showFilter);
            $scope.searchQuery = {};
            $scope.searchConfigSelect = [];


            var getSelectData = function (model, callback) {
                angular.forEach($scope.searchConfigSelect, function (v, k) {
                    if (v.model == model) {

                        if (v.source) {
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
                        } else {
                            var opts = [];
                            angular.forEach(v.staticSource, function (vv, kk) {
                                var obj = {};
                                obj['value'] = kk;
                                obj['caption'] = vv;
                                obj['model'] = v.model;
                                opts.push(obj);
                            });
                            callback(null, opts);
                        }
                    }
                })

            };


            $scope.openModalSearch = function (model) {
                modalSearch = ngDialog.open(
                    {
                        template: './views/projects/diagrams/modal/projects-modal.html',
                        showClose: false,
                        scope: $scope
                    }
                );
                getSelectData(model, function (err, data) {
                    $scope.optionData = data;
                })
            }

            var generateQuery = function (callback) {
                var searchParams = {},
                    conditionField = [];

                angular.forEach($scope.searchQuery, function (v, k) {
                    if (angular.isObject(v)) {
                        var arr = [];
                        angular.forEach(v, function (value, key) {
                            if (value == true) {
                                arr.push(key);
                            }
                        });
                        var arrStr = arr.join(';');

                        searchParams[k] = arrStr;
                    } else {
                        searchParams[k] = v;
                    }
                    conditionField.push(k);
                });
                angular.forEach(conditionField, function (field) {
                    angular.forEach($scope.searchConfigSelect, function (config) {
                        if (config.model == field && config.hasOwnProperty("source") && config.source.hasOwnProperty("StructField")) {
                            searchParams[config.model + 'ColumnType'] = 0;
                            conditionField.push(config.model + 'ColumnType');
                        }
                    })
                });
                conditionField = conditionField.join(';');

                callback(searchParams, conditionField);
            };


            function getParams() {
                var params = {
                    ConditionFields: 'GroupType',
                    GroupType: 1,
                    RequestAction: 'SummaryTaskByGroup',
                    RequestClass: 'Tasks',
                    SessionId: getItemLocalStorage(localStorageConstant.SessionId)
                };


                return params;
            }


            $scope.refreshChart = function (params) {
                if (params == null) {
                    params = getParams();
                }

                var result = null;
                xService.requestServerNative(params, function (err, data) {
                    var root = rootData.split('.');

                    for (var i = 0; i < root.length; i++) {
                        if (data[root[i]] != undefined) {
                            data = data[root[i]];
                        }
                    }

                    if (data.length > 0) {
                        result = data;
                    } else {
                        result = [data];
                    }

                    if (result != null) {
                        $scope.chartSeries = [];
                        $scope.chartCategories = [];
                        $scope.taskSeries = { name: 'Số lượng công việc', data: [] };

                        for (var i = 0; i < result.length; i++) {
                            $scope.chartCategories.push(result[i].Code);
                            $scope.taskSeries.data.push(convetToInt(result[i].Tasks));
                        }
                        $scope.chartSeries = [$scope.taskSeries];
                        if ($scope.chartCategories.length > 0) {
                            $scope.heighChart = $scope.chartCategories.length * 115;
                            /*tạo config cho biểu đồ*/
                            $scope.chartConfig = {
                                options: {
                                    chart: {
                                        type: ($scope.chartCategories.length) > 5 ? 'bar' : 'column',
                                        height: ($scope.chartCategories.length) > 5 ? $scope.heighChart : 400
                                    },
                                    colors: ['#2F7ED8'],
                                    title: { text: 'Số lượng công việc theo đơn vị' },
                                    xAxis: { categories: $scope.chartCategories, title: { text: null } },
                                    yAxis: { min: 0, title: { text: '', align: 'high' }, labels: { overflow: 'justify' } },
                                    plotOptions: {
                                        column: {
                                            dataLabels: { enabled: true }
                                        },
                                        series: {
                                            pointWidth: 35,
                                            cursor: 'pointer',
                                            point: {
                                                events: {

                                                }
                                            }
                                        }
                                    },
                                    legend: { enabled: false },
                                    credits: { enabled: false }
                                },
                                series: $scope.chartSeries
                            };
                            $scope.reportNull = false;
                        } else {
                            $scope.reportNull = true;
                        }

                    } else {
                        $scope.reportNull = true;
                    }
                    $scope.diagramReady = true;
                });
            };

            $scope.refreshChart();


            $scope.onSearch = function () {
                var params = {
                    ConditionFields: 'GroupType',
                    GroupType: 1,
                    RequestAction: 'SummaryTaskByGroup',
                    RequestClass: 'Tasks',
                    SessionId: getItemLocalStorage(localStorageConstant.SessionId)
                };

                var conditionFields = '';

                if ($scope.config.startDate != null && $scope.config.startDate != undefined && $scope.config.startDate != '') {
                    params.StartDate = moment($scope.config.startDate).format("YYYY-MM-DD");
                    conditionFields += "StartDate;";
                }

                if ($scope.config.endDate != null && $scope.config.endDate != undefined && $scope.config.endDate != '') {
                    params.EndDate = moment($scope.config.endDate).format("YYYY-MM-DD");
                    conditionFields += "EndDate;";
                }

                if (params.EndDate != undefined && params.StartDate != undefined) {
                    conditionFields += "DateType;";
                    params.DateType = "PlanStartDate";
                } else {
                    delete params.StartDate;
                    delete params.EndDate;
                }

                if (conditionFields != '') {
                    params["ConditionFields"] = conditionFields;
                }


                generateQuery(function (data, conditionalField) {
                    angular.extend(params, data);
                    conditionFields += conditionalField;
                    params["ConditionFields"] = conditionFields;


                    $scope.refreshChart(params);
                });
            };






        },
        templateUrl: 'views/projects/diagrams/report-project-by-task-staff.html'
    };
});
