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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon", "vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixBuiltinActions", "vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService", "vs/css!./media/terminalQuickFix"], function (require, exports, lifecycle_1, nls_1, extensions_1, instantiation_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1, quickFix_1, quickFixAddon_1, terminalQuickFixBuiltinActions_1, terminalQuickFixService_1) {
    "use strict";
    var TerminalQuickFixContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    // Services
    (0, extensions_1.$mr)(quickFix_1.$3kb, terminalQuickFixService_1.$fXb, 1 /* InstantiationType.Delayed */);
    // Contributions
    let TerminalQuickFixContribution = class TerminalQuickFixContribution extends lifecycle_1.$jc {
        static { TerminalQuickFixContribution_1 = this; }
        static { this.ID = 'quickFix'; }
        static get(instance) {
            return instance.getContribution(TerminalQuickFixContribution_1.ID);
        }
        get addon() { return this.a; }
        constructor(b, processManager, widgetManager, c) {
            super();
            this.b = b;
            this.c = c;
        }
        xtermReady(xterm) {
            // Create addon
            this.a = this.c.createInstance(quickFixAddon_1.$ZWb, undefined, this.b.capabilities);
            xterm.raw.loadAddon(this.a);
            // Hook up listeners
            this.add(this.a.onDidRequestRerunCommand((e) => this.b.runCommand(e.command, e.addNewLine || false)));
            // Register quick fixes
            for (const actionOption of [
                (0, terminalQuickFixBuiltinActions_1.$_Wb)(),
                (0, terminalQuickFixBuiltinActions_1.$aXb)((port, command) => this.b.freePortKillProcess(port, command)),
                (0, terminalQuickFixBuiltinActions_1.$$Wb)(),
                (0, terminalQuickFixBuiltinActions_1.$bXb)(),
                (0, terminalQuickFixBuiltinActions_1.$cXb)(),
                (0, terminalQuickFixBuiltinActions_1.$eXb)(),
                (0, terminalQuickFixBuiltinActions_1.$dXb)()
            ]) {
                this.a.registerCommandFinishedListener(actionOption);
            }
        }
    };
    TerminalQuickFixContribution = TerminalQuickFixContribution_1 = __decorate([
        __param(3, instantiation_1.$Ah)
    ], TerminalQuickFixContribution);
    (0, terminalExtensions_1.$BKb)(TerminalQuickFixContribution.ID, TerminalQuickFixContribution);
    // Actions
    (0, terminalActions_1.$IVb)({
        id: "workbench.action.terminal.showQuickFixes" /* TerminalCommandId.ShowQuickFixes */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Show Terminal Quick Fixes' },
        precondition: terminalContextKey_1.TerminalContextKeys.focus,
        keybinding: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        run: (activeInstance) => TerminalQuickFixContribution.get(activeInstance)?.addon?.showMenu()
    });
});
//# sourceMappingURL=terminal.quickFix.contribution.js.map