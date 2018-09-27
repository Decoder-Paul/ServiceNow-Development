//-------user Information Includes NUR_FirstName, NUR_LastName, NUR_NameofLocation->u_location_guid(u_prolog_contacts)
var firstName = current.variables.NUR_FirstName.toString();
var lastName = current.variables.NUR_LastName.toString();
var email = current.variables.NUR_Emailaddress.toString();
var title = current.variables.NUR_TItle.toString();
var tel = current.variables.NUR_OfficePhone.toString();
var ProManager = current.variables.NUR_PrologManager.toString();
var Converge = current.variables.NUR_Converge.toString();
var Mobile = current.variables.NUR_Mobile.toString();
var RitmNumber = current.number;
var env = current.variables.NUR_EnvInfo;
var SoapCallRead;
var SoapCallSave;
var SoapCallAdd;

var fName = firstName.substring(0, 3);
var lName = lastName.substring(0, 3);
gs.log(RitmNumber + "ContactId: " + contactId + "fName: " + fName + "lName: " + lName);
var userName = firstName + " " + lastName;
//check for the environmnet to trigger the environment based soap calls

if (env == 'US') {
    SoapCallRead = 'Prolog_UserRequest__ReadSaveDocument_US';
    SoapCallSave = 'Prolog_UserRequest__ReadSaveDocument_US';
    SoapCallAdd = 'Prolog_UserRequest_AddUpdateUser_US';
    workflow.scratchpad.urls = "https://converge.jacobs.com/prologconverge/WebClient/"; //used in Notification
}
if (env == 'UK') {
    SoapCallRead = 'Prolog_UserRequest__ReadSaveDocument_UK';
    SoapCallSave = 'Prolog_UserRequest__ReadSaveDocument_UK';
    SoapCallAdd = 'Prolog_UserRequest_AddUpdateUser_UK';
    workflow.scratchpad.urls = "https://convergeeu.jacobs.com/prologconverge/WebClient/";
}
// set the enumeration value
var enumeration;
if (ProManager == 'true' && Converge == 'false' && Mobile == 'false')
    enumeration = '1';
if (ProManager == 'false' && Converge == 'true' && Mobile == 'false')
    enumeration = '2';
if (ProManager == 'true' && Converge == 'true' && Mobile == 'false')
    enumeration = '3';
if (ProManager == 'false' && Converge == 'false' && Mobile == 'true')
    enumeration = '4';
if (ProManager == 'true' && Converge == 'false' && Mobile == 'true')
    enumeration = '5';
if (ProManager == 'false' && Converge == 'true' && Mobile == 'true')
    enumeration = '6';
if (ProManager == 'true' && Converge == 'true' && Mobile == 'true')
    enumeration = '7';
gs.log(RitmNumber + "Enumeration: " + enumeration);
// unique username creation
var fName = firstName.substr(0, 3);
var lName = lastName.substr(0, 3);
var baseId = fName + lName;
baseId = baseId.toUpperCase();
var contactId = baseId;
var mx = -1;
var suffix = 0;

var gr = new GlideRecord("u_prolog_contacts");
gr.addEncodedQuery('u_contact_idSTARTSWITH' + contactId);
gr.orderBy('u_contact_id');
gr.query();

