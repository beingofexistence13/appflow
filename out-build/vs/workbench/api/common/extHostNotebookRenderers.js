/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostNotebookEditor"], function (require, exports, event_1, extHost_protocol_1, extHostNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vcc = void 0;
    class $Vcc {
        constructor(mainContext, c) {
            this.c = c;
            this.a = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadNotebookRenderers);
        }
        $postRendererMessage(editorId, rendererId, message) {
            const editor = this.c.getEditorById(editorId);
            this.a.get(rendererId)?.fire({ editor: editor.apiEditor, message });
        }
        createRendererMessaging(manifest, rendererId) {
            if (!manifest.contributes?.notebookRenderer?.some(r => r.id === rendererId)) {
                throw new Error(`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`);
            }
            const messaging = {
                onDidReceiveMessage: (listener, thisArg, disposables) => {
                    return this.d(rendererId).event(listener, thisArg, disposables);
                },
                postMessage: (message, editorOrAlias) => {
                    if (extHostNotebookEditor_1.$Ecc.apiEditorsToExtHost.has(message)) { // back compat for swapped args
                        [message, editorOrAlias] = [editorOrAlias, message];
                    }
                    const extHostEditor = editorOrAlias && extHostNotebookEditor_1.$Ecc.apiEditorsToExtHost.get(editorOrAlias);
                    return this.b.$postMessage(extHostEditor?.id, rendererId, message);
                },
            };
            return messaging;
        }
        d(rendererId) {
            let emitter = this.a.get(rendererId);
            if (emitter) {
                return emitter;
            }
            emitter = new event_1.$fd({
                onDidRemoveLastListener: () => {
                    emitter?.dispose();
                    this.a.delete(rendererId);
                }
            });
            this.a.set(rendererId, emitter);
            return emitter;
        }
    }
    exports.$Vcc = $Vcc;
});
//# sourceMappingURL=extHostNotebookRenderers.js.map