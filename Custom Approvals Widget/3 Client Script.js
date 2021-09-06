function ($scope, spUtil, spUIActionsExecuter, $window, $uibModal) {
	var ESIGNATURE = {
		TYPE: "form",
		APPROVE_SYS: "cbfe291147220100ba13a5554ee4904d",
		REJECT_SYS: "580f711147220100ba13a5554ee4904b"
	};
	var c = this;
	
	if ($scope.options.portal == true || $scope.options.portal == 'true') {
		$scope.contentColClass = "col-xs-12";
		$scope.options.portal = true;
	} else {
		$scope.options.portal = false;
		$scope.contentColClass = "col-sm-8";
	}
	
	$scope.data.op = "";
	spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^approverIN" + $scope.data.myApprovals.toString(), function (data) {
		// don't double-roundtrip if update came from record just approved/rejected
		if (data.data.sys_id != $scope.data.target)
			spUtil.update($scope);
	});

	function get() {
		spUtil.update($scope);
		$scope.selectedAll = false;
	}
	//checked ALL logic
	$scope.checkAll = function(){
		var checkStatus = $scope.selectedAll;
		angular.forEach($scope.data.approvals, function (item) {
			item.checkbox = checkStatus;
		});
	}
	$scope.updateSelectedAll = function() {
		allCheckedFlag = true;
		$scope.data.approvals.forEach(function(item){
			if(typeof(item.checkbox)=='undefined' || item.checkbox == false){
				allCheckedFlag = false;
			}
		});
		$scope.selectedAll = allCheckedFlag;
	}
	//logic of checked task approve
	function getCheckedList(){
		var list =[];
		angular.forEach($scope.data.approvals, function(item){
			console.log("cb: "+item.checkbox+" id: "+item.sys_id+" esig: "+item.requireEsigApproval);
			if(item.checkbox){
				list.push(item.sys_id);
			}
		});
		return list;
	}
	// $scope.approveOnlyChecked = function(){
	// 	// Process Multiple Approval
	// 	$scope.data.op = "multi_approved";
	// 	$scope.data.target_list = getCheckedList();
	// 	get(); //making server call
	// }
	$scope.approveOnlyChecked = function(){
		var list = getCheckedList();
		if(list.length > 0){
			c.server.get({
				action: "approveOnlyChecked",
				target_list: list,
			}).then(function(response){
				//Process your response
				spUtil.addInfoMessage("Selected tasks are " + response.data.status);
				$scope.selectedAll = false;
			});
		}else{
			spUtil.addErrorMessage("Select individual task checkbox to approve or reject");
		}
	}
	$scope.rejectOnlyChecked = function(list, comment) {
		if(list.length > 0){
			c.server.get({
				action: "rejectOnlyChecked",
				target_list: list,
				comment: comment
			}).then(function(response){
				spUtil.addInfoMessage("Selected tasks are " + response.data.status);
				$scope.selectedAll = false;
			});
			c.closeModal();
		}else{
			spUtil.addErrorMessage("Select individual task checkbox to approve or reject");
		}
	}

	$scope.approve = function (id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};
		if ($scope.data.esignature.e_sig_required && esigRequired) {
			spUIActionsExecuter.executeFormAction(ESIGNATURE.APPROVE_SYS, "sysapproval_approver", id, [], "", requestParams).then(function (response) {
			});
		} else {
			$scope.data.op = "approved";
			$scope.data.target = id;
			get();
		}
	}

	$scope.reject = function (id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};

		if ($scope.data.esignature.e_sig_required && esigRequired) {
			spUIActionsExecuter.executeFormAction(ESIGNATURE.REJECT_SYS, "sysapproval_approver", id, [], "", requestParams).then(function (response) {
			});
		} else {
			$scope.data.op = "rejected";
			$scope.data.target = id;
			$scope.data.comments = c.comments;
			get();
		}
		c.closeModal();
	}

	// pagination
	$scope.previousPage = function () {
		$scope.selectedAll = false;
		if ($scope.data.pagination.currentPage > 1)
			$scope.data.pagination.currentPage = $scope.data.pagination.currentPage - 1;
		else
			$scope.data.pagination.currentPage = 0;

		get();
	}

	$scope.nextPage = function () {
		$scope.selectedAll = false;
		$scope.data.pagination.currentPage = $scope.data.pagination.currentPage + 1;
		get();
	}

	$scope.getItemDisplay = function (task) {
		if (task.number && task.short_description)
			return task.number + " - " + task.short_description;

		return task.number || task.short_description || "";
	}

	c.openRejModal = function (id, esigRequired) {
		c.comments = '';
		c.temp_id = id;
		c.temp_esig_req = esigRequired;
		c.modalInstance = $uibModal.open({
			templateUrl: 'modalRejApp',
			scope: $scope
		});
	}
	$scope.openMultiRejModal = function () {
		c.comments = '';
		c.list = getCheckedList();
		c.modalInstance = $uibModal.open({
			templateUrl: 'modalMultiRejectApp',
			scope: $scope
		});

	}
	c.closeModal = function () {
		c.modalInstance.close();
	}
	
	$scope.toggleFilter = function(){
		this.toggle = !this.toggle;
		if(this.toggle)
			this.detailsText = "Expand for more details";
		else
			this.detailsText = "Collapse more details";
	}
}