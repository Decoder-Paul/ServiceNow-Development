/**
 * Validate the attachments to see if at least
 * one file is attached. Otherwise, show an alert.
 *
 * @returns {Boolean}
 */
function validateAttachment() {
  var form = $('sys_attachment');
  var fileFields = form.select('.attachmentRow');

  for (var i = 0; i < fileFields.size(); i++) {
    if (fileFields[i] && fileFields[i].value != "") {
      setAttachButton(""); //disable
      $('please_wait').style.display = "";
      return true;
    }
  }

  alert("${JS:gs.getMessage('Choose a file to attach')}");
  return false;
}

/**
 * Does the first attachment input field have a value?
 * If not, use the grey button and change type of cursor.
 * @param value
 */
function setDeleteButton(value) {
  var field = $$('.attachmentRow')[0];
  var text = field.select('input')[0];
  var deleteButton = field.select('a.attachfile-delete img')[0];
  if (!text.getValue().empty()) {
    deleteButton.setAttribute('src', 'images/icons/kb_no.gif');
    deleteButton.up().style.cursor = 'pointer';
  } else {
    deleteButton.setAttribute('src', 'images/icons/kb_no_disabled.gif');
    deleteButton.up().style.cursor = 'default';
  }
}


/**
 * If the value passed in is an empty string,
 * set the button to disabled state, otherwise
 * enabled.
 *
 * @param value
 */
function setAttachButton(value) {
  var attachButton = $("attachButton");
  if (value == "")
    attachButton.disabled = "true";
  else
    attachButton.disabled = "";
}

/**
 * This controls the remove button for all attachments.
 * If there are attachments in the list enable the button.
 * Else keep disabled.
 *
 * @param e
 */
function setRemoveButton(e) {
  var removeButton = gel("removeButton");
  var deletedSysIdsElement = gel("deleted_sys_ids");
  var deletedSysIds = new Array();
  var deletedString = deletedSysIdsElement.value;
  if (deletedString)
    deletedSysIds = deletedString.split(";");
  var thisId = e.name.substring(7);
  if (e.checked) {
    removeButton.disabled = "";
    deletedSysIds.push(thisId);
  } else {
    var index = deletedSysIds.indexOf(thisId);
    deletedSysIds.splice(index, 1);

    // are there any left checked?
    var inputs = document.getElementsByTagName("input");
    var nonechecked = true;
    var i = 0;
    while (i < inputs.length && nonechecked) {
      if (inputs[i].type == "checkbox" && inputs[i].name.substring(0, 7) == "sys_id_")
        if (inputs[i].checked)
          nonechecked = false;
      i++;
    }
    if (nonechecked) {
      removeButton.disabled = "true";
    }
  }
  deletedSysIds = deletedSysIds.join(";");
  deletedSysIdsElement.value = deletedSysIds;
}

function startRemoveAttachments() {
  var removeButton = gel("removeButton");
  removeButton.disabled = true;
  gel('please_wait').style.display = "";
  var thisUrl = gel("sysparm_this_url");
  thisUrl.value = "attachment_deleted.do?sysparm_domain_restore=false&sysparm_nostack=yes&sysparm_deleted=" + gel("deleted_sys_ids").value;
  return true;
}

/**
 * Clear and Remove the attachment field that is
 * passed in.
 *
 * @param field_id
 */
function clearAttachmentField(field) {
  var form = $('sys_attachment');
  var fileFields = form.select('.attachmentRow');

  fileFields[0].setAttribute('data-position', 'first');
  if (fileFields.size() > 1 && (field.readAttribute('data-position') != "first")) {

    //check if field you are removing has a 3rd column (does it have an attach button?)
    var needToAttachButton;
    var attachButton = field.select('td')[2];
    if (attachButton)
      needToAttachButton = true;

    //remove the field
    field.remove();

    //if you removed a field with a third column, add an attachbutton onto the new "first" field.
    if (attachButton) {
      var attachButton = new Element('input', {
        "type": "submit",
        "id": "attachButton",
        "disabled": "true",
        "value": "${gs.getMessage('Attach')}"
      });
      var td = new Element('td', { align: 'right' }).update(attachButton);
      Element.extend(td);
      form.select('.attachmentRow').first().select('td')[1].insert({ 'after': td });
    }
  }
  else
    clearFileField(field.select('td').first().select('input').first());
  checkAndSetAttachButton();
}

