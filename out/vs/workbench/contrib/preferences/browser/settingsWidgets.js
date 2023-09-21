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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/settingsWidgets"], function (require, exports, canIUse_1, DOM, actionbar_1, button_1, toggle_1, inputBox_1, selectBox_1, async_1, codicons_1, event_1, lifecycle_1, platform_1, types_1, nls_1, contextView_1, themeService_1, themables_1, preferencesIcons_1, settingsEditorColorRegistry_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectSettingCheckboxWidget = exports.ObjectSettingDropdownWidget = exports.IncludeSettingWidget = exports.ExcludeSettingWidget = exports.ListSettingWidget = exports.AbstractListSettingWidget = exports.ListSettingListModel = void 0;
    const $ = DOM.$;
    class ListSettingListModel {
        get items() {
            const items = this._dataItems.map((item, i) => {
                const editing = typeof this._editKey === 'number' && this._editKey === i;
                return {
                    ...item,
                    editing,
                    selected: i === this._selectedIdx || editing
                };
            });
            if (this._editKey === 'create') {
                items.push({
                    editing: true,
                    selected: true,
                    ...this._newDataItem,
                });
            }
            return items;
        }
        constructor(newItem) {
            this._dataItems = [];
            this._editKey = null;
            this._selectedIdx = null;
            this._newDataItem = newItem;
        }
        setEditKey(key) {
            this._editKey = key;
        }
        setValue(listData) {
            this._dataItems = listData;
        }
        select(idx) {
            this._selectedIdx = idx;
        }
        getSelected() {
            return this._selectedIdx;
        }
        selectNext() {
            if (typeof this._selectedIdx === 'number') {
                this._selectedIdx = Math.min(this._selectedIdx + 1, this._dataItems.length - 1);
            }
            else {
                this._selectedIdx = 0;
            }
        }
        selectPrevious() {
            if (typeof this._selectedIdx === 'number') {
                this._selectedIdx = Math.max(this._selectedIdx - 1, 0);
            }
            else {
                this._selectedIdx = 0;
            }
        }
    }
    exports.ListSettingListModel = ListSettingListModel;
    let AbstractListSettingWidget = class AbstractListSettingWidget extends lifecycle_1.Disposable {
        get domNode() {
            return this.listElement;
        }
        get items() {
            return this.model.items;
        }
        get inReadMode() {
            return this.model.items.every(item => !item.editing);
        }
        constructor(container, themeService, contextViewService) {
            super();
            this.container = container;
            this.themeService = themeService;
            this.contextViewService = contextViewService;
            this.rowElements = [];
            this._onDidChangeList = this._register(new event_1.Emitter());
            this.model = new ListSettingListModel(this.getEmptyItem());
            this.listDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onDidChangeList = this._onDidChangeList.event;
            this.listElement = DOM.append(container, $('div'));
            this.listElement.setAttribute('role', 'list');
            this.getContainerClasses().forEach(c => this.listElement.classList.add(c));
            DOM.append(container, this.renderAddButton());
            this.renderList();
            this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.POINTER_DOWN, e => this.onListClick(e)));
            this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.DBLCLICK, e => this.onListDoubleClick(e)));
            this._register(DOM.addStandardDisposableListener(this.listElement, 'keydown', (e) => {
                if (e.equals(16 /* KeyCode.UpArrow */)) {
                    this.selectPreviousRow();
                }
                else if (e.equals(18 /* KeyCode.DownArrow */)) {
                    this.selectNextRow();
                }
                else {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
        }
        setValue(listData) {
            this.model.setValue(listData);
            this.renderList();
        }
        renderHeader() {
            return;
        }
        isAddButtonVisible() {
            return true;
        }
        renderList() {
            const focused = DOM.isAncestor(document.activeElement, this.listElement);
            DOM.clearNode(this.listElement);
            this.listDisposables.clear();
            const newMode = this.model.items.some(item => !!(item.editing && this.isItemNew(item)));
            this.container.classList.toggle('setting-list-hide-add-button', !this.isAddButtonVisible() || newMode);
            if (this.model.items.length) {
                this.listElement.tabIndex = 0;
            }
            else {
                this.listElement.removeAttribute('tabIndex');
            }
            const header = this.renderHeader();
            if (header) {
                this.listElement.appendChild(header);
            }
            this.rowElements = this.model.items.map((item, i) => this.renderDataOrEditItem(item, i, focused));
            this.rowElements.forEach(rowElement => this.listElement.appendChild(rowElement));
        }
        createBasicSelectBox(value) {
            const selectBoxOptions = value.options.map(({ value, description }) => ({ text: value, description }));
            const selected = value.options.findIndex(option => value.data === option.value);
            const styles = (0, defaultStyles_1.getSelectBoxStyles)({
                selectBackground: settingsEditorColorRegistry_1.settingsSelectBackground,
                selectForeground: settingsEditorColorRegistry_1.settingsSelectForeground,
                selectBorder: settingsEditorColorRegistry_1.settingsSelectBorder,
                selectListBorder: settingsEditorColorRegistry_1.settingsSelectListBorder
            });
            const selectBox = new selectBox_1.SelectBox(selectBoxOptions, selected, this.contextViewService, styles, {
                useCustomDrawn: !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)
            });
            return selectBox;
        }
        editSetting(idx) {
            this.model.setEditKey(idx);
            this.renderList();
        }
        cancelEdit() {
            this.model.setEditKey('none');
            this.renderList();
        }
        handleItemChange(originalItem, changedItem, idx) {
            this.model.setEditKey('none');
            this._onDidChangeList.fire({
                originalItem,
                item: changedItem,
                targetIndex: idx,
            });
            this.renderList();
        }
        renderDataOrEditItem(item, idx, listFocused) {
            const rowElement = item.editing ?
                this.renderEdit(item, idx) :
                this.renderDataItem(item, idx, listFocused);
            rowElement.setAttribute('role', 'listitem');
            return rowElement;
        }
        renderDataItem(item, idx, listFocused) {
            const rowElementGroup = this.renderItem(item, idx);
            const rowElement = rowElementGroup.rowElement;
            rowElement.setAttribute('data-index', idx + '');
            rowElement.setAttribute('tabindex', item.selected ? '0' : '-1');
            rowElement.classList.toggle('selected', item.selected);
            const actionBar = new actionbar_1.ActionBar(rowElement);
            this.listDisposables.add(actionBar);
            actionBar.push(this.getActionsForItem(item, idx), { icon: true, label: true });
            this.addTooltipsToRow(rowElementGroup, item);
            if (item.selected && listFocused) {
                this.listDisposables.add((0, async_1.disposableTimeout)(() => rowElement.focus()));
            }
            this.listDisposables.add(DOM.addDisposableListener(rowElement, 'click', (e) => {
                // There is a parent list widget, which is the one that holds the list of settings.
                // Prevent the parent widget from trying to interpret this click event.
                e.stopPropagation();
            }));
            return rowElement;
        }
        renderAddButton() {
            const rowElement = $('.setting-list-new-row');
            const startAddButton = this._register(new button_1.Button(rowElement, defaultStyles_1.defaultButtonStyles));
            startAddButton.label = this.getLocalizedStrings().addButtonLabel;
            startAddButton.element.classList.add('setting-list-addButton');
            this._register(startAddButton.onDidClick(() => {
                this.model.setEditKey('create');
                this.renderList();
            }));
            return rowElement;
        }
        onListClick(e) {
            const targetIdx = this.getClickedItemIndex(e);
            if (targetIdx < 0) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this.model.getSelected() === targetIdx) {
                return;
            }
            this.selectRow(targetIdx);
        }
        onListDoubleClick(e) {
            const targetIdx = this.getClickedItemIndex(e);
            if (targetIdx < 0) {
                return;
            }
            const item = this.model.items[targetIdx];
            if (item) {
                this.editSetting(targetIdx);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        getClickedItemIndex(e) {
            if (!e.target) {
                return -1;
            }
            const actionbar = DOM.findParentWithClass(e.target, 'monaco-action-bar');
            if (actionbar) {
                // Don't handle doubleclicks inside the action bar
                return -1;
            }
            const element = DOM.findParentWithClass(e.target, 'setting-list-row');
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
        selectRow(idx) {
            this.model.select(idx);
            this.rowElements.forEach(row => row.classList.remove('selected'));
            const selectedRow = this.rowElements[this.model.getSelected()];
            selectedRow.classList.add('selected');
            selectedRow.focus();
        }
        selectNextRow() {
            this.model.selectNext();
            this.selectRow(this.model.getSelected());
        }
        selectPreviousRow() {
            this.model.selectPrevious();
            this.selectRow(this.model.getSelected());
        }
    };
    exports.AbstractListSettingWidget = AbstractListSettingWidget;
    exports.AbstractListSettingWidget = AbstractListSettingWidget = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, contextView_1.IContextViewService)
    ], AbstractListSettingWidget);
    class ListSettingWidget extends AbstractListSettingWidget {
        constructor() {
            super(...arguments);
            this.showAddButton = true;
        }
        setValue(listData, options) {
            this.keyValueSuggester = options?.keySuggester;
            this.showAddButton = options?.showAddButton ?? true;
            super.setValue(listData);
        }
        getEmptyItem() {
            return {
                value: {
                    type: 'string',
                    data: ''
                }
            };
        }
        isAddButtonVisible() {
            return this.showAddButton;
        }
        getContainerClasses() {
            return ['setting-list-widget'];
        }
        getActionsForItem(item, idx) {
            return [
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.getLocalizedStrings().editActionTooltip,
                    run: () => this.editSetting(idx)
                },
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsRemoveIcon),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.getLocalizedStrings().deleteActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                }
            ];
        }
        getDragImage(item) {
            const dragImage = $('.monaco-drag-image');
            dragImage.textContent = item.value.data;
            return dragImage;
        }
        renderItem(item, idx) {
            const rowElement = $('.setting-list-row');
            const valueElement = DOM.append(rowElement, $('.setting-list-value'));
            const siblingElement = DOM.append(rowElement, $('.setting-list-sibling'));
            valueElement.textContent = item.value.data.toString();
            siblingElement.textContent = item.sibling ? `when: ${item.sibling}` : null;
            this.addDragAndDrop(rowElement, item, idx);
            return { rowElement, keyElement: valueElement, valueElement: siblingElement };
        }
        addDragAndDrop(rowElement, item, idx) {
            if (this.inReadMode) {
                rowElement.draggable = true;
                rowElement.classList.add('draggable');
            }
            else {
                rowElement.draggable = false;
                rowElement.classList.remove('draggable');
            }
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DRAG_START, (ev) => {
                this.dragDetails = {
                    element: rowElement,
                    item,
                    itemIndex: idx
                };
                if (ev.dataTransfer) {
                    ev.dataTransfer.dropEffect = 'move';
                    const dragImage = this.getDragImage(item);
                    document.body.appendChild(dragImage);
                    ev.dataTransfer.setDragImage(dragImage, -10, -10);
                    setTimeout(() => document.body.removeChild(dragImage), 0);
                }
            }));
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DRAG_OVER, (ev) => {
                if (!this.dragDetails) {
                    return false;
                }
                ev.preventDefault();
                if (ev.dataTransfer) {
                    ev.dataTransfer.dropEffect = 'move';
                }
                return true;
            }));
            let counter = 0;
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DRAG_ENTER, (ev) => {
                counter++;
                rowElement.classList.add('drag-hover');
            }));
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DRAG_LEAVE, (ev) => {
                counter--;
                if (!counter) {
                    rowElement.classList.remove('drag-hover');
                }
            }));
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DROP, (ev) => {
                // cancel the op if we dragged to a completely different setting
                if (!this.dragDetails) {
                    return false;
                }
                ev.preventDefault();
                counter = 0;
                if (this.dragDetails.element !== rowElement) {
                    this._onDidChangeList.fire({
                        originalItem: this.dragDetails.item,
                        sourceIndex: this.dragDetails.itemIndex,
                        item,
                        targetIndex: idx
                    });
                }
                return true;
            }));
            this.listDisposables.add(DOM.addDisposableListener(rowElement, DOM.EventType.DRAG_END, (ev) => {
                counter = 0;
                rowElement.classList.remove('drag-hover');
                ev.dataTransfer?.clearData();
                if (this.dragDetails) {
                    this.dragDetails = undefined;
                }
            }));
        }
        renderEdit(item, idx) {
            const rowElement = $('.setting-list-edit-row');
            let valueInput;
            let currentDisplayValue;
            let currentEnumOptions;
            if (this.keyValueSuggester) {
                const enumData = this.keyValueSuggester(this.model.items.map(({ value: { data } }) => data), idx);
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
                    valueInput = this.renderInputBox(item.value, rowElement);
                    break;
                case 'enum':
                    valueInput = this.renderDropdown(item.value, rowElement);
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
                    this.handleItemChange(item, updatedInputBoxItem(), idx);
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
                rowElement?.focus();
            };
            if (item.value.type !== 'string') {
                const selectBox = valueInput;
                this.listDisposables.add(selectBox.onDidSelect(({ selected }) => {
                    currentDisplayValue = selected;
                }));
            }
            else {
                const inputBox = valueInput;
                this.listDisposables.add(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            }
            let siblingInput;
            if (!(0, types_1.isUndefinedOrNull)(item.sibling)) {
                siblingInput = new inputBox_1.InputBox(rowElement, this.contextViewService, {
                    placeholder: this.getLocalizedStrings().siblingInputPlaceholder,
                    inputBoxStyles: (0, defaultStyles_1.getInputBoxStyle)({
                        inputBackground: settingsEditorColorRegistry_1.settingsTextInputBackground,
                        inputForeground: settingsEditorColorRegistry_1.settingsTextInputForeground,
                        inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                    })
                });
                siblingInput.element.classList.add('setting-list-siblingInput');
                this.listDisposables.add(siblingInput);
                siblingInput.value = item.sibling;
                this.listDisposables.add(DOM.addStandardDisposableListener(siblingInput.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            }
            else if (valueInput instanceof inputBox_1.InputBox) {
                valueInput.element.classList.add('no-sibling');
            }
            const okButton = this._register(new button_1.Button(rowElement, defaultStyles_1.defaultButtonStyles));
            okButton.label = (0, nls_1.localize)('okButton', "OK");
            okButton.element.classList.add('setting-list-ok-button');
            this.listDisposables.add(okButton.onDidClick(() => {
                if (item.value.type === 'string') {
                    this.handleItemChange(item, updatedInputBoxItem(), idx);
                }
                else {
                    this.handleItemChange(item, updatedSelectBoxItem(currentDisplayValue), idx);
                }
            }));
            const cancelButton = this._register(new button_1.Button(rowElement, { secondary: true, ...defaultStyles_1.defaultButtonStyles }));
            cancelButton.label = (0, nls_1.localize)('cancelButton', "Cancel");
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.listDisposables.add((0, async_1.disposableTimeout)(() => {
                valueInput.focus();
                if (valueInput instanceof inputBox_1.InputBox) {
                    valueInput.select();
                }
            }));
            return rowElement;
        }
        isItemNew(item) {
            return item.value.data === '';
        }
        addTooltipsToRow(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.isUndefinedOrNull)(sibling)
                ? (0, nls_1.localize)('listValueHintLabel', "List item `{0}`", value.data)
                : (0, nls_1.localize)('listSiblingHintLabel', "List item `{0}` with sibling `${1}`", value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)('removeItem', "Remove Item"),
                editActionTooltip: (0, nls_1.localize)('editItem', "Edit Item"),
                addButtonLabel: (0, nls_1.localize)('addItem', "Add Item"),
                inputPlaceholder: (0, nls_1.localize)('itemInputPlaceholder', "Item..."),
                siblingInputPlaceholder: (0, nls_1.localize)('listSiblingInputPlaceholder', "Sibling..."),
            };
        }
        renderInputBox(value, rowElement) {
            const valueInput = new inputBox_1.InputBox(rowElement, this.contextViewService, {
                placeholder: this.getLocalizedStrings().inputPlaceholder,
                inputBoxStyles: (0, defaultStyles_1.getInputBoxStyle)({
                    inputBackground: settingsEditorColorRegistry_1.settingsTextInputBackground,
                    inputForeground: settingsEditorColorRegistry_1.settingsTextInputForeground,
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                })
            });
            valueInput.element.classList.add('setting-list-valueInput');
            this.listDisposables.add(valueInput);
            valueInput.value = value.data.toString();
            return valueInput;
        }
        renderDropdown(value, rowElement) {
            if (value.type !== 'enum') {
                throw new Error('Valuetype must be enum.');
            }
            const selectBox = this.createBasicSelectBox(value);
            const wrapper = $('.setting-list-object-list-row');
            selectBox.render(wrapper);
            rowElement.appendChild(wrapper);
            return selectBox;
        }
    }
    exports.ListSettingWidget = ListSettingWidget;
    class ExcludeSettingWidget extends ListSettingWidget {
        getContainerClasses() {
            return ['setting-list-include-exclude-widget'];
        }
        addDragAndDrop(rowElement, item, idx) {
            return;
        }
        addTooltipsToRow(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.isUndefinedOrNull)(sibling)
                ? (0, nls_1.localize)('excludePatternHintLabel', "Exclude files matching `{0}`", value.data)
                : (0, nls_1.localize)('excludeSiblingHintLabel', "Exclude files matching `{0}`, only when a file matching `{1}` is present", value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)('removeExcludeItem', "Remove Exclude Item"),
                editActionTooltip: (0, nls_1.localize)('editExcludeItem', "Edit Exclude Item"),
                addButtonLabel: (0, nls_1.localize)('addPattern', "Add Pattern"),
                inputPlaceholder: (0, nls_1.localize)('excludePatternInputPlaceholder', "Exclude Pattern..."),
                siblingInputPlaceholder: (0, nls_1.localize)('excludeSiblingInputPlaceholder', "When Pattern Is Present..."),
            };
        }
    }
    exports.ExcludeSettingWidget = ExcludeSettingWidget;
    class IncludeSettingWidget extends ListSettingWidget {
        getContainerClasses() {
            return ['setting-list-include-exclude-widget'];
        }
        addDragAndDrop(rowElement, item, idx) {
            return;
        }
        addTooltipsToRow(rowElementGroup, { value, sibling }) {
            const title = (0, types_1.isUndefinedOrNull)(sibling)
                ? (0, nls_1.localize)('includePatternHintLabel', "Include files matching `{0}`", value.data)
                : (0, nls_1.localize)('includeSiblingHintLabel', "Include files matching `{0}`, only when a file matching `{1}` is present", value.data, sibling);
            const { rowElement } = rowElementGroup;
            rowElement.title = title;
            rowElement.setAttribute('aria-label', rowElement.title);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)('removeIncludeItem', "Remove Include Item"),
                editActionTooltip: (0, nls_1.localize)('editIncludeItem', "Edit Include Item"),
                addButtonLabel: (0, nls_1.localize)('addPattern', "Add Pattern"),
                inputPlaceholder: (0, nls_1.localize)('includePatternInputPlaceholder', "Include Pattern..."),
                siblingInputPlaceholder: (0, nls_1.localize)('includeSiblingInputPlaceholder', "When Pattern Is Present..."),
            };
        }
    }
    exports.IncludeSettingWidget = IncludeSettingWidget;
    class ObjectSettingDropdownWidget extends AbstractListSettingWidget {
        constructor() {
            super(...arguments);
            this.currentSettingKey = '';
            this.showAddButton = true;
            this.keySuggester = () => undefined;
            this.valueSuggester = () => undefined;
        }
        setValue(listData, options) {
            this.showAddButton = options?.showAddButton ?? this.showAddButton;
            this.keySuggester = options?.keySuggester ?? this.keySuggester;
            this.valueSuggester = options?.valueSuggester ?? this.valueSuggester;
            if ((0, types_1.isDefined)(options) && options.settingKey !== this.currentSettingKey) {
                this.model.setEditKey('none');
                this.model.select(null);
                this.currentSettingKey = options.settingKey;
            }
            super.setValue(listData);
        }
        isItemNew(item) {
            return item.key.data === '' && item.value.data === '';
        }
        isAddButtonVisible() {
            return this.showAddButton;
        }
        getEmptyItem() {
            return {
                key: { type: 'string', data: '' },
                value: { type: 'string', data: '' },
                removable: true,
            };
        }
        getContainerClasses() {
            return ['setting-list-object-widget'];
        }
        getActionsForItem(item, idx) {
            const actions = [
                {
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.getLocalizedStrings().editActionTooltip,
                    run: () => this.editSetting(idx)
                },
            ];
            if (item.removable) {
                actions.push({
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsRemoveIcon),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.getLocalizedStrings().deleteActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            else {
                actions.push({
                    class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsDiscardIcon),
                    enabled: true,
                    id: 'workbench.action.resetListItem',
                    tooltip: this.getLocalizedStrings().resetActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            return actions;
        }
        renderHeader() {
            const header = $('.setting-list-row-header');
            const keyHeader = DOM.append(header, $('.setting-list-object-key'));
            const valueHeader = DOM.append(header, $('.setting-list-object-value'));
            const { keyHeaderText, valueHeaderText } = this.getLocalizedStrings();
            keyHeader.textContent = keyHeaderText;
            valueHeader.textContent = valueHeaderText;
            return header;
        }
        renderItem(item, idx) {
            const rowElement = $('.setting-list-row');
            rowElement.classList.add('setting-list-object-row');
            const keyElement = DOM.append(rowElement, $('.setting-list-object-key'));
            const valueElement = DOM.append(rowElement, $('.setting-list-object-value'));
            keyElement.textContent = item.key.data;
            valueElement.textContent = item.value.data.toString();
            return { rowElement, keyElement, valueElement };
        }
        renderEdit(item, idx) {
            const rowElement = $('.setting-list-edit-row.setting-list-object-row');
            const changedItem = { ...item };
            const onKeyChange = (key) => {
                changedItem.key = key;
                okButton.enabled = key.data !== '';
                const suggestedValue = this.valueSuggester(key.data) ?? item.value;
                if (this.shouldUseSuggestion(item.value, changedItem.value, suggestedValue)) {
                    onValueChange(suggestedValue);
                    renderLatestValue();
                }
            };
            const onValueChange = (value) => {
                changedItem.value = value;
            };
            let keyWidget;
            let keyElement;
            if (this.showAddButton) {
                if (this.isItemNew(item)) {
                    const suggestedKey = this.keySuggester(this.model.items.map(({ key: { data } }) => data));
                    if ((0, types_1.isDefined)(suggestedKey)) {
                        changedItem.key = suggestedKey;
                        const suggestedValue = this.valueSuggester(changedItem.key.data);
                        onValueChange(suggestedValue ?? changedItem.value);
                    }
                }
                const { widget, element } = this.renderEditWidget(changedItem.key, {
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
                const { widget, element } = this.renderEditWidget(changedItem.value, {
                    idx,
                    isKey: false,
                    originalItem: item,
                    changedItem,
                    update: onValueChange,
                });
                valueWidget = widget;
                DOM.clearNode(valueContainer);
                valueContainer.append(element);
            };
            renderLatestValue();
            rowElement.append(keyElement, valueContainer);
            const okButton = this._register(new button_1.Button(rowElement, defaultStyles_1.defaultButtonStyles));
            okButton.enabled = changedItem.key.data !== '';
            okButton.label = (0, nls_1.localize)('okButton', "OK");
            okButton.element.classList.add('setting-list-ok-button');
            this.listDisposables.add(okButton.onDidClick(() => this.handleItemChange(item, changedItem, idx)));
            const cancelButton = this._register(new button_1.Button(rowElement, { secondary: true, ...defaultStyles_1.defaultButtonStyles }));
            cancelButton.label = (0, nls_1.localize)('cancelButton', "Cancel");
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.listDisposables.add((0, async_1.disposableTimeout)(() => {
                const widget = keyWidget ?? valueWidget;
                widget.focus();
                if (widget instanceof inputBox_1.InputBox) {
                    widget.select();
                }
            }));
            return rowElement;
        }
        renderEditWidget(keyOrValue, options) {
            switch (keyOrValue.type) {
                case 'string':
                    return this.renderStringEditWidget(keyOrValue, options);
                case 'enum':
                    return this.renderEnumEditWidget(keyOrValue, options);
                case 'boolean':
                    return this.renderEnumEditWidget({
                        type: 'enum',
                        data: keyOrValue.data.toString(),
                        options: [{ value: 'true' }, { value: 'false' }],
                    }, options);
            }
        }
        renderStringEditWidget(keyOrValue, { idx, isKey, originalItem, changedItem, update }) {
            const wrapper = $(isKey ? '.setting-list-object-input-key' : '.setting-list-object-input-value');
            const inputBox = new inputBox_1.InputBox(wrapper, this.contextViewService, {
                placeholder: isKey
                    ? (0, nls_1.localize)('objectKeyInputPlaceholder', "Key")
                    : (0, nls_1.localize)('objectValueInputPlaceholder', "Value"),
                inputBoxStyles: (0, defaultStyles_1.getInputBoxStyle)({
                    inputBackground: settingsEditorColorRegistry_1.settingsTextInputBackground,
                    inputForeground: settingsEditorColorRegistry_1.settingsTextInputForeground,
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                })
            });
            inputBox.element.classList.add('setting-list-object-input');
            this.listDisposables.add(inputBox);
            inputBox.value = keyOrValue.data;
            this.listDisposables.add(inputBox.onDidChange(value => update({ ...keyOrValue, data: value })));
            const onKeyDown = (e) => {
                if (e.equals(3 /* KeyCode.Enter */)) {
                    this.handleItemChange(originalItem, changedItem, idx);
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
            };
            this.listDisposables.add(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            return { widget: inputBox, element: wrapper };
        }
        renderEnumEditWidget(keyOrValue, { isKey, changedItem, update }) {
            const selectBox = this.createBasicSelectBox(keyOrValue);
            const changedKeyOrValue = isKey ? changedItem.key : changedItem.value;
            this.listDisposables.add(selectBox.onDidSelect(({ selected }) => update(changedKeyOrValue.type === 'boolean'
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
        shouldUseSuggestion(originalValue, previousValue, newValue) {
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
        addTooltipsToRow(rowElementGroup, item) {
            const { keyElement, valueElement, rowElement } = rowElementGroup;
            const accessibleDescription = (0, nls_1.localize)('objectPairHintLabel', "The property `{0}` is set to `{1}`.", item.key.data, item.value.data);
            const keyDescription = this.getEnumDescription(item.key) ?? item.keyDescription ?? accessibleDescription;
            keyElement.title = keyDescription;
            const valueDescription = this.getEnumDescription(item.value) ?? accessibleDescription;
            valueElement.title = valueDescription;
            rowElement.setAttribute('aria-label', accessibleDescription);
        }
        getEnumDescription(keyOrValue) {
            const enumDescription = keyOrValue.type === 'enum'
                ? keyOrValue.options.find(({ value }) => keyOrValue.data === value)?.description
                : undefined;
            return enumDescription;
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)('removeItem', "Remove Item"),
                resetActionTooltip: (0, nls_1.localize)('resetItem', "Reset Item"),
                editActionTooltip: (0, nls_1.localize)('editItem', "Edit Item"),
                addButtonLabel: (0, nls_1.localize)('addItem', "Add Item"),
                keyHeaderText: (0, nls_1.localize)('objectKeyHeader', "Item"),
                valueHeaderText: (0, nls_1.localize)('objectValueHeader', "Value"),
            };
        }
    }
    exports.ObjectSettingDropdownWidget = ObjectSettingDropdownWidget;
    class ObjectSettingCheckboxWidget extends AbstractListSettingWidget {
        constructor() {
            super(...arguments);
            this.currentSettingKey = '';
        }
        setValue(listData, options) {
            if ((0, types_1.isDefined)(options) && options.settingKey !== this.currentSettingKey) {
                this.model.setEditKey('none');
                this.model.select(null);
                this.currentSettingKey = options.settingKey;
            }
            super.setValue(listData);
        }
        isItemNew(item) {
            return !item.key.data && !item.value.data;
        }
        getEmptyItem() {
            return {
                key: { type: 'string', data: '' },
                value: { type: 'boolean', data: false },
                removable: false
            };
        }
        getContainerClasses() {
            return ['setting-list-object-widget'];
        }
        getActionsForItem(item, idx) {
            return [];
        }
        isAddButtonVisible() {
            return false;
        }
        renderHeader() {
            return undefined;
        }
        renderDataOrEditItem(item, idx, listFocused) {
            const rowElement = this.renderEdit(item, idx);
            rowElement.setAttribute('role', 'listitem');
            return rowElement;
        }
        renderItem(item, idx) {
            // Return just the containers, since we always render in edit mode anyway
            const rowElement = $('.blank-row');
            const keyElement = $('.blank-row-key');
            return { rowElement, keyElement };
        }
        renderEdit(item, idx) {
            const rowElement = $('.setting-list-edit-row.setting-list-object-row.setting-item-bool');
            const changedItem = { ...item };
            const onValueChange = (newValue) => {
                changedItem.value.data = newValue;
                this.handleItemChange(item, changedItem, idx);
            };
            const checkboxDescription = item.keyDescription ? `${item.keyDescription} (${item.key.data})` : item.key.data;
            const { element, widget: checkbox } = this.renderEditWidget(changedItem.value.data, checkboxDescription, onValueChange);
            rowElement.appendChild(element);
            const valueElement = DOM.append(rowElement, $('.setting-list-object-value'));
            valueElement.textContent = checkboxDescription;
            // We add the tooltips here, because the method is not called by default
            // for widgets in edit mode
            const rowElementGroup = { rowElement, keyElement: valueElement, valueElement: checkbox.domNode };
            this.addTooltipsToRow(rowElementGroup, item);
            this._register(DOM.addDisposableListener(valueElement, DOM.EventType.MOUSE_DOWN, e => {
                const targetElement = e.target;
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    checkbox.checked = !checkbox.checked;
                    onValueChange(checkbox.checked);
                }
                DOM.EventHelper.stop(e);
            }));
            return rowElement;
        }
        renderEditWidget(value, checkboxDescription, onValueChange) {
            const checkbox = new toggle_1.Toggle({
                icon: codicons_1.Codicon.check,
                actionClassName: 'setting-value-checkbox',
                isChecked: value,
                title: checkboxDescription,
                ...toggle_1.unthemedToggleStyles
            });
            this.listDisposables.add(checkbox);
            const wrapper = $('.setting-list-object-input');
            wrapper.classList.add('setting-list-object-input-key-checkbox');
            checkbox.domNode.classList.add('setting-value-checkbox');
            wrapper.appendChild(checkbox.domNode);
            this._register(DOM.addDisposableListener(wrapper, DOM.EventType.MOUSE_DOWN, e => {
                checkbox.checked = !checkbox.checked;
                onValueChange(checkbox.checked);
                // Without this line, the settings editor assumes
                // we lost focus on this setting completely.
                e.stopImmediatePropagation();
            }));
            return { widget: checkbox, element: wrapper };
        }
        addTooltipsToRow(rowElementGroup, item) {
            const accessibleDescription = (0, nls_1.localize)('objectPairHintLabel', "The property `{0}` is set to `{1}`.", item.key.data, item.value.data);
            const title = item.keyDescription ?? accessibleDescription;
            const { rowElement, keyElement, valueElement } = rowElementGroup;
            keyElement.title = title;
            valueElement.setAttribute('aria-label', accessibleDescription);
            rowElement.setAttribute('aria-label', accessibleDescription);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)('removeItem', "Remove Item"),
                resetActionTooltip: (0, nls_1.localize)('resetItem', "Reset Item"),
                editActionTooltip: (0, nls_1.localize)('editItem', "Edit Item"),
                addButtonLabel: (0, nls_1.localize)('addItem', "Add Item"),
                keyHeaderText: (0, nls_1.localize)('objectKeyHeader', "Item"),
                valueHeaderText: (0, nls_1.localize)('objectValueHeader', "Value"),
            };
        }
    }
    exports.ObjectSettingCheckboxWidget = ObjectSettingCheckboxWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NXaWRnZXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9zZXR0aW5nc1dpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBZWhCLE1BQWEsb0JBQW9CO1FBTWhDLElBQUksS0FBSztZQUNSLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3QyxNQUFNLE9BQU8sR0FBRyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDO2dCQUN6RSxPQUFPO29CQUNOLEdBQUcsSUFBSTtvQkFDUCxPQUFPO29CQUNQLFFBQVEsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksSUFBSSxPQUFPO2lCQUM1QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUMvQixLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNWLE9BQU8sRUFBRSxJQUFJO29CQUNiLFFBQVEsRUFBRSxJQUFJO29CQUNkLEdBQUcsSUFBSSxDQUFDLFlBQVk7aUJBQ3BCLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsWUFBWSxPQUFrQjtZQTFCcEIsZUFBVSxHQUFnQixFQUFFLENBQUM7WUFDL0IsYUFBUSxHQUFtQixJQUFJLENBQUM7WUFDaEMsaUJBQVksR0FBa0IsSUFBSSxDQUFDO1lBeUIxQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztR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