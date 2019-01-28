if(trim(message)!="")
{
	var gr = new GlideRecord('sysapproval_approver');
	gr.addQuery('sys_id',sys);
	gr.query();
	//getting the comment by directly calling the name attribute of textarea field of the form
	if(gr.next()){
		gr.comments = "This comment is from the requestor\n"+message;
		gr.update();
	}
 	var bottomUrl = GlideSession.get().getStack().bottom();
	//var session = gs.urlEncode();
	gs.getSession().putClientData('u_ses','true');
//  	gs.log("Decoder: bottomUrl: "+bottomUrl);
	response.sendRedirect(bottomUrl);
	//gs.setRedirect("https://trianzjacobsdev.service-now.com/jacobs/javascript:window.close();");
	//gs.log()
}