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
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/workbench/common/editor/textResourceEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/network", "vs/editor/common/services/resolverService", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/undoRedo/common/undoRedo", "vs/editor/common/services/modelUndoRedoParticipant", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, uri_1, instantiation_1, lifecycle_1, model_1, textResourceEditorModel_1, textfiles_1, network_1, resolverService_1, textFileEditorModel_1, files_1, extensions_1, undoRedo_1, modelUndoRedoParticipant_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jyb = void 0;
    let ResourceModelCollection = class ResourceModelCollection extends lifecycle_1.$oc {
        constructor(h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.f = new Map();
            this.g = new Set();
        }
        b(key) {
            return this.r(key);
        }
        async r(key, skipActivateProvider) {
            // Untrack as being disposed
            this.g.delete(key);
            // inMemory Schema: go through model service cache
            const resource = uri_1.URI.parse(key);
            if (resource.scheme === network_1.Schemas.inMemory) {
                const cachedModel = this.n.getModel(resource);
                if (!cachedModel) {
                    throw new Error(`Unable to resolve inMemory resource ${key}`);
                }
                const model = this.h.createInstance(textResourceEditorModel_1.$5eb, resource);
                if (this.s(model, key)) {
                    return model;
                }
            }
            // Untitled Schema: go through untitled text service
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = await this.j.untitled.resolve({ untitledResource: resource });
                if (this.s(model, key)) {
                    return model;
                }
            }
            // File or remote file: go through text file service
            if (this.m.hasProvider(resource)) {
                const model = await this.j.files.resolve(resource, { reason: 2 /* TextFileResolveReason.REFERENCE */ });
                if (this.s(model, key)) {
                    return model;
                }
            }
            // Virtual documents
            if (this.f.has(resource.scheme)) {
                await this.u(key);
                const model = this.h.createInstance(textResourceEditorModel_1.$5eb, resource);
                if (this.s(model, key)) {
                    return model;
                }
            }
            // Either unknown schema, or not yet registered, try to activate
            if (!skipActivateProvider) {
                await this.m.activateProvider(resource.scheme);
                return this.r(key, true);
            }
            throw new Error(`Unable to resolve resource ${key}`);
        }
        s(model, key) {
            if ((0, resolverService_1.$vA)(model)) {
                return true;
            }
            throw new Error(`Unable to resolve resource ${key}`);
        }
        c(key, modelPromise) {
            // untitled and inMemory are bound to a different lifecycle
            const resource = uri_1.URI.parse(key);
            if (resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.inMemory) {
                return;
            }
            // Track as being disposed before waiting for model to load
            // to handle the case that the reference is acquired again
            this.g.add(key);
            (async () => {
                try {
                    const model = await modelPromise;
                    if (!this.g.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    if (model instanceof textFileEditorModel_1.$Hyb) {
                        // text file models have conditions that prevent them
                        // from dispose, so we have to wait until we can dispose
                        await this.j.files.canDispose(model);
                    }
                    if (!this.g.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    // Finally we can dispose the model
                    model.dispose();
                }
                catch (error) {
                    // ignore
                }
                finally {
                    this.g.delete(key); // Untrack as being disposed
                }
            })();
        }
        registerTextModelContentProvider(scheme, provider) {
            let providers = this.f.get(scheme);
            if (!providers) {
                providers = [];
                this.f.set(scheme, providers);
            }
            providers.unshift(provider);
            return (0, lifecycle_1.$ic)(() => {
                const providersForScheme = this.f.get(scheme);
                if (!providersForScheme) {
                    return;
                }
                const index = providersForScheme.indexOf(provider);
                if (index === -1) {
                    return;
                }
                providersForScheme.splice(index, 1);
                if (providersForScheme.length === 0) {
                    this.f.delete(scheme);
                }
            });
        }
        hasTextModelContentProvider(scheme) {
            return this.f.get(scheme) !== undefined;
        }
        async u(key) {
            const resource = uri_1.URI.parse(key);
            const providersForScheme = this.f.get(resource.scheme) || [];
            for (const provider of providersForScheme) {
                const value = await provider.provideTextContent(resource);
                if (value) {
                    return value;
                }
            }
            throw new Error(`Unable to resolve text model content for resource ${key}`);
        }
    };
    ResourceModelCollection = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, textfiles_1.$JD),
        __param(2, files_1.$6j),
        __param(3, model_1.$yA)
    ], ResourceModelCollection);
    let $Jyb = class $Jyb extends lifecycle_1.$kc {
        get b() {
            if (!this.a) {
                this.a = this.g.createInstance(ResourceModelCollection);
            }
            return this.a;
        }
        get f() {
            if (!this.c) {
                this.c = new lifecycle_1.$pc(this.b);
            }
            return this.c;
        }
        constructor(g, h, j, m, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = undefined;
            this.c = undefined;
            this.B(new modelUndoRedoParticipant_1.$Iyb(this.m, this, this.j));
        }
        async createModelReference(resource) {
            // From this moment on, only operate on the canonical resource
            // to ensure we reduce the chance of resolving the same resource
            // with different resource forms (e.g. path casing on Windows)
            resource = this.n.asCanonicalUri(resource);
            return await this.f.acquire(resource.toString());
        }
        registerTextModelContentProvider(scheme, provider) {
            return this.b.registerTextModelContentProvider(scheme, provider);
        }
        canHandleResource(resource) {
            if (this.h.hasProvider(resource) || resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.inMemory) {
                return true; // we handle file://, untitled:// and inMemory:// automatically
            }
            return this.b.hasTextModelContentProvider(resource.scheme);
        }
    };
    exports.$Jyb = $Jyb;
    exports.$Jyb = $Jyb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, files_1.$6j),
        __param(2, undoRedo_1.$wu),
        __param(3, model_1.$yA),
        __param(4, uriIdentity_1.$Ck)
    ], $Jyb);
    (0, extensions_1.$mr)(resolverService_1.$uA, $Jyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=textModelResolverService.js.map