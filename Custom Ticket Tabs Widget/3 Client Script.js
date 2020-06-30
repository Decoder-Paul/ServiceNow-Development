function ($scope, spUtil, $location) {
  var c = this;
  $scope.$on('data_table.click', function (e, parms) {
    var p = 'ticket';
    if (parms.table == 'sc_request') {
      p = 'sc_request';
    }
    else if (parms.table == 'sysapproval_approver') {
      p = 'approval'
    }
    var s = { id: p, table: parms.table, sys_id: parms.sys_id, view: 'sp' };
    $location.search(s);
  });

  c.onLoad = function () {
    document.getElementById("req").className = "tablinks active";
    document.getElementById("request").style.display = "block";
  }

  c.openData = function (evt, table_name) {

    if (document.getElementById("toggle").checked) {
      document.getElementById("toggle").click();
    }

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(table_name).style.display = "block";
    evt.currentTarget.className += " active";
  }

  c.updateFilter = function (evt) {

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    var con = document.getElementsByClassName("tablinks active");
    //alert(con[0].name);
    var ID = con[0].id;
    if (ID == 'wtl') {
      ID = 'watch'
    }
    if (ID == 'req') {
      ID = 'request';
    }
    if (ID == 'inc') {
      ID = 'incident';
    }
    if (ID == 'prb') {
      ID = 'problem';
    }
    if (ID == 'chn') {
      ID = 'change';
    }
    if (ID == 'apr') {
      ID = 'approval';
    }
    if (document.getElementById("toggle").checked) {

      ID = ID + '1';

      document.getElementById(ID).style.display = "block";

    }

    if (!document.getElementById("toggle").checked) {

      document.getElementById(ID).style.display = "block";
    }

  }
}



