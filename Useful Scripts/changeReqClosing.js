var change = new GlideRecord('change_request');
change.addEncodedQuery('active=false^stateIN3,4,7');
change.query();
gs.print(change.getRowCount());
while (change.next()) {
    var tsk = new GlideRecord('change_task');
    tsk.addQuery('change_request', change.sys_id);
    tsk.addEncodedQuery('active=true');
    tsk.query();
    if(tsk.getRowCount()){
        while (tsk.next()) {
            gs.print('change having complete tasks: ' + change.number);
            change.active = 'false';
            change.setValue('state', '3');
            //change.autoSysFields(false);
            //change.setWorkflow(false);
            //change.update();

        }
    }
    else{
        gs.print('This Closed change having Zero Active tasks: ' + change.number);
    }
}