var gr = new GlideRecord("u_prolog_user_credentials");
gr.initialize(); 
gr.u_databases = workflow.scratchpad.database;
gr.u_email_address = current.variables.NUR_Emailaddress;
gr.u_environment = workflow.scratchpad.env;
gr.u_password = workflow.scratchpad.passWord;
gr.u_user_name = workflow.scratchpad.name;
gr.u_ritm_number = current.number;
gr.insert();
gs.eventQueue('Prolog_password', gr,current.variables.NUR_Emailaddress,gr.u_password);