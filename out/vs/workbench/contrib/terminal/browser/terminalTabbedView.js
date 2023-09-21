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
define(["require", "exports", "vs/base/browser/ui/splitview/splitview", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalTabsList", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/storage/common/storage", "vs/nls", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/workbench/services/hover/browser/hover"], function (require, exports, splitview_1, lifecycle_1, configuration_1, instantiation_1, terminal_1, terminalTabsList_1, platform_1, dom, canIUse_1, notification_1, actions_1, actions_2, contextkey_1, contextView_1, storage_1, nls_1, terminalContextMenu_1, terminalContextKey_1, terminalTooltip_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTabbedView = void 0;
    const $ = dom.$;
    var CssClass;
    (function (CssClass) {
        CssClass["ViewIsVertical"] = "terminal-side-view";
    })(CssClass || (CssClass = {}));
    var WidthConstants;
    (function (WidthConstants) {
        WidthConstants[WidthConstants["StatusIcon"] = 30] = "StatusIcon";
        WidthConstants[WidthConstants["SplitAnnotation"] = 30] = "SplitAnnotation";
    })(WidthConstants || (WidthConstants = {}));
    let TerminalTabbedView = class TerminalTabbedView extends lifecycle_1.Disposable {
        constructor(parentElement, _terminalService, _terminalGroupService, _instantiationService, _notificationService, _contextMenuService, _configurationService, menuService, _storageService, contextKeyService, _hoverService) {
            super();
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._instantiationService = _instantiationService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._configurationService = _configurationService;
            this._storageService = _storageService;
            this._hoverService = _hoverService;
            this._cancelContextMenu = false;
            this._tabContainer = $('.tabs-container');
            const tabListContainer = $('.tabs-list-container');
            this._tabListElement = $('.tabs-list');
            tabListContainer.appendChild(this._tabListElement);
            this._tabContainer.appendChild(tabListContainer);
            this._instanceMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalInstanceContext, contextKeyService));
            this._tabsListMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalTabContext, contextKeyService));
            this._tabsListEmptyMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalTabEmptyAreaContext, contextKeyService));
            this._tabList = this._register(this._instantiationService.createInstance(terminalTabsList_1.TerminalTabList, this._tabListElement));
            const terminalOuterContainer = $('.terminal-outer-container');
            this._terminalContainer = $('.terminal-groups-container');
            terminalOuterContainer.appendChild(this._terminalContainer);
            this._terminalService.setContainers(parentElement, this._terminalContainer);
            this._terminalIsTabsNarrowContextKey = terminalContextKey_1.TerminalContextKeys.tabsNarrow.bindTo(contextKeyService);
            this._terminalTabsFocusContextKey = terminalContextKey_1.TerminalContextKeys.tabsFocus.bindTo(contextKeyService);
            this._terminalTabsMouseContextKey = terminalContextKey_1.TerminalContextKeys.tabsMouse.bindTo(contextKeyService);
            this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
            this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
            _configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */)) {
                    this._refreshShowTabs();
                }
                else if (e.affectsConfiguration("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */)) {
                    this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
                    this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
                    if (this._shouldShowTabs()) {
                        this._splitView.swapViews(0, 1);
                        this._removeSashListener();
                        this._addSashListener();
                        this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
                    }
                }
            });
            this._register(this._terminalGroupService.onDidChangeInstances(() => this._refreshShowTabs()));
            this._register(this._terminalGroupService.onDidChangeGroups(() => this._refreshShowTabs()));
            this._attachEventListeners(parentElement, this._terminalContainer);
            this._terminalGroupService.onDidChangePanelOrientation((orientation) => {
                this._panelOrientation = orientation;
                if (this._panelOrientation === 0 /* Orientation.VERTICAL */) {
                    this._terminalContainer.classList.add("terminal-side-view" /* CssClass.ViewIsVertical */);
                }
                else {
                    this._terminalContainer.classList.remove("terminal-side-view" /* CssClass.ViewIsVertical */);
                }
            });
            this._splitView = new splitview_1.SplitView(parentElement, { orientation: 1 /* Orientation.HORIZONTAL */, proportionalLayout: false });
            this._setupSplitView(terminalOuterContainer);
        }
        _shouldShowTabs() {
            const enabled = this._terminalService.configHelper.config.tabs.enabled;
            const hide = this._terminalService.configHelper.config.tabs.hideCondition;
            if (!enabled) {
                return false;
            }
            if (hide === 'never') {
                return true;
            }
            if (hide === 'singleTerminal' && this._terminalGroupService.instances.length > 1) {
                return true;
            }
            if (hide === 'singleGroup' && this._terminalGroupService.groups.length > 1) {
                return true;
            }
            return false;
        }
        _refreshShowTabs() {
            if (this._shouldShowTabs()) {
                if (this._splitView.length === 1) {
                    this._addTabTree();
                    this._addSashListener();
                    this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
                    this.rerenderTabs();
                }
            }
            else {
                if (this._splitView.length === 2 && !this._terminalTabsMouseContextKey.get()) {
                    this._splitView.removeView(this._tabTreeIndex);
                    if (this._plusButton) {
                        this._tabContainer.removeChild(this._plusButton);
                    }
                    this._removeSashListener();
                }
            }
        }
        _getLastListWidth() {
            const widthKey = this._panelOrientation === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
            const storedValue = this._storageService.get(widthKey, 0 /* StorageScope.PROFILE */);
            if (!storedValue || !parseInt(storedValue)) {
                // we want to use the min width by default for the vertical orientation bc
                // there is such a limited width for the terminal panel to begin w there.
                return this._panelOrientation === 0 /* Orientation.VERTICAL */ ? 46 /* TerminalTabsListSizes.NarrowViewWidth */ : 120 /* TerminalTabsListSizes.DefaultWidth */;
            }
            return parseInt(storedValue);
        }
        _handleOnDidSashReset() {
            // Calculate ideal size of list to display all text based on its contents
            let idealWidth = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = 1;
            offscreenCanvas.height = 1;
            const ctx = offscreenCanvas.getContext('2d');
            if (ctx) {
                const style = window.getComputedStyle(this._tabListElement);
                ctx.font = `${style.fontStyle} ${style.fontSize} ${style.fontFamily}`;
                const maxInstanceWidth = this._terminalGroupService.instances.reduce((p, c) => {
                    return Math.max(p, ctx.measureText(c.title + (c.description || '')).width + this._getAdditionalWidth(c));
                }, 0);
                idealWidth = Math.ceil(Math.max(maxInstanceWidth, 80 /* TerminalTabsListSizes.WideViewMinimumWidth */));
            }
            // If the size is already ideal, toggle to collapsed
            const currentWidth = Math.ceil(this._splitView.getViewSize(this._tabTreeIndex));
            if (currentWidth === idealWidth) {
                idealWidth = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
            }
            this._splitView.resizeView(this._tabTreeIndex, idealWidth);
            this._updateListWidth(idealWidth);
        }
        _getAdditionalWidth(instance) {
            // Size to include padding, icon, status icon (if any), split annotation (if any), + a little more
            const additionalWidth = 40;
            const statusIconWidth = instance.statusList.statuses.length > 0 ? 30 /* WidthConstants.StatusIcon */ : 0;
            const splitAnnotationWidth = (this._terminalGroupService.getGroupForInstance(instance)?.terminalInstances.length || 0) > 1 ? 30 /* WidthConstants.SplitAnnotation */ : 0;
            return additionalWidth + splitAnnotationWidth + statusIconWidth;
        }
        _handleOnDidSashChange() {
            const listWidth = this._splitView.getViewSize(this._tabTreeIndex);
            if (!this._width || listWidth <= 0) {
                return;
            }
            this._updateListWidth(listWidth);
        }
        _updateListWidth(width) {
            if (width < 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width >= 46 /* TerminalTabsListSizes.NarrowViewWidth */) {
                width = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
                this._splitView.resizeView(this._tabTreeIndex, width);
            }
            else if (width >= 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width < 80 /* TerminalTabsListSizes.WideViewMinimumWidth */) {
                width = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
                this._splitView.resizeView(this._tabTreeIndex, width);
            }
            this.rerenderTabs();
            const widthKey = this._panelOrientation === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
            this._storageService.store(widthKey, width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        _setupSplitView(terminalOuterContainer) {
            this._register(this._splitView.onDidSashReset(() => this._handleOnDidSashReset()));
            this._register(this._splitView.onDidSashChange(() => this._handleOnDidSashChange()));
            if (this._shouldShowTabs()) {
                this._addTabTree();
            }
            this._splitView.addView({
                element: terminalOuterContainer,
                layout: width => this._terminalGroupService.groups.forEach(tab => tab.layout(width, this._height || 0)),
                minimumSize: 120,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: () => lifecycle_1.Disposable.None,
                priority: 2 /* LayoutPriority.High */
            }, splitview_1.Sizing.Distribute, this._terminalContainerIndex);
            if (this._shouldShowTabs()) {
                this._addSashListener();
            }
        }
        _addTabTree() {
            this._splitView.addView({
                element: this._tabContainer,
                layout: width => this._tabList.layout(this._height || 0, width),
                minimumSize: 46 /* TerminalTabsListSizes.NarrowViewWidth */,
                maximumSize: 500 /* TerminalTabsListSizes.MaximumWidth */,
                onDidChange: () => lifecycle_1.Disposable.None,
                priority: 1 /* LayoutPriority.Low */
            }, splitview_1.Sizing.Distribute, this._tabTreeIndex);
            this.rerenderTabs();
        }
        rerenderTabs() {
            this._updateHasText();
            this._tabList.refresh();
        }
        _addSashListener() {
            let interval;
            this._sashDisposables = [
                this._splitView.sashes[0].onDidStart(e => {
                    interval = window.setInterval(() => {
                        this.rerenderTabs();
                    }, 100);
                }),
                this._splitView.sashes[0].onDidEnd(e => {
                    window.clearInterval(interval);
                    interval = 0;
                })
            ];
        }
        _removeSashListener() {
            if (this._sashDisposables) {
                (0, lifecycle_1.dispose)(this._sashDisposables);
                this._sashDisposables = undefined;
            }
        }
        _updateHasText() {
            const hasText = this._tabListElement.clientWidth > 63 /* TerminalTabsListSizes.MidpointViewWidth */;
            this._tabContainer.classList.toggle('has-text', hasText);
            this._terminalIsTabsNarrowContextKey.set(!hasText);
        }
        layout(width, height) {
            this._height = height;
            this._width = width;
            this._splitView.layout(width);
            if (this._shouldShowTabs()) {
                this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
            }
            this._updateHasText();
        }
        _attachEventListeners(parentDomElement, terminalContainer) {
            this._register(dom.addDisposableListener(this._tabContainer, 'mouseleave', async (event) => {
                this._terminalTabsMouseContextKey.set(false);
                this._refreshShowTabs();
                event.stopPropagation();
            }));
            this._register(dom.addDisposableListener(this._tabContainer, 'mouseenter', async (event) => {
                this._terminalTabsMouseContextKey.set(true);
                event.stopPropagation();
            }));
            this._register(dom.addDisposableListener(terminalContainer, 'mousedown', async (event) => {
                const terminal = this._terminalGroupService.activeInstance;
                if (this._terminalGroupService.instances.length === 0 || !terminal) {
                    this._cancelContextMenu = true;
                    return;
                }
                if (event.which === 2 && platform_1.isLinux) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    terminal.focus();
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'nothing') {
                        if (!event.shiftKey) {
                            this._cancelContextMenu = true;
                        }
                        return;
                    }
                    else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            (0, terminalContextMenu_1.openContextMenu)(event, terminal, this._instanceMenu, this._contextMenuService);
                            return;
                        }
                        if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                            await terminal.copySelection();
                            terminal.clearSelection();
                        }
                        else {
                            if (canIUse_1.BrowserFeatures.clipboard.readText) {
                                terminal.paste();
                            }
                            else {
                                this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                            }
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform_1.isMacintosh) {
                            setTimeout(() => {
                                terminal.clearSelection();
                            }, 0);
                        }
                        this._cancelContextMenu = true;
                    }
                }
            }));
            this._register(dom.addDisposableListener(terminalContainer, 'contextmenu', (event) => {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    this._cancelContextMenu = true;
                }
                terminalContainer.focus();
                if (!this._cancelContextMenu) {
                    (0, terminalContextMenu_1.openContextMenu)(event, this._terminalGroupService.activeInstance, this._instanceMenu, this._contextMenuService);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
            }));
            this._register(dom.addDisposableListener(this._tabContainer, 'contextmenu', (event) => {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    this._cancelContextMenu = true;
                }
                if (!this._cancelContextMenu) {
                    const emptyList = this._tabList.getFocus().length === 0;
                    if (!emptyList) {
                        this._terminalGroupService.lastAccessedMenu = 'tab-list';
                    }
                    // Put the focused item first as it's used as the first positional argument
                    const selectedInstances = this._tabList.getSelectedElements();
                    const focusedInstance = this._tabList.getFocusedElements()?.[0];
                    if (focusedInstance) {
                        selectedInstances.splice(selectedInstances.findIndex(e => e.instanceId === focusedInstance.instanceId), 1);
                        selectedInstances.unshift(focusedInstance);
                    }
                    (0, terminalContextMenu_1.openContextMenu)(event, selectedInstances, emptyList ? this._tabsListEmptyMenu : this._tabsListMenu, this._contextMenuService, emptyList ? this._getTabActions() : undefined);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
            }));
            this._register(dom.addDisposableListener(document, 'keydown', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this._register(dom.addDisposableListener(document, 'keyup', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this._register(dom.addDisposableListener(parentDomElement, 'keyup', (event) => {
                if (event.keyCode === 27) {
                    // Keep terminal open on escape
                    event.stopPropagation();
                }
            }));
            this._register(dom.addDisposableListener(this._tabContainer, dom.EventType.FOCUS_IN, () => {
                this._terminalTabsFocusContextKey.set(true);
            }));
            this._register(dom.addDisposableListener(this._tabContainer, dom.EventType.FOCUS_OUT, () => {
                this._terminalTabsFocusContextKey.set(false);
            }));
        }
        _getTabActions() {
            return [
                new actions_1.Separator(),
                this._configurationService.inspect("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */).userValue === 'left' ?
                    new actions_1.Action('moveRight', (0, nls_1.localize)('moveTabsRight', "Move Tabs Right"), undefined, undefined, async () => {
                        this._configurationService.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'right');
                    }) :
                    new actions_1.Action('moveLeft', (0, nls_1.localize)('moveTabsLeft', "Move Tabs Left"), undefined, undefined, async () => {
                        this._configurationService.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'left');
                    }),
                new actions_1.Action('hideTabs', (0, nls_1.localize)('hideTabs', "Hide Tabs"), undefined, undefined, async () => {
                    this._configurationService.updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, false);
                })
            ];
        }
        setEditable(isEditing) {
            if (!isEditing) {
                this._tabList.domFocus();
            }
            this._tabList.refresh(false);
        }
        focusTabs() {
            if (!this._shouldShowTabs()) {
                return;
            }
            this._terminalTabsFocusContextKey.set(true);
            const selected = this._tabList.getSelection();
            this._tabList.domFocus();
            if (selected) {
                this._tabList.setFocus(selected);
            }
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
                        this._focus();
                    }
                }));
                return;
            }
            this._focus();
        }
        focusHover() {
            if (this._shouldShowTabs()) {
                this._tabList.focusHover();
                return;
            }
            const instance = this._terminalGroupService.activeInstance;
            if (!instance) {
                return;
            }
            this._hoverService.showHover({
                ...(0, terminalTooltip_1.getInstanceHoverInfo)(instance),
                target: this._terminalContainer,
                trapFocus: true
            }, true);
        }
        _focus() {
            this._terminalGroupService.activeInstance?.focusWhenReady();
        }
    };
    exports.TerminalTabbedView = TerminalTabbedView;
    exports.TerminalTabbedView = TerminalTabbedView = __decorate([
        __param(1, terminal_1.ITerminalService),
        __param(2, terminal_1.ITerminalGroupService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, notification_1.INotificationService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, actions_2.IMenuService),
        __param(8, storage_1.IStorageService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, hover_1.IHoverService)
    ], TerminalTabbedView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUYWJiZWRWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFRhYmJlZFZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLElBQVcsUUFFVjtJQUZELFdBQVcsUUFBUTtRQUNsQixpREFBcUMsQ0FBQTtJQUN0QyxDQUFDLEVBRlUsUUFBUSxLQUFSLFFBQVEsUUFFbEI7SUFFRCxJQUFXLGNBR1Y7SUFIRCxXQUFXLGNBQWM7UUFDeEIsZ0VBQWUsQ0FBQTtRQUNmLDBFQUFvQixDQUFBO0lBQ3JCLENBQUMsRUFIVSxjQUFjLEtBQWQsY0FBYyxRQUd4QjtJQUVNLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUE4QmpELFlBQ0MsYUFBMEIsRUFDUixnQkFBbUQsRUFDOUMscUJBQTZELEVBQzdELHFCQUE2RCxFQUM5RCxvQkFBMkQsRUFDNUQsbUJBQXlELEVBQ3ZELHFCQUE2RCxFQUN0RSxXQUF5QixFQUN0QixlQUFpRCxFQUM5QyxpQkFBcUMsRUFDMUMsYUFBNkM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFYMkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUM3QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDN0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUMzQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3RDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFbEQsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBRWxDLGtCQUFhLEdBQWIsYUFBYSxDQUFl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