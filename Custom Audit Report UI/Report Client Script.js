$(document).ready(function () {
	$('#btnDownload').click(function () {
		$("#examples").tableToCSV({
			filename: 'Jacobs Hardware Audit Report'
		});
	});
	$("#btnDownloadExcel").click(function () {
		$("#examples").table2excel({
			// exclude CSS class
			//exclude: ".noExl",
			name: "Hardware",
			filename: "Jacobs Hardware Audit Report", //do not include extension
			fileext: ".xls" // file extension
		});
	});
	document.getElementById("loader").style.display = 'none';
	//fetchreport();
});

function fetchreport() {
	if (document.getElementById('location_sys_id').value != '') {
		document.getElementById("RMSreport").innerHTML = '';
		document.getElementById("loader").style.display = 'block';
		document.getElementById("RMSreport").style.display = 'none';
		document.getElementById("btns").style.display = 'none';
		setTimeout(fetchreport1, 3000);
	} else {
		alert('Please select atleast one Location is required');
		document.getElementById("btns").style.display = 'none';
		document.getElementById("RMSreport").style.display = 'none';
	}
}

function fetchreport1() {

	var slocation = document.getElementById('location_sys_id').value;
	var sFrom = document.getElementById('fromDate').value;
	var sTo = document.getElementById('toDate').value;

	var variable = "hw_serial_number,hw_asset_tag,mi_field,mi_value,mi_field_value,hw_assigned_to,hw_install_status,hw_location,mi_sys_updated_by,mi_sys_updated_on";
	var variablevalue = variable.split(",");
	var variablelabel = "S.No,Serial Number,Asset tag,Field Name,Old Value,New Value,Assigned To,State,Location,Updated By,Updated Date";
	//alert(query);

	var ajax = new GlideAjax('get_jacobs_catalog_items');
	ajax.addParam('sysparm_name', 'getHardwareAuditRecords');
	ajax.addParam('sysparm_fields', variablevalue.toString());
	ajax.addParam('sysparm_location', slocation);
	ajax.addParam('sysparm_From', sFrom);
	ajax.addParam('sysparm_To', sTo);

	ajax.getXMLWait();
	var s = ajax.getAnswer();
	//alert(s);

	var sHTML = '';
	sHTML += "<table id='examples' class='display' style='width:100% ;table-layout: auto;'>";
	sHTML += "<thead>";
	sHTML += "<tr>";
	var variableNames = "counter,hw_serial_number,hw_asset_tag,mi_field,mi_value,mi_field_value,hw_assigned_to,hw_install_status,hw_location,mi_sys_updated_by,mi_sys_updated_on";

	var sWidth = "50,200,100,100,400,400,50,50,500,50,50";

	variablevalue = variableNames.split(",");
	var labels = variablelabel;
	var label = labels.split(",");
	var widthSplit = sWidth.split(",");
	for (var y = 0; y < label.length; y++) {
		sHTML += "<th style='width:" + widthSplit[y] + "px' align='center'>" + label[y] + "</th>";
		//   sHTML += "<th align='center'>" + label[y] + "</th>";
	}
	sHTML += "</tr>";
	sHTML += "</thead>";
	sHTML += "<tbody>";
	//var json = new JSON();
	var jObj = JSON.parse(s);
	for (var i = 0; i < jObj.length; i++) {
		sHTML += "<tr>";
		for (var z = 0; z < variablevalue.length; z++) {

			if (jObj[i][variablevalue[z]] == null) {
				sHTML += "<td></td>";
			} else {
				//sHTML += "<td>"+jObj[i][variablevalue[z]]+"</td>";
				if (z == 1) {

					sHTML += "<td><a href='https://" + this.location.host + "/alm_hardware.do?sysparm_query=serial_number%3D" + jObj[i][variablevalue[z]] + "' target='_blank'>" + jObj[i][variablevalue[z]] + "</a></td>";
				} else if (variablevalue[z] == "mi_value") {
					var Old = jObj[i][variablevalue[z]].toString();
					var oldValue = Old.split(":");
					sHTML += "<td>" + oldValue[1] + "</td>";
				} else if (variablevalue[z] == "mi_field_value") {
					var New = jObj[i][variablevalue[z]].toString();
					var newValue = New.split(":");
					sHTML += "<td>" + newValue[1] + "</td>";
				} else {
					sHTML += "<td>" + jObj[i][variablevalue[z]] + "</td>";
				}
			}
		}
		sHTML += "</tr>";
		//}
	}
	sHTML += "</tbody>";
	sHTML += "</table>";

	document.getElementById("RMSreport").innerHTML = sHTML;
	document.getElementById("loader").style.display = 'none';
	document.getElementById("RMSreport").style.display = 'block';
	document.getElementById("btns").style.display = 'block';
}