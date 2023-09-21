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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/symbols", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/browser/widgets/widgetManager"], function (require, exports, async_1, errors_1, lifecycle_1, symbols_1, instantiation_1, terminalCapabilityStore_1, terminalExtensions_1, widgetManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DKb = exports.$CKb = void 0;
    let $CKb = class $CKb extends lifecycle_1.$kc {
        get xterm() {
            return this.c;
        }
        constructor(c, options, instantiationService) {
            super();
            this.c = c;
            this.a = this.B(new widgetManager_1.$AKb());
            this.capabilities = new terminalCapabilityStore_1.$eib();
            this.b = new Map();
            this.B(c);
            // Initialize contributions
            const contributionDescs = terminalExtensions_1.TerminalExtensionsRegistry.getTerminalContributions();
            for (const desc of contributionDescs) {
                if (this.b.has(desc.id)) {
                    (0, errors_1.$Y)(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                    continue;
                }
                if (desc.canRunInDetachedTerminals === false) {
                    continue;
                }
                let contribution;
                try {
                    contribution = instantiationService.createInstance(desc.ctor, this, options.processInfo, this.a);
                    this.b.set(desc.id, contribution);
                    this.B(contribution);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
            }
            // xterm is already by the time DetachedTerminal is created, so trigger everything
            // on the next microtask, allowing the caller to do any extra initialization
            this.B(new async_1.$Dg(symbols_1.$cd)).trigger(() => {
                for (const contr of this.b.values()) {
                    contr.xtermReady?.(this.c);
                }
            });
        }
        attachToElement(container, options) {
            const screenElement = this.c.attachToElement(container, options);
            this.a.attachToElement(screenElement);
        }
    };
    exports.$CKb = $CKb;
    exports.$CKb = $CKb = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $CKb);
    /**
     * Implements {@link ITerminalProcessInfo} for a detached terminal where most
     * properties are stubbed. Properties are mutable and can be updated by
     * the instantiator.
     */
    class $DKb {
        constructor(initialValues) {
            this.processState = 3 /* ProcessState.Running */;
            this.ptyProcessReady = Promise.resolve();
            this.initialCwd = '';
            this.shouldPersist = false;
            this.hasWrittenData = false;
            this.hasChildProcesses = false;
            this.capabilities = new terminalCapabilityStore_1.$eib();
            this.shellIntegrationNonce = '';
            Object.assign(this, initialValues);
        }
    }
    exports.$DKb = $DKb;
});
//# sourceMappingURL=detachedTerminal.js.map