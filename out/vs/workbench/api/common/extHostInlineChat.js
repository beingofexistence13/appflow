/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostCommands"], function (require, exports, lifecycle_1, uri_1, extHost_protocol_1, typeConvert, extHostTypes, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostInteractiveEditor = void 0;
    class ProviderWrapper {
        static { this._pool = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ProviderWrapper._pool++;
        }
    }
    class SessionWrapper {
        constructor(session) {
            this.session = session;
            this.responses = [];
        }
    }
    class ExtHostInteractiveEditor {
        static { this._nextId = 0; }
        constructor(mainContext, extHostCommands, _documents, _logService) {
            this._documents = _documents;
            this._logService = _logService;
            this._inputProvider = new Map();
            this._inputSessions = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadInlineChat);
            extHostCommands.registerApiCommand(new extHostCommands_1.ApiCommand('vscode.editorChat.start', 'inlineChat.start', 'Invoke a new editor chat session', [new extHostCommands_1.ApiCommandArgument('Run arguments', '', _v => true, v => {
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
                })], extHostCommands_1.ApiCommandResult.Void));
        }
        registerProvider(extension, provider, metadata) {
            const wrapper = new ProviderWrapper(extension, provider);
            this._inputProvider.set(wrapper.handle, wrapper);
            this._proxy.$registerInteractiveEditorProvider(wrapper.handle, metadata.label, extension.identifier.value, typeof provider.handleInteractiveEditorResponseFeedback === 'function');
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterInteractiveEditorProvider(wrapper.handle);
                this._inputProvider.delete(wrapper.handle);
            });
        }
        async $prepareSession(handle, uri, range, token) {
            const entry = this._inputProvider.get(handle);
            if (!entry) {
                this._logService.warn('CANNOT prepare session because the PROVIDER IS GONE');
                return undefined;
            }
            const document = this._documents.getDocument(uri_1.URI.revive(uri));
            const selection = typeConvert.Selection.to(range);
            const session = await entry.provider.prepareInteractiveEditorSession({ document, selection }, token);
            if (!session) {
                return undefined;
            }
            if (session.wholeRange && !session.wholeRange.contains(selection)) {
                throw new Error(`InteractiveEditorSessionProvider returned a wholeRange that does not contain the selection.`);
            }
            const id = ExtHostInteractiveEditor._nextId++;
            this._inputSessions.set(id, new SessionWrapper(session));
            return {
                id,
                placeholder: session.placeholder,
                slashCommands: session.slashCommands?.map(c => ({ command: c.command, detail: c.detail, refer: c.refer, executeImmediately: c.executeImmediately })),
                wholeRange: typeConvert.Range.from(session.wholeRange),
                message: session.message
            };
        }
        async $provideResponse(handle, item, request, token) {
            const entry = this._inputProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const sessionData = this._inputSessions.get(item.id);
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
                    this._proxy.$handleProgressChunk(request.requestId, {
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
                if (ExtHostInteractiveEditor._isMessageResponse(res)) {
                    return {
                        ...stub,
                        id,
                        type: "message" /* InlineChatResponseType.Message */,
                        message: typeConvert.MarkdownString.from(res.contents),
                    };
                }
                const { edits } = res;
                if (edits instanceof extHostTypes.WorkspaceEdit) {
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
            const entry = this._inputProvider.get(handle);
            const sessionData = this._inputSessions.get(sessionId);
            const response = sessionData?.responses[responseId];
            if (entry && response) {
                const apiKind = typeConvert.InteractiveEditorResponseFeedbackKind.to(kind);
                entry.provider.handleInteractiveEditorResponseFeedback?.(sessionData.session, response, apiKind);
            }
        }
        $releaseSession(handle, sessionId) {
            // TODO@jrieken remove this
        }
        static _isMessageResponse(thing) {
            return typeof thing === 'object' && typeof thing.contents === 'object';
        }
    }
    exports.ExtHostInteractiveEditor = ExtHostInteractiveEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdElubGluZUNoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0SW5saW5lQ2hhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQU0sZUFBZTtpQkFFTCxVQUFLLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFJekIsWUFDVSxTQUFpRCxFQUNqRCxRQUFpRDtZQURqRCxjQUFTLEdBQVQsU0FBUyxDQUF3QztZQUNqRCxhQUFRLEdBQVIsUUFBUSxDQUF5QztZQUpsRCxXQUFNLEdBQVcsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBSzlDLENBQUM7O0lBR04sTUFBTSxjQUFjO1FBSW5CLFlBQ1UsT0FBd0M7WUFBeEMsWUFBTyxHQUFQLE9BQU8sQ0FBaUM7WUFIekMsY0FBUyxHQUFtRixFQUFFLENBQUM7UUFJcEcsQ0FBQztLQUNMO0lBRUQsTUFBYSx3QkFBd0I7aUJBRXJCLFlBQU8sR0FBRyxDQUFDLEFBQUosQ0FBSztRQU0zQixZQUNDLFdBQXlCLEVBQ3pCLGVBQWdDLEVBQ2YsVUFBNEIsRUFDNUIsV0FBd0I7WUFEeEIsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFSekIsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZQUNwRCxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1lBU25FLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFrQnJFLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLDRCQUFVLENBQ2hELHlCQUF5QixFQUFFLGtCQUFrQixFQUFFLGtDQUFrQyxFQUNqRixDQUFDLElBQUksb0NBQWtCLENBQXdFLGVBQWUsRUFBRSxFQUFF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