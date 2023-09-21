/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/errors", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/linkedList"], function (require, exports, uri_1, errors_1, extHostTypes_1, extHostTypeConverters_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDocumentSaveParticipant = void 0;
    class ExtHostDocumentSaveParticipant {
        constructor(_logService, _documents, _mainThreadBulkEdits, _thresholds = { timeout: 1500, errors: 3 }) {
            this._logService = _logService;
            this._documents = _documents;
            this._mainThreadBulkEdits = _mainThreadBulkEdits;
            this._thresholds = _thresholds;
            this._callbacks = new linkedList_1.LinkedList();
            this._badListeners = new WeakMap();
            //
        }
        dispose() {
            this._callbacks.clear();
        }
        getOnWillSaveTextDocumentEvent(extension) {
            return (listener, thisArg, disposables) => {
                const remove = this._callbacks.push([listener, thisArg, extension]);
                const result = { dispose: remove };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        async $participateInSave(data, reason) {
            const resource = uri_1.URI.revive(data);
            let didTimeout = false;
            const didTimeoutHandle = setTimeout(() => didTimeout = true, this._thresholds.timeout);
            const results = [];
            try {
                for (const listener of [...this._callbacks]) { // copy to prevent concurrent modifications
                    if (didTimeout) {
                        // timeout - no more listeners
                        break;
                    }
                    const document = this._documents.getDocument(resource);
                    const success = await this._deliverEventAsyncAndBlameBadListeners(listener, { document, reason: extHostTypeConverters_1.TextDocumentSaveReason.to(reason) });
                    results.push(success);
                }
            }
            finally {
                clearTimeout(didTimeoutHandle);
            }
            return results;
        }
        _deliverEventAsyncAndBlameBadListeners([listener, thisArg, extension], stubEvent) {
            const errors = this._badListeners.get(listener);
            if (typeof errors === 'number' && errors > this._thresholds.errors) {
                // bad listener - ignore
                return Promise.resolve(false);
            }
            return this._deliverEventAsync(extension, listener, thisArg, stubEvent).then(() => {
                // don't send result across the wire
                return true;
            }, err => {
                this._logService.error(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' threw ERROR`);
                this._logService.error(err);
                if (!(err instanceof Error) || err.message !== 'concurrent_edits') {
                    const errors = this._badListeners.get(listener);
                    this._badListeners.set(listener, !errors ? 1 : errors + 1);
                    if (typeof errors === 'number' && errors > this._thresholds.errors) {
                        this._logService.info(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' will now be IGNORED because of timeouts and/or errors`);
                    }
                }
                return false;
            });
        }
        _deliverEventAsync(extension, listener, thisArg, stubEvent) {
            const promises = [];
            const t1 = Date.now();
            const { document, reason } = stubEvent;
            const { version } = document;
            const event = Object.freeze({
                document,
                reason,
                waitUntil(p) {
                    if (Object.isFrozen(promises)) {
                        throw (0, errors_1.illegalState)('waitUntil can not be called async');
                    }
                    promises.push(Promise.resolve(p));
                }
            });
            try {
                // fire event
                listener.apply(thisArg, [event]);
            }
            catch (err) {
                return Promise.reject(err);
            }
            // freeze promises after event call
            Object.freeze(promises);
            return new Promise((resolve, reject) => {
                // join on all listener promises, reject after timeout
                const handle = setTimeout(() => reject(new Error('timeout')), this._thresholds.timeout);
                return Promise.all(promises).then(edits => {
                    this._logService.debug(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' finished after ${(Date.now() - t1)}ms`);
                    clearTimeout(handle);
                    resolve(edits);
                }).catch(err => {
                    clearTimeout(handle);
                    reject(err);
                });
            }).then(values => {
                const dto = { edits: [] };
                for (const value of values) {
                    if (Array.isArray(value) && value.every(e => e instanceof extHostTypes_1.TextEdit)) {
                        for (const { newText, newEol, range } of value) {
                            dto.edits.push({
                                resource: document.uri,
                                versionId: undefined,
                                textEdit: {
                                    range: range && extHostTypeConverters_1.Range.from(range),
                                    text: newText,
                                    eol: newEol && extHostTypeConverters_1.EndOfLine.from(newEol),
                                }
                            });
                        }
                    }
                }
                // apply edits if any and if document
                // didn't change somehow in the meantime
                if (dto.edits.length === 0) {
                    return undefined;
                }
                if (version === document.version) {
                    return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(dto);
                }
                return Promise.reject(new Error('concurrent_edits'));
            });
        }
    }
    exports.ExtHostDocumentSaveParticipant = ExtHostDocumentSaveParticipant;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50U2F2ZVBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdERvY3VtZW50U2F2ZVBhcnRpY2lwYW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBYSw4QkFBOEI7UUFLMUMsWUFDa0IsV0FBd0IsRUFDeEIsVUFBNEIsRUFDNUIsb0JBQThDLEVBQzlDLGNBQW1ELEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBSC9FLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBQzVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMEI7WUFDOUMsZ0JBQVcsR0FBWCxXQUFXLENBQW9FO1lBUGhGLGVBQVUsR0FBRyxJQUFJLHVCQUFVLEVBQVksQ0FBQztZQUN4QyxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDO1lBUWhFLEVBQUU7UUFDSCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELDhCQUE4QixDQUFDLFNBQWdDO1lBQzlELE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ25DLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDL0IsV0FBVyxDQUFDLElBQUksQ0FB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