api.controller = function($uibModal, $scope, spUtil) {
    /* widget controller */
    var c = this;
	var MODAL_TEMPLATE = '<div class="modal-content">'+
		'<div class="modal-header">' +
    '    <span class="h3 inline modal-title">{{ctrl.params.title}}</span>' +
    '    <button type="button" class="close" data-dismiss="modal" aria-label="Close" ng-click="ctrl.dismiss()">' +
    '		<span aria-hidden="true">&times;</span>' +
    '    </button>'+
    '	</div>' +
    '	<div class="modal-body">'+
			'<div class="alert alert-info" ng-if="ctrl.params.showLoader">'+
				'<fa name="spinner" spin="true"></fa> ${Loading data}...</div>'+
    '		<sp-widget widget="ctrl.params.widget"></sp-widget>'+
    '	</div>'+
	'</div>';

	c.openLocationTree = function(_params){
		var params = $.extend({
			widget: null,
			userId: c.data.userId,
      showLoader: true
		},_params);
		$uibModal.open({
			animation: true,
			size: 'lg',
			template: MODAL_TEMPLATE,
			controller: treeModalController, // a controller for modal instance
			controllerAs: 'ctrl',
			keyboard: false, // ESC key close enable/disable
			backdrop: 'static',
			resolve: {
				params: function() {
					return params;
				}
			}
		});
	};
	function treeModalController($scope, params){
		var ctrl = this;
		ctrl.params = params;
		//on modal open widget load
		spUtil.get("location-tree", {user_id: ctrl.params.userId}).then(function(response){
			ctrl.params.showLoader = false;
      ctrl.params.widget = response;      
		});
		ctrl.dismiss = function(){
			$scope.$dismiss();
		};
		ctrl.close = function(data){
			$scope.$close(data);
		};
	}
};
