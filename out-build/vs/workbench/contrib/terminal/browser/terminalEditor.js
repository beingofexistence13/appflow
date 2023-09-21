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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, dom, dropdownWithPrimaryActionViewItem_1, actions_1, contextkey_1, contextView_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, terminal_1, terminalMenus_1, terminal_2, platform_1, canIUse_1, notification_1, terminalContextMenu_1, editorService_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fWb = void 0;
    let $fWb = class $fWb extends editorPane_1.$0T {
        constructor(telemetryService, themeService, storageService, r, s, u, contextKeyService, menuService, y, eb, fb, gb, hb) {
            super(terminal_1.$Sib, telemetryService, themeService, storageService);
            this.r = r;
            this.s = s;
            this.u = u;
            this.y = y;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.c = undefined;
            this.m = false;
            this.g = this.B(menuService.createMenu(actions_1.$Ru.TerminalNewDropdownContext, contextKeyService));
            this.j = this.B(menuService.createMenu(actions_1.$Ru.TerminalInstanceContext, contextKeyService));
        }
        async setInput(newInput, options, context, token) {
            this.c?.terminalInstance?.detachFromElement();
            this.c = newInput;
            await super.setInput(newInput, options, context, token);
            this.c.terminalInstance?.attachToElement(this.b);
            if (this.f) {
                this.layout(this.f);
            }
            this.c.terminalInstance?.setVisible(this.isVisible() && this.hb.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
            if (this.c.terminalInstance) {
                // since the editor does not monitor focus changes, for ex. between the terminal
                // panel and the editors, this is needed so that the active instance gets set
                // when focus changes between them.
                this.B(this.c.terminalInstance.onDidFocus(() => this.ib()));
                this.c.setCopyLaunchConfig(this.c.terminalInstance.shellLaunchConfig);
            }
        }
        clearInput() {
            super.clearInput();
            this.c?.terminalInstance?.detachFromElement();
            this.c = undefined;
        }
        ib() {
            if (!this.c?.terminalInstance) {
                return;
            }
            this.r.setActiveInstance(this.c.terminalInstance);
        }
        focus() {
            this.c?.terminalInstance?.focus();
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ab(parent) {
            this.a = parent;
            this.b = dom.$('.terminal-overflow-guard.terminal-editor');
            this.a.appendChild(this.b);
            this.kb();
        }
        kb() {
            if (!this.a) {
                return;
            }
            this.B(dom.$nO(this.a, 'mousedown', async (event) => {
                if (this.r.instances.length === 0) {
                    return;
                }
                if (event.which === 2 && platform_1.$k) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    const terminal = this.r.activeInstance;
                    terminal?.focus();
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this.u.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'nothing') {
                        if (!event.shiftKey) {
                            this.m = true;
                        }
                        return;
                    }
                    else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        const terminal = this.r.activeInstance;
                        if (!terminal) {
                            return;
                        }
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            (0, terminalContextMenu_1.$WVb)(event, this.c?.terminalInstance, this.j, this.eb);
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
                                this.fb.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.$j ? '⌘' : 'Ctrl'}+V instead.`);
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
                        this.m = true;
                    }
                }
            }));
            this.B(dom.$nO(this.a, 'contextmenu', (event) => {
                const rightClickBehavior = this.u.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this.m = false;
                    return;
                }
                else if (!this.m && rightClickBehavior !== 'copyPaste' && rightClickBehavior !== 'paste') {
                    if (!this.m) {
                        (0, terminalContextMenu_1.$WVb)(event, this.c?.terminalInstance, this.j, this.eb);
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this.m = false;
                }
            }));
        }
        layout(dimension) {
            this.c?.terminalInstance?.layout(dimension);
            this.f = dimension;
        }
        setVisible(visible, group) {
            super.setVisible(visible, group);
            this.c?.terminalInstance?.setVisible(visible && this.hb.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */: {
                    if (action instanceof actions_1.$Vu) {
                        const location = { viewColumn: editorService_1.$0C };
                        const actions = (0, terminalMenus_1.$ZVb)(location, this.gb.availableProfiles, this.lb(), this.gb.contributedProfiles, this.u, this.g);
                        const button = this.y.createInstance(dropdownWithPrimaryActionViewItem_1.$Vqb, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this.eb, {});
                        return button;
                    }
                }
            }
            return super.getActionViewItem(action);
        }
        lb() {
            let defaultProfileName;
            try {
                defaultProfileName = this.gb.getDefaultProfileName();
            }
            catch (e) {
                defaultProfileName = this.s.defaultProfileName;
            }
            return defaultProfileName;
        }
    };
    exports.$fWb = $fWb;
    exports.$fWb = $fWb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, terminal_1.$Nib),
        __param(4, terminal_2.$EM),
        __param(5, terminal_1.$Mib),
        __param(6, contextkey_1.$3i),
        __param(7, actions_1.$Su),
        __param(8, instantiation_1.$Ah),
        __param(9, contextView_1.$WZ),
        __param(10, notification_1.$Yu),
        __param(11, terminal_2.$GM),
        __param(12, layoutService_1.$Meb)
    ], $fWb);
});
//# sourceMappingURL=terminalEditor.js.map