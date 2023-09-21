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
    exports.TerminalInstanceService = void 0;
    let TerminalInstanceService = class TerminalInstanceService extends lifecycle_1.Disposable {
        get onDidCreateInstance() { return this._onDidCreateInstance.event; }
        constructor(_instantiationService, _contextKeyService, _environmentService) {
            super();
            this._instantiationService = _instantiationService;
            this._contextKeyService = _contextKeyService;
            this._environmentService = _environmentService;
            this._backendRegistration = new Map();
            this._onDidCreateInstance = this._register(new event_1.Emitter());
            this._terminalShellTypeContextKey = terminalContextKey_1.TerminalContextKeys.shellType.bindTo(this._contextKeyService);
            this._terminalInRunCommandPicker = terminalContextKey_1.TerminalContextKeys.inTerminalRunCommandPicker.bindTo(this._contextKeyService);
            this._terminalSuggestWidgetVisibleContextKey = terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
            this._configHelper = _instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper);
            for (const remoteAuthority of [undefined, _environmentService.remoteAuthority]) {
                let resolve;
                const p = new Promise(r => resolve = r);
                this._backendRegistration.set(remoteAuthority, { promise: p, resolve: resolve });
            }
        }
        createInstance(config, target) {
            const shellLaunchConfig = this.convertProfileToShellLaunchConfig(config);
            const instance = this._instantiationService.createInstance(terminalInstance_1.TerminalInstance, this._terminalShellTypeContextKey, this._terminalInRunCommandPicker, this._terminalSuggestWidgetVisibleContextKey, this._configHelper, shellLaunchConfig);
            instance.target = target;
            this._onDidCreateInstance.fire(instance);
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
            let backend = platform_1.Registry.as(terminal_2.TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
            if (!backend) {
                // Ensure backend is initialized and try again
                await this._backendRegistration.get(remoteAuthority)?.promise;
                backend = platform_1.Registry.as(terminal_2.TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
            }
            return backend;
        }
        getRegisteredBackends() {
            return platform_1.Registry.as(terminal_2.TerminalExtensions.Backend).backends.values();
        }
        didRegisterBackend(remoteAuthority) {
            this._backendRegistration.get(remoteAuthority)?.resolve();
        }
    };
    exports.TerminalInstanceService = TerminalInstanceService;
    exports.TerminalInstanceService = TerminalInstanceService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService)
    ], TerminalInstanceService);
    (0, extensions_1.registerSingleton)(terminal_1.ITerminalInstanceService, TerminalInstanceService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxJbnN0YW5jZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsSW5zdGFuY2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQVN0RCxJQUFJLG1CQUFtQixLQUErQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRS9GLFlBQ3dCLHFCQUE2RCxFQUNoRSxrQkFBdUQsRUFDN0MsbUJBQTBEO1lBRXhGLEtBQUssRUFBRSxDQUFDO1lBSmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQThCO1lBUmpGLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUF1RSxDQUFDO1lBRTdGLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQVN4RixJQUFJLENBQUMsNEJBQTRCLEdBQUcsd0NBQW1CLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsd0NBQW1CLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xILElBQUksQ0FBQyx1Q0FBdUMsR0FBRyx3Q0FBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLGFBQWEsR0FBRyxx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