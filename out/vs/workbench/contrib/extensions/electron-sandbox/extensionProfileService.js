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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/ports", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, errors_1, event_1, lifecycle_1, ports_1, nls, commands_1, dialogs_1, extensions_1, instantiation_1, native_1, productService_1, runtimeExtensionsInput_1, runtimeExtensionsEditor_1, editorService_1, extensions_2, extensionHostProfiler_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostProfileService = void 0;
    let ExtensionHostProfileService = class ExtensionHostProfileService extends lifecycle_1.Disposable {
        get state() { return this._state; }
        get lastProfile() { return this._profile; }
        constructor(_extensionService, _editorService, _instantiationService, _nativeHostService, _dialogService, _statusbarService, _productService) {
            super();
            this._extensionService = _extensionService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._nativeHostService = _nativeHostService;
            this._dialogService = _dialogService;
            this._statusbarService = _statusbarService;
            this._productService = _productService;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._onDidChangeLastProfile = this._register(new event_1.Emitter());
            this.onDidChangeLastProfile = this._onDidChangeLastProfile.event;
            this._unresponsiveProfiles = new extensions_1.ExtensionIdentifierMap();
            this._state = runtimeExtensionsEditor_1.ProfileSessionState.None;
            this.profilingStatusBarIndicatorLabelUpdater = this._register(new lifecycle_1.MutableDisposable());
            this._profile = null;
            this._profileSession = null;
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            commands_1.CommandsRegistry.registerCommand('workbench.action.extensionHostProfiler.stop', () => {
                this.stopProfiling();
                this._editorService.openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { pinned: true });
            });
        }
        _setState(state) {
            if (this._state === state) {
                return;
            }
            this._state = state;
            if (this._state === runtimeExtensionsEditor_1.ProfileSessionState.Running) {
                this.updateProfilingStatusBarIndicator(true);
            }
            else if (this._state === runtimeExtensionsEditor_1.ProfileSessionState.Stopping) {
                this.updateProfilingStatusBarIndicator(false);
            }
            this._onDidChangeState.fire(undefined);
        }
        updateProfilingStatusBarIndicator(visible) {
            this.profilingStatusBarIndicatorLabelUpdater.clear();
            if (visible) {
                const indicator = {
                    name: nls.localize('status.profiler', "Extension Profiler"),
                    text: nls.localize('profilingExtensionHost', "Profiling Extension Host"),
                    showProgress: true,
                    ariaLabel: nls.localize('profilingExtensionHost', "Profiling Extension Host"),
                    tooltip: nls.localize('selectAndStartDebug', "Click to stop profiling."),
                    command: 'workbench.action.extensionHostProfiler.stop'
                };
                const timeStarted = Date.now();
                const handle = setInterval(() => {
                    this.profilingStatusBarIndicator?.update({ ...indicator, text: nls.localize('profilingExtensionHostTime', "Profiling Extension Host ({0} sec)", Math.round((new Date().getTime() - timeStarted) / 1000)), });
                }, 1000);
                this.profilingStatusBarIndicatorLabelUpdater.value = (0, lifecycle_1.toDisposable)(() => clearInterval(handle));
                if (!this.profilingStatusBarIndicator) {
                    this.profilingStatusBarIndicator = this._statusbarService.addEntry(indicator, 'status.profiler', 1 /* StatusbarAlignment.RIGHT */);
                }
                else {
                    this.profilingStatusBarIndicator.update(indicator);
                }
            }
            else {
                if (this.profilingStatusBarIndicator) {
                    this.profilingStatusBarIndicator.dispose();
                    this.profilingStatusBarIndicator = undefined;
                }
            }
        }
        async startProfiling() {
            if (this._state !== runtimeExtensionsEditor_1.ProfileSessionState.None) {
                return null;
            }
            const inspectPorts = await this._extensionService.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, true);
            if (inspectPorts.length === 0) {
                return this._dialogService.confirm({
                    type: 'info',
                    message: nls.localize('restart1', "Profile Extensions"),
                    detail: nls.localize('restart2', "In order to profile extensions a restart is required. Do you want to restart '{0}' now?", this._productService.nameLong),
                    primaryButton: nls.localize({ key: 'restart3', comment: ['&& denotes a mnemonic'] }, "&&Restart")
                }).then(res => {
                    if (res.confirmed) {
                        this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${(0, ports_1.randomPort)()}`] });
                    }
                });
            }
            if (inspectPorts.length > 1) {
                // TODO
                console.warn(`There are multiple extension hosts available for profiling. Picking the first one...`);
            }
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Starting);
            return this._instantiationService.createInstance(extensionHostProfiler_1.ExtensionHostProfiler, inspectPorts[0]).start().then((value) => {
                this._profileSession = value;
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Running);
            }, (err) => {
                (0, errors_1.onUnexpectedError)(err);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
        }
        stopProfiling() {
            if (this._state !== runtimeExtensionsEditor_1.ProfileSessionState.Running || !this._profileSession) {
                return;
            }
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Stopping);
            this._profileSession.stop().then((result) => {
                this._setLastProfile(result);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            }, (err) => {
                (0, errors_1.onUnexpectedError)(err);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
            this._profileSession = null;
        }
        _setLastProfile(profile) {
            this._profile = profile;
            this._onDidChangeLastProfile.fire(undefined);
        }
        getUnresponsiveProfile(extensionId) {
            return this._unresponsiveProfiles.get(extensionId);
        }
        setUnresponsiveProfile(extensionId, profile) {
            this._unresponsiveProfiles.set(extensionId, profile);
            this._setLastProfile(profile);
        }
    };
    exports.ExtensionHostProfileService = ExtensionHostProfileService;
    exports.ExtensionHostProfileService = ExtensionHostProfileService = __decorate([
        __param(0, extensions_2.IExtensionService),
        __param(1, editorService_1.IEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, native_1.INativeHostService),
        __param(4, dialogs_1.IDialogService),
        __param(5, statusbar_1.IStatusbarService),
        __param(6, productService_1.IProductService)
    ], ExtensionHostProfileService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUHJvZmlsZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uUHJvZmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBa0IxRCxJQUFXLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQVcsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFbEQsWUFDb0IsaUJBQXFELEVBQ3hELGNBQStDLEVBQ3hDLHFCQUE2RCxFQUNoRSxrQkFBdUQsRUFDM0QsY0FBK0MsRUFDNUMsaUJBQXFELEVBQ3ZELGVBQWlEO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBUjRCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDdkMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUMxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUF4QmxELHNCQUFpQixHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN4RSxxQkFBZ0IsR0FBZ0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUU1RCw0QkFBdUIsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENB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