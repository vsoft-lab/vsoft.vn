/**
 Biểu đồ thống kê Task theo trạng thái
 **/
var myApp = angular.module('xMoney');
myApp.directive('reportProjectTaskByStatus', function (xService, ngDialog) {
    return {
        restrict: 'E',
        scope: true,
        link: function ($scope, element, attrs) {

            $scope.dateType = "PlanStartDate";
            $scope.config = {};
            $scope.modalTitle = "";

            $scope.diagramReady = false;

            $scope.showReportTableDetail = false;
            $scope.showReportTableDetail = (attrs.showFilter);
            $scope.searchQuery = {};

            $scope.searchConfigSelect = [
                {
                    "caption": "Trạng thái",
                    "model": "DateType",
                    "staticSource": {
                        "PlanStartDate": "Kế hoạch",
                        "Deadline": "Hạn xử lý",
                        "ReportFinishDate": "Bác cáo hoàn thành",
                        "ActualFinishDate": "Xác nhận hoàn thành "
                    }
                }
            ];


            var getSelectData = function (model, callback) {
                angular.forEach($scope.searchConfigSelect, function (v, k) {
                    if (v.model == model) {
                        $scope.modalTitle = v.caption;
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


            /*dữ liệu trạng thái*/
            /*$scope.stateSource = [
             { value: 4, name: 'Đã lập kế hoạch' },
             { value: 8, name: 'Đã phân công' },
             { value: 16, name: 'Công việc phát sinh' },
             { value: 64, name: 'Quá hạn' },
             { value: 128, name: 'Đang thực hiện' }
             ];*/


            /*request dữ liệu biểu đồ*/
            $scope.refreshReport = function () {
                $scope.reportNull = false;
                $scope.isLoading = true;

                var reportParams = {
                    "RequestAction": "SummaryTaskByStatus",
                    "RequestClass": "Tasks"
                };

                var conditionFields = "";

                if ($scope.config.startDate != null && $scope.config.startDate != undefined && $scope.config.startDate != '') {
                    reportParams.StartDate = moment($scope.config.startDate).format("YYYY-MM-DD");
                    conditionFields += "StartDate;";
                }

                if ($scope.config.endDate != null && $scope.config.endDate != undefined && $scope.config.endDate != '') {
                    reportParams.EndDate = moment($scope.config.endDate).format("YYYY-MM-DD");
                    conditionFields += "EndDate;";
                }

                if (reportParams.EndDate != undefined || reportParams.StartDate != undefined) {
                    conditionFields += "DateType;";
                    reportParams.DateType = $scope.dateType != null ? $scope.dateType : 'PlanStartDate';
                }

                if (conditionFields != "") {
                    reportParams.ConditionFields = conditionFields;
                }

                generateQuery(function (data, conditionalField) {
                    angular.extend(reportParams, data);
                    conditionFields += conditionalField;
                    reportParams["ConditionFields"] = conditionFields;


                    xService.requestServerNative(reportParams, function (err, data) {
                        if (data != null && data.TaskReportDS != undefined && data.TaskReportDS.TaskSummary != undefined) {
                            $scope.chartCategories = [];
                            $scope.chartSeries = [];
                            $scope.totalTask = [];

                            if (data.TaskReportDS.TaskSummary.length == undefined) {
                                data.TaskReportDS.TaskSummary = [data.TaskReportDS.TaskSummary];
                            }
                            $scope.reportDataTable = data.TaskReportDS.TaskSummary;
                            for (var i = 0; i < data.TaskReportDS.TaskSummary.length; i++) {
                                $scope.chartCategories.push(data.TaskReportDS.TaskSummary[i].Code);
                                $scope.totalTask.push(convetToInt(data.TaskReportDS.TaskSummary[i].Tasks));
                            }

                            $scope.isLoading = false;
                            /*tạo config cho biểu đồ*/
                            if ($scope.chartCategories.length > 0) {
                                $scope.chartSeries = [
                                    { name: 'Số lượng công việc', data: $scope.totalTask }
                                ];
                                $scope.heighChart = $scope.chartCategories.length * 115;
                                /*tạo config cho biểu đồ*/
                                $scope.chartConfig = {
                                    options: {
                                        chart: {
                                            type: ($scope.chartCategories.length) > 5 ? 'bar' : 'column',
                                            height: ($scope.chartCategories.length) > 5 ? $scope.heighChart : 400
                                        },
                                        colors: ['#2F7ED8'],
                                        title: { text: 'Số lượng công việc theo trạng thái' },
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
                            }

                        } else {
                            //không có dữ liệu thống kê
                            $scope.reportNull = true;
                            $scope.isLoading = false;
                        }
                        $scope.diagramReady = true;
                    });

                });
            };

            $scope.refreshReport();

            /**
             @Sự kiện tìm kiếm
             **/
            $scope.onSearch = function () {
                $scope.refreshReport();
            };


        },
        templateUrl: 'views/projects/diagrams/report-project-task-by-status.html'
    }
        ;
})
;
