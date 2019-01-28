function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == oldValue || newValue == 'false') {
 		return;
 	}
// 	if(!g_form.getBooleanValue('checkBox_agreement')){
// 		g_form.setValue('checkBox_agreement','true');
// 		g_form.setDisabled('checkBox_agreement',true);
// 	}
	console.log("NewValue: "+newValue);
	var answer = g_form.getValue('multi_agreement');
	var url = top.location.href;
	var parser = /service-now\.com\/jacobs/g;
	
//---------ServicePortal Modal Opener---------
	if(url.match(parser)){
		//var c=this;
		if(newValue=='true'){
			spModal.open({
				size: 'lg',
				title: 'Please read the terms & conditions till the end',
				message: answer,
				buttons: [
					{label:'✘ Don\'t agree' , cancel: true},
					{label:'✔ I Agree', primary: true}
				]
				 }).then(function() {
					 //c.val = true;
					//g_form.setValue('agreementCheckbox','true');
					g_form.setDisabled('checkBox_agreement',true);
					 g_form.addInfoMessage("You have agreed to the terms and conditions. Please click Submit to proceed");
				 }, function() {
					 //c.val = false;
					g_form.setValue('checkBox_agreement','false');
					alert('Please accept the terms and conditions to continue your order.');
			});
		}
		else{
			return;
		}
	}
//----------Native UI Modal Opener-----------
	else{
		if(newValue=='true'){
			var gm = new GlideModal('customModalPage',true);
			gm.setTitle('Please read the terms & conditions till the end');
			//gm.setPreference('sysparm_message',modVal);
			gm.setWidth(650);
			gm.render();
			try{
				gm.setBackdropStatic(true);
			}
			catch(e){
				console.log(e);
			}
		}
		else{
			return;
		}
	}
}