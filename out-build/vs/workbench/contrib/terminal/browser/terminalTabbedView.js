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
define(["require", "exports", "vs/base/browser/ui/splitview/splitview", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalTabsList", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/storage/common/storage", "vs/nls!vs/workbench/contrib/terminal/browser/terminalTabbedView", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/workbench/services/hover/browser/hover"], function (require, exports, splitview_1, lifecycle_1, configuration_1, instantiation_1, terminal_1, terminalTabsList_1, platform_1, dom, canIUse_1, notification_1, actions_1, actions_2, contextkey_1, contextView_1, storage_1, nls_1, terminalContextMenu_1, terminalContextKey_1, terminalTooltip_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XVb = void 0;
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
    let $XVb = class $XVb extends lifecycle_1.$kc {
        constructor(parentElement, H, I, J, L, M, N, menuService, O, contextKeyService, P) {
            super();
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.u = false;
            this.g = $('.tabs-container');
            const tabListContainer = $('.tabs-list-container');
            this.f = $('.tabs-list');
            tabListContainer.appendChild(this.f);
            this.g.appendChild(tabListContainer);
            this.w = this.B(menuService.createMenu(actions_2.$Ru.TerminalInstanceContext, contextKeyService));
            this.y = this.B(menuService.createMenu(actions_2.$Ru.TerminalTabContext, contextKeyService));
            this.z = this.B(menuService.createMenu(actions_2.$Ru.TerminalTabEmptyAreaContext, contextKeyService));
            this.h = this.B(this.J.createInstance(terminalTabsList_1.$VVb, this.f));
            const terminalOuterContainer = $('.terminal-outer-container');
            this.b = $('.terminal-groups-container');
            terminalOuterContainer.appendChild(this.b);
            this.H.setContainers(parentElement, this.b);
            this.C = terminalContextKey_1.TerminalContextKeys.tabsNarrow.bindTo(contextKeyService);
            this.D = terminalContextKey_1.TerminalContextKeys.tabsFocus.bindTo(contextKeyService);
            this.F = terminalContextKey_1.TerminalContextKeys.tabsMouse.bindTo(contextKeyService);
            this.n = this.H.configHelper.config.tabs.location === 'left' ? 0 : 1;
            this.r = this.H.configHelper.config.tabs.location === 'left' ? 1 : 0;
            N.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */) ||
                    e.affectsConfiguration("terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */)) {
                    this.R();
                }
                else if (e.affectsConfiguration("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */)) {
                    this.n = this.H.configHelper.config.tabs.location === 'left' ? 0 : 1;
                    this.r = this.H.configHelper.config.tabs.location === 'left' ? 1 : 0;
                    if (this.Q()) {
                        this.a.swapViews(0, 1);
                        this.cb();
                        this.bb();
                        this.a.resizeView(this.n, this.S());
                    }
                }
            });
            this.B(this.I.onDidChangeInstances(() => this.R()));
            this.B(this.I.onDidChangeGroups(() => this.R()));
            this.eb(parentElement, this.b);
            this.I.onDidChangePanelOrientation((orientation) => {
                this.G = orientation;
                if (this.G === 0 /* Orientation.VERTICAL */) {
                    this.b.classList.add("terminal-side-view" /* CssClass.ViewIsVertical */);
                }
                else {
                    this.b.classList.remove("terminal-side-view" /* CssClass.ViewIsVertical */);
                }
            });
            this.a = new splitview_1.$bR(parentElement, { orientation: 1 /* Orientation.HORIZONTAL */, proportionalLayout: false });
            this.Z(terminalOuterContainer);
        }
        Q() {
            const enabled = this.H.configHelper.config.tabs.enabled;
            const hide = this.H.configHelper.config.tabs.hideCondition;
            if (!enabled) {
                return false;
            }
            if (hide === 'never') {
                return true;
            }
            if (hide === 'singleTerminal' && this.I.instances.length > 1) {
                return true;
            }
            if (hide === 'singleGroup' && this.I.groups.length > 1) {
                return true;
            }
            return false;
        }
        R() {
            if (this.Q()) {
                if (this.a.length === 1) {
                    this.ab();
                    this.bb();
                    this.a.resizeView(this.n, this.S());
                    this.rerenderTabs();
                }
            }
            else {
                if (this.a.length === 2 && !this.F.get()) {
                    this.a.removeView(this.n);
                    if (this.m) {
                        this.g.removeChild(this.m);
                    }
                    this.cb();
                }
            }
        }
        S() {
            const widthKey = this.G === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
            const storedValue = this.O.get(widthKey, 0 /* StorageScope.PROFILE */);
            if (!storedValue || !parseInt(storedValue)) {
                // we want to use the min width by default for the vertical orientation bc
                // there is such a limited width for the terminal panel to begin w there.
                return this.G === 0 /* Orientation.VERTICAL */ ? 46 /* TerminalTabsListSizes.NarrowViewWidth */ : 120 /* TerminalTabsListSizes.DefaultWidth */;
            }
            return parseInt(storedValue);
        }
        U() {
            // Calculate ideal size of list to display all text based on its contents
            let idealWidth = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = 1;
            offscreenCanvas.height = 1;
            const ctx = offscreenCanvas.getContext('2d');
            if (ctx) {
                const style = window.getComputedStyle(this.f);
                ctx.font = `${style.fontStyle} ${style.fontSize} ${style.fontFamily}`;
                const maxInstanceWidth = this.I.instances.reduce((p, c) => {
                    return Math.max(p, ctx.measureText(c.title + (c.description || '')).width + this.W(c));
                }, 0);
                idealWidth = Math.ceil(Math.max(maxInstanceWidth, 80 /* TerminalTabsListSizes.WideViewMinimumWidth */));
            }
            // If the size is already ideal, toggle to collapsed
            const currentWidth = Math.ceil(this.a.getViewSize(this.n));
            if (currentWidth === idealWidth) {
                idealWidth = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
            }
            this.a.resizeView(this.n, idealWidth);
            this.Y(idealWidth);
        }
        W(instance) {
            // Size to include padding, icon, status icon (if any), split annotation (if any), + a little more
            const additionalWidth = 40;
            const statusIconWidth = instance.statusList.statuses.length > 0 ? 30 /* WidthConstants.StatusIcon */ : 0;
            const splitAnnotationWidth = (this.I.getGroupForInstance(instance)?.terminalInstances.length || 0) > 1 ? 30 /* WidthConstants.SplitAnnotation */ : 0;
            return additionalWidth + splitAnnotationWidth + statusIconWidth;
        }
        X() {
            const listWidth = this.a.getViewSize(this.n);
            if (!this.t || listWidth <= 0) {
                return;
            }
            this.Y(listWidth);
        }
        Y(width) {
            if (width < 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width >= 46 /* TerminalTabsListSizes.NarrowViewWidth */) {
                width = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
                this.a.resizeView(this.n, width);
            }
            else if (width >= 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width < 80 /* TerminalTabsListSizes.WideViewMinimumWidth */) {
                width = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
                this.a.resizeView(this.n, width);
            }
            this.rerenderTabs();
            const widthKey = this.G === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
            this.O.store(widthKey, width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        Z(terminalOuterContainer) {
            this.B(this.a.onDidSashReset(() => this.U()));
            this.B(this.a.onDidSashChange(() => this.X()));
            if (this.Q()) {
                this.ab();
            }
            this.a.addView({
                element: terminalOuterContainer,
                layout: width => this.I.groups.forEach(tab => tab.layout(width, this.s || 0)),
                minimumSize: 120,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: () => lifecycle_1.$kc.None,
                priority: 2 /* LayoutPriority.High */
            }, splitview_1.Sizing.Distribute, this.r);
            if (this.Q()) {
                this.bb();
            }
        }
        ab() {
            this.a.addView({
                element: this.g,
                layout: width => this.h.layout(this.s || 0, width),
                minimumSize: 46 /* TerminalTabsListSizes.NarrowViewWidth */,
                maximumSize: 500 /* TerminalTabsListSizes.MaximumWidth */,
                onDidChange: () => lifecycle_1.$kc.None,
                priority: 1 /* LayoutPriority.Low */
            }, splitview_1.Sizing.Distribute, this.n);
            this.rerenderTabs();
        }
        rerenderTabs() {
            this.db();
            this.h.refresh();
        }
        bb() {
            let interval;
            this.j = [
                this.a.sashes[0].onDidStart(e => {
                    interval = window.setInterval(() => {
                        this.rerenderTabs();
                    }, 100);
                }),
                this.a.sashes[0].onDidEnd(e => {
                    window.clearInterval(interval);
                    interval = 0;
                })
            ];
        }
        cb() {
            if (this.j) {
                (0, lifecycle_1.$fc)(this.j);
                this.j = undefined;
            }
        }
        db() {
            const hasText = this.f.clientWidth > 63 /* TerminalTabsListSizes.MidpointViewWidth */;
            this.g.classList.toggle('has-text', hasText);
            this.C.set(!hasText);
        }
        layout(width, height) {
            this.s = height;
            this.t = width;
            this.a.layout(width);
            if (this.Q()) {
                this.a.resizeView(this.n, this.S());
            }
            this.db();
        }
        eb(parentDomElement, terminalContainer) {
            this.B(dom.$nO(this.g, 'mouseleave', async (event) => {
                this.F.set(false);
                this.R();
                event.stopPropagation();
            }));
            this.B(dom.$nO(this.g, 'mouseenter', async (event) => {
                this.F.set(true);
                event.stopPropagation();
            }));
            this.B(dom.$nO(terminalContainer, 'mousedown', async (event) => {
                const terminal = this.I.activeInstance;
                if (this.I.instances.length === 0 || !terminal) {
                    this.u = true;
                    return;
                }
                if (event.which === 2 && platform_1.$k) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    terminal.focus();
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this.H.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'nothing') {
                        if (!event.shiftKey) {
                            this.u = true;
                        }
                        return;
                    }
                    else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            (0, terminalContextMenu_1.$WVb)(event, terminal, this.w, this.M);
                            return;
                        }
                        if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                            await terminal.copySelection();
                            terminal.clearSelection();
                        }
                        else {
                            if (canIUse_1.$bO.clipboard.readText) {
                                terminal.paste();
                            }
                            else {
                                this.L.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.$j ? '⌘' : 'Ctrl'}+V instead.`);
                            }
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform_1.$j) {
                            setTimeout(() => {
                                terminal.clearSelection();
                            }, 0);
                        }
                        this.u = true;
                    }
                }
            }));
            this.B(dom.$nO(terminalContainer, 'contextmenu', (event) => {
                const rightClickBehavior = this.H.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    this.u = true;
                }
                terminalContainer.focus();
                if (!this.u) {
                    (0, terminalContextMenu_1.$WVb)(event, this.I.activeInstance, this.w, this.M);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this.u = false;
            }));
            this.B(dom.$nO(this.g, 'contextmenu', (event) => {
                const rightClickBehavior = this.H.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    this.u = true;
                }
                if (!this.u) {
                    const emptyList = this.h.getFocus().length === 0;
                    if (!emptyList) {
                        this.I.lastAccessedMenu = 'tab-list';
                    }
                    // Put the focused item first as it's used as the first positional argument
                    const selectedInstances = this.h.getSelectedElements();
                    const focusedInstance = this.h.getFocusedElements()?.[0];
                    if (focusedInstance) {
                        selectedInstances.splice(selectedInstances.findIndex(e => e.instanceId === focusedInstance.instanceId), 1);
                        selectedInstances.unshift(focusedInstance);
                    }
                    (0, terminalContextMenu_1.$WVb)(event, selectedInstances, emptyList ? this.z : this.y, this.M, emptyList ? this.fb() : undefined);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this.u = false;
            }));
            this.B(dom.$nO(document, 'keydown', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this.B(dom.$nO(document, 'keyup', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this.B(dom.$nO(parentDomElement, 'keyup', (event) => {
                if (event.keyCode === 27) {
                    // Keep terminal open on escape
                    event.stopPropagation();
                }
            }));
            this.B(dom.$nO(this.g, dom.$3O.FOCUS_IN, () => {
                this.D.set(true);
            }));
            this.B(dom.$nO(this.g, dom.$3O.FOCUS_OUT, () => {
                this.D.set(false);
            }));
        }
        fb() {
            return [
                new actions_1.$ii(),
                this.N.inspect("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */).userValue === 'left' ?
                    new actions_1.$gi('moveRight', (0, nls_1.localize)(0, null), undefined, undefined, async () => {
                        this.N.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'right');
                    }) :
                    new actions_1.$gi('moveLeft', (0, nls_1.localize)(1, null), undefined, undefined, async () => {
                        this.N.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'left');
                    }),
                new actions_1.$gi('hideTabs', (0, nls_1.localize)(2, null), undefined, undefined, async () => {
                    this.N.updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, false);
                })
            ];
        }
        setEditable(isEditing) {
            if (!isEditing) {
                this.h.domFocus();
            }
            this.h.refresh(false);
        }
        focusTabs() {
            if (!this.Q()) {
                return;
            }
            this.D.set(true);
            const selected = this.h.getSelection();
            this.h.domFocus();
            if (selected) {
                this.h.setFocus(selected);
            }
        }
        focus() {
            if (this.H.connectionState === 0 /* TerminalConnectionState.Connecting */) {
                // If the terminal is waiting to reconnect to remote terminals, then there is no TerminalInstance yet that can
                // be focused. So wait for connection to finish, then focus.
                const activeElement = document.activeElement;
                this.B(this.H.onDidChangeConnectionState(() => {
                    // Only focus the terminal if the activeElement has not changed since focus() was called
                    // TODO hack
                    if (document.activeElement === activeElement) {
                        this.gb();
                    }
                }));
                return;
            }
            this.gb();
        }
        focusHover() {
            if (this.Q()) {
                this.h.focusHover();
                return;
            }
            const instance = this.I.activeInstance;
            if (!instance) {
                return;
            }
            this.P.showHover({
                ...(0, terminalTooltip_1.$SVb)(instance),
                target: this.b,
                trapFocus: true
            }, true);
        }
        gb() {
            this.I.activeInstance?.focusWhenReady();
        }
    };
    exports.$XVb = $XVb;
    exports.$XVb = $XVb = __decorate([
        __param(1, terminal_1.$Mib),
        __param(2, terminal_1.$Oib),
        __param(3, instantiation_1.$Ah),
        __param(4, notification_1.$Yu),
        __param(5, contextView_1.$WZ),
        __param(6, configuration_1.$8h),
        __param(7, actions_2.$Su),
        __param(8, storage_1.$Vo),
        __param(9, contextkey_1.$3i),
        __param(10, hover_1.$zib)
    ], $XVb);
});
//# sourceMappingURL=terminalTabbedView.js.map