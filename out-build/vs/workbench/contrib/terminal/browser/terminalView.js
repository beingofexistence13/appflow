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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalView", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/terminal/common/terminal", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/terminal/browser/terminalTabbedView", "vs/platform/commands/common/commands", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/theme/common/theme", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/workbench/services/hover/browser/hover", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, dom, actions_1, configuration_1, contextView_1, instantiation_1, telemetry_1, themeService_1, themables_1, terminalActions_1, notification_1, terminal_1, viewPane_1, keybinding_1, contextkey_1, views_1, opener_1, actions_2, terminal_2, terminal_3, actionViewItems_1, colorRegistry_1, terminalTabbedView_1, commands_1, iconLabels_1, terminalStatusList_1, menuEntryActionViewItem_1, dropdownWithPrimaryActionViewItem_1, lifecycle_1, uri_1, theme_1, terminalIcon_1, terminalMenus_1, terminalContextKey_1, terminalTooltip_1, defaultStyles_1, event_1, hover_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Vb = void 0;
    let $1Vb = class $1Vb extends viewPane_1.$Ieb {
        get terminalTabbedView() { return this.f; }
        constructor(options, keybindingService, s, viewDescriptorService, t, L, ab, sb, Wb, themeService, telemetryService, Xb, Yb, openerService, Zb, $b, ac, bc, cc) {
            super(options, keybindingService, L, t, s, viewDescriptorService, ab, openerService, themeService, telemetryService);
            this.s = s;
            this.t = t;
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.g = false;
            this.h = false;
            this.B(this.sb.onDidRegisterProcessSupport(() => {
                this.db.fire();
            }));
            this.B(this.sb.onDidChangeInstances(() => {
                if (!this.g) {
                    return;
                }
                this.g = true;
                this.db.fire();
                if (!this.f && this.b) {
                    this.hc();
                    this.W(this.b.offsetHeight, this.b.offsetWidth);
                }
            }));
            this.m = this.B(this.Zb.createMenu(actions_2.$Ru.TerminalNewDropdownContext, this.s));
            this.n = this.B(this.Zb.createMenu(actions_2.$Ru.TerminalTabContext, this.s));
            this.B(this.$b.onDidChangeAvailableProfiles(profiles => this.lc(profiles)));
            this.r = terminalContextKey_1.TerminalContextKeys.viewShowing.bindTo(this.s);
            this.B(this.onDidChangeBodyVisibility(e => {
                if (e) {
                    this.f?.rerenderTabs();
                }
            }));
            this.B(this.t.onDidChangeConfiguration(e => {
                if (this.b && (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */) || e.affectsConfiguration("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */))) {
                    this.dc(this.b);
                }
            }));
            this.B(this.sb.onDidCreateInstance((i) => {
                i.capabilities.onDidAddCapabilityType(c => {
                    if (c === 2 /* TerminalCapability.CommandDetection */ && this.ec()) {
                        this.b?.classList.add('shell-integration');
                    }
                });
            }));
        }
        dc(container) {
            container.classList.toggle('shell-integration', this.ec());
        }
        ec() {
            const decorationsEnabled = this.t.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            return (decorationsEnabled === 'both' || decorationsEnabled === 'gutter') && this.t.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */);
        }
        fc(checkRestoredTerminals) {
            if (this.isBodyVisible() && this.sb.isProcessSupportRegistered && this.sb.connectionState === 1 /* TerminalConnectionState.Connected */) {
                const wasInitialized = this.h;
                this.h = true;
                let hideOnStartup = 'never';
                if (!wasInitialized) {
                    hideOnStartup = this.t.getValue("terminal.integrated.hideOnStartup" /* TerminalSettingId.HideOnStartup */);
                    if (hideOnStartup === 'always') {
                        this.Wb.hidePanel();
                    }
                }
                let shouldCreate = this.Wb.groups.length === 0;
                // When triggered just after reconnection, also check there are no groups that could be
                // getting restored currently
                if (checkRestoredTerminals) {
                    shouldCreate &&= this.sb.restoredGroupCount === 0;
                }
                if (!shouldCreate) {
                    return;
                }
                if (!wasInitialized) {
                    switch (hideOnStartup) {
                        case 'never':
                            this.sb.createTerminal({ location: terminal_3.TerminalLocation.Panel });
                            break;
                        case 'whenEmpty':
                            if (this.sb.restoredGroupCount === 0) {
                                this.Wb.hidePanel();
                            }
                            break;
                    }
                    return;
                }
                this.sb.createTerminal({ location: terminal_3.TerminalLocation.Panel });
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        U(container) {
            super.U(container);
            if (!this.b) {
                this.dc(container);
            }
            this.b = container;
            this.b.classList.add('integrated-terminal');
            this.a = document.createElement('style');
            this.ab.createInstance(TerminalThemeIconStyle, this.b);
            if (!this.shouldShowWelcome()) {
                this.hc();
            }
            this.b.appendChild(this.a);
            this.B(this.yb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */) || e.affectsConfiguration('editor.fontFamily')) {
                    const configHelper = this.sb.configHelper;
                    if (!configHelper.configFontIsMonospace()) {
                        const choices = [{
                                label: nls.localize(0, null),
                                run: () => this.yb.updateValue("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */, 'monospace'),
                            }];
                        this.Xb.prompt(notification_1.Severity.Warning, nls.localize(1, null), choices);
                    }
                }
            }));
            this.B(this.onDidChangeBodyVisibility(async (visible) => {
                this.r.set(visible);
                if (visible) {
                    if (!this.sb.isProcessSupportRegistered) {
                        this.db.fire();
                    }
                    this.fc(false);
                    // we don't know here whether or not it should be focused, so
                    // defer focusing the panel to the focus() call
                    // to prevent overriding preserveFocus for extensions
                    this.Wb.showPanel(false);
                }
                else {
                    for (const instance of this.Wb.instances) {
                        instance.resetFocusContextKey();
                    }
                }
                this.Wb.updateVisibility();
            }));
            this.B(this.sb.onDidChangeConnectionState(() => this.fc(true)));
            this.W(this.b.offsetHeight, this.b.offsetWidth);
        }
        hc() {
            if (!this.b) {
                return;
            }
            this.f = this.Bb.createInstance(terminalTabbedView_1.$XVb, this.b);
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        W(height, width) {
            super.W(height, width);
            this.f?.layout(width, height);
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.terminal.split" /* TerminalCommandId.Split */: {
                    // Split needs to be special cased to force splitting within the panel, not the editor
                    const that = this;
                    const panelOnlySplitAction = new class extends actions_1.$gi {
                        constructor() {
                            super(action.id, action.label, action.class, action.enabled);
                            this.checked = action.checked;
                            this.tooltip = action.tooltip;
                            this.B(action);
                        }
                        async run() {
                            const instance = that.Wb.activeInstance;
                            if (instance) {
                                const newInstance = await that.sb.createTerminal({ location: { parentTerminal: instance } });
                                return newInstance?.focusWhenReady();
                            }
                            return;
                        }
                    };
                    return new actionViewItems_1.$NQ(action, panelOnlySplitAction, { icon: true, label: false, keybinding: this.kc(action) });
                }
                case "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */: {
                    return this.ab.createInstance(SwitchTerminalActionViewItem, action);
                }
                case "workbench.action.terminal.focus" /* TerminalCommandId.Focus */: {
                    if (action instanceof actions_2.$Vu) {
                        const actions = [];
                        (0, menuEntryActionViewItem_1.$A3)(this.n, undefined, actions);
                        return this.ab.createInstance(SingleTerminalTabActionViewItem, action, actions);
                    }
                }
                case "workbench.action.terminal.new" /* TerminalCommandId.New */: {
                    if (action instanceof actions_2.$Vu) {
                        const actions = (0, terminalMenus_1.$ZVb)(terminal_3.TerminalLocation.Panel, this.$b.availableProfiles, this.jc(), this.$b.contributedProfiles, this.sb, this.m);
                        this.j?.dispose();
                        this.j = new dropdownWithPrimaryActionViewItem_1.$Vqb(action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this.L, {}, this.Yb, this.Xb, this.s, this.bc, this.cc);
                        this.lc(this.$b.availableProfiles);
                        return this.j;
                    }
                }
            }
            return super.getActionViewItem(action);
        }
        jc() {
            let defaultProfileName;
            try {
                defaultProfileName = this.$b.getDefaultProfileName();
            }
            catch (e) {
                defaultProfileName = this.ac.defaultProfileName;
            }
            return defaultProfileName;
        }
        kc(action) {
            return this.Yb.lookupKeybinding(action.id)?.getLabel() ?? undefined;
        }
        lc(profiles) {
            const actions = (0, terminalMenus_1.$ZVb)(terminal_3.TerminalLocation.Panel, profiles, this.jc(), this.$b.contributedProfiles, this.sb, this.m);
            this.j?.update(actions.dropdownAction, actions.dropdownMenuActions);
        }
        focus() {
            if (this.sb.connectionState === 0 /* TerminalConnectionState.Connecting */) {
                // If the terminal is waiting to reconnect to remote terminals, then there is no TerminalInstance yet that can
                // be focused. So wait for connection to finish, then focus.
                const activeElement = document.activeElement;
                this.B(this.sb.onDidChangeConnectionState(() => {
                    // Only focus the terminal if the activeElement has not changed since focus() was called
                    // TODO hack
                    if (document.activeElement === activeElement) {
                        this.Wb.showPanel(true);
                    }
                }));
                return;
            }
            this.Wb.showPanel(true);
        }
        shouldShowWelcome() {
            this.g = !this.sb.isProcessSupportRegistered && this.sb.instances.length === 0;
            return this.g;
        }
    };
    exports.$1Vb = $1Vb;
    exports.$1Vb = $1Vb = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, contextkey_1.$3i),
        __param(3, views_1.$_E),
        __param(4, configuration_1.$8h),
        __param(5, contextView_1.$WZ),
        __param(6, instantiation_1.$Ah),
        __param(7, terminal_1.$Mib),
        __param(8, terminal_1.$Oib),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, notification_1.$Yu),
        __param(12, keybinding_1.$2D),
        __param(13, opener_1.$NT),
        __param(14, actions_2.$Su),
        __param(15, terminal_2.$GM),
        __param(16, terminal_2.$EM),
        __param(17, themeService_1.$gv),
        __param(18, accessibility_1.$1r)
    ], $1Vb);
    let SwitchTerminalActionViewItem = class SwitchTerminalActionViewItem extends actionViewItems_1.$OQ {
        constructor(action, a, h, contextViewService, terminalProfileService) {
            super(null, action, getTerminalSelectOpenItems(a, h), h.activeGroupIndex, contextViewService, defaultStyles_1.$B2, { ariaLabel: nls.localize(2, null), optionsAsChildren: true });
            this.a = a;
            this.h = h;
            this.B(a.onDidChangeInstances(() => this.s(), this));
            this.B(a.onDidChangeActiveGroup(() => this.s(), this));
            this.B(a.onDidChangeActiveInstance(() => this.s(), this));
            this.B(a.onDidChangeInstanceTitle(() => this.s(), this));
            this.B(h.onDidChangeGroups(() => this.s(), this));
            this.B(a.onDidChangeConnectionState(() => this.s(), this));
            this.B(terminalProfileService.onDidChangeAvailableProfiles(() => this.s(), this));
            this.B(a.onDidChangeInstancePrimaryStatus(() => this.s(), this));
        }
        render(container) {
            super.render(container);
            container.classList.add('switch-terminal');
            container.style.borderColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$7v);
        }
        s() {
            const options = getTerminalSelectOpenItems(this.a, this.h);
            this.setOptions(options, this.h.activeGroupIndex);
        }
    };
    SwitchTerminalActionViewItem = __decorate([
        __param(1, terminal_1.$Mib),
        __param(2, terminal_1.$Oib),
        __param(3, contextView_1.$VZ),
        __param(4, terminal_2.$GM)
    ], SwitchTerminalActionViewItem);
    function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
        let items;
        if (terminalService.connectionState === 1 /* TerminalConnectionState.Connected */) {
            items = terminalGroupService.getGroupLabels().map(label => {
                return { text: label };
            });
        }
        else {
            items = [{ text: nls.localize(3, null) }];
        }
        items.push({ text: terminalActions_1.$CVb, isDisabled: true });
        items.push({ text: terminalActions_1.$DVb });
        return items;
    }
    let SingleTerminalTabActionViewItem = class SingleTerminalTabActionViewItem extends menuEntryActionViewItem_1.$C3 {
        constructor(action, gb, keybindingService, notificationService, contextKeyService, themeService, hb, ib, contextMenuService, jb, lb, _accessibilityService) {
            super(action, {
                draggable: true,
                hoverDelegate: lb.createInstance(SingleTabHoverDelegate)
            }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.lb = lb;
            this.s = [];
            // Register listeners to update the tab
            this.B(event_1.Event.debounce(event_1.Event.any(this.hb.onDidChangeInstancePrimaryStatus, this.ib.onDidChangeActiveInstance, event_1.Event.map(this.hb.onDidChangeInstanceIcon, e => e.instance), event_1.Event.map(this.hb.onDidChangeInstanceColor, e => e.instance), this.hb.onDidChangeInstanceTitle, this.hb.onDidChangeInstanceCapability), (last, e) => {
                if (!last) {
                    last = new Set();
                }
                if (e) {
                    last.add(e);
                }
                return last;
            })(merged => {
                for (const e of merged) {
                    this.w(e);
                }
            }));
            // Clean up on dispose
            this.B((0, lifecycle_1.$ic)(() => (0, lifecycle_1.$fc)(this.s)));
        }
        async onClick(event) {
            this.ib.lastAccessedMenu = 'inline-tab';
            if (event.altKey && this.ab.alt) {
                this.jb.executeCommand(this.ab.alt.id, { target: terminal_3.TerminalLocation.Panel });
            }
            else {
                this.nb();
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        w(e) {
            // Only update if it's the active instance
            if (e && e !== this.ib.activeInstance) {
                return;
            }
            if (this.s.length === 0 && this.element && this.H) {
                // Right click opens context menu
                this.s.push(dom.$nO(this.element, dom.$3O.CONTEXT_MENU, e => {
                    if (e.button === 2) {
                        this.nb();
                        e.preventDefault();
                    }
                }));
                // Middle click kills
                this.s.push(dom.$nO(this.element, dom.$3O.AUXCLICK, e => {
                    if (e.button === 1) {
                        const instance = this.ib.activeInstance;
                        if (instance) {
                            this.hb.safeDisposeTerminal(instance);
                        }
                        e.preventDefault();
                    }
                }));
                // Drag and drop
                this.s.push(dom.$nO(this.element, dom.$3O.DRAG_START, e => {
                    const instance = this.ib.activeInstance;
                    if (e.dataTransfer && instance) {
                        e.dataTransfer.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify([instance.resource.toString()]));
                    }
                }));
            }
            if (this.H) {
                const label = this.H;
                const instance = this.ib.activeInstance;
                if (!instance) {
                    dom.$_O(label, '');
                    return;
                }
                label.classList.add('single-terminal-tab');
                let colorStyle = '';
                const primaryStatus = instance.statusList.primary;
                if (primaryStatus) {
                    const colorKey = (0, terminalStatusList_1.$mfb)(primaryStatus.severity);
                    this.X.getColorTheme();
                    const foundColor = this.X.getColorTheme().getColor(colorKey);
                    if (foundColor) {
                        colorStyle = foundColor.toString();
                    }
                }
                label.style.color = colorStyle;
                dom.$_O(label, ...(0, iconLabels_1.$xQ)(this.lb.invokeFunction(getSingleTabLabel, instance, this.hb.configHelper.config.tabs.separator, themables_1.ThemeIcon.isThemeIcon(this.bb.item.icon) ? this.bb.item.icon : undefined)));
                if (this.g) {
                    label.classList.remove(this.g);
                    this.g = undefined;
                }
                if (this.b) {
                    label.classList.remove(this.b);
                    this.b = undefined;
                }
                if (this.h) {
                    label.classList.remove(this.h);
                    label.classList.remove('terminal-uri-icon');
                    this.h = undefined;
                }
                const colorClass = (0, terminalIcon_1.$Tib)(instance);
                if (colorClass) {
                    this.b = colorClass;
                    label.classList.add(colorClass);
                }
                const uriClasses = (0, terminalIcon_1.$Xib)(instance, this.X.getColorTheme().type);
                if (uriClasses) {
                    this.h = uriClasses?.[0];
                    label.classList.add(...uriClasses);
                }
                if (this.bb.item.icon) {
                    this.g = `alt-command`;
                    label.classList.add(this.g);
                }
                this.C();
            }
        }
        nb() {
            this.Y.showContextMenu({
                getAnchor: () => this.element,
                getActions: () => this.gb,
                getActionsContext: () => this.H
            });
        }
    };
    SingleTerminalTabActionViewItem = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, notification_1.$Yu),
        __param(4, contextkey_1.$3i),
        __param(5, themeService_1.$gv),
        __param(6, terminal_1.$Mib),
        __param(7, terminal_1.$Oib),
        __param(8, contextView_1.$WZ),
        __param(9, commands_1.$Fr),
        __param(10, instantiation_1.$Ah),
        __param(11, accessibility_1.$1r)
    ], SingleTerminalTabActionViewItem);
    function getSingleTabLabel(accessor, instance, separator, icon) {
        // Don't even show the icon if there is no title as the icon would shift around when the title
        // is added
        if (!instance || !instance.title) {
            return '';
        }
        const iconId = themables_1.ThemeIcon.isThemeIcon(instance.icon) ? instance.icon.id : accessor.get(terminal_2.$EM).getDefaultIcon().id;
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
    let TerminalThemeIconStyle = class TerminalThemeIconStyle extends themeService_1.$nv {
        constructor(container, b, f, g) {
            super(b);
            this.b = b;
            this.f = f;
            this.g = g;
            this.j();
            this.a = document.createElement('style');
            container.appendChild(this.a);
            this.B((0, lifecycle_1.$ic)(() => container.removeChild(this.a)));
            this.updateStyles();
        }
        j() {
            this.B(this.f.onDidChangeInstanceIcon(() => this.updateStyles()));
            this.B(this.f.onDidChangeInstanceColor(() => this.updateStyles()));
            this.B(this.f.onDidChangeInstances(() => this.updateStyles()));
            this.B(this.g.onDidChangeGroups(() => this.updateStyles()));
        }
        updateStyles() {
            super.updateStyles();
            const colorTheme = this.b.getColorTheme();
            // TODO: add a rule collector to avoid duplication
            let css = '';
            // Add icons
            for (const instance of this.f.instances) {
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
                const iconClasses = (0, terminalIcon_1.$Xib)(instance, colorTheme.type);
                if (uri instanceof uri_1.URI && iconClasses && iconClasses.length > 1) {
                    css += (`.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon` +
                        `{background-image: ${dom.$nP(uri)};}`);
                }
            }
            // Add colors
            for (const instance of this.f.instances) {
                const colorClass = (0, terminalIcon_1.$Tib)(instance);
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
            this.a.textContent = css;
        }
    };
    TerminalThemeIconStyle = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, terminal_1.$Mib),
        __param(3, terminal_1.$Oib)
    ], TerminalThemeIconStyle);
    let SingleTabHoverDelegate = class SingleTabHoverDelegate {
        constructor(b, d, f) {
            this.b = b;
            this.d = d;
            this.f = f;
            this.a = 0;
            this.placement = 'element';
        }
        get delay() {
            return Date.now() - this.a < 200
                ? 0 // show instantly when a hover was recently shown
                : this.b.getValue('workbench.hover.delay');
        }
        showHover(options, focus) {
            const instance = this.f.activeInstance;
            if (!instance) {
                return;
            }
            const hoverInfo = (0, terminalTooltip_1.$SVb)(instance);
            return this.d.showHover({
                ...options,
                content: hoverInfo.content,
                actions: hoverInfo.actions
            }, focus);
        }
        onDidHideHover() {
            this.a = Date.now();
        }
    };
    SingleTabHoverDelegate = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, hover_1.$zib),
        __param(2, terminal_1.$Oib)
    ], SingleTabHoverDelegate);
});
//# sourceMappingURL=terminalView.js.map