function onCondition() {
    var s = g_form.getValue('json_data');
        if(s!=''){
        var sHTML = "<h4>User Entered Information</h4>";
        sHTML += "<table id='tableData'>";
        sHTML += "<thead>";
            sHTML += "<tr>";
                sHTML += "<th rowspan='2'>Sr.</th>";
                sHTML += "<th rowspan='2'>New / Existing</th>";
                sHTML += "<th rowspan='2'>PU&nbsp;Change&nbsp;Type</th>";
                sHTML += "<th rowspan='2'>Performance Unit</th>";
                sHTML += "<th rowspan='2'>Performance&nbsp;Unit&nbsp;Description</th>";
                sHTML += "<th rowspan='2'>PU&nbsp;Start&nbsp;or End Date</th>";
                sHTML += "<th rowspan='2'>Service Center</th>";
                sHTML += "<th rowspan='2'>Allocation PU</th>";
                sHTML += "<th rowspan='2'>PCCA Rate</th>";
                sHTML += "<th rowspan='2'>Federal PU</th>";
                sHTML += "<th rowspan='2'>Projects Assigned</th>";
                sHTML += "<th rowspan='2'>People Assigned</th>";
                sHTML += "<th rowspan='2'>Country(s)</th>";
                sHTML += "<th rowspan='2'>Global Cross Charging</th>";
                sHTML += "<th colspan='5'>Segment Reporting (Hierarchy Assignments)</th>";
            sHTML += "</tr>";
            sHTML += "<tr>";
                sHTML += "<th>Line of Business</th>";
                sHTML += "<th>Business Unit</th>";
                sHTML += "<th>Region</th>";
                sHTML += "<th>Sub Region&nbsp;1</th>";
                sHTML += "<th>Sub Region&nbsp;2</th>";
            sHTML += "</tr>";
        sHTML += "</thead>";
        sHTML += "<tbody>";
        var jObj = JSON.parse(s);
        for(var i=0; i < jObj.length ; i++){
            sHTML += "<tr>";
                sHTML += "<td>"+jObj[i].serialKey+"</td>";
                sHTML += "<td>"+jObj[i].field1+"</td>";
                sHTML += "<td>"+jObj[i].field2+"</td>";
                sHTML += "<td>"+jObj[i].field3+"</td>";
                sHTML += "<td>"+jObj[i].field4+"</td>";
                sHTML += "<td>"+jObj[i].field5+"</td>";
                sHTML += "<td>"+jObj[i].field6+"</td>";
                sHTML += "<td>"+jObj[i].field7+"</td>";
                sHTML += "<td>"+jObj[i].field8+"</td>";
                sHTML += "<td>"+jObj[i].field9+"</td>";
                sHTML += "<td>"+jObj[i].field10+"</td>";
                sHTML += "<td>"+jObj[i].field11+"</td>";
                sHTML += "<td>"+jObj[i].field12+"</td>";
                sHTML += "<td>"+jObj[i].field13+"</td>";
                sHTML += "<td>"+jObj[i].field14+"</td>";
                sHTML += "<td>"+jObj[i].field15+"</td>";
                sHTML += "<td>"+jObj[i].field16+"</td>";
                sHTML += "<td>"+jObj[i].field17+"</td>";
                sHTML += "<td>"+jObj[i].field18+"</td>";
            sHTML +="</tr>";
        }
        sHTML += "</tbody></table>";
        document.getElementById("d1v1").innerHTML=sHTML;
        }
        //console.log("decoder"+s);
    }