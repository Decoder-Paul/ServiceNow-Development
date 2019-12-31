/*Requirement Source: RITM1484960 && RITM1603545
This Scheduled Job will check for the active Incidents on daily basis with the following conditions:

• Configuration Item is 'AutoPAP'
• Assignment Group is changed from "IT-L2-AAMS GBS" or "IT-L3-AAMS GBS"
• And not updated since last 3 business days excluding only weekends

It will send a reminder notification for those incidents to the respective Assignment group(last updated) with no activity for at least 3 business days.
*/

var gr = new GlideAggregate('metric_instance');
gr.addAggregate('count(distinct','id');
gr.addEncodedQuery('definition=39d43745c0a808ae0062603b77018b90^field=assignment_group^table=incident^field_value=54e22e8fdbdd8c54fbd73ebf9d961940^ORfield_value=04c2dc2edb558814fbd73ebf9d961986');
gr.groupBy('id');
gr.query();
var i=1;
while(gr.next()){
	if(gr.id.state == 2 || gr.id.state == 3){ // In Progress or On Hold
		if(gr.id.cmdb_ci == '10b1c9480f92b940dcc800dce1050ec0'){ //AutoPAP CI
			if(gr.id.assignment_group != '54e22e8fdbdd8c54fbd73ebf9d961940' && gr.id.assignment_group != '04c2dc2edb558814fbd73ebf9d961986'){

				var gr2 = new GlideRecord('metric_instance');
				gr2.addEncodedQuery('definition=39d43745c0a808ae0062603b77018b90^field=assignment_group^table=incident^id=' + gr.id + '^field_value=' + gr.id.assignment_group);
				gr2.query();
				if(gr2.next()){					
					var newGroupAssignmentDate = new GlideDateTime(gr2.sys_created_on);
					var lastTicketUpdate = new GlideDateTime(gr.id.sys_updated_on);

					//checking whether the new Assignment group assigned date is after the last update on the ticket
					if(newGroupAssignmentDate.after(lastTicketUpdate)){
						if(getDuration(newGroupAssignmentDate, new GlideDateTime()) > 97200){
							var lastReminderAfter = lastReminderSent(gr.id);
							gs.log("after|" + gr.id + "|" + lastReminderAfter + "|" + getDuration(lastReminderAfter, new GlideDateTime()),'AutoPap2');
							if(lastReminderAfter == null){  //first time reminder
								notify(gr);
							}
							else if(getDuration(lastReminderAfter, new GlideDateTime()) > 97200){ //last reminder sent 3days ago
								notify(gr);
							}
						}
					}
					else{
						if(getDuration(lastTicketUpdate, new GlideDateTime()) > 97200){
							var lastReminder = lastReminderSent(gr.id);
							gs.log("before|"+gr.id + "|" + lastReminder + "|" + getDuration(lastReminder, new GlideDateTime()),'AutoPap2');
							
							if(lastReminder == null){  //first time reminder
								notify(gr);
							}
							else if(getDuration(lastReminder, new GlideDateTime()) > 97200){ //last reminder sent 3days ago
								notify(gr);
							}
						}
					}
				}
				//gs.log(gr.id.assignment_group.getDisplayValue()+' | '+gr.id.sys_updated_on+' | '+gr.id.number+' | '+gr.id,'AutoNEW');
			}
		}
	}
}

function getDuration(start, end){
	var dc = new DurationCalculator();
	dc.setSchedule('08fcd0830a0a0b2600079f56b1adb9ae');
	var duration = dc.calcScheduleDuration(start,end);
	//gs.log(duration,'calculator');
	return duration;
}
function lastReminderSent(id){
	var gr = new GlideRecord('sys_email');
	gr.addEncodedQuery('instance=' + id + '^subjectSTARTSWITHInactivity Reminder');
	gr.orderByDesc('sys_created_on');
	gr.query();
	if(gr.next()){
		return new GlideDateTime(gr.sys_created_on);
	}
	else{
		return null;
	}
}
function notify(gr){
	var rec = new GlideRecord('incident');
	rec.get(gr.id);
	var link = gs.getProperty('glide.servlet.uri');//incedent link to pass on to notification
	if(gr.id.assigned_to){
		//gs.log("Assigened To: "+gr.id.assigned_to,'autoPap');
		gs.eventQueue('incident.autopap.reminder', rec, gr.id.assigned_to, link);
	}
	else{
		//gs.log("Null Assigened To: "+gr.id.assigned_to,'autoPap');
		gs.eventQueue('incident.autopap.reminder', rec, gr.id.assignment_group, link);
	}
	// 					var duration = getDuration(newGroupAssignmentDate, new GlideDateTime());
	// 					var hours = Math.floor(duration / 3600);
	// 					var minutes = Math.floor((duration % 3600) / 60);
	// 					var seconds = (duration % 3600) % 60;
	// 					var timeElapsed = hours+' Hours '+minutes+' Minutes';
}