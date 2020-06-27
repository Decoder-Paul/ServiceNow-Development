function onClick() {
    var result = g_form.submit('sysverb_ws_save');
	alert(result);
	if (!result) { // failed form submission
		return;
	}
	result.then(function() {
		//g_aw.openRecord('sc_cat_item_guide', 'ee2e4769dbaa4b0029253220ad9619d7', params); 
		var params = {};
        //           var test=current.sys_id;
        params.sysparm_parent_table = "interaction";
        params.sysparm_parent_sys_id = g_form.getUniqueValue();
		params.sysparm_guide = "ee2e4769dbaa4b0029253220ad9619d7";
		params.sysparm_reqfor= g_form.getValue('opened_for');
		params.sysparm_number= g_form.getValue('number');
	
        var paramsJSON = JSON.stringify(params);
        var request = new GlideAjax('RequestLinkSessionManager');
        request.addParam('sysparm_name', 'setComponentSessionValueMapJSON');
        request.addParam('workspace_request_session_data', paramsJSON);
        request.getXMLAnswer(function(answer) {
			g_service_catalog.openCatalogItem('sc_cat_item', '-1', params);
        });
	});
}