while (gr.next()) {
    gs.log("coming in loop");
    if (gr.u_contact_id == contactId) {
        mx = 0;
    } else {
        if (!isNaN(parseInt(gr.u_contact_id.substr(-2)))) { //joshim01
            if (mx < parseInt(gr.u_contact_id.substr(-2))) {
                mx = parseInt(gr.u_contact_id.substr(-2));
            }
        } else if (!isNaN(parseInt(gr.u_contact_id.substr(-1)))) { //johsim1
            if (mx < parseInt(gr.u_contact_id.substr(-1))) {
                mx = parseInt(gr.u_contact_id.substr(-1));
            }
        } else { //JOHSIMM Exists
            if (mx < 1) {
                mx = -1;
            }
        }
    }
}
if (mx >= 0 && mx < 9) {
    suffix = mx + 1;
    contactId = baseId + '0' + suffix.toString();
    gs.log("contact id " + contactId);
} else if (mx > 9) {
    suffix = mx + 1;
    contactId = baseId + suffix.toString();
    gs.log("contact id else if is " + contactId);
} else {
    gs.log("contact id else is " + contactId);
}
// auto password generation
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
var pass = "";
var length = "10";
for (var x = 0; x < length; x++) {
    var j = Math.floor(Math.random() * chars.length);
    pass += chars.charAt(j);
}
//-----------Grid Information----------------
var dataGrid = current.variables.NUR_json;
//----------------------------------------------------------------------------------------------------------------------------// 
//----------------------------------------CODE to Handle Multi Project with Same Database-------------------------------------//
var list = JSON.parse(dataGrid);

function groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}
var result = groupBy(list, function (item) {
    return [item.field1];
});

var obj = result;
gs.log(RitmNumber + "Data Grid:" + JSON.stringify(result));
// Example of Obj <- How does it look like after formatting
// obj=[
//     [{
//         "serialKey": 1,
//         "field1": "ARNG",
//         "field2": "Cesna-278",
//         "field3": "B&I-Architect/Engineer",
//         "field4": "Advance Contracting",
//         "field5": "Office",
//         "selected": false,
//         "$$hashKey": "object:5"
//     }, {
//         "serialKey": 3,
//         "field1": "ARNG",
//         "field2": "Chennai-104",
//         "field3": "B&I-Document-Control",
//         "field4": "Advance Contracting",
//         "field5": "Office",
//         "selected": false,
//         "$$hashKey": "object:21"
//     }],
//     [{
//         "serialKey": 2,
//         "field1": "Boeing",
//         "field2": "1.1.1 PMCM Support",
//         "field3": "B&I-Architect/Engineer-Web",
//         "field4": "Air Enterprises",
//         "field5": "Boeing",
//         "selected": false,
//         "$$hashKey": "object:13"
//     }, {
//         "serialKey": 4,
//         "field1": "Boeing",
//         "field2": "1.4.1 Bldg 40-58 CWC",
//         "field3": "B&I-Document-Control",
//         "field4": "Air Enterprises",
//         "field5": "Boeing",
//         "selected": false,
//         "$$hashKey": "object:29"
//     }]
// ]

var databases = "";

//Updating the task with logs of failed Responses
var taskSysId = workflow.scratchpad.taskSysId;
var scTask = new GlideRecord('sc_task');
scTask.get(taskSysId);
scTask.u_additional_comments_html = "";
workflow.scratchpad.errorFlag = false;

