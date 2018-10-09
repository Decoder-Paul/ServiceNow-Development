//--------------------HTML Template --------------------
<style>
@media (min-width: 1100px){
					.container {
						width: 1070px;
					}
				}
				@media (min-width: 800px){
					.container {
						width: 780px;
					}
				}
				.container{
					padding-right: 0px !important;
				}
</style>
<div class="container" style= "display:block;text-align:center" >
  <div class="row">
    <div class="col-md-12">
      <div class="panel panel-default">
        <div class="panel-body">
          <div class="form-group ">
            <input type="button" class="btn btn-primary addnew pull-left" ng-click="addRecord(TableInfos)" value="Add New"/>
            <input type="button" ng-hide="!TableInfos.length" class="btn btn-danger addnew pull-right" ng-click="remove()" value="Remove"/>
          </div>
          <p id="stat" class="text-center bg-danger">{{status}}</p>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Database Name</th>
                <th>Project Name</th>
                <th>Security</th>
                <th>Name of Company</th>
                <th>Name of Location</th>
                <th><input type="checkbox" ng-model="selectedAll" ng-click="checkAll()"/></th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="EachInfo in TableInfos">
                <td> {{EachInfo.serialKey}} </td>
                <td><input type="text" class="form-control" ng-model="EachInfo.field1" ng-disabled="true"/></td>
                <td><input type="text" class="form-control" ng-model="EachInfo.field2" ng-disabled="true"/></td>
                <td><input type="text" class="form-control" ng-model="EachInfo.field3" ng-disabled="true"/></td>
                <td><input type="text" class="form-control" ng-model="EachInfo.field4" ng-disabled="true"/></td>
                <td><input type="text" class="form-control" ng-model="EachInfo.field5" ng-disabled="true"/></td>
                <td><input type="checkbox" ng-model="EachInfo.selected" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</div>
//----------------- Client Script -------------------
function($scope) {
    $scope.TableInfos =[];
    $scope.compositeKey=[];
    $scope.portfolio=[];
    var i=0;
    $scope.status = "Please select all option & click Add";
    $scope.addRecord = function(){
        var flag_alert = false;
        var database = $scope.page.g_form.getValue('NUR_DatabaseforProj');
        var project = $scope.page.g_form.getValue('NUR_ProjectName');
        var company = $scope.page.g_form.getValue('NUR_NameofCompany');
        var location = $scope.page.g_form.getValue('NUR_NameofLocation');
        var securtity = $scope.page.g_form.getValue('NUR_Security');
        var rec = database + project + company + location;
        if(database && project && securtity && company && location){
            angular.forEach($scope.TableInfos, function(data){
                if(data.field1 == database){
                    if(data.field4!=company||data.field5!=location){
                        flag_alert = true;
                    }
                }
            });

            if(flag_alert==true)
            {
                $scope.status = "Company & Location cannot be different for Same Database";
                document.getElementById("stat").classList.add("bg-danger");
            }
            else{
                if(!$scope.compositeKey.includes(rec)){
                    $scope.TableInfos.push({
                        'serialKey':++i,
                        'field1':database,
                        'field2':project,
                        'field3':securtity,
                        'field4':company,
                        'field5':location,
                        'selected': false
                    });
                    $scope.compositeKey.push(rec);
                    $scope.status = "Data added Successfully";
                    document.getElementById("stat").classList.remove("bg-danger");
                    document.getElementById("stat").classList.add("bg-success");
                }
                else{
                    $scope.status = "Project Name cannot be same for same Database";
                    document.getElementById("stat").classList.add("bg-danger");
                }
            }
        }
        else{
            alert("Please select all the fields from Database Information section");
        }

        $scope.page.g_form.setValue('NUR_json', JSON.stringify($scope.TableInfos));
    };
    $scope.checkAll = function(){
        var checkStatus = $scope.selectedAll;
        angular.forEach($scope.TableInfos, function(itm){
            itm.selected = checkStatus;
        });
    };
    $scope.remove = function(){
        var updatedList = [];
        var j=1;
        angular.forEach($scope.TableInfos, function(data){
            if(!data.selected){
                data.serialKey = j++;
                updatedList.push(data);
            }
            else{
                var index = $scope.compositeKey.indexOf(data.field1+data.field2+data.field4+data.field5);
                $scope.compositeKey.splice(index, 1);
                --i;
            }
        });
        $scope.TableInfos = updatedList;
        $scope.selectedAll = false;
        $scope.page.g_form.setValue('NUR_json',JSON.stringify($scope.TableInfos));
        if($scope.TableInfos.length==0){
            $scope.status = "Please select all option & click Add";
            document.getElementById("stat").classList.remove("bg-success");
            document.getElementById("stat").classList.add("bg-danger");
        }
    };
}
