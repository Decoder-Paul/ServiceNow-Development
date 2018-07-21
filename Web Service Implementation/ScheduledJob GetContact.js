var gr1 = new GlideRecord('u_ritm0_626623_portfolios_1');
gr1.addQuery('u_environment', gs.getProperty('prolog_us_environment'));
gr1.orderBy('u_portfolioname');
gr1.query();
while (gr1.next()) {
    var PortfolioName = gr1.u_portfolioname;
    var CompanyName;
    var ContactName;
    var ContactID;
    var CompanyGUID;
    var ContactEmail;
    var LocationGUID;
    var Location;
    var PortfolioNameCdata = '<![CDATA[' + PortfolioName.toString() + ']]>';

    var gr2 = new GlideRecord('u_prolog_contacts');
    try {
        var SoapMessage = new sn_ws.SOAPMessageV2('Prolog_UserRequest_GetContact_US', 'QueryServiceSoap.ExecuteDynamicQueryOnPortfolio');
        SoapMessage.setStringParameterNoEscape('portfolio_name', PortfolioNameCdata);

        var response = SoapMessage.execute();
        var responseBody = response.getBody();
        var status = response.getStatusCode();
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);

        var gr3 = new GlideRecord('u_prolog_contacts');
        gr3.orderBy('u_portfolio_name');
        gr3.addQuery('u_portfolio_name', PortfolioName);
        gr3.query();
        var CompKey1 = [];
        var CompKey2 = [];
        var CompKey3 = [];
        var arrayUtil = new ArrayUtil();
        while (gr3.next()) {
            CompKey1.push(gr3.u_company_name + ":" + gr3.u_contact_name + ":" + gr3.u_contact_id + ":" + gr3.u_company_guid);
        }
        var i = 1;
        do {
            CompanyName = xmlDoc.getNodeText("//Table[" + i + "]//Company.Name");
            ContactName = xmlDoc.getNodeText("//Table[" + i + "]//Contacts.DisplayName");
            ContactID = xmlDoc.getNodeText("//Table[" + i + "]//Contacts.ContactID");
            CompanyGUID = xmlDoc.getNodeText("//Table[" + i + "]//Company.GUID");
            ContactEmail = xmlDoc.getNodeText("//Table[" + i + "]//Contacts.Email");
            LocationGUID = xmlDoc.getNodeText("//Table[" + i + "]//Addresses.GUID");
            Location = xmlDoc.getNodeText("//Table[" + i + "]//Addresses.NameOfLocation");
            CompKey2 = CompanyName + ":" + ContactName + ":" + ContactID + ":" + CompanyGUID;
            var keyLOB2 = '';
            if (!CompanyName) {
                if (i <= 1) {
                    if (!(arrayUtil.contains(CompKey1, CompKey2))) //checking whether duplicate record is there in the servicenow table
                    {
                        if (!(arrayUtil.contains(CompKey3, CompKey2))) //checking whether duplicate record is there in the incoming XML
                        {
                            gr2.initialize();
                            gr2.u_environment = gs.getProperty('prolog_us_environment');
                            gr2.u_portfolio_name = PortfolioName;
                            gr2.u_status = status;
                            gr2.u_company_name = CompanyName;
                            gr2.u_contact_id = ContactID;
                            gr2.u_contact_name = ContactName;
                            gr2.u_company_guid = CompanyGUID;
                            gr2.u_location_guid = LocationGUID;
                            gr2.u_name_of_location = Location;
                            gr2.u_email_address = ContactEmail;
                            gr2.insert();
                            CompKey3.push(CompanyName + ":" + ContactName + ":" + ContactID + ":" + CompanyGUID);
                            break;
                        }
                    } else break;
                }
            } else {
                if (!(arrayUtil.contains(CompKey1, CompKey2))) {
                    if (!(arrayUtil.contains(CompKey3, CompKey2))) {
                        gr2.initialize();
                        gr2.u_environment = gs.getProperty('prolog_us_environment');
                        gr2.u_portfolio_name = PortfolioName;
                        gr2.u_status = status;
                        gr2.u_company_name = CompanyName;
                        gr2.u_contact_id = ContactID;
                        gr2.u_contact_name = ContactName;
                        gr2.u_company_guid = CompanyGUID;
                        gr2.u_location_guid = LocationGUID;
                        gr2.u_name_of_location = Location;
                        gr2.u_email_address = ContactEmail;
                        gr2.insert();
                        CompKey3.push(CompanyName + ":" + ContactName + ":" + ContactID + ":" + CompanyGUID);
                    }
                }
            }
            i++;
        } while (CompanyName);
    } catch (ex) {
        var message = ex.getMessage();
    }
    if (status != 200) {
        var ErrorTable = new GlideRecord('u_prolog_error');
        ErrorTable.initialize();
        ErrorTable.u_environment = gs.getProperty('prolog_us_environment');
        ErrorTable.u_portfolio = PortfolioName;
        ErrorTable.u_status = status;
        ErrorTable.u_table = "Contacts";
        ErrorTable.u_email_status = "Not Processed";
        ErrorTable.u_description = xmlDoc.getNodeText('//faultstring');
        ErrorTable.u_error_msg = responseBody;
        ErrorTable.u_request_type = "New User Request";
        ErrorTable.insert();
    }
}