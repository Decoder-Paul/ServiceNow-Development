////////////////////////////////////////////////////////////////
//Client Side: Dialog box with choices
////////////////////////////////////////////////////////////////
function cancelDialog(){

   var gm = new GlideModal('cancelTask');
   //Sets the dialog title
   gm.setTitle('Cancel Task');
   //Set up valid custom HTML to be displayed
   gm.renderWithContent('<div style="padding:15px"><p>What action do you want to take?</p><p><select name="cancellation" id="taskCancellation" class="form-control"><option value="cancelOnly" role="option">Cancel this task but keep the requested item open</option><option value="cancelAll" role="option">Cancel this and all other tasks, closing the requested item</option></select></p><div style="padding:5px;float:right"><button style="padding:5px;margin-right:10px" onclick="window.changeTaskAction(this.innerHTML,jQuery(\'#taskCancellation\').val())" class="btn btn-default">Abort</button><button style="padding:5px" class="btn btn-primary" onclick="window.changeTaskAction(this.innerHTML,jQuery(\'#taskCancellation\').val())">Cancel Task</button></div></div>');

   //We'll use the windows object to ensure our code is accessible from the modal dialog
   window.changeTaskAction = function(thisButton, thisAction){

      //Close the glide modal dialog window
      gm.destroy();

      //Submit to the back-end
      if(thisButton=='Cancel Task'){
         if(thisAction=="cancelAll"){
            g_form.setValue('state',4);//Closed Incomplete -- will close the Requested Item and all other open tasks
         }else{
            g_form.setValue('state',7);//Closed Skipped -- will only close this task
         }
         //Regular ServiceNow form submission
         gsftSubmit(null, g_form.getFormElement(), 'cancel_sc_task');
      }
   };
   return false;//prevents the form from submitting when the dialog first load
}

////////////////////////////////////////////////////////////////
//Server Side: Dialog box with choices
////////////////////////////////////////////////////////////////
if (typeof window == 'undefined')
   updateTask();

function updateTask(){
   //Runs on the server
      if(current.state==7){
      //closed skipped so simply update this one record
      current.update();
   }else{
      //closed incomplete so update all associated records to close the requested item entirely
      current.update();

      //And now we'll cancel any other open tasks along with the requested item
      if(!gs.nil(current.parent)){
         //Close siblings
         var otherTasks = new GlideRecord('sc_task');
         otherTasks.addEncodedQuery('request_item='+current.request_item+'^stateIN-5,1,2');
         otherTasks.query();
         while(otherTasks.next()){
            otherTasks.state = '4';
            otherTasks.update();
         }
         //Close parent
         var ritm = new GlideRecord('sc_req_item');
         if(ritm.get(current.parent)){
            ritm.state = '4';
            ritm.stage = 'Cancelled';
            ritm.update();
         }
      }
   }
}