// Project ID's Soap Call
var environment = gs.getProperty('prolog_us_environment');
var startOfSoapCall = new GlideDateTime();
var failedProjectSoapCallUS = [];
var gr1 = new GlideRecord('u_prolog_user_portfolios');
gr1.addQuery('u_environment', gs.getProperty('prolog_us_environment'));
gr1.addQuery('u_active', true);
gr1.orderBy('u_portfolio_name');
gr1.query();
while (gr1.next()) {
    var PortfolioName = gr1.u_portfolio_name;
    var ProjectSequence;
    var ProjectName;
    var ProjectID;
    var ProjectGUID;
    var ProjectAddress;
    var PortfolioNameCdata = '<![CDATA[' + PortfolioName.toString() + ']]>';

    var gr2 = new GlideRecord('u_prolog_projects');
    try {
        var SoapMessage = new sn_ws.SOAPMessageV2('Prolog_UserRequest_GetProjectID_US', 'QueryServiceSoap.ExecuteDynamicQueryOnPortfolio');
        SoapMessage.setStringParameterNoEscape('portfolio_name', PortfolioNameCdata);

        var response = SoapMessage.execute();
        var responseBody = response.getBody();
        var status = response.getStatusCode();
        if (status != 200) {
            failedProjectSoapCallUS.push(gr1.u_portfolio_name.toString());
        }

        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);

        var gr3 = new GlideRecord('u_prolog_projects');
        gr3.addQuery('u_environment', environment);
        gr3.addQuery('u_portfolio_name', PortfolioName);
        gr3.orderBy('u_portfolio_name');
        gr3.query();
        var CompKey1 = [];
        var CompKey2 = [];
        var CompKey3 = [];
        var arrayUtil = new ArrayUtil();
        while (gr3.next()) {
            CompKey1.push(gr3.u_project_sequence + ":" + gr3.u_project_name + ":" + gr3.u_project_id + ":" + gr3.u_project_guid);
        }
        var i = 1;
        do {
            ProjectSequence = xmlDoc.getNodeText("//Table[" + i + "]//Projects.Sequence");
            ProjectName = xmlDoc.getNodeText("//Table[" + i + "]//Projects.Name");
            ProjectID = xmlDoc.getNodeText("//Table[" + i + "]//Projects.ProjectID");
            ProjectAddress = xmlDoc.getNodeText("//Table[" + i + "]//Projects.Address");
            ProjectGUID = xmlDoc.getNodeText("//Table[" + i + "]//Projects.GUID");
            CompKey2 = ProjectSequence + ":" + ProjectName + ":" + ProjectID + ":" + ProjectGUID;
            var keyLOB2 = '';
            if (!ProjectName) {
                if (i <= 1) {
                    if (!(arrayUtil.contains(CompKey1, CompKey2))) //checking whether duplicate record is there in the servicenow table
                    {
                        if (!(arrayUtil.contains(CompKey3, CompKey2))) //checking whether duplicate record is there in the incoming XML
                        {
                            gr2.initialize();
                            gr2.u_environment = gs.getProperty('prolog_us_environment');
                            gr2.u_portfolio_name = PortfolioName;
                            gr2.u_status = status;
                            gr2.u_project_sequence = ProjectSequence;
                            gr2.u_project_name = ProjectName;
                            gr2.u_project_id = ProjectID;
                            gr2.u_project_guid = ProjectGUID;
                            gr2.u_project_address = ProjectAddress;
                            gr2.insert();
                            CompKey3.push(ProjectSequence + ":" + ProjectName + ":" + ProjectID + ":" + ProjectGUID);
                            break;
                        }
                    }
                    else break;
                }
            }
            else {
                if (!(arrayUtil.contains(CompKey1, CompKey2))) {
                    if (!(arrayUtil.contains(CompKey3, CompKey2))) {
                        gr2.initialize();
                        gr2.u_environment = gs.getProperty('prolog_us_environment');
                        gr2.u_portfolio_name = PortfolioName;
                        gr2.u_status = status;
                        gr2.u_project_sequence = ProjectSequence;
                        gr2.u_project_name = ProjectName;
                        gr2.u_project_id = ProjectID;
                        gr2.u_project_guid = ProjectGUID;
                        gr2.u_project_address = ProjectAddress;
                        gr2.insert();
                        CompKey3.push(ProjectSequence + ":" + ProjectName + ":" + ProjectID + ":" + ProjectGUID);
                    }
                    else {
                        var gr4 = new GlideRecord('u_prolog_projects');
                        gr4.addQuery('u_environment', environment);
                        gr4.addQuery('u_portfolio_name', PortfolioName);
                        gr4.addQuery('u_project_name', ProjectName);
                        gr4.addQuery('u_project_sequence', ProjectSequence);
                        gr4.addQuery('u_project_id', ProjectID);
                        gr4.addQuery('u_project_guid', ProjectGUID);
                        gr4.query();
                        while (gr4.next()) {
                            gr4.u_active = true;
                            gr4.setForceUpdate(true);
                            gr4.update();
                        }
                    }
                }
                else {
                    var gr4_1 = new GlideRecord('u_prolog_projects');
                    gr4_1.addQuery('u_environment', environment);
                    gr4_1.addQuery('u_portfolio_name', PortfolioName);
                    gr4_1.addQuery('u_project_name', ProjectName);
                    gr4_1.addQuery('u_project_sequence', ProjectSequence);
                    gr4_1.addQuery('u_project_id', ProjectID);
                    gr4_1.addQuery('u_project_guid', ProjectGUID);
                    gr4_1.query();
                    while (gr4_1.next()) {
                        gr4_1.u_active = true;
                        gr4_1.setForceUpdate(true);
                        gr4_1.update();
                    }
                }
            }
            i++;
        } while (ProjectName);
    }
    catch (ex) {
        var message = ex.getMessage();
    }
    if (status != 200) {
        var ErrorTable = new GlideRecord('u_prolog_error');
        ErrorTable.initialize();
        ErrorTable.u_environment = gs.getProperty('prolog_us_environment');
        ErrorTable.u_portfolio = PortfolioName;
        ErrorTable.u_status = status;
        ErrorTable.u_table = "ProjectID";
        ErrorTable.u_email_status = "Not Processed";
        ErrorTable.u_description = xmlDoc.getNodeText('//faultstring');
        ErrorTable.u_error_msg = responseBody;
        ErrorTable.u_request_type = "New User Request";
        ErrorTable.insert();
    }
}

