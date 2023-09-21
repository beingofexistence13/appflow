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
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/replaceService", "vs/base/common/network", "vs/base/common/lifecycle", "vs/workbench/contrib/search/browser/replace", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/contrib/search/browser/searchModel", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/editor/common/model/textModel", "vs/workbench/services/textfile/common/textfiles", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/platform/label/common/label", "vs/base/common/resources", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService"], function (require, exports, nls, network, lifecycle_1, replace_1, editorService_1, model_1, language_1, searchModel_1, resolverService_1, instantiation_1, textModel_1, textfiles_1, bulkEditService_1, range_1, editOperation_1, label_1, resources_1, async_1, editor_1, notebookCommon_1, notebookEditorModelResolverService_1) {
    "use strict";
    var $0Mb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Mb = exports.$9Mb = void 0;
    const REPLACE_PREVIEW = 'replacePreview';
    const toReplaceResource = (fileResource) => {
        return fileResource.with({ scheme: network.Schemas.internal, fragment: REPLACE_PREVIEW, query: JSON.stringify({ scheme: fileResource.scheme }) });
    };
    const toFileResource = (replaceResource) => {
        return replaceResource.with({ scheme: JSON.parse(replaceResource.query)['scheme'], fragment: '', query: '' });
    };
    let $9Mb = class $9Mb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.d.registerTextModelContentProvider(network.Schemas.internal, this);
        }
        provideTextContent(uri) {
            if (uri.fragment === REPLACE_PREVIEW) {
                return this.c.createInstance(ReplacePreviewModel).resolve(uri);
            }
            return null;
        }
    };
    exports.$9Mb = $9Mb;
    exports.$9Mb = $9Mb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, resolverService_1.$uA)
    ], $9Mb);
    let ReplacePreviewModel = class ReplacePreviewModel extends lifecycle_1.$kc {
        constructor(c, f, g, h, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
        }
        async resolve(replacePreviewUri) {
            const fileResource = toFileResource(replacePreviewUri);
            const fileMatch = this.j.searchModel.searchResult.matches().filter(match => match.resource.toString() === fileResource.toString())[0];
            const ref = this.B(await this.g.createModelReference(fileResource));
            const sourceModel = ref.object.textEditorModel;
            const sourceModelLanguageId = sourceModel.getLanguageId();
            const replacePreviewModel = this.c.createModel((0, textModel_1.$KC)(sourceModel.createSnapshot()), this.f.createById(sourceModelLanguageId), replacePreviewUri);
            this.B(fileMatch.onChange(({ forceUpdateModel }) => this.m(sourceModel, replacePreviewModel, fileMatch, forceUpdateModel)));
            this.B(this.j.searchModel.onReplaceTermChanged(() => this.m(sourceModel, replacePreviewModel, fileMatch)));
            this.B(fileMatch.onDispose(() => replacePreviewModel.dispose())); // TODO@Sandeep we should not dispose a model directly but rather the reference (depends on https://github.com/microsoft/vscode/issues/17073)
            this.B(replacePreviewModel.onWillDispose(() => this.dispose()));
            this.B(sourceModel.onWillDispose(() => this.dispose()));
            return replacePreviewModel;
        }
        m(sourceModel, replacePreviewModel, fileMatch, override = false) {
            if (!sourceModel.isDisposed() && !replacePreviewModel.isDisposed()) {
                this.h.updateReplacePreview(fileMatch, override);
            }
        }
    };
    ReplacePreviewModel = __decorate([
        __param(0, model_1.$yA),
        __param(1, language_1.$ct),
        __param(2, resolverService_1.$uA),
        __param(3, replace_1.$8Mb),
        __param(4, searchModel_1.$4Mb)
    ], ReplacePreviewModel);
    let $0Mb = class $0Mb {
        static { $0Mb_1 = this; }
        static { this.c = editor_1.$SE.registerSource('searchReplace.source', nls.localize(0, null)); }
        constructor(d, f, g, h, i, j) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
        }
        async replace(arg, progress = undefined, resource = null) {
            const edits = this.l(arg, resource);
            await this.h.apply(edits, { progress });
            const rawTextPromises = edits.map(async (e) => {
                if (e.resource.scheme === network.Schemas.vscodeNotebookCell) {
                    const notebookResource = notebookCommon_1.CellUri.parse(e.resource)?.notebook;
                    if (notebookResource) {
                        let ref;
                        try {
                            ref = await this.j.resolve(notebookResource);
                            await ref.object.save({ source: $0Mb_1.c });
                        }
                        finally {
                            ref?.dispose();
                        }
                    }
                    return;
                }
                else {
                    return this.d.files.get(e.resource)?.save({ source: $0Mb_1.c });
                }
            });
            return async_1.Promises.settled(rawTextPromises);
        }
        async openReplacePreview(element, preserveFocus, sideBySide, pinned) {
            const fileMatch = element instanceof searchModel_1.$PMb ? element.parent() : element;
            const editor = await this.f.openEditor({
                original: { resource: fileMatch.resource },
                modified: { resource: toReplaceResource(fileMatch.resource) },
                label: nls.localize(1, null, fileMatch.name(), fileMatch.name()),
                description: this.i.getUriLabel((0, resources_1.$hg)(fileMatch.resource), { relative: true }),
                options: {
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                }
            });
            const input = editor?.input;
            const disposable = fileMatch.onDispose(() => {
                input?.dispose();
                disposable.dispose();
            });
            await this.updateReplacePreview(fileMatch);
            if (editor) {
                const editorControl = editor.getControl();
                if (element instanceof searchModel_1.$PMb && editorControl) {
                    editorControl.revealLineInCenter(element.range().startLineNumber, 1 /* ScrollType.Immediate */);
                }
            }
        }
        async updateReplacePreview(fileMatch, override = false) {
            const replacePreviewUri = toReplaceResource(fileMatch.resource);
            const [sourceModelRef, replaceModelRef] = await Promise.all([this.g.createModelReference(fileMatch.resource), this.g.createModelReference(replacePreviewUri)]);
            const sourceModel = sourceModelRef.object.textEditorModel;
            const replaceModel = replaceModelRef.object.textEditorModel;
            // If model is disposed do not update
            try {
                if (sourceModel && replaceModel) {
                    if (override) {
                        replaceModel.setValue(sourceModel.getValue());
                    }
                    else {
                        replaceModel.undo();
                    }
                    this.k(fileMatch, replaceModel);
                }
            }
            finally {
                sourceModelRef.dispose();
                replaceModelRef.dispose();
            }
        }
        k(fileMatch, replaceModel) {
            const resourceEdits = this.l(fileMatch, replaceModel.uri);
            const modelEdits = [];
            for (const resourceEdit of resourceEdits) {
                modelEdits.push(editOperation_1.$ls.replaceMove(range_1.$ks.lift(resourceEdit.textEdit.range), resourceEdit.textEdit.text));
            }
            replaceModel.pushEditOperations([], modelEdits.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range)), () => []);
        }
        l(arg, resource = null) {
            const edits = [];
            if (arg instanceof searchModel_1.$PMb) {
                if (arg instanceof searchModel_1.$RMb) {
                    if (!arg.isWebviewMatch()) {
                        // only apply edits if it's not a webview match, since webview matches are read-only
                        const match = arg;
                        edits.push(this.m(match, match.replaceString, match.cell.uri));
                    }
                }
                else {
                    const match = arg;
                    edits.push(this.m(match, match.replaceString, resource));
                }
            }
            if (arg instanceof searchModel_1.$SMb) {
                arg = [arg];
            }
            if (arg instanceof Array) {
                arg.forEach(element => {
                    const fileMatch = element;
                    if (fileMatch.count() > 0) {
                        edits.push(...fileMatch.matches().flatMap(match => this.l(match, resource)));
                    }
                });
            }
            return edits;
        }
        m(match, text, resource = null) {
            const fileMatch = match.parent();
            return new bulkEditService_1.$p1(resource ?? fileMatch.resource, { range: match.range(), text }, undefined, undefined);
        }
    };
    exports.$0Mb = $0Mb;
    exports.$0Mb = $0Mb = $0Mb_1 = __decorate([
        __param(0, textfiles_1.$JD),
        __param(1, editorService_1.$9C),
        __param(2, resolverService_1.$uA),
        __param(3, bulkEditService_1.$n1),
        __param(4, label_1.$Vz),
        __param(5, notebookEditorModelResolverService_1.$wbb)
    ], $0Mb);
});
//# sourceMappingURL=replaceService.js.map