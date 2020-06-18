// ServiceNow Utility script for AJAXAutoCompleter for Reference Field, was useful in building custom interactive filter
/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleter.js */
function acReferenceKeyDown(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    return element.ac.keyDown(evt);
}

function acReferenceKeyPress(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    var rv = element.ac.keyPress(evt);
    if (rv == false)
        evt.cancelBubble = true;
    return rv;
}

function acReferenceKeyUp(element, evt) {
    if (!element.ac || element.getAttribute('readonly'))
        return true;
    return element.ac.keyUp(evt);
}
addRenderEvent(function () {
    var statusEl = document.getElementById('ac.status');
    if (!statusEl) {
        statusEl = document.createElement('span');
        statusEl.id = 'ac.status';
        statusEl.setAttribute('role', 'status');
        statusEl.setAttribute('aria-live', 'polite');
        statusEl.classList.add('sr-only');
        document.body.appendChild(statusEl);
    }
})
var AJAXReferenceCompleter = Class.create(AJAXCompleter, {
    PROCESSOR: "Reference",
    initialize: function (element, reference, dependentReference, refQualElements, targetTable, referenceValid) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        this.className = "AJAXReferenceCompleter";
        this.element = $(element);
        this.keyElement = gel(reference);
        this.setDependent(dependentReference);
        this.setRefQualElements(refQualElements);
        this.setTargetTable(targetTable);
        this.additionalValues = {};
        CustomEvent.observe('domain_scope_changed', this.cacheClear.bind(this));
        this._commonSetup();
        this.oneMatchSelects = true;
        this.clearDerivedFields = true;
        this.allowInvalid = this.element.readAttribute('allow_invalid') == 'true';
        this.dynamicCreate = this.element.readAttribute('data-ref-dynamic') == 'true';
        this.isList = this.element.readAttribute('islist') == 'true';
        if (!this.simpleQualifier)
            this.refQual = "";
        this.isFilterUsingContains = this.element.readAttribute('is_filter_using_contains') == 'true';
        this.referenceValid = referenceValid;
    },
    _commonSetup: function () {
        this.element.ac = this;
        Event.observe(this.element, 'blur', this.onBlurEvent.bind(this));
        Event.observe(this.element, 'focus', this.onFocus.bind(this));
        this.saveKeyValue = this.getKeyValue();
        this.currentDisplayValue = this.getDisplayValue();
        this.searchChars = "";
        this.rowCount = 0;
        this.ignoreFocusEvent = false;
        this.max = 0;
        this.cacheClear();
        this.hasFocus = true;
        this.isResolvingFlag = false;
        var f = this.element.readAttribute("function");
        if (f)
            this.selectionCallBack = f;
        addUnloadEvent(this.destroy.bind(this));
        this._setupAccessibility();
        this._setUpDocMouseDown();
    },
    isResolving: function () {
        return this.isResolvingFlag;
    },
    destroy: function () {
        this.element = null;
        this.keyElement = null;
    },
    keyDown: function (evt) {
        var typedChar = getKeyCode(evt);
        if (typedChar == KEY_ARROWUP) {
            if (!this.selectPrevious())
                this.hideDropDown();
        } else if (typedChar == KEY_ARROWDOWN) {
            if (!this.isVisible()) {
                if (!this.isPopulated())
                    return;
                this.showDropDown();
            }
            this.selectNext();
        } else if (typedChar == KEY_TAB && !window.g_accessibility) {
            if (this.hasDropDown() && this.select())
                this.clearTimeout();
            else
                this.onBlur();
        } else if (typedChar == KEY_TAB && window.g_accessibility) {
            if (this.searchChars && this.searchChars != this.currentDisplayValue)
                this.element.value = '';
            this.clearDropDown();
        } else if (typedChar == KEY_ESC) {
            this.element.value = '';
            this.clearDropDown();
        }
    },
    keyUp: function (evt) {
        var typedChar = getKeyCode(evt);
        if (!this.isDeleteKey(typedChar))
            return;
        this.clearTimeout();
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
    },
    setSelection: function (itemNumber) {
        AJAXCompleter.prototype.setSelection.call(this, itemNumber);
        this.element.setAttribute('aria-activedescendant', this.selectedItemObj.id);
        this.setStatus(this.selectedItemObj.innerText);
        this.selectedItemObj.setAttribute('aria-selected', 'true');
    },
    _handleDeleteKey: function () {},
    clearTimeout: function () {
        if (this.timer != null)
            clearTimeout(this.timer);
        this.timer = null;
    },
    keyPress: function (eventArg) {
        var evt = getEvent(eventArg);
        var typedChar = getKeyCode(evt);
        if (typedChar != KEY_ENTER && typedChar != KEY_RETURN)
            this.clearTimeout();
        if (this.isNavigation(typedChar))
            return true;
        if (!evt.shiftKey && (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP))
            return false;
        if (this.isDeleteKey(typedChar))
            return true;
        if (typedChar == KEY_ENTER || typedChar == KEY_RETURN) {
            if (this.hasDropDown() && this.select())
                this.clearTimeout();
            else
                this.onBlur();
            if (this.enterSubmits) {
                this.element.setValue(trim(this.element.getValue()));
                return true;
            }
            return false;
        }
        if (typedChar == this.KEY_ESC) {
            this.clearDropDown();
            return false;
        }
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
        return true;
    },
    isNavigation: function (typedChar) {
        if (typedChar == this.KEY_TAB)
            return true;
        if (typedChar == this.KEY_LEFT)
            return true;
        if (typedChar == this.KEY_RIGHT)
            return true;
    },
    isDeleteKey: function (typedChar) {
        if (typedChar == this.KEY_BACKSPACE || typedChar == this.KEY_DELETE)
            return true;
    },
    _getSearchChars: function () {
        if (this._checkDoubleByteEncodedCharacter(this.getDisplayValue()))
            return this._translateDoubleByteIntoSingleByte(this.getDisplayValue());
        else
            return this.getDisplayValue();
    },
    _checkDoubleByteEncodedCharacter: function (s) {
        if (typeof s === 'undefined' || s.length === 0)
            return false;
        var char = s.charCodeAt(0);
        return char === 12288 || (65280 < char && char < 65375);
    },
    _translateDoubleByteIntoSingleByte: function (s) {
        var str = '';
        for (var i = 0, l = s.length, char; i < l; i++) {
            char = s.charCodeAt(i);
            if (char == 12288)
                str += String.fromCharCode(32);
            else if (65280 < char && char < 65375)
                str += String.fromCharCode(char - 65248);
            else
                str += s[i];
        }
        return str;
    },
    ajaxRequest: function () {
        var s = this._getSearchChars();
        if (s.length == 0 && !this.isDoctype()) {
            this.clearDropDown();
            this.searchChars = null;
            return;
        }
        if (s == "*")
            return;
        this.searchChars = s;
        var xml = this.cacheGet(s);
        if (xml) {
            this.processXML(xml);
            return;
        }
        if (this.cacheEmpty()) {
            this.clearDropDown();
            this.hideDropDown();
            return;
        }
        var url = "";
        url += this.addSysParms();
        url += this.addDependentValue();
        url += this.addRefQualValues();
        url += this.addTargetTable();
        url += this.addAdditionalValues();
        url += this.addAttributes("ac_");
        this.callAjax(url);
    },
    callAjax: function (url) {
        this.isResolvingFlag = true;
        var ga = new GlideAjax(this.PROCESSOR);
        ga.setQueryString(url);
        ga.setErrorCallback(this.errorResponse.bind(this));
        ga.getXML(this.ajaxResponse.bind(this), null, null);
    },
    ajaxResponse: function (response) {
        if (!response.responseXML || !response.responseXML.documentElement) {
            this.isResolvingFlag = false;
            return;
        }
        var xml = response.responseXML;
        var e = xml.documentElement;
        var timer = e.getAttribute("sysparm_timer");
        if (timer != this.timer)
            return;
        this.timer = null;
        this.clearDropDown();
        this.cachePut(this.searchChars, xml);
        this.processXML(xml);
        this.isResolvingFlag = false;
        if (this.onResolveCallback)
            this.onResolveCallback();
    },
    errorResponse: function () {
        this.isResolvingFlag = false;
    },
    processXML: function (xml) {
        var e = xml.documentElement;
        this._processDoc(e);
        var values = this._processItems(xml);
        var recents = this._processRecents(xml);
        if (!this.hasFocus) {
            this._processBlurValue(values, recents);
            return;
        }
        this.createDropDown(values, recents);
    },
    _processItems: function (xml) {
        var items = xml.getElementsByTagName("item");
        var values = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var array = this.copyAttributes(item);
            array['XML'] = item;
            values[values.length] = array;
        }
        return values;
    },
    _processRecents: function (xml) {
        var recents = [];
        var items = xml.getElementsByTagName("recent");
        for (var i = 0; i < items.length; i++) {
            var rec = this.copyAttributes(items[i]);
            rec.XML = items[i];
            recents.push(rec);
        }
        return recents;
    },
    _processBlurValue: function (values, recents) {
        this.ignoreFocusEvent = false;
        values = values || [];
        recents = recents || [];
        if (values.length + recents.length === 0 && this.searchChars.length > 0) {
            this.setInvalid();
            return;
        }
        if (!this.oneMatchSelects || this.getDisplayValue() === '')
            return;
        var targetLabel, targetValue;
        if (values.length + recents.length == 1) {
            var target = recents.length == 1 ? recents[0] : values[0];
            targetLabel = target.label;
            targetValue = target.name;
        }
        if (recents[0] && recents[0].label == this.getDisplayValue()) {
            var matchesRecent = recents[1] && recents[0].label == recents[1].label;
            var matchesValue = values[0] && recents[0].label == values[0].label;
            if (!matchesRecent && !matchesValue) {
                targetLabel = recents[0].label;
                targetValue = recents[0].name;
            }
        } else if (values[0] && values[0].label == this.getDisplayValue()) {
            var matchesSecondValue = values[1] && values[0].label == values[1].label;
            if (!matchesSecondValue) {
                targetLabel = values[0].label;
                targetValue = values[0].name;
            }
        }
        if (targetLabel)
            this.referenceSelect(targetValue, targetLabel);
    },
    _processDoc: function (doc) {
        this.rowCount = doc.getAttribute('row_count');
        this.max = doc.getAttribute('sysparm_max');
    },
    addSysParms: function () {
        var name = this.elementName;
        if (this.elementName.indexOf('IO:') > -1)
            name = this.elementName.substring(this.elementName.indexOf("IO:"), this.elementName.length);
        var sp = "sysparm_name=" + name +
            "&sysparm_timer=" + this.timer +
            "&sysparm_max=" + this.max +
            "&sysparm_chars=" + encodeText(this.searchChars);
        if (this.guid)
            sp += "&sysparm_completer_id=" + this.guid;
        if (this.ignoreRefQual)
            sp += "&sysparm_ignore_ref_qual=true";
        else if (this.refQual != "" && typeof this.refQual != "undefined")
            sp += "&sysparm_ref_qual=" + this.refQual;
        var domain = gel("sysparm_domain");
        if (domain)
            sp += "&sysparm_domain=" + domain.value;
        return sp;
    },
    addTargetTable: function () {
        var answer = "";
        if (this.getTargetTable()) {
            answer = "&sysparm_reference_target=" + this.getTargetTable();
        }
        return answer;
    },
    addAdditionalValues: function () {
        var answer = "";
        for (var n in this.additionalValues)
            answer += "&" + n + "=" + encodeText(this.additionalValues[n]);
        return answer;
    },
    addAttributes: function (prefix) {
        var answer = "";
        var attributes = this.element.attributes;
        for (var n = 0; n < attributes.length; n++) {
            var attr = attributes[n];
            var name = attr.nodeName;
            if (name.indexOf(prefix) != 0)
                continue;
            var v = attr.nodeValue;
            answer += "&" + name + "=" + v;
        }
        return answer;
    },
    copyAttributes: function (node) {
        var attributes = new Array();
        for (var n = 0; n < node.attributes.length; n++) {
            var attr = node.attributes[n];
            var name = attr.nodeName;
            var v = attr.nodeValue;
            attributes[name] = v;
        }
        return attributes;
    },
    createDropDown: function (foundStrings, foundRecents) {
        this.clearDropDown();
        this.createInnerDropDown();
        if (foundRecents && foundRecents.length > 0) {
            this._showRecents();
            for (var i = 0; i < foundRecents.length; i++) {
                var rec = foundRecents[i];
                var recchild = this.createChild(rec);
                recchild.acItem = rec;
                this.appendItem(recchild);
                this.addMouseListeners(recchild);
            }
        }
        if (foundStrings && foundStrings.length > 0) {
            this._showMax(foundStrings, foundRecents);
            for (var c = 0; c < foundStrings.length; c++) {
                if (this.max > 0 && c >= this.max)
                    break;
                var x = foundStrings[c];
                var child = this.createChild(x);
                child.acItem = x;
                this.appendItem(child);
                this.addMouseListeners(child);
            }
        }
        if (this.currentMenuCount) {
            this.setDropDownSize();
            this.showDropDown();
            if (isTextDirectionRTL()) {
                var diff = parseInt(this.dropDown.style.width) - this.getWidth();
                if (diff < 0)
                    diff = 0;
                var w = 0;
                if (isMSIE8 || isMSIE7 || isMSIE6 || (isMSIE9 && (getPreference('glide.ui11.use') == "false"))) {
                    if (typeof g_form != "undefined")
                        w = this.element.offsetParent ? this.element.offsetParent.clientWidth : 0;
                }
                this.dropDown.style.left = (parseInt(this.dropDown.style.left) - diff) + w + "px";
                this.iFrame.style.left = (parseInt(this.iFrame.style.left) - diff) + w + "px";
                if (parseInt(this.dropDown.style.left) < 0) {
                    this.dropDown.style.left = 0 + "px";
                    this.iFrame.style.left = 0 + "px";
                }
            }
            var height = this.dropDown.clientHeight;
            this.setHeight(height);
            this.firefoxBump();
            var msg = '{0} suggestions. Please use the up and down arrow keys to select a value';
            if (this.currentMenuCount == 1)
                msg = '1 suggestion. Please use the up and down arrow keys to select a value';
            var messageAPI = new GwtMessage();
            messageAPI.fetch([msg], function (msgs) {
                var msgWithValues = messageAPI.format(msgs[msg], this.currentMenuCount);
                this.setStatus(msgWithValues);
            }.bind(this))
        }
        this._setActive();
        _frameChanged();
    },
    createInnerDropDown: function () {},
    _showRecents: function () {
        this._addHeaderRow("Recent selections");
    },
    _showMax: function (foundStrings, foundRecents) {
        if (foundRecents && foundRecents.length > 0)
            this._addHeaderRow("Search");
    },
    _addHeaderRow: function (message) {
        var row = cel("div");
        row.className = "ac_header";
        row.setAttribute("width", "100%");
        row.innerHTML = new GwtMessage().getMessage(message);
        this.appendElement(row);
    },
    select: function () {
        if (this.selectedItemNum < 0)
            return false;
        var o = this.getSelectedObject().acItem;
        this.referenceSelect(o['name'], o['label']);
        this.clearDropDown();
        return true;
    },
    _setDisplayValue: function (v) {
        var e = this.getDisplayElement();
        if (e.value == v)
            return;
        e.value = v;
    },
    referenceSelectTimeout: function (sys_id, displayValue) {
        this.selectedID = sys_id;
        this.selectedDisplayValue = displayValue;
        if (typeof reflistModalPick == "function")
            this._referenceSelectTimeout();
        else
            setTimeout(this._referenceSelectTimeout.bind(this), 0);
    },
    _referenceSelectTimeout: function () {
        this.referenceSelect(this.selectedID, this.selectedDisplayValue);
    },
    referenceSelect: function (sys_id, displayValue, referenceInvalid) {
        this._setDisplayValue(displayValue);
        var e = this.getKeyElement();
        if (e.value != sys_id) {
            e.value = sys_id;
            callOnChange(e);
        }
        this.searchChars = displayValue;
        this.currentDisplayValue = displayValue;
        this.showViewImage();
        if (!referenceInvalid)
            this.clearInvalid();
        this._clearDerivedFields();
        if (this.selectionCallBack && sys_id) {
            eval(this.selectionCallBack);
        }
        if (e["filterCallBack"]) {
            e.filterCallBack();
        }
    },
    setFilterCallBack: function (f) {
        var e = this.getKeyElement();
        e["filterCallBack"] = f
    },
    _clearDerivedFields: function () {
        if (this.clearDerivedFields && window['DerivedFields']) {
            var df = new DerivedFields(this.keyElement.id);
            df.clearRelated();
            df.updateRelated(this.getKeyValue());
        }
    },
    showViewImage: function () {
        var element = gel("view." + this.keyElement.id);
        var elementR = gel("viewr." + this.keyElement.id);
        var noElement = gel("view." + this.keyElement.id + ".no");
        var sys_id = this.getKeyValue();
        if (sys_id == "") {
            hideObject(element);
            hideObject(elementR);
            showObjectInlineBlock(noElement);
        } else {
            showObjectInlineBlock(element);
            showObjectInlineBlock(elementR);
            hideObject(noElement);
        }
    },
    createChild: function (item) {
        return this._createChild(item, item['label']);
    },
    _createChild: function (item, text) {
        var div = cel(TAG_DIV);
        div.ac = this;
        div.acItem = item;
        div.id = 'ac_option_' + item.name;
        div.setAttribute('role', 'option');
        var itemInRow = cel(TAG_SPAN, div);
        itemInRow.innerHTML = (text + '').escapeHTML();
        return div;
    },
    addMouseListeners: function (element) {
        element.onmousedown = this.onMouseDown.bind(this, element);
        element.onmouseup = this.onMouseUp.bind(this, element);
        element.onmouseover = this.onMouseOver.bind(this, element);
        element.onmouseout = this.onMouseOut.bind(this, element);
    },
    onMouseUp: function (element) {
        this.select();
    },
    onMouseDown: function (element) {
        if (g_isInternetExplorer) {
            this.select();
            window.event.cancelBubble = true;
            window.event.returnValue = false;
            setTimeout(this.focus.bind(this), 50);
        }
        return false;
    },
    onMouseOut: function (element) {
        this.unsetSelection();
    },
    onMouseOver: function (element) {
        this.setSelection(element.acItemNumber);
    },
    focus: function () {
        this.element.focus();
    },
    setDropDownSize: function () {
        var e, mLeft, mTop;
        if (window.$j) {
            e = $j(this.element);
            var offset = e.offset();
            var parent = $j(getFormContentParent());
            var parentOffset = {
                left: 0,
                top: 0
            };
            var parentIsBody = parent.get(0) == document.body;
            var parentScrolltop = (parentIsBody || parent.css('overflow') == 'visible') ? 0 : parent.scrollTop();
            if (!parentIsBody)
                parentOffset = parent.offset();
            mLeft = offset.left - parentOffset.left + 1 + 'px';
            mTop = offset.top - parentOffset.top + e.outerHeight() + parentScrolltop + 'px';
        } else {
            e = this.element;
            mLeft = grabOffsetLeft(e) + "px";
            mTop = grabOffsetTop(e) + (e.offsetHeight - 1) + "px";
        }
        var mWidth = this.getWidth();
        var dd = this.dropDown;
        if (dd.offsetWidth > parseInt(mWidth))
            mWidth = dd.offsetWidth;
        this.setTopLeft(dd.style, mTop, mLeft);
        this.setTopLeft(this.iFrame.style, mTop, mLeft);
        this.setWidth(mWidth);
    },
    setTopLeft: function (style, top, left) {
        style.left = left;
        style.top = top;
    },
    getWidth: function () {
        var field = this.element;
        if (g_isInternetExplorer)
            return field.offsetWidth - (this.menuBorderSize * 2);
        return field.clientWidth;
    },
    onFocus: function () {
        if (this.ignoreFocusEvent || this.element.getAttribute('readonly'))
            return;
        this.hasFocus = true;
        this.currentDisplayValue = this.getDisplayValue();
        this._setUpDocMouseDown();
        if (this.isDoctype() && this.currentDisplayValue == '')
            this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
    },
    isTablet: function () {
        return !(typeof isTablet == "undefined");
    },
    isDoctype: function () {
        return document.documentElement.getAttribute('data-doctype') == 'true';
    },
    _setupAccessibility: function () {
        this.element.setAttribute('role', 'combobox');
        this.element.setAttribute('aria-autocomplete', 'list');
        this.element.setAttribute('aria-owns', this.getDropDown().id);
    },
    _setUpDocMouseDown: function () {
        if (this.isTablet()) {
            this.blurPause = true;
            this._boundOnDocMouseDown = this.onDocMouseDown.bind(this);
            Event.observe(document.body, 'mousedown', this._boundOnDocMouseDown);
        }
    },
    setStatus: function (text) {
        var statusEl = this._getStatusEl();
        if (!statusEl)
            return;
        statusEl.innerText = text;
    },
    _getStatusEl: function () {
        return document.getElementById('ac.status');
    },
    onDocMouseDown: function (evt) {
        if (evt.target == this.element)
            return;
        this.blurPause = false;
    },
    onBlurEvent: function (evt) {
        if (this.element.getAttribute('readonly'))
            return;
        if (this.isTablet() && this.blurPause == true)
            setTimeout(this.onBlur.bind(this), 4000);
        else
            this.onBlur();
    },
    onBlur: function () {
        if (this._boundOnDocMousedown) {
            Event.stopObserving(document.body, 'mousedown', this._boundOnDocMouseDown);
            delete this._boundOnDocMouseDown;
        }
        this.hasFocus = false;
        if (this.getDisplayValue().length == 0) {
            if (this.currentDisplayValue != "") {
                if (!this.isList) {
                    this.referenceSelect("", "");
                } else {
                    this.clearInvalid();
                }
            } else {
                this.clearInvalid();
            }
        } else if (this.selectedItemNum > -1) {
            this.select();
        } else if ((this.getKeyValue() == "") || (this.currentDisplayValue != this.getDisplayValue())) {
            if (!this.isFilterUsingContains) {
                var refInvalid = true;
                if (this.isExactMatch()) {
                    if (this.oneMatchSelects != false) {
                        var o = this.getObject(0).acItem;
                        this.referenceSelect(o['name'], o['label']);
                        refInvalid = false;
                    }
                }
                if (refInvalid)
                    this.setInvalid();
                if (refInvalid || !this.isPopulated()) {
                    this.clearTimeout();
                    this.searchChars = null;
                    this.ignoreFocusEvent = true;
                    this.timer = setTimeout(this.ajaxRequest.bind(this), 0);
                }
            }
        }
        this.clearDropDown();
    },
    isExactMatch: function () {
        if (this.isPopulated()) {
            if (this.getMenuCount() == 1) {
                var o0 = this.getObject(0).acItem;
                if ((o0['label'].toUpperCase().startsWith(this.getDisplayValue().toUpperCase())))
                    return true;
                return false;
            }
            var o0 = this.getObject(0).acItem;
            var o1 = this.getObject(1).acItem;
            if ((o0['label'] == this.getDisplayValue()) && (o1['label'] != this.getDisplayValue()))
                return true;
        }
    },
    getDisplayValue: function () {
        return this.getDisplayElement().value;
    },
    getKeyValue: function () {
        return this.getKeyElement().value;
    },
    clearKeyValue: function () {
        this.referenceSelect("", this.getDisplayValue());
    },
    getKeyElement: function () {
        return this.keyElement;
    },
    getDisplayElement: function () {
        return this.element;
    },
    setResolveCallback: function (f) {
        this.onResolveCallback = f;
    },
    setDependent: function (dependentReference) {
        this.dependentReference = dependentReference;
        var el = this.getDependentElement();
        if (!el)
            return;
        var n = dependentReference.replace(/\./, "_");
        n = this.getTableName() + "_" + n;
        var h = new GlideEventHandler('onChange_' + n, this.onDependentChange.bind(this), dependentReference);
        g_event_handlers.push(h);
    },
    onDependentChange: function () {
        this.cacheClear();
    },
    getDependentElement: function () {
        if (!this.dependentReference || 'null' == this.dependentReference)
            return null;
        var table = this.getTableName();
        var dparts = this.dependentReference.split(",");
        return gel(table + "." + dparts[0]);
    },
    addDependentValue: function () {
        var el = this.getDependentElement();
        if (!el) {
            if (window.NOW.useHiddenDependent && this.element.hasAttribute('data-dependent-value')) {
                return "&sysparm_value=" + this.element.readAttribute('data-dependent-value');
            } else {
                return "";
            }
        }
        var depValue = "";
        if (el.tagName == "INPUT")
            depValue = el.value;
        else
            depValue = el.options[el.selectedIndex].value;
        return "&sysparm_value=" + depValue;
    },
    setRefQualElements: function (elements) {
        this.simpleQualifier = false;
        if (!elements)
            this.refQualElements = null;
        else {
            if (elements.startsWith("QUERY:")) {
                this.setRefQual(elements.substring(6));
                this.simpleQualifier = true;
                return;
            }
            var tableDot = g_form.getTableName() + '.';
            this.refQualElements = [];
            var a = elements.split(';');
            if (a == "*") {
                a = [];
                var form = gel(tableDot + 'do');
                var elements = Form.getElements(form);
                for (var i = 0; i < elements.length; i++) {
                    if ((elements[i].id != this.keyElement.id) && (elements[i].id.startsWith(tableDot)))
                        a.push(elements[i].id);
                }
            }
            for (var i = 0; i < a.length; i++) {
                var n = a[i];
                var el = gel(n);
                if (!el)
                    continue;
                this.refQualElements.push(n);
                var h = new GlideEventHandler('onChange_' + n.replace(/\./, "_"), this.onDependentChange.bind(this), a[i]);
                g_event_handlers.push(h);
            }
        }
    },
    setRefQual: function (refQual) {
        this.refQual = refQual;
    },
    setIgnoreRefQual: function (ignoreRefQual) {
        this.ignoreRefQual = ignoreRefQual;
    },
    addRefQualValues: function () {
        if (this.refQualElements) {
            return "&" + g_form.serializeChanged();
        } else
            return "";
    },
    setAdditionalValue: function (name, value) {
        this.additionalValues[name] = value;
    },
    getTableName: function () {
        return this.elementName.split('.')[0];
    },
    setInvalid: function () {
        this.messages = new GwtMessage().getMessages(
            ["A new record with this value will be created automatically", "Invalid reference"]);
        this.referenceValid = false;
        var message;
        if (this.dynamicCreate) {
            message = this.messages["A new record with this value will be created automatically"];
            this.getDisplayElement().title = message;
            addClassName(this.getDisplayElement(), "ref_dynamic");
        } else {
            message = this.messages["Invalid reference"];
            this.getDisplayElement().title = message;
            addClassName(this.getDisplayElement(), "ref_invalid");
        }
        if (typeof g_form != "undefined") {
            var fieldName = this.elementName.substring(this.elementName.indexOf('.') + 1);
            var dynamicCreate = this.dynamicCreate;
            if (g_form.getGlideUIElement) {
                var el = g_form.getGlideUIElement(this.elementName);
                if (el)
                    el.isInvalid = true;
            }
            setTimeout(function () {
                g_form.hideFieldMsg(fieldName, false, 'invalid_reference');
                g_form.showFieldMsg(fieldName, message, dynamicCreate ? 'info' : 'error', null, 'invalid_reference');
            });
        }
        if (this.getKeyValue() && !this.allowInvalid && !this.isList) {
            this.getKeyElement().value = "";
            callOnChange(this.getKeyElement());
        }
        this.showViewImage();
        var displayElement = this.getDisplayElement();
        if (displayElement) {
            displayElement.setAttribute('aria-invalid', 'true');
        }
    },
    clearInvalid: function () {
        this.referenceValid = true;
        if (this.dynamicCreate) {
            removeClassName(this.getDisplayElement(), "ref_dynamic");
        } else {
            removeClassName(this.getDisplayElement(), "ref_invalid");
        }
        this.getDisplayElement().title = "";
        this.getDisplayElement().removeAttribute("data-original-title");
        if (typeof g_form != "undefined") {
            if (g_form.getGlideUIElement) {
                var el = g_form.getGlideUIElement(this.elementName);
                if (el)
                    el.isInvalid = false;
            }
        }
        var fieldName = this.elementName.substring(this.elementName.indexOf('.') + 1);
        if (typeof g_form != "undefined" && fieldName) {
            g_form.hideFieldMsg(fieldName, false, 'invalid_reference');
        }
        var displayElement = this.getDisplayElement();
        if (displayElement && typeof g_form !== 'undefined') {
            var isEmpty = !this.element.present();
            if (this.isList) {
                isEmpty = this.getKeyValue() === '';
            }
            if (g_form.isMandatory(fieldName) && g_form.submitAttemptsCount > 0 && isEmpty) {
                displayElement.setAttribute('aria-invalid', 'true');
            } else {
                displayElement.setAttribute('aria-invalid', 'false');
            }
        }
    },
    isReferenceValid: function () {
        return this.referenceValid;
    },
    firefoxBump: function () {
        var children = this.getMenuItems();
        for (var i = 0; i < children.length; i++) {
            if (children[i] && children[i].firstChild) {
                var dparentDivWidth = children[i].offsetWidth;
                var dchildSpanWidth = children[i].firstChild.offsetWidth;
                if (dchildSpanWidth > dparentDivWidth)
                    this.setWidth(dchildSpanWidth);
            }
        }
    },
    _setIframeHeight: function (height) {
        this.iFrame.style.height = height - 2;
    },
    hasDropDown: function () {
        if (!this.dropDown)
            return false;
        return this.dropDown.childNodes.length > 0;
    },
    cachePut: function (name, value) {
        if (this.refQualElements)
            return;
        this.cache[name] = value;
    },
    cacheGet: function (name) {
        if (this.refQualElements)
            return;
        return this.cache[name];
    },
    cacheClear: function () {
        this.cache = new Object();
    },
    cacheEmpty: function () {
        var s = this.searchChars;
        if (!s)
            return false;
        while (s.length > 2) {
            s = s.substring(0, s.length - 1);
            var xml = this.cacheGet(s);
            if (!xml)
                continue;
            var e = xml.documentElement;
            var rowCount = e.getAttribute('row_count');
            if (rowCount == 0 && e.childElementCount == 0)
                return true;
            break;
        }
        return false;
    }
});;