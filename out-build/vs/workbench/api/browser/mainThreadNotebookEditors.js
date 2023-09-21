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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "../common/extHost.protocol"], function (require, exports, lifecycle_1, objects_1, uri_1, configuration_1, editor_1, notebookBrowser_1, notebookEditorService_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4rb = void 0;
    class MainThreadNotebook {
        constructor(editor, disposables) {
            this.editor = editor;
            this.disposables = disposables;
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    let $4rb = class $4rb {
        constructor(extHostContext, e, f, g, h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new lifecycle_1.$jc();
            this.c = new Map();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebookEditors);
            this.e.onDidActiveEditorChange(() => this.i(), this, this.a);
            this.g.onDidRemoveGroup(() => this.i(), this, this.a);
            this.g.onDidMoveGroup(() => this.i(), this, this.a);
        }
        dispose() {
            this.a.dispose();
            (0, lifecycle_1.$fc)(this.c.values());
        }
        handleEditorsAdded(editors) {
            for (const editor of editors) {
                const editorDisposables = new lifecycle_1.$jc();
                editorDisposables.add(editor.onDidChangeVisibleRanges(() => {
                    this.b.$acceptEditorPropertiesChanged(editor.getId(), { visibleRanges: { ranges: editor.visibleRanges } });
                }));
                editorDisposables.add(editor.onDidChangeSelection(() => {
                    this.b.$acceptEditorPropertiesChanged(editor.getId(), { selections: { selections: editor.getSelections() } });
                }));
                const wrapper = new MainThreadNotebook(editor, editorDisposables);
                this.c.set(editor.getId(), wrapper);
            }
        }
        handleEditorsRemoved(editorIds) {
            for (const id of editorIds) {
                this.c.get(id)?.dispose();
                this.c.delete(id);
            }
        }
        i() {
            const result = Object.create(null);
            for (const editorPane of this.e.visibleEditorPanes) {
                const candidate = (0, notebookBrowser_1.$Zbb)(editorPane);
                if (candidate && this.c.has(candidate.getId())) {
                    result[candidate.getId()] = (0, editorGroupColumn_1.$5I)(this.g, editorPane.group);
                }
            }
            if (!(0, objects_1.$Zm)(result, this.d)) {
                this.d = result;
                this.b.$acceptEditorViewColumns(result);
            }
        }
        async $tryShowNotebookDocument(resource, viewType, options) {
            const editorOptions = {
                cellSelections: options.selections,
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                // selection: options.selection,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined,
                override: viewType
            };
            const editorPane = await this.e.openEditor({ resource: uri_1.URI.revive(resource), options: editorOptions }, (0, editorGroupColumn_1.$4I)(this.g, this.h, options.position));
            const notebookEditor = (0, notebookBrowser_1.$Zbb)(editorPane);
            if (notebookEditor) {
                return notebookEditor.getId();
            }
            else {
                throw new Error(`Notebook Editor creation failure for document ${JSON.stringify(resource)}`);
            }
        }
        async $tryRevealRange(id, range, revealType) {
            const editor = this.f.getNotebookEditor(id);
            if (!editor) {
                return;
            }
            const notebookEditor = editor;
            if (!notebookEditor.hasModel()) {
                return;
            }
            if (range.start >= notebookEditor.getLength()) {
                return;
            }
            const cell = notebookEditor.cellAt(range.start);
            switch (revealType) {
                case extHost_protocol_1.NotebookEditorRevealType.Default:
                    return notebookEditor.revealCellRangeInView(range);
                case extHost_protocol_1.NotebookEditorRevealType.InCenter:
                    return notebookEditor.revealInCenter(cell);
                case extHost_protocol_1.NotebookEditorRevealType.InCenterIfOutsideViewport:
                    return notebookEditor.revealInCenterIfOutsideViewport(cell);
                case extHost_protocol_1.NotebookEditorRevealType.AtTop:
                    return notebookEditor.revealInViewAtTop(cell);
            }
        }
        $trySetSelections(id, ranges) {
            const editor = this.f.getNotebookEditor(id);
            if (!editor) {
                return;
            }
            editor.setSelections(ranges);
            if (ranges.length) {
                editor.setFocus({ start: ranges[0].start, end: ranges[0].start + 1 });
            }
        }
    };
    exports.$4rb = $4rb;
    exports.$4rb = $4rb = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, notebookEditorService_1.$1rb),
        __param(3, editorGroupsService_1.$5C),
        __param(4, configuration_1.$8h)
    ], $4rb);
});
//# sourceMappingURL=mainThreadNotebookEditors.js.map