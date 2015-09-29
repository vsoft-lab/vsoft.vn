angular.module('xMoney').directive('reportContractValuePaymentStaff', function (xService, ngDialog) {
    return {
        restrict: 'E',
        scope: true,
        link: function ($scope, element, attrs) {
            var rootData = "Data.DocumentDS.Document";

            $scope.date = {};
            $scope.diagramReady = false;
            $scope.showFilter = (attrs.showFilter) ? true : false;

            var getRangeDateOfMonthAgo = function () {
                return  {
                    StartDate: moment().subtract(30, 'days').format("YYYY-MM-DD"),
                    EndDate: moment().format("YYYY-MM-DD")
                }
            };

            var chartCategoryField = "StatusName";
            $scope.getKey = Object.key;
            $scope.showReportTableDetail = false;
            $scope.showReportTableDetail = (attrs.showFilter);
            $scope.searchQuery = {};
            $scope.searchConfigSelect = [
                {
                    "caption": "Hợp đồng",
                    "model": "Type",
                    "source": {
                        "SessionId": getItemLocalStorage(localStorageConstant.SessionId),
                        "RequestAction": "SearchCategory",
                        "RequestClass": "xDocument",
                        "ParentCode": "xSystem.Settings.Contract.Type",
                        "ConditionFields": "StartIndex;EndIndex;ParentCode"
                    },
                    display: ["Id", "Name"]
                }
            ];

            var getSelectData = function (model, callback) {
                angular.forEach($scope.searchConfigSelect, function (v, k) {
                    if (v.model == model) {
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


            $scope.openModalSearch = function (model) {
                $scope.xSearchModal.show();
                getSelectData(model, function (err, data) {
                    $scope.optionData = data;
                })
            };


            /*$ionicModal.fromTemplateUrl('templates/modalDiagram.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.xSearchModal = modal;
            });*/


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
                conditionField = conditionField.join(';');
                callback(searchParams, conditionField);
            };


            function getParams() {
                var params = {
                    Code: 'Contract',
                    DynamicFields: 'TypeName;DepartmentName;SignerName;ParentName;StatusName',
                    RequestAction: 'SearchDocument',
                    RequestClass: 'xDocument',
                    StaticFields: 'Type;OfficialNumber;PublishedDate;Signer;Parent;Status;Code;Id',
                    StructFields: 'Department;TotalValue;Payment1;Payment2;Payment3;BusinessExpense;CommissionExpense;ActualValue',
                    OrderFields: 'PublishedDate ASC'
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

                        $scope.sumValue = {}; // tổng giá trị hợp đồng

                        function findCategory(categoryName) {
                            for (var i = 0; i < $scope.chartCategories.length; i++) {
                                if ($scope.chartCategories[i].name == categoryName) {
                                    return i;
                                }
                            }
                            return null;
                        }

                        var typeArray = [];
                        for (var i = 0; i < result.length; i++) {
                            var publishedDate = result[i]["PublishedDate"];
                            var type = result[i]["DepartmentName"];
                            if (type != null && type != undefined) {
                                if (typeArray.indexOf(type) < 0) {
                                    typeArray.push(type);
                                }
                                var year = new Date(publishedDate).getFullYear();

                                if (isNumeric(year)) {
                                    var index = findCategory(year);
                                    if (index == null) {
                                        $scope.chartCategories.push({
                                            name: year,
                                            categories: []
                                        });
                                        $scope.sumValue[year + '-' + type] = convetToFloat(result[i].TotalValue);

                                    } else {
                                        if (typeof $scope.sumValue[year + '-' + type] != "undefined") {
                                            $scope.sumValue[year + '-' + type] += convetToFloat(result[i].TotalValue);
                                        } else {
                                            $scope.sumValue[year + '-' + type] = convetToFloat(result[i].TotalValue);
                                        }
                                    }
                                }
                            }
                        }

                        var sumValueSeries = { name: "Tổng giá trị", data: [] };
                        $scope.detailTable = [];
                        for (var i = 0; i < $scope.chartCategories.length; i++) {
                            $scope.chartCategories[i].categories = typeArray;
                            var abc = {};
                            abc[$scope.chartCategories[i].name] = [];
                            for (var j in typeArray) {

                                if (typeof $scope.sumValue[$scope.chartCategories[i].name + '-' + typeArray[j]] != "undefined") {
                                    sumValueSeries.data.push($scope.sumValue[$scope.chartCategories[i].name + '-' + typeArray[j]]);
                                } else {
                                    sumValueSeries.data.push(0);
                                }
                                abc[$scope.chartCategories[i].name].push({ type: typeArray[j], year: $scope.chartCategories[i].name, key: $scope.chartCategories[i].name + '-' + typeArray[j], data:  $scope.sumValue[$scope.chartCategories[i].name]});

                                /*$scope.detailTable.push({ type: typeArray[j], year: $scope.chartCategories[i].name, key: $scope.chartCategories[i].name + '-' + typeArray[j] });*/
                            }
                            $scope.detailTable.push(abc);

                        }


                        $scope.chartSeries = [sumValueSeries];

                        if ($scope.chartCategories.length > 0) {
                            $scope.heighChart = $scope.chartCategories.length * 115;
                            $scope.chartConfig = {
                                options: {
                                    chart: {
                                        renderTo: "chart",
                                        type: ($scope.chartCategories.length) > 5 ? 'bar' : 'column',
                                        height: ($scope.chartCategories.length) > 5 ? $scope.heighChart : 400
                                    },
                                    colors: ['#F7A35C', '#90ED7D', '#E84C3D', '#8085E9', '#808080'],
                                    title: { text: 'Tổng giá trị hợp đồng của các đơn vị theo năm' },
                                    xAxis: {
                                        categories: $scope.chartCategories
                                    },
                                    yAxis: { min: 0, title: { text: '', align: 'high' }, labels: { overflow: 'justify' } },
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

            $scope.refreshChart(null);

            /*sự kiện tìm kiếm*/
            $scope.refreshReport = function () {
                $scope.refreshChart();
            };




            /*filter*/
            $scope.onSearch = function () {


                var param = {
                    "Code":"Contract",
                    "DynamicFields":"TypeName;DepartmentName;SignerName;ParentName;StatusName",
                    "RequestAction":"SearchDocument",
                    "RequestClass":"xDocument",
                    "StaticFields":"Type;OfficialNumber;PublishedDate;Signer;Parent;Status;Code;Id",
                    "StructFields":"Department;TotalValue;Payment1;Payment2;Payment3;BusinessExpense;CommissionExpense;ActualValue",
                    "OrderFields":"PublishedDate ASC",
                    "DateType":"PublishedDate",
                    "ConditionFields":"DateType;"
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
                    param["ConditionFields"] = conditionFields;

                    $scope.refreshChart(param);
                });

            };

            $scope.openModalSearch = function (model) {
                modalSearch = ngDialog.open(
                    {
                        template: './views/contracts/diagrams/modal/contract-modal.html',
                        showClose: false,
                        scope: $scope
                    }
                );
                getSelectData(model, function (err, data) {
                    $scope.optionData = data;
                })
            }
        },
        templateUrl: 'views/contracts/diagrams/report-contract-payment-staff.html'
    };
});
