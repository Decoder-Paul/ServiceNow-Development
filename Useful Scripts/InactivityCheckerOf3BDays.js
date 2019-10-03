/*
This Scheduled Job will check for the active Incidents on daily basis with the following conditions:

• Configuration Item is 'AutoPAP'
• Assignment Group is changed from "IT-L2-AAMS HSEQS Services" or "IT-L3-AAMS HSEQS Services"
• And not updated since last 3 business days excluding only weekends

It will send a reminder notification for those incidents to the respective Assignment group(last updated) with no activity for at least 3 business days.
*/
var gr = new GlideAggregate('metric_instance');
gr.addAggregate('count(distinct','id');
gr.addEncodedQuery('definition=39d43745c0a808ae0062603b77018b90^field=assignment_group^table=incident^field_value=8d3a9b71db19470029253220ad961912^ORfield_value=b03a5b71db19470029253220ad9619ed');
gr.groupBy('id');
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
					var rec = new GlideRecord('incident');
					rec.get(gr.id);
					var link = gs.getProperty('glide.servlet.uri');//incedent link to pass on to notification
					
					var newGroupAssignmentDate = new GlideDateTime(gr2.sys_created_on);
					var lastTicketUpdate = new GlideDateTime(gr.id.sys_updated_on);
					
// 					var duration = getDuration(newGroupAssignmentDate, new GlideDateTime());
// 					var hours = Math.floor(duration / 3600);
// 					var minutes = Math.floor((duration % 3600) / 60);
// 					var seconds = (duration % 3600) % 60;
// 					var timeElapsed = hours+' Hours '+minutes+' Minutes';
					
					//checking whether the new Assignment group assigned date is after the last update on the ticket
					if(newGroupAssignmentDate.after(lastTicketUpdate)){
						if(getDuration(newGroupAssignmentDate, new GlideDateTime()) > 97200){
							if(gr.id.assigned_to==''){
								//gs.log("Null Assigened To: "+gr.id.assigned_to,'autoPap');
								gs.eventQueue('incident.autopap.reminder', rec, gr.id.assignment_group, link);
							}
							else{
								//gs.log("Assigened To: "+gr.id.assigned_to,'autoPap');
								gs.eventQueue('incident.autopap.reminder', rec, gr.id.assigned_to, link);
							}
						}
					}
					else{
						if(getDuration(lastTicketUpdate,new GlideDateTime()) > 97200){
							if(gr.id.assigned_to==''){
								//gs.log("Null Assigened To: "+gr.id.assigned_to,'autoPap');
								gs.eventQueue('incident.autopap.reminder', rec, gr.id.assignment_group, link);
							}
							else{
								//gs.log("Assigened To: "+gr.id.assigned_to,'autoPap');
								gs.eventQueue('incident.autopap.reminder', rec, gr.id.assigned_to, link);
							}
						}
					}
				}
				//gs.log(gr.id.assignment_group.getDisplayValue()+' | '+gr.id.sys_updated_on+' | '+gr.id.number+' | '+gr.id,'AutoNEW');
			}
		}
	}
}

function getDuration(start,end){
	var dc = new DurationCalculator();
	dc.setSchedule('08fcd0830a0a0b2600079f56b1adb9ae');
	var duration = dc.calcScheduleDuration(start,end);
	//gs.log(duration,'calculator');
	return duration;
}