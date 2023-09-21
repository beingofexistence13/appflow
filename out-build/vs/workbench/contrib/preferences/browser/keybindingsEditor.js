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
define(["require", "exports", "vs/nls!vs/workbench/contrib/preferences/browser/keybindingsEditor", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/browser/keybindingsEditorModel", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/platform/contextview/browser/contextView", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorExtensions", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/actions/common/actions", "vs/workbench/common/theme", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/keyboardEvent", "vs/base/common/types", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/keybindingsEditor"], function (require, exports, nls_1, async_1, DOM, platform_1, lifecycle_1, toggle_1, highlightedLabel_1, keybindingLabel_1, actions_1, actionbar_1, editorPane_1, telemetry_1, clipboardService_1, keybindingsEditorModel_1, instantiation_1, keybinding_1, keybindingWidgets_1, preferences_1, contextView_1, keybindingEditing_1, themeService_1, themables_1, contextkey_1, colorRegistry_1, editorService_1, editorExtensions_1, listService_1, notification_1, storage_1, event_1, actions_2, theme_1, preferencesIcons_1, toolbar_1, defaultStyles_1, extensions_1, keyboardEvent_1, types_1, suggestEnabledInput_1, settingsEditorColorRegistry_1, configuration_1, widgetNavigationCommands_1) {
    "use strict";
    var $hDb_1, ActionsColumnRenderer_1, SourceColumnRenderer_1, WhenColumnRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hDb = void 0;
    const $ = DOM.$;
    let $hDb = class $hDb extends editorPane_1.$0T {
        static { $hDb_1 = this; }
        static { this.ID = 'workbench.editor.keybindings'; }
        constructor(telemetryService, themeService, rb, sb, tb, ub, vb, wb, xb, yb, storageService, zb) {
            super($hDb_1.ID, telemetryService, themeService, storageService);
            this.rb = rb;
            this.sb = sb;
            this.tb = tb;
            this.ub = ub;
            this.vb = vb;
            this.wb = wb;
            this.xb = xb;
            this.yb = yb;
            this.zb = zb;
            this.a = this.B(new event_1.$fd());
            this.onDefineWhenExpression = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onRejectWhenExpression = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onAcceptWhenExpression = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onLayout = this.f.event;
            this.g = null;
            this.eb = null;
            this.fb = [];
            this.ib = null;
            this.kb = [];
            this.jb = new async_1.$Dg(300);
            this.B(rb.onDidUpdateKeybindings(() => this.Lb(!!this.mb.get())));
            this.lb = preferences_1.$kCb.bindTo(this.ub);
            this.nb = preferences_1.$lCb.bindTo(this.ub);
            this.mb = preferences_1.$mCb.bindTo(this.ub);
            this.s = new async_1.$Dg(500);
            this.pb = new actions_1.$gi(preferences_1.$rCb, (0, nls_1.localize)(0, null), themables_1.ThemeIcon.asClassName(preferencesIcons_1.$WBb));
            this.pb.checked = false;
            this.ob = new actions_1.$gi(preferences_1.$sCb, (0, nls_1.localize)(1, null), themables_1.ThemeIcon.asClassName(preferencesIcons_1.$XBb));
            this.ob.checked = false;
            this.overflowWidgetsDomNode = $('.keybindings-overflow-widgets-container.monaco-editor');
        }
        create(parent) {
            super.create(parent);
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.r.hasFocus()) {
                        this.focusKeybindings();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.r.hasFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        ab(parent) {
            const keybindingsEditorElement = DOM.$0O(parent, $('div', { class: 'keybindings-editor' }));
            this.Bb(keybindingsEditorElement);
            this.Cb(keybindingsEditorElement);
            this.Fb(keybindingsEditorElement);
            this.Jb(keybindingsEditorElement);
        }
        setInput(input, options, context, token) {
            this.lb.set(true);
            return super.setInput(input, options, context, token)
                .then(() => this.Lb(!!(options && options.preserveFocus)));
        }
        clearInput() {
            super.clearInput();
            this.lb.reset();
            this.mb.reset();
        }
        layout(dimension) {
            this.ib = dimension;
            this.Ib(dimension);
            this.u.style.width = dimension.width + 'px';
            this.u.style.height = dimension.height + 'px';
            this.y.layout(this.ib);
            this.Qb();
            this.f.fire();
        }
        focus() {
            const activeKeybindingEntry = this.activeKeybindingEntry;
            if (activeKeybindingEntry) {
                this.Tb(activeKeybindingEntry);
            }
            else if (!platform_1.$q) {
                this.r.focus();
            }
        }
        get activeKeybindingEntry() {
            const focusedElement = this.hb.getFocusedElements()[0];
            return focusedElement && focusedElement.templateId === keybindingsEditorModel_1.$Byb ? focusedElement : null;
        }
        async defineKeybinding(keybindingEntry, add) {
            this.Tb(keybindingEntry);
            this.Db();
            try {
                const key = await this.y.define();
                if (key) {
                    await this.updateKeybinding(keybindingEntry, key, keybindingEntry.keybindingItem.when, add);
                }
            }
            catch (error) {
                this.ec(error);
            }
            finally {
                this.Eb();
                this.Tb(keybindingEntry);
            }
        }
        defineWhenExpression(keybindingEntry) {
            if (keybindingEntry.keybindingItem.keybinding) {
                this.Tb(keybindingEntry);
                this.a.fire(keybindingEntry);
            }
        }
        rejectWhenExpression(keybindingEntry) {
            this.b.fire(keybindingEntry);
        }
        acceptWhenExpression(keybindingEntry) {
            this.c.fire(keybindingEntry);
        }
        async updateKeybinding(keybindingEntry, key, when, add) {
            const currentKey = keybindingEntry.keybindingItem.keybinding ? keybindingEntry.keybindingItem.keybinding.getUserSettingsLabel() : '';
            if (currentKey !== key || keybindingEntry.keybindingItem.when !== when) {
                if (add) {
                    await this.tb.addKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                else {
                    await this.tb.editKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.eb = keybindingEntry;
                }
            }
        }
        async removeKeybinding(keybindingEntry) {
            this.Tb(keybindingEntry);
            if (keybindingEntry.keybindingItem.keybinding) { // This should be a pre-condition
                try {
                    await this.tb.removeKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                    this.focus();
                }
                catch (error) {
                    this.ec(error);
                    this.Tb(keybindingEntry);
                }
            }
        }
        async resetKeybinding(keybindingEntry) {
            this.Tb(keybindingEntry);
            try {
                await this.tb.resetKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.eb = keybindingEntry;
                }
                this.Tb(keybindingEntry);
            }
            catch (error) {
                this.ec(error);
                this.Tb(keybindingEntry);
            }
        }
        async copyKeybinding(keybinding) {
            this.Tb(keybinding);
            const userFriendlyKeybinding = {
                key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() || '' : '',
                command: keybinding.keybindingItem.command
            };
            if (keybinding.keybindingItem.when) {
                userFriendlyKeybinding.when = keybinding.keybindingItem.when;
            }
            await this.wb.writeText(JSON.stringify(userFriendlyKeybinding, null, '  '));
        }
        async copyKeybindingCommand(keybinding) {
            this.Tb(keybinding);
            await this.wb.writeText(keybinding.keybindingItem.command);
        }
        async copyKeybindingCommandTitle(keybinding) {
            this.Tb(keybinding);
            await this.wb.writeText(keybinding.keybindingItem.commandLabel);
        }
        focusSearch() {
            this.r.focus();
        }
        search(filter) {
            this.focusSearch();
            this.r.setValue(filter);
            this.Tb(0);
        }
        clearSearchResults() {
            this.r.clear();
        }
        showSimilarKeybindings(keybindingEntry) {
            const value = `"${keybindingEntry.keybindingItem.keybinding.getAriaLabel()}"`;
            if (value !== this.r.getValue()) {
                this.r.setValue(value);
            }
        }
        Bb(parent) {
            this.qb = DOM.$0O(parent, DOM.$(''));
            this.qb.setAttribute('id', 'keybindings-editor-aria-label-element');
            this.qb.setAttribute('aria-live', 'assertive');
        }
        Cb(parent) {
            this.u = DOM.$0O(parent, $('.overlay-container'));
            this.u.style.position = 'absolute';
            this.u.style.zIndex = '40'; // has to greater than sash z-index which is 35
            this.y = this.B(this.xb.createInstance(keybindingWidgets_1.$_Bb, this.u));
            this.B(this.y.onDidChange(keybindingStr => this.y.printExisting(this.g.fetch(`"${keybindingStr}"`).length)));
            this.B(this.y.onShowExistingKeybidings(keybindingStr => this.r.setValue(`"${keybindingStr}"`)));
            this.Eb();
        }
        Db() {
            this.u.style.display = 'block';
        }
        Eb() {
            this.u.style.display = 'none';
        }
        Fb(parent) {
            this.j = DOM.$0O(parent, $('.keybindings-header'));
            const fullTextSearchPlaceholder = (0, nls_1.localize)(2, null);
            const keybindingsSearchPlaceholder = (0, nls_1.localize)(3, null);
            const clearInputAction = new actions_1.$gi(preferences_1.$pCb, (0, nls_1.localize)(4, null), themables_1.ThemeIcon.asClassName(preferencesIcons_1.$4Bb), false, async () => this.clearSearchResults());
            const searchContainer = DOM.$0O(this.j, $('.search-container'));
            this.r = this.B(this.xb.createInstance(keybindingWidgets_1.$$Bb, searchContainer, {
                ariaLabel: fullTextSearchPlaceholder,
                placeholder: fullTextSearchPlaceholder,
                focusKey: this.nb,
                ariaLabelledBy: 'keybindings-editor-aria-label-element',
                recordEnter: true,
                quoteRecordedKeys: true,
                history: this.F(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] || [],
                inputBoxStyles: (0, defaultStyles_1.$t2)({
                    inputBorder: settingsEditorColorRegistry_1.$aDb
                })
            }));
            this.B(this.r.onDidChange(searchValue => {
                clearInputAction.enabled = !!searchValue;
                this.jb.trigger(() => this.Nb());
                this.Gb();
            }));
            this.B(this.r.onEscape(() => this.pb.checked = false));
            this.m = DOM.$0O(searchContainer, DOM.$('.keybindings-search-actions-container'));
            const recordingBadge = this.Hb(this.m);
            this.B(this.ob.onDidChange(e => {
                if (e.checked !== undefined) {
                    this.Ob(false);
                }
                this.Gb();
            }));
            this.B(this.pb.onDidChange(e => {
                if (e.checked !== undefined) {
                    recordingBadge.classList.toggle('disabled', !e.checked);
                    if (e.checked) {
                        this.r.inputBox.setPlaceHolder(keybindingsSearchPlaceholder);
                        this.r.inputBox.setAriaLabel(keybindingsSearchPlaceholder);
                        this.r.startRecordingKeys();
                        this.r.focus();
                    }
                    else {
                        this.r.inputBox.setPlaceHolder(fullTextSearchPlaceholder);
                        this.r.inputBox.setAriaLabel(fullTextSearchPlaceholder);
                        this.r.stopRecordingKeys();
                        this.r.focus();
                    }
                    this.Gb();
                }
            }));
            const actions = [this.pb, this.ob, clearInputAction];
            const toolBar = this.B(new toolbar_1.$6R(this.m, this.sb, {
                actionViewItemProvider: (action) => {
                    if (action.id === this.ob.id || action.id === this.pb.id) {
                        return new toggle_1.$JQ(null, action, { keybinding: this.rb.lookupKeybinding(action.id)?.getLabel(), toggleStyles: defaultStyles_1.$m2 });
                    }
                    return undefined;
                },
                getKeyBinding: action => this.rb.lookupKeybinding(action.id)
            }));
            toolBar.setActions(actions);
            this.B(this.rb.onDidUpdateKeybindings(() => toolBar.setActions(actions)));
        }
        Gb() {
            const keybindingsEditorInput = this.input;
            if (keybindingsEditorInput) {
                keybindingsEditorInput.searchOptions = {
                    searchValue: this.r.getValue(),
                    recordKeybindings: !!this.pb.checked,
                    sortByPrecedence: !!this.ob.checked
                };
            }
        }
        Hb(container) {
            const recordingBadge = DOM.$0O(container, DOM.$('.recording-badge.monaco-count-badge.long.disabled'));
            recordingBadge.textContent = (0, nls_1.localize)(5, null);
            recordingBadge.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$dw);
            recordingBadge.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$ew);
            recordingBadge.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            return recordingBadge;
        }
        Ib(dimension) {
            this.r.layout(dimension);
            this.j.classList.toggle('small', dimension.width < 400);
            this.r.inputBox.inputElement.style.paddingRight = `${DOM.$HO(this.m) + 12}px`;
        }
        Jb(parent) {
            const bodyContainer = DOM.$0O(parent, $('.keybindings-body'));
            this.Kb(bodyContainer);
        }
        Kb(parent) {
            this.gb = DOM.$0O(parent, $('.keybindings-table-container'));
            this.hb = this.B(this.xb.createInstance(listService_1.$r4, 'KeybindingsEditor', this.gb, new Delegate(), [
                {
                    label: '',
                    tooltip: '',
                    weight: 0,
                    minimumWidth: 40,
                    maximumWidth: 40,
                    templateId: ActionsColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(6, null),
                    tooltip: '',
                    weight: 0.3,
                    templateId: CommandColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(7, null),
                    tooltip: '',
                    weight: 0.2,
                    templateId: KeybindingColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(8, null),
                    tooltip: '',
                    weight: 0.35,
                    templateId: WhenColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)(9, null),
                    tooltip: '',
                    weight: 0.15,
                    templateId: SourceColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this.xb.createInstance(ActionsColumnRenderer, this),
                this.xb.createInstance(CommandColumnRenderer),
                this.xb.createInstance(KeybindingColumnRenderer),
                this.xb.createInstance(WhenColumnRenderer, this),
                this.xb.createInstance(SourceColumnRenderer),
            ], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                accessibilityProvider: new AccessibilityProvider(this.zb),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.keybindingItem.commandLabel || e.keybindingItem.command },
                overrideStyles: {
                    listBackground: colorRegistry_1.$ww
                },
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                openOnSingleClick: false,
                transformOptimization: false // disable transform optimization as it causes the editor overflow widgets to be mispositioned
            }));
            this.B(this.hb.onContextMenu(e => this.Ub(e)));
            this.B(this.hb.onDidChangeFocus(e => this.Vb()));
            this.B(this.hb.onDidFocus(() => {
                this.hb.getHTMLElement().classList.add('focused');
                this.Vb();
            }));
            this.B(this.hb.onDidBlur(() => {
                this.hb.getHTMLElement().classList.remove('focused');
                this.mb.reset();
            }));
            this.B(this.hb.onDidOpen((e) => {
                // stop double click action on the input #148493
                if (e.browserEvent?.defaultPrevented) {
                    return;
                }
                const activeKeybindingEntry = this.activeKeybindingEntry;
                if (activeKeybindingEntry) {
                    this.defineKeybinding(activeKeybindingEntry, false);
                }
            }));
            DOM.$0O(this.gb, this.overflowWidgetsDomNode);
        }
        async Lb(preserveFocus) {
            if (this.input) {
                const input = this.input;
                this.g = await input.resolve();
                await this.g.resolve(this.Mb());
                this.Ob(false, preserveFocus);
                if (input.searchOptions) {
                    this.pb.checked = input.searchOptions.recordKeybindings;
                    this.ob.checked = input.searchOptions.sortByPrecedence;
                    this.r.setValue(input.searchOptions.searchValue);
                }
                else {
                    this.Gb();
                }
            }
        }
        Mb() {
            const actionsLabels = new Map();
            for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                actionsLabels.set(editorAction.id, editorAction.label);
            }
            for (const menuItem of actions_2.$Tu.getMenuItems(actions_2.$Ru.CommandPalette)) {
                if ((0, actions_2.$Pu)(menuItem)) {
                    const title = typeof menuItem.command.title === 'string' ? menuItem.command.title : menuItem.command.title.value;
                    const category = menuItem.command.category ? typeof menuItem.command.category === 'string' ? menuItem.command.category : menuItem.command.category.value : undefined;
                    actionsLabels.set(menuItem.command.id, category ? `${category}: ${title}` : title);
                }
            }
            return actionsLabels;
        }
        Nb() {
            this.Ob(this.r.hasFocus());
            this.s.trigger(() => {
                this.r.inputBox.addToHistory();
                this.F(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.r.inputBox.getHistory();
                this.G();
            });
        }
        clearKeyboardShortcutSearchHistory() {
            this.r.inputBox.clearHistory();
            this.F(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.r.inputBox.getHistory();
            this.G();
        }
        Ob(reset, preserveFocus) {
            if (this.g) {
                const filter = this.r.getValue();
                const keybindingsEntries = this.g.fetch(filter, this.ob.checked);
                this.qb.setAttribute('aria-label', this.Pb(keybindingsEntries));
                if (keybindingsEntries.length === 0) {
                    this.kb.push(filter);
                }
                const currentSelectedIndex = this.hb.getSelection()[0];
                this.fb = keybindingsEntries;
                this.hb.splice(0, this.hb.length, this.fb);
                this.Qb();
                if (reset) {
                    this.hb.setSelection([]);
                    this.hb.setFocus([]);
                }
                else {
                    if (this.eb) {
                        const index = this.Sb(this.eb);
                        if (index !== -1) {
                            this.hb.reveal(index, 0.2);
                            this.Tb(index);
                        }
                        this.eb = null;
                    }
                    else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.fb.length) {
                        this.Tb(currentSelectedIndex, preserveFocus);
                    }
                    else if (this.yb.activeEditorPane === this && !preserveFocus) {
                        this.focus();
                    }
                }
            }
        }
        Pb(keybindingsEntries) {
            if (this.ob.checked) {
                return (0, nls_1.localize)(10, null, keybindingsEntries.length);
            }
            else {
                return (0, nls_1.localize)(11, null, keybindingsEntries.length);
            }
        }
        Qb() {
            if (!this.ib) {
                return;
            }
            const tableHeight = this.ib.height - (DOM.$FO(this.j).height + 12 /*padding*/);
            this.gb.style.height = `${tableHeight}px`;
            this.hb.layout(tableHeight);
        }
        Rb(listEntry) {
            const index = this.fb.indexOf(listEntry);
            if (index === -1) {
                for (let i = 0; i < this.fb.length; i++) {
                    if (this.fb[i].id === listEntry.id) {
                        return i;
                    }
                }
            }
            return index;
        }
        Sb(unassignedKeybinding) {
            for (let index = 0; index < this.fb.length; index++) {
                const entry = this.fb[index];
                if (entry.templateId === keybindingsEditorModel_1.$Byb) {
                    const keybindingItemEntry = entry;
                    if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
                        return index;
                    }
                }
            }
            return -1;
        }
        Tb(keybindingItemEntry, focus = true) {
            const index = typeof keybindingItemEntry === 'number' ? keybindingItemEntry : this.Rb(keybindingItemEntry);
            if (index !== -1 && index < this.hb.length) {
                if (focus) {
                    this.hb.domFocus();
                    this.hb.setFocus([index]);
                }
                this.hb.setSelection([index]);
            }
        }
        focusKeybindings() {
            this.hb.domFocus();
            const currentFocusIndices = this.hb.getFocus();
            this.hb.setFocus([currentFocusIndices.length ? currentFocusIndices[0] : 0]);
        }
        selectKeybinding(keybindingItemEntry) {
            this.Tb(keybindingItemEntry);
        }
        recordSearchKeys() {
            this.pb.checked = true;
        }
        toggleSortByPrecedence() {
            this.ob.checked = !this.ob.checked;
        }
        Ub(e) {
            if (!e.element) {
                return;
            }
            if (e.element.templateId === keybindingsEditorModel_1.$Byb) {
                const keybindingItemEntry = e.element;
                this.Tb(keybindingItemEntry);
                this.sb.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => [
                        this.bc(keybindingItemEntry),
                        this.cc(keybindingItemEntry),
                        this.dc(keybindingItemEntry),
                        new actions_1.$ii(),
                        ...(keybindingItemEntry.keybindingItem.keybinding
                            ? [this.Wb(keybindingItemEntry), this.Xb(keybindingItemEntry)]
                            : [this.Wb(keybindingItemEntry)]),
                        new actions_1.$ii(),
                        this.Zb(keybindingItemEntry),
                        this.$b(keybindingItemEntry),
                        new actions_1.$ii(),
                        this.Yb(keybindingItemEntry),
                        new actions_1.$ii(),
                        this.ac(keybindingItemEntry)
                    ]
                });
            }
        }
        Vb() {
            this.mb.reset();
            const element = this.hb.getFocusedElements()[0];
            if (!element) {
                return;
            }
            if (element.templateId === keybindingsEditorModel_1.$Byb) {
                this.mb.set(true);
            }
        }
        Wb(keybindingItemEntry) {
            return {
                label: keybindingItemEntry.keybindingItem.keybinding ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null),
                enabled: true,
                id: preferences_1.$tCb,
                run: () => this.defineKeybinding(keybindingItemEntry, false)
            };
        }
        Xb(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)(14, null),
                enabled: true,
                id: preferences_1.$uCb,
                run: () => this.defineKeybinding(keybindingItemEntry, true)
            };
        }
        Yb(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)(15, null),
                enabled: !!keybindingItemEntry.keybindingItem.keybinding,
                id: preferences_1.$vCb,
                run: () => this.defineWhenExpression(keybindingItemEntry)
            };
        }
        Zb(keybindingItem) {
            return {
                label: (0, nls_1.localize)(16, null),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.$yCb,
                run: () => this.removeKeybinding(keybindingItem)
            };
        }
        $b(keybindingItem) {
            return {
                label: (0, nls_1.localize)(17, null),
                enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
                id: preferences_1.$zCb,
                run: () => this.resetKeybinding(keybindingItem)
            };
        }
        ac(keybindingItem) {
            return {
                label: (0, nls_1.localize)(18, null),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.$DCb,
                run: () => this.showSimilarKeybindings(keybindingItem)
            };
        }
        bc(keybindingItem) {
            return {
                label: (0, nls_1.localize)(19, null),
                enabled: true,
                id: preferences_1.$ACb,
                run: () => this.copyKeybinding(keybindingItem)
            };
        }
        cc(keybinding) {
            return {
                label: (0, nls_1.localize)(20, null),
                enabled: true,
                id: preferences_1.$BCb,
                run: () => this.copyKeybindingCommand(keybinding)
            };
        }
        dc(keybinding) {
            return {
                label: (0, nls_1.localize)(21, null),
                enabled: !!keybinding.keybindingItem.commandLabel,
                id: preferences_1.$CCb,
                run: () => this.copyKeybindingCommandTitle(keybinding)
            };
        }
        ec(error) {
            this.vb.error(typeof error === 'string' ? error : (0, nls_1.localize)(22, null, `${error}`));
        }
    };
    exports.$hDb = $hDb;
    exports.$hDb = $hDb = $hDb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, keybindingEditing_1.$pyb),
        __param(5, contextkey_1.$3i),
        __param(6, notification_1.$Yu),
        __param(7, clipboardService_1.$UZ),
        __param(8, instantiation_1.$Ah),
        __param(9, editorService_1.$9C),
        __param(10, storage_1.$Vo),
        __param(11, configuration_1.$8h)
    ], $hDb);
    class Delegate {
        constructor() {
            this.headerRowHeight = 30;
        }
        getHeight(element) {
            if (element.templateId === keybindingsEditorModel_1.$Byb) {
                const commandIdMatched = element.keybindingItem.commandLabel && element.commandIdMatches;
                const commandDefaultLabelMatched = !!element.commandDefaultLabelMatches;
                const extensionIdMatched = !!element.extensionIdMatches;
                if (commandIdMatched && commandDefaultLabelMatched) {
                    return 60;
                }
                if (extensionIdMatched || commandIdMatched || commandDefaultLabelMatched) {
                    return 40;
                }
            }
            return 24;
        }
    }
    let ActionsColumnRenderer = class ActionsColumnRenderer {
        static { ActionsColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'actions'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.templateId = ActionsColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.$0O(container, $('.actions'));
            const actionBar = new actionbar_1.$1P(element, { animated: false });
            return { actionBar };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.actionBar.clear();
            const actions = [];
            if (keybindingItemEntry.keybindingItem.keybinding) {
                actions.push(this.c(keybindingItemEntry));
            }
            else {
                actions.push(this.d(keybindingItemEntry));
            }
            templateData.actionBar.push(actions, { icon: true });
        }
        c(keybindingItemEntry) {
            const keybinding = this.b.lookupKeybinding(preferences_1.$tCb);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$YBb),
                enabled: true,
                id: 'editKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)(23, null, `(${keybinding.getLabel()})`) : (0, nls_1.localize)(24, null),
                run: () => this.a.defineKeybinding(keybindingItemEntry, false)
            };
        }
        d(keybindingItemEntry) {
            const keybinding = this.b.lookupKeybinding(preferences_1.$tCb);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.$ZBb),
                enabled: true,
                id: 'addKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)(25, null, `(${keybinding.getLabel()})`) : (0, nls_1.localize)(26, null),
                run: () => this.a.defineKeybinding(keybindingItemEntry, false)
            };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    ActionsColumnRenderer = ActionsColumnRenderer_1 = __decorate([
        __param(1, keybinding_1.$2D)
    ], ActionsColumnRenderer);
    class CommandColumnRenderer {
        constructor() {
            this.templateId = CommandColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'commands'; }
        renderTemplate(container) {
            const commandColumn = DOM.$0O(container, $('.command'));
            const commandLabelContainer = DOM.$0O(commandColumn, $('.command-label'));
            const commandLabel = new highlightedLabel_1.$JR(commandLabelContainer);
            const commandDefaultLabelContainer = DOM.$0O(commandColumn, $('.command-default-label'));
            const commandDefaultLabel = new highlightedLabel_1.$JR(commandDefaultLabelContainer);
            const commandIdLabelContainer = DOM.$0O(commandColumn, $('.command-id.code'));
            const commandIdLabel = new highlightedLabel_1.$JR(commandIdLabelContainer);
            return { commandColumn, commandLabelContainer, commandLabel, commandDefaultLabelContainer, commandDefaultLabel, commandIdLabelContainer, commandIdLabel };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            const keybindingItem = keybindingItemEntry.keybindingItem;
            const commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
            const commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
            templateData.commandColumn.classList.toggle('vertical-align-column', commandIdMatched || commandDefaultLabelMatched);
            templateData.commandColumn.title = keybindingItem.commandLabel ? (0, nls_1.localize)(27, null, keybindingItem.commandLabel, keybindingItem.command) : keybindingItem.command;
            if (keybindingItem.commandLabel) {
                templateData.commandLabelContainer.classList.remove('hide');
                templateData.commandLabel.set(keybindingItem.commandLabel, keybindingItemEntry.commandLabelMatches);
            }
            else {
                templateData.commandLabelContainer.classList.add('hide');
                templateData.commandLabel.set(undefined);
            }
            if (keybindingItemEntry.commandDefaultLabelMatches) {
                templateData.commandDefaultLabelContainer.classList.remove('hide');
                templateData.commandDefaultLabel.set(keybindingItem.commandDefaultLabel, keybindingItemEntry.commandDefaultLabelMatches);
            }
            else {
                templateData.commandDefaultLabelContainer.classList.add('hide');
                templateData.commandDefaultLabel.set(undefined);
            }
            if (keybindingItemEntry.commandIdMatches || !keybindingItem.commandLabel) {
                templateData.commandIdLabelContainer.classList.remove('hide');
                templateData.commandIdLabel.set(keybindingItem.command, keybindingItemEntry.commandIdMatches);
            }
            else {
                templateData.commandIdLabelContainer.classList.add('hide');
                templateData.commandIdLabel.set(undefined);
            }
        }
        disposeTemplate(templateData) { }
    }
    class KeybindingColumnRenderer {
        static { this.TEMPLATE_ID = 'keybindings'; }
        constructor() {
            this.templateId = KeybindingColumnRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.$0O(container, $('.keybinding'));
            const keybindingLabel = new keybindingLabel_1.$TR(DOM.$0O(element, $('div.keybinding-label')), platform_1.OS, defaultStyles_1.$g2);
            return { keybindingLabel };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            if (keybindingItemEntry.keybindingItem.keybinding) {
                templateData.keybindingLabel.set(keybindingItemEntry.keybindingItem.keybinding, keybindingItemEntry.keybindingMatches);
            }
            else {
                templateData.keybindingLabel.set(undefined, undefined);
            }
        }
        disposeTemplate(templateData) {
        }
    }
    function onClick(element, callback) {
        const disposables = new lifecycle_1.$jc();
        disposables.add(DOM.$nO(element, DOM.$3O.CLICK, DOM.$gP(callback)));
        disposables.add(DOM.$nO(element, DOM.$3O.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.$jO(e);
            if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }
        }));
        return disposables;
    }
    let SourceColumnRenderer = class SourceColumnRenderer {
        static { SourceColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'source'; }
        constructor(a) {
            this.a = a;
            this.templateId = SourceColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const sourceColumn = DOM.$0O(container, $('.source'));
            const sourceLabel = new highlightedLabel_1.$JR(DOM.$0O(sourceColumn, $('.source-label')));
            const extensionContainer = DOM.$0O(sourceColumn, $('.extension-container'));
            const extensionLabel = DOM.$0O(extensionContainer, $('a.extension-label', { tabindex: 0 }));
            const extensionId = new highlightedLabel_1.$JR(DOM.$0O(extensionContainer, $('.extension-id-container.code')));
            return { sourceColumn, sourceLabel, extensionLabel, extensionContainer, extensionId, disposables: new lifecycle_1.$jc() };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            if ((0, types_1.$jf)(keybindingItemEntry.keybindingItem.source)) {
                templateData.extensionContainer.classList.add('hide');
                templateData.sourceLabel.element.classList.remove('hide');
                templateData.sourceColumn.title = '';
                templateData.sourceLabel.set(keybindingItemEntry.keybindingItem.source || '-', keybindingItemEntry.sourceMatches);
            }
            else {
                templateData.extensionContainer.classList.remove('hide');
                templateData.sourceLabel.element.classList.add('hide');
                const extension = keybindingItemEntry.keybindingItem.source;
                const extensionLabel = extension.displayName ?? extension.identifier.value;
                templateData.sourceColumn.title = (0, nls_1.localize)(28, null, extensionLabel);
                templateData.extensionLabel.textContent = extensionLabel;
                templateData.disposables.add(onClick(templateData.extensionLabel, () => {
                    this.a.open(extension.identifier.value);
                }));
                if (keybindingItemEntry.extensionIdMatches) {
                    templateData.extensionId.element.classList.remove('hide');
                    templateData.extensionId.set(extension.identifier.value, keybindingItemEntry.extensionIdMatches);
                }
                else {
                    templateData.extensionId.element.classList.add('hide');
                    templateData.extensionId.set(undefined);
                }
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    SourceColumnRenderer = SourceColumnRenderer_1 = __decorate([
        __param(0, extensions_1.$Pfb)
    ], SourceColumnRenderer);
    let WhenInputWidget = class WhenInputWidget extends lifecycle_1.$kc {
        constructor(parent, keybindingsEditor, instantiationService, contextKeyService) {
            super();
            this.b = this.B(new event_1.$fd());
            this.onDidAccept = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidReject = this.c.event;
            const focusContextKey = preferences_1.$nCb.bindTo(contextKeyService);
            this.a = this.B(instantiationService.createInstance(suggestEnabledInput_1.$VCb, 'keyboardshortcutseditor#wheninput', parent, {
                provideResults: () => {
                    const result = [];
                    for (const contextKey of contextkey_1.$2i.all()) {
                        result.push({ label: contextKey.key, documentation: contextKey.description, detail: contextKey.type, kind: 14 /* CompletionItemKind.Constant */ });
                    }
                    return result;
                },
                triggerCharacters: ['!', ' '],
                wordDefinition: /[a-zA-Z.]+/,
                alwaysShowSuggestions: true,
            }, '', `keyboardshortcutseditor#wheninput`, { focusContextKey, overflowWidgetsDomNode: keybindingsEditor.overflowWidgetsDomNode }));
            this.B((DOM.$nO(this.a.element, DOM.$3O.DBLCLICK, e => DOM.$5O.stop(e))));
            this.B((0, lifecycle_1.$ic)(() => focusContextKey.reset()));
            this.B(keybindingsEditor.onAcceptWhenExpression(() => this.b.fire(this.a.getValue())));
            this.B(event_1.Event.any(keybindingsEditor.onRejectWhenExpression, this.a.onDidBlur)(() => this.c.fire()));
        }
        layout(dimension) {
            this.a.layout(dimension);
        }
        show(value) {
            this.a.setValue(value);
            this.a.focus(true);
        }
    };
    WhenInputWidget = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, contextkey_1.$3i)
    ], WhenInputWidget);
    let WhenColumnRenderer = class WhenColumnRenderer {
        static { WhenColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'when'; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.templateId = WhenColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.$0O(container, $('.when'));
            const whenLabelContainer = DOM.$0O(element, $('div.when-label'));
            const whenLabel = new highlightedLabel_1.$JR(whenLabelContainer);
            const whenInputContainer = DOM.$0O(element, $('div.when-input-container'));
            return {
                element,
                whenLabelContainer,
                whenLabel,
                whenInputContainer,
                disposables: new lifecycle_1.$jc(),
            };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.disposables.clear();
            const whenInputDisposables = templateData.disposables.add(new lifecycle_1.$jc());
            templateData.disposables.add(this.a.onDefineWhenExpression(e => {
                if (keybindingItemEntry === e) {
                    templateData.element.classList.add('input-mode');
                    const inputWidget = whenInputDisposables.add(this.b.createInstance(WhenInputWidget, templateData.whenInputContainer, this.a));
                    inputWidget.layout(new DOM.$BO(templateData.element.parentElement.clientWidth, 18));
                    inputWidget.show(keybindingItemEntry.keybindingItem.when || '');
                    const hideInputWidget = () => {
                        whenInputDisposables.clear();
                        templateData.element.classList.remove('input-mode');
                        templateData.element.parentElement.style.paddingLeft = '10px';
                        DOM.$lO(templateData.whenInputContainer);
                    };
                    whenInputDisposables.add(inputWidget.onDidAccept(value => {
                        hideInputWidget();
                        this.a.updateKeybinding(keybindingItemEntry, keybindingItemEntry.keybindingItem.keybinding ? keybindingItemEntry.keybindingItem.keybinding.getUserSettingsLabel() || '' : '', value);
                        this.a.selectKeybinding(keybindingItemEntry);
                    }));
                    whenInputDisposables.add(inputWidget.onDidReject(() => {
                        hideInputWidget();
                        this.a.selectKeybinding(keybindingItemEntry);
                    }));
                    templateData.element.parentElement.style.paddingLeft = '0px';
                }
            }));
            templateData.whenLabelContainer.classList.toggle('code', !!keybindingItemEntry.keybindingItem.when);
            templateData.whenLabelContainer.classList.toggle('empty', !keybindingItemEntry.keybindingItem.when);
            if (keybindingItemEntry.keybindingItem.when) {
                templateData.whenLabel.set(keybindingItemEntry.keybindingItem.when, keybindingItemEntry.whenMatches);
                templateData.whenLabel.element.title = keybindingItemEntry.keybindingItem.when;
                templateData.element.title = keybindingItemEntry.keybindingItem.when;
            }
            else {
                templateData.whenLabel.set('-');
                templateData.whenLabel.element.title = '';
                templateData.element.title = '';
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    WhenColumnRenderer = WhenColumnRenderer_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], WhenColumnRenderer);
    class AccessibilityProvider {
        constructor(a) {
            this.a = a;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(29, null);
        }
        getAriaLabel({ keybindingItem }) {
            const ariaLabel = [
                keybindingItem.commandLabel ? keybindingItem.commandLabel : keybindingItem.command,
                keybindingItem.keybinding?.getAriaLabel() || (0, nls_1.localize)(30, null),
                keybindingItem.when ? keybindingItem.when : (0, nls_1.localize)(31, null),
                (0, types_1.$jf)(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.description ?? keybindingItem.source.identifier.value,
            ];
            if (this.a.getValue("accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */)) {
                const kbEditorAriaLabel = (0, nls_1.localize)(32, null);
                ariaLabel.push(kbEditorAriaLabel);
            }
            return ariaLabel.join(', ');
        }
    }
    (0, colorRegistry_1.$sv)('keybindingTable.headerBackground', { dark: colorRegistry_1.$Xx, light: colorRegistry_1.$Xx, hcDark: colorRegistry_1.$Xx, hcLight: colorRegistry_1.$Xx }, 'Background color for the keyboard shortcuts table header.');
    (0, colorRegistry_1.$sv)('keybindingTable.rowsBackground', { light: colorRegistry_1.$Xx, dark: colorRegistry_1.$Xx, hcDark: colorRegistry_1.$Xx, hcLight: colorRegistry_1.$Xx }, 'Background color for the keyboard shortcuts table alternating rows.');
    (0, themeService_1.$mv)((theme, collector) => {
        const foregroundColor = theme.getColor(colorRegistry_1.$uv);
        if (foregroundColor) {
            const whenForegroundColor = foregroundColor.transparent(.8).makeOpaque((0, theme_1.$$$)(theme));
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listActiveSelectionForegroundColor = theme.getColor(colorRegistry_1.$zx);
        const listActiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.$yx);
        if (listActiveSelectionForegroundColor && listActiveSelectionBackgroundColor) {
            const whenForegroundColor = listActiveSelectionForegroundColor.transparent(.8).makeOpaque(listActiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listInactiveSelectionForegroundColor = theme.getColor(colorRegistry_1.$Cx);
        const listInactiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.$Bx);
        if (listInactiveSelectionForegroundColor && listInactiveSelectionBackgroundColor) {
            const whenForegroundColor = listInactiveSelectionForegroundColor.transparent(.8).makeOpaque(listInactiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listFocusForegroundColor = theme.getColor(colorRegistry_1.$vx);
        const listFocusBackgroundColor = theme.getColor(colorRegistry_1.$ux);
        if (listFocusForegroundColor && listFocusBackgroundColor) {
            const whenForegroundColor = listFocusForegroundColor.transparent(.8).makeOpaque(listFocusBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listHoverForegroundColor = theme.getColor(colorRegistry_1.$Hx);
        const listHoverBackgroundColor = theme.getColor(colorRegistry_1.$Gx);
        if (listHoverForegroundColor && listHoverBackgroundColor) {
            const whenForegroundColor = listHoverForegroundColor.transparent(.8).makeOpaque(listHoverBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
    });
});
//# sourceMappingURL=keybindingsEditor.js.map