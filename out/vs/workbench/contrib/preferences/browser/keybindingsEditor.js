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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/browser/keybindingsEditorModel", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/platform/contextview/browser/contextView", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorExtensions", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/actions/common/actions", "vs/workbench/common/theme", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/keyboardEvent", "vs/base/common/types", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/keybindingsEditor"], function (require, exports, nls_1, async_1, DOM, platform_1, lifecycle_1, toggle_1, highlightedLabel_1, keybindingLabel_1, actions_1, actionbar_1, editorPane_1, telemetry_1, clipboardService_1, keybindingsEditorModel_1, instantiation_1, keybinding_1, keybindingWidgets_1, preferences_1, contextView_1, keybindingEditing_1, themeService_1, themables_1, contextkey_1, colorRegistry_1, editorService_1, editorExtensions_1, listService_1, notification_1, storage_1, event_1, actions_2, theme_1, preferencesIcons_1, toolbar_1, defaultStyles_1, extensions_1, keyboardEvent_1, types_1, suggestEnabledInput_1, settingsEditorColorRegistry_1, configuration_1, widgetNavigationCommands_1) {
    "use strict";
    var KeybindingsEditor_1, ActionsColumnRenderer_1, SourceColumnRenderer_1, WhenColumnRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsEditor = void 0;
    const $ = DOM.$;
    let KeybindingsEditor = class KeybindingsEditor extends editorPane_1.EditorPane {
        static { KeybindingsEditor_1 = this; }
        static { this.ID = 'workbench.editor.keybindings'; }
        constructor(telemetryService, themeService, keybindingsService, contextMenuService, keybindingEditingService, contextKeyService, notificationService, clipboardService, instantiationService, editorService, storageService, configurationService) {
            super(KeybindingsEditor_1.ID, telemetryService, themeService, storageService);
            this.keybindingsService = keybindingsService;
            this.contextMenuService = contextMenuService;
            this.keybindingEditingService = keybindingEditingService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.clipboardService = clipboardService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this._onDefineWhenExpression = this._register(new event_1.Emitter());
            this.onDefineWhenExpression = this._onDefineWhenExpression.event;
            this._onRejectWhenExpression = this._register(new event_1.Emitter());
            this.onRejectWhenExpression = this._onRejectWhenExpression.event;
            this._onAcceptWhenExpression = this._register(new event_1.Emitter());
            this.onAcceptWhenExpression = this._onAcceptWhenExpression.event;
            this._onLayout = this._register(new event_1.Emitter());
            this.onLayout = this._onLayout.event;
            this.keybindingsEditorModel = null;
            this.unAssignedKeybindingItemToRevealAndFocus = null;
            this.tableEntries = [];
            this.dimension = null;
            this.latestEmptyFilters = [];
            this.delayedFiltering = new async_1.Delayer(300);
            this._register(keybindingsService.onDidUpdateKeybindings(() => this.render(!!this.keybindingFocusContextKey.get())));
            this.keybindingsEditorContextKey = preferences_1.CONTEXT_KEYBINDINGS_EDITOR.bindTo(this.contextKeyService);
            this.searchFocusContextKey = preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS.bindTo(this.contextKeyService);
            this.keybindingFocusContextKey = preferences_1.CONTEXT_KEYBINDING_FOCUS.bindTo(this.contextKeyService);
            this.searchHistoryDelayer = new async_1.Delayer(500);
            this.recordKeysAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, (0, nls_1.localize)('recordKeysLabel', "Record Keys"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsRecordKeysIcon));
            this.recordKeysAction.checked = false;
            this.sortByPrecedenceAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, (0, nls_1.localize)('sortByPrecedeneLabel', "Sort by Precedence (Highest first)"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsSortIcon));
            this.sortByPrecedenceAction.checked = false;
            this.overflowWidgetsDomNode = $('.keybindings-overflow-widgets-container.monaco-editor');
        }
        create(parent) {
            super.create(parent);
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.searchWidget.hasFocus()) {
                        this.focusKeybindings();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.searchWidget.hasFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        createEditor(parent) {
            const keybindingsEditorElement = DOM.append(parent, $('div', { class: 'keybindings-editor' }));
            this.createAriaLabelElement(keybindingsEditorElement);
            this.createOverlayContainer(keybindingsEditorElement);
            this.createHeader(keybindingsEditorElement);
            this.createBody(keybindingsEditorElement);
        }
        setInput(input, options, context, token) {
            this.keybindingsEditorContextKey.set(true);
            return super.setInput(input, options, context, token)
                .then(() => this.render(!!(options && options.preserveFocus)));
        }
        clearInput() {
            super.clearInput();
            this.keybindingsEditorContextKey.reset();
            this.keybindingFocusContextKey.reset();
        }
        layout(dimension) {
            this.dimension = dimension;
            this.layoutSearchWidget(dimension);
            this.overlayContainer.style.width = dimension.width + 'px';
            this.overlayContainer.style.height = dimension.height + 'px';
            this.defineKeybindingWidget.layout(this.dimension);
            this.layoutKeybindingsTable();
            this._onLayout.fire();
        }
        focus() {
            const activeKeybindingEntry = this.activeKeybindingEntry;
            if (activeKeybindingEntry) {
                this.selectEntry(activeKeybindingEntry);
            }
            else if (!platform_1.isIOS) {
                this.searchWidget.focus();
            }
        }
        get activeKeybindingEntry() {
            const focusedElement = this.keybindingsTable.getFocusedElements()[0];
            return focusedElement && focusedElement.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID ? focusedElement : null;
        }
        async defineKeybinding(keybindingEntry, add) {
            this.selectEntry(keybindingEntry);
            this.showOverlayContainer();
            try {
                const key = await this.defineKeybindingWidget.define();
                if (key) {
                    await this.updateKeybinding(keybindingEntry, key, keybindingEntry.keybindingItem.when, add);
                }
            }
            catch (error) {
                this.onKeybindingEditingError(error);
            }
            finally {
                this.hideOverlayContainer();
                this.selectEntry(keybindingEntry);
            }
        }
        defineWhenExpression(keybindingEntry) {
            if (keybindingEntry.keybindingItem.keybinding) {
                this.selectEntry(keybindingEntry);
                this._onDefineWhenExpression.fire(keybindingEntry);
            }
        }
        rejectWhenExpression(keybindingEntry) {
            this._onRejectWhenExpression.fire(keybindingEntry);
        }
        acceptWhenExpression(keybindingEntry) {
            this._onAcceptWhenExpression.fire(keybindingEntry);
        }
        async updateKeybinding(keybindingEntry, key, when, add) {
            const currentKey = keybindingEntry.keybindingItem.keybinding ? keybindingEntry.keybindingItem.keybinding.getUserSettingsLabel() : '';
            if (currentKey !== key || keybindingEntry.keybindingItem.when !== when) {
                if (add) {
                    await this.keybindingEditingService.addKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                else {
                    await this.keybindingEditingService.editKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                }
            }
        }
        async removeKeybinding(keybindingEntry) {
            this.selectEntry(keybindingEntry);
            if (keybindingEntry.keybindingItem.keybinding) { // This should be a pre-condition
                try {
                    await this.keybindingEditingService.removeKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                    this.focus();
                }
                catch (error) {
                    this.onKeybindingEditingError(error);
                    this.selectEntry(keybindingEntry);
                }
            }
        }
        async resetKeybinding(keybindingEntry) {
            this.selectEntry(keybindingEntry);
            try {
                await this.keybindingEditingService.resetKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                }
                this.selectEntry(keybindingEntry);
            }
            catch (error) {
                this.onKeybindingEditingError(error);
                this.selectEntry(keybindingEntry);
            }
        }
        async copyKeybinding(keybinding) {
            this.selectEntry(keybinding);
            const userFriendlyKeybinding = {
                key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() || '' : '',
                command: keybinding.keybindingItem.command
            };
            if (keybinding.keybindingItem.when) {
                userFriendlyKeybinding.when = keybinding.keybindingItem.when;
            }
            await this.clipboardService.writeText(JSON.stringify(userFriendlyKeybinding, null, '  '));
        }
        async copyKeybindingCommand(keybinding) {
            this.selectEntry(keybinding);
            await this.clipboardService.writeText(keybinding.keybindingItem.command);
        }
        async copyKeybindingCommandTitle(keybinding) {
            this.selectEntry(keybinding);
            await this.clipboardService.writeText(keybinding.keybindingItem.commandLabel);
        }
        focusSearch() {
            this.searchWidget.focus();
        }
        search(filter) {
            this.focusSearch();
            this.searchWidget.setValue(filter);
            this.selectEntry(0);
        }
        clearSearchResults() {
            this.searchWidget.clear();
        }
        showSimilarKeybindings(keybindingEntry) {
            const value = `"${keybindingEntry.keybindingItem.keybinding.getAriaLabel()}"`;
            if (value !== this.searchWidget.getValue()) {
                this.searchWidget.setValue(value);
            }
        }
        createAriaLabelElement(parent) {
            this.ariaLabelElement = DOM.append(parent, DOM.$(''));
            this.ariaLabelElement.setAttribute('id', 'keybindings-editor-aria-label-element');
            this.ariaLabelElement.setAttribute('aria-live', 'assertive');
        }
        createOverlayContainer(parent) {
            this.overlayContainer = DOM.append(parent, $('.overlay-container'));
            this.overlayContainer.style.position = 'absolute';
            this.overlayContainer.style.zIndex = '40'; // has to greater than sash z-index which is 35
            this.defineKeybindingWidget = this._register(this.instantiationService.createInstance(keybindingWidgets_1.DefineKeybindingWidget, this.overlayContainer));
            this._register(this.defineKeybindingWidget.onDidChange(keybindingStr => this.defineKeybindingWidget.printExisting(this.keybindingsEditorModel.fetch(`"${keybindingStr}"`).length)));
            this._register(this.defineKeybindingWidget.onShowExistingKeybidings(keybindingStr => this.searchWidget.setValue(`"${keybindingStr}"`)));
            this.hideOverlayContainer();
        }
        showOverlayContainer() {
            this.overlayContainer.style.display = 'block';
        }
        hideOverlayContainer() {
            this.overlayContainer.style.display = 'none';
        }
        createHeader(parent) {
            this.headerContainer = DOM.append(parent, $('.keybindings-header'));
            const fullTextSearchPlaceholder = (0, nls_1.localize)('SearchKeybindings.FullTextSearchPlaceholder', "Type to search in keybindings");
            const keybindingsSearchPlaceholder = (0, nls_1.localize)('SearchKeybindings.KeybindingsSearchPlaceholder', "Recording Keys. Press Escape to exit");
            const clearInputAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, (0, nls_1.localize)('clearInput', "Clear Keybindings Search Input"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesClearInputIcon), false, async () => this.clearSearchResults());
            const searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            this.searchWidget = this._register(this.instantiationService.createInstance(keybindingWidgets_1.KeybindingsSearchWidget, searchContainer, {
                ariaLabel: fullTextSearchPlaceholder,
                placeholder: fullTextSearchPlaceholder,
                focusKey: this.searchFocusContextKey,
                ariaLabelledBy: 'keybindings-editor-aria-label-element',
                recordEnter: true,
                quoteRecordedKeys: true,
                history: this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] || [],
                inputBoxStyles: (0, defaultStyles_1.getInputBoxStyle)({
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                })
            }));
            this._register(this.searchWidget.onDidChange(searchValue => {
                clearInputAction.enabled = !!searchValue;
                this.delayedFiltering.trigger(() => this.filterKeybindings());
                this.updateSearchOptions();
            }));
            this._register(this.searchWidget.onEscape(() => this.recordKeysAction.checked = false));
            this.actionsContainer = DOM.append(searchContainer, DOM.$('.keybindings-search-actions-container'));
            const recordingBadge = this.createRecordingBadge(this.actionsContainer);
            this._register(this.sortByPrecedenceAction.onDidChange(e => {
                if (e.checked !== undefined) {
                    this.renderKeybindingsEntries(false);
                }
                this.updateSearchOptions();
            }));
            this._register(this.recordKeysAction.onDidChange(e => {
                if (e.checked !== undefined) {
                    recordingBadge.classList.toggle('disabled', !e.checked);
                    if (e.checked) {
                        this.searchWidget.inputBox.setPlaceHolder(keybindingsSearchPlaceholder);
                        this.searchWidget.inputBox.setAriaLabel(keybindingsSearchPlaceholder);
                        this.searchWidget.startRecordingKeys();
                        this.searchWidget.focus();
                    }
                    else {
                        this.searchWidget.inputBox.setPlaceHolder(fullTextSearchPlaceholder);
                        this.searchWidget.inputBox.setAriaLabel(fullTextSearchPlaceholder);
                        this.searchWidget.stopRecordingKeys();
                        this.searchWidget.focus();
                    }
                    this.updateSearchOptions();
                }
            }));
            const actions = [this.recordKeysAction, this.sortByPrecedenceAction, clearInputAction];
            const toolBar = this._register(new toolbar_1.ToolBar(this.actionsContainer, this.contextMenuService, {
                actionViewItemProvider: (action) => {
                    if (action.id === this.sortByPrecedenceAction.id || action.id === this.recordKeysAction.id) {
                        return new toggle_1.ToggleActionViewItem(null, action, { keybinding: this.keybindingsService.lookupKeybinding(action.id)?.getLabel(), toggleStyles: defaultStyles_1.defaultToggleStyles });
                    }
                    return undefined;
                },
                getKeyBinding: action => this.keybindingsService.lookupKeybinding(action.id)
            }));
            toolBar.setActions(actions);
            this._register(this.keybindingsService.onDidUpdateKeybindings(() => toolBar.setActions(actions)));
        }
        updateSearchOptions() {
            const keybindingsEditorInput = this.input;
            if (keybindingsEditorInput) {
                keybindingsEditorInput.searchOptions = {
                    searchValue: this.searchWidget.getValue(),
                    recordKeybindings: !!this.recordKeysAction.checked,
                    sortByPrecedence: !!this.sortByPrecedenceAction.checked
                };
            }
        }
        createRecordingBadge(container) {
            const recordingBadge = DOM.append(container, DOM.$('.recording-badge.monaco-count-badge.long.disabled'));
            recordingBadge.textContent = (0, nls_1.localize)('recording', "Recording Keys");
            recordingBadge.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            recordingBadge.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            recordingBadge.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            return recordingBadge;
        }
        layoutSearchWidget(dimension) {
            this.searchWidget.layout(dimension);
            this.headerContainer.classList.toggle('small', dimension.width < 400);
            this.searchWidget.inputBox.inputElement.style.paddingRight = `${DOM.getTotalWidth(this.actionsContainer) + 12}px`;
        }
        createBody(parent) {
            const bodyContainer = DOM.append(parent, $('.keybindings-body'));
            this.createTable(bodyContainer);
        }
        createTable(parent) {
            this.keybindingsTableContainer = DOM.append(parent, $('.keybindings-table-container'));
            this.keybindingsTable = this._register(this.instantiationService.createInstance(listService_1.WorkbenchTable, 'KeybindingsEditor', this.keybindingsTableContainer, new Delegate(), [
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
                    label: (0, nls_1.localize)('command', "Command"),
                    tooltip: '',
                    weight: 0.3,
                    templateId: CommandColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('keybinding', "Keybinding"),
                    tooltip: '',
                    weight: 0.2,
                    templateId: KeybindingColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('when', "When"),
                    tooltip: '',
                    weight: 0.35,
                    templateId: WhenColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('source', "Source"),
                    tooltip: '',
                    weight: 0.15,
                    templateId: SourceColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this.instantiationService.createInstance(ActionsColumnRenderer, this),
                this.instantiationService.createInstance(CommandColumnRenderer),
                this.instantiationService.createInstance(KeybindingColumnRenderer),
                this.instantiationService.createInstance(WhenColumnRenderer, this),
                this.instantiationService.createInstance(SourceColumnRenderer),
            ], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                accessibilityProvider: new AccessibilityProvider(this.configurationService),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.keybindingItem.commandLabel || e.keybindingItem.command },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                openOnSingleClick: false,
                transformOptimization: false // disable transform optimization as it causes the editor overflow widgets to be mispositioned
            }));
            this._register(this.keybindingsTable.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.keybindingsTable.onDidChangeFocus(e => this.onFocusChange()));
            this._register(this.keybindingsTable.onDidFocus(() => {
                this.keybindingsTable.getHTMLElement().classList.add('focused');
                this.onFocusChange();
            }));
            this._register(this.keybindingsTable.onDidBlur(() => {
                this.keybindingsTable.getHTMLElement().classList.remove('focused');
                this.keybindingFocusContextKey.reset();
            }));
            this._register(this.keybindingsTable.onDidOpen((e) => {
                // stop double click action on the input #148493
                if (e.browserEvent?.defaultPrevented) {
                    return;
                }
                const activeKeybindingEntry = this.activeKeybindingEntry;
                if (activeKeybindingEntry) {
                    this.defineKeybinding(activeKeybindingEntry, false);
                }
            }));
            DOM.append(this.keybindingsTableContainer, this.overflowWidgetsDomNode);
        }
        async render(preserveFocus) {
            if (this.input) {
                const input = this.input;
                this.keybindingsEditorModel = await input.resolve();
                await this.keybindingsEditorModel.resolve(this.getActionsLabels());
                this.renderKeybindingsEntries(false, preserveFocus);
                if (input.searchOptions) {
                    this.recordKeysAction.checked = input.searchOptions.recordKeybindings;
                    this.sortByPrecedenceAction.checked = input.searchOptions.sortByPrecedence;
                    this.searchWidget.setValue(input.searchOptions.searchValue);
                }
                else {
                    this.updateSearchOptions();
                }
            }
        }
        getActionsLabels() {
            const actionsLabels = new Map();
            for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                actionsLabels.set(editorAction.id, editorAction.label);
            }
            for (const menuItem of actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.CommandPalette)) {
                if ((0, actions_2.isIMenuItem)(menuItem)) {
                    const title = typeof menuItem.command.title === 'string' ? menuItem.command.title : menuItem.command.title.value;
                    const category = menuItem.command.category ? typeof menuItem.command.category === 'string' ? menuItem.command.category : menuItem.command.category.value : undefined;
                    actionsLabels.set(menuItem.command.id, category ? `${category}: ${title}` : title);
                }
            }
            return actionsLabels;
        }
        filterKeybindings() {
            this.renderKeybindingsEntries(this.searchWidget.hasFocus());
            this.searchHistoryDelayer.trigger(() => {
                this.searchWidget.inputBox.addToHistory();
                this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.searchWidget.inputBox.getHistory();
                this.saveState();
            });
        }
        clearKeyboardShortcutSearchHistory() {
            this.searchWidget.inputBox.clearHistory();
            this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.searchWidget.inputBox.getHistory();
            this.saveState();
        }
        renderKeybindingsEntries(reset, preserveFocus) {
            if (this.keybindingsEditorModel) {
                const filter = this.searchWidget.getValue();
                const keybindingsEntries = this.keybindingsEditorModel.fetch(filter, this.sortByPrecedenceAction.checked);
                this.ariaLabelElement.setAttribute('aria-label', this.getAriaLabel(keybindingsEntries));
                if (keybindingsEntries.length === 0) {
                    this.latestEmptyFilters.push(filter);
                }
                const currentSelectedIndex = this.keybindingsTable.getSelection()[0];
                this.tableEntries = keybindingsEntries;
                this.keybindingsTable.splice(0, this.keybindingsTable.length, this.tableEntries);
                this.layoutKeybindingsTable();
                if (reset) {
                    this.keybindingsTable.setSelection([]);
                    this.keybindingsTable.setFocus([]);
                }
                else {
                    if (this.unAssignedKeybindingItemToRevealAndFocus) {
                        const index = this.getNewIndexOfUnassignedKeybinding(this.unAssignedKeybindingItemToRevealAndFocus);
                        if (index !== -1) {
                            this.keybindingsTable.reveal(index, 0.2);
                            this.selectEntry(index);
                        }
                        this.unAssignedKeybindingItemToRevealAndFocus = null;
                    }
                    else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.tableEntries.length) {
                        this.selectEntry(currentSelectedIndex, preserveFocus);
                    }
                    else if (this.editorService.activeEditorPane === this && !preserveFocus) {
                        this.focus();
                    }
                }
            }
        }
        getAriaLabel(keybindingsEntries) {
            if (this.sortByPrecedenceAction.checked) {
                return (0, nls_1.localize)('show sorted keybindings', "Showing {0} Keybindings in precedence order", keybindingsEntries.length);
            }
            else {
                return (0, nls_1.localize)('show keybindings', "Showing {0} Keybindings in alphabetical order", keybindingsEntries.length);
            }
        }
        layoutKeybindingsTable() {
            if (!this.dimension) {
                return;
            }
            const tableHeight = this.dimension.height - (DOM.getDomNodePagePosition(this.headerContainer).height + 12 /*padding*/);
            this.keybindingsTableContainer.style.height = `${tableHeight}px`;
            this.keybindingsTable.layout(tableHeight);
        }
        getIndexOf(listEntry) {
            const index = this.tableEntries.indexOf(listEntry);
            if (index === -1) {
                for (let i = 0; i < this.tableEntries.length; i++) {
                    if (this.tableEntries[i].id === listEntry.id) {
                        return i;
                    }
                }
            }
            return index;
        }
        getNewIndexOfUnassignedKeybinding(unassignedKeybinding) {
            for (let index = 0; index < this.tableEntries.length; index++) {
                const entry = this.tableEntries[index];
                if (entry.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                    const keybindingItemEntry = entry;
                    if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
                        return index;
                    }
                }
            }
            return -1;
        }
        selectEntry(keybindingItemEntry, focus = true) {
            const index = typeof keybindingItemEntry === 'number' ? keybindingItemEntry : this.getIndexOf(keybindingItemEntry);
            if (index !== -1 && index < this.keybindingsTable.length) {
                if (focus) {
                    this.keybindingsTable.domFocus();
                    this.keybindingsTable.setFocus([index]);
                }
                this.keybindingsTable.setSelection([index]);
            }
        }
        focusKeybindings() {
            this.keybindingsTable.domFocus();
            const currentFocusIndices = this.keybindingsTable.getFocus();
            this.keybindingsTable.setFocus([currentFocusIndices.length ? currentFocusIndices[0] : 0]);
        }
        selectKeybinding(keybindingItemEntry) {
            this.selectEntry(keybindingItemEntry);
        }
        recordSearchKeys() {
            this.recordKeysAction.checked = true;
        }
        toggleSortByPrecedence() {
            this.sortByPrecedenceAction.checked = !this.sortByPrecedenceAction.checked;
        }
        onContextMenu(e) {
            if (!e.element) {
                return;
            }
            if (e.element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                const keybindingItemEntry = e.element;
                this.selectEntry(keybindingItemEntry);
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => [
                        this.createCopyAction(keybindingItemEntry),
                        this.createCopyCommandAction(keybindingItemEntry),
                        this.createCopyCommandTitleAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        ...(keybindingItemEntry.keybindingItem.keybinding
                            ? [this.createDefineKeybindingAction(keybindingItemEntry), this.createAddKeybindingAction(keybindingItemEntry)]
                            : [this.createDefineKeybindingAction(keybindingItemEntry)]),
                        new actions_1.Separator(),
                        this.createRemoveAction(keybindingItemEntry),
                        this.createResetAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        this.createDefineWhenExpressionAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        this.createShowConflictsAction(keybindingItemEntry)
                    ]
                });
            }
        }
        onFocusChange() {
            this.keybindingFocusContextKey.reset();
            const element = this.keybindingsTable.getFocusedElements()[0];
            if (!element) {
                return;
            }
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                this.keybindingFocusContextKey.set(true);
            }
        }
        createDefineKeybindingAction(keybindingItemEntry) {
            return {
                label: keybindingItemEntry.keybindingItem.keybinding ? (0, nls_1.localize)('changeLabel', "Change Keybinding...") : (0, nls_1.localize)('addLabel', "Add Keybinding..."),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                run: () => this.defineKeybinding(keybindingItemEntry, false)
            };
        }
        createAddKeybindingAction(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)('addLabel', "Add Keybinding..."),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ADD,
                run: () => this.defineKeybinding(keybindingItemEntry, true)
            };
        }
        createDefineWhenExpressionAction(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)('editWhen', "Change When Expression"),
                enabled: !!keybindingItemEntry.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
                run: () => this.defineWhenExpression(keybindingItemEntry)
            };
        }
        createRemoveAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('removeLabel', "Remove Keybinding"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                run: () => this.removeKeybinding(keybindingItem)
            };
        }
        createResetAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('resetLabel', "Reset Keybinding"),
                enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                run: () => this.resetKeybinding(keybindingItem)
            };
        }
        createShowConflictsAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('showSameKeybindings', "Show Same Keybindings"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                run: () => this.showSimilarKeybindings(keybindingItem)
            };
        }
        createCopyAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('copyLabel', "Copy"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                run: () => this.copyKeybinding(keybindingItem)
            };
        }
        createCopyCommandAction(keybinding) {
            return {
                label: (0, nls_1.localize)('copyCommandLabel', "Copy Command ID"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                run: () => this.copyKeybindingCommand(keybinding)
            };
        }
        createCopyCommandTitleAction(keybinding) {
            return {
                label: (0, nls_1.localize)('copyCommandTitleLabel', "Copy Command Title"),
                enabled: !!keybinding.keybindingItem.commandLabel,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
                run: () => this.copyKeybindingCommandTitle(keybinding)
            };
        }
        onKeybindingEditingError(error) {
            this.notificationService.error(typeof error === 'string' ? error : (0, nls_1.localize)('error', "Error '{0}' while editing the keybinding. Please open 'keybindings.json' file and check for errors.", `${error}`));
        }
    };
    exports.KeybindingsEditor = KeybindingsEditor;
    exports.KeybindingsEditor = KeybindingsEditor = KeybindingsEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, keybindingEditing_1.IKeybindingEditingService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, notification_1.INotificationService),
        __param(7, clipboardService_1.IClipboardService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, editorService_1.IEditorService),
        __param(10, storage_1.IStorageService),
        __param(11, configuration_1.IConfigurationService)
    ], KeybindingsEditor);
    class Delegate {
        constructor() {
            this.headerRowHeight = 30;
        }
        getHeight(element) {
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
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
        constructor(keybindingsEditor, keybindingsService) {
            this.keybindingsEditor = keybindingsEditor;
            this.keybindingsService = keybindingsService;
            this.templateId = ActionsColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.actions'));
            const actionBar = new actionbar_1.ActionBar(element, { animated: false });
            return { actionBar };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.actionBar.clear();
            const actions = [];
            if (keybindingItemEntry.keybindingItem.keybinding) {
                actions.push(this.createEditAction(keybindingItemEntry));
            }
            else {
                actions.push(this.createAddAction(keybindingItemEntry));
            }
            templateData.actionBar.push(actions, { icon: true });
        }
        createEditAction(keybindingItemEntry) {
            const keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsEditIcon),
                enabled: true,
                id: 'editKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)('editKeybindingLabelWithKey', "Change Keybinding {0}", `(${keybinding.getLabel()})`) : (0, nls_1.localize)('editKeybindingLabel', "Change Keybinding"),
                run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
            };
        }
        createAddAction(keybindingItemEntry) {
            const keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsAddIcon),
                enabled: true,
                id: 'addKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)('addKeybindingLabelWithKey', "Add Keybinding {0}", `(${keybinding.getLabel()})`) : (0, nls_1.localize)('addKeybindingLabel', "Add Keybinding"),
                run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
            };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    ActionsColumnRenderer = ActionsColumnRenderer_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], ActionsColumnRenderer);
    class CommandColumnRenderer {
        constructor() {
            this.templateId = CommandColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'commands'; }
        renderTemplate(container) {
            const commandColumn = DOM.append(container, $('.command'));
            const commandLabelContainer = DOM.append(commandColumn, $('.command-label'));
            const commandLabel = new highlightedLabel_1.HighlightedLabel(commandLabelContainer);
            const commandDefaultLabelContainer = DOM.append(commandColumn, $('.command-default-label'));
            const commandDefaultLabel = new highlightedLabel_1.HighlightedLabel(commandDefaultLabelContainer);
            const commandIdLabelContainer = DOM.append(commandColumn, $('.command-id.code'));
            const commandIdLabel = new highlightedLabel_1.HighlightedLabel(commandIdLabelContainer);
            return { commandColumn, commandLabelContainer, commandLabel, commandDefaultLabelContainer, commandDefaultLabel, commandIdLabelContainer, commandIdLabel };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            const keybindingItem = keybindingItemEntry.keybindingItem;
            const commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
            const commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
            templateData.commandColumn.classList.toggle('vertical-align-column', commandIdMatched || commandDefaultLabelMatched);
            templateData.commandColumn.title = keybindingItem.commandLabel ? (0, nls_1.localize)('title', "{0} ({1})", keybindingItem.commandLabel, keybindingItem.command) : keybindingItem.command;
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
            const element = DOM.append(container, $('.keybinding'));
            const keybindingLabel = new keybindingLabel_1.KeybindingLabel(DOM.append(element, $('div.keybinding-label')), platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
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
        const disposables = new lifecycle_1.DisposableStore();
        disposables.add(DOM.addDisposableListener(element, DOM.EventType.CLICK, DOM.finalHandler(callback)));
        disposables.add(DOM.addDisposableListener(element, DOM.EventType.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
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
        constructor(extensionsWorkbenchService) {
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.templateId = SourceColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const sourceColumn = DOM.append(container, $('.source'));
            const sourceLabel = new highlightedLabel_1.HighlightedLabel(DOM.append(sourceColumn, $('.source-label')));
            const extensionContainer = DOM.append(sourceColumn, $('.extension-container'));
            const extensionLabel = DOM.append(extensionContainer, $('a.extension-label', { tabindex: 0 }));
            const extensionId = new highlightedLabel_1.HighlightedLabel(DOM.append(extensionContainer, $('.extension-id-container.code')));
            return { sourceColumn, sourceLabel, extensionLabel, extensionContainer, extensionId, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            if ((0, types_1.isString)(keybindingItemEntry.keybindingItem.source)) {
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
                templateData.sourceColumn.title = (0, nls_1.localize)('extension label', "Extension ({0})", extensionLabel);
                templateData.extensionLabel.textContent = extensionLabel;
                templateData.disposables.add(onClick(templateData.extensionLabel, () => {
                    this.extensionsWorkbenchService.open(extension.identifier.value);
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
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], SourceColumnRenderer);
    let WhenInputWidget = class WhenInputWidget extends lifecycle_1.Disposable {
        constructor(parent, keybindingsEditor, instantiationService, contextKeyService) {
            super();
            this._onDidAccept = this._register(new event_1.Emitter());
            this.onDidAccept = this._onDidAccept.event;
            this._onDidReject = this._register(new event_1.Emitter());
            this.onDidReject = this._onDidReject.event;
            const focusContextKey = preferences_1.CONTEXT_WHEN_FOCUS.bindTo(contextKeyService);
            this.input = this._register(instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, 'keyboardshortcutseditor#wheninput', parent, {
                provideResults: () => {
                    const result = [];
                    for (const contextKey of contextkey_1.RawContextKey.all()) {
                        result.push({ label: contextKey.key, documentation: contextKey.description, detail: contextKey.type, kind: 14 /* CompletionItemKind.Constant */ });
                    }
                    return result;
                },
                triggerCharacters: ['!', ' '],
                wordDefinition: /[a-zA-Z.]+/,
                alwaysShowSuggestions: true,
            }, '', `keyboardshortcutseditor#wheninput`, { focusContextKey, overflowWidgetsDomNode: keybindingsEditor.overflowWidgetsDomNode }));
            this._register((DOM.addDisposableListener(this.input.element, DOM.EventType.DBLCLICK, e => DOM.EventHelper.stop(e))));
            this._register((0, lifecycle_1.toDisposable)(() => focusContextKey.reset()));
            this._register(keybindingsEditor.onAcceptWhenExpression(() => this._onDidAccept.fire(this.input.getValue())));
            this._register(event_1.Event.any(keybindingsEditor.onRejectWhenExpression, this.input.onDidBlur)(() => this._onDidReject.fire()));
        }
        layout(dimension) {
            this.input.layout(dimension);
        }
        show(value) {
            this.input.setValue(value);
            this.input.focus(true);
        }
    };
    WhenInputWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextkey_1.IContextKeyService)
    ], WhenInputWidget);
    let WhenColumnRenderer = class WhenColumnRenderer {
        static { WhenColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'when'; }
        constructor(keybindingsEditor, instantiationService) {
            this.keybindingsEditor = keybindingsEditor;
            this.instantiationService = instantiationService;
            this.templateId = WhenColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.when'));
            const whenLabelContainer = DOM.append(element, $('div.when-label'));
            const whenLabel = new highlightedLabel_1.HighlightedLabel(whenLabelContainer);
            const whenInputContainer = DOM.append(element, $('div.when-input-container'));
            return {
                element,
                whenLabelContainer,
                whenLabel,
                whenInputContainer,
                disposables: new lifecycle_1.DisposableStore(),
            };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.disposables.clear();
            const whenInputDisposables = templateData.disposables.add(new lifecycle_1.DisposableStore());
            templateData.disposables.add(this.keybindingsEditor.onDefineWhenExpression(e => {
                if (keybindingItemEntry === e) {
                    templateData.element.classList.add('input-mode');
                    const inputWidget = whenInputDisposables.add(this.instantiationService.createInstance(WhenInputWidget, templateData.whenInputContainer, this.keybindingsEditor));
                    inputWidget.layout(new DOM.Dimension(templateData.element.parentElement.clientWidth, 18));
                    inputWidget.show(keybindingItemEntry.keybindingItem.when || '');
                    const hideInputWidget = () => {
                        whenInputDisposables.clear();
                        templateData.element.classList.remove('input-mode');
                        templateData.element.parentElement.style.paddingLeft = '10px';
                        DOM.clearNode(templateData.whenInputContainer);
                    };
                    whenInputDisposables.add(inputWidget.onDidAccept(value => {
                        hideInputWidget();
                        this.keybindingsEditor.updateKeybinding(keybindingItemEntry, keybindingItemEntry.keybindingItem.keybinding ? keybindingItemEntry.keybindingItem.keybinding.getUserSettingsLabel() || '' : '', value);
                        this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
                    }));
                    whenInputDisposables.add(inputWidget.onDidReject(() => {
                        hideInputWidget();
                        this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
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
        __param(1, instantiation_1.IInstantiationService)
    ], WhenColumnRenderer);
    class AccessibilityProvider {
        constructor(configurationService) {
            this.configurationService = configurationService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('keybindingsLabel', "Keybindings");
        }
        getAriaLabel({ keybindingItem }) {
            const ariaLabel = [
                keybindingItem.commandLabel ? keybindingItem.commandLabel : keybindingItem.command,
                keybindingItem.keybinding?.getAriaLabel() || (0, nls_1.localize)('noKeybinding', "No keybinding assigned"),
                keybindingItem.when ? keybindingItem.when : (0, nls_1.localize)('noWhen', "No when context"),
                (0, types_1.isString)(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.description ?? keybindingItem.source.identifier.value,
            ];
            if (this.configurationService.getValue("accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */)) {
                const kbEditorAriaLabel = (0, nls_1.localize)('keyboard shortcuts aria label', "use space or enter to change the keybinding.");
                ariaLabel.push(kbEditorAriaLabel);
            }
            return ariaLabel.join(', ');
        }
    }
    (0, colorRegistry_1.registerColor)('keybindingTable.headerBackground', { dark: colorRegistry_1.tableOddRowsBackgroundColor, light: colorRegistry_1.tableOddRowsBackgroundColor, hcDark: colorRegistry_1.tableOddRowsBackgroundColor, hcLight: colorRegistry_1.tableOddRowsBackgroundColor }, 'Background color for the keyboard shortcuts table header.');
    (0, colorRegistry_1.registerColor)('keybindingTable.rowsBackground', { light: colorRegistry_1.tableOddRowsBackgroundColor, dark: colorRegistry_1.tableOddRowsBackgroundColor, hcDark: colorRegistry_1.tableOddRowsBackgroundColor, hcLight: colorRegistry_1.tableOddRowsBackgroundColor }, 'Background color for the keyboard shortcuts table alternating rows.');
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            const whenForegroundColor = foregroundColor.transparent(.8).makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listActiveSelectionForegroundColor = theme.getColor(colorRegistry_1.listActiveSelectionForeground);
        const listActiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.listActiveSelectionBackground);
        if (listActiveSelectionForegroundColor && listActiveSelectionBackgroundColor) {
            const whenForegroundColor = listActiveSelectionForegroundColor.transparent(.8).makeOpaque(listActiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listInactiveSelectionForegroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionForeground);
        const listInactiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionBackground);
        if (listInactiveSelectionForegroundColor && listInactiveSelectionBackgroundColor) {
            const whenForegroundColor = listInactiveSelectionForegroundColor.transparent(.8).makeOpaque(listInactiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listFocusForegroundColor = theme.getColor(colorRegistry_1.listFocusForeground);
        const listFocusBackgroundColor = theme.getColor(colorRegistry_1.listFocusBackground);
        if (listFocusForegroundColor && listFocusBackgroundColor) {
            const whenForegroundColor = listFocusForegroundColor.transparent(.8).makeOpaque(listFocusBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listHoverForegroundColor = theme.getColor(colorRegistry_1.listHoverForeground);
        const listHoverBackgroundColor = theme.getColor(colorRegistry_1.listHoverBackground);
        if (listHoverForegroundColor && listHoverBackgroundColor) {
            const whenForegroundColor = listHoverForegroundColor.transparent(.8).makeOpaque(listHoverBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL2tleWJpbmRpbmdzRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5RGhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFVCxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHVCQUFVOztpQkFFaEMsT0FBRSxHQUFXLDhCQUE4QixBQUF6QyxDQUEwQztRQTBDNUQsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3RCLGtCQUF1RCxFQUN0RCxrQkFBd0QsRUFDbEQsd0JBQW9FLEVBQzNFLGlCQUFzRCxFQUNwRCxtQkFBMEQsRUFDN0QsZ0JBQW9ELEVBQ2hELG9CQUE0RCxFQUNuRSxhQUE4QyxFQUM3QyxjQUErQixFQUN6QixvQkFBNEQ7WUFFbkYsS0FBSyxDQUFDLG1CQUFpQixDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFYdkMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2pDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDMUQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFFdEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQXBENUUsNEJBQXVCLEdBQWtDLElBQUksQ0FBQyxTQUFTLENBQUMs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