/**
 * Check all attachment input fields. If there is not attachment
 * currently, disable the attachment button, else enable it.
 *
 * @returns
 */
function checkAndSetAttachButton() {
  var form = $('sys_attachment');
  var fileFields = form.select('.attachmentRow');
  var validFileCount = 0;
  for (var i = 0; i < fileFields.size(); i++) {
    var field = fileFields[i].select('td').first().select('input').first();
    if (field.getValue() != "") {
      if (window.File && window.FileReader && window.FileList)
        validFileCount += validateSizeandExt(field);
      else
        validFileCount += 1;
    }
  }
  if (validFileCount == 0)
    setAttachButton("");
  else
    setAttachButton("true");
}

function validateSizeandExt(field) {
  var form = $('sys_attachment');
  var maxSize = (form.max_size && form.max_size.value) ? form.max_size.value : 0;
  var fileTypes = (form.file_types && form.file_types.value) ? form.file_types.value : "";
  var files = field.files;
  var allowedSize = maxSize * 1048576;
  var warningString = "";
  var checkJEXL = true;

  for (var i = 0; i < files.length; i++) {
    if (checkJEXL && isJEXLExpression(files[i].name)) {
      warningString += files[i].name + "${JS:gs.getMessage(' is an invalid file name.\n')}";
    }

    if (files[i].size > allowedSize && allowedSize != 0)
      warningString += files[i].name + "${JS:gs.getMessage(' is ')}" + getDisplaySize(files[i].size) + "${JS:gs.getMessage('. The maximum file size is ')}" + getDisplaySize(allowedSize) + ".\n";
    if (!isValidFileType(files[i], fileTypes))
      warningString += files[i].name + "${JS:gs.getMessage(' has a prohibited file extension.')}" + "\n";

  }
  if (warningString != "") {
    alert(warningString);
    clearFileField(field);
    return 0;
  }

  return 1;
}

function isJEXLExpression(fileName) {
  var phaseOneOpening = fileName.indexOf("$" + "{");
  var phaseTwoOpening = fileName.indexOf("$" + "[");
  if (phaseOneOpening != -1 || phaseTwoOpening != -1) {
    return true;
  }
  return false;
}

function getDisplaySize(sizeInBytes) {
  var kilobytes = Math.round(sizeInBytes / 1024);
  if (kilobytes < 1)
    kilobytes = 1;
  var reportSize = kilobytes + "K";
  if (kilobytes > 1024)
    reportSize = Math.round(kilobytes / 1024) + "MB";
  return reportSize;
}

function isValidFileType(file, types) {
  var extensions = types || "";
  if (extensions != "") {
    extensions.toLowerCase();
    extensions = extensions.split(",");
    var periodIndex = file.name.lastIndexOf(".");
    var extension = file.name.substring(periodIndex + 1).toLowerCase();
    if (extensions.indexOf(extension) == -1)
      return false;
  }

  return true;
}

/**
 * Clear a given field's contents.
 *
 * @param field
 * 				the field element.
 */
function clearFileField(field) {
  $(field).clear();
  $(field).parentNode.innerHTML = $(field).parentNode.innerHTML;
  checkAndSetAttachButton();
}

/**
 * If the attachments are uploaded, clear any extra attachment input fields so
 * they do not take up as much screen space. Additionally, clear the first field
 * and keep it showing.
 */
function clearAttachmentFields() {
  var form = $('sys_attachment');
  var fileFields = form.select('.attachmentRow');
  for (var i = 0; i < fileFields.size(); i++) {
    if (i == 0)
      clearFileField(fileFields[0].select('td').first().select('input').first());
    if (i > 0)
      fileFields[i].remove();
  }
  checkAndSetAttachButton();
  setDeleteButton();
}

