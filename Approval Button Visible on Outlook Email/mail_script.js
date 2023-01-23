(function runMailScript(current, template, email, email_action, event) {
  var gr = new GlideRecord('u_od');
  gr.get(current.document_id);
  var arr = JSON.parse(gr.u_approvers);
  arr = arr.map(function (i) { return i.value; });
  var DocOwner = getDocOwner(gr.getValue('u_requester'));
  email.addAddress("cc", DocOwner.email, DocOwner.name);

  email.setFrom("Me-OD Case");

  var approverNo = arr.indexOf(current.getValue('approver'));
  var approveCC = DocOwner.email + ';';
  var rejectCC = approveCC;
  gs.addInfoMessage(rejectCC);

  if (approverNo != 0) {
    for (var i = 0; i < approverNo; i++) {
      var user = new GlideRecord('sys_user');
      user.get(arr[i]);
      rejectCC += user.email.getDisplayValue() + ';';
      // 			email.addAddress("cc", user.email, user.name);
    }
  }
  var instance = gs.getProperty('instance_name');
  var approveSubject = "Digital OD " + current.document_id.u_number + " – V " + current.document_id.u_version + " – " + current.document_id.u_title + " – approved";
  var approveBody = "Dear " + DocOwner.name + ",\n\n" +
    "I approve the Digital OD " + current.document_id.u_number + " – V " + current.document_id.u_version + " – " + current.document_id.u_title + " publication.\n\n" +
    "Thanks\n\n" +
    "Regards\n\n" +
    current.approver.getDisplayValue() + "\n\n\n\n\n\n\n\n\n\n\n" + email.watermark;
  template.print('<br><a href="mailto:' + instance + '@service-now.com?subject=' + encodeURIComponent(approveSubject) + '&body=' + encodeURIComponent(approveBody) + '&cc=' + approveCC + '" style="background: #1faf1f; border: 1px solid #000000; font-family: tahoma; font-weight: 900; letter-spacing: 1px; font-size: 14px; mso-height-rule: exactly; padding-block: 7px; text-align: center; text-decoration: none; border-radius: 3px; font-weight: 900;cursor:pointer;"> &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ffffff">Approve</span>&nbsp;&nbsp;&nbsp;&nbsp;</a>&nbsp;&nbsp;&nbsp;');

  var rejectSubject = "Digital OD " + current.document_id.u_number + " – V " + current.document_id.u_version + " – " + current.document_id.u_title + " – rejected";
  var rejectBody = "Dear " + DocOwner.name + ",\n\n" +
    "I reject the Digital OD " + current.document_id.u_number + " – V " + current.document_id.u_version + " – " + current.document_id.u_title + " publication because....\n\n" +
    "Thanks\n\n" +
    "Regards\n\n" +
    current.approver.getDisplayValue() + "\n\n\n\n\n\n\n\n\n\n\n" + email.watermark;

  template.print('<a href="mailto:' + instance + '@service-now.com?subject=' + encodeURIComponent(rejectSubject) + '&body=' + encodeURIComponent(rejectBody) + '&cc=' + rejectCC + '" style="background: #ff4500; border: 1px solid #000000; font-family: tahoma; font-weight: 900; letter-spacing: 1px; font-size: 14px; mso-height-rule: exactly; padding-block: 7px; text-align: center; text-decoration: none; border-radius: 3px; font-weight: 900;cursor:pointer;"> &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ffffff">Reject</span>&nbsp;&nbsp;&nbsp;&nbsp;</a>');

  template.print('<br><br><br><p>Regards</p>' + DocOwner.name);
  function getDocOwner(docOwner) {
    if (docOwner.includes('(')) {
      var i = docOwner.indexOf('(');
      docOwner = docOwner.slice(0, i).trim();

      if (docOwner.includes(',')) {
        docOwner = docOwner.split(',');
        var lname = docOwner[0].trim();
        var fname = docOwner[1].trim();
        var user = new GlideRecord('sys_user');
        user.addQuery('first_name', fname);
        user.addQuery('last_name', lname);
        user.query();
        if (user.next()) {
          return { email: user.email.getDisplayValue() + ';', name: user.getValue('name') };
        }
      } else {
        docOwner = docOwner.split(' ');
        lname = docOwner[0].trim();
        fname = docOwner[1].trim();
        user = new GlideRecord('sys_user');
        user.addQuery('first_name', fname);
        user.addQuery('last_name', lname);
        user.query();
        if (user.next()) {
          return { email: user.email.getDisplayValue(), name: user.getValue('name') };
        }
      }
    } else if (docOwner.includes('@')) {
      docOwner = docOwner.match(/\S+@\S+/gi)[0].trim();
      user = new GlideRecord('sys_user');
      user.addEncodedQuery('emailLIKE' + docOwner);
      user.query();
      if (user.next()) {
        return { email: user.email.getDisplayValue(), name: user.getValue('name') };
      }
    }
    else {
      if (docOwner.includes(',')) {
        docOwner = docOwner.split(',');
        lname = docOwner[0].trim();
        fname = docOwner[1].trim();
        user = new GlideRecord('sys_user');
        user.addQuery('first_name', fname);
        user.addQuery('last_name', lname);
        user.query();
        if (user.next()) {
          return { email: user.email.getDisplayValue(), name: user.getValue('name') };
        }
      }
    }
    return '';
  }
})(current, template, email, email_action, event);