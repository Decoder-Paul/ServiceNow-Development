// Project Security Groups.........
//gs.log("Prolog User-1: Start of Security Group Soap Call");
var environment = gs.getProperty('prolog_us_environment');
var startOfSoapCall = new GlideDateTime();
var failedSecuritySoapCallUS = [];
var gr1 = new GlideRecord('u_prolog_user_portfolios');
gr1.addQuery('u_environment', gs.getProperty('prolog_us_environment'));
gr1.addQuery('u_active', true);
//gr1.addQuery('u_portfolio_name', 'WHHS'); 
gr1.orderBy('u_portfolio_name');
gr1.query();
//gs.log("Prolog User-2: Portfolio Row Count: "+gr1.getRowCount());
while (gr1.next()) {
    var PortfolioName = gr1.u_portfolio_name;
    var UsergrpsID;
    var UsergrpsName;
    var PortfolioNameCdata = '<![CDATA[' + PortfolioName.toString() + ']]>';
    var gr2 = new GlideRecord('u_prolog_securitygroups');
    try {
        var SoapMessage = new sn_ws.SOAPMessageV2('Prolog_UserRequest_GetSecurityGroups_US', 'QueryServiceSoap.ExecuteDynamicQueryOnPortfolio');
        SoapMessage.setStringParameterNoEscape('portfolio_name', PortfolioNameCdata);

        var response = SoapMessage.execute();
        var responseBody = response.getBody();
        var status = response.getStatusCode();
        if (status != 200) {
            failedSecuritySoapCallUS.push(gr1.u_portfolio_name.toString());
        }
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);

        var gr3 = new GlideRecord('u_prolog_securitygroups');
        gr3.addQuery('u_environment', environment);
        gr3.addQuery('u_portfolio_name', PortfolioName);
        gr3.orderBy('u_portfolio_name');
        gr3.query();
        var CompKey1 = [];
        var CompKey2 = [];
        var CompKey3 = [];
        var arrayUtil = new ArrayUtil();
        while (gr3.next()) {
            CompKey1.push(gr3.u_usergroup_id + ":" + gr3.u_usergroup_name);
        }
        var i = 1;
        do {
            UsergrpsID = xmlDoc.getNodeText("//Table[" + i + "]//tbl_sp_usergrps.ID");
            UsergrpsName = xmlDoc.getNodeText("//Table[" + i + "]//tbl_sp_usergrps.Name");
            CompKey2 = UsergrpsID + ":" + UsergrpsName;
            var keyLOB2 = '';
            if (!UsergrpsID)
                break;
            else {
                if (!(arrayUtil.contains(CompKey1, CompKey2))) {
                    if (!(arrayUtil.contains(CompKey3, CompKey2))) {
                        gr2.initialize();
                        gr2.u_environment = gs.getProperty('prolog_us_environment');
                        gr2.u_portfolio_name = PortfolioName;
                        gr2.u_status = status;
                        gr2.u_usergroup_id = UsergrpsID;
                        gr2.u_usergroup_name = UsergrpsName;
                        gr2.insert();
                        CompKey3.push(UsergrpsID + ":" + UsergrpsName);
                    }
                }
                else {
                    var gr4 = new GlideRecord('u_prolog_securitygroups');
                    gr4.addQuery('u_environment', environment);
                    gr4.addQuery('u_portfolio_name', PortfolioName);
                    gr4.addQuery('u_usergroup_name', UsergrpsName);
                    gr4.addQuery('u_usergroup_id', UsergrpsID);
                    gr4.query();
                    while (gr4.next()) {
                        //gs.log("Prolog User-3: Start of Security Group Soap Call");	
                        gr4.u_active = true;
                        gr4.setForceUpdate(true);
                        gr4.update();
                        //gs.log("Prolog User-3: "+ gr4.u_portfolio_name+ "--"+gr4.u_usergroup_name+"---" + gr4.u_usergroup_id);	
                    }
                }
            }
            i++;
        } while (UsergrpsID);
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
        ErrorTable.u_table = "SecurityGroups";
        ErrorTable.u_email_status = "Not Processed";
        ErrorTable.u_description = xmlDoc.getNodeText('//faultstring');
        ErrorTable.u_error_msg = responseBody;
        ErrorTable.u_request_type = "New User Request";
        ErrorTable.insert();
    }
}

var endOfSoapCall = new GlideDateTime();
var diff = gs.dateDiff(startOfSoapCall, endOfSoapCall, true);
var duration = Math.round(diff / 60) + 1;
gs.log("Prolog User(US) :: SecurityGroup Duration (In Minutes) : " + duration);
updateInactiveRecords(duration);

var ScheduleJob = new GlideRecord('sysauto_script');
ScheduleJob.get('name', 'Prolog_UserRequest_GetPortfolios_UK');
ScheduleJob.query();
if (ScheduleJob.next()) {
    SncTriggerSynchronizer.executeNow(ScheduleJob);
}

function updateInactiveRecords(duration) {
    var minutes = duration;
    var encodedQuery = 'u_active=true^sys_updated_onRELATIVELE@minute@ago@' + minutes;
    var inactiveRecord = new GlideRecord('u_prolog_user_inactive_entries');
    var gr5 = new GlideRecord('u_prolog_securitygroups');
    gr5.addQuery('u_environment', environment);
    //gr5.addQuery('u_portfolio_name', 'WHHS'); 
    gr5.addQuery('u_portfolio_name', 'NOT IN', failedSecuritySoapCallUS);
    gr5.addEncodedQuery(encodedQuery);
    gr5.query();
    //gs.log("Prolog User-1: Inactive Record Row Count: "+ gr5.getRowCount() );
    if (gr5.getRowCount() >= 1) {
        while (gr5.next()) {
            gr5.u_active = false;
            gr5.update();
            inactiveRecord.initialize();
            inactiveRecord.u_environment = environment;
            inactiveRecord.u_entity = "Security Group";
            inactiveRecord.u_portfolio_name = gr5.u_portfolio_name;
            inactiveRecord.u_entity_name = gr5.u_usergroup_name;
            inactiveRecord.u_time_stamp = gs.nowDateTime().toString();
            inactiveRecord.u_guid = gr5.u_usergroup_id;
            inactiveRecord.insert();
        }
    }
}