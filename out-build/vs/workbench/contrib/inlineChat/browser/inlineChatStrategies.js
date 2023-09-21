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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/stableEditorScroll", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/services/editorWorker", "vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatStrategies", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/inlineChat/browser/inlineChatLivePreviewWidget", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, lazy_1, lifecycle_1, bulkEditService_1, stableEditorScroll_1, position_1, selection_1, languages_1, editorWorker_1, nls_1, configuration_1, contextkey_1, instantiation_1, storage_1, inlineChatLivePreviewWidget_1, inlineChatSession_1, inlineChat_1, editorService_1) {
    "use strict";
    var $Dqb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Eqb = exports.$Dqb = exports.$Cqb = exports.$Bqb = void 0;
    class $Bqb {
    }
    exports.$Bqb = $Bqb;
    let $Cqb = class $Cqb extends $Bqb {
        constructor(c, f, contextKeyService, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = inlineChat_1.$yz.bindTo(contextKeyService);
            this.b = event_1.Event.debounce(c.textModelN.onDidChangeContent.bind(c.textModelN), () => { }, 350)(_ => {
                if (!c.textModelN.isDisposed() && !c.textModel0.isDisposed()) {
                    this.a.set(c.hasChangedText);
                }
            });
        }
        dispose() {
            this.b.dispose();
            this.a.reset();
        }
        checkChanges(response) {
            if (!response.workspaceEdits || response.singleCreateFileEdit) {
                // preview stategy can handle simple workspace edit (single file create)
                return true;
            }
            this.g.apply(response.workspaceEdits, { showPreview: true });
            return false;
        }
        async apply() {
            if (!(this.c.lastExchange?.response instanceof inlineChatSession_1.$aqb)) {
                return;
            }
            const editResponse = this.c.lastExchange?.response;
            if (editResponse.workspaceEdits) {
                await this.g.apply(editResponse.workspaceEdits);
                this.h.invokeFunction(showSingleCreateFile, editResponse);
            }
            else if (!editResponse.workspaceEditsIncludeLocalEdits) {
                const { textModelN: modelN } = this.c;
                if (modelN.equalsTextBuffer(this.c.textModel0.getTextBuffer())) {
                    modelN.pushStackElement();
                    for (const edits of editResponse.allLocalEdits) {
                        modelN.pushEditOperations(null, edits.map(languages_1.$$s.asEditOperation), () => null);
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
                const allEditOperation = response.allLocalEdits.map(edits => edits.map(languages_1.$$s.asEditOperation));
                this.f.showEditsPreview(this.c.textModel0, allEditOperation, this.c.lastTextModelChanges);
            }
            else {
                this.f.hideEditsPreview();
            }
            if (response.singleCreateFileEdit) {
                this.f.showCreatePreview(response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this.f.hideCreatePreview();
            }
        }
        getWidgetPosition() {
            return;
        }
        hasFocus() {
            return this.f.hasFocus();
        }
        needsMargin() {
            return true;
        }
    };
    exports.$Cqb = $Cqb;
    exports.$Cqb = $Cqb = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, bulkEditService_1.$n1),
        __param(4, instantiation_1.$Ah)
    ], $Cqb);
    class InlineDiffDecorations {
        constructor(editor, visible = false) {
            this.b = [];
            this.c = false;
            this.a = editor.createDecorationsCollection();
            this.c = visible;
        }
        get visible() {
            return this.c;
        }
        set visible(value) {
            this.c = value;
            this.update();
        }
        clear() {
            this.a.clear();
            this.b.length = 0;
        }
        collectEditOperation(op) {
            this.b.push(InlineDiffDecorations.f(op));
        }
        update() {
            this.a.set(this.b.map(d => {
                const res = { ...d.tracking };
                if (this.c) {
                    res.options = { ...res.options, ...d.decorating };
                }
                return res;
            }));
        }
        static f(edit) {
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
    let $Dqb = $Dqb_1 = class $Dqb extends $Bqb {
        constructor(h, i, j, contextKeyService, configService, k, l, m, n) {
            super();
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = false;
            this.c = new lifecycle_1.$jc();
            this.g = 0;
            this.a = configService.getValue('inlineChat.showDiff');
            this.b = new InlineDiffDecorations(this.i, this.a);
            this.b.visible = this.a;
            this.c.add(configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('inlineChat.showDiff')) {
                    this.a = !this.a;
                    this.o();
                }
            }));
        }
        dispose() {
            this.b.clear();
            this.c.dispose();
        }
        o() {
            this.b.visible = this.a;
        }
        checkChanges(response) {
            this.f = response;
            if (response.singleCreateFileEdit) {
                // preview stategy can handle simple workspace edit (single file create)
                return true;
            }
            if (response.workspaceEdits) {
                this.l.apply(response.workspaceEdits, { showPreview: true });
                return false;
            }
            return true;
        }
        async apply() {
            if (this.g > 0) {
                this.i.pushUndoStop();
            }
            if (this.f?.workspaceEdits) {
                await this.l.apply(this.f.workspaceEdits);
                this.n.invokeFunction(showSingleCreateFile, this.f);
            }
        }
        async cancel() {
            const { textModelN: modelN, textModelNAltVersion, textModelNSnapshotAltVersion } = this.h;
            if (modelN.isDisposed()) {
                return;
            }
            const targetAltVersion = textModelNSnapshotAltVersion ?? textModelNAltVersion;
            $Dqb_1.p(modelN, targetAltVersion);
        }
        async makeChanges(edits) {
            const cursorStateComputerAndInlineDiffCollection = (undoEdits) => {
                let last = null;
                for (const edit of undoEdits) {
                    last = !last || last.isBefore(edit.range.getEndPosition()) ? edit.range.getEndPosition() : last;
                    this.b.collectEditOperation(edit);
                }
                return last && [selection_1.$ms.fromPositions(last)];
            };
            // push undo stop before first edit
            if (++this.g === 1) {
                this.i.pushUndoStop();
            }
            this.i.executeEdits('inline-chat-live', edits, cursorStateComputerAndInlineDiffCollection);
        }
        async undoChanges(response) {
            const { textModelN } = this.h;
            $Dqb_1.p(textModelN, response.modelAltVersionId);
        }
        async renderChanges(response) {
            this.b.update();
            this.q();
            if (response.singleCreateFileEdit) {
                this.j.showCreatePreview(response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this.j.hideCreatePreview();
            }
        }
        static p(model, targetAltVersion) {
            while (targetAltVersion < model.getAlternativeVersionId() && model.canUndo()) {
                model.undo();
            }
        }
        q() {
            let linesChanged = 0;
            for (const change of this.h.lastTextModelChanges) {
                linesChanged += change.changedLineCount;
            }
            let message;
            if (linesChanged === 0) {
                message = (0, nls_1.localize)(0, null);
            }
            else if (linesChanged === 1) {
                message = (0, nls_1.localize)(1, null);
            }
            else {
                message = (0, nls_1.localize)(2, null, linesChanged);
            }
            this.j.updateStatus(message);
        }
        getWidgetPosition() {
            const lastTextModelChanges = this.h.lastTextModelChanges;
            let lastLineOfLocalEdits;
            for (const change of lastTextModelChanges) {
                const changeEndLineNumber = change.modified.endLineNumberExclusive - 1;
                if (typeof lastLineOfLocalEdits === 'undefined' || lastLineOfLocalEdits < changeEndLineNumber) {
                    lastLineOfLocalEdits = changeEndLineNumber;
                }
            }
            return lastLineOfLocalEdits ? new position_1.$js(lastLineOfLocalEdits, 1) : undefined;
        }
        needsMargin() {
            return !Boolean(this.h.lastTextModelChanges.length);
        }
        hasFocus() {
            return this.j.hasFocus();
        }
    };
    exports.$Dqb = $Dqb;
    exports.$Dqb = $Dqb = $Dqb_1 = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, storage_1.$Vo),
        __param(6, bulkEditService_1.$n1),
        __param(7, editorWorker_1.$4Y),
        __param(8, instantiation_1.$Ah)
    ], $Dqb);
    let $Eqb = class $Eqb extends $Dqb {
        constructor(session, editor, widget, contextKeyService, configService, storageService, bulkEditService, editorWorkerService, instaService) {
            super(session, editor, widget, contextKeyService, configService, storageService, bulkEditService, editorWorkerService, instaService);
            this.r = new lazy_1.$T(() => instaService.createInstance(inlineChatLivePreviewWidget_1.$fqb, editor, session));
            this.s = new lazy_1.$T(() => instaService.createInstance(inlineChatLivePreviewWidget_1.$gqb, editor));
        }
        dispose() {
            this.r.rawValue?.hide();
            this.r.rawValue?.dispose();
            this.s.rawValue?.hide();
            this.s.rawValue?.dispose();
            super.dispose();
        }
        async renderChanges(response) {
            this.q();
            if (this.a) {
                this.r.value.show();
            }
            if (response.singleCreateFileEdit) {
                this.s.value.showCreation(this.h.wholeRange.value.collapseToEnd(), response.singleCreateFileEdit.uri, await Promise.all(response.singleCreateFileEdit.edits));
            }
            else {
                this.s.value.hide();
            }
        }
        async undoChanges(response) {
            this.r.value.lockToDiff();
            super.undoChanges(response);
        }
        o() {
            const scrollState = stableEditorScroll_1.$TZ.capture(this.i);
            if (this.a) {
                this.r.value.show();
            }
            else {
                this.r.value.hide();
            }
            scrollState.restore(this.i);
        }
        hasFocus() {
            return super.hasFocus() || this.r.value.hasFocus() || this.s.value.hasFocus();
        }
        getWidgetPosition() {
            if (this.h.lastTextModelChanges.length) {
                return this.h.wholeRange.value.getEndPosition();
            }
            return;
        }
    };
    exports.$Eqb = $Eqb;
    exports.$Eqb = $Eqb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, storage_1.$Vo),
        __param(6, bulkEditService_1.$n1),
        __param(7, editorWorker_1.$4Y),
        __param(8, instantiation_1.$Ah)
    ], $Eqb);
    function showSingleCreateFile(accessor, edit) {
        const editorService = accessor.get(editorService_1.$9C);
        if (edit.singleCreateFileEdit) {
            editorService.openEditor({ resource: edit.singleCreateFileEdit.uri }, editorService_1.$$C);
        }
    }
});
//# sourceMappingURL=inlineChatStrategies.js.map