/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, event_1, uri_1, extHostTypeConverters_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4cc = void 0;
    class $4cc {
        constructor(b, c, d, f = { timeout: 1500, errors: 3 }) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new event_1.$hd();
        }
        dispose() {
        }
        getOnWillSaveNotebookDocumentEvent(extension) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return this.a.event(wrappedListener, undefined, disposables);
            };
        }
        async $participateInSave(resource, reason, token) {
            const revivedUri = uri_1.URI.revive(resource);
            const document = this.c.getNotebookDocument(revivedUri);
            if (!document) {
                throw new Error('Unable to resolve notebook document');
            }
            const edits = [];
            await this.a.fireAsync({ notebook: document.apiNotebook, reason: extHostTypeConverters_1.TextDocumentSaveReason.to(reason) }, token, async (thenable, listener) => {
                const now = Date.now();
                const data = await await Promise.resolve(thenable);
                if (Date.now() - now > this.f.timeout) {
                    this.b.warn('onWillSaveNotebookDocument-listener from extension', listener.extension.identifier);
                }
                if (token.isCancellationRequested) {
                    return;
                }
                if (data) {
                    if (data instanceof extHostTypes_1.$aK) {
                        edits.push(data);
                    }
                    else {
                        // ignore invalid data
                        this.b.warn('onWillSaveNotebookDocument-listener from extension', listener.extension.identifier, 'ignored due to invalid data');
                    }
                }
                return;
            });
            if (token.isCancellationRequested) {
                return false;
            }
            if (edits.length === 0) {
                return true;
            }
            const dto = { edits: [] };
            for (const edit of edits) {
                const { edits } = extHostTypeConverters_1.WorkspaceEdit.from(edit);
                dto.edits = dto.edits.concat(edits);
            }
            return this.d.$tryApplyWorkspaceEdit(dto);
        }
    }
    exports.$4cc = $4cc;
});
//# sourceMappingURL=extHostNotebookDocumentSaveParticipant.js.map