// this get called after an attachment is uploaded to update the display
function refreshAttachments(id, fileName, canDelete, createdBy, createdOn, contentType, encryption, iconPath) {
  refreshLiveFeedAttachments(id, fileName, contentType, iconPath);
  var encryptCheck = gel("encrypt_checkbox");
  if (encryptCheck) {
    encryptCheck.checked = false;
    $('sysparm_encryption_context').value = "";
  }
  gel("please_wait").style.display = "none";

  // if we didn't get an id, we could not read the attachment due to business rules so we're done
  if (typeof id == "undefined")
    return;
  var noAttachments = gel("no_attachments");
  if (noAttachments.style.display == "block")
    noAttachments.style.display = "none";

  // add the new upload to the display
  var table = gel("attachment_table_body");
  var tr = cel("tr");
  var td = cel("td");
  td.style.whiteSpace = "nowrap";
  td.colspan = "2";

  if (canDelete == "true") {
    var input = cel("input");
    var checkId = "sys_id_" + id;
    input.name = checkId;
    input.id = checkId;
    input.type = "checkbox";
    input.onclick = function () { setRemoveButton(gel(checkId)); };
    td.appendChild(input);

    gel("delete_button_span").style.display = "inline";
    var text = document.createTextNode(" ");
    td.appendChild(text);

    input = cel("input");
    input.type = "hidden";
    input.name = "Name";
    input.value = "false";
    td.appendChild(input);
  }
  var attachment_input = cel("input");
  attachment_input.className = "attachment_sys_id";
  attachment_input.type = "hidden";
  attachment_input.id = id;

  td.appendChild(attachment_input);


  var anchor = cel("a");
  anchor.style.marginRight = "4px";
  var thisURL = getCurrentPageURL();
  anchor.href = "sys_attachment.do?sys_id=" + id + "&sysparm_this_url=" + thisURL;
  anchor.title = "${JS:gs.getMessage('Attached by')} " + createdBy + " ${JS:gs.getMessage('on')} " + createdOn;
  anchor.tabIndex = "-1";
  var imgSrc = iconPath;
  if (encryption != "") {
    anchor.title += ", ${JS:gs.getMessage('Encrypted')}: " + encryption;
    imgSrc = "images/icons/attachment_encrypted.gifx";
  }
  var img = cel("img");
  img.src = imgSrc;
  img.alt = anchor.title;
  anchor.appendChild(img);

  var text = $(cel('a'));
  getMessage("Download {0}", function (msg) {
    text.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
  });
  text.href = "sys_attachment.do?sys_id=" + id + "&sysparm_this_url=" + thisURL;
  text.onkeydown = function (event) { return allowInPlaceEditModification(text, event); };
  text.style.marginRight = "5px";
  text.style.maxWidth = "75%";
  text.style.display = "inline-block";
  text.style.overflow = "hidden";
  text.style.verticalAlign = "middle";
  if ('innerText' in text)
    text.innerText = fileName;
  else
    text.textContent = fileName;
  text.setAttribute("data-id", id);
  text.inPlaceEdit({
    selectOnStart: true,
    turnClickEditingOff: true,
    onBeforeEdit: function () {
      text.lastAriaLabel = text.getAttribute("aria-label");
      text.removeAttribute("aria-label");
      text.setAttribute("role", "textbox");
    },
    onEditCancelled: function () {
      text.removeAttribute("role");
      if (text.lastAriaLabel) {
        text.setAttribute("aria-label", text.lastAriaLabel);
      }
    },
    onAfterEdit: function (newName) {
      var oldName = this.oldValue;
      var ga = new GlideAjax('AttachmentAjax');
      ga.addParam('sysparm_type', 'rename');
      ga.addParam('sysparm_value', id);
      ga.addParam('sysparm_name', newName);
      ga.getXML(function (response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer !== '0')
          alert(new GwtMessage().getMessage("Renaming attachment {0} to new name {1} is not allowed", oldName, newName));

        $$('a[data-id="' + id + '"]').each(function (elem) {
          if ('innerText' in elem)
            elem.innerText = (answer === '0') ? newName : oldName;
          else
            elem.textContent = (answer === '0') ? newName : oldName;
        });
        $$('span[data-id="' + id + '"]').each(function (elem) {
          if ('innerText' in elem)
            elem.innerText = (answer === '0') ? newName : oldName;
          else
            elem.textContent = (answer === '0') ? newName : oldName;
        });

        /*
           This routine updates the attachment in the attachment modal AND the same attachment on the parent form
        */
        getMessage(["Download {0}", "View {0}", "Rename {0}"], function (msg) {
          var newDownloadText = new GwtMessage().format(msg["Download {0}"], newName);
          var newViewText = new GwtMessage().format(msg["View {0}"], newName);
          var newRenameText = new GwtMessage().format(msg["Rename {0}"], newName);
          $$('a[data-id="' + id + '"]').each(function (elem) {
            elem.setAttribute("aria-label", newDownloadText);
          })

          $$('.view_' + id).each(function (elem) {
            elem.setAttribute("aria-label", newViewText);
          })

          $$('.rename_' + id).each(function (elem) {
            elem.setAttribute("aria-label", newRenameText);
          })
        })

        text.removeAttribute("role");
      });
    }
  });

  if (contentType == "text/html")
    anchor.target = "_blank";
  td.appendChild(anchor);
  td.appendChild(text);

  var allowRename = gel('ni.show_rename_link').value;
  if (allowRename == "true") {
    var renameAttachment = $(cel('a'));
    renameAttachment.href = "#";
    renameAttachment.setAttribute("role", "button");
    getMessage("Rename {0}", function (msg) {
      renameAttachment.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
    });
    renameAttachment.className = 'attachment rename_' + id;
    renameAttachment.onclick = function () {
      text.beginEdit();
    };
    renameAttachment.innerHTML = '${JS:gs.getMessage("[rename]")}';
    td.appendChild(renameAttachment);
  }

  var showView = gel("ni.show_attachment_view").value;
  if (showView == "true") {
    var blank = document.createTextNode(" ");
    tr.appendChild(blank);
    var view = cel("a");
    view.href = "#";
    var downloadAttachment = NOW && NOW.g_forceDownloadAttachments;
    var setAriaLabel = function (msg) {
      view.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
    };
    if (downloadAttachment)
      getMessage("Download {0}", setAriaLabel);
    else
      getMessage("View {0}", setAriaLabel);
    var newText = document.createTextNode(downloadAttachment ? getMessage("[download]") : getMessage("[view]"));
    view.appendChild(newText);
    view.className = "attachment view_" + id;
    if (showPopup == "false")
      view.href = "sys_attachment.do?sys_id=" + id + "&view=true";
    else
      view.onclick = function () {
        tearOffAttachment(id)
      };
    td.appendChild(blank);
    td.appendChild(view);
  }
  var showPopup = gel("ni.show_attachment_popup").value;
  ///////////////|*******************************************************|////////////////
  //*************| Customised only for Incident Table to add description |*************//
  //*************|_______________________________________________________|************//
  if (g_form.getTableName() == "incident") {

    var attachDesc = $(cel('a'));
    attachDesc.href = "#";
    attachDesc.setAttribute("role", "button");
    getMessage("Description {0}", function (msg) {
      attachDesc.setAttribute("aria-label", new GwtMessage().format(msg, fileName));
    });
    attachDesc.id = "sys_" + id;
    attachDesc.className = 'attachment description_' + id;
    attachDesc.onclick = function () {
      updateDescription(id, fileName);
    };
    attachDesc.innerHTML = '${JS:gs.getMessage("[description]")}';
    td.appendChild(blank);
    td.appendChild(attachDesc);
  }
  //__________________________________________________________________________________//  
  //////////////////////////////////////////////////////////////////////////////////////
  tr.appendChild(td);

  table.appendChild(tr);

  //If a new attachment is added check if attachments are marked for edge encryption before showing the Download all button
  if (!edgeEncryptionEnabledForAttachments && hasAttachments()) {
    gel("download_all_button").style.display = "inline";
  }

  var form_table_id = "";
  if (gel("sys_uniqueValue") || gel("sysparm_attachment_cart_id")) {
    form_table_id = (gel("sys_uniqueValue") || gel("sysparm_attachment_cart_id")).value;
  }
  if (form_table_id && attachmentParentSysId != form_table_id) {
    CustomEvent.fire('record.attachment.uploaded', {
      sysid: id,
      name: fileName,
      hoverText: anchor.title,
      image: imgSrc,
      showRename: allowRename,
      showView: showView,
      showPopup: showPopup
    });
  } else {
    addAttachmentNameToForm(id, fileName, anchor.title, imgSrc, allowRename, showView, showPopup);
  }

  gel("sys_" + id).click();
  if (g_accessibility)
    addInfoAlert(fileName + ' ' + anchor.title);

  $j('#loadFileXml').focus();

}

