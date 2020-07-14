var environment = gs.getProperty('prolog_us_environment');
var startOfSoapCall = new GlideDateTime();
var failedContactSoapCallUS = [];
var gr1 = new GlideRecord('u_prolog_user_portfolios');
gr1.addQuery('u_environment', environment);
gr1.addQuery('u_active', true);
//gr1.addQuery('u_portfolio_name', '!=', 'ArgonneOPM');
gr1.orderBy('u_portfolio_name');
gr1.query();
var grandTotal = 0;
var grandEmpty = 0;
while (gr1.next()) { // for each portfolio
    var TotalIncomingRows = 0;
    var emptyLocationRows = 0;
    var contactIDs = 0;
    var locationIDs = 0;
    var logTracker = gr1.u_portfolio_name;
    var PortfolioName = gr1.u_portfolio_name;
    var CompanyName;
    var ContactName;
    var ContactID;
    var CompanyGUID;
    var ContactEmail;
    var LocationGUID;
    var Location;
    var PortfolioNameCdata = '<![CDATA[' + PortfolioName.toString() + ']]>';
    var gr2 = new GlideRecord('u_prolog_contacts');
    var isMoreRecords = true;
    var nStartCounter = 0;
    var counter = true;
    gs.log("US GetContact:: Portfolio Name : " + logTracker, 'GetContact');
    while (isMoreRecords) {
        try {
            var SoapMessage = new sn_ws.SOAPMessageV2('Prolog_UserRequest_GetContact_US', 'QueryServiceSoap.ExecuteDynamicQueryOnPortfolio');
            SoapMessage.setStringParameterNoEscape('portfolio_name', PortfolioNameCdata);
            SoapMessage.setStringParameterNoEscape('first_record_number', nStartCounter);
            SoapMessage.setStringParameterNoEscape('isDistinct', 'true');
            //SoapMessage.setStringParameterNoEscape('Start', nStartCounter);
            var response = SoapMessage.execute();
            var responseBody = response.getBody();
            var status = response.getStatusCode();
            if (response.haveError()) {
                failedContactSoapCallUS.push(PortfolioName);
                throw response.getErrorMessage();
            }
            var xmlDoc = new XMLDocument2();
            xmlDoc.parseXML(responseBody);

            var oTotalRowsCntNode = xmlDoc.getNode('//TotalRowsCount');
            var noTotalRowsCnt = 0;
            if (oTotalRowsCntNode != null) {
                noTotalRowsCnt = parseInt(oTotalRowsCntNode.getTextContent());
            }
            nStartCounter += 5000;

            if (noTotalRowsCnt < nStartCounter) {
                isMoreRecords = false;
            }
            if (counter) {
                TotalIncomingRows = noTotalRowsCnt;
                grandTotal += TotalIncomingRows;
                counter = false;
            }
            var oTableNodes = xmlDoc.getNode('//NewDataSet');
            var oTableIter = oTableNodes.getChildNodeIterator();
            var nIndex = 1;
            while (oTableIter.hasNext()) {
                var oTableNode = oTableIter.next();
                CompanyName = xmlDoc.getNodeText("//Table[" + nIndex + "]//Company.Name");
                CompanyGUID = xmlDoc.getNodeText("//Table[" + nIndex + "]//Company.GUID");

                ContactName = xmlDoc.getNodeText("//Table[" + nIndex + "]//Contacts.DisplayName");
                ContactID = xmlDoc.getNodeText("//Table[" + nIndex + "]//Contacts.ContactID");
                ContactEmail = xmlDoc.getNodeText("//Table[" + nIndex + "]//Contacts.Email");

                Location = xmlDoc.getNodeText("//Table[" + nIndex + "]//Addresses.NameOfLocation");
                LocationGUID = xmlDoc.getNodeText("//Table[" + nIndex + "]//Addresses.GUID");

                if (ContactID != null) {
                    contactIDs++;
                    var gr3 = new GlideRecord('u_prolog_contacts');
                    gr3.addEncodedQuery('u_environment=' + environment + '^u_portfolio_name=' + PortfolioName + '^u_contact_id=' + ContactID);
                    gr3.query();
                    if (gr3.next()) {
                        //					gr3.u_company_name = CompanyName;
                        //					gr3.u_company_guid = CompanyGUID;
                        //					gr3.u_location_guid = LocationGUID;
                        //					gr3.u_name_of_location = Location;
                        //					gr3.u_contact_name = ContactName;
                        gr3.u_email_address = ContactEmail;
                        gr3.u_active = true;
                        gr3.setForceUpdate(true);
                        gr3.update();
                    }
                    else {//--> if the record doesn't exist create a new record
                        gr2.initialize();
                        gr2.u_environment = environment;
                        gr2.u_portfolio_name = PortfolioName;
                        gr2.u_company_name = CompanyName;
                        gr2.u_company_guid = CompanyGUID;
                        gr2.u_contact_id = ContactID;
                        gr2.u_contact_name = ContactName;
                        gr2.u_email_address = ContactEmail;
                        gr2.u_location_guid = LocationGUID;
                        gr2.u_name_of_location = Location;
                        gr2.u_source = "Prolog";
                        gr2.insert();
                    }
                }// Contact Id is null so checking company Guid is there
                else {
                    if (CompanyGUID != null && LocationGUID != null) {
                        locationIDs++;
                        var gr4 = new GlideRecord('u_prolog_contacts');
                        gr4.addEncodedQuery('u_environment=' + environment + '^u_portfolio_name=' + PortfolioName + '^u_contact_idISEMPTY' + '^u_company_guid=' + CompanyGUID + '^u_location_guid=' + LocationGUID);
                        gr4.query();
                        if (gr4.next()) {
                            gr4.u_company_name = CompanyName;
                            gr4.u_name_of_location = Location;
                            gr4.u_active = true;
                            gr4.setForceUpdate(true);
                            gr4.update();
                        }
                        else {
                            gr2.initialize();
                            gr2.u_environment = environment;
                            gr2.u_portfolio_name = PortfolioName;
                            gr2.u_company_name = CompanyName;
                            gr2.u_company_guid = CompanyGUID;
                            gr2.u_contact_id = ContactID;
                            gr2.u_contact_name = ContactName;
                            gr2.u_email_address = ContactEmail;
                            gr2.u_location_guid = LocationGUID;
                            gr2.u_name_of_location = Location;
                            gr2.u_source = "Prolog";
                            gr2.insert();
                        }
                    }
                    else {
                        emptyLocationRows++;
                        // gs.log("US GetContact:: "+PortfolioName+" : "+CompanyGUID+" : "+LocationGUID,'EmptyLocation');
                    }
                }
                nIndex++;
            }
        }

        catch (ex) {
            //var message = ex.getMessage();
            gs.log("US GetContact :: Catch Block Error : " + ex, 'GetContact');
            isMoreRecords = false;
            break;
        }
    }
    if (status != 200) {
        var ErrorTable = new GlideRecord('u_prolog_error');
        ErrorTable.initialize();
        ErrorTable.u_environment = environment;
        ErrorTable.u_portfolio = PortfolioName;
        ErrorTable.u_status = status;
        ErrorTable.u_table = "Contacts";
        ErrorTable.u_email_status = "Not Processed";
        ErrorTable.u_description = xmlDoc.getNodeText('//faultstring');
        ErrorTable.u_error_msg = responseBody;
        ErrorTable.u_request_type = "New User Request";
        ErrorTable.insert();
    }
    grandEmpty += emptyLocationRows;
    gs.log("US GetContact:: Total Incoming : " + TotalIncomingRows, logTracker);
    gs.log("US GetContact:: Empty Rows--------- : " + emptyLocationRows, logTracker);
    gs.log("US GetContact:: Contact IDs-------- : " + contactIDs, logTracker);
    gs.log("US GetContact:: Location IDs------- : " + locationIDs, logTracker);
}
var grandEndOfSoapCall = new GlideDateTime();
var grandDiff = gs.dateDiff(startOfSoapCall, grandEndOfSoapCall, true);
var granduration = Math.round(grandDiff / 60) + 1;
gs.log("US GetContact:: Grand Duration (In Mints) : " + granduration, 'GetContact');
gs.log("US GetContact:: Grand Total Incoming : " + grandTotal, 'GetContact');
gs.log("US GetContact:: Grand Empty Rows--------- : " + grandEmpty, 'GetContact');
updateInactiveRecords(granduration);

var ScheduleJob = new GlideRecord('sysauto_script');
ScheduleJob.get('name', 'Prolog_UserRequest_GetSecurityGroups_US');
ScheduleJob.query();
if (ScheduleJob.next()) {
    SncTriggerSynchronizer.executeNow(ScheduleJob);
}

function updateInactiveRecords(duration) {
    var minutes = duration;
    var encodedQuery = 'u_active=true^sys_updated_onRELATIVELE@minute@ago@' + minutes;
    //	var inactiveRecord = new GlideRecord('u_prolog_user_inactive_entries');
    var gr5 = new GlideRecord('u_prolog_contacts');
    gr5.addQuery('u_environment', environment);
    //	gr5.addQuery('u_portfolio_name', 'SMG_Non_Federal_2017');
    gr5.addQuery('u_portfolio_name', 'NOT IN', failedContactSoapCallUS);
    gr5.addEncodedQuery(encodedQuery);
    gr5.query();
    gs.log("US Records made Inactive (Project Contacts) : " + gr5.getRowCount(), "GetContact");
    if (gr5.getRowCount() >= 1) {
        gr5.u_active = false;
        gr5.updateMultiple();
    }
}