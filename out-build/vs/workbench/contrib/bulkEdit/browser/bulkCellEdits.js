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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/services/editor/common/editorService"], function (require, exports, arrays_1, strings_1, types_1, uri_1, bulkEditService_1, notebookBrowser_1, notebookCommon_1, notebookEditorModelResolverService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4bb = exports.$3bb = void 0;
    class $3bb extends bulkEditService_1.$o1 {
        static is(candidate) {
            if (candidate instanceof $3bb) {
                return true;
            }
            return uri_1.URI.isUri(candidate.resource)
                && (0, types_1.$lf)(candidate.cellEdit);
        }
        static lift(edit) {
            if (edit instanceof $3bb) {
                return edit;
            }
            return new $3bb(edit.resource, edit.cellEdit, edit.notebookVersionId, edit.metadata);
        }
        constructor(resource, cellEdit, notebookVersionId = undefined, metadata) {
            super(metadata);
            this.resource = resource;
            this.cellEdit = cellEdit;
            this.notebookVersionId = notebookVersionId;
        }
    }
    exports.$3bb = $3bb;
    let $4bb = class $4bb {
        constructor(c, undoRedoSource, d, f, g, h, i) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.g = this.g.map(e => {
                if (e.resource.scheme === notebookCommon_1.CellUri.scheme) {
                    const uri = notebookCommon_1.CellUri.parse(e.resource)?.notebook;
                    if (!uri) {
                        throw new Error(`Invalid notebook URI: ${e.resource}`);
                    }
                    return new $3bb(uri, e.cellEdit, e.notebookVersionId, e.metadata);
                }
                else {
                    return e;
                }
            });
        }
        async apply() {
            const resources = [];
            const editsByNotebook = (0, arrays_1.$xb)(this.g, (a, b) => (0, strings_1.$Fe)(a.resource.toString(), b.resource.toString()));
            for (const group of editsByNotebook) {
                if (this.f.isCancellationRequested) {
                    break;
                }
                const [first] = group;
                const ref = await this.i.resolve(first.resource);
                // check state
                if (typeof first.notebookVersionId === 'number' && ref.object.notebook.versionId !== first.notebookVersionId) {
                    ref.dispose();
                    throw new Error(`Notebook '${first.resource}' has changed in the meantime`);
                }
                // apply edits
                const edits = group.map(entry => entry.cellEdit);
                const computeUndo = !ref.object.isReadonly();
                const editor = (0, notebookBrowser_1.$Zbb)(this.h.activeEditorPane);
                const initialSelectionState = editor?.textModel?.uri.toString() === ref.object.notebook.uri.toString() ? {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: editor.getFocus(),
                    selections: editor.getSelections()
                } : undefined;
                ref.object.notebook.applyEdits(edits, true, initialSelectionState, () => undefined, this.c, computeUndo);
                ref.dispose();
                this.d.report(undefined);
                resources.push(first.resource);
            }
            return resources;
        }
    };
    exports.$4bb = $4bb;
    exports.$4bb = $4bb = __decorate([
        __param(5, editorService_1.$9C),
        __param(6, notebookEditorModelResolverService_1.$wbb)
    ], $4bb);
});
//# sourceMappingURL=bulkCellEdits.js.map