function addInfoAlert(message) {
  var alert = '<span class="sr-only" role="alert">' + message + '</span>';

  $j('#alert_container span').remove();
  $j('#alert_container').append(alert);
}

function refreshLiveFeedAttachments(sys_id, fileName, contentType, iconPath) {
  var p = gel('live_feed_message_images');
  if (!p)
    return;

  if (!contentType)
    return;

  if (contentType.indexOf('image') != 0 || contentType.indexOf('image/tif') == 0)
    refreshLiveFeedNonImages(p, sys_id, iconPath, fileName);
  else
    refreshLiveFeedImages(p, sys_id, fileName);

  var container = $('live_feed_image_container');
  if (container)
    container.show();

}

function refreshLiveFeedNonImages(p, sys_id, iconPath, fileName) {
  var a = cel('a');
  a.onclick = function () { tearOffAttachment(sys_id) };
  a.title = fileName;
  a.className = "live_feed_attachment_link";

  var img = cel('img');
  img.src = iconPath;
  img.className = 'live_feed_image_thumbnail';
  img.setAttribute("data-sys_id", sys_id);
  a.appendChild(img);
  var span = cel('span');
  span.setAttribute('data-id', sys_id);
  if ('innerText' in span)
    span.innerText = fileName;
  else
    span.textContet = fileName;
  a.appendChild(span);
  p.appendChild(a);
  p.appendChild(cel('br'));
  setTimeout(this.hideLoading.bind(this), 200);
}

