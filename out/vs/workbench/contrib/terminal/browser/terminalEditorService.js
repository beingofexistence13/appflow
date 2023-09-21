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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/contextkey/common/contextkey", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, event_1, lifecycle_1, uri_1, contextkey_1, editor_1, instantiation_1, terminal_1, terminal_2, terminalEditorInput_1, terminalUri_1, terminalContextKey_1, editorGroupsService_1, editorService_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalEditorService = void 0;
    let TerminalEditorService = class TerminalEditorService extends lifecycle_1.Disposable {
        constructor(_editorService, _editorGroupsService, _terminalInstanceService, _instantiationService, lifecycleService, contextKeyService) {
            super();
            this._editorService = _editorService;
            this._editorGroupsService = _editorGroupsService;
            this._terminalInstanceService = _terminalInstanceService;
            this._instantiationService = _instantiationService;
            this.instances = [];
            this._activeInstanceIndex = -1;
            this._isShuttingDown = false;
            this._editorInputs = new Map();
            this._instanceDisposables = new Map();
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this.onDidDisposeInstance = this._onDidDisposeInstance.event;
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this.onDidFocusInstance = this._onDidFocusInstance.event;
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
            this._onDidChangeInstances = this._register(new event_1.Emitter());
            this.onDidChangeInstances = this._onDidChangeInstances.event;
            this._terminalEditorActive = terminalContextKey_1.TerminalContextKeys.terminalEditorActive.bindTo(contextKeyService);
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const d of this._instanceDisposables.values()) {
                    (0, lifecycle_1.dispose)(d);
                }
            }));
            this._register(lifecycleService.onWillShutdown(() => this._isShuttingDown = true));
            this._register(this._editorService.onDidActiveEditorChange(() => {
                const activeEditor = this._editorService.activeEditor;
                const instance = activeEditor instanceof terminalEditorInput_1.TerminalEditorInput ? activeEditor?.terminalInstance : undefined;
                const terminalEditorActive = !!instance && activeEditor instanceof terminalEditorInput_1.TerminalEditorInput;
                this._terminalEditorActive.set(terminalEditorActive);
                if (terminalEditorActive) {
                    activeEditor?.setGroup(this._editorService.activeEditorPane?.group);
                    this.setActiveInstance(instance);
                }
                else {
                    for (const instance of this.instances) {
                        instance.resetFocusContextKey();
                    }
                }
            }));
            this._register(this._editorService.onDidVisibleEditorsChange(() => {
                // add any terminal editors created via the editor service split command
                const knownIds = this.instances.map(i => i.instanceId);
                const terminalEditors = this._getActiveTerminalEditors();
                const unknownEditor = terminalEditors.find(input => {
                    const inputId = input instanceof terminalEditorInput_1.TerminalEditorInput ? input.terminalInstance?.instanceId : undefined;
                    if (inputId === undefined) {
                        return false;
                    }
                    return !knownIds.includes(inputId);
                });
                if (unknownEditor instanceof terminalEditorInput_1.TerminalEditorInput && unknownEditor.terminalInstance) {
                    this._editorInputs.set(unknownEditor.terminalInstance.resource.path, unknownEditor);
                    this.instances.push(unknownEditor.terminalInstance);
                }
            }));
            // Remove the terminal from the managed instances when the editor closes. This fires when
            // dragging and dropping to another editor or closing the editor via cmd/ctrl+w.
            this._register(this._editorService.onDidCloseEditor(e => {
                const instance = e.editor instanceof terminalEditorInput_1.TerminalEditorInput ? e.editor.terminalInstance : undefined;
                if (instance) {
                    const instanceIndex = this.instances.findIndex(e => e === instance);
                    if (instanceIndex !== -1) {
                        const wasActiveInstance = this.instances[instanceIndex] === this.activeInstance;
                        this._removeInstance(instance);
                        if (wasActiveInstance) {
                            this.setActiveInstance(undefined);
                        }
                    }
                }
            }));
        }
        _getActiveTerminalEditors() {
            return this._editorService.visibleEditors.filter(e => e instanceof terminalEditorInput_1.TerminalEditorInput && e.terminalInstance?.instanceId);
        }
        get activeInstance() {
            if (this.instances.length === 0 || this._activeInstanceIndex === -1) {
                return undefined;
            }
            return this.instances[this._activeInstanceIndex];
        }
        setActiveInstance(instance) {
            this._activeInstanceIndex = instance ? this.instances.findIndex(e => e === instance) : -1;
            this._onDidChangeActiveInstance.fire(this.activeInstance);
        }
        async focusActiveInstance() {
            return this.activeInstance?.focusWhenReady(true);
        }
        async openEditor(instance, editorOptions) {
            const resource = this.resolveResource(instance);
            if (resource) {
                await this._activeOpenEditorRequest?.promise;
                this._activeOpenEditorRequest = {
                    instanceId: instance.instanceId,
                    promise: this._editorService.openEditor({
                        resource,
                        description: instance.description || instance.shellLaunchConfig.type,
                        options: {
                            pinned: true,
                            forceReload: true,
                            preserveFocus: editorOptions?.preserveFocus
                        }
                    }, editorOptions?.viewColumn ?? editorService_1.ACTIVE_GROUP)
                };
                await this._activeOpenEditorRequest?.promise;
                this._activeOpenEditorRequest = undefined;
            }
        }
        resolveResource(instance) {
            const resource = instance.resource;
            const inputKey = resource.path;
            const cachedEditor = this._editorInputs.get(inputKey);
            if (cachedEditor) {
                return cachedEditor.resource;
            }
            instance.target = terminal_1.TerminalLocation.Editor;
            const input = this._instantiationService.createInstance(terminalEditorInput_1.TerminalEditorInput, resource, instance);
            this._registerInstance(inputKey, input, instance);
            return input.resource;
        }
        getInputFromResource(resource) {
            const input = this._editorInputs.get(resource.path);
            if (!input) {
                throw new Error(`Could not get input from resource: ${resource.path}`);
            }
            return input;
        }
        _registerInstance(inputKey, input, instance) {
            this._editorInputs.set(inputKey, input);
            this._instanceDisposables.set(inputKey, [
                instance.onDidFocus(this._onDidFocusInstance.fire, this._onDidFocusInstance),
                instance.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance),
                instance.capabilities.onDidAddCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
                instance.capabilities.onDidRemoveCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
            ]);
            this.instances.push(instance);
            this._onDidChangeInstances.fire();
        }
        _removeInstance(instance) {
            const inputKey = instance.resource.path;
            this._editorInputs.delete(inputKey);
            const instanceIndex = this.instances.findIndex(e => e === instance);
            if (instanceIndex !== -1) {
                this.instances.splice(instanceIndex, 1);
            }
            const disposables = this._instanceDisposables.get(inputKey);
            this._instanceDisposables.delete(inputKey);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
            }
            this._onDidChangeInstances.fire();
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.getInstanceFromResource)(this.instances, resource);
        }
        splitInstance(instanceToSplit, shellLaunchConfig = {}) {
            if (instanceToSplit.target === terminal_1.TerminalLocation.Editor) {
                // Make sure the instance to split's group is active
                const group = this._editorInputs.get(instanceToSplit.resource.path)?.group;
                if (group) {
                    this._editorGroupsService.activateGroup(group);
                }
            }
            const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Editor);
            const resource = this.resolveResource(instance);
            if (resource) {
                this._editorService.openEditor({
                    resource: uri_1.URI.revive(resource),
                    description: instance.description,
                    options: {
                        pinned: true,
                        forceReload: true
                    }
                }, editorService_1.SIDE_GROUP);
            }
            return instance;
        }
        reviveInput(deserializedInput) {
            if ('pid' in deserializedInput) {
                const newDeserializedInput = { ...deserializedInput, findRevivedId: true };
                const instance = this._terminalInstanceService.createInstance({ attachPersistentProcess: newDeserializedInput }, terminal_1.TerminalLocation.Editor);
                const input = this._instantiationService.createInstance(terminalEditorInput_1.TerminalEditorInput, instance.resource, instance);
                this._registerInstance(instance.resource.path, input, instance);
                return input;
            }
            else {
                throw new Error(`Could not revive terminal editor input, ${deserializedInput}`);
            }
        }
        detachInstance(instance) {
            const inputKey = instance.resource.path;
            const editorInput = this._editorInputs.get(inputKey);
            editorInput?.detachInstance();
            this._removeInstance(instance);
            // Don't dispose the input when shutting down to avoid layouts in the editor area
            if (!this._isShuttingDown) {
                editorInput?.dispose();
            }
        }
        async revealActiveEditor(preserveFocus) {
            const instance = this.activeInstance;
            if (!instance) {
                return;
            }
            // If there is an active openEditor call for this instance it will be revealed by that
            if (this._activeOpenEditorRequest?.instanceId === instance.instanceId) {
                return;
            }
            const editorInput = this._editorInputs.get(instance.resource.path);
            this._editorService.openEditor(editorInput, {
                pinned: true,
                forceReload: true,
                preserveFocus,
                activation: editor_1.EditorActivation.PRESERVE
            });
        }
    };
    exports.TerminalEditorService = TerminalEditorService;
    exports.TerminalEditorService = TerminalEditorService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, terminal_2.ITerminalInstanceService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, contextkey_1.IContextKeyService)
    ], TerminalEditorService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFZGl0b3JTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEVkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHNCQUFVO1FBd0JwRCxZQUNpQixjQUErQyxFQUN6QyxvQkFBMkQsRUFDdkQsd0JBQW1FLEVBQ3RFLHFCQUE2RCxFQUNqRSxnQkFBbUMsRUFDbEMsaUJBQXFDO1lBRXpELEtBQUssRUFBRSxDQUFDO1lBUHlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ3RDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDckQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQXpCckYsY0FBUyxHQUF3QixFQUFFLENBQUM7WUFDNUIseUJBQW9CLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsb0JBQWUsR0FBRyxLQUFLLENBQUM7WUFLeEIsa0JBQWEsR0FBaUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN4RSx5QkFBb0IsR0FBMkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVoRSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDakYseUJBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUNoRCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDL0UsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUM1QyxtQ0FB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