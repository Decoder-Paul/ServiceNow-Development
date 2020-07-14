// Prolog User Portfolio Scheduled Job
var startOfSoapCall = new GlideDateTime();
var environment = gs.getProperty('prolog_us_environment');
try {
    var SoapMessage = new sn_ws.SOAPMessageV2('Prolog_UserRequest_GetPortfolios_US', 'SiteInformationServiceSoap.GetPortfolios');
    var response = SoapMessage.execute();
    var responseBody = response.getBody();
    var status = response.getStatusCode();
    var xmlDoc = new XMLDocument2();
    xmlDoc.parseXML(responseBody);
    if (response.haveError()) {
        //gs.log("In Error  Block"+ response.haveError()+"----"+response.getErrorMessage(), 22);
        var a1 = response.getErrorMessage();
        //gs.log("In Error  Block"+ typeof a1+"----"+response.getErrorMessage(), 22);
        throw a1;
    }
    if (status == 200) {
        var Portfolio_Name;
        var first_entry_project_name;
        var PortfolioArray = [];
        var arrayUtil = new ArrayUtil();

        var gr1 = new GlideRecord('u_prolog_user_portfolios');
        gr1.addQuery('u_environment', environment);
        gr1.query();
        while (gr1.next()) {
            PortfolioArray.push(gr1.getValue('u_portfolio_name'));
        }

        var i = 1;
        do {
            Portfolio_Name = xmlDoc.getNodeText('//GetPortfoliosResponse//GetPortfoliosResult//PortfolioDescriptor[' + i + ']//PortfolioName'); //Node Value
            first_entry_project_name = xmlDoc.getNodeText('//GetPortfoliosResponse//GetPortfoliosResult//PortfolioDescriptor[' + i + ']//ProjectName');
            if (!Portfolio_Name)
                break;
            else {
                if (!(arrayUtil.contains(PortfolioArray, Portfolio_Name))) {
                    var gr = new GlideRecord('u_prolog_user_portfolios');
                    gr.initialize();
                    gr.u_environment = gs.getProperty('prolog_us_environment');
                    gr.u_portfolio_name = Portfolio_Name;
                    gr.u_project_name_first_entry = first_entry_project_name;
                    gr.insert();
                }
                else {
                    var gr4 = new GlideRecord('u_prolog_user_portfolios');
                    gr4.addQuery('u_environment', environment);
                    gr4.addQuery('u_portfolio_name', Portfolio_Name);
                    gr4.query();
                    while (gr4.next()) {
                        gr4.u_project_name_first_entry = first_entry_project_name;
                        gr4.u_active = true;
                        gr4.setForceUpdate(true);
                        gr4.update();
                    }
                }
            }
            i++;
        }
        while (Portfolio_Name);
    }
}
catch (ex) {

    gs.log("Prolog User(US) :: Catch Block Error : " + ex);
    var d1 = new GlideDateTime();
    d1.addSeconds(19800);
    var parm1 = "US Region--" + d1;
    var parm2_1 = ex;
    var parm2_2 = status;
    var parm2 = parm2_1 + "(Response Code: " + parm2_2 + ").";
    var catchError = "</br>" + "</br>" + "Errror Caught in Catch Block: </br>" + parm2;

    //gs.eventQueue('prolog.serverdown.notification',null, parm1 ,parm2 );

}
var endOfSoapCall = new GlideDateTime();
var diff = gs.dateDiff(startOfSoapCall, endOfSoapCall, true);
var duration = Math.round(diff / 60) + 1;

if (status == 200) {
    gs.log("Prolog User(US) :: Portfolio Duration (In Minutes) : " + duration);
    updateInactiveRecords(duration);

    // Execute the NExt SChedule Job
    var ScheduleJob = new GlideRecord('sysauto_script');
    ScheduleJob.get('name', 'Prolog_UserRequest_GetProjectID_US');
    ScheduleJob.query();
    if (ScheduleJob.next()) {
        SncTriggerSynchronizer.executeNow(ScheduleJob);
    }
}
else {
    var d1 = new GlideDateTime();
    d1.addSeconds(19800);
    //var parm1 = "US Region--"+gs.nowDateTime().toString();
    var parm1 = "Prolog User (US) Soap Call Failure---" + d1;
    //	gs.log(parm1, "20" );
    var faultString = xmlDoc.getNodeText('//faultstring') || responseBody;
    var parm2_0 = "</br> The Scheduled Job for Prolog User Item (US Region) Failed to Execute and the Error Description is given below </br>";
    var parm2_1 = faultString.toString();
    var parm2_2 = status;
    var parm2 = parm2_0 + parm2_1 + "(Response Code: " + parm2_2 + ")." + catchError;
    gs.log("Prolog User(US) ::  Soap Call Failed , The Response Code is: " + status + " and Error Description: " + '"' + faultString + '"');
    gs.eventQueue('prolog.serverdown.notification', null, parm1, parm2);
    var ScheduleJob = new GlideRecord('sysauto_script');
    ScheduleJob.get('name', 'Prolog_UserRequest_GetPortfolios_UK');
    ScheduleJob.query();
    if (ScheduleJob.next()) {
        SncTriggerSynchronizer.executeNow(ScheduleJob);
    }
}
function updateInactiveRecords(duration) {
    var minutes = duration;
    var encodedQuery = 'u_active=true^sys_updated_onRELATIVELE@minute@ago@' + minutes;
    var gr5 = new GlideRecord('u_prolog_user_portfolios');
    var inactiveRecord = new GlideRecord('u_prolog_user_inactive_entries');
    gr5.addQuery('u_environment', environment);
    gr5.addEncodedQuery(encodedQuery);
    gr5.query();
    //gs.log("Naresh-1000 : "+ gr5.getRowCount());
    if (gr5.getRowCount() >= 1) {
        while (gr5.next()) {
            gr5.u_active = false;
            gr5.update();
            inactiveRecord.initialize();
            inactiveRecord.u_environment = environment;
            inactiveRecord.u_portfolio_name = gr5.u_portfolio_name.toString();
            inactiveRecord.u_entity = "Portfolio";
            inactiveRecord.u_entity_name = gr5.u_portfolio_name.toString();
            inactiveRecord.u_guid = "Not-Applicable";
            inactiveRecord.u_time_stamp = gs.nowDateTime().toString();
            inactiveRecord.insert();
        }
    }
}