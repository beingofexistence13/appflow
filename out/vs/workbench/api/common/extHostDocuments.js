/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDocumentData", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types", "vs/base/common/objects", "vs/workbench/api/common/extHostTypes", "vs/base/common/errors"], function (require, exports, event_1, lifecycle_1, uri_1, extHost_protocol_1, extHostDocumentData_1, TypeConverters, types_1, objects_1, extHostTypes_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDocuments = void 0;
    class ExtHostDocuments {
        constructor(mainContext, documentsAndEditors) {
            this._onDidAddDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidRemoveDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidSaveDocument = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidAddDocument = this._onDidAddDocument.event;
            this.onDidRemoveDocument = this._onDidRemoveDocument.event;
            this.onDidChangeDocument = this._onDidChangeDocument.event;
            this.onDidSaveDocument = this._onDidSaveDocument.event;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._documentLoader = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDocuments);
            this._documentsAndEditors = documentsAndEditors;
            this._documentsAndEditors.onDidRemoveDocuments(documents => {
                for (const data of documents) {
                    this._onDidRemoveDocument.fire(data.document);
                }
            }, undefined, this._toDispose);
            this._documentsAndEditors.onDidAddDocuments(documents => {
                for (const data of documents) {
                    this._onDidAddDocument.fire(data.document);
                }
            }, undefined, this._toDispose);
        }
        dispose() {
            this._toDispose.dispose();
        }
        getAllDocumentData() {
            return [...this._documentsAndEditors.allDocuments()];
        }
        getDocumentData(resource) {
            if (!resource) {
                return undefined;
            }
            const data = this._documentsAndEditors.getDocument(resource);
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
            const cached = this._documentsAndEditors.getDocument(uri);
            if (cached) {
                return Promise.resolve(cached);
            }
            let promise = this._documentLoader.get(uri.toString());
            if (!promise) {
                promise = this._proxy.$tryOpenDocument(uri).then(uriData => {
                    this._documentLoader.delete(uri.toString());
                    const canonicalUri = uri_1.URI.revive(uriData);
                    return (0, types_1.assertIsDefined)(this._documentsAndEditors.getDocument(canonicalUri));
                }, err => {
                    this._documentLoader.delete(uri.toString());
                    return Promise.reject(err);
                });
                this._documentLoader.set(uri.toString(), promise);
            }
            return promise;
        }
        createDocumentData(options) {
            return this._proxy.$tryCreateDocument(options).then(data => uri_1.URI.revive(data));
        }
        $acceptModelLanguageChanged(uriComponents, newLanguageId) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this._documentsAndEditors.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            // Treat a language change as a remove + add
            this._onDidRemoveDocument.fire(data.document);
            data._acceptLanguageId(newLanguageId);
            this._onDidAddDocument.fire(data.document);
        }
        $acceptModelSaved(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this._documentsAndEditors.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            this.$acceptDirtyStateChanged(uriComponents, false);
            this._onDidSaveDocument.fire(data.document);
        }
        $acceptDirtyStateChanged(uriComponents, isDirty) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this._documentsAndEditors.getDocument(uri);
            if (!data) {
                throw new Error('unknown document');
            }
            data._acceptIsDirty(isDirty);
            this._onDidChangeDocument.fire({
                document: data.document,
                contentChanges: [],
                reason: undefined
            });
        }
        $acceptModelChanged(uriComponents, events, isDirty) {
            const uri = uri_1.URI.revive(uriComponents);
            const data = this._documentsAndEditors.getDocument(uri);
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
            this._onDidChangeDocument.fire((0, objects_1.deepFreeze)({
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
            (0, extHostDocumentData_1.setWordDefinitionFor)(languageId, wordDefinition);
        }
    }
    exports.ExtHostDocuments = ExtHostDocuments;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3REb2N1bWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFhLGdCQUFnQjtRQWlCNUIsWUFBWSxXQUF5QixFQUFFLG1CQUErQztZQWZyRSxzQkFBaUIsR0FBRyxJQUFJLGVBQU8sQ0FBc0IsRUFBRSxlQUFlLEVBQUUsa0NBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBQ3JHLHlCQUFvQixHQUFHLElBQUksZUFBTyxDQUFzQixFQUFFLGVBQWUsRUFBRSxrQ0FBeUIsRUFBRSxDQUFDLENBQUM7WUFDeEcseUJBQW9CLEdBQUcsSUFBSSxlQUFPLENBQWlDLEVBQUUsZUFBZSxFQUFFLGtDQUF5QixFQUFFLENBQUMsQ0FBQztZQUNuSCx1QkFBa0IsR0FBRyxJQUFJLGVBQU8sQ0FBc0IsRUFBRSxlQUFlLEVBQUUsa0NBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBRTlHLHFCQUFnQixHQUErQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBQzVFLHdCQUFtQixHQUErQixJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBQ2xGLHdCQUFtQixHQUEwQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBQzdGLHNCQUFpQixHQUErQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBRXRFLGVBQVUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUc1QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBR3pFLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLG9CQUFvQixHQUFH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