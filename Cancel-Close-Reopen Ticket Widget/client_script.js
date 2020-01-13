function ($window, $uibModal, $scope, spUtil) {

	$scope.$on('record.updated', function (name, data) {
		spUtil.refresh($scope);
	});
	var c = this;
	c.action = function (actType) {
		switch (actType) {
			case "close_inc":
				c.data.incident_state = '7';
				break;
			case "reopen_inc":
				c.modalInstance = $uibModal.open({
					templateUrl: 'modalIncRe',
					scope: $scope
				});
				break;
			case "cancel_inc":
				c.modalInstance = $uibModal.open({
					templateUrl: 'modalIncCan',
					scope: $scope
				});
				break;
			case "cancel_ritm":
				c.modalInstance = $uibModal.open({
					templateUrl: 'modalRitmCan',
					scope: $scope
				});
				break;

		}
		c.data.actType = actType;
		c.server.update();
	}

	c.openInc = function () {
		c.data.comments = c.data.comments;
		c.data.incident_state = '2';
		c.data.actType = "reopen_inc";
		c.server.update();
		c.modalInstance.close();
	}

	c.cancInc = function () {
		c.data.comments = c.data.comments;
		c.data.incident_state = '8';
		c.data.actType = "cancel_inc";
		//$window.alert('test alert');
		c.server.update();
		c.modalInstance.close();
	}

	c.cancRitm = function () {
		c.data.comments = c.data.comments;
		c.data.state = '4';
		c.data.actType = "cancel_ritm";
		c.data.stage = "Request Cancelled";
		c.server.update();
		c.modalInstance.close();
	}

	c.closeModal = function () {
		c.modalInstance.close();
	}
}