(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    //
    var vars = event.parm2.split("|");
    gs.log("Event param 2: " + event.parm2);
    gs.log("vars: " + vars);
    template.print(vars[0] + ",<br/><br/>");
    template.print("You have been granted access to Prolog Converge.<br/><br/>");
    template.print("To login go to <a href='" + vars[2] + "'>" + vars[2] + "</a><br/><br/>");
    template.print("Database Name: " + vars[1] + "<br/>");
    template.print("User Name: " + vars[0] + "<br/>");
    //	template.print("Password: "+vars[2]+"<br/>");
})(current, template, email, email_action, event);