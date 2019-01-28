function promptMessage(param,id) {
	//this function is used in ui policy for grid manipulation on Performance Request item.
	var punit = prompt("Please enter the PU no.", "");
	if (punit != "" && punit!=null){
		alert("You have entered: " + punit);
		param.innerHTML = punit;
		var data = JSON.parse(g_form.getValue('json_data'));
		data[parseInt(id)].field3 = punit;
		g_form.setValue('json_data', JSON.stringify(data));
		g_form.save();
	}
	else {
		alert("You did not specify PU No.");
	}
}