function refreshLiveFeedImages(p, sys_id, fileName) {
  var imageName = "sys_attachment.do?sys_id=" + sys_id;
  var a = cel('a');
  a.onclick = function () { tearOffAttachment(sys_id) };
  a.title = fileName;
  a.className = "live_feed_attachment_link";

  var img = cel('img');
  img.src = imageName;
  img.className = 'live_feed_image_thumbnail';
  img.setAttribute("data-sys_id", sys_id);
  a.appendChild(img);
  p.appendChild(a);
  p.appendChild(cel('br'));
  setTimeout(this.hideLoading.bind(this), 200);
}

// this get called after attachments are deleted to update the display
function deletedAttachments(sysIds) {
  var form_table_id = "";
  if (gel("sys_uniqueValue") || gel("sysparm_attachment_cart_id")) {
    form_table_id = (gel("sys_uniqueValue") || gel("sysparm_attachment_cart_id")).value;
  }
  if (form_table_id && attachmentParentSysId !== form_table_id)
    CustomEvent.fire('record.attachment.deleted', sysIds);
  deleteLiveFeedAttachments(sysIds);
  var modified = $("attachments_modified");
  if (modified)
    modified.value = "true";
  var header_attachment = $('header_attachment');
  gel("deleted_sys_ids").value = ""; // there should be none on the list once we return
  var idArray = sysIds.split(";");
  for (var i = 0; i < idArray.length; i++) {
    var id = idArray[i];
    if (form_table_id && attachmentParentSysId === form_table_id)
      changeCount(attachmentParentSysId, 'decrease');
    var e = gel("sys_id_" + id);
    var tr = e.parentNode.parentNode;
    rel(tr);
    e = gel("attachment_" + id);
    if (e)
      rel(e);
  }

  var inputs = document.getElementsByTagName("input");
  var hasAvailableAttachments = false;
  var hasNotAvailableAttachments = false;
  var i = 0;
  while (i < inputs.length && (!hasAvailableAttachments || !hasNotAvailableAttachments)) {
    if (inputs[i].type == "checkbox" && inputs[i].name.substring(0, 7) == "sys_id_")
      if (inputs[i].classList.contains("not_available"))
        hasNotAvailableAttachments = true;
      else
        hasAvailableAttachments = true;

    i++;
  }

  if (!hasAvailableAttachments && !hasNotAvailableAttachments) {
    var noAttachments = gel("no_attachments");
    noAttachments.style.display = "none";
    var removeButton = gel("removeButton");
    removeButton.disabled = true;
    gel('delete_button_span').style.display = "none";
    hideObject($("header_attachment_list_label"));

    if (header_attachment)
      header_attachment.style.height = "auto";
    var line = $("header_attachment_line");
    if (line) {
      line.style.visibility = "hidden";
      line.style.display = "none";
    }
  }

  if (!hasAvailableAttachments)
    gel("download_all_button").style.display = "none";

  if (!hasNotAvailableAttachments)
    gel("not_available_files_header").style.display = "none";

  gel("please_wait").style.display = "none";

  var more_attachments = $('more_attachments');
  if (more_attachments && header_attachment)
    if ((computeAttachmentWidth() - 20) >= (header_attachment.getWidth() - more_attachments.getWidth()))
      more_attachments.style.display = 'block';
    else
      more_attachments.style.display = 'none';

  if (typeof adjustAttachmentsVisibility === 'function')
    adjustAttachmentsVisibility();
}

