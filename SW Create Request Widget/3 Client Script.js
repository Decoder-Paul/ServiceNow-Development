function ($scope, spUtil) {
	var c = this;
	$scope.userDisable = false;
	$scope.submitDisable = true;
	$scope.itemDisable = true;

	$scope.userName = {
		displayValue: c.data.user_name,
		value: c.data.user_id,
		name: 'userName'
	};
	$scope.category_sel = {
		displayValue: c.data.category_title,
		value: c.data.category_sys_id,
		name: 'category_sel'
	};
	$scope.cat_item_sel = {
		displayValue: c.data.cat_item_name,
		value: c.data.cat_item_sys_id,
		name: 'cat_item_sel'
	};

	if ($scope.userName.value)
		$scope.userDisable = true;

	$scope.$on("field.change", function (evt, parms) {
		c.data.field_change = null;
		if (parms.field.name == 'userName') {
			c.data.user = parms.newValue;
			// var obj = {
			// 	user: parms.newValue
			// };
			$scope.category_sel.value = '';
			$scope.category_sel.displayValue = '';
			$scope.cat_item_sel.value = '';
			$scope.cat_item_sel.displayValue = '';
			$scope.submitDisable = true;
			c.server.update().then(function (response) {
				// spUtil.addInfoMessage(c.data.categoryQuery);
			});
		}
		else if (parms.field.name == 'category_sel') {
			c.data.field_change = "category_sel";
			$scope.cat_item_sel.value = '';
			$scope.cat_item_sel.displayValue = '';
			c.data.category_sys_id = parms.newValue;
			if(parms.newValue){
				$scope.itemDisable = false;
				// $scope.submitDisable = false;
			}else{
				$scope.itemDisable = true;
				$scope.submitDisable = true;
			}
			c.server.update().then(function (response) {
				// spUtil.addErrorMessage(c.data.catItemQuery);
			});
		}
		else if (parms.field.name == 'cat_item_sel') {
			c.data.cat_item_sys_id = parms.newValue;
			parms.newValue ? $scope.submitDisable = false : $scope.submitDisable = true;
		}
	});
	$scope.openItem = function () {
		window.location.assign("https://trianzjacobsdev.service-now.com/swp?id=sw_sc_cat_item_custom&sys_id=" + c.data.cat_item_sys_id);
	}
}