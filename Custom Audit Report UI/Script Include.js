var get_jacobs_catalog_items = Class.create();
get_jacobs_catalog_items.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  getCatalogItems: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('sc_cat_item');
    oGR.addEncodedQuery('type!=bundle^sys_class_name!=sc_cat_item_guide^type!=package^sys_class_name!=sc_cat_item_content^active=true^category!=b0fdfb01932002009ca87a75e57ffbe9^ORcategory=NULL^category!=e15706fc0a0a0aa7007fc21e1ab70c2f^ORcategory=NULL^category!=b3ecbbbf47700200e90d87e8dee49081^ORcategory=NULL^category!=00728916937002002dcef157b67ffb6d^ORcategory=NULL^name!=undefined^ORname=NULL^name!=Test Time^ORname=NULL^name!=Tag Testing^ORname=NULL^category!=95fc11615f1211001c9b2572f2b477c6^ORcategory=NULL');

    oGR.query();
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["last_request_date"] = this.getRecentSRCreateDate(oGR.sys_id.toString());
      oRecValues["assignment_groups"] = this.getAssignmentGroups(oGR.sys_id.toString());
      oRet.push(oRecValues);
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },
  getRecentSRCreateDate: function (pCatalogItem) {

    var oGRSRItem = new GlideRecord('sc_req_item');
    oGRSRItem.addQuery('cat_item', pCatalogItem);
    oGRSRItem.orderByDesc('sys_created_on');
    oGRSRItem.setLimit(1);
    oGRSRItem.query();
    var sRetCreateDate = '';
    if (oGRSRItem.next()) {
      sRetCreateDate = oGRSRItem.sys_created_on.toString();
    }
    return sRetCreateDate;

  },
  getAssignmentGroups: function (pCatalogItem) {

    var oGRSRItem = new GlideRecord('sc_req_item');
    oGRSRItem.addQuery('cat_item', pCatalogItem);
    oGRSRItem.addQuery('active', 'false');
    oGRSRItem.addQuery('stage', 'complete');
    oGRSRItem.addQuery('state', '3');
    oGRSRItem.orderByDesc('sys_created_on');
    oGRSRItem.setLimit(1);
    oGRSRItem.query();
    var sAssignmentGroups = '';
    if (oGRSRItem.next()) {
      var oGRCTask = new GlideRecord('sc_task');
      oGRCTask.addQuery('request_item', oGRSRItem.sys_id);
      oGRCTask.query();
      while (oGRCTask.next()) {
        if (oGRCTask.reassignment_count == 0) {
          if (sAssignmentGroups == '') {
            sAssignmentGroups += oGRCTask.number.toString() + ":" + oGRCTask.assignment_group.getDisplayValue();
          } else {
            sAssignmentGroups += '<BR>' + oGRCTask.number.toString() + ":" + oGRCTask.assignment_group.getDisplayValue();
          }
        } else {
          var oGRHist = new GlideRecord('sys_audit');
          oGRHist.addQuery('tablename', 'sc_task');
          oGRHist.addQuery('fieldname', 'assignment_group');
          //oGRHist.addQuery('record_checkpoint','1');
          oGRHist.addQuery('documentkey', oGRCTask.sys_id);
          oGRHist.orderBy('sys_created_on');
          oGRHist.setLimit(1);
          oGRHist.query();
          //gs.sleep(300);
          if (oGRHist.next()) {
            if (sAssignmentGroups == '') {
              sAssignmentGroups = oGRCTask.number.toString() + ":" + this.getGroupName(oGRHist.getValue('oldvalue'));
            } else {
              sAssignmentGroups += '<BR>' + oGRCTask.number.toString() + ":" + this.getGroupName(oGRHist.getValue('oldvalue'));
            }
          }
        }
      }
    }
    return sAssignmentGroups;
  },
  getGroupName: function (groupSys_id) {
    var oGroupName = new GlideRecord('sys_user_group');
    oGroupName.addQuery('sys_id', groupSys_id);
    oGroupName.query();
    if (oGroupName.next()) {
      return oGroupName.name;
    }
    return '';
  },

  getCatalogTasksWithReassign: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    var sCatalogItem = this.getParameter('sysparm_catalog_item').toString();
    var sReport_From_Date = this.getParameter('sysparm_from_date').toString();

    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('sc_task');
    oGR.addEncodedQuery("reassignment_count>0^request_item.cat_item=" + sCatalogItem + "^active=false^opened_at>=javascript:gs.dateGenerate('" + sReport_From_Date + "','00:00:00')");
    //oGR.setLimit(10);
    oGR.orderByDesc('reassignment_count');
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["counter"] = nCounter;
      oRecValues["assignment_groups"] = this.getReAssignmentGroups(oGR.sys_id.toString(), oGR.getElement('assignment_group').getDisplayValue());
      oRet.push(oRecValues);
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },

  getReAssignmentGroups: function (pCatalogIask_SysId, pGroupName) {

    var oGRHist = new GlideRecord('sys_audit');
    oGRHist.addQuery('tablename', 'sc_task');
    oGRHist.addQuery('fieldname', 'assignment_group');
    //oGRHist.addQuery('record_checkpoint','1');
    oGRHist.addQuery('documentkey', pCatalogIask_SysId);
    oGRHist.orderBy('sys_created_on');
    oGRHist.query();
    var sAssignmentGroups = '';
    //gs.sleep(300);
    var nCounter = 1;
    while (oGRHist.next()) {
      if (sAssignmentGroups == '') {
        sAssignmentGroups = nCounter + '. ' + this.getGroupName(oGRHist.getValue('oldvalue')).toString();
      } else {
        sAssignmentGroups += '<BR>' + nCounter + '. ' + this.getGroupName(oGRHist.getValue('oldvalue')).toString();
      }
      nCounter++;
    }
    //sAssignmentGroups+='<BR>'+ pGroupName;
    return sAssignmentGroups;
  },

  getReferenceTableRecordsCount: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    var sTable = this.getParameter('sysparm_table_name').toString();

    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('sys_dictionary');
    oGR.addEncodedQuery('reference=' + sTable + '^active=true');
    //oGR.setLimit(10);
    oGR.orderBy('name');
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      var oGRAgg = new GlideAggregate(oGR.name.toString());
      oGRAgg.addEncodedQuery(oGR.element.toString() + 'ISNOTEMPTY');
      oGRAgg.addAggregate('COUNT');
      oGRAgg.query();
      if (oGRAgg.next()) {
        if (oGRAgg.getAggregate('COUNT') > 0) {
          oRecValues['table'] = oGR.getElement('name').getDisplayValue();
          oRecValues['field'] = oGR.getElement('element').getDisplayValue();
          oRecValues['count'] = oGRAgg.getAggregate('COUNT');
          oRecValues["counter"] = nCounter;
          oRet.push(oRecValues);
          nCounter++;
        }
      }
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },

  getECRActiveRITMS: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    //var sCatalogItem=this.getParameter('sysparm_catalog_item').toString();
    //var sReport_From_Date=this.getParameter('sysparm_from_date').toString();
    var sFrom = this.getParameter('sysparm_From').toString();
    var sTo = this.getParameter('sysparm_To').toString();

    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('sc_req_item');
    //oGR.addEncodedQuery("active=true^request.requested_for.u_ecr=true^sys_id=486956ffdb68c490fad9797a8c96195c");
    //oGR.addEncodedQuery("active=true^request.requested_for.u_ecr=pending");
    oGR.addEncodedQuery('active=false^cat_item=a868cc6edbf0f34061a31be31596197c^state=3');
    oGR.orderByDesc('sys_created_on');
    oGR.chooseWindow(sFrom, sTo);
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["counter"] = nCounter;
      oRecValues["variables"] = this.getVariables(oGR.sys_id.toString());
      oRet.push(oRecValues);
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },

  getVariables: function (pSsys_Id) {
    var reqitem = new GlideRecord('sc_req_item');
    reqitem.addQuery("sys_id", pSsys_Id);
    reqitem.query();
    var sHTML = '';
    var sHTML1 = '';
    while (reqitem.next()) {
      // Get Owned Variables for Requested Item and sort by Order
      var ownvar = new GlideRecord('sc_item_option_mtom');
      ownvar.addQuery('request_item.number', reqitem.number);
      ownvar.addQuery('sc_item_option.item_option_new.visible_summary', true);
      ownvar.addQuery('sc_item_option.value', '!=', '');
      ownvar.orderBy('sc_item_option.order');
      ownvar.query();
      sHTML = '<table>';
      sHTML1 = '';
      while (ownvar.next()) {
        // Add Question, Answer and Order into notification mail
        // Set variable v to variable name
        var field = ownvar.sc_item_option.item_option_new;
        var fieldValue = ownvar.sc_item_option.item_option_new.name;

        // Print variable name
        //sHTML+= '<tr><td><b>' + field.getDisplayValue() + '</b></td>' + '<BR>';
        sHTML1 += field.getDisplayValue() + ':';

        // Print Display Value for each variable in Requested Item
        if (!JSUtil.nil(reqitem.variables[fieldValue].getDisplayValue())) {
          //sHTML+='<td>'+reqitem.variables[fieldValue].getDisplayValue() + "</td></tr>";
          sHTML1 += reqitem.variables[fieldValue].getDisplayValue() + "\n";
        } else {
          //sHTML+= "<td></td></tr>";
          sHTML1 += "\n";
        }
      }
      //sHTML+='</table>';
      sHTML1 += '\n';
    }
    return sHTML1;
  },


  getECRIncidentTickets: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    var sIncident = this.getParameter('sysparm_Incident').toString();
    sIncident = sIncident == null ? '' : sIncident;
    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('incident');
    if (sIncident != '') {
      oGR.addQuery('number', sIncident);
    } else {
      //oGR.addEncodedQuery("active=true^request.requested_for.u_ecr=true^sys_id=486956ffdb68c490fad9797a8c96195c");
      oGR.addEncodedQuery("numberININC0807515,INC0910883,INC0920907,INC0959016,INC0959852,INC0965591,INC0970669,INC0980426,INC0982435,INC0987447,INC0989079,INC0999756,INC1000514,INC1004845,INC1006777,INC1034721,INC1040621,INC1048161,INC1051950,INC1059182,INC1070614,INC1070917,INC1074252,INC1076293,INC1078029,INC1079851,INC1082124,INC1086405,INC1087700,INC1093283,INC1098128,INC1102223,INC1108220,INC1109881,INC1115873,INC1117639,INC1118823,INC1118883,INC1122337,INC1124425,INC1125874,INC1128214,INC1131576,INC1131863,INC1133791,INC1133989,INC1134409,INC1135220,INC1137171,INC1142087,INC1146123,INC1146860,INC1167750,INC1168674,INC1169341,INC1171261,INC1175053,INC1178238,INC1185987,INC1191436,INC1192677,INC1199446,INC1200383,INC1201517,INC1202065,INC1202161,INC1202683,INC1203263,INC1204607,INC1207253,INC1207898,INC1208814,INC1210956,INC1212447,INC1212557,INC1213536,INC1215886,INC1216294,INC1216962,INC1218001,INC1229997,INC1230845,INC1231756,INC1233486,INC1233586,INC1234424,INC1238429,INC1238793,INC1239199,INC1240409,INC1241053,INC1241169,INC1242312,INC1243720,INC1243821,INC1246027,INC1248156,INC1248880,INC1249466,INC1251285,INC1253472,INC1254769,INC1254839,INC1256053,INC1256527,INC1258645,INC1258677,INC1258919,INC1259656,INC1260706,INC1260807,INC1261339,INC1263948,INC1264095,INC1267997,INC1268840,INC1270542,INC1270566,INC1273210,INC1273273,INC1273904,INC1274051,INC1274388,INC1274504,INC1275945,INC1277071,INC1277376,INC1277994,INC1278059,INC1278888,INC1279354,INC1280337,INC1281886,INC1281905,INC1281980,INC1282450,INC1283778,INC1284361,INC1284800,INC1285410,INC1286519,INC1287522,INC1287530,INC1287725,INC1287947,INC1288510,INC1289575,INC1290310,INC1291674,INC1291837,INC1291910,INC1292846,INC1293559,INC1293588,INC1294481,INC1295687,INC1295717,INC1296200,INC1297909,INC1298070,INC1298495,INC1298536,INC1300139,INC1300389,INC1300561,INC1300993,INC1301276,INC1302071,INC1302310,INC1302536,INC1302631,INC1302787,INC1303654,INC1304081,INC1304795,INC1304844,INC1304953,INC1305799,INC1306525,INC1308265,INC1308336,INC1308384,INC1308631,INC1309736,INC1311328,INC1311487,INC1311577,INC1311592,INC1311620,INC1311635,INC1311734,INC1311819,INC1313217,INC1313870,INC1314019,INC1314355,INC1314510,INC1314658,INC1314712,INC1315032,INC1315973,INC1316088,INC1316171,INC1316863,INC1317520,INC1317589,INC1318033,INC1318257,INC1318283,INC1318541,INC1318667,INC1318829,INC1319041,INC1319220,INC1319239,INC1320234,INC1320649,INC1320812,INC1321149,INC1321368,INC1321430,INC1321442,INC1321880,INC1322627,INC1322656,INC1323062,INC1323527,INC1324144,INC1324202,INC1324511,INC1324542,INC1324887,INC1324946,INC1325192,INC1325228,INC1325341,INC1325418,INC1325484,INC1325685,INC1325750,INC1325754,INC1325841,INC1326133,INC1326150,INC1326324,INC1326505,INC1326657,INC1327074,INC1327127,INC1327180,INC1327199,INC1327326,INC1327875,INC1328065,INC1328096,INC1328251,INC1328355,INC1328497,INC1328686,INC1329455,INC1329491,INC1329552,INC1329820,INC1330055,INC1330493,INC1330663,INC1331478,INC1331520,INC1331648,INC1331737,INC1332065,INC1332068,INC1332398,INC1332610,INC1332686,INC1332955,INC1333051,INC1333065,INC1333231,INC1334464,INC1334606,INC1334725,INC1334776,INC1335374,INC1335413,INC1335555,INC1335692,INC1336004,INC1336125,INC1336305,INC1336852,INC1336984,INC1337142,INC1337162,INC1337199,INC1338384,INC1338466,INC1338517,INC1338675,INC1338946,INC1339057,INC1339192,INC1339234,INC1339303,INC1339390,INC1339769,INC1339847,INC1339853,INC1339887,INC1339964,INC1340071,INC1340120,INC1340470,INC1340680,INC1340996,INC1341009,INC1341267,INC1341291,INC1341347,INC1341856,INC1341990,INC1342806,INC1342985,INC1343012,INC1343031,INC1343032,INC1343049,INC1343056,INC1343057,INC1343165,INC1343176,INC1343464,INC1343652,INC1344448,INC1345068,INC1345663,INC1345900,INC1346637,INC1346643,INC1346751,INC1347232,INC1347835,INC1347879,INC1348074,INC1348258,INC1348589,INC1348936,INC1349906,INC1350004,INC1350163,INC1350763,INC1350939,INC1351181,INC1351213,INC1351674,INC1352018,INC1352044,INC1352526,INC1353208,INC1353270,INC1353365,INC1353425,INC1353440,INC1353952,INC1354136,INC1354240,INC1354318,INC1354564,INC1354718,INC1354757,INC1355103,INC1355519,INC1356811,INC1356985,INC1357091,INC1357098,INC1358229,INC1359038,INC1359662,INC1361410,INC1361424,INC1361784,INC1362080,INC1362084,INC1362316,INC1362324,INC1362586,INC1363645,INC1363746,INC1363837,INC1364212,INC1364998,INC1365235,INC1365384,INC1365822,INC1366004,INC1366521,INC1368448,INC1369003,INC1369118,INC1369377,INC1369404,INC1369406,INC1371041,INC1371473,INC1371964,INC1372887,INC1373187,INC1373446,INC1373671,INC1373842,INC1374506,INC1374547,INC1375846,INC1376092,INC1376259,INC1377497,INC1377546,INC1377726,INC1377828,INC1378092,INC1378439,INC1378763,INC1379169,INC1379190,INC1379433,INC1379754,INC1380559,INC1380797,INC1380924,INC1381034,INC1381216,INC1381500,INC1381785,INC1382151,INC1382295,INC1383014,INC1383032,INC1383156,INC1383696,INC1383760");
      oGR.orderByDesc('sys_created_on');
    }
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["counter"] = nCounter;
      var sComments = '';
      var oComments = oGR.comments.getJournalEntry(-1);
      //stores each entry into an array of strings
      var oCom = oComments.split("\n\n");

      for (var nIndex1 = 0; nIndex1 < oCom.length; nIndex1++) {
        //if(oCom[nIndex1].indexOf('[cid:image)')==-1){
        sComments += oCom[nIndex1] + "<BR>";
        //}
      }

      oRecValues["comments"] = sComments;

      var sWork_notes = '';
      var oWork_notes = oGR.work_notes.getJournalEntry(-1);
      //stores each entry into an array of strings
      var oWork = oWork_notes.split("\n\n");

      for (var nIndex2 = 0; nIndex2 < oWork.length; nIndex2++) {
        //if(oWork[nIndex2].indexOf('[cid:image)')==-1){
        sWork_notes += oWork[nIndex2] + "<BR>";
        //}
      }

      oRecValues['work_notes'] = sWork_notes;

      oRet.push(oRecValues);
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },

  getEndPointPurchaseRequestRecords: function () {
    var sFields = this.getParameter('sysparm_fields').toString();


    var oFields = sFields.split(",");
    var oRet = [];
    var oGR = new GlideRecord('sc_req_item');

    //	oGR.addEncodedQuery('cat_item=6e4e0abd0f24b6443fc3f08ce1050e4b^sys_created_onONThis month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()^approval!=rejected');
    //cat_item=6e4e0abd0f24b6443fc3f08ce1050e4b^approval!=rejected^sys_created_onBETWEENjavascript:gs.dateGenerate('2020-01-01','00:00:00')@javas//cript:gs.dateGenerate('2020-01-09','23:59:59')


    //var sParm_email=this.getParameter('sysparm_email').toString();
    //sParm_email=sParm_email==null?'':sParm_email;
    //if(sParm_email=='')	{
    var sFromDate = this.getParameter('sysparm_From').toString();
    var sToDate = this.getParameter('sysparm_To').toString(); oGR.addEncodedQuery("cat_item=6e4e0abd0f24b6443fc3f08ce1050e4b^approval!=rejected^sys_created_onBETWEENjavascript:gs.dateGenerate('" + sFromDate + "','00:00:00')@javascript:gs.dateGenerate('" + sToDate + "','23:59:59')");
    /*}else{
      oGR.addEncodedQuery("cat_item=6e4e0abd0f24b6443fc3f08ce1050e4b^approval!=rejected^sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()");
    }*/
    oGR.orderByDesc('sys_created_on');
    //oGR.chooseWindow(sFrom, sTo);
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        //gs.log('field names:'+oFields[nIndex],'fdt');

        if (oFields[nIndex] == "variables.epoint_purchase_pcsc" || oFields[nIndex] == "variables.project_number") {
          var recdata = oGR.getElement('variables.epoint_purchase_pcsc') == null ? '' : oGR.getElement('variables.epoint_purchase_pcsc').getDisplayValue(); if (recdata == "") {
            recdata = oGR.getElement('variables.project_number') == null ? '' : oGR.getElement('variables.project_number').getDisplayValue();
          }
          oRecValues['variables.epoint_purchase_pcsc'] = recdata;
        } else {
          oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]) == null ? '' : oGR.getElement(oFields[nIndex]).getDisplayValue();
        }
      }
      //oRecValues["counter"]=nCounter;
      //oRecValues["variables"]=this.getEndpointVariables(oGR.sys_id.toString(),oRecValues);
      oRet.push(oRecValues);
      // gs.log('field values:'+JSON.stringify(oRecValues),'fdt');
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },

  getPPERequestRecords: function () {
    var sFields = this.getParameter('sysparm_fields').toString();

    var oFields = sFields.split(",");
    var a = [];
    var oGR = new GlideRecord('sc_req_item');

    var sFromDate = this.getParameter('sysparm_From').toString();
    var sToDate = this.getParameter('sysparm_To').toString();

    oGR.addEncodedQuery("cat_item=d1ee3f95db43a34061a31be31596194b^approval!=rejected^sys_created_onBETWEENjavascript:gs.dateGenerate('" + sFromDate + "','00:00:00')@javascript:gs.dateGenerate('" + sToDate + "','23:59:59')");

    oGR.orderByDesc('sys_created_on');
    oGR.query();
    while (oGR.next()) {
      a.push(oGR.sys_id.toString());
      //	 gs.log('ritms info:' + oGR.sys_id.toString(), "fdt");
    }

    var sets = [];
    var oGRCVS = new GlideRecord("io_set_item");
    oGRCVS.addQuery('sc_cat_item', 'd1ee3f95db43a34061a31be31596194b');
    oGRCVS.orderBy('variable_set');
    oGRCVS.query();
    while (oGRCVS.next()) {
      sets.push(oGRCVS.variable_set.internal_name);
      // gs.log('variable sets info:' + sets, "fdt");
    }

    var oRet = [];
    for (var i = 0; i < a.length; i++) {
      var req_item = new GlideRecord('sc_req_item');
      if (req_item.get(a[i])) {
        for (var s = 0; s < sets.length; s++) {
          var rowcount = req_item.variables[sets[s]].getRowCount();
          for (var j = 0; j < rowcount; j++) {
            var oRecValues = {};
            var row = req_item.variables[sets[s]].getRow(j);
            //	 gs.log('MRVS line items info:' + row, "fdt");

            for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
              var variables = req_item.variables[oFields[nIndex]].getDisplayValue();
              if (variables != undefined) {
                oRecValues[oFields[nIndex]] = variables;
              } else {
                var rec;
                if (oFields[nIndex] == 'project') {
                  rec = row[oFields[nIndex]]; oRecValues['project'] = rec;
                }
                else if (oFields[nIndex] == 'project_no' && rec == '') {
                  var jacProj = new GlideRecord('u_jacobs_projects');
                  jacProj.get(row[oFields[nIndex]]);
                  rec = jacProj.u_project_number.toString();
                  oRecValues['project'] = rec;
                }
                else {
                  //  gs.log('row fields info:' + row[oFields[nIndex]], "fdt");
                  oRecValues[oFields[nIndex]] = row[oFields[nIndex]];
                  if (JSUtil.nil(row[oFields[nIndex]])) {
                    var fieldValues = oFields[nIndex].toString();
                    oRecValues[oFields[nIndex]] = req_item.getDisplayValue(fieldValues);
                  }
                }
              }
            }
            oRet.push(oRecValues);
            // gs.log('field values:'+JSON.stringify(oRecValues),'fdt');
          }
        }
      }
    }
    var json = new JSON();
    var data = json.encode(oRet);
    return data;
  },
  getHardwareAuditRecords: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    var slocation = this.getParameter('sysparm_location').toString();
    var sFromDate = this.getParameter('sysparm_From').toString();
    var sToDate = this.getParameter('sysparm_To').toString();
    //  gs.log('location:' + slocation, 'fdt');

    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('u_assethistory_location_state_assignedto');
    //  oGR.addEncodedQuery("hw_location=" + slocation + "^mi_sys_created_onON+s_created_date+@javascript:gs.dateGenerate('" + s_created_date + "','start')@javascript:gs.dateGenerate('" + s_created_date + "','end')");


    oGR.addEncodedQuery("hw_location=" + slocation + "^mi_sys_created_onBETWEENjavascript:gs.dateGenerate('" + sFromDate + "','00:00:00')@javascript:gs.dateGenerate('" + sToDate + "','23:59:59')");

    oGR.orderBy('hw_serial_number');
    //oGR.chooseWindow(sFrom, sTo);
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["counter"] = nCounter;
      oRet.push(oRecValues);
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    // gs.log('json data info:'+oData,'fdt');
    return oData;
  },

  getServiceNowMSPCatalogTasks: function () {
    var sFields = this.getParameter('sysparm_fields').toString();
    //var sCatalogItem=this.getParameter('sysparm_catalog_item').toString();
    var sReport_From_Date = this.getParameter('sysparm_from_date').toString();

    var oFields = sFields.split(",");
    //gs.addInfoMessage(vari.length);
    //gs.addInfoMessage(ar);
    var oRet = [];
    var oGR = new GlideRecord('sc_task'); oGR.addEncodedQuery("assignment_group=78760089dbfe8f84340b3ebd7c9619a3^request_item.cat_item=16b198170fbaf100dcc800dce1050e26^sys_created_on>=javascript:gs.dateGenerate('" + sReport_From_Date + "','00:00:00')");
    //oGR.setLimit(10);
    oGR.orderByDesc('sys_created_on');
    oGR.query();
    var nCounter = 1;
    while (oGR.next()) {
      //gs.print(it.sys_id);
      //oRet.push(oGR.sys_id.toString());
      var oRecValues = {};
      for (var nIndex = 0; nIndex < oFields.length; nIndex++) {
        //oRet.push(oGR.getElement(oFields[nIndex]).getDisplayValue());
        oRecValues[oFields[nIndex]] = oGR.getElement(oFields[nIndex]).getDisplayValue();
      }
      oRecValues["counter"] = nCounter;
      oRecValues["assignment_group_date"] = this.getMSPAssignmentGroup(oGR.sys_id.toString(), oGR.getElement('assignment_group'));
      oRecValues["assigned_to_date"] = this.getMSPAssignedTo(oGR.sys_id.toString(), oRecValues["assignment_group_date"]);
      var sDuration = gs.dateDiff(oRecValues["assignment_group_date"], oRecValues["assigned_to_date"]);
      oRecValues["time_taken"] = sDuration;

      oRet.push(oRecValues);
      nCounter++;
    }
    var oJSON = new JSON();
    var oData = oJSON.encode(oRet);
    return oData;
  },
  getMSPAssignmentGroup: function (pCatalogIask_SysId, pGroup) {

    var oGRHist = new GlideRecord('sys_audit');
    oGRHist.addQuery('tablename', 'sc_task');
    oGRHist.addQuery('fieldname', 'assignment_group');
    oGRHist.addQuery('newvalue', pGroup);
    oGRHist.addQuery('documentkey', pCatalogIask_SysId);
    oGRHist.orderBy('sys_created_on');
    oGRHist.query();
    //gs.sleep(300);
    var nCounter = 1;
    if (oGRHist.next()) {
      return oGRHist.sys_created_on.getDisplayValue();
    }
    //sAssignmentGroups+='<BR>'+ pGroupName;
    return '';
  },
  getMSPAssignedTo: function (pCatalogIask_SysId, dSys_created_on) {

    var oGRHist = new GlideRecord('sys_audit');
    oGRHist.addQuery('tablename', 'sc_task');
    oGRHist.addQuery('fieldname', 'assigned_to');
    //oGRHist.addQuery('record_checkpoint','1');
    oGRHist.addQuery('documentkey', pCatalogIask_SysId);
    //oGRHist.addQuery('sys_created_on','>=',dSys_created_on);
    oGRHist.addEncodedQuery("sys_created_on>=javascript:gs.dateGenerate('" + dSys_created_on + "')");
    oGRHist.orderBy('sys_created_on');
    oGRHist.query();
    //gs.sleep(300);
    var nCounter = 1;
    if (oGRHist.next()) {
      return oGRHist.sys_created_on.getDisplayValue();
    }
    //sAssignmentGroups+='<BR>'+ pGroupName;
    return '';
  },


  type: 'get_jacobs_catalog_items'
});