for (var i = 0; i < obj.length; i++) {
    
    var portfolioString = obj[i][0].field1;
    var portfolio = '<![CDATA[' + portfolioString.toString() + ']]>';
    var projString = obj[i][0].field2;
    var proj = '<![CDATA[' + projString.toString() + ']]>';
    var securityString = obj[i][0].field3;
    var security = '<![CDATA[' + securityString.toString() + ']]>';
    var companyString = obj[i][0].field4;
    var company = '<![CDATA[' + companyString.toString() + ']]>';
    var locationString = obj[i][0].field5;
    var location = '<![CDATA[' + locationString.toString() + ']]>';
    databases += portfolio + ", ";
    gs.log(RitmNumber + "  Iteration: " + i + "\nPortfolio:" + portfolio + " Project:" + proj + " Security:" + security + " company:" + company + " location:" + location);

    //--u_company_name->u_company_guid(u_prolog_contacts)
    var gr1 = new GlideRecord('u_prolog_contacts');
    gr1.addQuery('u_environment', env);
    gr1.addQuery('u_company_name', companyString);
    gr1.addQuery('u_portfolio_name', portfolioString);
    // gr1.addQuery('u_name_of_location',location);		
    gr1.query();
    gr1.next();
    var companyGUID = gr1.u_company_guid;
    gs.log(RitmNumber + "  companyGUID is -------" + companyGUID);

    //--u_name_of_location->u_location_guid(u_prolog_contacts)
    var gr2 = new GlideRecord('u_prolog_contacts');
    gr1.addQuery('u_environment', env);
    gr2.addQuery('u_name_of_location', locationString);
    gr2.addQuery('u_portfolio_name', portfolioString);
    gr2.addQuery('u_company_name', companyString);
    gr2.query();
    gr2.next();
    var locationGUID = gr2.u_location_guid;

    //--u_project_name->u_project_guid(u_prolog_projects)
    var gr3 = new GlideRecord('u_prolog_projects');
    gr3.addQuery('u_environment', env);
    gr3.addQuery('u_portfolio_name', portfolioString);
    gr3.addQuery('u_project_name', projString);
    gr3.query();
    gr3.next();
    var projGUID = gr3.u_project_guid;
    var projID = gr3.u_project_id;

    //--Security->u_usergroup_id(u_prolog_securitygroups)
    var gr4 = new GlideRecord('u_prolog_securitygroups');
    gr4.addQuery('u_environment', env);
    gr4.addQuery('u_portfolio_name', portfolioString);
    gr4.addQuery('u_usergroup_name', securityString);
    gr4.query();
    gr4.next();
    var GroupID = gr4.u_usergroup_id;

    try {
        //call 4 request
        var ReadCall = new sn_ws.SOAPMessageV2(SoapCallRead, 'DocumentServiceSoap.ReadDocument');
        ReadCall.setStringParameterNoEscape('Portfolio_name', portfolio); //portfolio
        ReadCall.setStringParameterNoEscape('Project_Name', proj); //projectname
        ReadCall.setStringParameterNoEscape('Document_GUID', companyGUID); //company guid
        var response = ReadCall.execute();
        var requestBody_Read = ReadCall.getRequestBody();
        var responseErrorMsg_Read = response.haveError() ? response.getErrorMessage() : null;
        var responseBody_Read = response.getBody();
        var status_Read = response.getStatusCode();
        workflow.scratchpad.status_read = status_Read;
        if (status_Read != '200') {
            var xmlDoc_Read = new XMLDocument2(); //xml doc
            xmlDoc_Read.parseXML(responseBody_Read);
            var FaultString_Read = xmlDoc_Read.getNodeText('//faultstring') ? xmlDoc_Read.getNodeText('//faultstring') : responseBody_Read;
            workflow.scratchpad.ReadCallResponse = "READ call Response for Database: " + portfolioString + " | " + FaultString_Read; //used to update task comment
            scTask.u_additional_comments_html += workflow.scratchpad.ReadCallResponse + "[code]<br><br>[code]";
            workflow.scratchpad.errorFlag = true;
        }
        gs.log(RitmNumber + "  Iteration: " + i + " | Read call status is -------" + status_Read);
        gs.log(RitmNumber + "  Iteration: " + i + " | Read call Request Body is : " + requestBody_Read);
        gs.log(RitmNumber + "  Iteration: " + i + " | Read call Response Body is : " + responseBody_Read);
        gs.log(RitmNumber + "  Iteration: " + i + " | Read call Error Message is : " + responseErrorMsg_Read);
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody_Read);

        var conEle = xmlDoc.getNode("//Contacts");
        xmlDoc.setCurrentElement(conEle);
        var newEle = xmlDoc.createElement("ContactsRow");
        newEle.setAttribute("RowState", "Added");
        xmlDoc.setCurrentElement(newEle);
        xmlDoc.createElementWithTextValue("ContactID", contactId);
        xmlDoc.createElementWithTextValue("Address_ItemGuid", locationGUID);
        xmlDoc.createElementWithTextValue("DisplayName", userName);
        xmlDoc.createElementWithTextValue("FirstName", firstName);
        xmlDoc.createElementWithTextValue("LastName", lastName);
        xmlDoc.createElementWithTextValue("EMail", email);
        xmlDoc.createElementWithTextValue("Title", title);
        xmlDoc.createElementWithTextValue("Tel", tel);
        xmlDoc.createElementWithTextValue("IsMainContact", "false");
        xmlDoc.createElementWithTextValue("IsAutoNotify", "false");
        xmlDoc.createElementWithTextValue("IsActive", "true");
        xmlDoc.createElementWithTextValue("IsCurrent", "false");
        xmlDoc.createElement("GUID");
        var projEle = xmlDoc.createElement("ProjectsLinks");
        xmlDoc.setCurrentElement(projEle);
        var proLink = xmlDoc.createElement("ProjectsLinksRow");
        proLink.setAttribute("RowState", "Added");
        xmlDoc.setCurrentElement(proLink);
        xmlDoc.createElementWithTextValue("Project_Guid", projGUID);
        xmlDoc.createElementWithTextValue("Project_DocumentType", "MeridianSystems.Prolog.Business.Administration.Projects.ProjectsDocument");
        xmlDoc.createElementWithTextValue("IsMainProjectContact", "false");

        for(var j=1;j<obj[i].length; j++){
            
            //--u_project_name->u_project_guid(u_prolog_projects)
            var gr_multi = new GlideRecord('u_prolog_projects');
            gr_multi.addQuery('u_environment', env);
            gr_multi.addQuery('u_portfolio_name', portfolioString);
            gr_multi.addQuery('u_project_name', obj[i][j].field2);
            gr_multi.query();
            gr_multi.next();
            var projGUID_multi = gr_multi.u_project_guid;

            xmlDoc.setCurrentElement(projEle);
            var proLink = xmlDoc.createElement("ProjectsLinksRow");
            proLink.setAttribute("RowState", "Added");
            xmlDoc.setCurrentElement(proLink);
            xmlDoc.createElementWithTextValue("Project_Guid", projGUID_multi);
            xmlDoc.createElementWithTextValue("Project_DocumentType", "MeridianSystems.Prolog.Business.Administration.Projects.ProjectsDocument");
            xmlDoc.createElementWithTextValue("IsMainProjectContact", "false");
        }

        var docData = xmlDoc.getNode("//DocumentData");

        var saveRequest =
            "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
            "<s:Header>" +
            "<Security xmlns=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\">" +
            "<o:UsernameToken u:id=\"e3bf6ff7-22f3-419e-8df1-82ba66dc388e\" xmlns:o=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">" +
            "<o:Username>ServiceNowTest</o:Username>" +
            "<o:Password>service123</o:Password>" +
            "<o:Nonce>MQF6ciZl5K/OWGlQ9ClEptMx2r8=</o:Nonce>" +
            "</o:UsernameToken>" +
            "</Security>" +
            "<TargetPortfolio xmlns=\"http://www.mps.com/Prolog/webservices\">" + portfolio + "</TargetPortfolio>" +
            "<TargetProject xmlns=\"http://www.mps.com/Prolog/webservices\">" + proj + "</TargetProject>" +
            "</s:Header>" +
            "<s:Body xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">" +
            "<SaveDocument xmlns=\"uri://meridiansystems.com/prolog/connect/documentservice\">" +
            "<SaveDocumentArgument>" +
            docData.toString() +
            "</SaveDocumentArgument>" +
            "<DocumentOutputOptions>" +
            "<IncludeMetaData>false</IncludeMetaData>" +
            "</DocumentOutputOptions>" +
            "</SaveDocument>" +
            "</s:Body>" +
            "</s:Envelope>";
        //Call 5 Request
        var SaveCall = new sn_ws.SOAPMessageV2(SoapCallSave, 'DocumentServiceSoap.SaveDocument');
        SaveCall.setRequestBody(saveRequest);

        var response_Save = SaveCall.execute();
        var requestBody_Save = SaveCall.getRequestBody();
        var responseErrorMsg_Save = response_Save.haveError() ? response_Save.getErrorMessage() : null;
        var responseBody_Save = response_Save.getBody();
        var status_Save = response_Save.getStatusCode();

        workflow.scratchpad.status_save = status_Save;
        if (status_Save != '200') {
            var xmlDoc_Save = new XMLDocument2();
            xmlDoc_Save.parseXML(responseBody_Save);
            var FaultString_Save = xmlDoc_Save.getNodeText('//faultstring') ? xmlDoc_Save.getNodeText('//faultstring') : responseBody_Save;

            workflow.scratchpad.SaveCallResponse = "SAVE call Response for Database: " + portfolioString + " | " + FaultString_Save;
            scTask.u_additional_comments_html += workflow.scratchpad.SaveCallResponse + "[code]<br><br>[code]";
            workflow.scratchpad.errorFlag = true;
        }
        gs.log(RitmNumber + "  Iteration: " + i + " | SAVE call status is -------" + status_Save);
        gs.log(RitmNumber + "  Iteration: " + i + " | SAVE call Request Body: " + requestBody_Save);
        gs.log(RitmNumber + "  Iteration: " + i + " | SAVE call Response Body: " + responseBody_Save);
        gs.log(RitmNumber + "  Iteration: " + i + " | SAVE call Error Message: " + responseErrorMsg_Save);
        //Call 6 Request
        var extraUserProjectPermission=""; //used for multiple Project
        for(var j=1;j<obj[i].length; j++){
            var gr_multi = new GlideRecord('u_prolog_projects');
            gr_multi.addQuery('u_environment', env);
            gr_multi.addQuery('u_portfolio_name', portfolioString);
            gr_multi.addQuery('u_project_name', obj[i][j].field2);
            gr_multi.query();
            gr_multi.next();
            var projID_multi = gr_multi.u_project_id;
            //--Security->u_usergroup_id(u_prolog_securitygroups)
            var gr4_multi = new GlideRecord('u_prolog_securitygroups');
            gr4_multi.addQuery('u_environment', env);
            gr4_multi.addQuery('u_portfolio_name', portfolioString);
            gr4_multi.addQuery('u_usergroup_name', obj[i][j].field3);
            gr4_multi.query();
            gr4_multi.next();
            var GroupID_multi = gr4_multi.u_usergroup_id;
            
            extraUserProjectPermission +=   "<UserProjectPermission>"+ 
                                                "<ProjectID>"+projID_multi+"</ProjectID>"+ 
                                                "<GroupID>"+GroupID_multi+"</GroupID>"+ 
                                                "<GroupName><![CDATA["+obj[i][j].field3+"]]></GroupName>"+ 
                                            "</UserProjectPermission>";
        }
        var updateRequest = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">"+ 
         "<s:Header>"+ 
             "<Security xmlns=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\">"+ 
                 "<o:UsernameToken u:id=\"8b1f5957-8dda-4657-9d29-02cfddfb7cce\" xmlns:o=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">"+ 
                     "<o:Username>ServiceNowTest</o:Username>"+ 
                     "<o:Password>service123</o:Password>"+
                     "<o:Nonce>J7SezqhGt7XG9RZB3VhjnzREbXs=</o:Nonce>"+ 
                 "</o:UsernameToken>"+ 
             "</Security>"+ 
             "<TargetPortfolio xmlns=\"http://www.mps.com/Prolog/webservices\">"+
                 portfolio+
             "</TargetPortfolio>"+
         "</s:Header>"+ 
         "<s:Body xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">"+ 
             "<AddOrUpdateUser xmlns=\"uri://meridiansystems.com/prolog/connect/administrationservice\">"+ 
                "<user>"+ 
                    "<UserName>"+userName+"</UserName>"+ 
                     "<Password>"+pass+"</Password>"+ 
                     "<ExpiresOn xsi:type=\"xsd:dateTime\">2020-01-01T08:29:59.5995905-07:00</ExpiresOn>"+ 
                     "<ContactID>"+contactId+"</ContactID>"+ 
                     "<DefGroupID>"+GroupID+"</DefGroupID>"+
                     "<DefGroupName>"+security+"</DefGroupName>"+
                     "<AllowedApp>"+enumeration+"</AllowedApp>"+ 
                     "<ProjectPermissions>"+
                         "<UserProjectPermission>"+ 
                             "<ProjectID>"+projID+"</ProjectID>"+ 
                             "<GroupID>"+GroupID+"</GroupID>"+ 
                             "<GroupName>"+security+"</GroupName>"+ 
                         "</UserProjectPermission>"+ 
                         extraUserProjectPermission+
                     "</ProjectPermissions>"+ 
                 "</user>"+ 
                 "<okToCreateIfUserDoesntExist>true</okToCreateIfUserDoesntExist>"+ 
             "</AddOrUpdateUser>"+ 
         "</s:Body>"+ 
     "</s:Envelope>"; 
        
        
        var addUpdateCall = new sn_ws.SOAPMessageV2(SoapCallAdd, 'AdministrationServiceSoap.AddOrUpdateUser');
         addUpdateCall.setRequestBody(updateRequest);
         // addUpdateCall.setStringParameterNoEscape('Portfolio_name', portfolio); //portfolio
        // addUpdateCall.setStringParameterNoEscape('Project_name', proj); //projectname
        // addUpdateCall.setStringParameterNoEscape('User_name', userName);
        // addUpdateCall.setStringParameterNoEscape('Password', pass);
        // addUpdateCall.setStringParameterNoEscape('ContactId', contactId);
        // addUpdateCall.setStringParameterNoEscape('DefGroupID', GroupID);
        // addUpdateCall.setStringParameterNoEscape('DefGroupName', security);
        // addUpdateCall.setStringParameterNoEscape('enumeration', enumeration);
        // addUpdateCall.setStringParameterNoEscape('ProjectID', projID);
        // addUpdateCall.setStringParameterNoEscape('GroupID', GroupID);
        // addUpdateCall.setStringParameterNoEscape('GroupName', security);

        var response_add = addUpdateCall.execute();
        var requestBody_add = addUpdateCall.getRequestBody();
        var responseErrorMsg_add = response_add.haveError() ? response_add.getErrorMessage() : null;
        var responseBody_add = response_add.getBody();
        var status_add = response_add.getStatusCode();

        workflow.scratchpad.status_add = status_add;
        if (status_add != '200') {
            var xmlDoc_add = new XMLDocument2(); //xml doc
            xmlDoc_add.parseXML(responseBody_add);
            var Faultstring_add = xmlDoc_add.getNodeText('//faultstring') ? xmlDoc_add.getNodeText('//faultstring') : responseBody_add;

            workflow.scratchpad.UpdateCallResponse = "UPDATE call Response for Database: " + portfolioString + " | " + Faultstring_add;
            scTask.u_additional_comments_html += workflow.scratchpad.UpdateCallResponse + "[code]<br>[code]";
            workflow.scratchpad.errorFlag = true;
        }
        gs.log(RitmNumber + "  Iteration: " + i + " | UPDATE call status is -------" + status_add);
        gs.log(RitmNumber + "  Iteration: " + i + " | UPDATE call Request Body: " + requestBody_add);
        gs.log(RitmNumber + "  Iteration: " + i + " | UPDATE call Response Body: " + responseBody_add);
        gs.log(RitmNumber + "  Iteration: " + i + " | UPDATE call Error Message: " + responseErrorMsg_add);
    } catch (ex) {
        var message = ex.getMessage();
        //s.setXMLParameter('documentdata', doc);
    }
}

//Comments updated with error logs
scTask.update();
//below variables are used in workflow notification
workflow.scratchpad.env = env;
workflow.scratchpad.name = userName;
//workflow.scratchpad.email = current.variables.NUR_Emailaddress;
workflow.scratchpad.database = databases;
workflow.scratchpad.passWord = pass;
workflow.scratchpad.ContactID = contactId;