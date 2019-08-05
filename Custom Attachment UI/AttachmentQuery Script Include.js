var AttachmentQuery = Class.create();
AttachmentQuery.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getRitmAttachmentDetails: function(){
		//var table = this.getParameter('sysparm_table_name');
		var id = this.getParameter('sysparm_ritm_id');
		
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name','sc_req_item');
		gr.addQuery('table_sys_id',id);
		gr.query();
		
		var count = gr.getRowCount();
		var c = this.newItem("result");
		c.setAttribute("number",count);
		
		if(count>0){
			while(gr.next()){
				var guid = gr.sys_id;
				var name = gr.file_name;
				var type = gr.content_type?gr.content_type:name.slice(name.lastIndexOf("."));
				
				var gr_icon = new GlideRecord('sys_attachment_icon_rule');
				gr_icon.get('file_format_indicator',type);

				var icon = gr_icon.icon?gr_icon.icon:"images/icons/attach_document.gifx";
				
				this._addDetails(guid,name,icon);
			}
		}
	},
	getApprovalAttachmentDetails: function(){
		//var table = this.getParameter('sysparm_table_name');
		var id = this.getParameter('sysparm_ritm_id');
		
		var gr = new GlideRecord('sysapproval_approver');
		gr.addQuery('sysapproval',id);
		gr.addQuery('state','approved');
		gr.query();
		var count =0;
		while (gr.next()){
			var gr_atm = new GlideRecord('sys_attachment');
			gr_atm.addQuery('table_name','sysapproval_approver');
			gr_atm.addQuery('table_sys_id',gr.sys_id);
			gr_atm.query();
			
			count = count + gr_atm.getRowCount();
		
			//gs.print(gr.sys_id+' Attachments: ' + gr2.getRowCount());
			while(gr_atm.next()){
				var guid = gr_atm.sys_id;
				var name = gr_atm.file_name;
				var type = gr_atm.content_type?gr_atm.content_type:name.slice(name.lastIndexOf("."));
				
				var gr_icon = new GlideRecord('sys_attachment_icon_rule');
				gr_icon.get('file_format_indicator',type);
				
				var icon = gr_icon.icon?gr_icon.icon:"images/icons/attach_document.gifx";
				this._addDetails(guid,name,icon);
			}
		}
		var c = this.newItem("result");
		c.setAttribute("number",count);
	},
	_addDetails: function(guid,name,icon){
		var att = this.newItem("attachments");
		att.setAttribute("guid",guid);
		att.setAttribute("fileName",name);
		att.setAttribute("icon_link",icon);
	},
    type: 'AttachmentQuery'
});