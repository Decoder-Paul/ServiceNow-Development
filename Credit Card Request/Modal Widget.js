//---------------- HTML Body -----------------
<div style="font-family:SourceSansPro,Helvetica Neue,Arial;font-size:14px;"><strong> Please 
	<a ng-click="c.onOpen()">click here to read the Terms &amp; Conditions 
	</a>
  </strong>
</div>
//--------------- Client Script ----------------
function (spModal,$scope) {
    var c = this;
    c.onOpen = function() {
          c.data.country = $scope.page.g_form.getValue('hr_country');
          c.server.update().then(function(){
         spModal.open({
                   title: 'Please read the terms & conditions till the end',
                   size: 'lg',
                   message: c.data.answer,
                   buttons: [
                       {label:'✘ Don\'t agree' , cancel: true},
                       {label:'✔ I Agree', primary: true}
                   ]
           }).then(function() {
                          c.agree = 'yes';
                          $scope.page.g_form.setValue('checkBox_agreement','true');
          }, function() {
                          alert('Please accept the terms and conditions to continue your order.');
                          $scope.page.g_form.setValue('checkBox_agreement','false');
              c.agree = 'no';
               })
              })
     }
  }
  //--------------- Server Script---------------
  (function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
      data.answer='';
      var gr=new GlideRecord('kb_knowledge');
      gr.addQuery('short_description','STARTSWITH',input.country+" Cardholder");
      gr.addQuery('workflow_state','published');
      gr.addQuery('latest',true);
      gr.query();
      //var answer='';
      if(gr.next()){
          //sHTML=(gr.text);
          data.answer = gr.text.toString();
      }
      //return answer;
  })();
