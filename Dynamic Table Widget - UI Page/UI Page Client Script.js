function displaySave(param){
	param.nextElementSibling.style.display = "block";
}
(function () {
    angular.module('myApp', []).controller('MainCtrl', function ($scope) {
		
        $scope.TableInfos = JSON.parse(g_form.getValue('json_data'));
        $scope.compositeKey = [];
        $scope.lob = "";
        var i = 0;
        $scope.status = "Performance Unit Changes / Updates";
		$scope.caption = "Please complete above fields & Click 'Add Items' to add new record into the table";
		var fields = {new_existing:'', pu_change_type:'', performance_unit:'', pu_description:'', pu_start_end_date:'', service_center:'', allocation_pu:'', pcca_rate:'', federal_pu:'', projects_assigned:'', people_assigned:'', countries:'', global_cross_charging:'', line_of_business:'', business_unit:'', region:'', sub_region_1:'', sub_region_2:''};
		var form_vars = ['new_existing_dd', 'pu_change_type_dd', 'performance_unit_slt', 'pu_description_slt', 'pu_start_end_date', 'service_center_yn', 'allocation_pu_yn', 'pcca_rate_slt','federal_pu_yn','projects_assigned_yn','people_assigned_yn', 'countries_lc', 'global_cross_charging_yn', 'line_of_business_dd', 'business_unit_slt', 'region_slt', 'sub_region_1_slt', 'sub_region_2_slt'];
		// Start of all the methods
		$scope.addRecord = function () {
			$scope.caption = "Please complete above fields & Click 'Add Items' to add new record into the table";
            var flag_alert = false;
			//var rec = new_existing + pu_change_type + performance_unit + pu_description;
			
			if (fetchValues()) {//Mandatory Check
				if($scope.lob==fields.line_of_business||$scope.lob==""){
				//	if (!$scope.compositeKey.includes(rec)) { //Duplicates check
						$scope.TableInfos.push({
							'serialKey': ++i,
							'field1': fields.new_existing,
							'field2': fields.pu_change_type,
							'field3': fields.performance_unit,
							'field4': fields.pu_description,
							'field5': fields.pu_start_end_date,
							'field6': fields.service_center,
							'field7': fields.allocation_pu,
							'field8': fields.pcca_rate,
							'field9': fields.federal_pu,
							'field10': fields.projects_assigned,
							'field11': fields.people_assigned,
							'field12': fields.countries,
							'field13': fields.global_cross_charging,
							'field14': fields.line_of_business,
							'field15': fields.business_unit,
							'field16': fields.region,
							'field17': fields.sub_region_1,
							'field18': fields.sub_region_2,
							'selected': false
						});
				//		$scope.compositeKey.push(rec);
						$scope.status = "Data added Successfully";
						document.getElementById("stat").classList.remove("bg-danger");
						document.getElementById("stat").classList.add("bg-success");
						$scope.lob=fields.line_of_business;
				//	} else {
				//		$scope.status = "Duplicate Entries are not allowed";
				//		document.getElementById("stat").classList.add("bg-danger");
				//	}
				}
				else{
					$scope.status = "Line of Business cannot be different for a request";
					document.getElementById("stat").classList.remove("bg-success");
					document.getElementById("stat").classList.add("bg-danger");
					alert("Line of Business cannot be diffrent for one request");
				}
            } else {
                alert("Please complete all the Mandatory fields above");
            }
            g_form.setValue('json_data', JSON.stringify($scope.TableInfos));
// 			for(var j=1;j<form_vars.length;j++){
// 				g_form.setValue(form_vars[j],'');
// 			}
        };
        $scope.checkAll = function () {//used to tick all the checkboxes for the table items
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
              //     var index = $scope.compositeKey.indexOf(data.field1 + data.field2 + data.field3 + data.field4);
              //      $scope.compositeKey.shift();
                    --i;
                }
            });
            $scope.TableInfos = updatedList;
            $scope.selectedAll = false;
            g_form.setValue('json_data', JSON.stringify($scope.TableInfos));
            if ($scope.TableInfos.length == 0) {
				$scope.lob="";
                $scope.status = "Please select all option & click Add";
                document.getElementById("stat").classList.remove("bg-success");
                document.getElementById("stat").classList.add("bg-danger");
            }
        };
		$scope.editRecord = function($index){
			//var field1 = $scope.TableInfos[$index].field1;
			//g_form.getElement()
			//this.hide();
			$scope.caption = "Please edit the above fields as needed and Save the record in the table";
			$scope.status = "Table is in Edit mode";
			document.getElementById("stat").classList.remove("bg-success");
            document.getElementById("stat").classList.add("bg-danger");
			document.getElementById("addItem").classList.add("ng-hide");
			document.getElementById("removeItem").classList.add("ng-hide");	
			$scope.hideEditIcon = true;
			$scope.hideAdd = true;
			$scope.hideRemove = true;
			g_form.clearMessages();
			//$scope.showSaveIcon=true;
			
			g_form.getControl('pu_change_type_dd').focus();
			g_form.getControl('new_existing_dd').focus();
			g_form.addInfoMessage("Please edit the fields and Save the record in the table once done");
			//g_form.flash('label_IO:5f460ef7db5ee34421544b8b0b9619cf', "#FFFACD", 0);
			
			g_form.setValue('new_existing_dd',$scope.TableInfos[$index].field1);
            g_form.setValue('pu_change_type_dd',$scope.TableInfos[$index].field2);
			g_form.setValue('performance_unit_slt',$scope.TableInfos[$index].field3);
			g_form.setValue('pu_description_slt',$scope.TableInfos[$index].field4);
			g_form.setValue('pu_start_end_date',$scope.TableInfos[$index].field5);
			g_form.setValue('service_center_yn',$scope.TableInfos[$index].field6);
			g_form.setValue('allocation_pu_yn',$scope.TableInfos[$index].field7);
			g_form.setValue('pcca_rate_slt',$scope.TableInfos[$index].field8);
			g_form.setValue('federal_pu_yn',$scope.TableInfos[$index].field9);
			g_form.setValue('projects_assigned_yn',$scope.TableInfos[$index].field10);
			g_form.setValue('people_assigned_yn',$scope.TableInfos[$index].field11);
			g_form.setValue('countries_lc',$scope.TableInfos[$index].field12);
			g_form.setValue('global_cross_charging_yn',$scope.TableInfos[$index].field13);
			g_form.setValue('line_of_business_dd',$scope.TableInfos[$index].field14);
			g_form.setValue('business_unit_slt',$scope.TableInfos[$index].field15);
			g_form.setValue('region_slt',$scope.TableInfos[$index].field16);
			g_form.setValue('sub_region_1_slt',$scope.TableInfos[$index].field17);
			g_form.setValue('sub_region_2_slt',$scope.TableInfos[$index].field18);
		};
		$scope.saveRecord = function($index,$event){
			
			if (fetchValues()) {//Mandatory Check
				if(fields.line_of_business==$scope.lob||$scope.TableInfos.length == 1){
					$event.currentTarget.style.display = "none";
					$scope.caption = "Please complete above fields & Click 'Add Items' to add new record into the table";
					$scope.hideEditIcon = false;
					document.getElementById("addItem").classList.remove("ng-hide");
					document.getElementById("removeItem").classList.remove("ng-hide");

					$scope.TableInfos[$index].field1 = fields.new_existing;
					$scope.TableInfos[$index].field2 = fields.pu_change_type;
					$scope.TableInfos[$index].field3 = fields.performance_unit;
					$scope.TableInfos[$index].field4 = fields.pu_description;
					$scope.TableInfos[$index].field5 = fields.pu_start_end_date;
					$scope.TableInfos[$index].field6 = fields.service_center;
					$scope.TableInfos[$index].field7 = fields.allocation_pu;
					$scope.TableInfos[$index].field8 = fields.pcca_rate;
					$scope.TableInfos[$index].field9 = fields.federal_pu;
					$scope.TableInfos[$index].field10 = fields.projects_assigned;
					$scope.TableInfos[$index].field11 = fields.people_assigned;
					$scope.TableInfos[$index].field12 = fields.countries;
					$scope.TableInfos[$index].field13 = fields.global_cross_charging;
					$scope.TableInfos[$index].field14 = fields.line_of_business;
					$scope.TableInfos[$index].field15 = fields.business_unit;
					$scope.TableInfos[$index].field16 = fields.region;
					$scope.TableInfos[$index].field17 = fields.sub_region_1;
					$scope.TableInfos[$index].field18 = fields.sub_region_2;
					g_form.setValue('json_data', JSON.stringify($scope.TableInfos));
					$scope.status = "Modified Data is saved Successfully";
					document.getElementById("stat").classList.remove("bg-danger");
					document.getElementById("stat").classList.add("bg-success");
					$scope.lob=fields.line_of_business;
				}
				else{
					$scope.status = "Line of Business cannot be diffrent for one request";
					document.getElementById("stat").classList.remove("bg-success");
					document.getElementById("stat").classList.add("bg-danger");
				}
			}
			else{
				alert("Please complete all the Mandatory fields above");
			}
		};
// 		var isBlank = function(fields){
// 			var val = false;
// 			angular.forEach(fields, function(value) {
// 				if(value==''){
// 					console.log(value);
// 					val = true;
// 				}
// 			},val);
// 			return val;
// 		};
		function fetchValues(){
			var result=true;
			//fetching values from g_form to field's object as a reusable component
			Object.keys(fields).forEach(function(key,i){
				if(g_form.isMandatory(form_vars[i]))
				{
					if(form_vars[i]=='countries_lc'){//as getValue on Countries field  returns sys_id
						var arr = g_form.getValue('countries_lc').split(",");
						var list=[];
						arr.forEach(function(item){
							var gr = new GlideRecord('u_custom_generic_configuration_table');
							gr.get(item);
							console.log(gr.u_text_field_1);
							 list.push(gr.u_text_field_1);
						});
						fields[key]=list.join("\, ");
						console.log(fields[key]);
					}
					else{
						fields[key] = g_form.getValue(form_vars[i]);
					}
					var val = fields[key];
					if(val == ""){
						g_form.getControl(form_vars[i]).focus();
						result = false;
					}
				}
				else{
					fields[key] = g_form.getValue(form_vars[i]);
				}
			});
			return result;
		}
    });
})();