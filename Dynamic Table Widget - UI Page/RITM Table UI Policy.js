//The following function segregate the GRID based on the task type to show only the specific grid line item to specific task
//It compare the Task sys id available from URL, with the specific object property fetched from g_form->Task Type variable
function onCondition() {
	var s = g_form.getValue('json_data');
	var task_sys_id = getParmVal('sys_id');
	var task_type = JSON.parse(g_form.getValue('sc_task_types'));
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
	if(task_type.GL==task_sys_id){
		buildGrid('NewGL');//newPuType = undefined
	}
	if(task_type.EPM==task_sys_id){
		buildGrid('EPM');//newPuType = undefined
	}
	if(task_type.OHR==task_sys_id){
		buildGrid('Existing','People');
	}
	if(task_type.Project==task_sys_id){
		buildGrid('Existing','Project');
	}
	if(task_type.Service==task_sys_id){
		buildGrid('New','Service');
	}
	function buildGrid(puType,newPuType){
		var jObj = JSON.parse(s);
		for(var i=0; i < jObj.length ; i++){
			if(newPuType==undefined){//Used to print all Line Items
				buildTableData(i,puType);
			}
			else if(jObj[i].field1==puType || (newPuType=='People' && jObj[i].field11=='Yes')){//used to print All Existing PU & only New PU with People Assigned
				buildTableData(i);
			}
			else if(jObj[i].field1==puType || (newPuType=='Project' && jObj[i].field10=='Yes')){//used to print All Existing PU & only New PU with Project Assigned
				buildTableData(i);
			}
			else if(jObj[i].field1==puType && newPuType=='Service' && jObj[i].field6=='Yes'){//used to print only New Pu with Service center
					buildTableData(i);
			}
		}
		sHTML += "</tbody></table>";
		document.getElementById("d1v1").innerHTML=sHTML;
		function buildTableData(i,puType){
			sHTML += "<tr>";
				sHTML += "<td>"+jObj[i].serialKey+"</td>";
				sHTML += "<td>"+jObj[i].field1+"</td>";
				sHTML += "<td>"+jObj[i].field2+"</td>";
				if(jObj[i].field1=="New" && puType=="NewGL"){
					sHTML += "<td onclick=\"promptMessage(this,this.id)\" id="+i+"><a href='#'>"+jObj[i].field3+"</a></td>";
				}
				else{
					sHTML += "<td>"+jObj[i].field3+"</td>";
				}
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
	}
	function getParmVal(name){
		var url = document.URL.parseQuery();
		if(url[name]){
			return decodeURI(url[name]);
		}
		else{
			return;
		}
	}
}