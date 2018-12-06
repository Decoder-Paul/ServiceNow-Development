(function () {
    angular.module('tableApp', [])
    .controller('MainCtrl', function ($scope) {
        $scope.TableInfos = [];
        $scope.compositeKey = [];
        $scope.portfolio = [];
        var i = 0;
        $scope.status = "Project Information";
        $scope.addRecord = function () {
            var flag_alert = false;
            var rec = g_form.getValue('NUR_DatabaseforProj') + g_form.getValue('NUR_ProjectName') + g_form.getValue('NUR_NameofCompany') + g_form.getValue('NUR_NameofLocation');
            if (g_form.getValue('NUR_DatabaseforProj') && g_form.getValue('NUR_ProjectName') && g_form.getValue('NUR_Security') && g_form.getValue('NUR_NameofCompany') && g_form.getValue('NUR_NameofLocation')) {
                angular.forEach($scope.TableInfos, function (data) {
                    if (data.field1 == g_form.getValue('NUR_DatabaseforProj')) {
                        if (data.field4 != g_form.getValue('NUR_NameofCompany') || data.field5 != g_form.getValue('NUR_NameofLocation')) {
                            flag_alert = true;
                        }
                    }
                });

                if (flag_alert == true) {
                    $scope.status = "Company & Location cannot be different for Same Database";
                    document.getElementById("stat").classList.add("bg-danger");
                } else {
                    if (!$scope.compositeKey.includes(rec)) {
                        $scope.TableInfos.push({
                            'serialKey': ++i,
                            'field1': g_form.getValue('NUR_DatabaseforProj'),
                            'field2': g_form.getValue('NUR_ProjectName'),
                            'field3': g_form.getValue('NUR_Security'),
                            'field4': g_form.getValue('NUR_NameofCompany'),
                            'field5': g_form.getValue('NUR_NameofLocation'),
                            'selected': false
                        });
                        $scope.compositeKey.push(rec);
                        $scope.status = "Data added Successfully";
                        document.getElementById("stat").classList.remove("bg-danger");
                        document.getElementById("stat").classList.add("bg-success");
                    } else {
                        $scope.status = "Project Name cannot be same for same Database";
                        document.getElementById("stat").classList.add("bg-danger");
                    }
                }
            } else {
                alert("Please select all the fields from Database Information section");
            }

            g_form.setValue('NUR_json', JSON.stringify($scope.TableInfos));
        };
        $scope.checkAll = function () {
            var checkStatus = $scope.selectedAll;
            angular.forEach($scope.TableInfos, function (itm) {
                itm.selected = checkStatus;
            });
        };
        $scope.remove = function () {
            var updatedList = [];
            var j = 1;
            angular.forEach($scope.TableInfos, function (data) {
                if (!data.selected) {
                    data.serialKey = j++;
                    updatedList.push(data);
                } else {
                    var index = $scope.compositeKey.indexOf(data.field1 + data.field2 + data.field4 + data.field5);
                    $scope.compositeKey.splice(index, 1);
                    --i;
                }
            });
            $scope.TableInfos = updatedList;
            $scope.selectedAll = false;
            g_form.setValue('NUR_json', JSON.stringify($scope.TableInfos));
            if ($scope.TableInfos.length == 0) {
                $scope.status = "Please select all option & click Add";
                document.getElementById("stat").classList.remove("bg-success");
                document.getElementById("stat").classList.add("bg-danger");
            }
        };
    });
})();