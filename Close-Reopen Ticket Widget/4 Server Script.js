// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.actTask=false;
var gr = $sp.getRecord();
//c.data.table = gr.getDisplayValue('sys_class_name');
//data.filter = "sys_id="+gr.getValue('sys_id');
if(gr && gr.getValue('sys_class_name')=='sc_req_item'){
	console.log('ritm ticket');
	var ot = new GlideRecord('sc_task');
	ot.addQuery('request_item',gr.sys_id);
	ot.addActiveQuery();
	ot.query();
	if(ot.hasNext()){
		data.actTask=true;
	}
}

if (input && gr) {
	switch(input.actType) {
		case "close_inc":
			gr.incident_state = input.incident_state;
			gr.update();
			break;
		case "reopen_inc":
			gr.incident_state = input.incident_state;
			gr.comments = input.comments;
			gr.update();
			break;
		case "cancel_inc":
			if(gr.state!=6)
				{ 
					if (gr.assigned_to == ''){
					
						gr.state = input.incident_state;
			
				}
					else{
						gr.state = 7;
						gr.closed_by= gr.assigned_to;
						
					}
				 gr.comments = input.comments;
				 gr.update();
				}
			else
				{
					gs.addInfoMessage('The Incident can no longer be cancelled as the incident has been moved to resolved state');
				}
			break;
		case "cancel_ritm":
			//gr.stage = 'Request Cancelled';
			gr.state = input.state;
			gr.comments = input.comments;
			gr.update();
			break;
		
	}
}

var fields = $sp.getFields(gr, 'state,opened_by,incident_state,caller_id,active,stage');

if (gr) {
	data.fields = fields;
	data.state = gr.state.toString();
	data.opened_by = gr.opened_by.toString();
	data.incident_state = gr.incident_state.toString();
	data.caller_id = gr.caller_id.toString();
	data.sys_id = gr.getUniqueValue();
	data.table = gr.getTableName();
	data.loggedin_user = gs.getUserID();
	data.active = gr.active.toString();
	data.stage = gr.stage.toString();
	data.comments = "";
}
