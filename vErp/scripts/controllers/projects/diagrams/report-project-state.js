//theo tình trạng
var myApp = angular.module('xMoney');
myApp.directive('reportProjectByState', function (xService, ngDialog) {
    return {
        restrict: 'E',
        scope: {},
        link: function ($scope, element, attrs) {
            var rootData = "Data.TasksDS.Project";
            var chartSerie = "Name";


            $scope.config = {
            };
            $scope.modalTitle = "";
            $scope.diagramReady = false;

            $scope.showReportTableDetail = false;
            $scope.showReportTableDetail = (attrs.showFilter);
            $scope.searchQuery = {};
            $scope.searchConfigSelect = [
                {
                    "caption": "Dự án",
                    "model": "Id",
                    "source": {
                        RequestAction: 'SearchProject',
                        RequestClass: 'Tasks',
                        StaticFields: 'Name;Id'
                    },
                    display: ["Id", "Name"]
                },
                {
                    "caption": "Trạng thái",
                    "model": "Status",
                    "source": {
                        "RequestAction": "SearchCategory",
                        "RequestClass": "xDocument",
                        "ParentCode": "xSystem.Settings.Project.Status",
                        "ConditionFields": "StartIndex;EndIndex;ParentCode"
                    },
                    display: ["Id", "Name"]
                },
                {
                    "caption": "Đơn vị",
                    "model": "Department",
                    "source": {
                        "RequestAction": "SearchGroup",
                        "RequestClass": "BPM",
                        "GroupType": 1,
                        "ConditionFields": "GroupType",
                        "StructField": true
                    },
                    display: ["GroupId", "GroupName"]
                }
            ];


            var getSelectData = function (model, callback) {
                angular.forEach($scope.searchConfigSelect, function (v, k) {
                    if (v.model == model) {
                        $scope.modalTitle = v.caption;
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
                    }
                })

            };





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
                        if (config.model == field && config.source.StructField) {
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
                    DynamicFields: 'ManagerName;ParentName;IndexName;DepartmentName;StatusName;StateName;Version',
                    RequestAction: 'SearchProject',
                    RequestClass: 'Tasks',
                    StaticFields: 'Name;Manager;Parent;Index;Status;Id',
                    StructFields: 'Department;Progress;StartDate;State;PlanManHour;ActualManHour;RemainingManHour;InlineManHour;MissDeadlineManHour'
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
                        $scope.PlanManHour = { name: "Kế hoạch", data: [] };
                        $scope.ActualManHour = { name: "Thực tế", data: [] };
                        $scope.RemainingManHour = { name: "Chưa hoàn thành", data: [] };
                        $scope.InlineManHour = { name: "Đúng tiến độ", data: [] };
                        $scope.MissDeadlineManHour = { name: "Chậm tiến độ", data: [] };
                        for (var i = 0; i < result.length; i++) {
                            if (typeof result[i][chartSerie] != "undefined" && $scope.chartSeries.indexOf(result[i][chartSerie]) < 0) {
                                $scope.chartCategories.push(result[i][chartSerie]);
                                $scope.PlanManHour.data.push(convetToFloat(result[i].PlanManHour));
                                $scope.ActualManHour.data.push(convetToFloat(result[i].ActualManHour));
                                $scope.RemainingManHour.data.push(convetToFloat(result[i].RemainingManHour));
                                $scope.InlineManHour.data.push(convetToFloat(result[i].InlineManHour));
                                $scope.MissDeadlineManHour.data.push(convetToFloat(result[i].MissDeadlineManHour));
                            }
                        }

                        $scope.chartSeries.push($scope.PlanManHour);
                        $scope.chartSeries.push($scope.ActualManHour);
                        $scope.chartSeries.push($scope.RemainingManHour);
                        $scope.chartSeries.push($scope.InlineManHour);
                        $scope.chartSeries.push($scope.MissDeadlineManHour);

                        function renderChart() {
                            if ($scope.chartCategories.length > 0) {
                                $scope.heighChart = $scope.chartCategories.length * 115;
                                /*tạo config cho biểu đồ*/
                                $scope.chartConfig = {
                                    options: {
                                        chart: {
                                            type: ($scope.chartCategories.length) > 5 ? 'bar' : 'column',
                                            height: ($scope.chartCategories.length) > 5 ? $scope.heighChart : 400
                                        },
                                        colors: ['#2F7ED8', '#F7A35C'],
                                        title: { text: 'Tình trạng dự án' },
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
                                        legend: { y: -10, align: 'center', verticalAlign: 'bottom', borderWidth: 0 },
                                        credits: { enabled: false }
                                    },
                                    series: $scope.chartSeries
                                };
                                $scope.reportNull = false;
                            } else {
                                $scope.reportNull = true;
                            }
                        }


                        renderChart();
                        $scope.reportNull = false;
                    } else {
                        $scope.reportNull = true;
                    }
                    $scope.diagramReady = true;
                });
            };

            $scope.refreshChart(null);

            $scope.updateChart = function () {
                var params = {
                    RequestAction: 'SummaryAllProjectsByTask',
                    RequestClass: 'Tasks'
                };
            };

            /*form tim kiem*/
            /*Search project*/
            $scope.stateReady = false;


            /*search project filter*/


            /*filter*/
            /*$scope.onSearch = function () {
             var param = getParams();
             var index = 0;
             var conditionFields = '';
             if ($scope.sourceGroup != null && $scope.sourceGroup != undefined) {
             $scope.departmentSelection = [];
             angular.forEach($scope.sourceGroup, function (value, key) {
             if (value.ticked === true) {
             $scope.departmentSelection.push(value.Id);
             }
             });

             if ($scope.departmentSelection.length > 0) {
             param.Department = $scope.departmentSelection.join(';');
             param.DepartmentColumnType = 0;
             conditionFields += "Department;";
             }
             }

             if ($scope.startDate != null && $scope.startDate != undefined && $scope.startDate != '') {
             param.StartDateStartValue = xFormatDate($scope.startDate);
             }

             if ($scope.endDate != null && $scope.endDate != undefined && $scope.endDate != '') {
             param.StartDateEndValue = xFormatDate($scope.endDate);
             }

             if (param.StartDateEndValue != undefined && param.StartDateStartValue != undefined) {
             conditionFields += "StartDate;";
             param.StartDateColumnType = 3;
             } else {
             delete param.StartDateStartValue;
             delete param.StartDateEndValue;
             }

             if ($scope.sourceState != null && $scope.sourceState != undefined) {
             $scope.stateSelection = [];
             angular.forEach($scope.sourceState, function (value, key) {
             if (value.ticked === true) {
             $scope.stateSelection.push(value.Id);
             }
             });

             if ($scope.stateSelection.length > 0) {
             param["Status"] = $scope.stateSelection.join(';');
             }
             }

             if ($scope.sourceProject != null && $scope.sourceProject != undefined) {
             $scope.projectSelection = [];
             angular.forEach($scope.sourceProject, function (value, key) {
             if (value.ticked === true) {
             $scope.projectSelection.push(value.Id);
             }
             });

             if ($scope.projectSelection.length > 0) {
             param["Id"] = $scope.projectSelection.join(';');
             conditionFields += "Id";
             }
             }

             if (conditionFields != '') { param["ConditionFields"] = conditionFields; }

             $scope.refreshChart(param);
             };*/
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
            };

            $scope.onSearch = function () {
                var params = getParams();

                var conditionFields = '';

                if ($scope.config.startDate != null && $scope.config.startDate != undefined && $scope.config.startDate != '') {
                    params.StartDateStartValue = moment($scope.config.startDate).format("YYYY-MM-DD");
                    conditionFields += "StartDate;";
                }

                if ($scope.config.endDate != null && $scope.config.endDate != undefined && $scope.config.endDate != '') {
                    params.StartDateEndValue = moment($scope.config.endDate).format("YYYY-MM-DD");
                    conditionFields += "EndDate;";
                }

                if (params.StartDateEndValue != undefined && params.StartDateStartValue != undefined) {
                    conditionFields += "StartDate;";
                    params.StartDateColumnType = 3;
                } else {
                    delete params.StartDateStartValue;
                    delete params.StartDateEndValue;
                }


                console.log('$scope.config', $scope.config);


                generateQuery(function (data, conditionalField) {
                    angular.extend(params, data);
                    conditionFields += conditionalField;
                    params["ConditionFields"] = conditionFields;

                    console.log('ConditionFields', params["ConditionFields"]);

                    $scope.refreshChart(params);
                });

            };




        },
        templateUrl: 'views/projects/diagrams/report-project-state.html'
    };
});

// xFaceApp.directive('reportContract', function (workflowService, $modal, usSpinnerService, serviceHelper) {
//     return {
//         restrict: 'E',
//         scope: true,
//         link: function ($scope, element, attrs) {
//             usSpinnerService.stop('spinner');
//         },
//         templateUrl: '/app/exceltable/views/report/contract/reportcontract.html'
//     };
// });
