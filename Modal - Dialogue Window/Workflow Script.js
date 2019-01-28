var ritm_sysid =current.sys_id;
//gs.log(current.number+" ritm_sysid: "+ritm_sysid);
if(current.variables.dob){
	var gr = new GlideRecord('sc_item_option_mtom');
	gr.addEncodedQuery('request_item.sys_id='+ritm_sysid+'^sc_item_option.item_option_new.question_textSTARTSWITHdate of birth');
	gr.query();
	if (gr.next()){
		//gs.log(current.number+" Dob: "+gr.sc_item_option.value);
			var gr2 = new GlideRecord('u_credit_card_data');
			gr2.initialize(); 
			gr2.u_ritm = ritm_sysid; 
			gr2.u_date_of_birth = gr.sc_item_option.value; 
			gr2.insert();
		gr.deleteRecord();
	}
	var grdob =new GlideRecord('sc_item_option');
	grdob.addEncodedQuery('item_option_new.question_textSTARTSWITHdate of birth');
	grdob.query();
	grdob.next();
	grdob.deleteMultiple();
}
if(current.variables.social_no){
	var gr = new GlideRecord('sc_item_option_mtom');
	gr.addEncodedQuery('request_item.sys_id='+ritm_sysid+'^sc_item_option.item_option_new.question_textSTARTSWITHSocial Security #');
	gr.query();
	if (gr.next()){
		//gs.log(current.number+" SSN: "+gr.sc_item_option.value);
			var gr2 = new GlideRecord('u_credit_card_data');
			gr2.initialize(); 
			gr2.u_ritm = ritm_sysid; 
			gr2.u_ssn = gr.sc_item_option.value; 
			gr2.insert();
		gr.deleteRecord();
	}
	var grssn =new GlideRecord('sc_item_option');
	grssn.addEncodedQuery('item_option_new.question_textSTARTSWITHSocial Security #');
	grssn.query();
	grssn.next();
	grssn.deleteMultiple();
}
//Attaching Latest Agreement from KB articles based on the HR Country
var gr=new GlideRecord('kb_knowledge');
	var queryString = current.variables.hr_country+" Cardholder";
	gr.addQuery('short_description','STARTSWITH',queryString);
	gr.addQuery('workflow_state','published');
	gr.addQuery('latest',true);
	gr.query();
	if(gr.next()){
		GlideSysAttachment.copy('kb_knowledge', gr.sys_id,'sc_req_item', current.sys_id);
	}