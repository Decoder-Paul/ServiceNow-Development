function buildQueryString(){
    var request_type = gel('request_type').value;
    var project_number = gel('project_number').value;
    var client = gel('client').value;
    var project_name = gel('project_name').value;
    var region = gel('region').value;
    var lob = gel('lob').value;
    var select_leading_discipline = gel('select_leading_discipline').value;
    
    var queryString = "cat_item=8973890cdb02a30421544b8b0b9619d4^active=true";

    request_type ${AND} queryString += "^variables.675d6233dbdbabc061a31be3159619af=" + request_type;
    project_number ${AND} queryString += "^variables.3bb440711b69c850d4edeb1dbc4bcbd5=" + project_number;
    client ${AND} queryString += "^variables.4a369bc8db06e30421544b8b0b961962=" + client;
    project_name ${AND} queryString += "^variables.fa565b0cdb06e30421544b8b0b9619c4=" + project_name;
    region ${AND} queryString += "^variables.a696df0cdb06e30421544b8b0b9619b2=" + region;
    lob ${AND} queryString += "^variables.0bb61708db06e30421544b8b0b961925=" + lob;
    select_leading_discipline ${AND} queryString += "^variables.25579b8cdb06e30421544b8b0b96191d=" + select_leading_discipline;
    
    return queryString;
}
var sDom = getQuestionChoices("a696df0cdb06e30421544b8b0b9619b2");// region
gel("region").innerHTML = sDom;
function getQuestionChoices(field){
    var list = [];
    var gr = new GlideRecord('question_choice');
    gr.addQuery("question", field);
    gr.query();
    while(gr.next()){
        list.push({text: gr.text, value: gr.value});
    }

    var dom = "<option value=''>None</option>";
    list.forEach(function(item){
        dom += "<option value='"+item.value+"'>"+item.text+"</option>"
    });
    return dom;
}
<!-- <g:evaluate var="jvar_dom" object="true">
var field = "a696df0cdb06e30421544b8b0b9619b2";
var list = [];
var gr = new GlideRecord('question_choice');
gr.addQuery("question", field);
gr.query();
while(gr.next()){
    list.push({text: gr.text, value: gr.value});
}

var sDom = "<option value=''>None</option>";
list.forEach(function(item){
    sDom += "<option value='"+item.value+"'>"+item.text+"</option>"
});
sDom;
</g:evaluate> -->