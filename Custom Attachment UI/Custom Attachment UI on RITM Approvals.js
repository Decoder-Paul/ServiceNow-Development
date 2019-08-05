function onCondition() {
//----------------Task Based variables---------------
	var table = g_form.getDisplayBox('sysapproval').value.slice(0,4);
	if(table=="RITM"){
		var ritm = g_form.getValue('sysapproval');
		var ga = new GlideAjax("AttachmentQuery");
		ga.addParam("sysparm_name", "getRitmAttachmentDetails");
		ga.addParam("sysparm_ritm_id", ritm);
		ga.getXML(function(response){
			var result = response.responseXML.getElementsByTagName("result");
			var count = result[0].getAttribute("number");
			var attachments = response.responseXML.getElementsByTagName("attachments");
			if(count>0){
				//----------------DOM Rendering----------------------
				var ul = document.createElement('ul');
				ul.id='ritm_attachment_ul';
				ul.style="display: block;max-height: 2em;overflow: hidden;padding: 0 0 0 0;margin: 0 15px 0 15px;";
				var markup = '<li class="manage_list" style="display: inline;line-height: 1.4em;"><a id="RITM_attachment_list_label" href="#" class="attachment">RITM Attachments ('+count+'):</a></li>&nbsp;';    
				for(var i=0;i<attachments.length;i++){
					var id = attachments[i].getAttribute("guid");
					var name = attachments[i].getAttribute("fileName");
					var icon = attachments[i].getAttribute("icon_link");
					markup += '<li class="attachment_list_items" style="display: inline;line-height: 1.4em;"><span id="attachment_'+id+'" style="margin-right: 5px;"><a href="sys_attachment.do?sys_id='+id+'" title="" style="margin-right:4px;"><img src="'+icon+'" alt=""></a><a href="sys_attachment.do?sys_id='+id+'" data-id="'+id+'" class="content_editable" style="display: inline; margin-right: 5px;">'+name+'</a></span></li>';

				}
				document.getElementById("header_attachment").appendChild(ul);
				ul.innerHTML = markup;
				showObject(document.getElementById('header_attachment_line'));
			}	
		});
	}
}