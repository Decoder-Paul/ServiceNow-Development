createRITMS();
//Create RITMs under same SC Request in workflow
function createRITMS() {

  //var data = JSON.stringify(current.variables.json_data.toString());
  workflow.scratchpad.json = JSON.parse(current.variables.json_data);
  var parsedData = workflow.scratchpad.json;

  //  var parsedData = JSON.parse(data);


  var parsedLength = parsedData.length;


  var fieldName = ["swap_date", "data_sample_needed", "customer_type", "project_number", "deployment_type", "request_type", "customer_name", "customer_location", "building_floor_workstation", "lob", "serial_number", "asset_tag", "model", "old_serial_number", "old_asset_tag", "old_model", "old_state", "old_substate", "software_needed", "notification"];


  if (parsedData.length >= 1) {


    for (var j = 0; j < parsedLength - 1; j++) {


      var requestHelper = new GlideappCalculationHelper();
      requestHelper.addItemToExistingRequest(current.request, current.cat_item, '1');

      var reqItem = new GlideRecord('sc_req_item');
      reqItem.addQuery('request', current.request);
      reqItem.addQuery('cat_item', current.cat_item);
      reqItem.addQuery('parent', '');
      reqItem.orderByDesc('sys_created_on');
      reqItem.query();

      if (reqItem.next()) {

        reqItem.variables.requested_by = current.variables.requested_by;
        reqItem.variables.requested_for = current.variables.requested_for;
        reqItem.variables.requestors_address = current.variables.requestors_address;
        reqItem.variables.requestedfor_alt_contact = current.variables.requestedfor_alt_contact;
        reqItem.variables.location = current.variables.location;
        reqItem.variables.contact_type = current.variables.contact_type;
        reqItem.variables.requestfor_currentlocation = current.variables.requestfor_currentlocation;
        reqItem.variables.phone = current.variables.phone;
        reqItem.variables.req_line_of_business = current.variables.req_line_of_business;
        reqItem.variables.manager = current.variables.manager;

        var objKeys = Object.keys(parsedData[j]);
        //var i in objKeys
        for (var i = 0; i < fieldName.length; i++) {

          reqItem.variables[fieldName[i]] = parsedData[j][objKeys[i]].value;

        }

        reqItem.update();
      }
    }
  }
}

