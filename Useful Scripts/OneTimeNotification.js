/*
It will send one time Notification Email to all Active ITIL users in a batch of 100 for PROD Upgrade Maintenance 
*/
var count = new GlideAggregate('sys_user');
count.addEncodedQuery('roles=ITIL^active=true');
count.addAggregate('COUNT');
count.query();
var totalEmails = 0;
if (count.next())
	totalEmails = count.getAggregate('COUNT');

gs.log("Total emails: "+totalEmails);

var totalBatches = Math.ceil(totalEmails/100);
gs.log("Total Batches: "+totalBatches);

var mailList =[];

var gr = new GlideRecord("sys_user");
gr.addEncodedQuery('roles=itil^active=true');
gr.query();
gs.log(gr.getRowCount());
while(gr.next()) {
	if(gr.email.toString()!=''){
		mailList.push(gr.email.toString());
	}
}

var wholeBatch = [],j=1;
for(var i=0;i<mailList.length;i++){
	if(i%100!=0){
		singleBatch.push(mailList[i]);
	}
	else{
		if(i!=0){
			wholeBatch.push(singleBatch);
			gs.log(j++, singleBatch.length);
			gs.log(singleBatch);
			gs.eventQueue("one.time.notification", current,singleBatch);
		}
		var singleBatch=[];
		singleBatch.push(mailList[i]);
	}
}
gs.log(j++, singleBatch.length);
gs.log(singleBatch);
gs.eventQueue("one.time.notification", current,singleBatch);