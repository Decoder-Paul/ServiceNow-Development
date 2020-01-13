var ritm = new GlideRecord('sc_req_item');
//ritm.addEncodedQuery("cat_item=9e8ae80fdb6fd34029253220ad96196a^sys_created_onBETWEENjavascript:gs.dateGenerate('2019-12-12','00:00:00')@javascript:gs.dateGenerate('2019-12-16','15:00:00')^approval=approved");
ritm.addQuery('sys_id','4c9f80c5db3944143bcd6bba4b961957');
ritm.query();
//while(ritm.next()){
ritm.next();
	var approval = new GlideRecord('sysapproval_approver');
	approval.addQuery('sysapproval',ritm.sys_id);
	approval.addQuery('state','approved');
	approval.orderBy('created');
	approval.query();
	approval.next();
	var approver = approval.approver;
	
	var sd = ritm.variables.card_requested1.getDisplayValue()+" Application for " +ritm.request.requested_for.getDisplayValue();
	gs.log(sd);

	var task = new GlideRecord("sc_task");
	task.initialize();
	task.setValue('approval','Not Required');
	task.setValue('state','1');
	task.setValue('request_item.contact_type','self-service');
	task.setValue('assignment_group','777eeec0db1d23c021544b8b0b961970');
	task.setValue('priority','4');
	task.setValue('request_item.cat_item','9e8ae80fdb6fd34029253220ad96196a');
	task.setValue('request_item.request.requested_for.u_legacy_company', ritm.request.requested_for);
	task.setValue('request_item.request.requested_for', ritm.request.requested_for);
	task.setValue('short_description', sd);
	task.setValue('location', ritm.request.location);
	task.setValue('active','true');
	task.setValue('opened_by', approver);
	
	task.setValue('request_item', ritm.sys_id);
	task.insert();
//}