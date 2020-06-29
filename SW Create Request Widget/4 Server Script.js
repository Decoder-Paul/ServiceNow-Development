(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
  data.user_id = $sp.getParameter('sysparm_user_id');
  data.user_name = gs.getUser().getUserByID(data.user_id).getRecord().getValue('name');
  data.categoryQuery = new createRequestUtils().getCategories('5dbdd8cedb88030005af3ebf9d9619d3', data.user_id);
  if(input.field_change=="category_sel"){
    data.catItemQuery = new createRequestUtils().getCatItems(input.category_sys_id, data.user_id);
  }
})();