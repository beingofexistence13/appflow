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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/tocTree", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/extensions/common/extensions", "vs/base/browser/ui/splitview/splitview", "vs/base/common/color", "vs/editor/common/languages/language", "vs/workbench/contrib/preferences/browser/settingsSearchMenu", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles", "vs/workbench/services/assignment/common/assignmentService", "vs/platform/product/common/productService", "vs/platform/environment/common/environment", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/progress/common/progress", "vs/css!./media/settingsEditor2"], function (require, exports, DOM, aria, keyboardEvent_1, actionbar_1, button_1, actions_1, async_1, cancellation_1, date_1, errors_1, event_1, iterator_1, lifecycle_1, platform, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, userDataSync_1, editorPane_1, suggestEnabledInput_1, preferencesWidgets_1, settingsLayout_1, settingsTree_1, settingsTreeModels_1, tocTree_1, preferences_1, settingsEditorColorRegistry_1, editorGroupsService_1, preferences_2, preferencesModels_1, userDataSync_2, preferencesIcons_1, workspaceTrust_1, configuration_1, textResourceConfiguration_1, extensions_1, splitview_1, color_1, language_1, settingsSearchMenu_1, extensionManagement_1, configurationRegistry_1, platform_1, defaultStyles_1, assignmentService_1, productService_1, environment_1, widgetNavigationCommands_1, progress_1) {
    "use strict";
    var SettingsEditor2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsEditor2 = exports.createGroupIterator = exports.SettingsFocusContext = void 0;
    var SettingsFocusContext;
    (function (SettingsFocusContext) {
        SettingsFocusContext[SettingsFocusContext["Search"] = 0] = "Search";
        SettingsFocusContext[SettingsFocusContext["TableOfContents"] = 1] = "TableOfContents";
        SettingsFocusContext[SettingsFocusContext["SettingTree"] = 2] = "SettingTree";
        SettingsFocusContext[SettingsFocusContext["SettingControl"] = 3] = "SettingControl";
    })(SettingsFocusContext || (exports.SettingsFocusContext = SettingsFocusContext = {}));
    function createGroupIterator(group) {
        return iterator_1.Iterable.map(group.children, g => {
            return {
                element: g,
                children: g instanceof settingsTreeModels_1.SettingsTreeGroupElement ?
                    createGroupIterator(g) :
                    undefined
            };
        });
    }
    exports.createGroupIterator = createGroupIterator;
    const $ = DOM.$;
    const searchBoxLabel = (0, nls_1.localize)('SearchSettings.AriaLabel', "Search settings");
    const SETTINGS_EDITOR_STATE_KEY = 'settingsEditorState';
    let SettingsEditor2 = class SettingsEditor2 extends editorPane_1.EditorPane {
        static { SettingsEditor2_1 = this; }
        static { this.ID = 'workbench.editor.settings2'; }
        static { this.NUM_INSTANCES = 0; }
        static { this.SEARCH_DEBOUNCE = 200; }
        static { this.SETTING_UPDATE_FAST_DEBOUNCE = 200; }
        static { this.SETTING_UPDATE_SLOW_DEBOUNCE = 1000; }
        static { this.CONFIG_SCHEMA_UPDATE_DELAYER = 500; }
        static { this.TOC_MIN_WIDTH = 100; }
        static { this.TOC_RESET_WIDTH = 200; }
        static { this.EDITOR_MIN_WIDTH = 500; }
        // Below NARROW_TOTAL_WIDTH, we only render the editor rather than the ToC.
        static { this.NARROW_TOTAL_WIDTH = SettingsEditor2_1.TOC_RESET_WIDTH + SettingsEditor2_1.EDITOR_MIN_WIDTH; }
        static { this.SUGGESTIONS = [
            `@${preferences_1.MODIFIED_SETTING_TAG}`,
            '@tag:notebookLayout',
            '@tag:notebookOutputLayout',
            `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`,
            `@tag:${preferences_1.WORKSPACE_TRUST_SETTING_TAG}`,
            '@tag:sync',
            '@tag:usesOnlineServices',
            '@tag:telemetry',
            '@tag:accessibility',
            `@${preferences_1.ID_SETTING_TAG}`,
            `@${preferences_1.EXTENSION_SETTING_TAG}`,
            `@${preferences_1.FEATURE_SETTING_TAG}scm`,
            `@${preferences_1.FEATURE_SETTING_TAG}explorer`,
            `@${preferences_1.FEATURE_SETTING_TAG}search`,
            `@${preferences_1.FEATURE_SETTING_TAG}debug`,
            `@${preferences_1.FEATURE_SETTING_TAG}extensions`,
            `@${preferences_1.FEATURE_SETTING_TAG}terminal`,
            `@${preferences_1.FEATURE_SETTING_TAG}task`,
            `@${preferences_1.FEATURE_SETTING_TAG}problems`,
            `@${preferences_1.FEATURE_SETTING_TAG}output`,
            `@${preferences_1.FEATURE_SETTING_TAG}comments`,
            `@${preferences_1.FEATURE_SETTING_TAG}remote`,
            `@${preferences_1.FEATURE_SETTING_TAG}timeline`,
            `@${preferences_1.FEATURE_SETTING_TAG}notebook`,
            `@${preferences_1.POLICY_SETTING_TAG}`
        ]; }
        static shouldSettingUpdateFast(type) {
            if (Array.isArray(type)) {
                // nullable integer/number or complex
                return false;
            }
            return type === preferences_2.SettingValueType.Enum ||
                type === preferences_2.SettingValueType.Array ||
                type === preferences_2.SettingValueType.BooleanObject ||
                type === preferences_2.SettingValueType.Object ||
                type === preferences_2.SettingValueType.Complex ||
                type === preferences_2.SettingValueType.Boolean ||
                type === preferences_2.SettingValueType.Exclude ||
                type === preferences_2.SettingValueType.Include;
        }
        constructor(telemetryService, configurationService, textResourceConfigurationService, themeService, preferencesService, instantiationService, preferencesSearchService, logService, contextKeyService, storageService, editorGroupService, userDataSyncWorkbenchService, userDataSyncEnablementService, workspaceTrustManagementService, extensionService, languageService, extensionManagementService, workbenchAssignmentService, productService, environmentService, extensionGalleryService, editorProgressService) {
            super(SettingsEditor2_1.ID, telemetryService, themeService, storageService);
            this.configurationService = configurationService;
            this.preferencesService = preferencesService;
            this.instantiationService = instantiationService;
            this.preferencesSearchService = preferencesSearchService;
            this.logService = logService;
            this.storageService = storageService;
            this.editorGroupService = editorGroupService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.extensionService = extensionService;
            this.languageService = languageService;
            this.workbenchAssignmentService = workbenchAssignmentService;
            this.productService = productService;
            this.environmentService = environmentService;
            this.extensionGalleryService = extensionGalleryService;
            this.editorProgressService = editorProgressService;
            this.searchInProgress = null;
            this.pendingSettingUpdate = null;
            this._searchResultModel = null;
            this.searchResultLabel = null;
            this.lastSyncedLabel = null;
            this._currentFocusContext = 0 /* SettingsFocusContext.Search */;
            /** Don't spam warnings */
            this.hasWarnedMissingSettings = false;
            this.tocFocusedElement = null;
            this.treeFocusedElement = null;
            this.settingsTreeScrollTop = 0;
            this.installedExtensionIds = [];
            this.delayedFilterLogging = new async_1.Delayer(1000);
            this.localSearchDelayer = new async_1.Delayer(300);
            this.remoteSearchThrottle = new async_1.ThrottledDelayer(200);
            this.viewState = { settingsTarget: 3 /* ConfigurationTarget.USER_LOCAL */ };
            this.settingFastUpdateDelayer = new async_1.Delayer(SettingsEditor2_1.SETTING_UPDATE_FAST_DEBOUNCE);
            this.settingSlowUpdateDelayer = new async_1.Delayer(SettingsEditor2_1.SETTING_UPDATE_SLOW_DEBOUNCE);
            this.searchInputDelayer = new async_1.Delayer(SettingsEditor2_1.SEARCH_DEBOUNCE);
            this.updatedConfigSchemaDelayer = new async_1.Delayer(SettingsEditor2_1.CONFIG_SCHEMA_UPDATE_DELAYER);
            this.inSettingsEditorContextKey = preferences_1.CONTEXT_SETTINGS_EDITOR.bindTo(contextKeyService);
            this.searchFocusContextKey = preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(contextKeyService);
            this.tocRowFocused = preferences_1.CONTEXT_TOC_ROW_FOCUS.bindTo(contextKeyService);
            this.settingRowFocused = preferences_1.CONTEXT_SETTINGS_ROW_FOCUS.bindTo(contextKeyService);
            this.scheduledRefreshes = new Map();
            this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, SETTINGS_EDITOR_STATE_KEY);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                    this.onConfigUpdate(e.affectedKeys);
                }
            }));
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => {
                this.searchResultModel?.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
                if (this.settingsTreeModel) {
                    this.settingsTreeModel.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
                    this.renderTree();
                }
            }));
            this._register(configurationService.onDidChangeRestrictedSettings(e => {
                if (e.default.length && this.currentSettingsModel) {
                    this.updateElementsByKey(new Set(e.default));
                }
            }));
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
            if (preferences_1.ENABLE_LANGUAGE_FILTER && !SettingsEditor2_1.SUGGESTIONS.includes(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                SettingsEditor2_1.SUGGESTIONS.push(`@${preferences_1.LANGUAGE_SETTING_TAG}`);
            }
            extensionManagementService.getInstalled().then(extensions => {
                this.installedExtensionIds = extensions
                    .filter(ext => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration)
                    .map(ext => ext.identifier.id);
            });
        }
        get minimumWidth() { return SettingsEditor2_1.EDITOR_MIN_WIDTH; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        get minimumHeight() { return 180; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        get currentSettingsModel() {
            return this.searchResultModel || this.settingsTreeModel;
        }
        get searchResultModel() {
            return this._searchResultModel;
        }
        set searchResultModel(value) {
            this._searchResultModel = value;
            this.rootElement.classList.toggle('search-mode', !!this._searchResultModel);
        }
        get focusedSettingDOMElement() {
            const focused = this.settingsTree.getFocus()[0];
            if (!(focused instanceof settingsTreeModels_1.SettingsTreeSettingElement)) {
                return;
            }
            return this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), focused.setting.key)[0];
        }
        get currentFocusContext() {
            return this._currentFocusContext;
        }
        createEditor(parent) {
            parent.setAttribute('tabindex', '-1');
            this.rootElement = DOM.append(parent, $('.settings-editor', { tabindex: '-1' }));
            this.createHeader(this.rootElement);
            this.createBody(this.rootElement);
            this.addCtrlAInterceptor(this.rootElement);
            this.updateStyles();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.searchWidget.inputWidget.hasWidgetFocus()) {
                        this.focusTOC();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.searchWidget.inputWidget.hasWidgetFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        async setInput(input, options, context, token) {
            this.inSettingsEditorContextKey.set(true);
            await super.setInput(input, options, context, token);
            await (0, async_1.timeout)(0); // Force setInput to be async
            if (!this.input) {
                return;
            }
            const model = await this.input.resolve(options);
            if (token.isCancellationRequested || !(model instanceof preferencesModels_1.Settings2EditorModel)) {
                return;
            }
            this.modelDisposables.clear();
            this.modelDisposables.add(model.onDidChangeGroups(() => {
                this.updatedConfigSchemaDelayer.trigger(() => {
                    this.onConfigUpdate(undefined, false, true);
                });
            }));
            this.defaultSettingsEditorModel = model;
            options = options || (0, preferences_2.validateSettingsEditorOptions)({});
            if (!this.viewState.settingsTarget || !this.settingsTargetsWidget.settingsTarget) {
                const optionsHasViewStateTarget = options.viewState && options.viewState.settingsTarget;
                if (!options.target && !optionsHasViewStateTarget) {
                    options.target = 3 /* ConfigurationTarget.USER_LOCAL */;
                }
            }
            this._setOptions(options);
            // Don't block setInput on render (which can trigger an async search)
            this.onConfigUpdate(undefined, true).then(() => {
                this._register(input.onWillDispose(() => {
                    this.searchWidget.setValue('');
                }));
                // Init TOC selection
                this.updateTreeScrollSync();
            });
        }
        restoreCachedState() {
            const cachedState = this.group && this.input && this.editorMemento.loadEditorState(this.group, this.input);
            if (cachedState && typeof cachedState.target === 'object') {
                cachedState.target = uri_1.URI.revive(cachedState.target);
            }
            if (cachedState) {
                const settingsTarget = cachedState.target;
                this.settingsTargetsWidget.settingsTarget = settingsTarget;
                this.viewState.settingsTarget = settingsTarget;
                this.searchWidget.setValue(cachedState.searchQuery);
            }
            if (this.input) {
                this.editorMemento.clearEditorState(this.input, this.group);
            }
            return cachedState ?? null;
        }
        getViewState() {
            return this.viewState;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                this._setOptions(options);
            }
        }
        _setOptions(options) {
            if (options.focusSearch && !platform.isIOS) {
                // isIOS - #122044
                this.focusSearch();
            }
            const recoveredViewState = options.viewState ?
                options.viewState : undefined;
            const query = recoveredViewState?.query ?? options.query;
            if (query !== undefined) {
                this.searchWidget.setValue(query);
                this.viewState.query = query;
            }
            const target = options.folderUri ?? recoveredViewState?.settingsTarget ?? options.target;
            if (target) {
                this.settingsTargetsWidget.settingsTarget = target;
                this.viewState.settingsTarget = target;
            }
        }
        clearInput() {
            this.inSettingsEditorContextKey.set(false);
            super.clearInput();
        }
        layout(dimension) {
            this.dimension = dimension;
            if (!this.isVisible()) {
                return;
            }
            this.layoutSplitView(dimension);
            const innerWidth = Math.min(this.headerContainer.clientWidth, dimension.width) - 24 * 2; // 24px padding on left and right;
            // minus padding inside inputbox, countElement width, controls width, extra padding before countElement
            const monacoWidth = innerWidth - 10 - this.countElement.clientWidth - this.controlsElement.clientWidth - 12;
            this.searchWidget.layout(new DOM.Dimension(monacoWidth, 20));
            this.rootElement.classList.toggle('narrow-width', dimension.width < SettingsEditor2_1.NARROW_TOTAL_WIDTH);
        }
        focus() {
            if (this._currentFocusContext === 0 /* SettingsFocusContext.Search */) {
                if (!platform.isIOS) {
                    // #122044
                    this.focusSearch();
                }
            }
            else if (this._currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                const element = this.focusedSettingDOMElement;
                if (element) {
                    const control = element.querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                    if (control) {
                        control.focus();
                        return;
                    }
                }
            }
            else if (this._currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                this.settingsTree.domFocus();
            }
            else if (this._currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                this.tocTree.domFocus();
            }
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (!visible) {
                // Wait for editor to be removed from DOM #106303
                setTimeout(() => {
                    this.searchWidget.onHide();
                }, 0);
            }
        }
        focusSettings(focusSettingInput = false) {
            const focused = this.settingsTree.getFocus();
            if (!focused.length) {
                this.settingsTree.focusFirst();
            }
            this.settingsTree.domFocus();
            if (focusSettingInput) {
                const controlInFocusedRow = this.settingsTree.getHTMLElement().querySelector(`.focused ${settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR}`);
                if (controlInFocusedRow) {
                    controlInFocusedRow.focus();
                }
            }
        }
        focusTOC() {
            this.tocTree.domFocus();
        }
        showContextMenu() {
            const focused = this.settingsTree.getFocus()[0];
            const rowElement = this.focusedSettingDOMElement;
            if (rowElement && focused instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                this.settingRenderers.showContextMenu(focused, rowElement);
            }
        }
        focusSearch(filter, selectAll = true) {
            if (filter && this.searchWidget) {
                this.searchWidget.setValue(filter);
            }
            this.searchWidget.focus(selectAll);
        }
        clearSearchResults() {
            this.searchWidget.setValue('');
            this.focusSearch();
        }
        clearSearchFilters() {
            const query = this.searchWidget.getValue();
            const splitQuery = query.split(' ').filter(word => {
                return word.length && !SettingsEditor2_1.SUGGESTIONS.some(suggestion => word.startsWith(suggestion));
            });
            this.searchWidget.setValue(splitQuery.join(' '));
        }
        updateInputAriaLabel() {
            let label = searchBoxLabel;
            if (this.searchResultLabel) {
                label += `. ${this.searchResultLabel}`;
            }
            if (this.lastSyncedLabel) {
                label += `. ${this.lastSyncedLabel}`;
            }
            this.searchWidget.updateAriaLabel(label);
        }
        /**
         * Render the header of the Settings editor, which includes the content above the splitview.
         */
        createHeader(parent) {
            this.headerContainer = DOM.append(parent, $('.settings-header'));
            const searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            const clearInputAction = new actions_1.Action(preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, (0, nls_1.localize)('clearInput', "Clear Settings Search Input"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesClearInputIcon), false, async () => this.clearSearchResults());
            const filterAction = new actions_1.Action(preferences_1.SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, (0, nls_1.localize)('filterInput', "Filter Settings"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesFilterIcon));
            this.searchWidget = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, `${SettingsEditor2_1.ID}.searchbox`, searchContainer, {
                triggerCharacters: ['@', ':'],
                provideResults: (query) => {
                    // Based on testing, the trigger character is always at the end of the query.
                    // for the ':' trigger, only return suggestions if there was a '@' before it in the same word.
                    const queryParts = query.split(/\s/g);
                    if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                        const sortedLanguages = this.languageService.getRegisteredLanguageIds().map(languageId => {
                            return `@${preferences_1.LANGUAGE_SETTING_TAG}${languageId} `;
                        }).sort();
                        return sortedLanguages.filter(langFilter => !query.includes(langFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.EXTENSION_SETTING_TAG}`)) {
                        const installedExtensionsTags = this.installedExtensionIds.map(extensionId => {
                            return `@${preferences_1.EXTENSION_SETTING_TAG}${extensionId} `;
                        }).sort();
                        return installedExtensionsTags.filter(extFilter => !query.includes(extFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith('@')) {
                        return SettingsEditor2_1.SUGGESTIONS.filter(tag => !query.includes(tag)).map(tag => tag.endsWith(':') ? tag : tag + ' ');
                    }
                    return [];
                }
            }, searchBoxLabel, 'settingseditor:searchinput' + SettingsEditor2_1.NUM_INSTANCES++, {
                placeholderText: searchBoxLabel,
                focusContextKey: this.searchFocusContextKey,
                styleOverrides: {
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                }
                // TODO: Aria-live
            }));
            this._register(this.searchWidget.onDidFocus(() => {
                this._currentFocusContext = 0 /* SettingsFocusContext.Search */;
            }));
            this.countElement = DOM.append(searchContainer, DOM.$('.settings-count-widget.monaco-count-badge.long'));
            this.countElement.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            this.countElement.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            this.countElement.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            this._register(this.searchWidget.onInputDidChange(() => {
                const searchVal = this.searchWidget.getValue();
                clearInputAction.enabled = !!searchVal;
                this.searchInputDelayer.trigger(() => this.onSearchInputChanged());
            }));
            const headerControlsContainer = DOM.append(this.headerContainer, $('.settings-header-controls'));
            headerControlsContainer.style.borderColor = (0, colorRegistry_1.asCssVariable)(settingsEditorColorRegistry_1.settingsHeaderBorder);
            const targetWidgetContainer = DOM.append(headerControlsContainer, $('.settings-target-container'));
            this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SettingsTargetsWidget, targetWidgetContainer, { enableRemoteSettings: true }));
            this.settingsTargetsWidget.settingsTarget = 3 /* ConfigurationTarget.USER_LOCAL */;
            this.settingsTargetsWidget.onDidTargetChange(target => this.onDidSettingsTargetChange(target));
            this._register(DOM.addDisposableListener(targetWidgetContainer, DOM.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    this.focusSettings();
                }
            }));
            if (this.userDataSyncWorkbenchService.enabled && this.userDataSyncEnablementService.canToggleEnablement()) {
                const syncControls = this._register(this.instantiationService.createInstance(SyncControls, headerControlsContainer));
                this._register(syncControls.onDidChangeLastSyncedLabel(lastSyncedLabel => {
                    this.lastSyncedLabel = lastSyncedLabel;
                    this.updateInputAriaLabel();
                }));
            }
            this.controlsElement = DOM.append(searchContainer, DOM.$('.settings-clear-widget'));
            const actionBar = this._register(new actionbar_1.ActionBar(this.controlsElement, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action.id === filterAction.id) {
                        return this.instantiationService.createInstance(settingsSearchMenu_1.SettingsSearchFilterDropdownMenuActionViewItem, action, this.actionRunner, this.searchWidget);
                    }
                    return undefined;
                }
            }));
            actionBar.push([clearInputAction, filterAction], { label: false, icon: true });
        }
        onDidSettingsTargetChange(target) {
            this.viewState.settingsTarget = target;
            // TODO Instead of rebuilding the whole model, refresh and uncache the inspected setting value
            this.onConfigUpdate(undefined, true);
        }
        onDidClickSetting(evt, recursed) {
            const targetElement = this.currentSettingsModel.getElementsByName(evt.targetKey)?.[0];
            let revealFailed = false;
            if (targetElement) {
                let sourceTop = 0.5;
                try {
                    const _sourceTop = this.settingsTree.getRelativeTop(evt.source);
                    if (_sourceTop !== null) {
                        sourceTop = _sourceTop;
                    }
                }
                catch {
                    // e.g. clicked a searched element, now the search has been cleared
                }
                // If we search for something and focus on a category, the settings tree
                // only renders settings in that category.
                // If the target display category is different than the source's, unfocus the category
                // so that we can render all found settings again.
                // Then, the reveal call will correctly find the target setting.
                if (this.viewState.filterToCategory && evt.source.displayCategory !== targetElement.displayCategory) {
                    this.tocTree.setFocus([]);
                }
                try {
                    this.settingsTree.reveal(targetElement, sourceTop);
                }
                catch (_) {
                    // The listwidget couldn't find the setting to reveal,
                    // even though it's in the model, meaning there might be a filter
                    // preventing it from showing up.
                    revealFailed = true;
                }
                if (!revealFailed) {
                    // We need to shift focus from the setting that contains the link to the setting that's
                    // linked. Clicking on the link sets focus on the setting that contains the link,
                    // which is why we need the setTimeout.
                    setTimeout(() => {
                        this.settingsTree.setFocus([targetElement]);
                    }, 50);
                    const domElements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), evt.targetKey);
                    if (domElements && domElements[0]) {
                        const control = domElements[0].querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                        if (control) {
                            control.focus();
                        }
                    }
                }
            }
            if (!recursed && (!targetElement || revealFailed)) {
                // We'll call this event handler again after clearing the search query,
                // so that more settings show up in the list.
                const p = this.triggerSearch('');
                p.then(() => {
                    this.searchWidget.setValue('');
                    this.onDidClickSetting(evt, true);
                });
            }
        }
        switchToSettingsFile() {
            const query = (0, settingsTreeModels_1.parseQuery)(this.searchWidget.getValue()).query;
            return this.openSettingsFile({ query });
        }
        async openSettingsFile(options) {
            const currentSettingsTarget = this.settingsTargetsWidget.settingsTarget;
            const openOptions = { jsonEditor: true, ...options };
            if (currentSettingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (options?.revealSetting) {
                    const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
                    const configurationScope = configurationProperties[options?.revealSetting.key]?.scope;
                    if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                        return this.preferencesService.openApplicationSettings(openOptions);
                    }
                }
                return this.preferencesService.openUserSettings(openOptions);
            }
            else if (currentSettingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return this.preferencesService.openRemoteSettings(openOptions);
            }
            else if (currentSettingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return this.preferencesService.openWorkspaceSettings(openOptions);
            }
            else if (uri_1.URI.isUri(currentSettingsTarget)) {
                return this.preferencesService.openFolderSettings({ folderUri: currentSettingsTarget, ...openOptions });
            }
            return undefined;
        }
        createBody(parent) {
            this.bodyContainer = DOM.append(parent, $('.settings-body'));
            this.noResultsMessage = DOM.append(this.bodyContainer, $('.no-results-message'));
            this.noResultsMessage.innerText = (0, nls_1.localize)('noResults', "No Settings Found");
            this.clearFilterLinkContainer = $('span.clear-search-filters');
            this.clearFilterLinkContainer.textContent = ' - ';
            const clearFilterLink = DOM.append(this.clearFilterLinkContainer, $('a.pointer.prominent', { tabindex: 0 }, (0, nls_1.localize)('clearSearchFilters', 'Clear Filters')));
            this._register(DOM.addDisposableListener(clearFilterLink, DOM.EventType.CLICK, (e) => {
                DOM.EventHelper.stop(e, false);
                this.clearSearchFilters();
            }));
            DOM.append(this.noResultsMessage, this.clearFilterLinkContainer);
            this.noResultsMessage.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorForeground);
            this.tocTreeContainer = $('.settings-toc-container');
            this.settingsTreeContainer = $('.settings-tree-container');
            this.createTOC(this.tocTreeContainer);
            this.createSettingsTree(this.settingsTreeContainer);
            this.splitView = new splitview_1.SplitView(this.bodyContainer, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                proportionalLayout: true
            });
            const startingWidth = this.storageService.getNumber('settingsEditor2.splitViewWidth', 0 /* StorageScope.PROFILE */, SettingsEditor2_1.TOC_RESET_WIDTH);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: this.tocTreeContainer,
                minimumSize: SettingsEditor2_1.TOC_MIN_WIDTH,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.tocTreeContainer.style.width = `${width}px`;
                    this.tocTree.layout(height, width);
                }
            }, startingWidth, undefined, true);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: this.settingsTreeContainer,
                minimumSize: SettingsEditor2_1.EDITOR_MIN_WIDTH,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.settingsTreeContainer.style.width = `${width}px`;
                    this.settingsTree.layout(height, width);
                }
            }, splitview_1.Sizing.Distribute, undefined, true);
            this._register(this.splitView.onDidSashReset(() => {
                const totalSize = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
                this.splitView.resizeView(0, SettingsEditor2_1.TOC_RESET_WIDTH);
                this.splitView.resizeView(1, totalSize - SettingsEditor2_1.TOC_RESET_WIDTH);
            }));
            this._register(this.splitView.onDidSashChange(() => {
                const width = this.splitView.getViewSize(0);
                this.storageService.store('settingsEditor2.splitViewWidth', width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }));
            const borderColor = this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder);
            this.splitView.style({ separatorBorder: borderColor });
        }
        addCtrlAInterceptor(container) {
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, (e) => {
                if (e.keyCode === 31 /* KeyCode.KeyA */ &&
                    (platform.isMacintosh ? e.metaKey : e.ctrlKey) &&
                    e.target.tagName !== 'TEXTAREA' &&
                    e.target.tagName !== 'INPUT') {
                    // Avoid browser ctrl+a
                    e.browserEvent.stopPropagation();
                    e.browserEvent.preventDefault();
                }
            }));
        }
        createTOC(container) {
            this.tocTreeModel = this.instantiationService.createInstance(tocTree_1.TOCTreeModel, this.viewState);
            this.tocTree = this._register(this.instantiationService.createInstance(tocTree_1.TOCTree, DOM.append(container, $('.settings-toc-wrapper', {
                'role': 'navigation',
                'aria-label': (0, nls_1.localize)('settings', "Settings"),
            })), this.viewState));
            this._register(this.tocTree.onDidFocus(() => {
                this._currentFocusContext = 1 /* SettingsFocusContext.TableOfContents */;
            }));
            this._register(this.tocTree.onDidChangeFocus(e => {
                const element = e.elements?.[0] ?? null;
                if (this.tocFocusedElement === element) {
                    return;
                }
                this.tocFocusedElement = element;
                this.tocTree.setSelection(element ? [element] : []);
                if (this.searchResultModel) {
                    if (this.viewState.filterToCategory !== element) {
                        this.viewState.filterToCategory = element ?? undefined;
                        // Force render in this case, because
                        // onDidClickSetting relies on the updated view.
                        this.renderTree(undefined, true);
                        this.settingsTree.scrollTop = 0;
                    }
                }
                else if (element && (!e.browserEvent || !e.browserEvent.fromScroll)) {
                    this.settingsTree.reveal(element, 0);
                    this.settingsTree.setFocus([element]);
                }
            }));
            this._register(this.tocTree.onDidFocus(() => {
                this.tocRowFocused.set(true);
            }));
            this._register(this.tocTree.onDidBlur(() => {
                this.tocRowFocused.set(false);
            }));
        }
        applyFilter(filter) {
            if (this.searchWidget && !this.searchWidget.getValue().includes(filter)) {
                // Prepend the filter to the query.
                const newQuery = `${filter} ${this.searchWidget.getValue().trimStart()}`;
                this.focusSearch(newQuery, false);
            }
        }
        removeLanguageFilters() {
            if (this.searchWidget && this.searchWidget.getValue().includes(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                const query = this.searchWidget.getValue().split(' ');
                const newQuery = query.filter(word => !word.startsWith(`@${preferences_1.LANGUAGE_SETTING_TAG}`)).join(' ');
                this.focusSearch(newQuery, false);
            }
        }
        createSettingsTree(container) {
            this.settingRenderers = this.instantiationService.createInstance(settingsTree_1.SettingTreeRenderers);
            this._register(this.settingRenderers.onDidChangeSetting(e => this.onDidChangeSetting(e.key, e.value, e.type, e.manualReset, e.scope)));
            this._register(this.settingRenderers.onDidOpenSettings(settingKey => {
                this.openSettingsFile({ revealSetting: { key: settingKey, edit: true } });
            }));
            this._register(this.settingRenderers.onDidClickSettingLink(settingName => this.onDidClickSetting(settingName)));
            this._register(this.settingRenderers.onDidFocusSetting(element => {
                this.settingsTree.setFocus([element]);
                this._currentFocusContext = 3 /* SettingsFocusContext.SettingControl */;
                this.settingRowFocused.set(false);
            }));
            this._register(this.settingRenderers.onDidChangeSettingHeight((params) => {
                const { element, height } = params;
                try {
                    this.settingsTree.updateElementHeight(element, height);
                }
                catch (e) {
                    // the element was not found
                }
            }));
            this._register(this.settingRenderers.onApplyFilter((filter) => this.applyFilter(filter)));
            this._register(this.settingRenderers.onDidClickOverrideElement((element) => {
                this.removeLanguageFilters();
                if (element.language) {
                    this.applyFilter(`@${preferences_1.LANGUAGE_SETTING_TAG}${element.language}`);
                }
                if (element.scope === 'workspace') {
                    this.settingsTargetsWidget.updateTarget(5 /* ConfigurationTarget.WORKSPACE */);
                }
                else if (element.scope === 'user') {
                    this.settingsTargetsWidget.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
                }
                else if (element.scope === 'remote') {
                    this.settingsTargetsWidget.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */);
                }
                this.applyFilter(`@${preferences_1.ID_SETTING_TAG}${element.settingKey}`);
            }));
            this.settingsTree = this._register(this.instantiationService.createInstance(settingsTree_1.SettingsTree, container, this.viewState, this.settingRenderers.allRenderers));
            this._register(this.settingsTree.onDidScroll(() => {
                if (this.settingsTree.scrollTop === this.settingsTreeScrollTop) {
                    return;
                }
                this.settingsTreeScrollTop = this.settingsTree.scrollTop;
                // setTimeout because calling setChildren on the settingsTree can trigger onDidScroll, so it fires when
                // setChildren has called on the settings tree but not the toc tree yet, so their rendered elements are out of sync
                setTimeout(() => {
                    this.updateTreeScrollSync();
                }, 0);
            }));
            this._register(this.settingsTree.onDidFocus(() => {
                const classList = document.activeElement?.classList;
                if (classList && classList.contains('monaco-list') && classList.contains('settings-editor-tree')) {
                    this._currentFocusContext = 2 /* SettingsFocusContext.SettingTree */;
                    this.settingRowFocused.set(true);
                    this.treeFocusedElement ??= this.settingsTree.firstVisibleElement ?? null;
                    if (this.treeFocusedElement) {
                        this.treeFocusedElement.tabbable = true;
                    }
                }
            }));
            this._register(this.settingsTree.onDidBlur(() => {
                this.settingRowFocused.set(false);
                // Clear out the focused element, otherwise it could be
                // out of date during the next onDidFocus event.
                this.treeFocusedElement = null;
            }));
            // There is no different select state in the settings tree
            this._register(this.settingsTree.onDidChangeFocus(e => {
                const element = e.elements[0];
                if (this.treeFocusedElement === element) {
                    return;
                }
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = false;
                }
                this.treeFocusedElement = element;
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = true;
                }
                this.settingsTree.setSelection(element ? [element] : []);
            }));
        }
        onDidChangeSetting(key, value, type, manualReset, scope) {
            const parsedQuery = (0, settingsTreeModels_1.parseQuery)(this.searchWidget.getValue());
            const languageFilter = parsedQuery.languageFilter;
            if (manualReset || (this.pendingSettingUpdate && this.pendingSettingUpdate.key !== key)) {
                this.updateChangedSetting(key, value, manualReset, languageFilter, scope);
            }
            this.pendingSettingUpdate = { key, value, languageFilter };
            if (SettingsEditor2_1.shouldSettingUpdateFast(type)) {
                this.settingFastUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
            }
            else {
                this.settingSlowUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
            }
        }
        updateTreeScrollSync() {
            this.settingRenderers.cancelSuggesters();
            if (this.searchResultModel) {
                return;
            }
            if (!this.tocTreeModel) {
                return;
            }
            const elementToSync = this.settingsTree.firstVisibleElement;
            const element = elementToSync instanceof settingsTreeModels_1.SettingsTreeSettingElement ? elementToSync.parent :
                elementToSync instanceof settingsTreeModels_1.SettingsTreeGroupElement ? elementToSync :
                    null;
            // It's possible for this to be called when the TOC and settings tree are out of sync - e.g. when the settings tree has deferred a refresh because
            // it is focused. So, bail if element doesn't exist in the TOC.
            let nodeExists = true;
            try {
                this.tocTree.getNode(element);
            }
            catch (e) {
                nodeExists = false;
            }
            if (!nodeExists) {
                return;
            }
            if (element && this.tocTree.getSelection()[0] !== element) {
                const ancestors = this.getAncestors(element);
                ancestors.forEach(e => this.tocTree.expand(e));
                this.tocTree.reveal(element);
                const elementTop = this.tocTree.getRelativeTop(element);
                if (typeof elementTop !== 'number') {
                    return;
                }
                this.tocTree.collapseAll();
                ancestors.forEach(e => this.tocTree.expand(e));
                if (elementTop < 0 || elementTop > 1) {
                    this.tocTree.reveal(element);
                }
                else {
                    this.tocTree.reveal(element, elementTop);
                }
                this.tocTree.expand(element);
                this.tocTree.setSelection([element]);
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                fakeKeyboardEvent.fromScroll = true;
                this.tocTree.setFocus([element], fakeKeyboardEvent);
            }
        }
        getAncestors(element) {
            const ancestors = [];
            while (element.parent) {
                if (element.parent.id !== 'root') {
                    ancestors.push(element.parent);
                }
                element = element.parent;
            }
            return ancestors.reverse();
        }
        updateChangedSetting(key, value, manualReset, languageFilter, scope) {
            // ConfigurationService displays the error if this fails.
            // Force a render afterwards because onDidConfigurationUpdate doesn't fire if the update doesn't result in an effective setting value change.
            const settingsTarget = this.settingsTargetsWidget.settingsTarget;
            const resource = uri_1.URI.isUri(settingsTarget) ? settingsTarget : undefined;
            const configurationTarget = (resource ? 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ : settingsTarget) ?? 3 /* ConfigurationTarget.USER_LOCAL */;
            const overrides = { resource, overrideIdentifiers: languageFilter ? [languageFilter] : undefined };
            const configurationTargetIsWorkspace = configurationTarget === 5 /* ConfigurationTarget.WORKSPACE */ || configurationTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            const userPassedInManualReset = configurationTargetIsWorkspace || !!languageFilter;
            const isManualReset = userPassedInManualReset ? manualReset : value === undefined;
            // If the user is changing the value back to the default, and we're not targeting a workspace scope, do a 'reset' instead
            const inspected = this.configurationService.inspect(key, overrides);
            if (!userPassedInManualReset && inspected.defaultValue === value) {
                value = undefined;
            }
            return this.configurationService.updateValue(key, value, overrides, configurationTarget, { handleDirtyFile: 'save' })
                .then(() => {
                const query = this.searchWidget.getValue();
                if (query.includes(`@${preferences_1.MODIFIED_SETTING_TAG}`)) {
                    // The user might have reset a setting.
                    this.refreshTOCTree();
                }
                this.renderTree(key, isManualReset);
                const reportModifiedProps = {
                    key,
                    query,
                    searchResults: this.searchResultModel?.getUniqueResults() ?? null,
                    rawResults: this.searchResultModel?.getRawResults() ?? null,
                    showConfiguredOnly: !!this.viewState.tagFilters && this.viewState.tagFilters.has(preferences_1.MODIFIED_SETTING_TAG),
                    isReset: typeof value === 'undefined',
                    settingsTarget: this.settingsTargetsWidget.settingsTarget
                };
                this.pendingSettingUpdate = null;
                return this.reportModifiedSetting(reportModifiedProps);
            });
        }
        reportModifiedSetting(props) {
            let groupId = undefined;
            let nlpIndex = undefined;
            let displayIndex = undefined;
            if (props.searchResults) {
                displayIndex = props.searchResults.filterMatches.findIndex(m => m.setting.key === props.key);
                if (this.searchResultModel) {
                    const rawResults = this.searchResultModel.getRawResults();
                    if (rawResults[0 /* SearchResultIdx.Local */] && displayIndex >= 0) {
                        const settingInLocalResults = rawResults[0 /* SearchResultIdx.Local */].filterMatches.some(m => m.setting.key === props.key);
                        groupId = settingInLocalResults ? 'local' : 'remote';
                    }
                    if (rawResults[1 /* SearchResultIdx.Remote */]) {
                        const _nlpIndex = rawResults[1 /* SearchResultIdx.Remote */].filterMatches.findIndex(m => m.setting.key === props.key);
                        nlpIndex = _nlpIndex >= 0 ? _nlpIndex : undefined;
                    }
                }
            }
            const reportedTarget = props.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'user' :
                props.settingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'user_remote' :
                    props.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspace' :
                        'folder';
            const data = {
                key: props.key,
                groupId,
                nlpIndex,
                displayIndex,
                showConfiguredOnly: props.showConfiguredOnly,
                isReset: props.isReset,
                target: reportedTarget
            };
            this.telemetryService.publicLog2('settingsEditor.settingModified', data);
        }
        onSearchModeToggled() {
            this.rootElement.classList.remove('no-toc-search');
            if (this.configurationService.getValue('workbench.settings.settingsSearchTocBehavior') === 'hide') {
                this.rootElement.classList.toggle('no-toc-search', !!this.searchResultModel);
            }
        }
        scheduleRefresh(element, key = '') {
            if (key && this.scheduledRefreshes.has(key)) {
                return;
            }
            if (!key) {
                (0, lifecycle_1.dispose)(this.scheduledRefreshes.values());
                this.scheduledRefreshes.clear();
            }
            const scheduledRefreshTracker = DOM.trackFocus(element);
            this.scheduledRefreshes.set(key, scheduledRefreshTracker);
            scheduledRefreshTracker.onDidBlur(() => {
                scheduledRefreshTracker.dispose();
                this.scheduledRefreshes.delete(key);
                this.onConfigUpdate(new Set([key]));
            });
        }
        addOrRemoveManageExtensionSetting(setting, extension, groups) {
            const matchingGroups = groups.filter(g => {
                const lowerCaseId = g.extensionInfo?.id.toLowerCase();
                return (lowerCaseId === setting.stableExtensionId.toLowerCase() ||
                    lowerCaseId === setting.prereleaseExtensionId.toLowerCase());
            });
            const extensionId = setting.displayExtensionId;
            if (!matchingGroups.length) {
                const newGroup = {
                    sections: [{
                            settings: [setting],
                        }],
                    id: extensionId,
                    title: setting.extensionGroupTitle,
                    titleRange: preferencesModels_1.nullRange,
                    range: preferencesModels_1.nullRange,
                    extensionInfo: {
                        id: extensionId,
                        displayName: extension?.displayName,
                    }
                };
                groups.push(newGroup);
                return newGroup;
            }
            else if (matchingGroups.length >= 2) {
                // Remove the group with the manage extension setting.
                const matchingGroupIndex = matchingGroups.findIndex(group => group.sections.length === 1 && group.sections[0].settings.length === 1 && group.sections[0].settings[0].displayExtensionId);
                if (matchingGroupIndex !== -1) {
                    groups.splice(matchingGroupIndex, 1);
                }
            }
            return undefined;
        }
        refreshModels(resolvedSettingsRoot) {
            this.settingsTreeModel.update(resolvedSettingsRoot);
            this.tocTreeModel.settingsTreeRoot = this.settingsTreeModel.root;
        }
        async onConfigUpdate(keys, forceRefresh = false, schemaChange = false) {
            if (keys && this.settingsTreeModel) {
                return this.updateElementsByKey(keys);
            }
            if (!this.defaultSettingsEditorModel) {
                return;
            }
            const groups = this.defaultSettingsEditorModel.settingsGroups.slice(1); // Without commonlyUsed
            const coreSettings = groups.filter(g => !g.extensionInfo);
            const settingsResult = (0, settingsTree_1.resolveSettingsTree)(settingsLayout_1.tocData, coreSettings, this.logService);
            const resolvedSettingsRoot = settingsResult.tree;
            // Warn for settings not included in layout
            if (settingsResult.leftoverSettings.size && !this.hasWarnedMissingSettings) {
                const settingKeyList = [];
                settingsResult.leftoverSettings.forEach(s => {
                    settingKeyList.push(s.key);
                });
                this.logService.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(', ')}`);
                this.hasWarnedMissingSettings = true;
            }
            const additionalGroups = [];
            const toggleData = await (0, preferences_1.getExperimentalExtensionToggleData)(this.workbenchAssignmentService, this.environmentService, this.productService);
            if (toggleData && groups.filter(g => g.extensionInfo).length) {
                for (const key in toggleData.settingsEditorRecommendedExtensions) {
                    const extensionId = key;
                    // Recommend prerelease if not on Stable.
                    const isStable = this.productService.quality === 'stable';
                    const [extension] = await this.extensionGalleryService.getExtensions([{ id: extensionId, preRelease: !isStable }], cancellation_1.CancellationToken.None);
                    if (!extension) {
                        continue;
                    }
                    let groupTitle;
                    const manifest = await this.extensionGalleryService.getManifest(extension, cancellation_1.CancellationToken.None);
                    const contributesConfiguration = manifest?.contributes?.configuration;
                    if (!Array.isArray(contributesConfiguration)) {
                        groupTitle = contributesConfiguration?.title;
                    }
                    else if (contributesConfiguration.length === 1) {
                        groupTitle = contributesConfiguration[0].title;
                    }
                    const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
                    const settingKey = `${key}.manageExtension`;
                    const setting = {
                        range: preferencesModels_1.nullRange,
                        key: settingKey,
                        keyRange: preferencesModels_1.nullRange,
                        value: null,
                        valueRange: preferencesModels_1.nullRange,
                        description: [extension?.description || ''],
                        descriptionIsMarkdown: false,
                        descriptionRanges: [],
                        title: extensionName,
                        scope: 3 /* ConfigurationScope.WINDOW */,
                        type: 'null',
                        displayExtensionId: extensionId,
                        prereleaseExtensionId: key,
                        stableExtensionId: key,
                        extensionGroupTitle: groupTitle ?? extensionName
                    };
                    const additionalGroup = this.addOrRemoveManageExtensionSetting(setting, extension, groups);
                    if (additionalGroup) {
                        additionalGroups.push(additionalGroup);
                    }
                }
            }
            resolvedSettingsRoot.children.push(await (0, settingsTree_1.createTocTreeForExtensionSettings)(this.extensionService, groups.filter(g => g.extensionInfo)));
            const commonlyUsedDataToUse = await (0, settingsLayout_1.getCommonlyUsedData)(this.workbenchAssignmentService, this.environmentService, this.productService);
            const commonlyUsed = (0, settingsTree_1.resolveSettingsTree)(commonlyUsedDataToUse, groups, this.logService);
            resolvedSettingsRoot.children.unshift(commonlyUsed.tree);
            if (toggleData) {
                // Add the additional groups to the model to help with searching.
                this.defaultSettingsEditorModel.setAdditionalGroups(additionalGroups);
            }
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && (this.viewState.settingsTarget instanceof uri_1.URI || this.viewState.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */)) {
                const configuredUntrustedWorkspaceSettings = (0, settingsTree_1.resolveConfiguredUntrustedSettings)(groups, this.viewState.settingsTarget, this.viewState.languageFilter, this.configurationService);
                if (configuredUntrustedWorkspaceSettings.length) {
                    resolvedSettingsRoot.children.unshift({
                        id: 'workspaceTrust',
                        label: (0, nls_1.localize)('settings require trust', "Workspace Trust"),
                        settings: configuredUntrustedWorkspaceSettings
                    });
                }
            }
            this.searchResultModel?.updateChildren();
            if (this.settingsTreeModel) {
                this.refreshModels(resolvedSettingsRoot);
                if (schemaChange && !!this.searchResultModel) {
                    // If an extension's settings were just loaded and a search is active, retrigger the search so it shows up
                    return await this.onSearchInputChanged();
                }
                this.refreshTOCTree();
                this.renderTree(undefined, forceRefresh);
            }
            else {
                this.settingsTreeModel = this.instantiationService.createInstance(settingsTreeModels_1.SettingsTreeModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
                this.refreshModels(resolvedSettingsRoot);
                // Don't restore the cached state if we already have a query value from calling _setOptions().
                const cachedState = !this.viewState.query ? this.restoreCachedState() : undefined;
                if (cachedState?.searchQuery || this.searchWidget.getValue()) {
                    await this.onSearchInputChanged();
                }
                else {
                    this.refreshTOCTree();
                    this.refreshTree();
                    this.tocTree.collapseAll();
                }
            }
        }
        updateElementsByKey(keys) {
            if (keys.size) {
                if (this.searchResultModel) {
                    keys.forEach(key => this.searchResultModel.updateElementsByName(key));
                }
                if (this.settingsTreeModel) {
                    keys.forEach(key => this.settingsTreeModel.updateElementsByName(key));
                }
                // Attempt to render the tree once rather than
                // once for each key to avoid redundant calls to this.refreshTree()
                this.renderTree();
            }
            else {
                this.renderTree();
            }
        }
        getActiveControlInSettingsTree() {
            return (document.activeElement && DOM.isAncestor(document.activeElement, this.settingsTree.getHTMLElement())) ?
                document.activeElement :
                null;
        }
        renderTree(key, force = false) {
            if (!force && key && this.scheduledRefreshes.has(key)) {
                this.updateModifiedLabelForKey(key);
                return;
            }
            // If the context view is focused, delay rendering settings
            if (this.contextViewFocused()) {
                const element = document.querySelector('.context-view');
                if (element) {
                    this.scheduleRefresh(element, key);
                }
                return;
            }
            // If a setting control is currently focused, schedule a refresh for later
            const activeElement = this.getActiveControlInSettingsTree();
            const focusedSetting = activeElement && this.settingRenderers.getSettingDOMElementForDOMElement(activeElement);
            if (focusedSetting && !force) {
                // If a single setting is being refreshed, it's ok to refresh now if that is not the focused setting
                if (key) {
                    const focusedKey = focusedSetting.getAttribute(settingsTree_1.AbstractSettingRenderer.SETTING_KEY_ATTR);
                    if (focusedKey === key &&
                        // update `list`s live, as they have a separate "submit edit" step built in before this
                        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains('setting-item-list'))) {
                        this.updateModifiedLabelForKey(key);
                        this.scheduleRefresh(focusedSetting, key);
                        return;
                    }
                }
                else {
                    this.scheduleRefresh(focusedSetting);
                    return;
                }
            }
            this.renderResultCountMessages();
            if (key) {
                const elements = this.currentSettingsModel.getElementsByName(key);
                if (elements && elements.length) {
                    // TODO https://github.com/microsoft/vscode/issues/57360
                    this.refreshTree();
                }
                else {
                    // Refresh requested for a key that we don't know about
                    return;
                }
            }
            else {
                this.refreshTree();
            }
            return;
        }
        contextViewFocused() {
            return !!DOM.findParentWithClass(document.activeElement, 'context-view');
        }
        refreshTree() {
            if (this.isVisible()) {
                this.settingsTree.setChildren(null, createGroupIterator(this.currentSettingsModel.root));
            }
        }
        refreshTOCTree() {
            if (this.isVisible()) {
                this.tocTreeModel.update();
                this.tocTree.setChildren(null, (0, tocTree_1.createTOCIterator)(this.tocTreeModel, this.tocTree));
            }
        }
        updateModifiedLabelForKey(key) {
            const dataElements = this.currentSettingsModel.getElementsByName(key);
            const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured; // all elements are either configured or not
            const elements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), key);
            if (elements && elements[0]) {
                elements[0].classList.toggle('is-configured', !!isModified);
            }
        }
        async onSearchInputChanged() {
            if (!this.currentSettingsModel) {
                // Initializing search widget value
                return;
            }
            const query = this.searchWidget.getValue().trim();
            this.viewState.query = query;
            this.delayedFilterLogging.cancel();
            await this.triggerSearch(query.replace(/\u203A/g, ' '));
            if (query && this.searchResultModel) {
                this.delayedFilterLogging.trigger(() => this.reportFilteringUsed(this.searchResultModel));
            }
        }
        parseSettingFromJSON(query) {
            const match = query.match(/"([a-zA-Z.]+)": /);
            return match && match[1];
        }
        triggerSearch(query) {
            this.viewState.tagFilters = new Set();
            this.viewState.extensionFilters = new Set();
            this.viewState.featureFilters = new Set();
            this.viewState.idFilters = new Set();
            this.viewState.languageFilter = undefined;
            if (query) {
                const parsedQuery = (0, settingsTreeModels_1.parseQuery)(query);
                query = parsedQuery.query;
                parsedQuery.tags.forEach(tag => this.viewState.tagFilters.add(tag));
                parsedQuery.extensionFilters.forEach(extensionId => this.viewState.extensionFilters.add(extensionId));
                parsedQuery.featureFilters.forEach(feature => this.viewState.featureFilters.add(feature));
                parsedQuery.idFilters.forEach(id => this.viewState.idFilters.add(id));
                this.viewState.languageFilter = parsedQuery.languageFilter;
            }
            this.settingsTargetsWidget.updateLanguageFilterIndicators(this.viewState.languageFilter);
            if (query && query !== '@') {
                query = this.parseSettingFromJSON(query) || query;
                return this.triggerFilterPreferences(query);
            }
            else {
                if (this.viewState.tagFilters.size || this.viewState.extensionFilters.size || this.viewState.featureFilters.size || this.viewState.idFilters.size || this.viewState.languageFilter) {
                    this.searchResultModel = this.createFilterModel();
                }
                else {
                    this.searchResultModel = null;
                }
                this.localSearchDelayer.cancel();
                this.remoteSearchThrottle.cancel();
                if (this.searchInProgress) {
                    this.searchInProgress.cancel();
                    this.searchInProgress.dispose();
                    this.searchInProgress = null;
                }
                this.tocTree.setFocus([]);
                this.viewState.filterToCategory = undefined;
                this.tocTreeModel.currentSearchModel = this.searchResultModel;
                this.onSearchModeToggled();
                if (this.searchResultModel) {
                    // Added a filter model
                    this.tocTree.setSelection([]);
                    this.tocTree.expandAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                }
                else {
                    // Leaving search mode
                    this.tocTree.collapseAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                }
            }
            return Promise.resolve();
        }
        /**
         * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
         */
        createFilterModel() {
            const filterModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
            const fullResult = {
                filterMatches: []
            };
            for (const g of this.defaultSettingsEditorModel.settingsGroups.slice(1)) {
                for (const sect of g.sections) {
                    for (const setting of sect.settings) {
                        fullResult.filterMatches.push({ setting, matches: [], matchType: preferences_2.SettingMatchType.None, score: 0 });
                    }
                }
            }
            filterModel.setResult(0, fullResult);
            return filterModel;
        }
        reportFilteringUsed(searchResultModel) {
            if (!searchResultModel) {
                return;
            }
            // Count unique results
            const counts = {};
            const rawResults = searchResultModel.getRawResults();
            const filterResult = rawResults[0 /* SearchResultIdx.Local */];
            if (filterResult) {
                counts['filterResult'] = filterResult.filterMatches.length;
            }
            const nlpResult = rawResults[1 /* SearchResultIdx.Remote */];
            if (nlpResult) {
                counts['nlpResult'] = nlpResult.filterMatches.length;
            }
            const uniqueResults = searchResultModel.getUniqueResults();
            const data = {
                'counts.nlpResult': counts['nlpResult'],
                'counts.filterResult': counts['filterResult'],
                'counts.uniqueResultsCount': uniqueResults?.filterMatches.length
            };
            this.telemetryService.publicLog2('settingsEditor.filter', data);
        }
        triggerFilterPreferences(query) {
            if (this.searchInProgress) {
                this.searchInProgress.cancel();
                this.searchInProgress = null;
            }
            // Trigger the local search. If it didn't find an exact match, trigger the remote search.
            const searchInProgress = this.searchInProgress = new cancellation_1.CancellationTokenSource();
            return this.localSearchDelayer.trigger(async () => {
                if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                    const progressRunner = this.editorProgressService.show(true);
                    const result = await this.localFilterPreferences(query);
                    if (result && !result.exactMatch) {
                        this.remoteSearchThrottle.trigger(async () => {
                            if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                                await this.remoteSearchPreferences(query, this.searchInProgress.token);
                            }
                            progressRunner.done();
                        });
                    }
                    else {
                        progressRunner.done();
                    }
                }
            });
        }
        localFilterPreferences(query, token) {
            const localSearchProvider = this.preferencesSearchService.getLocalSearchProvider(query);
            return this.filterOrSearchPreferences(query, 0 /* SearchResultIdx.Local */, localSearchProvider, token);
        }
        remoteSearchPreferences(query, token) {
            const remoteSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query);
            const newExtSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query, true);
            return Promise.all([
                this.filterOrSearchPreferences(query, 1 /* SearchResultIdx.Remote */, remoteSearchProvider, token),
                this.filterOrSearchPreferences(query, 2 /* SearchResultIdx.NewExtensions */, newExtSearchProvider, token)
            ]).then(() => { });
        }
        async filterOrSearchPreferences(query, type, searchProvider, token) {
            const result = await this._filterOrSearchPreferencesModel(query, this.defaultSettingsEditorModel, searchProvider, token);
            if (token?.isCancellationRequested) {
                // Handle cancellation like this because cancellation is lost inside the search provider due to async/await
                return null;
            }
            if (!this.searchResultModel) {
                this.searchResultModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
                // Must be called before this.renderTree()
                // to make sure the search results count is set.
                this.searchResultModel.setResult(type, result);
                this.tocTreeModel.currentSearchModel = this.searchResultModel;
                this.onSearchModeToggled();
            }
            else {
                this.searchResultModel.setResult(type, result);
                this.tocTreeModel.update();
            }
            if (type === 0 /* SearchResultIdx.Local */) {
                this.tocTree.setFocus([]);
                this.viewState.filterToCategory = undefined;
                this.tocTree.expandAll();
            }
            this.settingsTree.scrollTop = 0;
            this.refreshTOCTree();
            this.renderTree(undefined, true);
            return result;
        }
        renderResultCountMessages() {
            if (!this.currentSettingsModel) {
                return;
            }
            this.clearFilterLinkContainer.style.display = this.viewState.tagFilters && this.viewState.tagFilters.size > 0
                ? 'initial'
                : 'none';
            if (!this.searchResultModel) {
                if (this.countElement.style.display !== 'none') {
                    this.searchResultLabel = null;
                    this.updateInputAriaLabel();
                    this.countElement.style.display = 'none';
                    this.countElement.innerText = '';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.remove('no-results');
                this.splitView.el.style.visibility = 'visible';
                return;
            }
            else {
                const count = this.searchResultModel.getUniqueResultsCount();
                let resultString;
                switch (count) {
                    case 0:
                        resultString = (0, nls_1.localize)('noResults', "No Settings Found");
                        break;
                    case 1:
                        resultString = (0, nls_1.localize)('oneResult', "1 Setting Found");
                        break;
                    default: resultString = (0, nls_1.localize)('moreThanOneResult', "{0} Settings Found", count);
                }
                this.searchResultLabel = resultString;
                this.updateInputAriaLabel();
                this.countElement.innerText = resultString;
                aria.status(resultString);
                if (this.countElement.style.display !== 'block') {
                    this.countElement.style.display = 'block';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.toggle('no-results', count === 0);
                this.splitView.el.style.visibility = count === 0 ? 'hidden' : 'visible';
            }
        }
        _filterOrSearchPreferencesModel(filter, model, provider, token) {
            const searchP = provider ? provider.searchModel(model, token) : Promise.resolve(null);
            return searchP
                .then(undefined, err => {
                if ((0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                else {
                    // type SettingsSearchErrorEvent = {
                    // 	'message': string;
                    // };
                    // type SettingsSearchErrorClassification = {
                    // 	owner: 'rzhao271';
                    // 	comment: 'Helps understand when settings search errors out';
                    // 	'message': { 'classification': 'CallstackOrException'; 'purpose': 'FeatureInsight'; 'owner': 'rzhao271'; 'comment': 'The error message of the search error.' };
                    // };
                    // const message = getErrorMessage(err).trim();
                    // if (message && message !== 'Error') {
                    // 	// "Error" = any generic network error
                    // 	this.telemetryService.publicLogError2<SettingsSearchErrorEvent, SettingsSearchErrorClassification>('settingsEditor.searchError', { message });
                    // 	this.logService.info('Setting search error: ' + message);
                    // }
                    return null;
                }
            });
        }
        layoutSplitView(dimension) {
            const listHeight = dimension.height - (72 + 11 + 14 /* header height + editor padding */);
            this.splitView.el.style.height = `${listHeight}px`;
            // We call layout first so the splitView has an idea of how much
            // space it has, otherwise setViewVisible results in the first panel
            // showing up at the minimum size whenever the Settings editor
            // opens for the first time.
            this.splitView.layout(this.bodyContainer.clientWidth, listHeight);
            const firstViewWasVisible = this.splitView.isViewVisible(0);
            const firstViewVisible = this.bodyContainer.clientWidth >= SettingsEditor2_1.NARROW_TOTAL_WIDTH;
            this.splitView.setViewVisible(0, firstViewVisible);
            // If the first view is again visible, and we have enough space, immediately set the
            // editor to use the reset width rather than the cached min width
            if (!firstViewWasVisible && firstViewVisible && this.bodyContainer.clientWidth >= SettingsEditor2_1.EDITOR_MIN_WIDTH + SettingsEditor2_1.TOC_RESET_WIDTH) {
                this.splitView.resizeView(0, SettingsEditor2_1.TOC_RESET_WIDTH);
            }
            this.splitView.style({
                separatorBorder: firstViewVisible ? this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder) : color_1.Color.transparent
            });
        }
        saveState() {
            if (this.isVisible()) {
                const searchQuery = this.searchWidget.getValue().trim();
                const target = this.settingsTargetsWidget.settingsTarget;
                if (this.group && this.input) {
                    this.editorMemento.saveEditorState(this.group, this.input, { searchQuery, target });
                }
            }
            else if (this.group && this.input) {
                this.editorMemento.clearEditorState(this.input, this.group);
            }
            super.saveState();
        }
    };
    exports.SettingsEditor2 = SettingsEditor2;
    exports.SettingsEditor2 = SettingsEditor2 = SettingsEditor2_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, configuration_1.IWorkbenchConfigurationService),
        __param(2, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(3, themeService_1.IThemeService),
        __param(4, preferences_2.IPreferencesService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, preferences_1.IPreferencesSearchService),
        __param(7, log_1.ILogService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, storage_1.IStorageService),
        __param(10, editorGroupsService_1.IEditorGroupsService),
        __param(11, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(12, userDataSync_1.IUserDataSyncEnablementService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, extensions_1.IExtensionService),
        __param(15, language_1.ILanguageService),
        __param(16, extensionManagement_1.IExtensionManagementService),
        __param(17, assignmentService_1.IWorkbenchAssignmentService),
        __param(18, productService_1.IProductService),
        __param(19, environment_1.IEnvironmentService),
        __param(20, extensionManagement_1.IExtensionGalleryService),
        __param(21, progress_1.IEditorProgressService)
    ], SettingsEditor2);
    let SyncControls = class SyncControls extends lifecycle_1.Disposable {
        constructor(container, commandService, userDataSyncService, userDataSyncEnablementService, telemetryService) {
            super();
            this.commandService = commandService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._onDidChangeLastSyncedLabel = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncedLabel = this._onDidChangeLastSyncedLabel.event;
            const headerRightControlsContainer = DOM.append(container, $('.settings-right-controls'));
            const turnOnSyncButtonContainer = DOM.append(headerRightControlsContainer, $('.turn-on-sync'));
            this.turnOnSyncButton = this._register(new button_1.Button(turnOnSyncButtonContainer, { title: true, ...defaultStyles_1.defaultButtonStyles }));
            this.lastSyncedLabel = DOM.append(headerRightControlsContainer, $('.last-synced-label'));
            DOM.hide(this.lastSyncedLabel);
            this.turnOnSyncButton.enabled = true;
            this.turnOnSyncButton.label = (0, nls_1.localize)('turnOnSyncButton', "Backup and Sync Settings");
            DOM.hide(this.turnOnSyncButton.element);
            this._register(this.turnOnSyncButton.onDidClick(async () => {
                telemetryService.publicLog2('sync/turnOnSyncFromSettings');
                await this.commandService.executeCommand('workbench.userDataSync.actions.turnOn');
            }));
            this.updateLastSyncedTime();
            this._register(this.userDataSyncService.onDidChangeLastSyncTime(() => {
                this.updateLastSyncedTime();
            }));
            const updateLastSyncedTimer = this._register(new async_1.IntervalTimer());
            updateLastSyncedTimer.cancelAndSet(() => this.updateLastSyncedTime(), 60 * 1000);
            this.update();
            this._register(this.userDataSyncService.onDidChangeStatus(() => {
                this.update();
            }));
            this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
                this.update();
            }));
        }
        updateLastSyncedTime() {
            const last = this.userDataSyncService.lastSyncTime;
            let label;
            if (typeof last === 'number') {
                const d = (0, date_1.fromNow)(last, true, undefined, true);
                label = (0, nls_1.localize)('lastSyncedLabel', "Last synced: {0}", d);
            }
            else {
                label = '';
            }
            this.lastSyncedLabel.textContent = label;
            this._onDidChangeLastSyncedLabel.fire(label);
        }
        update() {
            if (this.userDataSyncService.status === "uninitialized" /* SyncStatus.Uninitialized */) {
                return;
            }
            if (this.userDataSyncEnablementService.isEnabled() || this.userDataSyncService.status !== "idle" /* SyncStatus.Idle */) {
                DOM.show(this.lastSyncedLabel);
                DOM.hide(this.turnOnSyncButton.element);
            }
            else {
                DOM.hide(this.lastSyncedLabel);
                DOM.show(this.turnOnSyncButton.element);
            }
        }
    };
    SyncControls = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, userDataSync_1.IUserDataSyncService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService),
        __param(4, telemetry_1.ITelemetryService)
    ], SyncControls);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NFZGl0b3IyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9zZXR0aW5nc0VkaXRvcjIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9FaEcsSUFBa0Isb0JBS2pCO0lBTEQsV0FBa0Isb0JBQW9CO1FBQ3JDLG1FQUFNLENBQUE7UUFDTixxRkFBZSxDQUFBO1FBQ2YsNkVBQVcsQ0FBQTtRQUNYLG1GQUFjLENBQUE7SUFDZixDQUFDLEVBTGlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBS3JDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsS0FBK0I7UUFDbEUsT0FBTyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU87Z0JBQ04sT0FBTyxFQUFFLENBQUM7Z0JBQ1YsUUFBUSxFQUFFLENBQUMsWUFBWSw2Q0FBd0IsQ0FBQyxDQUFDO29CQUNoRCxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QixTQUFTO2FBQ1YsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVRELGtEQVNDO0lBRUQsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQU1oQixNQUFNLGNBQWMsR0FBRyxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBRS9FLE1BQU0seUJBQXlCLEdBQUcscUJBQXFCLENBQUM7SUFDakQsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSx1QkFBVTs7aUJBRTlCLE9BQUUsR0FBVyw0QkFBNEIsQUFBdkMsQ0FBd0M7aUJBQzNDLGtCQUFhLEdBQVcsQ0FBQyxBQUFaLENBQWE7aUJBQzFCLG9CQUFlLEdB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