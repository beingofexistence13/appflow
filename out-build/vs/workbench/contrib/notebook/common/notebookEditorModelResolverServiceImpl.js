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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/services/extensions/common/extensions", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/map", "vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/base/common/network", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/base/common/types", "vs/base/common/cancellation", "vs/platform/configuration/common/configuration"], function (require, exports, instantiation_1, uri_1, notebookCommon_1, notebookEditorModel_1, lifecycle_1, notebookService_1, log_1, event_1, extensions_1, uriIdentity_1, map_1, fileWorkingCopyManager_1, network_1, notebookProvider_1, types_1, cancellation_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7Eb = void 0;
    let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends lifecycle_1.$oc {
        constructor(r, s, t, u) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.f = new lifecycle_1.$jc();
            this.g = new Map();
            this.h = new Map();
            this.j = new event_1.$fd();
            this.onDidSaveNotebook = this.j.event;
            this.m = new event_1.$fd();
            this.onDidChangeDirty = this.m.event;
            this.n = new map_1.$zi();
            this.q = new Set();
        }
        dispose() {
            this.f.dispose();
            this.j.dispose();
            this.m.dispose();
            (0, lifecycle_1.$fc)(this.h.values());
            (0, lifecycle_1.$fc)(this.g.values());
        }
        isDirty(resource) {
            return this.n.get(resource) ?? false;
        }
        async b(key, viewType, hasAssociatedFilePath) {
            // Untrack as being disposed
            this.q.delete(key);
            const uri = uri_1.URI.parse(key);
            const workingCopyTypeId = notebookCommon_1.$8H.create(viewType);
            let workingCopyManager = this.g.get(workingCopyTypeId);
            if (!workingCopyManager) {
                const factory = new notebookEditorModel_1.$bsb(viewType, this.s, this.u);
                workingCopyManager = this.r.createInstance(fileWorkingCopyManager_1.$$rb, workingCopyTypeId, factory, factory);
                this.g.set(workingCopyTypeId, workingCopyManager);
            }
            const model = this.r.createInstance(notebookEditorModel_1.$_rb, uri, hasAssociatedFilePath, viewType, workingCopyManager);
            const result = await model.load();
            // Whenever a notebook model is dirty we automatically reference it so that
            // we can ensure that at least one reference exists. That guarantees that
            // a model with unsaved changes is never disposed.
            let onDirtyAutoReference;
            this.h.set(result, (0, lifecycle_1.$hc)(result.onDidSave(() => this.j.fire(result.resource)), result.onDidChangeDirty(() => {
                const isDirty = result.isDirty();
                this.n.set(result.resource, isDirty);
                // isDirty -> add reference
                // !isDirty -> free reference
                if (isDirty && !onDirtyAutoReference) {
                    onDirtyAutoReference = this.acquire(key, viewType);
                }
                else if (onDirtyAutoReference) {
                    onDirtyAutoReference.dispose();
                    onDirtyAutoReference = undefined;
                }
                this.m.fire(result);
            }), (0, lifecycle_1.$ic)(() => onDirtyAutoReference?.dispose())));
            return result;
        }
        c(key, object) {
            this.q.add(key);
            (async () => {
                try {
                    const model = await object;
                    if (!this.q.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    if (model instanceof notebookEditorModel_1.$_rb) {
                        await model.canDispose();
                    }
                    if (!this.q.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    // Finally we can dispose the model
                    this.h.get(model)?.dispose();
                    this.h.delete(model);
                    model.dispose();
                }
                catch (err) {
                    this.t.error('FAILED to destory notebook', err);
                }
                finally {
                    this.q.delete(key); // Untrack as being disposed
                }
            })();
        }
    };
    NotebookModelReferenceCollection = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notebookService_1.$ubb),
        __param(2, log_1.$5i),
        __param(3, configuration_1.$8h)
    ], NotebookModelReferenceCollection);
    let $7Eb = class $7Eb {
        constructor(instantiationService, c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.b = new event_1.$hd();
            this.onWillFailWithConflict = this.b.event;
            this.a = instantiationService.createInstance(NotebookModelReferenceCollection);
            this.onDidSaveNotebook = this.a.onDidSaveNotebook;
            this.onDidChangeDirty = this.a.onDidChangeDirty;
        }
        dispose() {
            this.a.dispose();
        }
        isDirty(resource) {
            return this.a.isDirty(resource);
        }
        async resolve(arg0, viewType) {
            let resource;
            let hasAssociatedFilePath = false;
            if (uri_1.URI.isUri(arg0)) {
                resource = arg0;
            }
            else {
                if (!arg0.untitledResource) {
                    const info = this.c.getContributedNotebookType((0, types_1.$uf)(viewType));
                    if (!info) {
                        throw new Error('UNKNOWN view type: ' + viewType);
                    }
                    const suffix = notebookProvider_1.$tbb.possibleFileEnding(info.selectors) ?? '';
                    for (let counter = 1;; counter++) {
                        const candidate = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: viewType });
                        if (!this.c.getNotebookTextModel(candidate)) {
                            resource = candidate;
                            break;
                        }
                    }
                }
                else if (arg0.untitledResource.scheme === network_1.Schemas.untitled) {
                    resource = arg0.untitledResource;
                }
                else {
                    resource = arg0.untitledResource.with({ scheme: network_1.Schemas.untitled });
                    hasAssociatedFilePath = true;
                }
            }
            if (resource.scheme === notebookCommon_1.CellUri.scheme) {
                throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${resource.toString()}`);
            }
            resource = this.e.asCanonicalUri(resource);
            const existingViewType = this.c.getNotebookTextModel(resource)?.viewType;
            if (!viewType) {
                if (existingViewType) {
                    viewType = existingViewType;
                }
                else {
                    await this.d.whenInstalledExtensionsRegistered();
                    const providers = this.c.getContributedNotebookTypes(resource);
                    const exclusiveProvider = providers.find(provider => provider.exclusive);
                    viewType = exclusiveProvider?.id || providers[0]?.id;
                }
            }
            if (!viewType) {
                throw new Error(`Missing viewType for '${resource}'`);
            }
            if (existingViewType && existingViewType !== viewType) {
                await this.b.fireAsync({ resource, viewType }, cancellation_1.CancellationToken.None);
                // check again, listener should have done cleanup
                const existingViewType2 = this.c.getNotebookTextModel(resource)?.viewType;
                if (existingViewType2 && existingViewType2 !== viewType) {
                    throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
                }
            }
            const reference = this.a.acquire(resource.toString(), viewType, hasAssociatedFilePath);
            try {
                const model = await reference.object;
                return {
                    object: model,
                    dispose() { reference.dispose(); }
                };
            }
            catch (err) {
                reference.dispose();
                throw err;
            }
        }
    };
    exports.$7Eb = $7Eb;
    exports.$7Eb = $7Eb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, notebookService_1.$ubb),
        __param(2, extensions_1.$MF),
        __param(3, uriIdentity_1.$Ck)
    ], $7Eb);
});
//# sourceMappingURL=notebookEditorModelResolverServiceImpl.js.map