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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/tocTree", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/extensions/common/extensions", "vs/base/browser/ui/splitview/splitview", "vs/base/common/color", "vs/editor/common/languages/language", "vs/workbench/contrib/preferences/browser/settingsSearchMenu", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles", "vs/workbench/services/assignment/common/assignmentService", "vs/platform/product/common/productService", "vs/platform/environment/common/environment", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/progress/common/progress", "vs/css!./media/settingsEditor2"], function (require, exports, DOM, aria, keyboardEvent_1, actionbar_1, button_1, actions_1, async_1, cancellation_1, date_1, errors_1, event_1, iterator_1, lifecycle_1, platform, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, userDataSync_1, editorPane_1, suggestEnabledInput_1, preferencesWidgets_1, settingsLayout_1, settingsTree_1, settingsTreeModels_1, tocTree_1, preferences_1, settingsEditorColorRegistry_1, editorGroupsService_1, preferences_2, preferencesModels_1, userDataSync_2, preferencesIcons_1, workspaceTrust_1, configuration_1, textResourceConfiguration_1, extensions_1, splitview_1, color_1, language_1, settingsSearchMenu_1, extensionManagement_1, configurationRegistry_1, platform_1, defaultStyles_1, assignmentService_1, productService_1, environment_1, widgetNavigationCommands_1, progress_1) {
    "use strict";
    var $8Db_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Db = exports.$7Db = exports.SettingsFocusContext = void 0;
    var SettingsFocusContext;
    (function (SettingsFocusContext) {
        SettingsFocusContext[SettingsFocusContext["Search"] = 0] = "Search";
        SettingsFocusContext[SettingsFocusContext["TableOfContents"] = 1] = "TableOfContents";
        SettingsFocusContext[SettingsFocusContext["SettingTree"] = 2] = "SettingTree";
        SettingsFocusContext[SettingsFocusContext["SettingControl"] = 3] = "SettingControl";
    })(SettingsFocusContext || (exports.SettingsFocusContext = SettingsFocusContext = {}));
    function $7Db(group) {
        return iterator_1.Iterable.map(group.children, g => {
            return {
                element: g,
                children: g instanceof settingsTreeModels_1.$sDb ?
                    $7Db(g) :
                    undefined
            };
        });
    }
    exports.$7Db = $7Db;
    const $ = DOM.$;
    const searchBoxLabel = (0, nls_1.localize)(0, null);
    const SETTINGS_EDITOR_STATE_KEY = 'settingsEditorState';
    let $8Db = class $8Db extends editorPane_1.$0T {
        static { $8Db_1 = this; }
        static { this.ID = 'workbench.editor.settings2'; }
        static { this.a = 0; }
        static { this.b = 200; }
        static { this.c = 200; }
        static { this.f = 1000; }
        static { this.j = 500; }
        static { this.r = 100; }
        static { this.u = 200; }
        static { this.y = 500; }
        // Below NARROW_TOTAL_WIDTH, we only render the editor rather than the ToC.
        static { this.eb = $8Db_1.u + $8Db_1.y; }
        static { this.fb = [
            `@${preferences_1.$ICb}`,
            '@tag:notebookLayout',
            '@tag:notebookOutputLayout',
            `@tag:${preferences_1.$QCb}`,
            `@tag:${preferences_1.$PCb}`,
            '@tag:sync',
            '@tag:usesOnlineServices',
            '@tag:telemetry',
            '@tag:accessibility',
            `@${preferences_1.$LCb}`,
            `@${preferences_1.$JCb}`,
            `@${preferences_1.$KCb}scm`,
            `@${preferences_1.$KCb}explorer`,
            `@${preferences_1.$KCb}search`,
            `@${preferences_1.$KCb}debug`,
            `@${preferences_1.$KCb}extensions`,
            `@${preferences_1.$KCb}terminal`,
            `@${preferences_1.$KCb}task`,
            `@${preferences_1.$KCb}problems`,
            `@${preferences_1.$KCb}output`,
            `@${preferences_1.$KCb}comments`,
            `@${preferences_1.$KCb}remote`,
            `@${preferences_1.$KCb}timeline`,
            `@${preferences_1.$KCb}notebook`,
            `@${preferences_1.$OCb}`
        ]; }
        static gb(type) {
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
        constructor(telemetryService, $b, textResourceConfigurationService, themeService, ac, bc, cc, dc, contextKeyService, ec, fc, gc, hc, ic, jc, kc, extensionManagementService, lc, mc, nc, oc, pc) {
            super($8Db_1.ID, telemetryService, themeService, ec);
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.dc = dc;
            this.ec = ec;
            this.fc = fc;
            this.gc = gc;
            this.hc = hc;
            this.ic = ic;
            this.jc = jc;
            this.kc = kc;
            this.lc = lc;
            this.mc = mc;
            this.nc = nc;
            this.oc = oc;
            this.pc = pc;
            this.Db = null;
            this.Ib = null;
            this.Kb = null;
            this.Lb = null;
            this.Mb = null;
            this.Sb = 0 /* SettingsFocusContext.Search */;
            /** Don't spam warnings */
            this.Tb = false;
            this.Vb = null;
            this.Wb = null;
            this.Xb = 0;
            this.Zb = [];
            this.Ab = new async_1.$Dg(1000);
            this.Bb = new async_1.$Dg(300);
            this.Cb = new async_1.$Eg(200);
            this.Jb = { settingsTarget: 3 /* ConfigurationTarget.USER_LOCAL */ };
            this.Gb = new async_1.$Dg($8Db_1.c);
            this.Hb = new async_1.$Dg($8Db_1.f);
            this.Eb = new async_1.$Dg($8Db_1.b);
            this.Fb = new async_1.$Dg($8Db_1.j);
            this.Pb = preferences_1.$fCb.bindTo(contextKeyService);
            this.Qb = preferences_1.$hCb.bindTo(contextKeyService);
            this.Nb = preferences_1.$iCb.bindTo(contextKeyService);
            this.Ob = preferences_1.$jCb.bindTo(contextKeyService);
            this.Rb = new Map();
            this.Ub = this.cb(fc, textResourceConfigurationService, SETTINGS_EDITOR_STATE_KEY);
            this.B($b.onDidChangeConfiguration(e => {
                if (e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                    this.Rc(e.affectedKeys);
                }
            }));
            this.B(ic.onDidChangeTrust(() => {
                this.rc?.updateWorkspaceTrust(ic.isWorkspaceTrusted());
                if (this.vb) {
                    this.vb.updateWorkspaceTrust(ic.isWorkspaceTrusted());
                    this.Uc();
                }
            }));
            this.B($b.onDidChangeRestrictedSettings(e => {
                if (e.default.length && this.qc) {
                    this.Sc(new Set(e.default));
                }
            }));
            this.ib = this.B(new lifecycle_1.$jc());
            if (preferences_1.$SCb && !$8Db_1.fb.includes(`@${preferences_1.$MCb}`)) {
                $8Db_1.fb.push(`@${preferences_1.$MCb}`);
            }
            extensionManagementService.getInstalled().then(extensions => {
                this.Zb = extensions
                    .filter(ext => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration)
                    .map(ext => ext.identifier.id);
            });
        }
        get minimumWidth() { return $8Db_1.y; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        get minimumHeight() { return 180; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        get qc() {
            return this.rc || this.vb;
        }
        get rc() {
            return this.Kb;
        }
        set rc(value) {
            this.Kb = value;
            this.jb.classList.toggle('search-mode', !!this.Kb);
        }
        get sc() {
            const focused = this.sb.getFocus()[0];
            if (!(focused instanceof settingsTreeModels_1.$uDb)) {
                return;
            }
            return this.tb.getDOMElementsForSettingKey(this.sb.getHTMLElement(), focused.setting.key)[0];
        }
        get currentFocusContext() {
            return this.Sb;
        }
        ab(parent) {
            parent.setAttribute('tabindex', '-1');
            this.jb = DOM.$0O(parent, $('.settings-editor', { tabindex: '-1' }));
            this.yc(this.jb);
            this.Cc(this.jb);
            this.Dc(this.jb);
            this.updateStyles();
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.mb.inputWidget.hasWidgetFocus()) {
                        this.focusTOC();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.mb.inputWidget.hasWidgetFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        async setInput(input, options, context, token) {
            this.Pb.set(true);
            await super.setInput(input, options, context, token);
            await (0, async_1.$Hg)(0); // Force setInput to be async
            if (!this.input) {
                return;
            }
            const model = await this.input.resolve(options);
            if (token.isCancellationRequested || !(model instanceof preferencesModels_1.$tE)) {
                return;
            }
            this.ib.clear();
            this.ib.add(model.onDidChangeGroups(() => {
                this.Fb.trigger(() => {
                    this.Rc(undefined, false, true);
                });
            }));
            this.hb = model;
            options = options || (0, preferences_2.$AE)({});
            if (!this.Jb.settingsTarget || !this.pb.settingsTarget) {
                const optionsHasViewStateTarget = options.viewState && options.viewState.settingsTarget;
                if (!options.target && !optionsHasViewStateTarget) {
                    options.target = 3 /* ConfigurationTarget.USER_LOCAL */;
                }
            }
            this.vc(options);
            // Don't block setInput on render (which can trigger an async search)
            this.Rc(undefined, true).then(() => {
                this.B(input.onWillDispose(() => {
                    this.mb.setValue('');
                }));
                // Init TOC selection
                this.Jc();
            });
        }
        uc() {
            const cachedState = this.group && this.input && this.Ub.loadEditorState(this.group, this.input);
            if (cachedState && typeof cachedState.target === 'object') {
                cachedState.target = uri_1.URI.revive(cachedState.target);
            }
            if (cachedState) {
                const settingsTarget = cachedState.target;
                this.pb.settingsTarget = settingsTarget;
                this.Jb.settingsTarget = settingsTarget;
                this.mb.setValue(cachedState.searchQuery);
            }
            if (this.input) {
                this.Ub.clearEditorState(this.input, this.group);
            }
            return cachedState ?? null;
        }
        getViewState() {
            return this.Jb;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                this.vc(options);
            }
        }
        vc(options) {
            if (options.focusSearch && !platform.$q) {
                // isIOS - #122044
                this.focusSearch();
            }
            const recoveredViewState = options.viewState ?
                options.viewState : undefined;
            const query = recoveredViewState?.query ?? options.query;
            if (query !== undefined) {
                this.mb.setValue(query);
                this.Jb.query = query;
            }
            const target = options.folderUri ?? recoveredViewState?.settingsTarget ?? options.target;
            if (target) {
                this.pb.settingsTarget = target;
                this.Jb.settingsTarget = target;
            }
        }
        clearInput() {
            this.Pb.set(false);
            super.clearInput();
        }
        layout(dimension) {
            this.Yb = dimension;
            if (!this.isVisible()) {
                return;
            }
            this.kd(dimension);
            const innerWidth = Math.min(this.kb.clientWidth, dimension.width) - 24 * 2; // 24px padding on left and right;
            // minus padding inside inputbox, countElement width, controls width, extra padding before countElement
            const monacoWidth = innerWidth - 10 - this.nb.clientWidth - this.ob.clientWidth - 12;
            this.mb.layout(new DOM.$BO(monacoWidth, 20));
            this.jb.classList.toggle('narrow-width', dimension.width < $8Db_1.eb);
        }
        focus() {
            if (this.Sb === 0 /* SettingsFocusContext.Search */) {
                if (!platform.$q) {
                    // #122044
                    this.focusSearch();
                }
            }
            else if (this.Sb === 3 /* SettingsFocusContext.SettingControl */) {
                const element = this.sc;
                if (element) {
                    const control = element.querySelector(settingsTree_1.$NDb.CONTROL_SELECTOR);
                    if (control) {
                        control.focus();
                        return;
                    }
                }
            }
            else if (this.Sb === 2 /* SettingsFocusContext.SettingTree */) {
                this.sb.domFocus();
            }
            else if (this.Sb === 1 /* SettingsFocusContext.TableOfContents */) {
                this.zb.domFocus();
            }
        }
        bb(visible, group) {
            super.bb(visible, group);
            if (!visible) {
                // Wait for editor to be removed from DOM #106303
                setTimeout(() => {
                    this.mb.onHide();
                }, 0);
            }
        }
        focusSettings(focusSettingInput = false) {
            const focused = this.sb.getFocus();
            if (!focused.length) {
                this.sb.focusFirst();
            }
            this.sb.domFocus();
            if (focusSettingInput) {
                const controlInFocusedRow = this.sb.getHTMLElement().querySelector(`.focused ${settingsTree_1.$NDb.CONTROL_SELECTOR}`);
                if (controlInFocusedRow) {
                    controlInFocusedRow.focus();
                }
            }
        }
        focusTOC() {
            this.zb.domFocus();
        }
        showContextMenu() {
            const focused = this.sb.getFocus()[0];
            const rowElement = this.sc;
            if (rowElement && focused instanceof settingsTreeModels_1.$uDb) {
                this.tb.showContextMenu(focused, rowElement);
            }
        }
        focusSearch(filter, selectAll = true) {
            if (filter && this.mb) {
                this.mb.setValue(filter);
            }
            this.mb.focus(selectAll);
        }
        clearSearchResults() {
            this.mb.setValue('');
            this.focusSearch();
        }
        clearSearchFilters() {
            const query = this.mb.getValue();
            const splitQuery = query.split(' ').filter(word => {
                return word.length && !$8Db_1.fb.some(suggestion => word.startsWith(suggestion));
            });
            this.mb.setValue(splitQuery.join(' '));
        }
        xc() {
            let label = searchBoxLabel;
            if (this.Lb) {
                label += `. ${this.Lb}`;
            }
            if (this.Mb) {
                label += `. ${this.Mb}`;
            }
            this.mb.updateAriaLabel(label);
        }
        /**
         * Render the header of the Settings editor, which includes the content above the splitview.
         */
        yc(parent) {
            this.kb = DOM.$0O(parent, $('.settings-header'));
            const searchContainer = DOM.$0O(this.kb, $('.search-container'));
            const clearInputAction = new actions_1.$gi(preferences_1.$cCb, (0, nls_1.localize)(1, null), themables_1.ThemeIcon.asClassName(preferencesIcons_1.$4Bb), false, async () => this.clearSearchResults());
            const filterAction = new actions_1.$gi(preferences_1.$eCb, (0, nls_1.localize)(2, null), themables_1.ThemeIcon.asClassName(preferencesIcons_1.$5Bb));
            this.mb = this.B(this.bc.createInstance(suggestEnabledInput_1.$VCb, `${$8Db_1.ID}.searchbox`, searchContainer, {
                triggerCharacters: ['@', ':'],
                provideResults: (query) => {
                    // Based on testing, the trigger character is always at the end of the query.
                    // for the ':' trigger, only return suggestions if there was a '@' before it in the same word.
                    const queryParts = query.split(/\s/g);
                    if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.$MCb}`)) {
                        const sortedLanguages = this.kc.getRegisteredLanguageIds().map(languageId => {
                            return `@${preferences_1.$MCb}${languageId} `;
                        }).sort();
                        return sortedLanguages.filter(langFilter => !query.includes(langFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.$JCb}`)) {
                        const installedExtensionsTags = this.Zb.map(extensionId => {
                            return `@${preferences_1.$JCb}${extensionId} `;
                        }).sort();
                        return installedExtensionsTags.filter(extFilter => !query.includes(extFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith('@')) {
                        return $8Db_1.fb.filter(tag => !query.includes(tag)).map(tag => tag.endsWith(':') ? tag : tag + ' ');
                    }
                    return [];
                }
            }, searchBoxLabel, 'settingseditor:searchinput' + $8Db_1.a++, {
                placeholderText: searchBoxLabel,
                focusContextKey: this.Qb,
                styleOverrides: {
                    inputBorder: settingsEditorColorRegistry_1.$aDb
                }
                // TODO: Aria-live
            }));
            this.B(this.mb.onDidFocus(() => {
                this.Sb = 0 /* SettingsFocusContext.Search */;
            }));
            this.nb = DOM.$0O(searchContainer, DOM.$('.settings-count-widget.monaco-count-badge.long'));
            this.nb.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$dw);
            this.nb.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$ew);
            this.nb.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            this.B(this.mb.onInputDidChange(() => {
                const searchVal = this.mb.getValue();
                clearInputAction.enabled = !!searchVal;
                this.Eb.trigger(() => this.Zc());
            }));
            const headerControlsContainer = DOM.$0O(this.kb, $('.settings-header-controls'));
            headerControlsContainer.style.borderColor = (0, colorRegistry_1.$pv)(settingsEditorColorRegistry_1.$2Cb);
            const targetWidgetContainer = DOM.$0O(headerControlsContainer, $('.settings-target-container'));
            this.pb = this.B(this.bc.createInstance(preferencesWidgets_1.$8Bb, targetWidgetContainer, { enableRemoteSettings: true }));
            this.pb.settingsTarget = 3 /* ConfigurationTarget.USER_LOCAL */;
            this.pb.onDidTargetChange(target => this.zc(target));
            this.B(DOM.$nO(targetWidgetContainer, DOM.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    this.focusSettings();
                }
            }));
            if (this.gc.enabled && this.hc.canToggleEnablement()) {
                const syncControls = this.B(this.bc.createInstance(SyncControls, headerControlsContainer));
                this.B(syncControls.onDidChangeLastSyncedLabel(lastSyncedLabel => {
                    this.Mb = lastSyncedLabel;
                    this.xc();
                }));
            }
            this.ob = DOM.$0O(searchContainer, DOM.$('.settings-clear-widget'));
            const actionBar = this.B(new actionbar_1.$1P(this.ob, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action.id === filterAction.id) {
                        return this.bc.createInstance(settingsSearchMenu_1.$6Db, action, this.N, this.mb);
                    }
                    return undefined;
                }
            }));
            actionBar.push([clearInputAction, filterAction], { label: false, icon: true });
        }
        zc(target) {
            this.Jb.settingsTarget = target;
            // TODO Instead of rebuilding the whole model, refresh and uncache the inspected setting value
            this.Rc(undefined, true);
        }
        Ac(evt, recursed) {
            const targetElement = this.qc.getElementsByName(evt.targetKey)?.[0];
            let revealFailed = false;
            if (targetElement) {
                let sourceTop = 0.5;
                try {
                    const _sourceTop = this.sb.getRelativeTop(evt.source);
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
                if (this.Jb.filterToCategory && evt.source.displayCategory !== targetElement.displayCategory) {
                    this.zb.setFocus([]);
                }
                try {
                    this.sb.reveal(targetElement, sourceTop);
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
                        this.sb.setFocus([targetElement]);
                    }, 50);
                    const domElements = this.tb.getDOMElementsForSettingKey(this.sb.getHTMLElement(), evt.targetKey);
                    if (domElements && domElements[0]) {
                        const control = domElements[0].querySelector(settingsTree_1.$NDb.CONTROL_SELECTOR);
                        if (control) {
                            control.focus();
                        }
                    }
                }
            }
            if (!recursed && (!targetElement || revealFailed)) {
                // We'll call this event handler again after clearing the search query,
                // so that more settings show up in the list.
                const p = this.ad('');
                p.then(() => {
                    this.mb.setValue('');
                    this.Ac(evt, true);
                });
            }
        }
        switchToSettingsFile() {
            const query = (0, settingsTreeModels_1.$zDb)(this.mb.getValue()).query;
            return this.Bc({ query });
        }
        async Bc(options) {
            const currentSettingsTarget = this.pb.settingsTarget;
            const openOptions = { jsonEditor: true, ...options };
            if (currentSettingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (options?.revealSetting) {
                    const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
                    const configurationScope = configurationProperties[options?.revealSetting.key]?.scope;
                    if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                        return this.ac.openApplicationSettings(openOptions);
                    }
                }
                return this.ac.openUserSettings(openOptions);
            }
            else if (currentSettingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return this.ac.openRemoteSettings(openOptions);
            }
            else if (currentSettingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return this.ac.openWorkspaceSettings(openOptions);
            }
            else if (uri_1.URI.isUri(currentSettingsTarget)) {
                return this.ac.openFolderSettings({ folderUri: currentSettingsTarget, ...openOptions });
            }
            return undefined;
        }
        Cc(parent) {
            this.lb = DOM.$0O(parent, $('.settings-body'));
            this.wb = DOM.$0O(this.lb, $('.no-results-message'));
            this.wb.innerText = (0, nls_1.localize)(3, null);
            this.xb = $('span.clear-search-filters');
            this.xb.textContent = ' - ';
            const clearFilterLink = DOM.$0O(this.xb, $('a.pointer.prominent', { tabindex: 0 }, (0, nls_1.localize)(4, null)));
            this.B(DOM.$nO(clearFilterLink, DOM.$3O.CLICK, (e) => {
                DOM.$5O.stop(e, false);
                this.clearSearchFilters();
            }));
            DOM.$0O(this.wb, this.xb);
            this.wb.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$xw);
            this.yb = $('.settings-toc-container');
            this.rb = $('.settings-tree-container');
            this.Ec(this.yb);
            this.Hc(this.rb);
            this.qb = new splitview_1.$bR(this.lb, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                proportionalLayout: true
            });
            const startingWidth = this.ec.getNumber('settingsEditor2.splitViewWidth', 0 /* StorageScope.PROFILE */, $8Db_1.u);
            this.qb.addView({
                onDidChange: event_1.Event.None,
                element: this.yb,
                minimumSize: $8Db_1.r,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.yb.style.width = `${width}px`;
                    this.zb.layout(height, width);
                }
            }, startingWidth, undefined, true);
            this.qb.addView({
                onDidChange: event_1.Event.None,
                element: this.rb,
                minimumSize: $8Db_1.y,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.rb.style.width = `${width}px`;
                    this.sb.layout(height, width);
                }
            }, splitview_1.Sizing.Distribute, undefined, true);
            this.B(this.qb.onDidSashReset(() => {
                const totalSize = this.qb.getViewSize(0) + this.qb.getViewSize(1);
                this.qb.resizeView(0, $8Db_1.u);
                this.qb.resizeView(1, totalSize - $8Db_1.u);
            }));
            this.B(this.qb.onDidSashChange(() => {
                const width = this.qb.getViewSize(0);
                this.ec.store('settingsEditor2.splitViewWidth', width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }));
            const borderColor = this.h.getColor(settingsEditorColorRegistry_1.$3Cb);
            this.qb.style({ separatorBorder: borderColor });
        }
        Dc(container) {
            this.B(DOM.$oO(container, DOM.$3O.KEY_DOWN, (e) => {
                if (e.keyCode === 31 /* KeyCode.KeyA */ &&
                    (platform.$j ? e.metaKey : e.ctrlKey) &&
                    e.target.tagName !== 'TEXTAREA' &&
                    e.target.tagName !== 'INPUT') {
                    // Avoid browser ctrl+a
                    e.browserEvent.stopPropagation();
                    e.browserEvent.preventDefault();
                }
            }));
        }
        Ec(container) {
            this.ub = this.bc.createInstance(tocTree_1.$2Db, this.Jb);
            this.zb = this.B(this.bc.createInstance(tocTree_1.$5Db, DOM.$0O(container, $('.settings-toc-wrapper', {
                'role': 'navigation',
                'aria-label': (0, nls_1.localize)(5, null),
            })), this.Jb));
            this.B(this.zb.onDidFocus(() => {
                this.Sb = 1 /* SettingsFocusContext.TableOfContents */;
            }));
            this.B(this.zb.onDidChangeFocus(e => {
                const element = e.elements?.[0] ?? null;
                if (this.Vb === element) {
                    return;
                }
                this.Vb = element;
                this.zb.setSelection(element ? [element] : []);
                if (this.rc) {
                    if (this.Jb.filterToCategory !== element) {
                        this.Jb.filterToCategory = element ?? undefined;
                        // Force render in this case, because
                        // onDidClickSetting relies on the updated view.
                        this.Uc(undefined, true);
                        this.sb.scrollTop = 0;
                    }
                }
                else if (element && (!e.browserEvent || !e.browserEvent.fromScroll)) {
                    this.sb.reveal(element, 0);
                    this.sb.setFocus([element]);
                }
            }));
            this.B(this.zb.onDidFocus(() => {
                this.Nb.set(true);
            }));
            this.B(this.zb.onDidBlur(() => {
                this.Nb.set(false);
            }));
        }
        Fc(filter) {
            if (this.mb && !this.mb.getValue().includes(filter)) {
                // Prepend the filter to the query.
                const newQuery = `${filter} ${this.mb.getValue().trimStart()}`;
                this.focusSearch(newQuery, false);
            }
        }
        Gc() {
            if (this.mb && this.mb.getValue().includes(`@${preferences_1.$MCb}`)) {
                const query = this.mb.getValue().split(' ');
                const newQuery = query.filter(word => !word.startsWith(`@${preferences_1.$MCb}`)).join(' ');
                this.focusSearch(newQuery, false);
            }
        }
        Hc(container) {
            this.tb = this.bc.createInstance(settingsTree_1.$XDb);
            this.B(this.tb.onDidChangeSetting(e => this.Ic(e.key, e.value, e.type, e.manualReset, e.scope)));
            this.B(this.tb.onDidOpenSettings(settingKey => {
                this.Bc({ revealSetting: { key: settingKey, edit: true } });
            }));
            this.B(this.tb.onDidClickSettingLink(settingName => this.Ac(settingName)));
            this.B(this.tb.onDidFocusSetting(element => {
                this.sb.setFocus([element]);
                this.Sb = 3 /* SettingsFocusContext.SettingControl */;
                this.Ob.set(false);
            }));
            this.B(this.tb.onDidChangeSettingHeight((params) => {
                const { element, height } = params;
                try {
                    this.sb.updateElementHeight(element, height);
                }
                catch (e) {
                    // the element was not found
                }
            }));
            this.B(this.tb.onApplyFilter((filter) => this.Fc(filter)));
            this.B(this.tb.onDidClickOverrideElement((element) => {
                this.Gc();
                if (element.language) {
                    this.Fc(`@${preferences_1.$MCb}${element.language}`);
                }
                if (element.scope === 'workspace') {
                    this.pb.updateTarget(5 /* ConfigurationTarget.WORKSPACE */);
                }
                else if (element.scope === 'user') {
                    this.pb.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
                }
                else if (element.scope === 'remote') {
                    this.pb.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */);
                }
                this.Fc(`@${preferences_1.$LCb}${element.settingKey}`);
            }));
            this.sb = this.B(this.bc.createInstance(settingsTree_1.$1Db, container, this.Jb, this.tb.allRenderers));
            this.B(this.sb.onDidScroll(() => {
                if (this.sb.scrollTop === this.Xb) {
                    return;
                }
                this.Xb = this.sb.scrollTop;
                // setTimeout because calling setChildren on the settingsTree can trigger onDidScroll, so it fires when
                // setChildren has called on the settings tree but not the toc tree yet, so their rendered elements are out of sync
                setTimeout(() => {
                    this.Jc();
                }, 0);
            }));
            this.B(this.sb.onDidFocus(() => {
                const classList = document.activeElement?.classList;
                if (classList && classList.contains('monaco-list') && classList.contains('settings-editor-tree')) {
                    this.Sb = 2 /* SettingsFocusContext.SettingTree */;
                    this.Ob.set(true);
                    this.Wb ??= this.sb.firstVisibleElement ?? null;
                    if (this.Wb) {
                        this.Wb.tabbable = true;
                    }
                }
            }));
            this.B(this.sb.onDidBlur(() => {
                this.Ob.set(false);
                // Clear out the focused element, otherwise it could be
                // out of date during the next onDidFocus event.
                this.Wb = null;
            }));
            // There is no different select state in the settings tree
            this.B(this.sb.onDidChangeFocus(e => {
                const element = e.elements[0];
                if (this.Wb === element) {
                    return;
                }
                if (this.Wb) {
                    this.Wb.tabbable = false;
                }
                this.Wb = element;
                if (this.Wb) {
                    this.Wb.tabbable = true;
                }
                this.sb.setSelection(element ? [element] : []);
            }));
        }
        Ic(key, value, type, manualReset, scope) {
            const parsedQuery = (0, settingsTreeModels_1.$zDb)(this.mb.getValue());
            const languageFilter = parsedQuery.languageFilter;
            if (manualReset || (this.Ib && this.Ib.key !== key)) {
                this.Lc(key, value, manualReset, languageFilter, scope);
            }
            this.Ib = { key, value, languageFilter };
            if ($8Db_1.gb(type)) {
                this.Gb.trigger(() => this.Lc(key, value, manualReset, languageFilter, scope));
            }
            else {
                this.Hb.trigger(() => this.Lc(key, value, manualReset, languageFilter, scope));
            }
        }
        Jc() {
            this.tb.cancelSuggesters();
            if (this.rc) {
                return;
            }
            if (!this.ub) {
                return;
            }
            const elementToSync = this.sb.firstVisibleElement;
            const element = elementToSync instanceof settingsTreeModels_1.$uDb ? elementToSync.parent :
                elementToSync instanceof settingsTreeModels_1.$sDb ? elementToSync :
                    null;
            // It's possible for this to be called when the TOC and settings tree are out of sync - e.g. when the settings tree has deferred a refresh because
            // it is focused. So, bail if element doesn't exist in the TOC.
            let nodeExists = true;
            try {
                this.zb.getNode(element);
            }
            catch (e) {
                nodeExists = false;
            }
            if (!nodeExists) {
                return;
            }
            if (element && this.zb.getSelection()[0] !== element) {
                const ancestors = this.Kc(element);
                ancestors.forEach(e => this.zb.expand(e));
                this.zb.reveal(element);
                const elementTop = this.zb.getRelativeTop(element);
                if (typeof elementTop !== 'number') {
                    return;
                }
                this.zb.collapseAll();
                ancestors.forEach(e => this.zb.expand(e));
                if (elementTop < 0 || elementTop > 1) {
                    this.zb.reveal(element);
                }
                else {
                    this.zb.reveal(element, elementTop);
                }
                this.zb.expand(element);
                this.zb.setSelection([element]);
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                fakeKeyboardEvent.fromScroll = true;
                this.zb.setFocus([element], fakeKeyboardEvent);
            }
        }
        Kc(element) {
            const ancestors = [];
            while (element.parent) {
                if (element.parent.id !== 'root') {
                    ancestors.push(element.parent);
                }
                element = element.parent;
            }
            return ancestors.reverse();
        }
        Lc(key, value, manualReset, languageFilter, scope) {
            // ConfigurationService displays the error if this fails.
            // Force a render afterwards because onDidConfigurationUpdate doesn't fire if the update doesn't result in an effective setting value change.
            const settingsTarget = this.pb.settingsTarget;
            const resource = uri_1.URI.isUri(settingsTarget) ? settingsTarget : undefined;
            const configurationTarget = (resource ? 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ : settingsTarget) ?? 3 /* ConfigurationTarget.USER_LOCAL */;
            const overrides = { resource, overrideIdentifiers: languageFilter ? [languageFilter] : undefined };
            const configurationTargetIsWorkspace = configurationTarget === 5 /* ConfigurationTarget.WORKSPACE */ || configurationTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            const userPassedInManualReset = configurationTargetIsWorkspace || !!languageFilter;
            const isManualReset = userPassedInManualReset ? manualReset : value === undefined;
            // If the user is changing the value back to the default, and we're not targeting a workspace scope, do a 'reset' instead
            const inspected = this.$b.inspect(key, overrides);
            if (!userPassedInManualReset && inspected.defaultValue === value) {
                value = undefined;
            }
            return this.$b.updateValue(key, value, overrides, configurationTarget, { handleDirtyFile: 'save' })
                .then(() => {
                const query = this.mb.getValue();
                if (query.includes(`@${preferences_1.$ICb}`)) {
                    // The user might have reset a setting.
                    this.Xc();
                }
                this.Uc(key, isManualReset);
                const reportModifiedProps = {
                    key,
                    query,
                    searchResults: this.rc?.getUniqueResults() ?? null,
                    rawResults: this.rc?.getRawResults() ?? null,
                    showConfiguredOnly: !!this.Jb.tagFilters && this.Jb.tagFilters.has(preferences_1.$ICb),
                    isReset: typeof value === 'undefined',
                    settingsTarget: this.pb.settingsTarget
                };
                this.Ib = null;
                return this.Mc(reportModifiedProps);
            });
        }
        Mc(props) {
            let groupId = undefined;
            let nlpIndex = undefined;
            let displayIndex = undefined;
            if (props.searchResults) {
                displayIndex = props.searchResults.filterMatches.findIndex(m => m.setting.key === props.key);
                if (this.rc) {
                    const rawResults = this.rc.getRawResults();
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
            this.P.publicLog2('settingsEditor.settingModified', data);
        }
        Nc() {
            this.jb.classList.remove('no-toc-search');
            if (this.$b.getValue('workbench.settings.settingsSearchTocBehavior') === 'hide') {
                this.jb.classList.toggle('no-toc-search', !!this.rc);
            }
        }
        Oc(element, key = '') {
            if (key && this.Rb.has(key)) {
                return;
            }
            if (!key) {
                (0, lifecycle_1.$fc)(this.Rb.values());
                this.Rb.clear();
            }
            const scheduledRefreshTracker = DOM.$8O(element);
            this.Rb.set(key, scheduledRefreshTracker);
            scheduledRefreshTracker.onDidBlur(() => {
                scheduledRefreshTracker.dispose();
                this.Rb.delete(key);
                this.Rc(new Set([key]));
            });
        }
        Pc(setting, extension, groups) {
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
                    titleRange: preferencesModels_1.$rE,
                    range: preferencesModels_1.$rE,
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
        Qc(resolvedSettingsRoot) {
            this.vb.update(resolvedSettingsRoot);
            this.ub.settingsTreeRoot = this.vb.root;
        }
        async Rc(keys, forceRefresh = false, schemaChange = false) {
            if (keys && this.vb) {
                return this.Sc(keys);
            }
            if (!this.hb) {
                return;
            }
            const groups = this.hb.settingsGroups.slice(1); // Without commonlyUsed
            const coreSettings = groups.filter(g => !g.extensionInfo);
            const settingsResult = (0, settingsTree_1.$JDb)(settingsLayout_1.$nDb, coreSettings, this.dc);
            const resolvedSettingsRoot = settingsResult.tree;
            // Warn for settings not included in layout
            if (settingsResult.leftoverSettings.size && !this.Tb) {
                const settingKeyList = [];
                settingsResult.leftoverSettings.forEach(s => {
                    settingKeyList.push(s.key);
                });
                this.dc.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(', ')}`);
                this.Tb = true;
            }
            const additionalGroups = [];
            const toggleData = await (0, preferences_1.$UCb)(this.lc, this.nc, this.mc);
            if (toggleData && groups.filter(g => g.extensionInfo).length) {
                for (const key in toggleData.settingsEditorRecommendedExtensions) {
                    const extensionId = key;
                    // Recommend prerelease if not on Stable.
                    const isStable = this.mc.quality === 'stable';
                    const [extension] = await this.oc.getExtensions([{ id: extensionId, preRelease: !isStable }], cancellation_1.CancellationToken.None);
                    if (!extension) {
                        continue;
                    }
                    let groupTitle;
                    const manifest = await this.oc.getManifest(extension, cancellation_1.CancellationToken.None);
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
                        range: preferencesModels_1.$rE,
                        key: settingKey,
                        keyRange: preferencesModels_1.$rE,
                        value: null,
                        valueRange: preferencesModels_1.$rE,
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
                    const additionalGroup = this.Pc(setting, extension, groups);
                    if (additionalGroup) {
                        additionalGroups.push(additionalGroup);
                    }
                }
            }
            resolvedSettingsRoot.children.push(await (0, settingsTree_1.$LDb)(this.jc, groups.filter(g => g.extensionInfo)));
            const commonlyUsedDataToUse = await (0, settingsLayout_1.$mDb)(this.lc, this.nc, this.mc);
            const commonlyUsed = (0, settingsTree_1.$JDb)(commonlyUsedDataToUse, groups, this.dc);
            resolvedSettingsRoot.children.unshift(commonlyUsed.tree);
            if (toggleData) {
                // Add the additional groups to the model to help with searching.
                this.hb.setAdditionalGroups(additionalGroups);
            }
            if (!this.ic.isWorkspaceTrusted() && (this.Jb.settingsTarget instanceof uri_1.URI || this.Jb.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */)) {
                const configuredUntrustedWorkspaceSettings = (0, settingsTree_1.$KDb)(groups, this.Jb.settingsTarget, this.Jb.languageFilter, this.$b);
                if (configuredUntrustedWorkspaceSettings.length) {
                    resolvedSettingsRoot.children.unshift({
                        id: 'workspaceTrust',
                        label: (0, nls_1.localize)(6, null),
                        settings: configuredUntrustedWorkspaceSettings
                    });
                }
            }
            this.rc?.updateChildren();
            if (this.vb) {
                this.Qc(resolvedSettingsRoot);
                if (schemaChange && !!this.rc) {
                    // If an extension's settings were just loaded and a search is active, retrigger the search so it shows up
                    return await this.Zc();
                }
                this.Xc();
                this.Uc(undefined, forceRefresh);
            }
            else {
                this.vb = this.bc.createInstance(settingsTreeModels_1.$vDb, this.Jb, this.ic.isWorkspaceTrusted());
                this.Qc(resolvedSettingsRoot);
                // Don't restore the cached state if we already have a query value from calling _setOptions().
                const cachedState = !this.Jb.query ? this.uc() : undefined;
                if (cachedState?.searchQuery || this.mb.getValue()) {
                    await this.Zc();
                }
                else {
                    this.Xc();
                    this.Wc();
                    this.zb.collapseAll();
                }
            }
        }
        Sc(keys) {
            if (keys.size) {
                if (this.rc) {
                    keys.forEach(key => this.rc.updateElementsByName(key));
                }
                if (this.vb) {
                    keys.forEach(key => this.vb.updateElementsByName(key));
                }
                // Attempt to render the tree once rather than
                // once for each key to avoid redundant calls to this.refreshTree()
                this.Uc();
            }
            else {
                this.Uc();
            }
        }
        Tc() {
            return (document.activeElement && DOM.$NO(document.activeElement, this.sb.getHTMLElement())) ?
                document.activeElement :
                null;
        }
        Uc(key, force = false) {
            if (!force && key && this.Rb.has(key)) {
                this.Yc(key);
                return;
            }
            // If the context view is focused, delay rendering settings
            if (this.Vc()) {
                const element = document.querySelector('.context-view');
                if (element) {
                    this.Oc(element, key);
                }
                return;
            }
            // If a setting control is currently focused, schedule a refresh for later
            const activeElement = this.Tc();
            const focusedSetting = activeElement && this.tb.getSettingDOMElementForDOMElement(activeElement);
            if (focusedSetting && !force) {
                // If a single setting is being refreshed, it's ok to refresh now if that is not the focused setting
                if (key) {
                    const focusedKey = focusedSetting.getAttribute(settingsTree_1.$NDb.SETTING_KEY_ATTR);
                    if (focusedKey === key &&
                        // update `list`s live, as they have a separate "submit edit" step built in before this
                        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains('setting-item-list'))) {
                        this.Yc(key);
                        this.Oc(focusedSetting, key);
                        return;
                    }
                }
                else {
                    this.Oc(focusedSetting);
                    return;
                }
            }
            this.hd();
            if (key) {
                const elements = this.qc.getElementsByName(key);
                if (elements && elements.length) {
                    // TODO https://github.com/microsoft/vscode/issues/57360
                    this.Wc();
                }
                else {
                    // Refresh requested for a key that we don't know about
                    return;
                }
            }
            else {
                this.Wc();
            }
            return;
        }
        Vc() {
            return !!DOM.$QO(document.activeElement, 'context-view');
        }
        Wc() {
            if (this.isVisible()) {
                this.sb.setChildren(null, $7Db(this.qc.root));
            }
        }
        Xc() {
            if (this.isVisible()) {
                this.ub.update();
                this.zb.setChildren(null, (0, tocTree_1.$4Db)(this.ub, this.zb));
            }
        }
        Yc(key) {
            const dataElements = this.qc.getElementsByName(key);
            const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured; // all elements are either configured or not
            const elements = this.tb.getDOMElementsForSettingKey(this.sb.getHTMLElement(), key);
            if (elements && elements[0]) {
                elements[0].classList.toggle('is-configured', !!isModified);
            }
        }
        async Zc() {
            if (!this.qc) {
                // Initializing search widget value
                return;
            }
            const query = this.mb.getValue().trim();
            this.Jb.query = query;
            this.Ab.cancel();
            await this.ad(query.replace(/\u203A/g, ' '));
            if (query && this.rc) {
                this.Ab.trigger(() => this.cd(this.rc));
            }
        }
        $c(query) {
            const match = query.match(/"([a-zA-Z.]+)": /);
            return match && match[1];
        }
        ad(query) {
            this.Jb.tagFilters = new Set();
            this.Jb.extensionFilters = new Set();
            this.Jb.featureFilters = new Set();
            this.Jb.idFilters = new Set();
            this.Jb.languageFilter = undefined;
            if (query) {
                const parsedQuery = (0, settingsTreeModels_1.$zDb)(query);
                query = parsedQuery.query;
                parsedQuery.tags.forEach(tag => this.Jb.tagFilters.add(tag));
                parsedQuery.extensionFilters.forEach(extensionId => this.Jb.extensionFilters.add(extensionId));
                parsedQuery.featureFilters.forEach(feature => this.Jb.featureFilters.add(feature));
                parsedQuery.idFilters.forEach(id => this.Jb.idFilters.add(id));
                this.Jb.languageFilter = parsedQuery.languageFilter;
            }
            this.pb.updateLanguageFilterIndicators(this.Jb.languageFilter);
            if (query && query !== '@') {
                query = this.$c(query) || query;
                return this.dd(query);
            }
            else {
                if (this.Jb.tagFilters.size || this.Jb.extensionFilters.size || this.Jb.featureFilters.size || this.Jb.idFilters.size || this.Jb.languageFilter) {
                    this.rc = this.bd();
                }
                else {
                    this.rc = null;
                }
                this.Bb.cancel();
                this.Cb.cancel();
                if (this.Db) {
                    this.Db.cancel();
                    this.Db.dispose();
                    this.Db = null;
                }
                this.zb.setFocus([]);
                this.Jb.filterToCategory = undefined;
                this.ub.currentSearchModel = this.rc;
                this.Nc();
                if (this.rc) {
                    // Added a filter model
                    this.zb.setSelection([]);
                    this.zb.expandAll();
                    this.Xc();
                    this.hd();
                    this.Wc();
                }
                else {
                    // Leaving search mode
                    this.zb.collapseAll();
                    this.Xc();
                    this.hd();
                    this.Wc();
                }
            }
            return Promise.resolve();
        }
        /**
         * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
         */
        bd() {
            const filterModel = this.bc.createInstance(settingsTreeModels_1.$yDb, this.Jb, this.ic.isWorkspaceTrusted());
            const fullResult = {
                filterMatches: []
            };
            for (const g of this.hb.settingsGroups.slice(1)) {
                for (const sect of g.sections) {
                    for (const setting of sect.settings) {
                        fullResult.filterMatches.push({ setting, matches: [], matchType: preferences_2.SettingMatchType.None, score: 0 });
                    }
                }
            }
            filterModel.setResult(0, fullResult);
            return filterModel;
        }
        cd(searchResultModel) {
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
            this.P.publicLog2('settingsEditor.filter', data);
        }
        dd(query) {
            if (this.Db) {
                this.Db.cancel();
                this.Db = null;
            }
            // Trigger the local search. If it didn't find an exact match, trigger the remote search.
            const searchInProgress = this.Db = new cancellation_1.$pd();
            return this.Bb.trigger(async () => {
                if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                    const progressRunner = this.pc.show(true);
                    const result = await this.ed(query);
                    if (result && !result.exactMatch) {
                        this.Cb.trigger(async () => {
                            if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                                await this.fd(query, this.Db.token);
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
        ed(query, token) {
            const localSearchProvider = this.cc.getLocalSearchProvider(query);
            return this.gd(query, 0 /* SearchResultIdx.Local */, localSearchProvider, token);
        }
        fd(query, token) {
            const remoteSearchProvider = this.cc.getRemoteSearchProvider(query);
            const newExtSearchProvider = this.cc.getRemoteSearchProvider(query, true);
            return Promise.all([
                this.gd(query, 1 /* SearchResultIdx.Remote */, remoteSearchProvider, token),
                this.gd(query, 2 /* SearchResultIdx.NewExtensions */, newExtSearchProvider, token)
            ]).then(() => { });
        }
        async gd(query, type, searchProvider, token) {
            const result = await this.jd(query, this.hb, searchProvider, token);
            if (token?.isCancellationRequested) {
                // Handle cancellation like this because cancellation is lost inside the search provider due to async/await
                return null;
            }
            if (!this.rc) {
                this.rc = this.bc.createInstance(settingsTreeModels_1.$yDb, this.Jb, this.ic.isWorkspaceTrusted());
                // Must be called before this.renderTree()
                // to make sure the search results count is set.
                this.rc.setResult(type, result);
                this.ub.currentSearchModel = this.rc;
                this.Nc();
            }
            else {
                this.rc.setResult(type, result);
                this.ub.update();
            }
            if (type === 0 /* SearchResultIdx.Local */) {
                this.zb.setFocus([]);
                this.Jb.filterToCategory = undefined;
                this.zb.expandAll();
            }
            this.sb.scrollTop = 0;
            this.Xc();
            this.Uc(undefined, true);
            return result;
        }
        hd() {
            if (!this.qc) {
                return;
            }
            this.xb.style.display = this.Jb.tagFilters && this.Jb.tagFilters.size > 0
                ? 'initial'
                : 'none';
            if (!this.rc) {
                if (this.nb.style.display !== 'none') {
                    this.Lb = null;
                    this.xc();
                    this.nb.style.display = 'none';
                    this.nb.innerText = '';
                    this.layout(this.Yb);
                }
                this.jb.classList.remove('no-results');
                this.qb.el.style.visibility = 'visible';
                return;
            }
            else {
                const count = this.rc.getUniqueResultsCount();
                let resultString;
                switch (count) {
                    case 0:
                        resultString = (0, nls_1.localize)(7, null);
                        break;
                    case 1:
                        resultString = (0, nls_1.localize)(8, null);
                        break;
                    default: resultString = (0, nls_1.localize)(9, null, count);
                }
                this.Lb = resultString;
                this.xc();
                this.nb.innerText = resultString;
                aria.$_P(resultString);
                if (this.nb.style.display !== 'block') {
                    this.nb.style.display = 'block';
                    this.layout(this.Yb);
                }
                this.jb.classList.toggle('no-results', count === 0);
                this.qb.el.style.visibility = count === 0 ? 'hidden' : 'visible';
            }
        }
        jd(filter, model, provider, token) {
            const searchP = provider ? provider.searchModel(model, token) : Promise.resolve(null);
            return searchP
                .then(undefined, err => {
                if ((0, errors_1.$2)(err)) {
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
        kd(dimension) {
            const listHeight = dimension.height - (72 + 11 + 14 /* header height + editor padding */);
            this.qb.el.style.height = `${listHeight}px`;
            // We call layout first so the splitView has an idea of how much
            // space it has, otherwise setViewVisible results in the first panel
            // showing up at the minimum size whenever the Settings editor
            // opens for the first time.
            this.qb.layout(this.lb.clientWidth, listHeight);
            const firstViewWasVisible = this.qb.isViewVisible(0);
            const firstViewVisible = this.lb.clientWidth >= $8Db_1.eb;
            this.qb.setViewVisible(0, firstViewVisible);
            // If the first view is again visible, and we have enough space, immediately set the
            // editor to use the reset width rather than the cached min width
            if (!firstViewWasVisible && firstViewVisible && this.lb.clientWidth >= $8Db_1.y + $8Db_1.u) {
                this.qb.resizeView(0, $8Db_1.u);
            }
            this.qb.style({
                separatorBorder: firstViewVisible ? this.h.getColor(settingsEditorColorRegistry_1.$3Cb) : color_1.$Os.transparent
            });
        }
        G() {
            if (this.isVisible()) {
                const searchQuery = this.mb.getValue().trim();
                const target = this.pb.settingsTarget;
                if (this.group && this.input) {
                    this.Ub.saveEditorState(this.group, this.input, { searchQuery, target });
                }
            }
            else if (this.group && this.input) {
                this.Ub.clearEditorState(this.input, this.group);
            }
            super.G();
        }
    };
    exports.$8Db = $8Db;
    exports.$8Db = $8Db = $8Db_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, configuration_1.$mE),
        __param(2, textResourceConfiguration_1.$FA),
        __param(3, themeService_1.$gv),
        __param(4, preferences_2.$BE),
        __param(5, instantiation_1.$Ah),
        __param(6, preferences_1.$bCb),
        __param(7, log_1.$5i),
        __param(8, contextkey_1.$3i),
        __param(9, storage_1.$Vo),
        __param(10, editorGroupsService_1.$5C),
        __param(11, userDataSync_2.$KAb),
        __param(12, userDataSync_1.$Pgb),
        __param(13, workspaceTrust_1.$$z),
        __param(14, extensions_1.$MF),
        __param(15, language_1.$ct),
        __param(16, extensionManagement_1.$2n),
        __param(17, assignmentService_1.$drb),
        __param(18, productService_1.$kj),
        __param(19, environment_1.$Ih),
        __param(20, extensionManagement_1.$Zn),
        __param(21, progress_1.$7u)
    ], $8Db);
    let SyncControls = class SyncControls extends lifecycle_1.$kc {
        constructor(container, f, h, j, telemetryService) {
            super();
            this.f = f;
            this.h = h;
            this.j = j;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeLastSyncedLabel = this.c.event;
            const headerRightControlsContainer = DOM.$0O(container, $('.settings-right-controls'));
            const turnOnSyncButtonContainer = DOM.$0O(headerRightControlsContainer, $('.turn-on-sync'));
            this.b = this.B(new button_1.$7Q(turnOnSyncButtonContainer, { title: true, ...defaultStyles_1.$i2 }));
            this.a = DOM.$0O(headerRightControlsContainer, $('.last-synced-label'));
            DOM.$eP(this.a);
            this.b.enabled = true;
            this.b.label = (0, nls_1.localize)(10, null);
            DOM.$eP(this.b.element);
            this.B(this.b.onDidClick(async () => {
                telemetryService.publicLog2('sync/turnOnSyncFromSettings');
                await this.f.executeCommand('workbench.userDataSync.actions.turnOn');
            }));
            this.n();
            this.B(this.h.onDidChangeLastSyncTime(() => {
                this.n();
            }));
            const updateLastSyncedTimer = this.B(new async_1.$Rg());
            updateLastSyncedTimer.cancelAndSet(() => this.n(), 60 * 1000);
            this.r();
            this.B(this.h.onDidChangeStatus(() => {
                this.r();
            }));
            this.B(this.j.onDidChangeEnablement(() => {
                this.r();
            }));
        }
        n() {
            const last = this.h.lastSyncTime;
            let label;
            if (typeof last === 'number') {
                const d = (0, date_1.$6l)(last, true, undefined, true);
                label = (0, nls_1.localize)(11, null, d);
            }
            else {
                label = '';
            }
            this.a.textContent = label;
            this.c.fire(label);
        }
        r() {
            if (this.h.status === "uninitialized" /* SyncStatus.Uninitialized */) {
                return;
            }
            if (this.j.isEnabled() || this.h.status !== "idle" /* SyncStatus.Idle */) {
                DOM.$dP(this.a);
                DOM.$eP(this.b.element);
            }
            else {
                DOM.$eP(this.a);
                DOM.$dP(this.b.element);
            }
        }
    };
    SyncControls = __decorate([
        __param(1, commands_1.$Fr),
        __param(2, userDataSync_1.$Qgb),
        __param(3, userDataSync_1.$Pgb),
        __param(4, telemetry_1.$9k)
    ], SyncControls);
});
//# sourceMappingURL=settingsEditor2.js.map