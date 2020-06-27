//this is an UI Action Script
current.update();
createServiceRequest();
function createServiceRequest() {
    var cart = new Cart();
    var item = cart.addItem('566ccac9dbaaf3000b98e9ec0b961905');
    cart.setVariable(item, 'it_request_for_information', current.short_description);
    cart.setVariable(item, 'requested_for', current.opened_for);
    cart.setVariable(item, 'u_contact_type', current.type);
    //cart.setVariable(item, 'login', current.user_name);
    var cartGR = cart.getCart();
    cartGR.requested_for = current.opened_for;
    cartGR.update();


    var newSerReq = cart.placeOrder();
	newSerReq.request_state = 'closed_complete';
    //newSerReq.update();
	var gr = new GlideRecord('interaction_related_record');
	gr.initialize();
	gr.document_table = "sc_request";
	gr.document_id = newSerReq.sys_id;
	gr.interaction = current.sys_id;
	gr.type = "task";
	gr.insert();
	
// function getRITM() {
//     var ritm = '';
//     var grRITM = new GlideRecord('sc_request');
//     grRITM.addQuery('request', newSerReq.sys_id);
//     grRITM.query();
//     if (grRITM.next()) {
//         //ritm = grRITM.sys_id;
// 		grRITM.request_state = "closed_complete";
// 		grRITM.update();
//     }
//     return ritm;
// }
    var disMessage = 'created request: ' + newSerReq.number;
	var id = newSerReq.sys_id;
    gs.addInfoMessage(disMessage);
    //action.setRedirectURL(newSerReq);
    //action.setReturnURL(current);
	action.setRedirectURL(current);

}