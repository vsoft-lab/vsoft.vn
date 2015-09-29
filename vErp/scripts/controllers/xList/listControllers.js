'use strict';
angular.module('xMoney')
    .controller('appListController', ["$scope", "$rootScope", "xService", '$http', 'auth', '$filter', 'SETTINGS', '$timeout', 'ngDialog', 'nsPopover', '$state', '$upload', '$FileService',
        function ($scope, $rootScope, xService, $http, auth, $filter, SETTINGS, $timeout, ngDialog, nsPopover, $state, $upload, $FileService) {
            var modalSearch,
                configName = $rootScope.stateSettingFile,
                modalEditAll,
                loadOptionData;

            loadOptionData = function (rqParams, config, callback) { // Dung de load du lieu cho select box
                var opts = [];
                if (config.Type == 'flag') {
                    for (var i = 0, j = config['Source'].Property.length; i < j; i++) {
                        var obj = {};
                        obj['value'] = config['Source'].Property[i].Key;
                        obj['caption'] = config['Source'].Property[i].Value;
                        obj['model'] = config.Model;
                        opts.push(obj);
                    }

                    callback(null, opts);
                } else {
                    xService.requestServer(rqParams, function (err, resp) {
                        if (err) {
                            callback(err, null);
                        } else {

                            for (var i = 0, j = resp.datasource.length; i < j; i++) {
                                var obj = {};
                                obj['value'] = resp.datasource[i][config.Display[0]];
                                obj['caption'] = resp.datasource[i][config.Display[1]];
                                obj['model'] = config.Model;
                                opts.push(obj);
                            }

                            callback(null, opts);
                        }
                    })
                }
            };


            async.waterfall([

                function (callback) { // Lấy cấu hình của state
                    SETTINGS.getSettings(configName, function (err, setting) {
                        callback(err, setting);
                    })
                }, function (stateSetting, callback) { // Lấy các params truy vấn

                    var _tmpStateSetting = JSON.parse(JSON.stringify(stateSetting));
                    var listTasksGetAction = [];
                    var listTasksFormSource = [];

                    // Load action query , eg : Search , Insert, Update, Delete
                    angular.forEach(_tmpStateSetting['Action'], function (value, property) {
                        var source = value.split('.');
                        listTasksGetAction.push(function (callback) {
                            SETTINGS.getSettings('requests/' + source[0], function (err, config) {
                                _tmpStateSetting['Action'][property] = config[source[1]];
                                callback(err, config[source[1]]);
                            });
                        });
                    });


                    // Load params truy vấn cho các trường có thuộc tính 'Source'
                    angular.forEach(_tmpStateSetting.Form.Field, function (value, property) {

                        if (value.hasOwnProperty('Source')) {
                            if (typeof value.Source == 'string') {
                                var source = value.Source.split('.');
                                listTasksFormSource.push(function (callback) {
                                    SETTINGS.getSettings('requests/' + source[0], function (err, config) {
                                        _tmpStateSetting.Form.Field[property].Source = config[source[1]];

                                        loadOptionData(config[source[1]], _tmpStateSetting.Form.Field[property], function (err, data) {
                                            if (!err) {
                                                _tmpStateSetting.Form.Field[property].options = data;
                                                callback(err, _tmpStateSetting.Form.Field[property]);
                                            }
                                        });

                                    });
                                });
                            } else {

                                _tmpStateSetting.Form.Field[property].Source = value.Source;
                                loadOptionData(value.Source, _tmpStateSetting.Form.Field[property], function (err, data) {
                                    if (!err) {
                                        _tmpStateSetting.Form.Field[property].options = data;
                                        callback(err, _tmpStateSetting.Form.Field[property]);
                                    }
                                });
                            }
                        }
                    });


                    async.series(listTasksGetAction, function (err, result) {
                        async.series(listTasksFormSource, function (err, result) {
                            callback(null, _tmpStateSetting);
                        });
                    });
                }

            ], function (err, result) { // Run inital controller

                if (!err) {
                    $timeout(function () {
                        init(JSON.stringify(result));
                        console.log(result);
                    });
                }
            });


            $scope.editAllCount = 0;

            $scope.loadingShow = true;
            $scope._ = _; // Binding va su dung underscore ngoai views


            /*
             * Trang thai load cua state
             * True : Load xong
             * False : Chua load xong
             * */

            $scope.stateReady = false;


            function init(config) {
                // Config cua state
                $scope.stateSettings = JSON.parse(config);

                $scope.xSearchSetting = $scope.stateSettings['xSearch'] || []; // Search settings

                $scope.xBottomBar = $scope.stateSettings['xBottomBar'] || []; // Config cua bottom bar (hien tai khong su dung)

                $scope.itemPerPage = xService.getSystemSetting().LimitRecordWhenNextPage;    // So item hien thi khi load du lieu

                $scope.totalItem = 0;       // Tong so item
                $scope.datasource = [];     // Luu tru cac data da~ lay ve
                $scope.quickSearchData = []; // Luu tru cac truong cua search nhanh


                $scope.attachment = []; //
                $scope.selectedId = {};  // Model cua checkbox check nhieu` ban khi

                $scope.selectedItem = {};

                $scope.dataSearch = []; // Luu tru cac truong khi mo modal search

                $scope.dataMutilItem = {}; //

                $scope.quickFilterQuery = {}; // Query cua search nhanh

                $scope.searchQuery = {}; /// Query cua search binh thuo

                $scope.flagFieldData = {};

                $scope.searchQuery.EndIndex = xService.getSystemSetting().LimitRecordDefault; // So ban ghi lay ra khi search


                $scope.searchByOrderQuery = {};

                $scope.searchByOrderSelectData = [
                    {name: 'Tăng dần', code: 'ASC'},
                    {name: 'Giảm dần', code: 'DESC'}
                ];

                $scope.parseInt = parseInt;


                $scope.searchStart = false;
                $scope.haveResult = true;

                $scope.commentContent = {
                    content: ""
                };


                var actionSetting = $scope.stateSettings['Action'],
                    getParams = actionSetting['Get'],
                    getQuickSearchData,
                    loadData,
                    generateQuery,
                    getDataSearch,

                    dateFields = ["StartDate", "EndDate"];


                getParams.StartIndex = 1;
                getParams.EndIndex = xService.getSystemSetting().LimitRecordDefault;

                // Lấy dữ liệu cho state
                loadData = function () { //

                    xService.requestServer(getParams, function (err, resp) {
                        $scope.stateReady = true;

                        if (err) return console.log(err);
                        $scope.haveResult = (resp.datasource.length > 0);

                        getParams.StartIndex = parseInt(getParams.EndIndex) + 1;
                        getParams.EndIndex = parseInt(getParams.EndIndex) + $scope.itemPerPage;


                        $scope.totalItem = resp.totalcount;
                        $scope.datasource = $scope.datasource.concat(resp.datasource); // Push cac item lay ve vao mang
                        $scope.canInfineScroll = true;
                    });
                };

                // Lấy dũ liệu cho tìm kiếm nhanh
                getQuickSearchData = function () {

                    for (var i = 0, j = $scope.stateSettings.Form.Field.length; i < j; i++) {
                        if ($scope.stateSettings.Form.Field[i].hasOwnProperty('QuickFilter') && $scope.stateSettings.Form.Field[i].QuickFilter) {
                            getDataSearch($scope.stateSettings.Form.Field[i].Model, function (err, data) {
                                if (err) {
                                    $scope.quickSearchData = [];
                                    toastr.warning('Không thể lấy dữ liệu');
                                } else {
                                    $scope.quickSearchData = data;
                                }

                            });
                        }
                    }
                };

                // Lấy dữ liệu khi chọn tìm kiếm nâng cao
                getDataSearch = function (model, cb) {

                    $scope.stateSettings.Form.Field.forEach(function (v, k) {
                        if (v.Model == model) {
                            if (v.hasOwnProperty('options') && _.size(v['options']) > 0) {
                                cb(null, v['options']);
                            } else {
                                loadOptionData(v['Source'], v, function (err, data) {
                                    cb(err, data)
                                })
                            }
                        }

                    });
                };


                // Generate query cho search

                generateQuery = function (querySearch, callback) {
                    var searchParams = {},
                        conditionField = [],
                        orderFields = "";

                    angular.forEach(querySearch, function (v, k) {
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


                    angular.forEach($scope.searchByOrderQuery, function (value, key) {
                        if (value != null) {
                            orderFields += key + " " + value + ";"
                        }

                    });

                    searchParams['OrderFields'] = orderFields;
                    callback(searchParams, conditionField);
                };


                // Hàm kiểm tra số trường tìm kiếm nâng cao đã chọn
                $scope.getFilterLength = function (data) {
                    var searchArr = [];
                    for (var property in data) {
                        if (data[property] == true) {
                            searchArr.push(property);
                        }
                    }
                    return searchArr.length;
                };


                /*
                 Upload
                 */

                $scope.selectedFiles = [];

                // Chạy khi người dùng chọn file
                $scope.onFileSelect = function ($files) {
                    $scope.selectedFiles = [];
                    for (var i = 0; i < $files.length; i++) {
                        $scope.selectedFiles.push($files[i]);
                    }
                };

                // Chạy khi người dùng nhấn upload file
                $scope.uploadFile = function () {
                    document.getElementById('fileInput').click();
                };

                // Hàm upload file
                $scope.uploadProcess = function (parentId, file) {

                    $upload.upload({
                        url: appUri.BaseUri,
                        method: 'POST',
                        data: {
                            RequestClass: 'BPM',
                            RequestAction: 'UploadAttachment',
                            SessionId: getItemLocalStorage(localStorageConstant.SessionId),
                            Username: auth.getUser().Username,
                            Parent: parentId,
                            WriteTempFile: true,
                            'Content-Type': file.type
                        },
                        file: file

                    }).then(function (response) {
                        $scope.selectedFiles.splice($scope.selectedFiles.indexOf(file), 1);
                        $scope.$broadcast('FILE_UPLOAD_DONE_PARENT_' + parentId.toUpperCase(), response);
                    }, null, function (evt) {
                        console.log('Upload process', parseInt(100.0 * evt.loaded / evt.total));
                    }).xhr(function (xhr) {
                        xhr.upload.addEventListener('abort', function () {
                            console.log('aborted complete');
                        }, false);
                    }).error(function (err) {
                        console.log('Upload error', err);
                    });
                };


                $scope.actionSearch = function () { // Thực hiện khi nhấn nut search

                    if (window.hasOwnProperty('cordova')) {
                        SoftKeyboard.hide();
                    } else {
                        console.log('not plugin keyboard');
                    }


                    $scope.searchStart = true;

                    generateQuery($scope.searchQuery, function (query, cField) {

                        var params = getParams;

                        if (params.ConditionFields) {
                            params.ConditionFields = params.ConditionFields + ';' + cField;
                        } else {
                            params.ConditionFields = cField;
                        }

                        var _conditionalArr = params.ConditionFields.split(';');

                        if (params.StructFields) {
                            var _structFields = params.StructFields.split(';');

                        }
                        _.extend(params, query);

                        // Kiem tra cac truong co dinh dang la date thi` formart lai thanh YYYY-MM-DD

                        for (var fieldName in params) {
                            if (params.hasOwnProperty(fieldName)) {

                                if (_.contains(dateFields, fieldName)) {
                                    params[fieldName] = moment(params[fieldName]).format("YYYY-MM-DD");
                                }

                                if (!params[fieldName]) {
                                    delete params[fieldName];

                                    if (_conditionalArr.indexOf(fieldName) !== -1) {
                                        _conditionalArr.splice(_conditionalArr.indexOf(fieldName), 1);
                                    }
                                }
                            }
                        }

                        _conditionalArr = _.uniq(_conditionalArr);
                        params.ConditionFields = _conditionalArr.join(';');

                        params.StartIndex = 1;
                        if (params.Id) delete params.Id;

                        xService.requestServer(params, function (err, resp) {
                            $scope.searchStart = false;

                            if (!err) {

                                if (resp.datasource.length > 0) {
                                    $scope.haveResult = true;
                                } else {
                                    $scope.haveResult = false;
                                }

                                getParams.EndIndex = parseInt(getParams.EndIndex) + $scope.itemPerPage;
                                getParams.StartIndex = parseInt(getParams.StartIndex) + $scope.itemPerPage;

                                $scope.totalItem = resp.totalcount;

                                $scope.datasource = resp.datasource;
                            }
                        })
                    })
                };

                // Kiêm tra tra các trường trạng thái (state)
                $scope.checkStateCode = function (state, num) {
                    if (isGuid(state)) {
                        if (state == num.Code) {
                            return true;
                        } else {
                            return false;
                        }

                    } else {
                        var State = parseInt(state);
                        return ((State & parseInt(num.Code)) == parseInt(num.Code));
                    }
                };

                // Khởi tạo model cho trường flag
                $scope.flagFieldUpdate = function (modelName, flag) {
                    if ($scope.detailItem.hasOwnProperty(modelName)) {
                        if (!$scope.flagFieldData.hasOwnProperty(modelName)) $scope.flagFieldData[modelName] = {};

                        if ($scope.checkStateCode($scope.detailItem[modelName], {Code: flag.Key})) {
                            $scope.flagFieldData[modelName][flag.Key] = true;
                        } else {
                            $scope.flagFieldData[modelName][flag.Key] = false;
                        }
                    }

                    return true;
                };

                // Chạy khi trường kiểu flag thay đổi dữ liệu
                $scope.flagFieldChange = function (modelName) {
                    var modelValue = 0;
                    angular.forEach($scope.flagFieldData[modelName], function (v, k) {
                        if (v == true) {
                            modelValue += parseInt(k);
                        }
                    });
                    $scope.detailItem[modelName] = modelValue;
                    console.log($scope.detailItem[modelName]);
                };

                // Mở modal tìm kiếm nâng cao
                $scope.openModalSearch = function (arg1) {
                    ngDialog.open(
                        {
                            template: './views/xList/modal.html',
                            showClose: false,
                            scope: $scope
                        }
                    );

                    getDataSearch(arg1, function (err, data) {

                        if (err) {
                            $scope.dataSearch = [];
                            toastr.warning('Lỗi kết nối đến server');
                        } else {

                            $scope.dataSearch = data;
                        }
                    })
                };

                // Mở modal tìm kiếm sắp xếp
                $scope.openModalSearchBySort = function () {
                    ngDialog.open(
                        {
                            template: './views/xList/modal-search-by-sort.html',
                            showClose: false,
                            scope: $scope
                        }
                    );

                };

                // Hàm thực thi khi load infinite scroll
                $scope.loadMore = function () {
                    $scope.canInfineScroll = false;
                    if ($scope.totalItem !== 0 && parseInt($scope.totalItem) > $scope.datasource.length) {
                        loadData();
                    } else {
                        $scope.canInfineScroll = false;
                        $scope.loadingShow = false;
                    }
                };



                // Kiểm tra khi checkbox ngoài index thay đổi giá trị , nếu uncheck thì delete giá trị trong $scope.selectedId
                $scope.checkBoxChange = function (v) {
                    if ($scope.selectedId.hasOwnProperty(v) && $scope.selectedId[v] == 0) {
                        delete $scope.selectedId[v];
                    }
                };

                // Hàm check all và uncheck
                $scope.checkAllChange = function (status) {
                    if (status) {
                        for (var i = 0, j = $scope.datasource.length; i < j; i++) {
                            $scope.selectedId[$scope.datasource[i].Id] = true;
                        }
                    } else {
                        $scope.selectedId = {};
                    }
                };



                // Hàm hiển thị và load dữ liệu vào modal sửa nhiều
                $scope.editModalAll = function () {

                    $scope.editAllCount = 0;

                    modalEditAll = ngDialog.open({
                        template: './views/xList/modal-edit-all.html',
                        showClose: false,
                        scope: $scope
                    });


                    $scope.stateSettings.Form.Field.forEach(function (v, k) {
                        if (v.Type == 'select') {
                            if (v.hasOwnProperty('Source')) {
                                if (typeof v.Source == 'string') {
                                    var source = v.Source.split('.');
                                    SETTINGS.getSettings('requests/' + source[0], function (err, _menu) {
                                        if (!err) {
                                            loadOptionData(_menu[source[1]], v, function (err, data) {
                                                if (!err) {
                                                    console.log('blue blue blue', data);
                                                    $scope.stateSettings.Form.Field[k].options = data;
                                                }
                                            })
                                        }
                                    });

                                } else {
                                    loadOptionData(v['source'], v, function (err, data) {
                                        if (!err) {
                                            $scope.stateSettings.Form.Field[k].options = data;
                                        }
                                    })
                                }
                            }
                        }
                    });

                };


                $scope.selectChangeValue = function (field, value) {
                    var fieldName = field + 'Name',
                        selectId = $scope.selectedItem[field];

                    for (var i = 0, j = value.length; i < j; i++) {
                        if (value[i].value == selectId) {
                            $scope.selectedItem[fieldName] = value[i].caption;
                        }
                    }
                };

                var toastEditListItem;


                // Hàm sửa nhiều bản ghi
                $scope.editListItem = function () {

                    toastEditListItem = toastr.success($scope.editAllMsg);


                    var listTask = [];
                    angular.forEach($scope.selectedId, function (v, k) {

                        var rqParams = actionSetting['Update'];
                        _.extend(rqParams, $scope.selectedItem);

                        listTask.push(function (callback) {
                            rqParams.Id = k;

                            xService.requestServer(rqParams, function (err, resp) {
                                if (!err) {
                                    angular.forEach($scope.datasource, function (item, index) {
                                        if (item.Id == k) {
                                            _.extend($scope.datasource[$scope.datasource.indexOf(item)], $scope.selectedItem);
                                            /*angular.extend(, $scope.selectedId);*/
                                        }
                                    })
                                }

                                $scope.editAllCount++;
                                callback(err, resp);
                            });
                        })
                    });

                    async.series(listTask, function (err, resp) {
                        ngDialog.close('./views/xList/modal-edit-all.html');


                        if (err) {
                            toastr.error('Cập nhật thất bại !');
                        } else {
                            toastr.success('Cập nhật thành công !');
                        }
                    })
                };


                $scope.$watch('editAllCount', function (n, o) {
                    if (n > 0) {
                        toastEditListItem[0].innerText = "Tiến trình " + n + " / " + (_.size($scope.selectedId));
                    }
                });


                var removeItem = function (itemId, callback) {
                    var rqParams = actionSetting['Delete'];
                    _.extend(rqParams, {Id: itemId});
                    xService.requestServer(rqParams, function (err, resp) {
                        callback(err, resp);
                    });
                };


                $scope.removeItemsCount = 0;
                var toastRemoveItems;

                // Hàm xóa nhiều bản ghi
                $scope.removeItems = function () {
                    if (confirm("Bạn có muốn xóa " + _.size($scope.selectedId) + " bản ghi ?")) {
                        var listTask = [];

                        toastRemoveItems = toastr.success("Đang xóa " + $scope.removeItemsCount + " / " + (_.size($scope.selectedId)));

                        angular.forEach($scope.selectedId, function (v, k) {

                            listTask.push(function (callback) {

                                removeItem(k, function (err, resp) {
                                    if (!err) {
                                        $scope.removeItemsCount++;
                                        angular.forEach($scope.datasource, function (item, index) {
                                            if (item.Id == k) {
                                                $scope.datasource.splice($scope.datasource.indexOf(item), 1);
                                            }
                                        })
                                    }
                                    callback(err, resp);
                                })
                            })
                        });

                        async.series(listTask, function (err, resp) {
                            if (err) {
                                toastr.error('Xóa thất bại');
                            } else {

                                $timeout(function () {
                                    $scope.selectedId = {};
                                }, 500);

                                toastr.success('Xóa thành công !');
                            }
                        })
                    }
                };

                $scope.$watch('removeItemsCount', function (n, o) {
                    if (n > 0) {
                        toastRemoveItems[0].innerText = "Đang xóa " + n + " / " + (_.size($scope.selectedId));
                    }
                });


                // Chạy hàm lấy dữ liệu từ server

                loadData();
                getQuickSearchData();




                /*
                *   Phần chi tiết danh sách
                *
                * */


                // Định nghĩa các tab cho trang chi tiết

                $scope.tabs = [
                    {
                        title: 'Chi tiết',
                        url: 'one.tpl.html'
                    },
                    {
                        title: 'Đính kèm',
                        url: 'two.tpl.html'
                    }
                ];

                $scope.currentTab = 'one.tpl.html';

                $scope.onClickTab = function (tab) {
                    $scope.currentTab = tab;
                };

                $scope.isActiveTab = function (tabUrl) {
                    return tabUrl == $scope.currentTab;
                };



                $scope.detailItem = {};
                $scope.attachment = {};
                $scope.isContractState = false;


                // Thực thi khi người dùng chọn xem chi một bản ghi hoặc muốn thêm một bản ghi mới

                $scope.selectItem = function (item) {
                    $scope.flagFieldData = {};
                    $scope.detailItem = item;
                    $scope.attachment = {};


                    if (item.Id) {
                        loadAttachment(item.Id);

                        // Kiểm tra nếu state hiện tại là hợp đồng thì lấy dữ liệu và hiển thị công việc theo hợp đồng đó
                        if ($scope.stateSettings.hasOwnProperty('name') && $scope.stateSettings.name === 'contract') {

                            $scope.isContractState = true;

                            SETTINGS.getSettings('requests/contract', function (err, config) {
                                if (!err) {

                                    var getTasksByContractParams = config['getTasksByContract'];
                                    getTasksByContractParams.Contract = item.Id;

                                    xService.requestServer(getTasksByContractParams, function (err, resp) {
                                        if (err) {
                                            console.log('getTask by contract error');
                                        } else {
                                            $scope.listTaskByContract = resp.datasource;
                                        }
                                    })
                                }
                            });
                        }


                    };


                    $scope.currentTab = 'one.tpl.html';
                    ngDialog.open({
                        template: './views/xList/modal-detail.html',
                        showClose: false,
                        scope: $scope
                    });
                };

                // Thực thi khi người dụng chọn select box trong chi tiết

                $scope.selectChangeValueDetail = function (field, value) {
                    var fieldName = field + 'Name',
                        selectId = $scope.detailItem[field];

                    angular.forEach(value, function (v, k) {
                        if (v.value == selectId) {
                            $scope.detailItem[fieldName] = v.caption;
                        }
                    });
                };

                // Load file đính kèm theo parent id
                var loadAttachment = function (parentId) {
                    var searchAttachmentParams = {
                        "ConditionFields": "Parent",
                        "Parent": parentId,
                        "RequestAction": "SearchAttachment",
                        "RequestClass": "BPM"
                    };

                    xService.requestServer(searchAttachmentParams, function (err, resp) {
                        if (err) {
                            console.log('Get attachment error');
                        } else {
                            $scope.attachment = resp.datasource;
                        }
                    });
                };

                // Hàm kiểm tra tính hợp lệ của form
                var formValidate = function (form) {
                    if (form.$error.required) {
                        var inputErrors = form.$error.required,
                            fieldErrors = [],
                            configFields = $scope.stateSettings.Form.Field;

                        for (var i = 0, j = inputErrors.length; i < j; i++) {

                            for (var e = 0, f = configFields.length; e < f; e++) {
                                if (configFields[e].hasOwnProperty('Required') && configFields[e].Required && inputErrors[i].$name == configFields[e].Model) {
                                    fieldErrors.push(configFields[e].Caption);
                                }
                            }
                        }
                        if (fieldErrors.length > 0) {
                            alert('Trường ' + fieldErrors.join(', ') + ' là trường bắt buộc phải nhập !');
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                };

                // Hàm xóa attachment
                $scope.removeAttachment = function (attachment) {
                    var params = {
                        RequestClass: "BPM",
                        RequestAction: "DeleteAttachment",
                        AttachmentId: attachment.Id
                    }
                    xService.requestServer(params, function (err, resp) {
                        if (!err) {
                            $scope.attachment.splice($scope.attachment.indexOf(attachment), 1);
                        }
                    })
                };

                // Thực thi khi người dùng nhấn nút 'Cập nhật'
                $scope.updateItem = function (item) {


                    var rqParams = actionSetting['Update'];
                    _.extend(rqParams, item);

                    if (_.size($scope.selectedFiles) > 0) {

                        for (var i = 0; i < $scope.selectedFiles.length; i++) {
                            $scope.uploadProcess(item.Id, $scope.selectedFiles[i]);
                        }
                        var evtName = 'FILE_UPLOAD_DONE_PARENT_' + item.Id.toUpperCase();

                        $scope.$on(evtName, function (data) {
                            if (_.size($scope.selectedFiles) == 0) {

                                $scope.$$listeners[evtName] = []; // remove event listener
                                loadAttachment(item.Id);
                                xService.requestServer(rqParams, function (err, resp) {

                                    if (err) {
                                        toastr.error('Cập nhật bản ghi thất bại');
                                    } else {
                                        toastr.success('Cập nhật bản ghi thành công');
                                    }
                                })
                            }
                        })
                    } else {
                        xService.requestServer(rqParams, function (err, resp) {
                            if (err) {
                                toastr.error('Cập nhật bản ghi thất bại');
                            } else {
                                toastr.success('Cập nhật bản ghi thành công');
                            }
                        })
                    }


                };

                // Hàm xóa bản ghi , thực thi khi người dùng nhấn nút xóa.

                $scope.removeItem = function (item) {
                    if (confirm('Bạn có muốn xóa bản ghi này ?')) {
                        removeItem(item.Id, function (err, resp) {
                            if (err) {
                                toastr.error('Có lỗi xảy ra !');
                            } else {
                                if (resp.success) {

                                    if ($scope.datasource.indexOf(item) !== -1) {
                                        $scope.datasource.splice($scope.datasource.indexOf(item), 1);
                                    }

                                    toastr.success('Xóa thành công bản ghi');
                                } else {
                                    toastr.error('Không thể xóa bản ghi');
                                }
                            }
                        });
                    }
                };

                // Hàm tạo mới bản ghi , thực thi khi người dùng nhấn vào nút 'Thêm mới'
                $scope.createItem = function (newItem, form) {
                    if (formValidate(form)) {

                        var rqParams = actionSetting['Add'];
                        _.extend(rqParams, newItem);
                        if (newItem.Id) delete rqParams.Id;

                        xService.requestServer(rqParams, function (err, resp) {
                            if (err) {
                                toastr.error('Thêm bản ghi thất bại');
                            } else {
                                var getNewItemParams = actionSetting['Get'];

                                getNewItemParams.ConditionFields = 'Id';
                                getNewItemParams.Id = resp.Data;

                                xService.requestServer(getNewItemParams, function (err, resp) {
                                    if (!err) {
                                        $scope.datasource.unshift(resp.datasource[0]);
                                    }
                                });

                                toastr.success('Thêm bản ghi thành công');
                            }
                        });
                    } else {
                        return false;
                    }
                };


                $scope.openCommentModal = function () {
                    /*var modalComment  = ngDialog.open(
                     {
                     template: './views/xList/modal-cmt.html',
                     scope: $scope,
                     plain:false

                     }
                     );*/

                };

                // Hàm kiêm tra thuộc tính required của form
                $scope.checkRequired = function (status) {
                    if (typeof status == 'string') {
                        return JSON.parse(status);
                    } else {
                        return false;
                    }

                };

                // Thực thi khi người dung nhấn vào bất kỳ item nào trên bottom bar

                $scope.buttonBarAction = function (action, currentItem) {
                    switch (action) {
                        case 'like':
                            var user = auth.getUser();
                            var LikeParams = {
                                "RequestAction": "Like",
                                "RequestClass": "xBase",
                                "StaticFields": "Parent;User;Name;Account;Email",
                                "Parent": currentItem.Id,
                                "User": user.UserId,
                                "Name": user.Username,
                                "Account": user.LoginName,
                                "Email": user.Email
                            };

                            xService.requestServer(LikeParams, function (err, resp) {

                                if (!err) {

                                }
                            });
                            break;
                        case 'comment':
                            $scope.openCommentModal();

                            $scope.cmtAction = function (cmt) {
                                var user = auth.getUser(),
                                    content = $scope.commentContent.content;

                                var params = {
                                    "RequestAction": "Comment",
                                    "RequestClass": "xBase",
                                    "StaticFields": "Parent;User;Name;Account;Email;Title",
                                    "DynamicFields": "Content",
                                    "Parent": currentItem.Id,
                                    "User": user.UserId,
                                    "Name": user.Username,
                                    "Account": user.LoginName,
                                    "Email": user.Email,
                                    "Title": "Day la title",
                                    "Content": content
                                }

                                xService.requestServer(params, function (err, resp) {
                                    if (!err) {

                                    }
                                })
                            }
                            break
                        default:
                            console.log('default');
                    }
                }


            }
        }
    ]);
