/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/errors", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/linkedList"], function (require, exports, uri_1, errors_1, extHostTypes_1, extHostTypeConverters_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pbc = void 0;
    class $pbc {
        constructor(c, d, f, g = { timeout: 1500, errors: 3 }) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = new linkedList_1.$tc();
            this.b = new WeakMap();
            //
        }
        dispose() {
            this.a.clear();
        }
        getOnWillSaveTextDocumentEvent(extension) {
            return (listener, thisArg, disposables) => {
                const remove = this.a.push([listener, thisArg, extension]);
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
            const didTimeoutHandle = setTimeout(() => didTimeout = true, this.g.timeout);
            const results = [];
            try {
                for (const listener of [...this.a]) { // copy to prevent concurrent modifications
                    if (didTimeout) {
                        // timeout - no more listeners
                        break;
                    }
                    const document = this.d.getDocument(resource);
                    const success = await this.h(listener, { document, reason: extHostTypeConverters_1.TextDocumentSaveReason.to(reason) });
                    results.push(success);
                }
            }
            finally {
                clearTimeout(didTimeoutHandle);
            }
            return results;
        }
        h([listener, thisArg, extension], stubEvent) {
            const errors = this.b.get(listener);
            if (typeof errors === 'number' && errors > this.g.errors) {
                // bad listener - ignore
                return Promise.resolve(false);
            }
            return this.i(extension, listener, thisArg, stubEvent).then(() => {
                // don't send result across the wire
                return true;
            }, err => {
                this.c.error(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' threw ERROR`);
                this.c.error(err);
                if (!(err instanceof Error) || err.message !== 'concurrent_edits') {
                    const errors = this.b.get(listener);
                    this.b.set(listener, !errors ? 1 : errors + 1);
                    if (typeof errors === 'number' && errors > this.g.errors) {
                        this.c.info(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' will now be IGNORED because of timeouts and/or errors`);
                    }
                }
                return false;
            });
        }
        i(extension, listener, thisArg, stubEvent) {
            const promises = [];
            const t1 = Date.now();
            const { document, reason } = stubEvent;
            const { version } = document;
            const event = Object.freeze({
                document,
                reason,
                waitUntil(p) {
                    if (Object.isFrozen(promises)) {
                        throw (0, errors_1.$6)('waitUntil can not be called async');
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
                const handle = setTimeout(() => reject(new Error('timeout')), this.g.timeout);
                return Promise.all(promises).then(edits => {
                    this.c.debug(`onWillSaveTextDocument-listener from extension '${extension.identifier.value}' finished after ${(Date.now() - t1)}ms`);
                    clearTimeout(handle);
                    resolve(edits);
                }).catch(err => {
                    clearTimeout(handle);
                    reject(err);
                });
            }).then(values => {
                const dto = { edits: [] };
                for (const value of values) {
                    if (Array.isArray(value) && value.every(e => e instanceof extHostTypes_1.$0J)) {
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
                    return this.f.$tryApplyWorkspaceEdit(dto);
                }
                return Promise.reject(new Error('concurrent_edits'));
            });
        }
    }
    exports.$pbc = $pbc;
});
//# sourceMappingURL=extHostDocumentSaveParticipant.js.map