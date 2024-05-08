api.controller=function($scope, spUtil) {
  /* widget controller */
  var c = this;
	console.log($scope);
	c.selectedLocation = null;
  c.filterQuery = '';
	c.listItems = [];
	c.getSelectedElementList = function(list, element) {
      var result;
      for (var i in list) {
        if (list[i].name.toLowerCase().indexOf(element) > -1) {
          return list[i];
        } else {
          if (list[i].children && list[i].children.length) {
            result = this.getSelectedElementList(list[i].children, element);
            if (typeof result !== 'undefined') {
              return result;
            }
          }
        }
      }
      return result;
    };
	c.preFilter = function(data) {
      var path = [];
		angular.forEach(data, function(item, key) {
			if (!c.filterQuery.length || item.name.toLowerCase().indexOf(c.filterQuery.toLowerCase()) > -1) {
				path.push(item);
			} else if (angular.isArray(item.children)) {
				var children = c.preFilter(item.children);
				if (children.length) {
					path.push(item);
				}
			} else {
				var parentList = c.getSelectedElementList(c.listItems, c.filterQuery.toLowerCase());
				if (typeof parentList !== 'undefined' && parentList.children && parentList.children.length &&
						typeof c.getSelectedElementList(parentList.children, item.name.toLowerCase()) !== 'undefined') {
					path.push(item);
				}
			}
    });
		return path;
	};
	c.selectedID = function(id, name){
		c.selectedLocation = {
			id: id,
			name: name
		};
	};
	
	c.getChildren = function(item){
		if(item.children == null){
			item.showSpinner = true;
			c.server.get({action: 'getChildren', parentId: item.id}).then(function(response){
				item.showSpinner = false;
				item.children = response.data.children;
				item.toggle = !item.toggle;
			});
		}else{
			item.toggle = !item.toggle;
		}
	};
	
	c.send = function(){
		if(c.selectedLocation){
			c.server.get({action: 'updateLocation', location: c.selectedLocation.id, deviceId: c.data.deviceId}).then(function(resp){
				spUtil.addTrivialMessage('update successful');
				c.selectedLocation = null;
				// spUtil.refresh($scope); //reset all toggle
				$scope.$parent.$dismiss();
			});
		}
	};
};
