/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls!vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/settingsWidgets"], function (require, exports, canIUse_1, DOM, actionbar_1, button_1, toggle_1, inputBox_1, selectBox_1, async_1, codicons_1, event_1, lifecycle_1, platform_1, types_1, nls_1, contextView_1, themeService_1, themables_1, preferencesIcons_1, settingsEditorColorRegistry_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IDb = exports.$HDb = exports.$GDb = exports.$FDb = exports.$EDb = exports.$DDb = exports.$CDb = void 0;
    const $ = DOM.$;
    class $CDb {
        get items() {
            const items = this.a.map((item, i) => {
                const editing = typeof this.b === 'number' && this.b === i;
                return {
                    ...item,
                    editing,
                    selected: i === this.d || editing
                };
            });
            if (this.b === 'create') {
                items.push({
                    editing: true,
                    selected: true,
                    ...this.f,
                });
            }
            return items;
        }
        constructor(newItem) {
            this.a = [];
            this.b = null;
            this.d = null;
            this.f = newItem;
        }
        setEditKey(key) {
            this.b = key;
        }
        setValue(listData) {
            this.a = listData;
        }
        select(idx) {
            this.d = idx;
        }
        getSelected() {
            return this.d;
        }
        selectNext() {
            if (typeof this.d === 'number') {
                this.d = Math.min(this.d + 1, this.a.length - 1);
            }
            else {
                this.d = 0;
            }
        }
        selectPrevious() {
            if (typeof this.d === 'number') {
                this.d = Math.max(this.d - 1, 0);
            }
            else {
                this.d = 0;
            }
        }
    }
    exports.$CDb = $CDb;
    let $DDb = class $DDb extends lifecycle_1.$kc {
        get domNode() {
            return this.a;
        }
        get items() {
            return this.g.items;
        }
        get inReadMode() {
            return this.g.items.every(item => !item.editing);
        }
        constructor(j, m, n) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.b = [];
            this.f = this.B(new event_1.$fd());
            this.g = new $CDb(this.r());
            this.h = this.B(new lifecycle_1.$jc());
            this.onDidChangeList = this.f.event;
            this.a = DOM.$0O(j, $('div'));
            this.a.setAttribute('role', 'list');
            this.s().forEach(c => this.a.classList.add(c));
            DOM.$0O(j, this.M());
            this.F();
            this.B(DOM.$nO(this.a, DOM.$3O.POINTER_DOWN, e => this.N(e)));
            this.B(DOM.$nO(this.a, DOM.$3O.DBLCLICK, e => this.O(e)));
            this.B(DOM.$oO(this.a, 'keydown', (e) => {
                if (e.equals(16 /* KeyCode.UpArrow */)) {
                    this.S();
                }
                else if (e.equals(18 /* KeyCode.DownArrow */)) {
                    this.R();
                }
                else {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
        }
        setValue(listData) {
            this.g.setValue(listData);
            this.F();
        }
        C() {
            return;
        }
        D() {
            return true;
        }
        F() {
            const focused = DOM.$NO(document.activeElement, this.a);
            DOM.$lO(this.a);
            this.h.clear();
            const newMode = this.g.items.some(item => !!(item.editing && this.isItemNew(item)));
            this.j.classList.toggle('setting-list-hide-add-button', !this.D() || newMode);
            if (this.g.items.length) {
                this.a.tabIndex = 0;
            }
            else {
                this.a.removeAttribute('tabIndex');
            }
            const header = this.C();
            if (header) {
                this.a.appendChild(header);
            }
            this.b = this.g.items.map((item, i) => this.J(item, i, focused));
            this.b.forEach(rowElement => this.a.appendChild(rowElement));
        }
        G(value) {
            const selectBoxOptions = value.options.map(({ value, description }) => ({ text: value, description }));
            const selected = value.options.findIndex(option => value.data === option.value);
            const styles = (0, defaultStyles_1.$C2)({
                selectBackground: settingsEditorColorRegistry_1.$4Cb,
                selectForeground: settingsEditorColorRegistry_1.$5Cb,
                selectBorder: settingsEditorColorRegistry_1.$6Cb,
                selectListBorder: settingsEditorColorRegistry_1.$7Cb
            });
            const selectBox = new selectBox_1.$HQ(selectBoxOptions, selected, this.n, styles, {
                useCustomDrawn: !(platform_1.$q && canIUse_1.$bO.pointerEvents)
            });
            return selectBox;
        }
        H(idx) {
            this.g.setEditKey(idx);
            this.F();
        }
        cancelEdit() {
            this.g.setEditKey('none');
            this.F();
        }
        I(originalItem, changedItem, idx) {
            this.g.setEditKey('none');
            this.f.fire({
                originalItem,
                item: changedItem,
                targetIndex: idx,
            });
            this.F();
        }
        J(item, idx, listFocused) {
            const rowElement = item.editing ?
                this.w(item, idx) :
                this.L(item, idx, listFocused);
            rowElement.setAttribute('role', 'listitem');
            return rowElement;
        }
        L(item, idx, listFocused) {
            const rowElementGroup = this.u(item, idx);
            const rowElement = rowElementGroup.rowElement;
            rowElement.setAttribute('data-index', idx + '');
            rowElement.setAttribute('tabindex', item.selected ? '0' : '-1');
            rowElement.classList.toggle('selected', item.selected);
            const actionBar = new actionbar_1.$1P(rowElement);
            this.h.add(actionBar);
            actionBar.push(this.t(item, idx), { icon: true, label: true });
            this.y(rowElementGroup, item);
            if (item.selected && listFocused) {
                this.h.add((0, async_1.$Ig)(() => rowElement.focus()));
            }
            this.h.add(DOM.$nO(rowElement, 'click', (e) => {
                // There is a parent list widget, which is the one that holds the list of settings.
                // Prevent the parent widget from trying to interpret this click event.
                e.stopPropagation();
            }));
            return rowElement;
        }
        M() {
            const rowElement = $('.setting-list-new-row');
            const startAddButton = this.B(new button_1.$7Q(rowElement, defaultStyles_1.$i2));
            startAddButton.label = this.z().addButtonLabel;
            startAddButton.element.classList.add('setting-list-addButton');
            this.B(startAddButton.onDidClick(() => {
                this.g.setEditKey('create');
                this.F();
            }));
            return rowElement;
        }
        N(e) {
            const targetIdx = this.P(e);
            if (targetIdx < 0) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this.g.getSelected() === targetIdx) {
                return;
            }
            this.Q(targetIdx);
        }
        O(e) {
            const targetIdx = this.P(e);
            if (targetIdx < 0) {
                return;
            }
            const item = this.g.items[targetIdx];
            if (item) {
                this.H(targetIdx);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        P(e) {
            if (!e.target) {
                return -1;
            }
            const actionbar = DOM.$QO(e.target, 'monaco-action-bar');
            if (actionbar) {
                // Don't handle doubleclicks inside the action bar
                return -1;
            }
            const element = DOM.$QO(e.target, 'setting-list-row');
            if (!element) {
                return -1;
            }
            const targetIdxStr = element.getAttribute('data-index');
            if (!targetIdxStr) {
                return -1;
            }
            const targetIdx = parseInt(targetIdxStr);
            return targetIdx;
        }
        Q(idx) {
            this.g.select(idx);
            this.b.forEach(row => row.classList.remove('selected'));
            const selectedRow = this.b[this.g.getSelected()];
            selectedRow.classList.add('selected');
            selectedRow.focus();
        }
        R() {
            this.g.selectNext();
            this.Q(this.g.getSelected());
        }
        S() {
            this.g.selectPrevious();
            this.Q(this.g.getSelected());
        }
    };
    exports.$DDb = $DDb;
    exports.$DDb = $DDb = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, contextView_1.$VZ)
    ], $DDb);
    class $EDb extends $DDb {
        constructor() {
            super(...arguments);
            this.W = true;
        }
        setValue(listData, options) {
            this.U = options?.keySuggester;
            this.W = options?.showAddButton ?? true;
            super.setValue(listData);
        }
        r() {
            return {
                value: {
                    type: 'string',
                    data: ''
                }
            };
        }
        D() {
            return this.W;
        }
        s() {
            return ['setting-list-widget'];
        }
        t(item, idx) {
            return [
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$1Bb),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.z().editActionTooltip,
                    run: () => this.H(idx)
                },
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$2Bb),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.z().deleteActionTooltip,
                    run: () => this.f.fire({ originalItem: item, item: undefined, targetIndex: idx })
                }
            ];
        }
        cb(item) {
            const dragImage = $('.monaco-drag-image');
            dragImage.textContent = item.value.data;
            return dragImage;
        }
        u(item, idx) {
            const rowElement = $('.setting-list-row');
            const valueElement = DOM.$0O(rowElement, $('.setting-list-value'));
            const siblingElement = DOM.$0O(rowElement, $('.setting-list-sibling'));
            valueElement.textContent = item.value.data.toString();
            siblingElement.textContent = item.sibling ? `when: ${item.sibling}` : null;
            this.eb(rowElement, item, idx);
            return { rowElement, keyElement: valueElement, valueElement: siblingElement };
        }
        eb(rowElement, item, idx) {
            if (this.inReadMode) {
                rowElement.draggable = true;
                rowElement.classList.add('draggable');
            }
            else {
                rowElement.draggable = false;
                rowElement.classList.remove('draggable');
            }
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DRAG_START, (ev) => {
                this.bb = {
                    element: rowElement,
                    item,
                    itemIndex: idx
                };
                if (ev.dataTransfer) {
                    ev.dataTransfer.dropEffect = 'move';
                    const dragImage = this.cb(item);
                    document.body.appendChild(dragImage);
                    ev.dataTransfer.setDragImage(dragImage, -10, -10);
                    setTimeout(() => document.body.removeChild(dragImage), 0);
                }
            }));
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DRAG_OVER, (ev) => {
                if (!this.bb) {
                    return false;
                }
                ev.preventDefault();
                if (ev.dataTransfer) {
                    ev.dataTransfer.dropEffect = 'move';
                }
                return true;
            }));
            let counter = 0;
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DRAG_ENTER, (ev) => {
                counter++;
                rowElement.classList.add('drag-hover');
            }));
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DRAG_LEAVE, (ev) => {
                counter--;
                if (!counter) {
                    rowElement.classList.remove('drag-hover');
                }
            }));
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DROP, (ev) => {
                // cancel the op if we dragged to a completely different setting
                if (!this.bb) {
                    return false;
                }
                ev.preventDefault();
                counter = 0;
                if (this.bb.element !== rowElement) {
                    this.f.fire({
                        originalItem: this.bb.item,
                        sourceIndex: this.bb.itemIndex,
                        item,
                        targetIndex: idx
                    });
                }
                return true;
            }));
            this.h.add(DOM.$nO(rowElement, DOM.$3O.DRAG_END, (ev) => {
                counter = 0;
                rowElement.classList.remove('drag-hover');
                ev.dataTransfer?.clearData();
                if (this.bb) {
                    this.bb = undefined;
                }
            }));
        }
        w(item, idx) {
            const rowElement = $('.setting-list-edit-row');
            let valueInput;
            let currentDisplayValue;
            let currentEnumOptions;
            if (this.U) {
                const enumData = this.U(this.g.items.map(({ value: { data } }) => data), idx);
                item = {
                    ...item,
                    value: {
                        type: 'enum',
                        data: item.value.data,
                        options: enumData ? enumData.options : []
                    }
                };
            }
            switch (item.value.type) {
                case 'string':
                    valueInput = this.ib(item.value, rowElement);
                    break;
                case 'enum':
                    valueInput = this.jb(item.value, rowElement);
                    currentEnumOptions = item.value.options;
                    if (item.value.options.length) {
                        currentDisplayValue = this.isItemNew(item) ?
                            currentEnumOptions[0].value : item.value.data;
                    }
                    break;
            }
            const updatedInputBoxItem = () => {
                const inputBox = valueInput;
                return {
                    value: {
                        type: 'string',
                        data: inputBox.value
                    },
                    sibling: siblingInput?.value
                };
            };
            const updatedSelectBoxItem = (selectedValue) => {
                return {
                    value: {
                        type: 'enum',
                        data: selectedValue,
                        options: currentEnumOptions ?? []
                    }
                };
            };
            const onKeyDown = (e) => {
                if (e.equals(3 /* KeyCode.Enter */)) {
                    this.I(item, updatedInputBoxItem(), idx);
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
                rowElement?.focus();
            };
            if (item.value.type !== 'string') {
                const selectBox = valueInput;
                this.h.add(selectBox.onDidSelect(({ selected }) => {
                    currentDisplayValue = selected;
                }));
            }
            else {
                const inputBox = valueInput;
                this.h.add(DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_DOWN, onKeyDown));
            }
            let siblingInput;
            if (!(0, types_1.$sf)(item.sibling)) {
                siblingInput = new inputBox_1.$sR(rowElement, this.n, {
                    placeholder: this.z().siblingInputPlaceholder,
                    inputBoxStyles: (0, defaultStyles_1.$t2)({
                        inputBackground: settingsEditorColorRegistry_1.$$Cb,
                        inputForeground: settingsEditorColorRegistry_1.$_Cb,
                        inputBorder: settingsEditorColorRegistry_1.$aDb
                    })
                });
                siblingInput.element.classList.add('setting-list-siblingInput');
                this.h.add(siblingInput);
                siblingInput.value = item.sibling;
                this.h.add(DOM.$oO(siblingInput.inputElement, DOM.$3O.KEY_DOWN, onKeyDown));
            }
            else if (valueInput instanceof inputBox_1.$sR) {
                valueInput.element.classList.add('no-sibling');
            }
            const okButton = this.B(new button_1.$7Q(rowElement, defaultStyles_1.$i2));
            okButton.label = (0, nls_1.localize)(0, null);
            okButton.element.classList.add('setting-list-ok-button');
            this.h.add(okButton.onDidClick(() => {
                if (item.value.type === 'string') {
                    this.I(item, updatedInputBoxItem(), idx);
                }
                else {
                    this.I(item, updatedSelectBoxItem(currentDisplayValue), idx);
                }
            }));
            const cancelButton = this.B(new button_1.$7Q(rowElement, { secondary: true, ...defaultStyles_1.$i2 }));
            cancelButton.label = (0, nls_1.localize)(1, null);
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.h.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.h.add((0, async_1.$Ig)(() => {
                valueInput.focus();
                if (valueInput instanceof inputBox_1.$sR) {
                    valueInput.select();
                }
            }));
            return rowElement;
        }
        isItemNew(item) {
            return item.value.data === '';
        }
        y(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.$sf)(sibling)
                ? (0, nls_1.localize)(2, null, value.data)
                : (0, nls_1.localize)(3, null, value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        z() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(4, null),
                editActionTooltip: (0, nls_1.localize)(5, null),
                addButtonLabel: (0, nls_1.localize)(6, null),
                inputPlaceholder: (0, nls_1.localize)(7, null),
                siblingInputPlaceholder: (0, nls_1.localize)(8, null),
            };
        }
        ib(value, rowElement) {
            const valueInput = new inputBox_1.$sR(rowElement, this.n, {
                placeholder: this.z().inputPlaceholder,
                inputBoxStyles: (0, defaultStyles_1.$t2)({
                    inputBackground: settingsEditorColorRegistry_1.$$Cb,
                    inputForeground: settingsEditorColorRegistry_1.$_Cb,
                    inputBorder: settingsEditorColorRegistry_1.$aDb
                })
            });
            valueInput.element.classList.add('setting-list-valueInput');
            this.h.add(valueInput);
            valueInput.value = value.data.toString();
            return valueInput;
        }
        jb(value, rowElement) {
            if (value.type !== 'enum') {
                throw new Error('Valuetype must be enum.');
            }
            const selectBox = this.G(value);
            const wrapper = $('.setting-list-object-list-row');
            selectBox.render(wrapper);
            rowElement.appendChild(wrapper);
            return selectBox;
        }
    }
    exports.$EDb = $EDb;
    class $FDb extends $EDb {
        s() {
            return ['setting-list-include-exclude-widget'];
        }
        eb(rowElement, item, idx) {
            return;
        }
        y(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.$sf)(sibling)
                ? (0, nls_1.localize)(9, null, value.data)
                : (0, nls_1.localize)(10, null, value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        z() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(11, null),
                editActionTooltip: (0, nls_1.localize)(12, null),
                addButtonLabel: (0, nls_1.localize)(13, null),
                inputPlaceholder: (0, nls_1.localize)(14, null),
                siblingInputPlaceholder: (0, nls_1.localize)(15, null),
            };
        }
    }
    exports.$FDb = $FDb;
    class $GDb extends $EDb {
        s() {
            return ['setting-list-include-exclude-widget'];
        }
        eb(rowElement, item, idx) {
            return;
        }
        y(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.$sf)(sibling)
                ? (0, nls_1.localize)(16, null, value.data)
                : (0, nls_1.localize)(17, null, value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        z() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(18, null),
                editActionTooltip: (0, nls_1.localize)(19, null),
                addButtonLabel: (0, nls_1.localize)(20, null),
                inputPlaceholder: (0, nls_1.localize)(21, null),
                siblingInputPlaceholder: (0, nls_1.localize)(22, null),
            };
        }
    }
    exports.$GDb = $GDb;
    class $HDb extends $DDb {
        constructor() {
            super(...arguments);
            this.U = '';
            this.W = true;
            this.X = () => undefined;
            this.Y = () => undefined;
        }
        setValue(listData, options) {
            this.W = options?.showAddButton ?? this.W;
            this.X = options?.keySuggester ?? this.X;
            this.Y = options?.valueSuggester ?? this.Y;
            if ((0, types_1.$rf)(options) && options.settingKey !== this.U) {
                this.g.setEditKey('none');
                this.g.select(null);
                this.U = options.settingKey;
            }
            super.setValue(listData);
        }
        isItemNew(item) {
            return item.key.data === '' && item.value.data === '';
        }
        D() {
            return this.W;
        }
        r() {
            return {
                key: { type: 'string', data: '' },
                value: { type: 'string', data: '' },
                removable: true,
            };
        }
        s() {
            return ['setting-list-object-widget'];
        }
        t(item, idx) {
            const actions = [
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$1Bb),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.z().editActionTooltip,
                    run: () => this.H(idx)
                },
            ];
            if (item.removable) {
                actions.push({
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$2Bb),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.z().deleteActionTooltip,
                    run: () => this.f.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            else {
                actions.push({
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$3Bb),
                    enabled: true,
                    id: 'workbench.action.resetListItem',
                    tooltip: this.z().resetActionTooltip,
                    run: () => this.f.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            return actions;
        }
        C() {
            const header = $('.setting-list-row-header');
            const keyHeader = DOM.$0O(header, $('.setting-list-object-key'));
            const valueHeader = DOM.$0O(header, $('.setting-list-object-value'));
            const { keyHeaderText, valueHeaderText } = this.z();
            keyHeader.textContent = keyHeaderText;
            valueHeader.textContent = valueHeaderText;
            return header;
        }
        u(item, idx) {
            const rowElement = $('.setting-list-row');
            rowElement.classList.add('setting-list-object-row');
            const keyElement = DOM.$0O(rowElement, $('.setting-list-object-key'));
            const valueElement = DOM.$0O(rowElement, $('.setting-list-object-value'));
            keyElement.textContent = item.key.data;
            valueElement.textContent = item.value.data.toString();
            return { rowElement, keyElement, valueElement };
        }
        w(item, idx) {
            const rowElement = $('.setting-list-edit-row.setting-list-object-row');
            const changedItem = { ...item };
            const onKeyChange = (key) => {
                changedItem.key = key;
                okButton.enabled = key.data !== '';
                const suggestedValue = this.Y(key.data) ?? item.value;
                if (this.jb(item.value, changedItem.value, suggestedValue)) {
                    onValueChange(suggestedValue);
                    renderLatestValue();
                }
            };
            const onValueChange = (value) => {
                changedItem.value = value;
            };
            let keyWidget;
            let keyElement;
            if (this.W) {
                if (this.isItemNew(item)) {
                    const suggestedKey = this.X(this.g.items.map(({ key: { data } }) => data));
                    if ((0, types_1.$rf)(suggestedKey)) {
                        changedItem.key = suggestedKey;
                        const suggestedValue = this.Y(changedItem.key.data);
                        onValueChange(suggestedValue ?? changedItem.value);
                    }
                }
                const { widget, element } = this.gb(changedItem.key, {
                    idx,
                    isKey: true,
                    originalItem: item,
                    changedItem,
                    update: onKeyChange,
                });
                keyWidget = widget;
                keyElement = element;
            }
            else {
                keyElement = $('.setting-list-object-key');
                keyElement.textContent = item.key.data;
            }
            let valueWidget;
            const valueContainer = $('.setting-list-object-value-container');
            const renderLatestValue = () => {
                const { widget, element } = this.gb(changedItem.value, {
                    idx,
                    isKey: false,
                    originalItem: item,
                    changedItem,
                    update: onValueChange,
                });
                valueWidget = widget;
                DOM.$lO(valueContainer);
                valueContainer.append(element);
            };
            renderLatestValue();
            rowElement.append(keyElement, valueContainer);
            const okButton = this.B(new button_1.$7Q(rowElement, defaultStyles_1.$i2));
            okButton.enabled = changedItem.key.data !== '';
            okButton.label = (0, nls_1.localize)(23, null);
            okButton.element.classList.add('setting-list-ok-button');
            this.h.add(okButton.onDidClick(() => this.I(item, changedItem, idx)));
            const cancelButton = this.B(new button_1.$7Q(rowElement, { secondary: true, ...defaultStyles_1.$i2 }));
            cancelButton.label = (0, nls_1.localize)(24, null);
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.h.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.h.add((0, async_1.$Ig)(() => {
                const widget = keyWidget ?? valueWidget;
                widget.focus();
                if (widget instanceof inputBox_1.$sR) {
                    widget.select();
                }
            }));
            return rowElement;
        }
        gb(keyOrValue, options) {
            switch (keyOrValue.type) {
                case 'string':
                    return this.hb(keyOrValue, options);
                case 'enum':
                    return this.ib(keyOrValue, options);
                case 'boolean':
                    return this.ib({
                        type: 'enum',
                        data: keyOrValue.data.toString(),
                        options: [{ value: 'true' }, { value: 'false' }],
                    }, options);
            }
        }
        hb(keyOrValue, { idx, isKey, originalItem, changedItem, update }) {
            const wrapper = $(isKey ? '.setting-list-object-input-key' : '.setting-list-object-input-value');
            const inputBox = new inputBox_1.$sR(wrapper, this.n, {
                placeholder: isKey
                    ? (0, nls_1.localize)(25, null)
                    : (0, nls_1.localize)(26, null),
                inputBoxStyles: (0, defaultStyles_1.$t2)({
                    inputBackground: settingsEditorColorRegistry_1.$$Cb,
                    inputForeground: settingsEditorColorRegistry_1.$_Cb,
                    inputBorder: settingsEditorColorRegistry_1.$aDb
                })
            });
            inputBox.element.classList.add('setting-list-object-input');
            this.h.add(inputBox);
            inputBox.value = keyOrValue.data;
            this.h.add(inputBox.onDidChange(value => update({ ...keyOrValue, data: value })));
            const onKeyDown = (e) => {
                if (e.equals(3 /* KeyCode.Enter */)) {
                    this.I(originalItem, changedItem, idx);
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
            };
            this.h.add(DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_DOWN, onKeyDown));
            return { widget: inputBox, element: wrapper };
        }
        ib(keyOrValue, { isKey, changedItem, update }) {
            const selectBox = this.G(keyOrValue);
            const changedKeyOrValue = isKey ? changedItem.key : changedItem.value;
            this.h.add(selectBox.onDidSelect(({ selected }) => update(changedKeyOrValue.type === 'boolean'
                ? { ...changedKeyOrValue, data: selected === 'true' ? true : false }
                : { ...changedKeyOrValue, data: selected })));
            const wrapper = $('.setting-list-object-input');
            wrapper.classList.add(isKey ? 'setting-list-object-input-key' : 'setting-list-object-input-value');
            selectBox.render(wrapper);
            // Switch to the first item if the user set something invalid in the json
            const selected = keyOrValue.options.findIndex(option => keyOrValue.data === option.value);
            if (selected === -1 && keyOrValue.options.length) {
                update(changedKeyOrValue.type === 'boolean'
                    ? { ...changedKeyOrValue, data: true }
                    : { ...changedKeyOrValue, data: keyOrValue.options[0].value });
            }
            else if (changedKeyOrValue.type === 'boolean') {
                // https://github.com/microsoft/vscode/issues/129581
                update({ ...changedKeyOrValue, data: keyOrValue.data === 'true' });
            }
            return { widget: selectBox, element: wrapper };
        }
        jb(originalValue, previousValue, newValue) {
            // suggestion is exactly the same
            if (newValue.type !== 'enum' && newValue.type === previousValue.type && newValue.data === previousValue.data) {
                return false;
            }
            // item is new, use suggestion
            if (originalValue.data === '') {
                return true;
            }
            if (previousValue.type === newValue.type && newValue.type !== 'enum') {
                return false;
            }
            // check if all enum options are the same
            if (previousValue.type === 'enum' && newValue.type === 'enum') {
                const previousEnums = new Set(previousValue.options.map(({ value }) => value));
                newValue.options.forEach(({ value }) => previousEnums.delete(value));
                // all options are the same
                if (previousEnums.size === 0) {
                    return false;
                }
            }
            return true;
        }
        y(rowElementGroup, item) {
            const { keyElement, valueElement, rowElement } = rowElementGroup;
            const accessibleDescription = (0, nls_1.localize)(27, null, item.key.data, item.value.data);
            const keyDescription = this.lb(item.key) ?? item.keyDescription ?? accessibleDescription;
            keyElement.title = keyDescription;
            const valueDescription = this.lb(item.value) ?? accessibleDescription;
            valueElement.title = valueDescription;
            rowElement.setAttribute('aria-label', accessibleDescription);
        }
        lb(keyOrValue) {
            const enumDescription = keyOrValue.type === 'enum'
                ? keyOrValue.options.find(({ value }) => keyOrValue.data === value)?.description
                : undefined;
            return enumDescription;
        }
        z() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(28, null),
                resetActionTooltip: (0, nls_1.localize)(29, null),
                editActionTooltip: (0, nls_1.localize)(30, null),
                addButtonLabel: (0, nls_1.localize)(31, null),
                keyHeaderText: (0, nls_1.localize)(32, null),
                valueHeaderText: (0, nls_1.localize)(33, null),
            };
        }
    }
    exports.$HDb = $HDb;
    class $IDb extends $DDb {
        constructor() {
            super(...arguments);
            this.U = '';
        }
        setValue(listData, options) {
            if ((0, types_1.$rf)(options) && options.settingKey !== this.U) {
                this.g.setEditKey('none');
                this.g.select(null);
                this.U = options.settingKey;
            }
            super.setValue(listData);
        }
        isItemNew(item) {
            return !item.key.data && !item.value.data;
        }
        r() {
            return {
                key: { type: 'string', data: '' },
                value: { type: 'boolean', data: false },
                removable: false
            };
        }
        s() {
            return ['setting-list-object-widget'];
        }
        t(item, idx) {
            return [];
        }
        D() {
            return false;
        }
        C() {
            return undefined;
        }
        J(item, idx, listFocused) {
            const rowElement = this.w(item, idx);
            rowElement.setAttribute('role', 'listitem');
            return rowElement;
        }
        u(item, idx) {
            // Return just the containers, since we always render in edit mode anyway
            const rowElement = $('.blank-row');
            const keyElement = $('.blank-row-key');
            return { rowElement, keyElement };
        }
        w(item, idx) {
            const rowElement = $('.setting-list-edit-row.setting-list-object-row.setting-item-bool');
            const changedItem = { ...item };
            const onValueChange = (newValue) => {
                changedItem.value.data = newValue;
                this.I(item, changedItem, idx);
            };
            const checkboxDescription = item.keyDescription ? `${item.keyDescription} (${item.key.data})` : item.key.data;
            const { element, widget: checkbox } = this.eb(changedItem.value.data, checkboxDescription, onValueChange);
            rowElement.appendChild(element);
            const valueElement = DOM.$0O(rowElement, $('.setting-list-object-value'));
            valueElement.textContent = checkboxDescription;
            // We add the tooltips here, because the method is not called by default
            // for widgets in edit mode
            const rowElementGroup = { rowElement, keyElement: valueElement, valueElement: checkbox.domNode };
            this.y(rowElementGroup, item);
            this.B(DOM.$nO(valueElement, DOM.$3O.MOUSE_DOWN, e => {
                const targetElement = e.target;
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    checkbox.checked = !checkbox.checked;
                    onValueChange(checkbox.checked);
                }
                DOM.$5O.stop(e);
            }));
            return rowElement;
        }
        eb(value, checkboxDescription, onValueChange) {
            const checkbox = new toggle_1.$KQ({
                icon: codicons_1.$Pj.check,
                actionClassName: 'setting-value-checkbox',
                isChecked: value,
                title: checkboxDescription,
                ...toggle_1.$IQ
            });
            this.h.add(checkbox);
            const wrapper = $('.setting-list-object-input');
            wrapper.classList.add('setting-list-object-input-key-checkbox');
            checkbox.domNode.classList.add('setting-value-checkbox');
            wrapper.appendChild(checkbox.domNode);
            this.B(DOM.$nO(wrapper, DOM.$3O.MOUSE_DOWN, e => {
                checkbox.checked = !checkbox.checked;
                onValueChange(checkbox.checked);
                // Without this line, the settings editor assumes
                // we lost focus on this setting completely.
                e.stopImmediatePropagation();
            }));
            return { widget: checkbox, element: wrapper };
        }
        y(rowElementGroup, item) {
            const accessibleDescription = (0, nls_1.localize)(34, null, item.key.data, item.value.data);
            const title = item.keyDescription ?? accessibleDescription;
            const { rowElement, keyElement, valueElement } = rowElementGroup;
            keyElement.title = title;
            valueElement.setAttribute('aria-label', accessibleDescription);
            rowElement.setAttribute('aria-label', accessibleDescription);
        }
        z() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(35, null),
                resetActionTooltip: (0, nls_1.localize)(36, null),
                editActionTooltip: (0, nls_1.localize)(37, null),
                addButtonLabel: (0, nls_1.localize)(38, null),
                keyHeaderText: (0, nls_1.localize)(39, null),
                valueHeaderText: (0, nls_1.localize)(40, null),
            };
        }
    }
    exports.$IDb = $IDb;
});
//# sourceMappingURL=settingsWidgets.js.map