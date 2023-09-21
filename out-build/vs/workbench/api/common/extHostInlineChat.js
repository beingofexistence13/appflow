/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostCommands"], function (require, exports, lifecycle_1, uri_1, extHost_protocol_1, typeConvert, extHostTypes, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3cc = void 0;
    class ProviderWrapper {
        static { this.a = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ProviderWrapper.a++;
        }
    }
    class SessionWrapper {
        constructor(session) {
            this.session = session;
            this.responses = [];
        }
    }
    class $3cc {
        static { this.a = 0; }
        constructor(mainContext, extHostCommands, f, g) {
            this.f = f;
            this.g = g;
            this.b = new Map();
            this.d = new Map();
            this.e = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadInlineChat);
            extHostCommands.registerApiCommand(new extHostCommands_1.$pM('vscode.editorChat.start', 'inlineChat.start', 'Invoke a new editor chat session', [new extHostCommands_1.$nM('Run arguments', '', _v => true, v => {
                    if (!v) {
                        return undefined;
                    }
                    return {
                        initialRange: v.initialRange ? typeConvert.Range.from(v.initialRange) : undefined,
                        initialSelection: v.initialSelection ? typeConvert.Selection.from(v.initialSelection) : undefined,
                        message: v.message,
                        autoSend: v.autoSend,
                        position: v.position ? typeConvert.Position.from(v.position) : undefined,
                    };
                })], extHostCommands_1.$oM.Void));
        }
        registerProvider(extension, provider, metadata) {
            const wrapper = new ProviderWrapper(extension, provider);
            this.b.set(wrapper.handle, wrapper);
            this.e.$registerInteractiveEditorProvider(wrapper.handle, metadata.label, extension.identifier.value, typeof provider.handleInteractiveEditorResponseFeedback === 'function');
            return (0, lifecycle_1.$ic)(() => {
                this.e.$unregisterInteractiveEditorProvider(wrapper.handle);
                this.b.delete(wrapper.handle);
            });
        }
        async $prepareSession(handle, uri, range, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                this.g.warn('CANNOT prepare session because the PROVIDER IS GONE');
                return undefined;
            }
            const document = this.f.getDocument(uri_1.URI.revive(uri));
            const selection = typeConvert.Selection.to(range);
            const session = await entry.provider.prepareInteractiveEditorSession({ document, selection }, token);
            if (!session) {
                return undefined;
            }
            if (session.wholeRange && !session.wholeRange.contains(selection)) {
                throw new Error(`InteractiveEditorSessionProvider returned a wholeRange that does not contain the selection.`);
            }
            const id = $3cc.a++;
            this.d.set(id, new SessionWrapper(session));
            return {
                id,
                placeholder: session.placeholder,
                slashCommands: session.slashCommands?.map(c => ({ command: c.command, detail: c.detail, refer: c.refer, executeImmediately: c.executeImmediately })),
                wholeRange: typeConvert.Range.from(session.wholeRange),
                message: session.message
            };
        }
        async $provideResponse(handle, item, request, token) {
            const entry = this.b.get(handle);
            if (!entry) {
                return undefined;
            }
            const sessionData = this.d.get(item.id);
            if (!sessionData) {
                return;
            }
            const apiRequest = {
                prompt: request.prompt,
                selection: typeConvert.Selection.to(request.selection),
                wholeRange: typeConvert.Range.to(request.wholeRange),
                attempt: request.attempt,
                live: request.live,
            };
            let done = false;
            const progress = {
                report: value => {
                    if (!request.live) {
                        throw new Error('Progress reporting is only supported for live sessions');
                    }
                    if (done || token.isCancellationRequested) {
                        return;
                    }
                    if (!value.message && !value.edits) {
                        return;
                    }
                    this.e.$handleProgressChunk(request.requestId, {
                        message: value.message,
                        edits: value.edits?.map(typeConvert.TextEdit.from)
                    });
                }
            };
            const task = entry.provider.provideInteractiveEditorResponse(sessionData.session, apiRequest, progress, token);
            Promise.resolve(task).finally(() => done = true);
            const res = await task;
            if (res) {
                const id = sessionData.responses.push(res) - 1;
                const stub = {
                    wholeRange: typeConvert.Range.from(res.wholeRange),
                    placeholder: res.placeholder,
                };
                if ($3cc.h(res)) {
                    return {
                        ...stub,
                        id,
                        type: "message" /* InlineChatResponseType.Message */,
                        message: typeConvert.MarkdownString.from(res.contents),
                    };
                }
                const { edits } = res;
                if (edits instanceof extHostTypes.$aK) {
                    return {
                        ...stub,
                        id,
                        type: "bulkEdit" /* InlineChatResponseType.BulkEdit */,
                        edits: typeConvert.WorkspaceEdit.from(edits),
                    };
                }
                else if (Array.isArray(edits)) {
                    return {
                        ...stub,
                        id,
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        edits: edits.map(typeConvert.TextEdit.from),
                    };
                }
            }
            return undefined;
        }
        $handleFeedback(handle, sessionId, responseId, kind) {
            const entry = this.b.get(handle);
            const sessionData = this.d.get(sessionId);
            const response = sessionData?.responses[responseId];
            if (entry && response) {
                const apiKind = typeConvert.InteractiveEditorResponseFeedbackKind.to(kind);
                entry.provider.handleInteractiveEditorResponseFeedback?.(sessionData.session, response, apiKind);
            }
        }
        $releaseSession(handle, sessionId) {
            // TODO@jrieken remove this
        }
        static h(thing) {
            return typeof thing === 'object' && typeof thing.contents === 'object';
        }
    }
    exports.$3cc = $3cc;
});
//# sourceMappingURL=extHostInlineChat.js.map