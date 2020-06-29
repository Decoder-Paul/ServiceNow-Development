function displaySave(param) {
	param.nextElementSibling.style.display = "block";
}
(function () {
	angular.module('myApp', []).controller('MainCtrl', function ($scope) {

		$scope.TableInfos = []; //used only for displaying in the HTML
		$scope.data = []; //used to consolidate all the entries into an array
		var i = 0;
		$scope.status = "IT Endpoint Deployment Changes/Updates";
		$scope.caption = "Please complete above fields & Click 'Add Information' to add new record into the table";
		//var form_vars = ['swap_date', 'data_sample_needed', 'customer_type', 'project_number', 'deployment_type', 'request_type', 'customer_name', 'customer_location', 'building_floor_workstation','lob','serial_number','asset_tag', 'model', 'old_serial_number', 'old_asset_tag', 'old_model', 'old_state', 'old_substate', 'software_needed'];
		// Start of all the methods
		$scope.addRecord = function () {
			$scope.caption = "Please complete above fields & Click 'Add Information' to add new record into the table";
			var flag_alert = false;
			var fields = fetchValues();//returning fields object if no missing mandatory fields
			if (fields) { //getting the single line record object with Mandatory Check
				
				//	if (!$scope.compositeKey.includes(rec)) { //Duplicates check
				$scope.TableInfos.push(getDisplayValueObject(fields));
				$scope.data.push(fields);
				g_form.setValue('json_data', JSON.stringify($scope.data));
				//		$scope.compositeKey.push(rec);
				$scope.status = "Data added Successfully";
				document.getElementById("stat").classList.remove("danger");
				document.getElementById("stat").classList.add("bg-success");
				
				Object.keys(fields).forEach(function (key, i) {
					g_form.clearValue(key);
				});
			} else {
				alert("Please complete all the Mandatory fields above");
			}
			g_form.setDisabled("records_added", false);
		};//-->End of addRecord()

		$scope.checkAll = function () { //used to tick all the checkboxes for the table items
			var checkStatus = $scope.selectedAll;
			angular.forEach($scope.TableInfos, function (item) {
				item.selected = checkStatus;
			});
		};
		$scope.remove = function () {
			var updatedTableList = [];
			var updatedDataList = [];
			var j = 1;
			$scope.TableInfos.forEach(function (item, i) {
				if (!item.selected) {
					updatedTableList.push(item);
					updatedDataList.push($scope.data[i]);
				} else {
					//     var index = $scope.compositeKey.indexOf(data.field1 + data.field2 + data.field3 + data.field4);
					//      $scope.compositeKey.shift();
				}
			});
			$scope.TableInfos = updatedTableList;
			$scope.data = updatedDataList;
			$scope.selectedAll = false;
			g_form.setValue('json_data', JSON.stringify($scope.data));
			if ($scope.TableInfos.length == 0) {
				$scope.status = "Please complete above fields & Click 'Add Information' to add new record into the table";
				document.getElementById("stat").classList.remove("bg-success");
				document.getElementById("stat").classList.add("danger");
			}
		};
		$scope.editRecord = function ($index) {
			//var field1 = $scope.TableInfos[$index].field1;
			//g_form.getElement()
			//this.hide();
			$scope.caption = "Please edit the above fields as needed and Save the record in the table";
			$scope.status = "Table is in Edit mode";
			document.getElementById("stat").classList.remove("bg-success");
			document.getElementById("stat").classList.add("danger");
			document.getElementById("addItem").classList.add("ng-hide");
			document.getElementById("removeItem").classList.add("ng-hide");
			$scope.hideEditIcon = true;
			$scope.hideAdd = true;
			$scope.hideRemove = true;
			g_form.clearMessages();
			//$scope.showSaveIcon=true;

			g_form.getControl('swap_date').focus();
			g_form.addInfoMessage("Please edit the fields and Save the record in the table once done");

			var fieldObject = $scope.data[$index];
			Object.keys(fieldObject).forEach(function (key) {
				g_form.setValue(key, fieldObject[key].value);
			});
			
		};//--> end of editRecord()

		$scope.saveRecord = function ($index, $event) {
			var fields = fetchValues();
			if (fields) { //Mandatory Check
				$event.currentTarget.style.display = "none";
				$scope.caption = "Please complete above fields & Click 'Add Items' to add new record into the table";
				$scope.hideEditIcon = false;
				document.getElementById("addItem").classList.remove("ng-hide");
				document.getElementById("removeItem").classList.remove("ng-hide");
				
				$scope.TableInfos[$index] = getDisplayValueObject(fields);
				$scope.data[$index] = fields;//replacing the old field object
				g_form.setValue('json_data', JSON.stringify($scope.data));
				$scope.status = "Modified Data is saved Successfully";
				document.getElementById("stat").classList.remove("danger");
				document.getElementById("stat").classList.add("bg-success");
				$scope.lob = fields.line_of_business;
				
				Object.keys(fields).forEach(function (key, i) {
					g_form.clearValue(key);
				});
			} else {
				g_form.addErrorMessage("Please complete all the Mandatory fields above");
			}
		};//--> end of saveRecord()
		function getDisplayValueObject(fields){
			return {
				'field1': fields.swap_date.displayValue,
				'field2': fields.data_sample_needed.displayValue,
				'field3': fields.customer_type.displayValue,
				'field4': fields.project_number.displayValue,
				'field5': fields.deployment_type.displayValue,
				'field6': fields.request_type.displayValue,
				'field7': fields.customer_name.displayValue,
				'field8': fields.customer_location.displayValue,
				'field9': fields.building_floor_workstation.displayValue,
				'field10': fields.lob.displayValue,
				'field11': fields.serial_number.displayValue,
				'field12': fields.asset_tag.displayValue,
				'field13': fields.model.displayValue,
				'field14': fields.old_serial_number.displayValue,
				'field15': fields.old_asset_tag.displayValue,
				'field16': fields.old_model.displayValue,
				'field17': fields.old_state.displayValue,
				'field18': fields.old_substate.displayValue,
				'field19': fields.software_needed.displayValue,
				'field20': fields.notification.displayValue,
				'selected': false
			};
		}
		function fetchValues() {
			var fieldsObj = {
				swap_date: {// variable name should be same as catalog item variable
					type: 'text',
					value: '',
					displayValue: ''
				},
				data_sample_needed: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				customer_type: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				project_number: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				deployment_type: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				request_type: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				customer_name: {
					type: 'reference',
					value: '',
					displayValue: ''
				},
				customer_location: {
					type: 'reference',
					value: '',
					displayValue: ''
				},
				building_floor_workstation: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				lob: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				serial_number: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				asset_tag: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				model: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				old_serial_number: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				old_asset_tag: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				old_model: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				old_state: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				old_substate: {
					type: 'option',
					value: '',
					displayValue: ''
				},
				software_needed: {
					type: 'text',
					value: '',
					displayValue: ''
				},
				notification: {
					type: 'checkbox',
					value: '',
					displayValue: ''
				}
			};
			var missingFields = [];
			//fetching values from g_form to field's object as a reusable component
			Object.keys(fieldsObj).forEach(function (key, i) {
				if (g_form.isVisible(g_form.getGlideUIElement(key), g_form.getControl(key))) { //visibility check
					if (g_form.isMandatory(key) && g_form.getValue(key) == '') {
						missingFields.push(key);
					} else {
						if (fieldsObj[key].type == "text") {
							fieldsObj[key].value = g_form.getValue(key);
							fieldsObj[key].displayValue = g_form.getValue(key);
						}
						if (fieldsObj[key].type == "option") {
							fieldsObj[key].value = g_form.getValue(key);
							fieldsObj[key].displayValue = g_form.getOption(key, g_form.getValue(key)).text;
						}
						if (fieldsObj[key].type == "reference") {
							fieldsObj[key].value = g_form.getValue(key);
							fieldsObj[key].displayValue = g_form.getDisplayBox(key).value;
						}
						if (fieldsObj[key].type == "checkbox") {
							fieldsObj[key].value = g_form.getValue(key);
							fieldsObj[key].displayValue = g_form.getBooleanValue(key) ? "Yes" : "No";
						}
					}
				}
			});
			if (missingFields.length == 0) {
				return fieldsObj;
			} else {
				// alert("Please complete the Mandatory fields: \n" + missingFields);
				g_form.getControl(missingFields[missingFields.length - 1]).focus();
				return false;
			}
		}
	});
})();