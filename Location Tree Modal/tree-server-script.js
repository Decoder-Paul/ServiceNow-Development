(function() {
	if(input.user_id){
		data.user_id = input.user_id;
	}
	function getNumberOfChild(parentId){
		var grAgg = new GlideAggregate('cmn_location');
		grAgg.addAggregate('COUNT');
		grAgg.addActiveQuery();
		grAgg.addQuery('parent', parentId);
		grAgg.query();
		if(grAgg.next())
			return grAgg.getAggregate('COUNT');
	}
	function getHeadLocations(){
		var locations = [];
		var gr = new GlideRecord('cmn_location');
		gr.addActiveQuery();
		gr.addEncodedQuery('parentISEMPTY');
		gr.orderBy('name');
		gr.query();
		while(gr.next()){
			locations.push({
				name: gr.getValue('name'),
				id: gr.getValue('sys_id'),
				children: null,
				toggle: false,
				caret: getNumberOfChild(gr.getValue('sys_id')),
				showSpinner: false
			});
		}
		return locations;
	}

	data.children = getHeadLocations();
	
	function getChildren(parentId){
		var children = [];
		var gr = new GlideRecord('cmn_location');
        gr.addActiveQuery();
        gr.addQuery('parent', parentId);
				gr.orderBy('name');
        gr.query();
		while (gr.next()) {
			children.push({
				name: gr.getValue('name'),
				id: gr.getValue('sys_id'),
				children: null,
				toggle: false,
				caret: getNumberOfChild(gr.getValue('sys_id')),
				showSpinner: false
			});
		}
		data.children = children;
	}
	
	if(input){
		if(input.action == 'updateUser'){
			var grUser = new GlideRecord('sys_user');
			grUser.get(input.user);
			grUser.setValue('location', input.location);
			grUser.update();
		}
		else if(input.action == 'getChildren'){
			getChildren(input.parentId);
		}
	}
})();
