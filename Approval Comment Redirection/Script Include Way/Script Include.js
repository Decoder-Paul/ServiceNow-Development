var ApprovalComment = Class.create();
ApprovalComment.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	putComment:function(){
		var doc_id = this.getParameter('sysparm_doc');
		var comment = this.getParameter('sysparm_comment');
		
		var gr = new GlideRecord('sysapproval_approver');
		gr.addQuery('sys_id',doc_id);
		gr.query();
		if(gr.next()){
			gr.comments = "This comment is from the requestor\n"+comment;
			gr.update();
			return true;
		}
	},
    type: 'ApprovalComment'
});