var RequestLinkSessionManager = Class.create();
RequestLinkSessionManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  setComponentSessionValueMapJSON: function(session_data) {
        session_data = session_data || this.getParameter("workspace_request_session_data");

        gs.getSession().putClientData('workspace_request_session_data', session_data); //set session data from UI action

        return session_data;
    },

    getComponentSessionValueMapJSON: function() {
        var session_data = gs.getSession().getClientData("workspace_request_session_data"); //get the session data
        var parsed_session_data = global.JSON.parse(session_data);

//         var tableName = parsed_session_data.sysparm_parent_table; //table name which we gave in the UI action
//         var sysId = parsed_session_data.sysparm_parent_sys_id; //record sys id from UI action
		var reqfor =parsed_session_data.sysparm_reqfor;
		var number = parsed_session_data.sysparm_number;
	
        var obj = {}; //store the details to pass it the SR
			obj.opened=reqfor;
			obj.number=number;
        var data = JSON.stringify(obj);
        return data; //passing record details
    },
    type: 'RequestLinkSessionManager'
});
