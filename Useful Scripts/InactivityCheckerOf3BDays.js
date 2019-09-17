/*
This Scheduled Job will check for the active Incidents on daily basis with the following conditions:

• Configuration Item is 'AutoPAP'
• Assignment Group is changed from "IT-L2-AAMS HSEQS Services" or "IT-L3-AAMS HSEQS Services"
• And not updated since last 3 business days excluding only weekends

It will send a reminder notification for those incidents to the respective Assignment group(last updated) with no activity for at least 3 business days.
*/

var gr = new GlideRecord('metric_instance');
gr.addEncodedQuery('definition=39d43745c0a808ae0062603b77018b90^field=assignment_group^table=incident^field_value=8d3a9b71db19470029253220ad961912^ORfield_value=b03a5b71db19470029253220ad9619ed');
//gr.addQuery('definition','39d43745c0a808ae0062603b77018b90');
gr.query();
var i=1;
while(gr.next()){
	if(gr.id.active==true){
		if(gr.id.cmdb_ci.getDisplayValue()=='AutoPAP'){
			
			if(gr.id.assignment_group!='8d3a9b71db19470029253220ad961912' && gr.id.assignment_group!='b03a5b71db19470029253220ad9619ed'){
				var gr2 = new GlideRecord('metric_instance');
				gr2.addEncodedQuery('definition=39d43745c0a808ae0062603b77018b90^field=assignment_group^table=incident^id='+gr.id+'^field_value='+gr.id.assignment_group);
				gr2.query();
				if(gr2.next()){
					gs.log(gr2.sys_created_on);
					
					var newGroupAssignmentDate = new GlideDateTime(gr2.sys_created_on);
					var lastTicketUpdate = new GlideDateTime(gr.id.sys_updated_on);
					//checking whether the new Assignment group assigned date is after the last update on the ticket
					if(newGroupAssignmentDate.after(lastTicketUpdate)){
						gs.log("1 Duration Passed: "+getDuration(newGroupAssignmentDate, new GlideDateTime()),'AutoPAP');
						if(getDuration(newGroupAssignmentDate, new GlideDateTime())>97200){
						   gs.eventQueue('incident.autopap.reminder',gr.id,gr.id.assignment_group);
						}
					}
					else{
						gs.log("2 Duration Passed: "+getDuration(newGroupAssignmentDate, new GlideDateTime()),'AutoPAP');
						if(getDuration(lastTicketUpdate,new GlideDateTime())>97200){
						   gs.eventQueue('incident.autopap.reminder',gr.id,gr.id.assignment_group);
						}
					}
				}
				gs.log(gr.id.assignment_group.getDisplayValue()+' | '+gr.id.sys_updated_on+' | '+gr.id.number+' | '+gr.id,'AutoPAP');
			}
		}
	}
}

function getDuration(start,end){
	var dc = new DurationCalculator();
	dc.setSchedule('08fcd0830a0a0b2600079f56b1adb9ae');
	var duration = dc.calcScheduleDuration(start,end);
	gs.log(duration,'calculator');
	return duration;
}