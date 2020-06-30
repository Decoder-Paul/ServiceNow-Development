(function () {
	/* populate the 'data' object */
	/* e.g., data.table = $sp.getValue('table'); */
	var pl = $sp.getDisplayValue('url_suffix');

	options.hrcv = 'false';
	var us = new GlideRecord('sys_user');
	us.addQuery('sys_id', gs.getUserID());
	us.addQuery('u_legacy_company', 'CH2M');
	us.query();
	if (us.hasNext()) {
		options.hrcv = 'true';
	}
	/*if(pl=='hrsp')
		{
			options.hrcv = 'true';
		}*/
	options.value = 'false';
	if (gs.hasRole("itil")) {
		options.value = 'true';
	}

	var reqFilter;
	var incFilter;
	var prbFilter;
	var prbFilter1;
	var chnFilter;
	var chnFilter1;
	var reqFilter1;
	var incFilter1;
	var appFilter;
	var appFilter1;
	var watchFilter;
	var watchFilter1;
	//var hrcFilter;
	//var hrcFilter1;

	reqFilter = 'request.requested_for=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()^active=true^EQ';
	incFilter = "active=true^caller_id=javascript:gs.getUserID()^ORu_on_behalf_of=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()";
	reqFilter1 = 'request.requested_for=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()^stateIN3,4,7^EQ';
	incFilter1 = "active=false^caller_id=javascript:gs.getUserID()^ORu_on_behalf_of=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()";
	prbFilter = 'stateIN1,3,2,8^opened_by=javascript:gs.getUserID()^EQ';
	prbFilter1 = 'opened_by=javascript:gs.getUserID()^stateIN2,4^EQ'
	chnFilter = 'active=true^opened_by=javascript:gs.getUserID()^ORrequested_by=javascript:gs.getUserID()^EQ';
	chnFilter1 = 'active=false^opened_by=javascript:gs.getUserID()^ORrequested_by=javascript:gs.getUserID()^EQ';
	appFilter = 'stateINrequested,more_info_required^approver=javascript:gs.getUserID()^EQ';
	appFilter1 = 'stateINapproved,rejected,cancelled,not_required^approver=javascript:gs.getUserID()^EQ';
	watchFilter = 'active=true^sys_class_name=change_request^ORsys_class_name=incident^ORsys_class_name=sc_req_item^ORsys_class_name=problem^watch_listLIKEjavascript:gs.getUserID()^ORDERBYDESCsys_updated_on^EQ';
	watchFilter1 = 'active=false^sys_class_name=change_request^ORsys_class_name=incident^ORsys_class_name=sc_req_item^ORsys_class_name=problem^watch_listLIKEjavascript:gs.getUserID()^ORDERBYDESCsys_updated_on^EQ';
	//hrcFilter = 'active=true^opened_for=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()^stateNOT IN3,4,7,24';
	//hrcFilter1 = 'opened_for=javascript:gs.getUserID()^ORopened_by=javascript:gs.getUserID()^stateIN3,4,7,24';

	var opts = [
		{ table: "incident", filter: incFilter, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,priority,category,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "sc_req_item", filter: reqFilter, sp_page: 'form', list_page: 'list', fields: 'number,short_description,request.requested_for,stage,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "incident", filter: incFilter1, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,opened_by,opened_at', o: 'sys_updated_on', d: 'desc' },
		{ table: "sc_req_item", filter: reqFilter1, sp_page: 'form', list_page: 'list', fields: 'number,short_description,request.requested_for,stage,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "change_request", filter: chnFilter, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,requested_by,opened_at', o: 'sys_updated_on', d: 'desc' },
		{ table: "change_request", filter: chnFilter1, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,requested_by,opened_at', o: 'sys_updated_on', d: 'desc' },
		{ table: "problem", filter: prbFilter, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,opened_by,opened_at', o: 'sys_updated_on', d: 'desc' },
		{ table: "problem", filter: prbFilter1, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,opened_by,opened_at', o: 'sys_updated_on', d: 'desc' },
		{ table: "sysapproval_approver", filter: appFilter, sp_page: 'form', list_page: 'list', fields: 'sysapproval,document_id,approver,state,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "sysapproval_approver", filter: appFilter1, sp_page: 'form', list_page: 'list', fields: 'sysapproval,document_id,approver,state,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "task", filter: watchFilter, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,sys_updated_on,sys_created_on', o: 'sys_updated_on', d: 'desc' },
		{ table: "task", filter: watchFilter1, sp_page: 'form', list_page: 'list', fields: 'number,short_description,state,sys_updated_on,sys_created_on', o: 'sys_updated_on', d: 'desc' }
	];

	data.incData = $sp.getWidget('widget-data-table', opts[0]);
	data.reqData = $sp.getWidget('widget-data-table', opts[1]);
	data.incData1 = $sp.getWidget('widget-data-table', opts[2]);
	data.reqData1 = $sp.getWidget('widget-data-table', opts[3]);
	data.chnData = $sp.getWidget('widget-data-table', opts[4]);
	data.chnData1 = $sp.getWidget('widget-data-table', opts[5]);
	data.prbData = $sp.getWidget('widget-data-table', opts[6]);
	data.prbData1 = $sp.getWidget('widget-data-table', opts[7]);
	data.aprData = $sp.getWidget('widget-data-table', opts[8]);
	data.aprData1 = $sp.getWidget('widget-data-table', opts[9]);
	data.watchData = $sp.getWidget('widget-data-table', opts[10]);
	data.watchData1 = $sp.getWidget('widget-data-table', opts[11]);

})();