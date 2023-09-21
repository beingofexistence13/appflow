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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/event", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/range", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/platform/log/common/log", "vs/base/common/iterator", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/async"], function (require, exports, resources_1, event_1, bulkEditService_1, inlineChat_1, range_1, instantiation_1, telemetry_1, model_1, resolverService_1, lifecycle_1, textModel_1, log_1, iterator_1, errorMessage_1, errors_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatSessionService = exports.IInlineChatSessionService = exports.EditResponse = exports.MarkdownResponse = exports.ErrorResponse = exports.EmptyResponse = exports.SessionExchange = exports.SessionPrompt = exports.Session = exports.ExpansionState = void 0;
    var ExpansionState;
    (function (ExpansionState) {
        ExpansionState["EXPANDED"] = "expanded";
        ExpansionState["CROPPED"] = "cropped";
        ExpansionState["NOT_CROPPED"] = "not_cropped";
    })(ExpansionState || (exports.ExpansionState = ExpansionState = {}));
    class SessionWholeRange {
        static { this._options = { description: 'inlineChat/session/wholeRange' }; }
        constructor(_textModel, wholeRange) {
            this._textModel = _textModel;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._decorationIds = [];
            this._decorationIds = _textModel.deltaDecorations([], [{ range: wholeRange, options: SessionWholeRange._options }]);
        }
        dispose() {
            this._onDidChange.dispose();
            if (!this._textModel.isDisposed()) {
                this._textModel.deltaDecorations(this._decorationIds, []);
            }
        }
        trackEdits(edits) {
            const newDeco = [];
            for (const edit of edits) {
                newDeco.push({ range: edit.range, options: SessionWholeRange._options });
            }
            this._decorationIds.push(...this._textModel.deltaDecorations([], newDeco));
            this._onDidChange.fire(this);
        }
        get value() {
            let result;
            for (const id of this._decorationIds) {
                const range = this._textModel.getDecorationRange(id);
                if (range) {
                    if (!result) {
                        result = range;
                    }
                    else {
                        result = range_1.Range.plusRange(result, range);
                    }
                }
            }
            return result;
        }
    }
    class Session {
        constructor(editMode, editor, textModel0, textModelN, provider, session, wholeRange) {
            this.editMode = editMode;
            this.editor = editor;
            this.textModel0 = textModel0;
            this.textModelN = textModelN;
            this.provider = provider;
            this.session = session;
            this.wholeRange = wholeRange;
            this._isUnstashed = false;
            this._exchange = [];
            this._startTime = new Date();
            this.textModelNAltVersion = textModelN.getAlternativeVersionId();
            this._teldata = {
                extension: provider.debugName,
                startTime: this._startTime.toISOString(),
                edits: false,
                rounds: '',
                undos: '',
                editMode
            };
        }
        addInput(input) {
            this._lastInput = input;
        }
        get lastInput() {
            return this._lastInput;
        }
        get isUnstashed() {
            return this._isUnstashed;
        }
        markUnstashed() {
            this._isUnstashed = true;
        }
        get lastExpansionState() {
            return this._lastExpansionState;
        }
        set lastExpansionState(state) {
            this._lastExpansionState = state;
        }
        get textModelNSnapshotAltVersion() {
            return this._textModelNSnapshotAltVersion;
        }
        createSnapshot() {
            this._textModelNSnapshotAltVersion = this.textModelN.getAlternativeVersionId();
        }
        addExchange(exchange) {
            this._isUnstashed = false;
            const newLen = this._exchange.push(exchange);
            this._teldata.rounds += `${newLen}|`;
        }
        get exchanges() {
            return this._exchange;
        }
        get lastExchange() {
            return this._exchange[this._exchange.length - 1];
        }
        get lastTextModelChanges() {
            return this._lastTextModelChanges ?? [];
        }
        set lastTextModelChanges(changes) {
            this._lastTextModelChanges = changes;
        }
        get hasChangedText() {
            return !this.textModel0.equalsTextBuffer(this.textModelN.getTextBuffer());
        }
        asChangedText() {
            if (!this._lastTextModelChanges || this._lastTextModelChanges.length === 0) {
                return undefined;
            }
            let startLine = Number.MAX_VALUE;
            let endLine = Number.MIN_VALUE;
            for (const change of this._lastTextModelChanges) {
                startLine = Math.min(startLine, change.modified.startLineNumber);
                endLine = Math.max(endLine, change.modified.endLineNumberExclusive);
            }
            return this.textModelN.getValueInRange(new range_1.Range(startLine, 1, endLine, Number.MAX_VALUE));
        }
        recordExternalEditOccurred(didFinish) {
            this._teldata.edits = true;
            this._teldata.finishedByEdit = didFinish;
        }
        asTelemetryData() {
            return {
                ...this._teldata,
                endTime: new Date().toISOString(),
            };
        }
        asRecording() {
            const result = {
                session: this.session,
                when: this._startTime,
                exchanges: []
            };
            for (const exchange of this._exchange) {
                const response = exchange.response;
                if (response instanceof MarkdownResponse || response instanceof EditResponse) {
                    result.exchanges.push({ prompt: exchange.prompt.value, res: response.raw });
                }
            }
            return result;
        }
    }
    exports.Session = Session;
    class SessionPrompt {
        constructor(value) {
            this.value = value;
            this._attempt = 0;
        }
        get attempt() {
            return this._attempt;
        }
        retry() {
            const result = new SessionPrompt(this.value);
            result._attempt = this._attempt + 1;
            return result;
        }
    }
    exports.SessionPrompt = SessionPrompt;
    class SessionExchange {
        constructor(prompt, response) {
            this.prompt = prompt;
            this.response = response;
        }
    }
    exports.SessionExchange = SessionExchange;
    class EmptyResponse {
    }
    exports.EmptyResponse = EmptyResponse;
    class ErrorResponse {
        constructor(error) {
            this.error = error;
            this.message = (0, errorMessage_1.toErrorMessage)(error, false);
            this.isCancellation = (0, errors_1.isCancellationError)(error);
        }
    }
    exports.ErrorResponse = ErrorResponse;
    class MarkdownResponse {
        constructor(localUri, raw) {
            this.localUri = localUri;
            this.raw = raw;
        }
    }
    exports.MarkdownResponse = MarkdownResponse;
    class EditResponse {
        constructor(localUri, modelAltVersionId, raw, progressEdits) {
            this.modelAltVersionId = modelAltVersionId;
            this.raw = raw;
            this.allLocalEdits = [];
            this.workspaceEditsIncludeLocalEdits = false;
            this.allLocalEdits.push(...progressEdits);
            if (raw.type === 'editorEdit') {
                //
                this.allLocalEdits.push(raw.edits);
                this.singleCreateFileEdit = undefined;
                this.workspaceEdits = undefined;
            }
            else {
                //
                const edits = bulkEditService_1.ResourceEdit.convert(raw.edits);
                this.workspaceEdits = edits;
                let isComplexEdit = false;
                const localEdits = [];
                for (const edit of edits) {
                    if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                        if (!isComplexEdit && edit.newResource && !edit.oldResource) {
                            // file create
                            if (this.singleCreateFileEdit) {
                                isComplexEdit = true;
                                this.singleCreateFileEdit = undefined;
                            }
                            else {
                                this.singleCreateFileEdit = { uri: edit.newResource, edits: [] };
                                if (edit.options.contents) {
                                    this.singleCreateFileEdit.edits.push(edit.options.contents.then(x => ({ range: new range_1.Range(1, 1, 1, 1), text: x.toString() })));
                                }
                            }
                        }
                    }
                    else if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                        //
                        if ((0, resources_1.isEqual)(edit.resource, localUri)) {
                            localEdits.push(edit.textEdit);
                            this.workspaceEditsIncludeLocalEdits = true;
                        }
                        else if ((0, resources_1.isEqual)(this.singleCreateFileEdit?.uri, edit.resource)) {
                            this.singleCreateFileEdit.edits.push(Promise.resolve(edit.textEdit));
                        }
                        else {
                            isComplexEdit = true;
                        }
                    }
                }
                if (localEdits.length > 0) {
                    this.allLocalEdits.push(localEdits);
                }
                if (isComplexEdit) {
                    this.singleCreateFileEdit = undefined;
                }
            }
        }
    }
    exports.EditResponse = EditResponse;
    exports.IInlineChatSessionService = (0, instantiation_1.createDecorator)('IInlineChatSessionService');
    let InlineChatSessionService = class InlineChatSessionService {
        constructor(_inlineChatService, _telemetryService, _modelService, _textModelService, _logService) {
            this._inlineChatService = _inlineChatService;
            this._telemetryService = _telemetryService;
            this._modelService = _modelService;
            this._textModelService = _textModelService;
            this._logService = _logService;
            this._onWillStartSession = new event_1.Emitter();
            this.onWillStartSession = this._onWillStartSession.event;
            this._onDidEndSession = new event_1.Emitter();
            this.onDidEndSession = this._onDidEndSession.event;
            this._sessions = new Map();
            this._keyComputers = new Map();
            this._recordings = [];
        }
        dispose() {
            this._onWillStartSession.dispose();
            this._onDidEndSession.dispose();
            this._sessions.forEach(x => x.store.dispose());
            this._sessions.clear();
        }
        async createSession(editor, options, token) {
            const provider = iterator_1.Iterable.first(this._inlineChatService.getAllProvider());
            if (!provider) {
                this._logService.trace('[IE] NO provider found');
                return undefined;
            }
            this._onWillStartSession.fire(editor);
            const textModel = editor.getModel();
            const selection = editor.getSelection();
            let raw;
            try {
                raw = await (0, async_1.raceCancellation)(Promise.resolve(provider.prepareInlineChatSession(textModel, selection, token)), token);
            }
            catch (error) {
                this._logService.error('[IE] FAILED to prepare session', provider.debugName);
                this._logService.error(error);
                return undefined;
            }
            if (!raw) {
                this._logService.trace('[IE] NO session', provider.debugName);
                return undefined;
            }
            this._logService.trace('[IE] NEW session', provider.debugName);
            this._logService.trace(`[IE] creating NEW session for ${editor.getId()},  ${provider.debugName}`);
            const store = new lifecycle_1.DisposableStore();
            // create: keep a reference to prevent disposal of the "actual" model
            const refTextModelN = await this._textModelService.createModelReference(textModel.uri);
            store.add(refTextModelN);
            // create: keep a snapshot of the "actual" model
            const textModel0 = this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(textModel.createSnapshot()), { languageId: textModel.getLanguageId(), onDidChange: event_1.Event.None }, undefined, true);
            store.add(textModel0);
            let wholeRange = options.wholeRange;
            if (!wholeRange) {
                wholeRange = raw.wholeRange ? range_1.Range.lift(raw.wholeRange) : editor.getSelection();
            }
            // expand to whole lines
            wholeRange = new range_1.Range(wholeRange.startLineNumber, 1, wholeRange.endLineNumber, textModel.getLineMaxColumn(wholeRange.endLineNumber));
            // install managed-marker for the decoration range
            const wholeRangeMgr = new SessionWholeRange(textModel, wholeRange);
            store.add(wholeRangeMgr);
            const session = new Session(options.editMode, editor, textModel0, textModel, provider, raw, wholeRangeMgr);
            // store: key -> session
            const key = this._key(editor, textModel.uri);
            if (this._sessions.has(key)) {
                store.dispose();
                throw new Error(`Session already stored for ${key}`);
            }
            this._sessions.set(key, { session, store });
            return session;
        }
        releaseSession(session) {
            const { editor } = session;
            // cleanup
            for (const [key, value] of this._sessions) {
                if (value.session === session) {
                    value.store.dispose();
                    this._sessions.delete(key);
                    this._logService.trace(`[IE] did RELEASED session for ${editor.getId()}, ${session.provider.debugName}`);
                    break;
                }
            }
            // keep recording
            const newLen = this._recordings.unshift(session.asRecording());
            if (newLen > 5) {
                this._recordings.pop();
            }
            // send telemetry
            this._telemetryService.publicLog2('interactiveEditor/session', session.asTelemetryData());
            this._onDidEndSession.fire(editor);
        }
        getSession(editor, uri) {
            const key = this._key(editor, uri);
            return this._sessions.get(key)?.session;
        }
        _key(editor, uri) {
            const item = this._keyComputers.get(uri.scheme);
            return item
                ? item.getComparisonKey(editor, uri)
                : `${editor.getId()}@${uri.toString()}`;
        }
        registerSessionKeyComputer(scheme, value) {
            this._keyComputers.set(scheme, value);
            return (0, lifecycle_1.toDisposable)(() => this._keyComputers.delete(scheme));
        }
        // --- debug
        recordings() {
            return this._recordings;
        }
    };
    exports.InlineChatSessionService = InlineChatSessionService;
    exports.InlineChatSessionService = InlineChatSessionService = __decorate([
        __param(0, inlineChat_1.IInlineChatService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, model_1.IModelService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, log_1.ILogService)
    ], InlineChatSessionService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNlc3Npb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdFNlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0RoRyxJQUFZLGNBSVg7SUFKRCxXQUFZLGNBQWM7UUFDekIsdUNBQXFCLENBQUE7UUFDckIscUNBQW1CLENBQUE7UUFDbkIsNkNBQTJCLENBQUE7SUFDNUIsQ0FBQyxFQUpXLGNBQWMsOEJBQWQsY0FBYyxRQUl6QjtJQUVELE1BQU0saUJBQWlCO2lCQUVFLGFBQVEsR0FBRyxFQUFFLFdBQVcsRUFBRSwrQkFBK0IsRUFBRSxBQUFuRCxDQUFvRDtRQU9wRixZQUE2QixVQUFzQixFQUFFLFVBQWtCO1lBQTFDLGVBQVUsR0FBVixVQUFVLENBQVk7WUFMbEMsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzNDLGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRTNDLG1CQUFjLEdBQWEsRUFBRSxDQUFDO1lBRzlDLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FB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