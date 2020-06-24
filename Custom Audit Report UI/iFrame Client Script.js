function setLocationFilter() {
    var val = gel("location").value;
    parent.document.getElementById('location_sys_id').value = val;
    // window.parent.postMessage(val, "*");		
}