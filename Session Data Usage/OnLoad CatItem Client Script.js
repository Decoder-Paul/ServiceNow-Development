function onLoad() {
    try {
        // Get the session data
        // var component_link_json = g_user.getClientData('lds_itp_request_link');
        var ga = new GlideAjax("RequestLinkSessionManager");
        ga.addParam("sysparm_name", "getComponentSessionValueMapJSON");
        ga.getXML(parseAjaxResponse);
    } catch (e) {
        console.error("There was an error parsing the request link data: " + e);
    }
    // GlideAjax response handler
    function parseAjaxResponse(response) {
        var ans = response.responseXML.documentElement.getAttribute("answer");
        // Get the response and parse it into an object
        ans = JSON.parse(ans);
        g_form.setValue('requested_for', ans.opened);
    }
}