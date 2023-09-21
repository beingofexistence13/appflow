/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDocumentData", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types", "vs/base/common/objects", "vs/workbench/api/common/extHostTypes", "vs/base/common/errors"], function (require, exports, event_1, lifecycle_1, uri_1, extHost_protocol_1, extHostDocumentData_1, TypeConverters, types_1, objects_1, extHostTypes_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7ac = void 0;
    class $7ac {
        constructor(mainContext, documentsAndEditors) {
            this.a = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.b = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.c = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.d = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidAddDocument = this.a.event;
            this.onDidRemoveDocument = this.b.event;
            this.onDidChangeDocument = this.c.event;
            this.onDidSaveDocument = this.d.event;
            this.e = new lifecycle_1.$jc();
            this.h = new Map();
            this.f = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadDocuments);
            this.g = documentsAndEditors;
            this.g.onDidRemoveDocuments(documents => {
                for (const data of documents) {
                    this.b.fire(data.document);
                }
            }, undefined, this.e);
            this.g.onDidAddDocuments(documents => {
                for (const data of documents) {
                    this.a.fire(data.document);
                }
            }, undefined, this.e);
        }
        dispose() {
            this.e.dispose();
        }
        getAllDocumentData() {
            return [...this.g.allDocuments()];
        }
        getDocumentData(resource) {
            if (!resource) {
                return undefined;
            }
            const data = this.g.getDocument(resource);
            if (data) {
                return data;
            }
            return undefined;
        }
        getDocument(resource) {
            const data = this.getDocumentData(resource);
            if (!data?.document) {
                throw new Error(`Unable to retrieve document from URI '${resource}'`);
            }
            return data.document;
        }
        ensureDocumentData(uri) {
            const cached = this.g.getDocument(uri);
            if (cached) {
                return Promise.resolve(cached);
            }
            let promise = this.h.get(uri.toString());
            if (!promise) {
                promise = this.f.$tryOpenDocument(uri).then(uriData => {
                    this.h.delete(uri.toString());
                    const canonicalUri = uri_1.URI.revive(uriData);
                    return (0, types_1.$uf)(this.g.getDocument(canonicalUri));
                }, err => {
                    this.h.delete(uri.toString());
                    return Promise.reject(err);
                });
                this.h.set(uri.toString(), promise);
            }
            return promise;
        }
        createDocumentData(options) {
            return this.f.$tryCreateDocument(options).then(data => uri_1.URI.revive(data));
        }
        $acceptModelLanguageChanged(uriComponents, newLanguageId) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this.g.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            // Treat a language change as a remove + add
            this.b.fire(data.document);
            data._acceptLanguageId(newLanguageId);
            this.a.fire(data.document);
        }
        $acceptModelSaved(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this.g.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            this.$acceptDirtyStateChanged(uriComponents, false);
            this.d.fire(data.document);
        }
        $acceptDirtyStateChanged(uriComponents, isDirty) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this.g.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            data._acceptIsDirty(isDirty);
            this.c.fire({
                document: data.document,
                contentChanges: [],
                reason: undefined
            });
        }
        $acceptModelChanged(uriComponents, events, isDirty) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this.g.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            data._acceptIsDirty(isDirty);
            data.onEvents(events);
            let reason = undefined;
            if (events.isUndoing) {
                reason = extHostTypes_1.TextDocumentChangeReason.Undo;
            }
            else if (events.isRedoing) {
                reason = extHostTypes_1.TextDocumentChangeReason.Redo;
            }
            this.c.fire((0, objects_1.$Wm)({
                document: data.document,
                contentChanges: events.changes.map((change) => {
                    return {
                        range: TypeConverters.Range.to(change.range),
                        rangeOffset: change.rangeOffset,
                        rangeLength: change.rangeLength,
                        text: change.text
                    };
                }),
                reason
            }));
        }
        setWordDefinitionFor(languageId, wordDefinition) {
            (0, extHostDocumentData_1.$4L)(languageId, wordDefinition);
        }
    }
    exports.$7ac = $7ac;
});
//# sourceMappingURL=extHostDocuments.js.map