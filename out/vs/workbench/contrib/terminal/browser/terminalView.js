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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/terminal/common/terminal", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/terminal/browser/terminalTabbedView", "vs/platform/commands/common/commands", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/theme/common/theme", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/workbench/services/hover/browser/hover", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, dom, actions_1, configuration_1, contextView_1, instantiation_1, telemetry_1, themeService_1, themables_1, terminalActions_1, notification_1, terminal_1, viewPane_1, keybinding_1, contextkey_1, views_1, opener_1, actions_2, terminal_2, terminal_3, actionViewItems_1, colorRegistry_1, terminalTabbedView_1, commands_1, iconLabels_1, terminalStatusList_1, menuEntryActionViewItem_1, dropdownWithPrimaryActionViewItem_1, lifecycle_1, uri_1, theme_1, terminalIcon_1, terminalMenus_1, terminalContextKey_1, terminalTooltip_1, defaultStyles_1, event_1, hover_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalViewPane = void 0;
    let TerminalViewPane = class TerminalViewPane extends viewPane_1.ViewPane {
        get terminalTabbedView() { return this._terminalTabbedView; }
        constructor(options, keybindingService, _contextKeyService, viewDescriptorService, _configurationService, _contextMenuService, _instantiationService, _terminalService, _terminalGroupService, themeService, telemetryService, _notificationService, _keybindingService, openerService, _menuService, _terminalProfileService, _terminalProfileResolverService, _themeService, _accessibilityService) {
            super(options, keybindingService, _contextMenuService, _configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService);
            this._contextKeyService = _contextKeyService;
            this._configurationService = _configurationService;
            this._contextMenuService = _contextMenuService;
            this._instantiationService = _instantiationService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._notificationService = _notificationService;
            this._keybindingService = _keybindingService;
            this._menuService = _menuService;
            this._terminalProfileService = _terminalProfileService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._themeService = _themeService;
            this._accessibilityService = _accessibilityService;
            this._isWelcomeShowing = false;
            this._isInitialized = false;
            this._register(this._terminalService.onDidRegisterProcessSupport(() => {
                this._onDidChangeViewWelcomeState.fire();
            }));
            this._register(this._terminalService.onDidChangeInstances(() => {
                if (!this._isWelcomeShowing) {
                    return;
                }
                this._isWelcomeShowing = true;
                this._onDidChangeViewWelcomeState.fire();
                if (!this._terminalTabbedView && this._parentDomElement) {
                    this._createTabsView();
                    this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
                }
            }));
            this._dropdownMenu = this._register(this._menuService.createMenu(actions_2.MenuId.TerminalNewDropdownContext, this._contextKeyService));
            this._singleTabMenu = this._register(this._menuService.createMenu(actions_2.MenuId.TerminalTabContext, this._contextKeyService));
            this._register(this._terminalProfileService.onDidChangeAvailableProfiles(profiles => this._updateTabActionBar(profiles)));
            this._viewShowing = terminalContextKey_1.TerminalContextKeys.viewShowing.bindTo(this._contextKeyService);
            this._register(this.onDidChangeBodyVisibility(e => {
                if (e) {
                    this._terminalTabbedView?.rerenderTabs();
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (this._parentDomElement && (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */) || e.affectsConfiguration("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */))) {
                    this._updateForShellIntegration(this._parentDomElement);
                }
            }));
            this._register(this._terminalService.onDidCreateInstance((i) => {
                i.capabilities.onDidAddCapabilityType(c => {
                    if (c === 2 /* TerminalCapability.CommandDetection */ && this._gutterDecorationsEnabled()) {
                        this._parentDomElement?.classList.add('shell-integration');
                    }
                });
            }));
        }
        _updateForShellIntegration(container) {
            container.classList.toggle('shell-integration', this._gutterDecorationsEnabled());
        }
        _gutterDecorationsEnabled() {
            const decorationsEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            return (decorationsEnabled === 'both' || decorationsEnabled === 'gutter') && this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */);
        }
        _initializeTerminal(checkRestoredTerminals) {
            if (this.isBodyVisible() && this._terminalService.isProcessSupportRegistered && this._terminalService.connectionState === 1 /* TerminalConnectionState.Connected */) {
                const wasInitialized = this._isInitialized;
                this._isInitialized = true;
                let hideOnStartup = 'never';
                if (!wasInitialized) {
                    hideOnStartup = this._configurationService.getValue("terminal.integrated.hideOnStartup" /* TerminalSettingId.HideOnStartup */);
                    if (hideOnStartup === 'always') {
                        this._terminalGroupService.hidePanel();
                    }
                }
                let shouldCreate = this._terminalGroupService.groups.length === 0;
                // When triggered just after reconnection, also check there are no groups that could be
                // getting restored currently
                if (checkRestoredTerminals) {
                    shouldCreate &&= this._terminalService.restoredGroupCount === 0;
                }
                if (!shouldCreate) {
                    return;
                }
                if (!wasInitialized) {
                    switch (hideOnStartup) {
                        case 'never':
                            this._terminalService.createTerminal({ location: terminal_3.TerminalLocation.Panel });
                            break;
                        case 'whenEmpty':
                            if (this._terminalService.restoredGroupCount === 0) {
                                this._terminalGroupService.hidePanel();
                            }
                            break;
                    }
                    return;
                }
                this._terminalService.createTerminal({ location: terminal_3.TerminalLocation.Panel });
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        renderBody(container) {
            super.renderBody(container);
            if (!this._parentDomElement) {
                this._updateForShellIntegration(container);
            }
            this._parentDomElement = container;
            this._parentDomElement.classList.add('integrated-terminal');
            this._fontStyleElement = document.createElement('style');
            this._instantiationService.createInstance(TerminalThemeIconStyle, this._parentDomElement);
            if (!this.shouldShowWelcome()) {
                this._createTabsView();
            }
            this._parentDomElement.appendChild(this._fontStyleElement);
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */) || e.affectsConfiguration('editor.fontFamily')) {
                    const configHelper = this._terminalService.configHelper;
                    if (!configHelper.configFontIsMonospace()) {
                        const choices = [{
                                label: nls.localize('terminal.useMonospace', "Use 'monospace'"),
                                run: () => this.configurationService.updateValue("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */, 'monospace'),
                            }];
                        this._notificationService.prompt(notification_1.Severity.Warning, nls.localize('terminal.monospaceOnly', "The terminal only supports monospace fonts. Be sure to restart VS Code if this is a newly installed font."), choices);
                    }
                }
            }));
            this._register(this.onDidChangeBodyVisibility(async (visible) => {
                this._viewShowing.set(visible);
                if (visible) {
                    if (!this._terminalService.isProcessSupportRegistered) {
                        this._onDidChangeViewWelcomeState.fire();
                    }
                    this._initializeTerminal(false);
                    // we don't know here whether or not it should be focused, so
                    // defer focusing the panel to the focus() call
                    // to prevent overriding preserveFocus for extensions
                    this._terminalGroupService.showPanel(false);
                }
                else {
                    for (const instance of this._terminalGroupService.instances) {
                        instance.resetFocusContextKey();
                    }
                }
                this._terminalGroupService.updateVisibility();
            }));
            this._register(this._terminalService.onDidChangeConnectionState(() => this._initializeTerminal(true)));
            this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
        }
        _createTabsView() {
            if (!this._parentDomElement) {
                return;
            }
            this._terminalTabbedView = this.instantiationService.createInstance(terminalTabbedView_1.TerminalTabbedView, this._parentDomElement);
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._terminalTabbedView?.layout(width, height);
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.terminal.split" /* TerminalCommandId.Split */: {
                    // Split needs to be special cased to force splitting within the panel, not the editor
                    const that = this;
                    const panelOnlySplitAction = new class extends actions_1.Action {
                        constructor() {
                            super(action.id, action.label, action.class, action.enabled);
                            this.checked = action.checked;
                            this.tooltip = action.tooltip;
                            this._register(action);
                        }
                        async run() {
                            const instance = that._terminalGroupService.activeInstance;
                            if (instance) {
                                const newInstance = await that._terminalService.createTerminal({ location: { parentTerminal: instance } });
                                return newInstance?.focusWhenReady();
                            }
                            return;
                        }
                    };
                    return new actionViewItems_1.ActionViewItem(action, panelOnlySplitAction, { icon: true, label: false, keybinding: this._getKeybindingLabel(action) });
                }
                case "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */: {
                    return this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
                }
                case "workbench.action.terminal.focus" /* TerminalCommandId.Focus */: {
                    if (action instanceof actions_2.MenuItemAction) {
                        const actions = [];
                        (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this._singleTabMenu, undefined, actions);
                        return this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
                    }
                }
                case "workbench.action.terminal.new" /* TerminalCommandId.New */: {
                    if (action instanceof actions_2.MenuItemAction) {
                        const actions = (0, terminalMenus_1.getTerminalActionBarArgs)(terminal_3.TerminalLocation.Panel, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                        this._newDropdown?.dispose();
                        this._newDropdown = new dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem(action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, {}, this._keybindingService, this._notificationService, this._contextKeyService, this._themeService, this._accessibilityService);
                        this._updateTabActionBar(this._terminalProfileService.availableProfiles);
                        return this._newDropdown;
                    }
                }
            }
            return super.getActionViewItem(action);
        }
        _getDefaultProfileName() {
            let defaultProfileName;
            try {
                defaultProfileName = this._terminalProfileService.getDefaultProfileName();
            }
            catch (e) {
                defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
            }
            return defaultProfileName;
        }
        _getKeybindingLabel(action) {
            return this._keybindingService.lookupKeybinding(action.id)?.getLabel() ?? undefined;
        }
        _updateTabActionBar(profiles) {
            const actions = (0, terminalMenus_1.getTerminalActionBarArgs)(terminal_3.TerminalLocation.Panel, profiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
            this._newDropdown?.update(actions.dropdownAction, actions.dropdownMenuActions);
        }
        focus() {
            if (this._terminalService.connectionState === 0 /* TerminalConnectionState.Connecting */) {
                // If the terminal is waiting to reconnect to remote terminals, then there is no TerminalInstance yet that can
                // be focused. So wait for connection to finish, then focus.
                const activeElement = document.activeElement;
                this._register(this._terminalService.onDidChangeConnectionState(() => {
                    // Only focus the terminal if the activeElement has not changed since focus() was called
                    // TODO hack
                    if (document.activeElement === activeElement) {
                        this._terminalGroupService.showPanel(true);
                    }
                }));
                return;
            }
            this._terminalGroupService.showPanel(true);
        }
        shouldShowWelcome() {
            this._isWelcomeShowing = !this._terminalService.isProcessSupportRegistered && this._terminalService.instances.length === 0;
            return this._isWelcomeShowing;
        }
    };
    exports.TerminalViewPane = TerminalViewPane;
    exports.TerminalViewPane = TerminalViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_1.ITerminalService),
        __param(8, terminal_1.ITerminalGroupService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, notification_1.INotificationService),
        __param(12, keybinding_1.IKeybindingService),
        __param(13, opener_1.IOpenerService),
        __param(14, actions_2.IMenuService),
        __param(15, terminal_2.ITerminalProfileService),
        __param(16, terminal_2.ITerminalProfileResolverService),
        __param(17, themeService_1.IThemeService),
        __param(18, accessibility_1.IAccessibilityService)
    ], TerminalViewPane);
    let SwitchTerminalActionViewItem = class SwitchTerminalActionViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, _terminalService, _terminalGroupService, contextViewService, terminalProfileService) {
            super(null, action, getTerminalSelectOpenItems(_terminalService, _terminalGroupService), _terminalGroupService.activeGroupIndex, contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('terminals', 'Open Terminals.'), optionsAsChildren: true });
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._register(_terminalService.onDidChangeInstances(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeActiveGroup(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeActiveInstance(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeInstanceTitle(() => this._updateItems(), this));
            this._register(_terminalGroupService.onDidChangeGroups(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
            this._register(terminalProfileService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeInstancePrimaryStatus(() => this._updateItems(), this));
        }
        render(container) {
            super.render(container);
            container.classList.add('switch-terminal');
            container.style.borderColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBorder);
        }
        _updateItems() {
            const options = getTerminalSelectOpenItems(this._terminalService, this._terminalGroupService);
            this.setOptions(options, this._terminalGroupService.activeGroupIndex);
        }
    };
    SwitchTerminalActionViewItem = __decorate([
        __param(1, terminal_1.ITerminalService),
        __param(2, terminal_1.ITerminalGroupService),
        __param(3, contextView_1.IContextViewService),
        __param(4, terminal_2.ITerminalProfileService)
    ], SwitchTerminalActionViewItem);
    function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
        let items;
        if (terminalService.connectionState === 1 /* TerminalConnectionState.Connected */) {
            items = terminalGroupService.getGroupLabels().map(label => {
                return { text: label };
            });
        }
        else {
            items = [{ text: nls.localize('terminalConnectingLabel', "Starting...") }];
        }
        items.push({ text: terminalActions_1.switchTerminalActionViewItemSeparator, isDisabled: true });
        items.push({ text: terminalActions_1.switchTerminalShowTabsTitle });
        return items;
    }
    let SingleTerminalTabActionViewItem = class SingleTerminalTabActionViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        constructor(action, _actions, keybindingService, notificationService, contextKeyService, themeService, _terminalService, _terminalGroupService, contextMenuService, _commandService, _instantiationService, _accessibilityService) {
            super(action, {
                draggable: true,
                hoverDelegate: _instantiationService.createInstance(SingleTabHoverDelegate)
            }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
            this._actions = _actions;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._commandService = _commandService;
            this._instantiationService = _instantiationService;
            this._elementDisposables = [];
            // Register listeners to update the tab
            this._register(event_1.Event.debounce(event_1.Event.any(this._terminalService.onDidChangeInstancePrimaryStatus, this._terminalGroupService.onDidChangeActiveInstance, event_1.Event.map(this._terminalService.onDidChangeInstanceIcon, e => e.instance), event_1.Event.map(this._terminalService.onDidChangeInstanceColor, e => e.instance), this._terminalService.onDidChangeInstanceTitle, this._terminalService.onDidChangeInstanceCapability), (last, e) => {
                if (!last) {
                    last = new Set();
                }
                if (e) {
                    last.add(e);
                }
                return last;
            })(merged => {
                for (const e of merged) {
                    this.updateLabel(e);
                }
            }));
            // Clean up on dispose
            this._register((0, lifecycle_1.toDisposable)(() => (0, lifecycle_1.dispose)(this._elementDisposables)));
        }
        async onClick(event) {
            this._terminalGroupService.lastAccessedMenu = 'inline-tab';
            if (event.altKey && this._menuItemAction.alt) {
                this._commandService.executeCommand(this._menuItemAction.alt.id, { target: terminal_3.TerminalLocation.Panel });
            }
            else {
                this._openContextMenu();
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        updateLabel(e) {
            // Only update if it's the active instance
            if (e && e !== this._terminalGroupService.activeInstance) {
                return;
            }
            if (this._elementDisposables.length === 0 && this.element && this.label) {
                // Right click opens context menu
                this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.CONTEXT_MENU, e => {
                    if (e.button === 2) {
                        this._openContextMenu();
                        e.preventDefault();
                    }
                }));
                // Middle click kills
                this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.AUXCLICK, e => {
                    if (e.button === 1) {
                        const instance = this._terminalGroupService.activeInstance;
                        if (instance) {
                            this._terminalService.safeDisposeTerminal(instance);
                        }
                        e.preventDefault();
                    }
                }));
                // Drag and drop
                this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.DRAG_START, e => {
                    const instance = this._terminalGroupService.activeInstance;
                    if (e.dataTransfer && instance) {
                        e.dataTransfer.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify([instance.resource.toString()]));
                    }
                }));
            }
            if (this.label) {
                const label = this.label;
                const instance = this._terminalGroupService.activeInstance;
                if (!instance) {
                    dom.reset(label, '');
                    return;
                }
                label.classList.add('single-terminal-tab');
                let colorStyle = '';
                const primaryStatus = instance.statusList.primary;
                if (primaryStatus) {
                    const colorKey = (0, terminalStatusList_1.getColorForSeverity)(primaryStatus.severity);
                    this._themeService.getColorTheme();
                    const foundColor = this._themeService.getColorTheme().getColor(colorKey);
                    if (foundColor) {
                        colorStyle = foundColor.toString();
                    }
                }
                label.style.color = colorStyle;
                dom.reset(label, ...(0, iconLabels_1.renderLabelWithIcons)(this._instantiationService.invokeFunction(getSingleTabLabel, instance, this._terminalService.configHelper.config.tabs.separator, themables_1.ThemeIcon.isThemeIcon(this._commandAction.item.icon) ? this._commandAction.item.icon : undefined)));
                if (this._altCommand) {
                    label.classList.remove(this._altCommand);
                    this._altCommand = undefined;
                }
                if (this._color) {
                    label.classList.remove(this._color);
                    this._color = undefined;
                }
                if (this._class) {
                    label.classList.remove(this._class);
                    label.classList.remove('terminal-uri-icon');
                    this._class = undefined;
                }
                const colorClass = (0, terminalIcon_1.getColorClass)(instance);
                if (colorClass) {
                    this._color = colorClass;
                    label.classList.add(colorClass);
                }
                const uriClasses = (0, terminalIcon_1.getUriClasses)(instance, this._themeService.getColorTheme().type);
                if (uriClasses) {
                    this._class = uriClasses?.[0];
                    label.classList.add(...uriClasses);
                }
                if (this._commandAction.item.icon) {
                    this._altCommand = `alt-command`;
                    label.classList.add(this._altCommand);
                }
                this.updateTooltip();
            }
        }
        _openContextMenu() {
            this._contextMenuService.showContextMenu({
                getAnchor: () => this.element,
                getActions: () => this._actions,
                getActionsContext: () => this.label
            });
        }
    };
    SingleTerminalTabActionViewItem = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, notification_1.INotificationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, themeService_1.IThemeService),
        __param(6, terminal_1.ITerminalService),
        __param(7, terminal_1.ITerminalGroupService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, commands_1.ICommandService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, accessibility_1.IAccessibilityService)
    ], SingleTerminalTabActionViewItem);
    function getSingleTabLabel(accessor, instance, separator, icon) {
        // Don't even show the icon if there is no title as the icon would shift around when the title
        // is added
        if (!instance || !instance.title) {
            return '';
        }
        const iconId = themables_1.ThemeIcon.isThemeIcon(instance.icon) ? instance.icon.id : accessor.get(terminal_2.ITerminalProfileResolverService).getDefaultIcon().id;
        const label = `$(${icon?.id || iconId}) ${getSingleTabTitle(instance, separator)}`;
        const primaryStatus = instance.statusList.primary;
        if (!primaryStatus?.icon) {
            return label;
        }
        return `${label} $(${primaryStatus.icon.id})`;
    }
    function getSingleTabTitle(instance, separator) {
        if (!instance) {
            return '';
        }
        return !instance.description ? instance.title : `${instance.title} ${separator} ${instance.description}`;
    }
    let TerminalThemeIconStyle = class TerminalThemeIconStyle extends themeService_1.Themable {
        constructor(container, _themeService, _terminalService, _terminalGroupService) {
            super(_themeService);
            this._themeService = _themeService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._registerListeners();
            this._styleElement = document.createElement('style');
            container.appendChild(this._styleElement);
            this._register((0, lifecycle_1.toDisposable)(() => container.removeChild(this._styleElement)));
            this.updateStyles();
        }
        _registerListeners() {
            this._register(this._terminalService.onDidChangeInstanceIcon(() => this.updateStyles()));
            this._register(this._terminalService.onDidChangeInstanceColor(() => this.updateStyles()));
            this._register(this._terminalService.onDidChangeInstances(() => this.updateStyles()));
            this._register(this._terminalGroupService.onDidChangeGroups(() => this.updateStyles()));
        }
        updateStyles() {
            super.updateStyles();
            const colorTheme = this._themeService.getColorTheme();
            // TODO: add a rule collector to avoid duplication
            let css = '';
            // Add icons
            for (const instance of this._terminalService.instances) {
                const icon = instance.icon;
                if (!icon) {
                    continue;
                }
                let uri = undefined;
                if (icon instanceof uri_1.URI) {
                    uri = icon;
                }
                else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
                    uri = colorTheme.type === theme_1.ColorScheme.LIGHT ? icon.light : icon.dark;
                }
                const iconClasses = (0, terminalIcon_1.getUriClasses)(instance, colorTheme.type);
                if (uri instanceof uri_1.URI && iconClasses && iconClasses.length > 1) {
                    css += (`.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon` +
                        `{background-image: ${dom.asCSSUrl(uri)};}`);
                }
            }
            // Add colors
            for (const instance of this._terminalService.instances) {
                const colorClass = (0, terminalIcon_1.getColorClass)(instance);
                if (!colorClass || !instance.color) {
                    continue;
                }
                const color = colorTheme.getColor(instance.color);
                if (color) {
                    // exclude status icons (file-icon) and inline action icons (trashcan and horizontalSplit)
                    css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                        `{ color: ${color} !important; }`);
                }
            }
            this._styleElement.textContent = css;
        }
    };
    TerminalThemeIconStyle = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, terminal_1.ITerminalService),
        __param(3, terminal_1.ITerminalGroupService)
    ], TerminalThemeIconStyle);
    let SingleTabHoverDelegate = class SingleTabHoverDelegate {
        constructor(_configurationService, _hoverService, _terminalGroupService) {
            this._configurationService = _configurationService;
            this._hoverService = _hoverService;
            this._terminalGroupService = _terminalGroupService;
            this._lastHoverHideTime = 0;
            this.placement = 'element';
        }
        get delay() {
            return Date.now() - this._lastHoverHideTime < 200
                ? 0 // show instantly when a hover was recently shown
                : this._configurationService.getValue('workbench.hover.delay');
        }
        showHover(options, focus) {
            const instance = this._terminalGroupService.activeInstance;
            if (!instance) {
                return;
            }
            const hoverInfo = (0, terminalTooltip_1.getInstanceHoverInfo)(instance);
            return this._hoverService.showHover({
                ...options,
                content: hoverInfo.content,
                actions: hoverInfo.actions
            }, focus);
        }
        onDidHideHover() {
            this._lastHoverHideTime = Date.now();
        }
    };
    SingleTabHoverDelegate = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, hover_1.IHoverService),
        __param(2, terminal_1.ITerminalGroupService)
    ], SingleTabHoverDelegate);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0N6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLG1CQUFRO1FBSTdDLElBQUksa0JBQWtCLEtBQXFDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQVE3RixZQUNDLE9BQXlCLEVBQ0wsaUJBQXFDLEVBQ3JDLGtCQUF1RCxFQUNuRCxxQkFBNkMsRUFDOUMscUJBQTZELEVBQy9ELG1CQUF5RCxFQUN2RCxxQkFBNkQsRUFDbEUsZ0JBQW1ELEVBQzlDLHFCQUE2RCxFQUNyRSxZQUEyQixFQUN2QixnQkFBbUMsRUFDaEMsb0JBQTJELEVBQzdELGtCQUF1RCxFQUMzRCxhQUE2QixFQUMvQixZQUEyQyxFQUNoQyx1QkFBaUUsRUFDekQsK0JBQWlGLEVBQ25HLGFBQTZDLEVBQ3JDLHFCQUE2RDtZQUVwRixLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQWxCMUosdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUVuQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzlDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDdEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNqRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQzdCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFHN0MseUJBQW9CLEdB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