var endOfSoapCall = new GlideDateTime();
var diff = gs.dateDiff(startOfSoapCall, endOfSoapCall, true);
//gs.log("NProject-4- Inactive Coint: "+ diff );
var duration = Math.round(diff / 60) + 1;
//gs.log("NProject-4- Inactive Coint: "+  duration);

gs.log("Prolog User(US) :: ProjectID Duration (In Minutes) : " + duration);
updateInactiveRecords(duration);


var ScheduleJob = new GlideRecord('sysauto_script');
ScheduleJob.get('name', 'Prolog_UserRequest_GetContact_US');
ScheduleJob.query();
if (ScheduleJob.next()) {
    SncTriggerSynchronizer.executeNow(ScheduleJob);
}

function updateInactiveRecords(duration) {
    var minutes = duration;
    var encodedQuery = 'u_active=true^sys_updated_onRELATIVELE@minute@ago@' + minutes;
    var inactiveRecord = new GlideRecord('u_prolog_user_inactive_entries');
    var gr5 = new GlideRecord('u_prolog_projects');
    gr5.addQuery('u_environment', environment);
    gr5.addQuery('u_portfolio_name', 'NOT IN', failedProjectSoapCallUS);
    gr5.addEncodedQuery(encodedQuery);
    gr5.query();
    //gs.log("NProject-3- Inactive Coint: "+ gr5.getRowCount() );
    if (gr5.getRowCount() >= 1) {
        while (gr5.next()) {
            gr5.u_active = false;
            gr5.update();
            inactiveRecord.initialize();
            inactiveRecord.u_environment = environment;
            inactiveRecord.u_entity = "Project Name";
            inactiveRecord.u_portfolio_name = gr5.u_portfolio_name;
            inactiveRecord.u_entity_name = gr5.u_project_name;
            inactiveRecord.u_time_stamp = gs.nowDateTime().toString();
            inactiveRecord.u_guid = gr5.u_project_guid;
            inactiveRecord.insert();
        }
    }
}