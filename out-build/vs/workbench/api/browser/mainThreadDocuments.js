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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/model", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/event", "vs/workbench/services/path/common/pathService", "vs/base/common/map", "vs/base/common/errors"], function (require, exports, errorMessage_1, lifecycle_1, network_1, uri_1, model_1, model_2, resolverService_1, files_1, extHost_protocol_1, textfiles_1, environmentService_1, resources_1, workingCopyFileService_1, uriIdentity_1, event_1, pathService_1, map_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mcb = exports.$Lcb = void 0;
    class $Lcb {
        constructor(c, d = 1000 * 60 * 3, // auto-dispse by age
        f = 1024 * 1024 * 80, // auto-dispose by total length
        g = 50 // auto-dispose by number of references
        ) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = new Array();
            this.b = 0;
            //
        }
        dispose() {
            this.a = (0, lifecycle_1.$fc)(this.a);
        }
        remove(uri) {
            for (const entry of [...this.a] /* copy array because dispose will modify it */) {
                if (this.c.isEqualOrParent(entry.uri, uri)) {
                    entry.dispose();
                }
            }
        }
        add(uri, ref, length = 0) {
            // const length = ref.object.textEditorModel.getValueLength();
            const dispose = () => {
                const idx = this.a.indexOf(entry);
                if (idx >= 0) {
                    this.b -= length;
                    ref.dispose();
                    clearTimeout(handle);
                    this.a.splice(idx, 1);
                }
            };
            const handle = setTimeout(dispose, this.d);
            const entry = { uri, length, dispose };
            this.a.push(entry);
            this.b += length;
            this.h();
        }
        h() {
            // clean-up wrt total length
            while (this.b > this.f) {
                this.a[0].dispose();
            }
            // clean-up wrt number of documents
            const extraSize = Math.ceil(this.g * 1.2);
            if (this.a.length >= extraSize) {
                (0, lifecycle_1.$fc)(this.a.slice(0, extraSize - this.g));
            }
        }
    }
    exports.$Lcb = $Lcb;
    class ModelTracker extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = this.b.getVersionId();
            this.q.add(this.b.onDidChangeContent((e) => {
                this.a = e.versionId;
                this.f.$acceptModelChanged(this.b.uri, e, this.g.isDirty(this.b.uri));
                if (this.isCaughtUpWithContentChanges()) {
                    this.c.fire(this.b.uri);
                }
            }));
        }
        isCaughtUpWithContentChanges() {
            return (this.b.getVersionId() === this.a);
        }
    }
    let $Mcb = class $Mcb extends lifecycle_1.$kc {
        constructor(extHostContext, g, h, j, n, r, s, workingCopyFileService, t) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = this.q.add(new event_1.$fd());
            this.onIsCaughtUpWithContentChanges = this.a.event;
            this.c = new map_1.$zi();
            this.f = this.q.add(new $Lcb(s.extUri));
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDocuments);
            this.q.add(g.onModelLanguageChanged(this.w, this));
            this.q.add(h.files.onDidSave(e => {
                if (this.u(e.model.resource)) {
                    this.b.$acceptModelSaved(e.model.resource);
                }
            }));
            this.q.add(h.files.onDidChangeDirty(m => {
                if (this.u(m.resource)) {
                    this.b.$acceptDirtyStateChanged(m.resource, m.isDirty());
                }
            }));
            this.q.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                const isMove = e.operation === 2 /* FileOperation.MOVE */;
                if (isMove || e.operation === 1 /* FileOperation.DELETE */) {
                    for (const pair of e.files) {
                        const removed = isMove ? pair.source : pair.target;
                        if (removed) {
                            this.f.remove(removed);
                        }
                    }
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.c.values());
            this.c.clear();
            super.dispose();
        }
        isCaughtUpWithContentChanges(resource) {
            const tracker = this.c.get(resource);
            if (tracker) {
                return tracker.isCaughtUpWithContentChanges();
            }
            return true;
        }
        u(resource) {
            const model = this.g.getModel(resource);
            return !!model && (0, model_1.$Gu)(model);
        }
        handleModelAdded(model) {
            // Same filter as in mainThreadEditorsTracker
            if (!(0, model_1.$Gu)(model)) {
                // don't synchronize too large models
                return;
            }
            this.c.set(model.uri, new ModelTracker(model, this.a, this.b, this.h));
        }
        w(event) {
            const { model } = event;
            if (!this.c.has(model.uri)) {
                return;
            }
            this.b.$acceptModelLanguageChanged(model.uri, model.getLanguageId());
        }
        handleModelRemoved(modelUrl) {
            if (!this.c.has(modelUrl)) {
                return;
            }
            this.c.get(modelUrl).dispose();
            this.c.delete(modelUrl);
        }
        // --- from extension host process
        async $trySaveDocument(uri) {
            const target = await this.h.save(uri_1.URI.revive(uri));
            return Boolean(target);
        }
        async $tryOpenDocument(uriData) {
            const inputUri = uri_1.URI.revive(uriData);
            if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
                throw new errors_1.$_(`Invalid uri. Scheme and authority or path must be set.`);
            }
            const canonicalUri = this.s.asCanonicalUri(inputUri);
            let promise;
            switch (canonicalUri.scheme) {
                case network_1.Schemas.untitled:
                    promise = this.z(canonicalUri);
                    break;
                case network_1.Schemas.file:
                default:
                    promise = this.y(canonicalUri);
                    break;
            }
            let documentUri;
            try {
                documentUri = await promise;
            }
            catch (err) {
                throw new errors_1.$_(`cannot open ${canonicalUri.toString()}. Detail: ${(0, errorMessage_1.$mi)(err)}`);
            }
            if (!documentUri) {
                throw new errors_1.$_(`cannot open ${canonicalUri.toString()}`);
            }
            else if (!resources_1.$$f.isEqual(documentUri, canonicalUri)) {
                throw new errors_1.$_(`cannot open ${canonicalUri.toString()}. Detail: Actual document opened as ${documentUri.toString()}`);
            }
            else if (!this.c.has(canonicalUri)) {
                throw new errors_1.$_(`cannot open ${canonicalUri.toString()}. Detail: Files above 50MB cannot be synchronized with extensions.`);
            }
            else {
                return canonicalUri;
            }
        }
        $tryCreateDocument(options) {
            return this.C(undefined, options ? options.language : undefined, options ? options.content : undefined);
        }
        async y(uri) {
            const ref = await this.n.createModelReference(uri);
            this.f.add(uri, ref, ref.object.textEditorModel.getValueLength());
            return ref.object.textEditorModel.uri;
        }
        async z(uri) {
            const asLocalUri = (0, resources_1.$sg)(uri, this.r.remoteAuthority, this.t.defaultUriScheme);
            const exists = await this.j.exists(asLocalUri);
            if (exists) {
                // don't create a new file ontop of an existing file
                return Promise.reject(new Error('file already exists'));
            }
            return await this.C(Boolean(uri.path) ? uri : undefined);
        }
        async C(associatedResource, languageId, initialValue) {
            const model = await this.h.untitled.resolve({
                associatedResource,
                languageId,
                initialValue
            });
            const resource = model.resource;
            if (!this.c.has(resource)) {
                throw new Error(`expected URI ${resource.toString()} to have come to LIFE`);
            }
            this.b.$acceptDirtyStateChanged(resource, true); // mark as dirty
            return resource;
        }
    };
    exports.$Mcb = $Mcb;
    exports.$Mcb = $Mcb = __decorate([
        __param(1, model_2.$yA),
        __param(2, textfiles_1.$JD),
        __param(3, files_1.$6j),
        __param(4, resolverService_1.$uA),
        __param(5, environmentService_1.$hJ),
        __param(6, uriIdentity_1.$Ck),
        __param(7, workingCopyFileService_1.$HD),
        __param(8, pathService_1.$yJ)
    ], $Mcb);
});
//# sourceMappingURL=mainThreadDocuments.js.map