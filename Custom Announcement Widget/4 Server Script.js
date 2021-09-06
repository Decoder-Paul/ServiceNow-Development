//options are being populated by each instance options variables
if (!options.table) {
  options.table = "kb_knowledge";
}
if (!options.filter) {
  options.filter = "workflow_state=published^kb_category=0a212a76db98c30005af3ebf9d961955";
}
options.access = true;

data.list = [];
//data.table='kb_knowledge';

//kb_category=d9204b994fa32a0026547f75f110c7f3 Announcement category under IT knowledge base;
var gr = new GlideRecord(options.table);
gr.addEncodedQuery("workflow_state=published^kb_knowledge_base.sys_id=a7e8a78bff0221009b20ffffffffff17^kb_category=b85c6552ff0131009b20ffffffffffd4");
gr.orderByDesc('sys_created_on');
//gr.setLimit(5);
gr.query();
while (gr.next()) {
  var test = {};
  test.display_field = gr.short_description.getDisplayValue();
  test.sys_id = gr.sys_id.getDisplayValue();
  //data.list.push(gr.getValue('short_description'));
  test.url = "?id=kb_article&sys_id=" + test.sys_id;
  //data.url="?id=kb_article&sys_id="+record.sys_id;
  data.list.push(test);
}