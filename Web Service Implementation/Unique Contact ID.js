function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == '') {
		g_form.setValue('NUR_FirstName','John');
		g_form.setValue('NUR_LastName','Simpson');
		return;
	}
	var firstName = g_form.getValue('NUR_FirstName');
	var lastName = g_form.getValue('NUR_LastName');
	var baseId;
	
	if(firstName.substr(0, 3).length==3){
		baseId = firstName.substr(0, 3)+lastName.substr(0, 3);
	}
	else if(firstName.substr(0, 3).length==2){
		baseId = firstName.substr(0, 2)+lastName.substr(0, 4);
	}
	else if(firstName.substr(0, 3).length==1){
		baseId = firstName.substr(0, 1)+lastName.substr(0, 5);
	}
	if(baseId.length<6){
		if(lastName.substr(0, 5).length==5){
			baseId = firstName.substr(0, 1)+lastName.substr(0, 5);
		}
		else if(lastName.substr(0, 4).length==4){
			baseId = firstName.substr(0, 2)+lastName.substr(0, 4);
		}
		else if(lastName.substr(0, 3).length==3){
			baseId = firstName.substr(0, 3)+lastName.substr(0, 3);
		}
		else if(lastName.substr(0, 3).length==2){
			baseId = firstName.substr(0, 4)+lastName.substr(0, 2);
		}
		else if(lastName.substr(0, 3).length==1){
			baseId = firstName.substr(0, 5)+lastName.substr(0, 1);
		}
	}
	
	baseId = baseId.toUpperCase();
	console.log("baseId: "+baseId);
	
	if(baseId.length<6){
		var padLen = 6-baseId.length;
		var contactId = baseId + '0'.repeat(padLen-1);
		if(baseId.length==5){
			contactId = baseId+'0';
		}
		console.log("Searching ID: "+contactId);
		var gr = new GlideRecord("u_prolog_contacts");
		gr.addQuery('u_contact_id','STARTSWITH',contactId);
		gr.orderBy('u_contact_id');
		gr.query();
		var mx = 1;
		while (gr.next()) {
			console.log("coming in 1st loop");
			if (!isNaN(parseInt(gr.u_contact_id.substr(-2)))) { //TYC0012
				if (mx < parseInt(gr.u_contact_id.substr(-2))) {
					mx = parseInt(gr.u_contact_id.substr(-2));
				}
			}
			else if (!isNaN(parseInt(gr.u_contact_id.substr(-1)))) { //TYC001
				if (mx < parseInt(gr.u_contact_id.substr(-1))) {
					mx = parseInt(gr.u_contact_id.substr(-1));
				}
			}
			console.log("mx: "+mx);
		}
		contactId = contactId + mx.toString();
		console.log("Contact Id: "+contactId);
	}
	else{
		var contactId;	
		contactId = baseId;
		var mx = -1;
		var suffix=0;

		var gr = new GlideRecord("u_prolog_contacts");
		gr.addQuery('u_contact_id','STARTSWITH',contactId);
		gr.orderBy('u_contact_id');
		gr.query();

		while (gr.next()) {
			console.log("coming in loop");
			if (gr.u_contact_id == contactId) {
				mx = 0;
			}
			else {
				if (!isNaN(parseInt(gr.u_contact_id.substr(-2)))) { //joshim01
					if (mx < parseInt(gr.u_contact_id.substr(-2))) {
						mx = parseInt(gr.u_contact_id.substr(-2));
					}
				}
				else if (!isNaN(parseInt(gr.u_contact_id.substr(-1)))) { //johsim1
					if (mx < parseInt(gr.u_contact_id.substr(-1))) {
						mx = parseInt(gr.u_contact_id.substr(-1));
					}
				}
				else { //JOHSIMM Exists
					if (mx < 1) {
						mx = -1;
					}
				}
			}
		}
		if (mx >= 0 && mx <= 9) {
			suffix = mx + 1;
			contactId = baseId + '0' + suffix.toString();
			console.log("contact id " + contactId);
		}
		else if (mx > 9) {
			suffix = mx + 1;
			contactId = baseId + suffix.toString();
			console.log("contact id else if is " + contactId);
		}
		else {
			console.log("contact id else is " + contactId);
		}
	}
}