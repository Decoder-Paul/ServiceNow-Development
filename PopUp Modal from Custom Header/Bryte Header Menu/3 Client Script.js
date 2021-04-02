function ($scope, spUtil, $rootScope, $timeout, spAriaUtil, spGtd, $window, spModal) {
	var c = this;
	$scope.collapse = function() {
		$rootScope.$emit('sp-navbar-collapse');
	}
	$scope.loadingIndicator = $rootScope.loadingIndicator;
	$scope.cartItemCount = 0;
	$scope.wishlistItemCount = 0;
	$scope.itemAddedTooltipOpen = false;
	$scope.accessibilityEnabled = spAriaUtil.g_accessibility === "true";
	$scope.$on("$sp.service_catalog.cart.count", function($evt, count) {
		$scope.cartItemCount = count;
	});
	$scope.$on("$sp.service_catalog.wishlist.count", function($evt, count) {
		$scope.wishlistItemCount = count;
	});
	var cancelTooltipPromise;
	$scope.$on("$sp.service_catalog.cart.add_item", function() {
		$timeout.cancel(cancelTooltipPromise);
		$scope.itemAddedTooltipOpen = true;
		cancelTooltipPromise = $timeout(function() {
			$scope.itemAddedTooltipOpen = false;
		}, 3000);
	});
	$scope.$on('sp_loading_indicator', function(e, value) {
		$scope.loadingIndicator = value;
	});
	$scope.toggleCart = function() {
		$timeout.cancel(cancelTooltipPromise);
		$scope.itemAddedTooltipOpen = false;
		$timeout(function() {
			$("#cart-dropdown").dropdown("toggle");
		});
	};
	// PRB1108244: visibleItems array is used to improve keyboard nav
	// in menu, refresh it as needed
	$scope.$watch('data.menu.items', function() {
		$scope.visibleItems = [];
		if ($scope.data.menu.items) {
			for (var i in $scope.data.menu.items) {
				var item = $scope.data.menu.items[i];
				if (item.items || (item.scriptedItems && item.scriptedItems.count != 0))
					$scope.visibleItems.push(item);
			}
		}
	}, true);
  $scope.$on('sp-menu-update-tours', function(event, tours) {
    $scope.data.showTours = $scope.data.showTours && !spUtil.isMobile();
    if ($scope.data.showTours === false) {
		$scope.data.guidedTours = null;
		return;
	};
    var guidedToursLabel = 'Guided Tours';
    $scope.data.guidedTours = {
		label: guidedToursLabel,
		collection: []
	};
    if (tours.length > 0) {
      $scope.data.guidedTours.collection = tours.map(function(t) {
        return {
          title:  t.name,
          id: t.id,
          clicked: function() {
            spGtd.launch(t.id);
          }
        };
      });
    }
  });
	
	c.onWidget = function(widgetId, widgetInput) {
		spModal.open({
				size: 'lg',
				title: 'Assigned Assets',
				widget: widgetId,
				buttons: [{label:'${Close}', cancel: true}],
			//{ "table": 'alm_hardware', "title":'Assigned Assets', "color":'#FF0000', "hide_footer":'true', "filter": 'assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe', "sp_page": 'form', "list_page": 'list', "fields": 'asset_tag,serial_number,model,install_status,location', "o": 'sys_updated_on', "d": 'desc' }
		}).then(function(){
            console.log('widget dismissed');
        });
	}

	// Get list of record watchers
	var record_watchers = [];
	if ($scope.data.menu.items) {
		for(var i in $scope.data.menu.items) {
			var item = $scope.data.menu.items[i];
			if (item.type == 'scripted') {
				if (item.scriptedItems.record_watchers)
					record_watchers = record_watchers.concat(item.scriptedItems.record_watchers);
			}
			if (item.type == 'filtered') {
				record_watchers.push({'table':item.table,'filter':item.filter});
			}
		}
	}
	// Init record watchers
	for (var y in record_watchers){
		var watcher = record_watchers[y];
		spUtil.recordWatch($scope, watcher.table, watcher.filter);
	}
  $rootScope.$broadcast('sp-header-loaded');
}