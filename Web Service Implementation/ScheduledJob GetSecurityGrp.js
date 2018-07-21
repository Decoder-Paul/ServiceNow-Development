var gr1 = new GlideRecord('u_ritm0_626623_portfolios_1');
gr1.addQuery('u_environment', gs.getProperty('prolog_us_environment'));
gr1.orderBy('u_portfolioname');
gr1.query();
while (gr1.next()) {
    var PortfolioName = gr1.u_portfolioname;
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
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(responseBody);

        var gr3 = new GlideRecord('u_prolog_securitygroups');
        gr3.orderBy('u_portfolio_name');
        gr3.addQuery('u_portfolio_name', PortfolioName);
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
            if (!UsergrpsID) {
                if (i <= 1) {
                    if (!(arrayUtil.contains(CompKey1, CompKey2))) //checking whether duplicate record is there in the servicenow table
                    {
                        if (!(arrayUtil.contains(CompKey3, CompKey2))) //checking whether duplicate record is there in the incoming XML
                        {
                            gr2.initialize();
                            gr2.u_environment = gs.getProperty('prolog_us_environment');
                            gr2.u_portfolio_name = PortfolioName;
                            gr2.u_status = status;
                            gr2.u_usergroup_id = UsergrpsID;
                            gr2.u_usergroup_name = UsergrpsName;
                            gr2.insert();
                            CompKey3.push(UsergrpsID + ":" + UsergrpsName);
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
                        gr2.u_usergroup_id = UsergrpsID;
                        gr2.u_usergroup_name = UsergrpsName;
                        gr2.insert();
                        CompKey3.push(UsergrpsID + ":" + UsergrpsName);
                    }
                }
            }
            i++;
        } while (UsergrpsID);
    } catch (ex) {
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