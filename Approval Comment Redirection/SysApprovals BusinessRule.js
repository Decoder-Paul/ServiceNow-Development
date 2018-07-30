(function executeRule(current, previous /*null when async*/ ) {

	// 	var fields = current.getFields();
	// 	for (var i = 0; i < fields.size(); i++) { 
	// 		var field = fields.get(i);
	// 		var name = field.getName(); 
	// 		var value = field.getDisplayValue(); 
	// 		gs.print(i + ". " + name + "=" + value); 
	// 	}
	var gr = new GlideRecord('sc_req_item');
	gr.addQuery('sys_id', current.document_id);
	gr.query();
	// 	var notes = current.comments.getDisplayValue(); 
	// 	gs.log("DecoderNotes: "+notes);
	// 	var na = notes.split("\n\n");
	// 	gs.log("DecoderNA: "+na);
	// 	var comm = na[0].split("\n");
	// 	gs.log("DecoderCommBefr: "+comm);
	// 	comm.shift();
	// 	gs.log("DecoderCommAftr: "+comm);

	var journal = current.comments.getJournalEntry(1).split("\n");
	gs.log("DecoderJournal: " + journal);
	journal.shift(); //cleaning 2018-07-23 09:45:14 - Subhankar Paul (Comments)

	if (journal[0] == "This comment is from the requestor") {
		if (gr.next()) {
			gr.comments = journal.join("\n");
			gr.update();
		}
	} else {
		if (gr.next()) {
			gr.comments = "This comment is from the approval. Please respond by " + "[code]<strong><a href='https://trianzjacobsdev.service-now.com/Approval_Comment_Binder.do?&sysparm_ui_page=Approval_Comment_Binder&sysparm_doc=" + current.sys_id + "' target='_blank' id='link'>Clicking me</a></div></strong>[/code]\n" + journal.join("\n");
			gr.update();
		}
	}

})(current, previous);