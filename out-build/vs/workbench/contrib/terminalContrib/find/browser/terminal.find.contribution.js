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
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/find/browser/terminal.find.contribution", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/search/browser/searchActionsFind", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget"], function (require, exports, lazy_1, lifecycle_1, nls_1, contextkey_1, instantiation_1, searchActionsFind_1, terminal_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1, terminalFindWidget_1) {
    "use strict";
    var TerminalFindContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let TerminalFindContribution = class TerminalFindContribution extends lifecycle_1.$kc {
        static { TerminalFindContribution_1 = this; }
        static { this.ID = 'terminal.find'; }
        static get(instance) {
            return instance.getContribution(TerminalFindContribution_1.ID);
        }
        get findWidget() { return this.a.value; }
        constructor(f, processManager, widgetManager, instantiationService, terminalService) {
            super();
            this.f = f;
            this.a = new lazy_1.$T(() => {
                const findWidget = instantiationService.createInstance(terminalFindWidget_1.$BWb, this.f);
                // Track focus and set state so we can force the scroll bar to be visible
                findWidget.focusTracker.onDidFocus(() => {
                    this.f.forceScrollbarVisibility();
                    terminalService.setActiveInstance(this.f);
                });
                findWidget.focusTracker.onDidBlur(() => {
                    this.f.resetScrollbarVisibility();
                });
                this.f.domElement.appendChild(findWidget.getDomNode());
                if (this.b) {
                    findWidget.layout(this.b.width);
                }
                return findWidget;
            });
        }
        layout(xterm, dimension) {
            this.b = dimension;
            this.a.rawValue?.layout(dimension.width);
        }
        xtermReady(xterm) {
            this.B(xterm.onDidChangeFindResults(() => this.a.rawValue?.updateResultCount()));
        }
        dispose() {
            super.dispose();
            this.a.rawValue?.dispose();
        }
    };
    TerminalFindContribution = TerminalFindContribution_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, terminal_1.$Mib)
    ], TerminalFindContribution);
    (0, terminalExtensions_1.$BKb)(TerminalFindContribution.ID, TerminalFindContribution);
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.focusFind" /* TerminalCommandId.FindFocus */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Focus Find' },
        keybinding: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.findFocus, terminalContextKey_1.TerminalContextKeys.focus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            TerminalFindContribution.get(activeInstance)?.findWidget.reveal();
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
        title: { value: (0, nls_1.localize)(1, null), original: 'Hide Find' },
        keybinding: {
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
            when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findVisible),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            TerminalFindContribution.get(activeInstance)?.findWidget.hide();
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
        title: { value: (0, nls_1.localize)(2, null), original: 'Toggle Find Using Regex' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
            when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ isRegex: !state.isRegex }, false);
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
        title: { value: (0, nls_1.localize)(3, null), original: 'Toggle Find Using Whole Word' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */ },
            when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ wholeWord: !state.wholeWord }, false);
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
        title: { value: (0, nls_1.localize)(4, null), original: 'Toggle Find Using Case Sensitive' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */ },
            when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ matchCase: !state.matchCase }, false);
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
        title: { value: (0, nls_1.localize)(5, null), original: 'Find Next' },
        keybinding: [
            {
                primary: 61 /* KeyCode.F3 */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            {
                primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                when: terminalContextKey_1.TerminalContextKeys.findInputFocus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        ],
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const widget = TerminalFindContribution.get(activeInstance)?.findWidget;
            if (widget) {
                widget.show();
                widget.find(false);
            }
        }
    });
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
        title: { value: (0, nls_1.localize)(6, null), original: 'Find Previous' },
        keybinding: [
            {
                primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                when: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            {
                primary: 3 /* KeyCode.Enter */,
                when: terminalContextKey_1.TerminalContextKeys.findInputFocus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        ],
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const widget = TerminalFindContribution.get(activeInstance)?.findWidget;
            if (widget) {
                widget.show();
                widget.find(true);
            }
        }
    });
    // Global workspace file search
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.searchWorkspace" /* TerminalCommandId.SearchWorkspace */,
        title: { value: (0, nls_1.localize)(7, null), original: 'Search Workspace' },
        keybinding: [
            {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.textSelected),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50
            }
        ],
        run: (activeInstance, c, accessor) => (0, searchActionsFind_1.$bPb)(accessor, { query: activeInstance.selection })
    });
});
//# sourceMappingURL=terminal.find.contribution.js.map