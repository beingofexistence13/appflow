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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/common/colorRegistry", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/languages/language"], function (require, exports, DOM, keyboardEvent_1, actionbar_1, actionViewItems_1, widget_1, actions_1, event_1, htmlContent_1, lifecycle_1, network_1, resources_1, uri_1, nls_1, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, label_1, colorRegistry_1, themables_1, workspace_1, preferencesIcons_1, environmentService_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditPreferenceWidget = exports.SearchWidget = exports.SettingsTargetsWidget = exports.FolderSettingsActionViewItem = void 0;
    let FolderSettingsActionViewItem = class FolderSettingsActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(action, contextService, contextMenuService) {
            super(null, action);
            this.contextService = contextService;
            this.contextMenuService = contextMenuService;
            this._folderSettingCounts = new Map();
            const workspace = this.contextService.getWorkspace();
            this._folder = workspace.folders.length === 1 ? workspace.folders[0] : null;
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onWorkspaceFoldersChanged()));
        }
        get folder() {
            return this._folder;
        }
        set folder(folder) {
            this._folder = folder;
            this.update();
        }
        setCount(settingsTarget, count) {
            const workspaceFolder = this.contextService.getWorkspaceFolder(settingsTarget);
            if (!workspaceFolder) {
                throw new Error('unknown folder');
            }
            const folder = workspaceFolder.uri;
            this._folderSettingCounts.set(folder.toString(), count);
            this.update();
        }
        render(container) {
            this.element = container;
            this.container = container;
            this.labelElement = DOM.$('.action-title');
            this.detailsElement = DOM.$('.action-details');
            this.dropDownElement = DOM.$('.dropdown-icon.hide' + themables_1.ThemeIcon.asCSSSelector(preferencesIcons_1.settingsScopeDropDownIcon));
            this.anchorElement = DOM.$('a.action-label.folder-settings', {
                role: 'button',
                'aria-haspopup': 'true',
                'tabindex': '0'
            }, this.labelElement, this.detailsElement, this.dropDownElement);
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.MOUSE_DOWN, e => DOM.EventHelper.stop(e)));
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.CLICK, e => this.onClick(e)));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.KEY_UP, e => this.onKeyUp(e)));
            DOM.append(this.container, this.anchorElement);
            this.update();
        }
        onKeyUp(event) {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
            switch (keyboardEvent.keyCode) {
                case 3 /* KeyCode.Enter */:
                case 10 /* KeyCode.Space */:
                    this.onClick(event);
                    return;
            }
        }
        onClick(event) {
            DOM.EventHelper.stop(event, true);
            if (!this.folder || this._action.checked) {
                this.showMenu();
            }
            else {
                this._action.run(this._folder);
            }
        }
        updateEnabled() {
            this.update();
        }
        updateChecked() {
            this.update();
        }
        onWorkspaceFoldersChanged() {
            const oldFolder = this._folder;
            const workspace = this.contextService.getWorkspace();
            if (oldFolder) {
                this._folder = workspace.folders.filter(folder => (0, resources_1.isEqual)(folder.uri, oldFolder.uri))[0] || workspace.folders[0];
            }
            this._folder = this._folder ? this._folder : workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.update();
            if (this._action.checked) {
                this._action.run(this._folder);
            }
        }
        update() {
            let total = 0;
            this._folderSettingCounts.forEach(n => total += n);
            const workspace = this.contextService.getWorkspace();
            if (this._folder) {
                this.labelElement.textContent = this._folder.name;
                this.anchorElement.title = this._folder.name;
                const detailsText = this.labelWithCount(this._action.label, total);
                this.detailsElement.textContent = detailsText;
                this.dropDownElement.classList.toggle('hide', workspace.folders.length === 1 || !this._action.checked);
            }
            else {
                const labelText = this.labelWithCount(this._action.label, total);
                this.labelElement.textContent = labelText;
                this.detailsElement.textContent = '';
                this.anchorElement.title = this._action.label;
                this.dropDownElement.classList.remove('hide');
            }
            this.anchorElement.classList.toggle('checked', this._action.checked);
            this.container.classList.toggle('disabled', !this._action.enabled);
        }
        showMenu() {
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                getActions: () => this.getDropdownMenuActions(),
                getActionViewItem: () => undefined,
                onHide: () => {
                    this.anchorElement.blur();
                }
            });
        }
        getDropdownMenuActions() {
            const actions = [];
            const workspaceFolders = this.contextService.getWorkspace().folders;
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && workspaceFolders.length > 0) {
                actions.push(...workspaceFolders.map((folder, index) => {
                    const folderCount = this._folderSettingCounts.get(folder.uri.toString());
                    return {
                        id: 'folderSettingsTarget' + index,
                        label: this.labelWithCount(folder.name, folderCount),
                        checked: this.folder && (0, resources_1.isEqual)(this.folder.uri, folder.uri),
                        enabled: true,
                        run: () => this._action.run(folder)
                    };
                }));
            }
            return actions;
        }
        labelWithCount(label, count) {
            // Append the count if it's >0 and not undefined
            if (count) {
                label += ` (${count})`;
            }
            return label;
        }
    };
    exports.FolderSettingsActionViewItem = FolderSettingsActionViewItem;
    exports.FolderSettingsActionViewItem = FolderSettingsActionViewItem = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, contextView_1.IContextMenuService)
    ], FolderSettingsActionViewItem);
    let SettingsTargetsWidget = class SettingsTargetsWidget extends widget_1.Widget {
        constructor(parent, options, contextService, instantiationService, environmentService, labelService, languageService) {
            super();
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.languageService = languageService;
            this._settingsTarget = null;
            this._onDidTargetChange = this._register(new event_1.Emitter());
            this.onDidTargetChange = this._onDidTargetChange.event;
            this.options = options ?? {};
            this.create(parent);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onWorkbenchStateChanged()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.update()));
        }
        resetLabels() {
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = remoteAuthority && this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.userLocalSettings.label = (0, nls_1.localize)('userSettings', "User");
            this.userRemoteSettings.label = (0, nls_1.localize)('userSettingsRemote', "Remote") + (hostLabel ? ` [${hostLabel}]` : '');
            this.workspaceSettings.label = (0, nls_1.localize)('workspaceSettings', "Workspace");
            this.folderSettingsAction.label = (0, nls_1.localize)('folderSettings', "Folder");
        }
        create(parent) {
            const settingsTabsWidget = DOM.append(parent, DOM.$('.settings-tabs-widget'));
            this.settingsSwitcherBar = this._register(new actionbar_1.ActionBar(settingsTabsWidget, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                focusOnlyEnabledItems: true,
                ariaLabel: (0, nls_1.localize)('settingsSwitcherBarAriaLabel', "Settings Switcher"),
                animated: false,
                actionViewItemProvider: (action) => action.id === 'folderSettings' ? this.folderSettings : undefined
            }));
            this.userLocalSettings = new actions_1.Action('userSettings', '', '.settings-tab', true, () => this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */));
            this.userLocalSettings.tooltip = (0, nls_1.localize)('userSettings', "User");
            this.userRemoteSettings = new actions_1.Action('userSettingsRemote', '', '.settings-tab', true, () => this.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */));
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = remoteAuthority && this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            this.userRemoteSettings.tooltip = (0, nls_1.localize)('userSettingsRemote', "Remote") + (hostLabel ? ` [${hostLabel}]` : '');
            this.workspaceSettings = new actions_1.Action('workspaceSettings', '', '.settings-tab', false, () => this.updateTarget(5 /* ConfigurationTarget.WORKSPACE */));
            this.folderSettingsAction = new actions_1.Action('folderSettings', '', '.settings-tab', false, async (folder) => {
                this.updateTarget((0, workspace_1.isWorkspaceFolder)(folder) ? folder.uri : 3 /* ConfigurationTarget.USER_LOCAL */);
            });
            this.folderSettings = this.instantiationService.createInstance(FolderSettingsActionViewItem, this.folderSettingsAction);
            this.resetLabels();
            this.update();
            this.settingsSwitcherBar.push([this.userLocalSettings, this.userRemoteSettings, this.workspaceSettings, this.folderSettingsAction]);
        }
        get settingsTarget() {
            return this._settingsTarget;
        }
        set settingsTarget(settingsTarget) {
            this._settingsTarget = settingsTarget;
            this.userLocalSettings.checked = 3 /* ConfigurationTarget.USER_LOCAL */ === this.settingsTarget;
            this.userRemoteSettings.checked = 4 /* ConfigurationTarget.USER_REMOTE */ === this.settingsTarget;
            this.workspaceSettings.checked = 5 /* ConfigurationTarget.WORKSPACE */ === this.settingsTarget;
            if (this.settingsTarget instanceof uri_1.URI) {
                this.folderSettings.action.checked = true;
                this.folderSettings.folder = this.contextService.getWorkspaceFolder(this.settingsTarget);
            }
            else {
                this.folderSettings.action.checked = false;
            }
        }
        setResultCount(settingsTarget, count) {
            if (settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                let label = (0, nls_1.localize)('workspaceSettings', "Workspace");
                if (count) {
                    label += ` (${count})`;
                }
                this.workspaceSettings.label = label;
            }
            else if (settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                let label = (0, nls_1.localize)('userSettings', "User");
                if (count) {
                    label += ` (${count})`;
                }
                this.userLocalSettings.label = label;
            }
            else if (settingsTarget instanceof uri_1.URI) {
                this.folderSettings.setCount(settingsTarget, count);
            }
        }
        updateLanguageFilterIndicators(filter) {
            this.resetLabels();
            if (filter) {
                const languageToUse = this.languageService.getLanguageName(filter);
                if (languageToUse) {
                    const languageSuffix = ` [${languageToUse}]`;
                    this.userLocalSettings.label += languageSuffix;
                    this.userRemoteSettings.label += languageSuffix;
                    this.workspaceSettings.label += languageSuffix;
                    this.folderSettingsAction.label += languageSuffix;
                }
            }
        }
        onWorkbenchStateChanged() {
            this.folderSettings.folder = null;
            this.update();
            if (this.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ && this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
            }
        }
        updateTarget(settingsTarget) {
            const isSameTarget = this.settingsTarget === settingsTarget ||
                settingsTarget instanceof uri_1.URI &&
                    this.settingsTarget instanceof uri_1.URI &&
                    (0, resources_1.isEqual)(this.settingsTarget, settingsTarget);
            if (!isSameTarget) {
                this.settingsTarget = settingsTarget;
                this._onDidTargetChange.fire(this.settingsTarget);
            }
            return Promise.resolve(undefined);
        }
        async update() {
            this.settingsSwitcherBar.domNode.classList.toggle('empty-workbench', this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */);
            this.userRemoteSettings.enabled = !!(this.options.enableRemoteSettings && this.environmentService.remoteAuthority);
            this.workspaceSettings.enabled = this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
            this.folderSettings.action.enabled = this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && this.contextService.getWorkspace().folders.length > 0;
            this.workspaceSettings.tooltip = (0, nls_1.localize)('workspaceSettings', "Workspace");
        }
    };
    exports.SettingsTargetsWidget = SettingsTargetsWidget;
    exports.SettingsTargetsWidget = SettingsTargetsWidget = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, label_1.ILabelService),
        __param(6, language_1.ILanguageService)
    ], SettingsTargetsWidget);
    let SearchWidget = class SearchWidget extends widget_1.Widget {
        constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
            super();
            this.options = options;
            this.contextViewService = contextViewService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this.create(parent);
        }
        create(parent) {
            this.domNode = DOM.append(parent, DOM.$('div.settings-header-widget'));
            this.createSearchContainer(DOM.append(this.domNode, DOM.$('div.settings-search-container')));
            this.controlsDiv = DOM.append(this.domNode, DOM.$('div.settings-search-controls'));
            if (this.options.showResultCount) {
                this.countElement = DOM.append(this.controlsDiv, DOM.$('.settings-count-widget'));
                this.countElement.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
                this.countElement.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
                this.countElement.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            }
            this.inputBox.inputElement.setAttribute('aria-live', this.options.ariaLive || 'off');
            if (this.options.ariaLabelledBy) {
                this.inputBox.inputElement.setAttribute('aria-labelledBy', this.options.ariaLabelledBy);
            }
            const focusTracker = this._register(DOM.trackFocus(this.inputBox.inputElement));
            this._register(focusTracker.onDidFocus(() => this._onFocus.fire()));
            const focusKey = this.options.focusKey;
            if (focusKey) {
                this._register(focusTracker.onDidFocus(() => focusKey.set(true)));
                this._register(focusTracker.onDidBlur(() => focusKey.set(false)));
            }
        }
        createSearchContainer(searchContainer) {
            this.searchContainer = searchContainer;
            const searchInput = DOM.append(this.searchContainer, DOM.$('div.settings-search-input'));
            this.inputBox = this._register(this.createInputBox(searchInput));
            this._register(this.inputBox.onDidChange(value => this._onDidChange.fire(value)));
        }
        createInputBox(parent) {
            const showHistoryHint = () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService);
            const box = this._register(new contextScopedHistoryWidget_1.ContextScopedHistoryInputBox(parent, this.contextViewService, { ...this.options, showHistoryHint }, this.contextKeyService));
            return box;
        }
        showMessage(message) {
            // Avoid setting the aria-label unnecessarily, the screenreader will read the count every time it's set, since it's aria-live:assertive. #50968
            if (this.countElement && message !== this.countElement.textContent) {
                this.countElement.textContent = message;
                this.inputBox.inputElement.setAttribute('aria-label', message);
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        layout(dimension) {
            if (dimension.width < 400) {
                this.countElement?.classList.add('hide');
                this.inputBox.inputElement.style.paddingRight = '0px';
            }
            else {
                this.countElement?.classList.remove('hide');
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        getControlsWidth() {
            const countWidth = this.countElement ? DOM.getTotalWidth(this.countElement) : 0;
            return countWidth + 20;
        }
        focus() {
            this.inputBox.focus();
            if (this.getValue()) {
                this.inputBox.select();
            }
        }
        hasFocus() {
            return this.inputBox.hasFocus();
        }
        clear() {
            this.inputBox.value = '';
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            return this.inputBox.value = value;
        }
        dispose() {
            this.options.focusKey?.set(false);
            super.dispose();
        }
    };
    exports.SearchWidget = SearchWidget;
    exports.SearchWidget = SearchWidget = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, keybinding_1.IKeybindingService)
    ], SearchWidget);
    class EditPreferenceWidget extends lifecycle_1.Disposable {
        constructor(editor) {
            super();
            this.editor = editor;
            this._line = -1;
            this._preferences = [];
            this._editPreferenceDecoration = this.editor.createDecorationsCollection();
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
            this._register(this.editor.onMouseDown((e) => {
                if (e.target.type !== 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ || e.target.detail.isAfterLines || !this.isVisible()) {
                    return;
                }
                this._onClick.fire(e);
            }));
        }
        get preferences() {
            return this._preferences;
        }
        getLine() {
            return this._line;
        }
        show(line, hoverMessage, preferences) {
            this._preferences = preferences;
            const newDecoration = [];
            this._line = line;
            newDecoration.push({
                options: {
                    description: 'edit-preference-widget-decoration',
                    glyphMarginClassName: themables_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    glyphMarginHoverMessage: new htmlContent_1.MarkdownString().appendText(hoverMessage),
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                },
                range: {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: 1
                }
            });
            this._editPreferenceDecoration.set(newDecoration);
        }
        hide() {
            this._editPreferenceDecoration.clear();
        }
        isVisible() {
            return this._editPreferenceDecoration.length > 0;
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.EditPreferenceWidget = EditPreferenceWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNXaWRnZXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci9wcmVmZXJlbmNlc1dpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUN6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLG9DQUFrQjtRQVduRSxZQUNDLE1BQWUsRUFDVyxjQUF5RCxFQUM5RCxrQkFBd0Q7WUFFN0UsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUh1QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQVh0RSx5QkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQWN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDNUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUErQjtZQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsUUFBUSxDQUFDLGNBQW1CLEVBQUUsS0FBYTtZQUMxQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNsQztZQUNELE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUM7WUFDbkMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVRLE1BQU0sQ0FBQyxTQUFzQjtZQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUV6QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLDRDQUF5QixDQUFDLENBQUMsQ0FBQztZQUN6RyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLEVBQUU7Z0JBQzVELElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxNQUFNO2dCQUN2QixVQUFVLEVBQUUsR0FBRzthQUNmLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRU8sT0FBTyxDQUFDLEtBQW9CO1lBQ25DLE1BQU0sYUFBYSxHQUFHLElBQUkscUNBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsUUFBUSxhQUFhLENBQUMsT0FBTyxFQUFFO2dCQUM5QiwyQkFBbUI7Z0JBQ25CO29CQUNDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLE9BQU87YUFDUjtRQUNGLENBQUM7UUFFUSxPQUFPLENBQUMsS0FBb0I7WUFDcEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDaEI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQy9CO1FBQ0YsQ0FBQztRQUVrQixhQUFhO1lBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFa0IsYUFBYTtZQUMvQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRU8seUJBQXlCO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyRCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSxtQkFBTyxFQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqSDtZQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFMUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQy9CO1FBQ0YsQ0FBQztRQUVPLE1BQU07WUFDYixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZHO2lCQUFNO2dCQUNOLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFTyxRQUFRO1lBQ2YsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDdkMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUMvQixVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFO2dCQUMvQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO2dCQUNsQyxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNCLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sc0JBQXNCO1lBQzdCLE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztZQUM5QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxxQ0FBNkIsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4RyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUN0RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDekUsT0FBZ0I7d0JBQ2YsRUFBRSxFQUFFLHNCQUFzQixHQUFHLEtBQUs7d0JBQ2xDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDO3dCQUNwRCxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQzt3QkFDNUQsT0FBTyxFQUFFLElBQUk7d0JBQ2IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztxQkFDbkMsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU8sY0FBYyxDQUFDLEtBQWEsRUFBRSxLQUF5QjtZQUM5RCxnREFBZ0Q7WUFDaEQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUM7YUFDdkI7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRCxDQUFBO0lBcEtZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBYXRDLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSxpQ0FBbUIsQ0FBQTtPQWRULDRCQUE0QixDQW9LeEM7SUFRTSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLGVBQU07UUFlaEQsWUFDQyxNQUFtQixFQUNuQixPQUFrRCxFQUN4QixjQUF5RCxFQUM1RCxvQkFBNEQsRUFDckQsa0JBQWlFLEVBQ2hGLFlBQTRDLEVBQ3pDLGVBQWtEO1lBRXBFLEtBQUssRUFBRSxDQUFDO1lBTm1DLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDL0QsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDeEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBWjdELG9CQUFlLEdBQTBCLElBQUksQ0FBQztZQUVyQyx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrQixDQUFDLENBQUM7WUFDM0Usc0JBQWlCLEdBQTBCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFZakYsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRU8sV0FBVztZQUNsQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBQ2hFLE1BQU0sU0FBUyxHQUFHLGVBQWUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMzRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVPLE1BQU0sQ0FBQyxNQUFtQjtZQUNqQyxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDM0UsV0FBVyx1Q0FBK0I7Z0JBQzFDLHFCQUFxQixFQUFFLElBQUk7Z0JBQzNCLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyw4QkFBOEIsRUFBRSxtQkFBbUIsQ0FBQztnQkFDeEUsUUFBUSxFQUFFLEtBQUs7Z0JBQ2Ysc0JBQXNCLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDN0csQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxnQkFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSx3Q0FBZ0MsQ0FBQyxDQUFDO1lBQ3hJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRWxFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGdCQUFNLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVkseUNBQWlDLENBQUMsQ0FBQztZQUNoSixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBQ2hFLE1BQU0sU0FBUyxHQUFHLGVBQWUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMzRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxHQUFHLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVsSCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxnQkFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLHVDQUErQixDQUFDLENBQUM7WUFFN0ksSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksZ0JBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7Z0JBQ25HLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBQSw2QkFBaUIsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLHVDQUErQixDQUFDLENBQUM7WUFDNUYsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFeEgsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7UUFFRCxJQUFJLGNBQWM7WUFDakIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLGNBQWMsQ0FBQyxjQUFxQztZQUN2RCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxHQUFHLDJDQUFtQyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsNENBQW9DLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDMUYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sR0FBRywwQ0FBa0MsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN2RixJQUFJLElBQUksQ0FBQyxjQUFjLFlBQVksU0FBRyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxjQUFxQixDQUFDLENBQUM7YUFDaEc7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzthQUMzQztRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsY0FBOEIsRUFBRSxLQUFhO1lBQzNELElBQUksY0FBYywwQ0FBa0MsRUFBRTtnQkFDckQsSUFBSSxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxFQUFFO29CQUNWLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDO2lCQUN2QjtnQkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzthQUNyQztpQkFBTSxJQUFJLGNBQWMsMkNBQW1DLEVBQUU7Z0JBQzdELElBQUksS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxLQUFLLEVBQUU7b0JBQ1YsS0FBSyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUM7aUJBQ3ZCO2dCQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2FBQ3JDO2lCQUFNLElBQUksY0FBYyxZQUFZLFNBQUcsRUFBRTtnQkFDekMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1FBQ0YsQ0FBQztRQUVELDhCQUE4QixDQUFDLE1BQTBCO1lBQ3hELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxhQUFhLEVBQUU7b0JBQ2xCLE1BQU0sY0FBYyxHQUFHLEtBQUssYUFBYSxHQUFHLENBQUM7b0JBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLElBQUksY0FBYyxDQUFDO29CQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLGNBQWMsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssSUFBSSxjQUFjLENBQUM7b0JBQy9DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLElBQUksY0FBYyxDQUFDO2lCQUNsRDthQUNEO1FBQ0YsQ0FBQztRQUVPLHVCQUF1QjtZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxJQUFJLENBQUMsY0FBYywwQ0FBa0MsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLHFDQUE2QixFQUFFO2dCQUNsSSxJQUFJLENBQUMsWUFBWSx3Q0FBZ0MsQ0FBQzthQUNsRDtRQUNGLENBQUM7UUFFRCxZQUFZLENBQUMsY0FBOEI7WUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsS0FBSyxjQUFjO2dCQUMxRCxjQUFjLFlBQVksU0FBRztvQkFDN0IsSUFBSSxDQUFDLGNBQWMsWUFBWSxTQUFHO29CQUNsQyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUU5QyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVPLEtBQUssQ0FBQyxNQUFNO1lBQ25CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLGlDQUF5QixDQUFDLENBQUM7WUFDdkksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsaUNBQXlCLENBQUM7WUFDbEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUscUNBQTZCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVuSyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxHQUFHLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdFLENBQUM7S0FDRCxDQUFBO0lBeEpZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBa0IvQixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDJCQUFnQixDQUFBO09BdEJOLHFCQUFxQixDQXdKakM7SUFTTSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsZUFBTTtRQWV2QyxZQUFZLE1BQW1CLEVBQVksT0FBc0IsRUFDM0Msa0JBQXdELEVBQ3RELG9CQUFxRCxFQUN4RCxpQkFBc0QsRUFDdEQsaUJBQXdEO1lBRTVFLEtBQUssRUFBRSxDQUFDO1lBTmtDLFlBQU8sR0FBUCxPQUFPLENBQWU7WUFDMUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM1Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3ZDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQVY1RCxpQkFBWSxHQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFVLENBQUMsQ0FBQztZQUM5RSxnQkFBVyxHQUFrQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUU3QyxhQUFRLEdBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3RFLFlBQU8sR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFTbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRU8sTUFBTSxDQUFDLE1BQW1CO1lBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdGLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1lBRW5GLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUVsRixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBQSw2QkFBYSxFQUFDLCtCQUFlLENBQUMsQ0FBQztnQkFDekUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUEsNkJBQWEsRUFBQywrQkFBZSxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxhQUFhLElBQUEsNkJBQWEsRUFBQyw4QkFBYyxDQUFDLEVBQUUsQ0FBQzthQUM5RTtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLENBQUM7WUFDckYsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDeEY7WUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVwRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUN2QyxJQUFJLFFBQVEsRUFBRTtnQkFDYixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsRTtRQUNGLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxlQUE0QjtZQUN6RCxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztZQUN2QyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFFUyxjQUFjLENBQUMsTUFBbUI7WUFDM0MsTUFBTSxlQUFlLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBQSx1REFBeUIsRUFBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseURBQTRCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzVKLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVELFdBQVcsQ0FBQyxPQUFlO1lBQzFCLCtJQUErSTtZQUMvSSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO2dCQUNuRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDO2FBQy9FO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUF3QjtZQUM5QixJQUFJLFNBQVMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFO2dCQUMxQixJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXpDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2FBQ3REO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUM7YUFDL0U7UUFDRixDQUFDO1FBRU8sZ0JBQWdCO1lBQ3ZCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEYsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN2QjtRQUNGLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQWE7WUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEMsQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRCxDQUFBO0lBdEhZLG9DQUFZOzJCQUFaLFlBQVk7UUFnQnRCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsK0JBQWtCLENBQUE7T0FuQlIsWUFBWSxDQXNIeEI7SUFFRCxNQUFhLG9CQUF3QixTQUFRLHNCQUFVO1FBVXRELFlBQW9CLE1BQW1CO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRFcsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQVIvQixVQUFLLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkIsaUJBQVksR0FBUSxFQUFFLENBQUM7WUFFZCw4QkFBeUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFFdEUsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUNwRSxZQUFPLEdBQTZCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBSWhFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFvQixFQUFFLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdEQUF3QyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDL0csT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsT0FBTztZQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQVksRUFBRSxZQUFvQixFQUFFLFdBQWdCO1lBQ3hELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLE1BQU0sYUFBYSxHQUE0QixFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsYUFBYSxDQUFDLElBQUksQ0FBQztnQkFDbEIsT0FBTyxFQUFFO29CQUNSLFdBQVcsRUFBRSxtQ0FBbUM7b0JBQ2hELG9CQUFvQixFQUFFLHFCQUFTLENBQUMsV0FBVyxDQUFDLG1DQUFnQixDQUFDO29CQUM3RCx1QkFBdUIsRUFBRSxJQUFJLDRCQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO29CQUN0RSxVQUFVLDREQUFvRDtpQkFDOUQ7Z0JBQ0QsS0FBSyxFQUFFO29CQUNOLGVBQWUsRUFBRSxJQUFJO29CQUNyQixXQUFXLEVBQUUsQ0FBQztvQkFDZCxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsU0FBUyxFQUFFLENBQUM7aUJBQ1o7YUFDRCxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCxTQUFTO1lBQ1IsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO0tBQ0Q7SUE3REQsb0RBNkRDIn0=