(function execute(inputs, outputs) {
  /*--------------------------------------
  A reusable action for printing any MRVS in notification action in flow-designer
    Input Parameters
      mrvs_data  (string) --> '[{"application_software_access":"COSTAR REM","application_name":"TIM HORTONS - LEASE VIEW"},
                                {"application_software_access":"COSTAR REM","application_name":"POPEYES - LEASE VIEW"}]'
      mrvs_sys_id (string)--> the sys_id of the variable set configured via "Lookup Record Action" which is of reference type
                              input variables for the table "item_option_new"
    Output Parameters
      table (html) --> this can be directly used within the html editor of Notification Action 
  */
  function getVariableDisplayName(item, mrvs){
    var gr = new GlideRecord('item_option_new');
    gr.addEncodedQuery('variable_set='+mrvs+'^name='+item);
    gr.query();
    return gr.next() ? gr.question_text : item;
  }
var table = JSON.parse(inputs.mrvs_data);
var style = "<style>table {border-collapse: collapse;width: 100%;border: 1px solid #dddddd;}td, th {border: 1px solid #dddddd;}</style>";
  var data = style+"<table><thead>";
//headers
  
var headers = "<tr>";
Object.keys(table[0]).forEach(function(item){
	headers += "<th>"+getVariableDisplayName(item, inputs.mrvs_sys_id)+"</th>";
});

headers +="</tr></thead>";
//values
var rows = "<tbody>";
/*  for(var i=0; i<table.length; i++){
  	var row_data = Object.keys(table[i]).map(function(e) {
  		return table[i][e];
	});
    row += "<tr>";
    for(var j = row_data.length-1; j>=0; j--){
      row += "<td>"+row_data[j]+"</td>";
    }
    row += "</tr>";
  }
*/
table.forEach(function(item){
	//array of values of each item
  	var row_data = Object.keys(item).map(function(e) {
  		return item[e];
	});  	
  	rows += "<tr>";
    for(var i=0; i<row_data.length; i++){
      rows += "<td>"+row_data[i]+"</td>";
    }
  	rows += "</tr>";
});
data = data + headers + rows + "</tbody></table>";
outputs.table = data;
})(inputs, outputs);
