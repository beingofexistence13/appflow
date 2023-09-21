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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminalContrib/typeAhead/browser/terminalTypeAheadAddon", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, lifecycle_1, configuration_1, instantiation_1, terminalExtensions_1, terminalTypeAheadAddon_1, terminal_1) {
    "use strict";
    var TerminalTypeAheadContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let TerminalTypeAheadContribution = class TerminalTypeAheadContribution extends lifecycle_1.$jc {
        static { TerminalTypeAheadContribution_1 = this; }
        static { this.ID = 'terminal.typeAhead'; }
        static get(instance) {
            return instance.getContribution(TerminalTypeAheadContribution_1.ID);
        }
        constructor(instance, b, widgetManager, c, h) {
            super();
            this.b = b;
            this.c = c;
            this.h = h;
            this.add((0, lifecycle_1.$ic)(() => this.a?.dispose()));
        }
        xtermReady(xterm) {
            this.j(xterm.raw);
            this.add(this.c.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.localEchoEnabled" /* TerminalSettingId.LocalEchoEnabled */)) {
                    this.j(xterm.raw);
                }
            }));
            // Reset the addon when the terminal launches or relaunches
            this.add(this.b.onProcessReady(() => {
                this.a?.reset();
            }));
        }
        j(xterm) {
            const enabled = this.c.getValue(terminal_1.$vM).localEchoEnabled;
            const isRemote = !!this.b.remoteAuthority;
            if (enabled === 'off' || enabled === 'auto' && !isRemote) {
                this.a?.dispose();
                this.a = undefined;
                return;
            }
            if (this.a) {
                return;
            }
            if (enabled === 'on' || (enabled === 'auto' && isRemote)) {
                this.a = this.h.createInstance(terminalTypeAheadAddon_1.$iXb, this.b);
                xterm.loadAddon(this.a);
            }
        }
    };
    TerminalTypeAheadContribution = TerminalTypeAheadContribution_1 = __decorate([
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah)
    ], TerminalTypeAheadContribution);
    (0, terminalExtensions_1.$BKb)(TerminalTypeAheadContribution.ID, TerminalTypeAheadContribution);
});
//# sourceMappingURL=terminal.typeAhead.contribution.js.map