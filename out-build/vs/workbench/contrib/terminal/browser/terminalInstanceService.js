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
define(["require", "exports", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/platform/terminal/common/terminal", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/base/common/event", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/registry/common/platform", "vs/workbench/services/environment/common/environmentService"], function (require, exports, terminal_1, extensions_1, lifecycle_1, terminal_2, instantiation_1, terminalInstance_1, contextkey_1, terminalConfigHelper_1, event_1, terminalContextKey_1, platform_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eWb = void 0;
    let $eWb = class $eWb extends lifecycle_1.$kc {
        get onDidCreateInstance() { return this.h.event; }
        constructor(j, m, _environmentService) {
            super();
            this.j = j;
            this.m = m;
            this._environmentService = _environmentService;
            this.g = new Map();
            this.h = this.B(new event_1.$fd());
            this.a = terminalContextKey_1.TerminalContextKeys.shellType.bindTo(this.m);
            this.b = terminalContextKey_1.TerminalContextKeys.inTerminalRunCommandPicker.bindTo(this.m);
            this.c = terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible.bindTo(this.m);
            this.f = j.createInstance(terminalConfigHelper_1.$dib);
            for (const remoteAuthority of [undefined, _environmentService.remoteAuthority]) {
                let resolve;
                const p = new Promise(r => resolve = r);
                this.g.set(remoteAuthority, { promise: p, resolve: resolve });
            }
        }
        createInstance(config, target) {
            const shellLaunchConfig = this.convertProfileToShellLaunchConfig(config);
            const instance = this.j.createInstance(terminalInstance_1.$$Vb, this.a, this.b, this.c, this.f, shellLaunchConfig);
            instance.target = target;
            this.h.fire(instance);
            return instance;
        }
        convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) {
            // Profile was provided
            if (shellLaunchConfigOrProfile && 'profileName' in shellLaunchConfigOrProfile) {
                const profile = shellLaunchConfigOrProfile;
                if (!profile.path) {
                    return shellLaunchConfigOrProfile;
                }
                return {
                    executable: profile.path,
                    args: profile.args,
                    env: profile.env,
                    icon: profile.icon,
                    color: profile.color,
                    name: profile.overrideName ? profile.profileName : undefined,
                    cwd
                };
            }
            // A shell launch config was provided
            if (shellLaunchConfigOrProfile) {
                if (cwd) {
                    shellLaunchConfigOrProfile.cwd = cwd;
                }
                return shellLaunchConfigOrProfile;
            }
            // Return empty shell launch config
            return {};
        }
        async getBackend(remoteAuthority) {
            let backend = platform_1.$8m.as(terminal_2.$Xq.Backend).getTerminalBackend(remoteAuthority);
            if (!backend) {
                // Ensure backend is initialized and try again
                await this.g.get(remoteAuthority)?.promise;
                backend = platform_1.$8m.as(terminal_2.$Xq.Backend).getTerminalBackend(remoteAuthority);
            }
            return backend;
        }
        getRegisteredBackends() {
            return platform_1.$8m.as(terminal_2.$Xq.Backend).backends.values();
        }
        didRegisterBackend(remoteAuthority) {
            this.g.get(remoteAuthority)?.resolve();
        }
    };
    exports.$eWb = $eWb;
    exports.$eWb = $eWb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, environmentService_1.$hJ)
    ], $eWb);
    (0, extensions_1.$mr)(terminal_1.$Pib, $eWb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=terminalInstanceService.js.map