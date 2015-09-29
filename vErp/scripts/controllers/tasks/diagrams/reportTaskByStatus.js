

angular.module('xMoney')
    .directive('reportTaskByStatus', function (xService, ngDialog, $timeout, SETTINGS) {
        return {
            restrict: 'E',
            scope: {},
            link: function ($scope, element, attrs) {

                $scope.date = {};
                $scope.diagramReady = false;
                $scope.showFilter = (attrs.showFilter) ? true : false;


                var getRangeDateOfMonthAgo = function () {
                    return  {
                        StartDate: moment().subtract(30, 'days').format("YYYY-MM-DD"),
                        EndDate: moment().format("YYYY-MM-DD")
                    }
                };

                SETTINGS.getSettings('requests/tasks', function (err, config) {
                    var params = JSON.parse(JSON.stringify(config['SearchTask']));;
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
                            }

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
                    }






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
                        RequestAction: "SummaryTaskByStatus",
                        RequestClass: "Tasks",
                        ConditionFields: "StartDate;EndDate;DateType;",
                        DateType: "PlanStartDate"
                    };

                    angular.extend(params, getRangeDateOfMonthAgo());


                    var loadChart = function (loadParams) {
                        loadParams = (loadParams) ? loadParams : params;

                        $scope.chartCategories = [];
                        $scope.totalTask = [];
                        $scope.totalMH = [];

                        xService.requestServerNative(loadParams, function (err, resp) {
                            if (err) return toastr.error('Xảy ra sự có khi kết nối đến serve');

                            var data;
                            console.log(err, resp.TaskReportDS.TaskSummary);
                            data = (angular.isArray(resp.TaskReportDS.TaskSummary)) ? resp.TaskReportDS.TaskSummary : [resp.TaskReportDS.TaskSummary];
                            $scope.chartByProjectData = data;
                            console.log('$scope.chartByProjectData', $scope.chartByProjectData);

                            for (var i = 0; i < data.length; i++) {
                                $scope.chartCategories.push(data[i].Unit);
                                $scope.totalTask.push({ name: data[i].Code, y: convetToInt(data[i].Tasks), processState: data[i].State });
                                $scope.totalMH.push({ name: data[i].Code, y: convetToFloat(data[i].MH), processState: data[i].State });
                            }

                            

                            /*$scope.chartByProjectSeries = [
                                {"name": "Công việc", "data": [], type: "column"}, // Name : 'xMoney, xFace' ,
                                {"name": "Khối lựơng MH", "data": [], type: "column"}
                            ];*/

                            $scope.chartConfigTask = {
                                options: {
                                    chart: {
                                        plotBackgroundColor: null,
                                        plotBorderWidth: null,
                                        plotShadow: false
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    colors: ['#F7A35C', '#808080', '#90ED7D', '#E84C3D', '#8085E9'],
                                    title: {
                                        text: 'Theo trạng thái (Công việc)'
                                    },
                                    tooltip: {
                                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                                    },
                                    plotOptions: {
                                        pie: {
                                            allowPointSelect: true,
                                            cursor: 'pointer',
                                            dataLabels: {
                                                enabled: false
                                            },
                                            showInLegend: true
                                        }
                                    },
                                    legend: {
                                        layout: 'vertical',
                                        align: 'left',
                                        verticalAlign: 'top',
                                        x: 40,
                                        y: 100,
                                        floating: true,
                                        borderWidth: 1,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor || '#FFFFFF'),
                                        shadow: true
                                    },
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Công việc',
                                    data: $scope.totalTask,
                                    point: {
                                        events: {
                                            click: function () {
                                            }
                                        }
                                    }
                                }]
                            };


                            
                            


                            $scope.chartConfigMH = {
                                options: {
                                    chart: {
                                        plotBackgroundColor: null,
                                        plotBorderWidth: null,
                                        plotShadow: false
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    colors: ['#F7A35C', '#808080', '#90ED7D', '#E84C3D', '#8085E9'],
                                    title: {
                                        text: 'Theo trạng thái (MH)'
                                    },
                                    tooltip: {
                                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                                    },
                                    plotOptions: {
                                        pie: {
                                            allowPointSelect: true,
                                            cursor: 'pointer',
                                            dataLabels: {
                                                enabled: false
                                            },
                                            showInLegend: true
                                        }
                                    },
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        verticalAlign: 'top',
                                        x: -40,
                                        y: 100,
                                        floating: true,
                                        borderWidth: 1,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor || '#FFFFFF'),
                                        shadow: true
                                    },
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Khối lượng (MH)',
                                    data: $scope.totalMH,
                                    point: {
                                        events: {
                                            click: function () {
                                                
                                            }
                                        }
                                    }
                                }]
                            };


                            $scope.diagramReady = true;
                        })

                    };


                    loadChart();


                    $scope.onSearch = function (start, end) {
                        var param = {
                            RequestAction: "SummaryTaskByStatus",
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

                        console.log('onSearch param', param);

                        if (param.StartDate != undefined && param.EndDate != undefined) {
                            /*conditionFields += "DateType;";
                             param.DateType = "PublishedDate";*/
                            console.log('onSearch param 1');
                        } else {
                            console.log('onSearch param 2');
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
            templateUrl: 'views/tasks/diagrams/reportTaskByStatus.html'

        }
    })
;