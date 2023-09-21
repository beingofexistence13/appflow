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
    exports.$gWb = void 0;
    let $gWb = class $gWb extends lifecycle_1.$kc {
        constructor(t, u, w, y, lifecycleService, contextKeyService) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.instances = [];
            this.a = -1;
            this.b = false;
            this.g = new Map();
            this.h = new Map();
            this.j = this.B(new event_1.$fd());
            this.onDidDisposeInstance = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidFocusInstance = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeInstanceCapability = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeActiveInstance = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeInstances = this.s.event;
            this.f = terminalContextKey_1.TerminalContextKeys.terminalEditorActive.bindTo(contextKeyService);
            this.B((0, lifecycle_1.$ic)(() => {
                for (const d of this.h.values()) {
                    (0, lifecycle_1.$fc)(d);
                }
            }));
            this.B(lifecycleService.onWillShutdown(() => this.b = true));
            this.B(this.t.onDidActiveEditorChange(() => {
                const activeEditor = this.t.activeEditor;
                const instance = activeEditor instanceof terminalEditorInput_1.$Zib ? activeEditor?.terminalInstance : undefined;
                const terminalEditorActive = !!instance && activeEditor instanceof terminalEditorInput_1.$Zib;
                this.f.set(terminalEditorActive);
                if (terminalEditorActive) {
                    activeEditor?.setGroup(this.t.activeEditorPane?.group);
                    this.setActiveInstance(instance);
                }
                else {
                    for (const instance of this.instances) {
                        instance.resetFocusContextKey();
                    }
                }
            }));
            this.B(this.t.onDidVisibleEditorsChange(() => {
                // add any terminal editors created via the editor service split command
                const knownIds = this.instances.map(i => i.instanceId);
                const terminalEditors = this.z();
                const unknownEditor = terminalEditors.find(input => {
                    const inputId = input instanceof terminalEditorInput_1.$Zib ? input.terminalInstance?.instanceId : undefined;
                    if (inputId === undefined) {
                        return false;
                    }
                    return !knownIds.includes(inputId);
                });
                if (unknownEditor instanceof terminalEditorInput_1.$Zib && unknownEditor.terminalInstance) {
                    this.g.set(unknownEditor.terminalInstance.resource.path, unknownEditor);
                    this.instances.push(unknownEditor.terminalInstance);
                }
            }));
            // Remove the terminal from the managed instances when the editor closes. This fires when
            // dragging and dropping to another editor or closing the editor via cmd/ctrl+w.
            this.B(this.t.onDidCloseEditor(e => {
                const instance = e.editor instanceof terminalEditorInput_1.$Zib ? e.editor.terminalInstance : undefined;
                if (instance) {
                    const instanceIndex = this.instances.findIndex(e => e === instance);
                    if (instanceIndex !== -1) {
                        const wasActiveInstance = this.instances[instanceIndex] === this.activeInstance;
                        this.D(instance);
                        if (wasActiveInstance) {
                            this.setActiveInstance(undefined);
                        }
                    }
                }
            }));
        }
        z() {
            return this.t.visibleEditors.filter(e => e instanceof terminalEditorInput_1.$Zib && e.terminalInstance?.instanceId);
        }
        get activeInstance() {
            if (this.instances.length === 0 || this.a === -1) {
                return undefined;
            }
            return this.instances[this.a];
        }
        setActiveInstance(instance) {
            this.a = instance ? this.instances.findIndex(e => e === instance) : -1;
            this.r.fire(this.activeInstance);
        }
        async focusActiveInstance() {
            return this.activeInstance?.focusWhenReady(true);
        }
        async openEditor(instance, editorOptions) {
            const resource = this.resolveResource(instance);
            if (resource) {
                await this.c?.promise;
                this.c = {
                    instanceId: instance.instanceId,
                    promise: this.t.openEditor({
                        resource,
                        description: instance.description || instance.shellLaunchConfig.type,
                        options: {
                            pinned: true,
                            forceReload: true,
                            preserveFocus: editorOptions?.preserveFocus
                        }
                    }, editorOptions?.viewColumn ?? editorService_1.$0C)
                };
                await this.c?.promise;
                this.c = undefined;
            }
        }
        resolveResource(instance) {
            const resource = instance.resource;
            const inputKey = resource.path;
            const cachedEditor = this.g.get(inputKey);
            if (cachedEditor) {
                return cachedEditor.resource;
            }
            instance.target = terminal_1.TerminalLocation.Editor;
            const input = this.y.createInstance(terminalEditorInput_1.$Zib, resource, instance);
            this.C(inputKey, input, instance);
            return input.resource;
        }
        getInputFromResource(resource) {
            const input = this.g.get(resource.path);
            if (!input) {
                throw new Error(`Could not get input from resource: ${resource.path}`);
            }
            return input;
        }
        C(inputKey, input, instance) {
            this.g.set(inputKey, input);
            this.h.set(inputKey, [
                instance.onDidFocus(this.m.fire, this.m),
                instance.onDisposed(this.j.fire, this.j),
                instance.capabilities.onDidAddCapabilityType(() => this.n.fire(instance)),
                instance.capabilities.onDidRemoveCapabilityType(() => this.n.fire(instance)),
            ]);
            this.instances.push(instance);
            this.s.fire();
        }
        D(instance) {
            const inputKey = instance.resource.path;
            this.g.delete(inputKey);
            const instanceIndex = this.instances.findIndex(e => e === instance);
            if (instanceIndex !== -1) {
                this.instances.splice(instanceIndex, 1);
            }
            const disposables = this.h.get(inputKey);
            this.h.delete(inputKey);
            if (disposables) {
                (0, lifecycle_1.$fc)(disposables);
            }
            this.s.fire();
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.$RVb)(this.instances, resource);
        }
        splitInstance(instanceToSplit, shellLaunchConfig = {}) {
            if (instanceToSplit.target === terminal_1.TerminalLocation.Editor) {
                // Make sure the instance to split's group is active
                const group = this.g.get(instanceToSplit.resource.path)?.group;
                if (group) {
                    this.u.activateGroup(group);
                }
            }
            const instance = this.w.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Editor);
            const resource = this.resolveResource(instance);
            if (resource) {
                this.t.openEditor({
                    resource: uri_1.URI.revive(resource),
                    description: instance.description,
                    options: {
                        pinned: true,
                        forceReload: true
                    }
                }, editorService_1.$$C);
            }
            return instance;
        }
        reviveInput(deserializedInput) {
            if ('pid' in deserializedInput) {
                const newDeserializedInput = { ...deserializedInput, findRevivedId: true };
                const instance = this.w.createInstance({ attachPersistentProcess: newDeserializedInput }, terminal_1.TerminalLocation.Editor);
                const input = this.y.createInstance(terminalEditorInput_1.$Zib, instance.resource, instance);
                this.C(instance.resource.path, input, instance);
                return input;
            }
            else {
                throw new Error(`Could not revive terminal editor input, ${deserializedInput}`);
            }
        }
        detachInstance(instance) {
            const inputKey = instance.resource.path;
            const editorInput = this.g.get(inputKey);
            editorInput?.detachInstance();
            this.D(instance);
            // Don't dispose the input when shutting down to avoid layouts in the editor area
            if (!this.b) {
                editorInput?.dispose();
            }
        }
        async revealActiveEditor(preserveFocus) {
            const instance = this.activeInstance;
            if (!instance) {
                return;
            }
            // If there is an active openEditor call for this instance it will be revealed by that
            if (this.c?.instanceId === instance.instanceId) {
                return;
            }
            const editorInput = this.g.get(instance.resource.path);
            this.t.openEditor(editorInput, {
                pinned: true,
                forceReload: true,
                preserveFocus,
                activation: editor_1.EditorActivation.PRESERVE
            });
        }
    };
    exports.$gWb = $gWb;
    exports.$gWb = $gWb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, terminal_2.$Pib),
        __param(3, instantiation_1.$Ah),
        __param(4, lifecycle_2.$7y),
        __param(5, contextkey_1.$3i)
    ], $gWb);
});
//# sourceMappingURL=terminalEditorService.js.map