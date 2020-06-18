// Usage -> QUERY:sys_idINjavascript:getUniqueValue(%274a369bc8db06e30421544b8b0b961962%27)
/* To get the unique value's sys_id of Catalog Item variables data which are basically end user's input.
This function can be Used in Custom Interactive Filter(i.e. CSS Variables Filter) in a Dashboard to fetch unique data for AutoCompleter

Can be used for getting any other Catalog Item  Variable's data */
//-- Naive Approach
function getUniqueValue(variable_sys_id) {
    var values=[];
	var ids = [];
	var a = [];
    var gr = new GlideRecord('sc_item_option');
    gr.addQuery('item_option_new', variable_sys_id);
    gr.orderBy('value');
    gr.query();
    while (gr.next()){
        values.push(gr.getValue('value'));
        ids.push(gr.getValue('sys_id'));
    }
	
    var l = values.length;
    for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            if (values[i] === values[j])
                j = ++i;
        }
        a.push(ids[i]);
    }
    return a;
}
//-- Aggregate Approach
function getUniqueValue(variable_sys_id) {
	var list = [];
	var ga = new GlideAggregate('sc_item_option'); 
	ga.addQuery('item_option_new', variable_sys_id);
	ga.addAggregate('COUNT');
	ga.orderByAggregate('count');
	ga.groupBy('value');
	ga.query();
	while (ga.next()){
		//gs.print(ga.value+" = "+ga.getAggregate('COUNT'));
		var gr = new GlideRecord('sc_item_option');
		gr.addQuery('item_option_new', '4a369bc8db06e30421544b8b0b961962');
		gr.addQuery('value', ga.value);
		gr.setLimit(1);
		gr.query();
		if(gr.next())
			list.push(gr.sys_id);
	}
	return list;
}