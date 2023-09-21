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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/stableEditorScroll", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/services/editorWorker", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/inlineChat/browser/inlineChatLivePreviewWidget", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, lazy_1, lifecycle_1, bulkEditService_1, stableEditorScroll_1, position_1, selection_1, languages_1, editorWorker_1, nls_1, configuration_1, contextkey_1, instantiation_1, storage_1, inlineChatLivePreviewWidget_1, inlineChatSession_1, inlineChat_1, editorService_1) {
    "use strict";
    var LiveStrategy_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LivePreviewStrategy = exports.LiveStrategy = exports.PreviewStrategy = exports.EditModeStrategy = void 0;
    class EditModeStrategy {
    }
    exports.EditModeStrategy = EditModeStrategy;
    let PreviewStrategy = class PreviewStrategy extends EditModeStrategy {
        constructor(_session, _widget, contextKeyService, _bulkEditService, _instaService) {
            super();
            this._session = _session;
            this._widget = _widget;
            this._bulkEditService = _bulkEditService;
            this._instaService = _instaService;
            this._ctxDocumentChanged = inlineChat_1.CTX_INLINE_CHAT_DOCUMENT_CHANGED.bindTo(contextKeyService);
            this._listener = event_1.Event.debounce(_session.textModelN.onDidChangeContent.bind(_session.textModelN), () => { }, 350)(_ => {
                if (!_session.textModelN.isDisposed() && !_session.textModel0.isDisposed()) {
                    this._ctxDocumentChanged.set(_session.hasChangedText);
                }
            });
        }
        dispose() {
            this._listener.dispose();
            this._ctxDocumentChanged.reset();
        }
        checkChanges(response) {
            if (!response.workspaceEdits || response.singleCreateFileEdit) {
                // preview stategy can handle simple workspace edit (single file create)
                return true;
            }
            this._bulkEditService.apply(response.workspaceEdits, { showPreview: true });
            return false;
        }
        async apply() {
            if (!(this._session.lastExchange?.response instanceof inlineChatSession_1.EditResponse)) {
                return;
            }
            const editResponse = this._session.lastExchange?.response;
            if (editResponse.workspaceEdits) {
                await this._bulkEditService.apply(editResponse.workspaceEdits);
                this._instaService.invokeFunction(showSingleCreateFile, editResponse);
            }
            else if (!editResponse.workspaceEditsIncludeLocalEdits) {
                const { textModelN: modelN } = this._session;
                if (modelN.equalsTextBuffer(this._session.textModel0.getTextBuffer())) {
                    modelN.pushStackElement();
                    for (const edits of editResponse.allLocalEdits) {
                        modelN.pushEditOperations(null, edits.map(languages_1.TextEdit.asEditOperation), () => null);
                    }
                    modelN.pushStackElement();
                }
            }
        }
        async cancel() {
            // nothing to do
        }
        async makeChanges(_edits) {
            // nothing to do
        }
        async undoChanges(_response) {
            // nothing to do
        }
        async renderChanges(response) {
            if (response.allLocalEdits.length > 0) {
                const allEditOperation = response.allLocalEdits.map(edits => edits.map(languages_1.TextEdit.asEditOperation));
                this._widget.showEditsPreview(this._session.textModel0, allEditOperation, this._session.lastTextModelChanges);
            }
            else {
                this._widget.hideEditsPreview();
            }
            if (response.singleCreateFileEdit) {
                this._widget.showCreatePreview(response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this._widget.hideCreatePreview();
            }
        }
        getWidgetPosition() {
            return;
        }
        hasFocus() {
            return this._widget.hasFocus();
        }
        needsMargin() {
            return true;
        }
    };
    exports.PreviewStrategy = PreviewStrategy;
    exports.PreviewStrategy = PreviewStrategy = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, instantiation_1.IInstantiationService)
    ], PreviewStrategy);
    class InlineDiffDecorations {
        constructor(editor, visible = false) {
            this._data = [];
            this._visible = false;
            this._collection = editor.createDecorationsCollection();
            this._visible = visible;
        }
        get visible() {
            return this._visible;
        }
        set visible(value) {
            this._visible = value;
            this.update();
        }
        clear() {
            this._collection.clear();
            this._data.length = 0;
        }
        collectEditOperation(op) {
            this._data.push(InlineDiffDecorations._asDecorationData(op));
        }
        update() {
            this._collection.set(this._data.map(d => {
                const res = { ...d.tracking };
                if (this._visible) {
                    res.options = { ...res.options, ...d.decorating };
                }
                return res;
            }));
        }
        static _asDecorationData(edit) {
            let content = edit.text;
            if (content.length > 12) {
                content = content.substring(0, 12) + '…';
            }
            const tracking = {
                range: edit.range,
                options: {
                    description: 'inline-chat-inline-diff',
                }
            };
            const decorating = {
                description: 'inline-chat-inline-diff',
                className: !edit.range.isEmpty() ? 'inline-chat-lines-inserted-range' : undefined,
                showIfCollapsed: true,
                before: {
                    content,
                    inlineClassName: 'inline-chat-lines-deleted-range-inline',
                    attachedData: edit,
                }
            };
            return { tracking, decorating };
        }
    }
    let LiveStrategy = LiveStrategy_1 = class LiveStrategy extends EditModeStrategy {
        constructor(_session, _editor, _widget, contextKeyService, configService, _storageService, _bulkEditService, _editorWorkerService, _instaService) {
            super();
            this._session = _session;
            this._editor = _editor;
            this._widget = _widget;
            this._storageService = _storageService;
            this._bulkEditService = _bulkEditService;
            this._editorWorkerService = _editorWorkerService;
            this._instaService = _instaService;
            this._diffEnabled = false;
            this._store = new lifecycle_1.DisposableStore();
            this._editCount = 0;
            this._diffEnabled = configService.getValue('inlineChat.showDiff');
            this._inlineDiffDecorations = new InlineDiffDecorations(this._editor, this._diffEnabled);
            this._inlineDiffDecorations.visible = this._diffEnabled;
            this._store.add(configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('inlineChat.showDiff')) {
                    this._diffEnabled = !this._diffEnabled;
                    this._doToggleDiff();
                }
            }));
        }
        dispose() {
            this._inlineDiffDecorations.clear();
            this._store.dispose();
        }
        _doToggleDiff() {
            this._inlineDiffDecorations.visible = this._diffEnabled;
        }
        checkChanges(response) {
            this._lastResponse = response;
            if (response.singleCreateFileEdit) {
                // preview stategy can handle simple workspace edit (single file create)
                return true;
            }
            if (response.workspaceEdits) {
                this._bulkEditService.apply(response.workspaceEdits, { showPreview: true });
                return false;
            }
            return true;
        }
        async apply() {
            if (this._editCount > 0) {
                this._editor.pushUndoStop();
            }
            if (this._lastResponse?.workspaceEdits) {
                await this._bulkEditService.apply(this._lastResponse.workspaceEdits);
                this._instaService.invokeFunction(showSingleCreateFile, this._lastResponse);
            }
        }
        async cancel() {
            const { textModelN: modelN, textModelNAltVersion, textModelNSnapshotAltVersion } = this._session;
            if (modelN.isDisposed()) {
                return;
            }
            const targetAltVersion = textModelNSnapshotAltVersion ?? textModelNAltVersion;
            LiveStrategy_1._undoModelUntil(modelN, targetAltVersion);
        }
        async makeChanges(edits) {
            const cursorStateComputerAndInlineDiffCollection = (undoEdits) => {
                let last = null;
                for (const edit of undoEdits) {
                    last = !last || last.isBefore(edit.range.getEndPosition()) ? edit.range.getEndPosition() : last;
                    this._inlineDiffDecorations.collectEditOperation(edit);
                }
                return last && [selection_1.Selection.fromPositions(last)];
            };
            // push undo stop before first edit
            if (++this._editCount === 1) {
                this._editor.pushUndoStop();
            }
            this._editor.executeEdits('inline-chat-live', edits, cursorStateComputerAndInlineDiffCollection);
        }
        async undoChanges(response) {
            const { textModelN } = this._session;
            LiveStrategy_1._undoModelUntil(textModelN, response.modelAltVersionId);
        }
        async renderChanges(response) {
            this._inlineDiffDecorations.update();
            this._updateSummaryMessage();
            if (response.singleCreateFileEdit) {
                this._widget.showCreatePreview(response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this._widget.hideCreatePreview();
            }
        }
        static _undoModelUntil(model, targetAltVersion) {
            while (targetAltVersion < model.getAlternativeVersionId() && model.canUndo()) {
                model.undo();
            }
        }
        _updateSummaryMessage() {
            let linesChanged = 0;
            for (const change of this._session.lastTextModelChanges) {
                linesChanged += change.changedLineCount;
            }
            let message;
            if (linesChanged === 0) {
                message = (0, nls_1.localize)('lines.0', "Nothing changed");
            }
            else if (linesChanged === 1) {
                message = (0, nls_1.localize)('lines.1', "Changed 1 line");
            }
            else {
                message = (0, nls_1.localize)('lines.N', "Changed {0} lines", linesChanged);
            }
            this._widget.updateStatus(message);
        }
        getWidgetPosition() {
            const lastTextModelChanges = this._session.lastTextModelChanges;
            let lastLineOfLocalEdits;
            for (const change of lastTextModelChanges) {
                const changeEndLineNumber = change.modified.endLineNumberExclusive - 1;
                if (typeof lastLineOfLocalEdits === 'undefined' || lastLineOfLocalEdits < changeEndLineNumber) {
                    lastLineOfLocalEdits = changeEndLineNumber;
                }
            }
            return lastLineOfLocalEdits ? new position_1.Position(lastLineOfLocalEdits, 1) : undefined;
        }
        needsMargin() {
            return !Boolean(this._session.lastTextModelChanges.length);
        }
        hasFocus() {
            return this._widget.hasFocus();
        }
    };
    exports.LiveStrategy = LiveStrategy;
    exports.LiveStrategy = LiveStrategy = LiveStrategy_1 = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, storage_1.IStorageService),
        __param(6, bulkEditService_1.IBulkEditService),
        __param(7, editorWorker_1.IEditorWorkerService),
        __param(8, instantiation_1.IInstantiationService)
    ], LiveStrategy);
    let LivePreviewStrategy = class LivePreviewStrategy extends LiveStrategy {
        constructor(session, editor, widget, contextKeyService, configService, storageService, bulkEditService, editorWorkerService, instaService) {
            super(session, editor, widget, contextKeyService, configService, storageService, bulkEditService, editorWorkerService, instaService);
            this._diffZone = new lazy_1.Lazy(() => instaService.createInstance(inlineChatLivePreviewWidget_1.InlineChatLivePreviewWidget, editor, session));
            this._previewZone = new lazy_1.Lazy(() => instaService.createInstance(inlineChatLivePreviewWidget_1.InlineChatFileCreatePreviewWidget, editor));
        }
        dispose() {
            this._diffZone.rawValue?.hide();
            this._diffZone.rawValue?.dispose();
            this._previewZone.rawValue?.hide();
            this._previewZone.rawValue?.dispose();
            super.dispose();
        }
        async renderChanges(response) {
            this._updateSummaryMessage();
            if (this._diffEnabled) {
                this._diffZone.value.show();
            }
            if (response.singleCreateFileEdit) {
                this._previewZone.value.showCreation(this._session.wholeRange.value.collapseToEnd(), response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this._previewZone.value.hide();
            }
        }
        async undoChanges(response) {
            this._diffZone.value.lockToDiff();
            super.undoChanges(response);
        }
        _doToggleDiff() {
            const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editor);
            if (this._diffEnabled) {
                this._diffZone.value.show();
            }
            else {
                this._diffZone.value.hide();
            }
            scrollState.restore(this._editor);
        }
        hasFocus() {
            return super.hasFocus() || this._diffZone.value.hasFocus() || this._previewZone.value.hasFocus();
        }
        getWidgetPosition() {
            if (this._session.lastTextModelChanges.length) {
                return this._session.wholeRange.value.getEndPosition();
            }
            return;
        }
    };
    exports.LivePreviewStrategy = LivePreviewStrategy;
    exports.LivePreviewStrategy = LivePreviewStrategy = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, storage_1.IStorageService),
        __param(6, bulkEditService_1.IBulkEditService),
        __param(7, editorWorker_1.IEditorWorkerService),
        __param(8, instantiation_1.IInstantiationService)
    ], LivePreviewStrategy);
    function showSingleCreateFile(accessor, edit) {
        const editorService = accessor.get(editorService_1.IEditorService);
        if (edit.singleCreateFileEdit) {
            editorService.openEditor({ resource: edit.singleCreateFileEdit.uri }, editorService_1.SIDE_GROUP);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFN0cmF0ZWdpZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdFN0cmF0ZWdpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCaEcsTUFBc0IsZ0JBQWdCO0tBcUJyQztJQXJCRCw0Q0FxQkM7SUFFTSxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLGdCQUFnQjtRQUtwRCxZQUNrQixRQUFpQixFQUNqQixPQUF5QixFQUN0QixpQkFBcUMsRUFDdEIsZ0JBQWtDLEVBQzdCLGFBQW9DO1lBRTVFLEtBQUssRUFBRSxDQUFDO1lBTlMsYUFBUSxHQUFSLFFBQVEsQ0FBUztZQUNqQixZQUFPLEdBQVAsT0FBTyxDQUFrQjtZQUVQLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDN0Isa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBSTVFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyw2Q0FBZ0MsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsU0FBUyxHQUFHLGFBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUMzRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFD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