function deleteLiveFeedAttachments(sysIds) {
  var p = $('live_feed_message_images');
  if (!p)
    return;

  if (!p.visible())
    return;

  idArray = sysIds.split(";");
  for (var i = 0; i < idArray.length; i++) {
    var imgs = p.select("img.live_feed_image_thumbnail");
    if (imgs.length < 1)
      return;

    for (var j = 0; j < imgs.length; j++) {
      if (imgs[j].getAttribute("data-sys_id") == idArray[i]) {
        var elem = imgs[j].up("a.live_feed_attachment_link");
        elem.remove();
        if (elem.next() && (elem.next().tagName.toLowerCase() == "br"))
          elem.next().remove();
      }
    }
  }

  if (p.select("img.live_feed_image_thumbnail").length > 0)
    return;

  var container = $('live_feed_image_container');
  if (container)
    container.hide();

}

function computeAttachmentWidth() {
  var temp = $('header_attachment_list').select('li');
  var totalWidth = 0;
  for (var i = 0; i < temp.length; i++) {
    totalWidth += temp[i].getWidth();
  }
  return totalWidth;
}

function closeAttachmentWindow() {
  GlideDialogWindow.get().destroy();
}

/**
 * Add an input field to the file browser in the dialog.
 * This is called when the "Add Another Attachment" button
 * is clicked.
 * */
function addRowToTable() {
  var formRows = $('sys_attachment').select(".attachmentRow");
  var input = "<input type='file' title='${gs.getMessage('Attach')}' " +
    "name='attachFile' onchange='checkAndSetAttachButton(); setDeleteButton(this.value);'" +
    "size=41 multiple=true />";
  var img = "<a href='#' onclick='clearAttachmentField($(this).up().up()); setDeleteButton(this.value);'>" +
    "<img src='images/icons/kb_no.gif'/></a>";
  var row = "<tr class='attachmentRow'><td> "
    + input + "</td><td align='right'>" + img + "</td></tr>";
  formRows.last().insert({ "after": row });
}

/**
 * Download all attachments
 */
function downloadAllAttachments() {
  var downloadUrl = window.location.protocol + '//' + window.location.host + '/download_all_attachments.do?sysparm_sys_id=' + attachmentParentSysId
    + "&sysparm_this_url=" + getCurrentPageURL();
  window.location = downloadUrl;
}

function hasAttachments() {
  return document.getElementsByClassName("attachment_sys_id").length > 0;
}