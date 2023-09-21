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
define(["require", "exports", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/services/textfile/common/textfiles", "vs/platform/contextkey/common/contextkeys", "vs/base/common/functional", "vs/nls!vs/workbench/contrib/files/common/files"], function (require, exports, editor_1, files_1, contextkey_1, lifecycle_1, model_1, language_1, textfiles_1, contextkeys_1, functional_1, nls_1) {
    "use strict";
    var $$db_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_db = exports.$$db = exports.LexicographicOptions = exports.UndoConfirmLevel = exports.SortOrder = exports.$0db = exports.$9db = exports.$8db = exports.$7db = exports.$6db = exports.$5db = exports.$4db = exports.$3db = exports.$2db = exports.$1db = exports.$Zdb = exports.$Ydb = exports.$Xdb = exports.$Wdb = exports.$Vdb = exports.$Udb = exports.$Tdb = exports.$Sdb = exports.$Rdb = exports.$Qdb = exports.$Pdb = exports.$Odb = exports.$Ndb = exports.$Mdb = void 0;
    /**
     * Explorer viewlet id.
     */
    exports.$Mdb = 'workbench.view.explorer';
    /**
     * Explorer file view id.
     */
    exports.$Ndb = 'workbench.explorer.fileView';
    /**
     * Context Keys to use with keybindings for the Explorer and Open Editors view
     */
    exports.$Odb = new contextkey_1.$2i('explorerViewletVisible', true, { type: 'boolean', description: (0, nls_1.localize)(0, null) });
    exports.$Pdb = new contextkey_1.$2i('foldersViewVisible', true, { type: 'boolean', description: (0, nls_1.localize)(1, null) });
    exports.$Qdb = new contextkey_1.$2i('explorerResourceIsFolder', false, { type: 'boolean', description: (0, nls_1.localize)(2, null) });
    exports.$Rdb = new contextkey_1.$2i('explorerResourceReadonly', false, { type: 'boolean', description: (0, nls_1.localize)(3, null) });
    exports.$Sdb = exports.$Rdb.toNegated();
    /**
     * Comma separated list of editor ids that can be used for the selected explorer resource.
     */
    exports.$Tdb = new contextkey_1.$2i('explorerResourceAvailableEditorIds', '');
    exports.$Udb = new contextkey_1.$2i('explorerResourceIsRoot', false, { type: 'boolean', description: (0, nls_1.localize)(4, null) });
    exports.$Vdb = new contextkey_1.$2i('explorerResourceCut', false, { type: 'boolean', description: (0, nls_1.localize)(5, null) });
    exports.$Wdb = new contextkey_1.$2i('explorerResourceMoveableToTrash', false, { type: 'boolean', description: (0, nls_1.localize)(6, null) });
    exports.$Xdb = new contextkey_1.$2i('filesExplorerFocus', true, { type: 'boolean', description: (0, nls_1.localize)(7, null) });
    exports.$Ydb = new contextkey_1.$2i('openEditorsFocus', true, { type: 'boolean', description: (0, nls_1.localize)(8, null) });
    exports.$Zdb = new contextkey_1.$2i('explorerViewletFocus', true, { type: 'boolean', description: (0, nls_1.localize)(9, null) });
    // compressed nodes
    exports.$1db = new contextkey_1.$2i('explorerViewletCompressedFocus', true, { type: 'boolean', description: (0, nls_1.localize)(10, null) });
    exports.$2db = new contextkey_1.$2i('explorerViewletCompressedFirstFocus', true, { type: 'boolean', description: (0, nls_1.localize)(11, null) });
    exports.$3db = new contextkey_1.$2i('explorerViewletCompressedLastFocus', true, { type: 'boolean', description: (0, nls_1.localize)(12, null) });
    exports.$4db = new contextkey_1.$2i('viewHasSomeCollapsibleItem', false, { type: 'boolean', description: (0, nls_1.localize)(13, null) });
    exports.$5db = contextkey_1.$Ii.and(exports.$Pdb, exports.$Xdb, contextkey_1.$Ii.not(contextkeys_1.$83));
    exports.$6db = contextkey_1.$Ii.and(exports.$Pdb, exports.$Zdb, contextkey_1.$Ii.not(contextkeys_1.$83));
    /**
     * Text file editor id.
     */
    exports.$7db = 'workbench.editors.files.textFileEditor';
    /**
     * File editor input id.
     */
    exports.$8db = 'workbench.editors.files.fileEditorInput';
    /**
     * Binary file editor id.
     */
    exports.$9db = 'workbench.editors.files.binaryFileEditor';
    /**
     * Language identifier for binary files opened as text.
     */
    exports.$0db = 'code-text-binary';
    var SortOrder;
    (function (SortOrder) {
        SortOrder["Default"] = "default";
        SortOrder["Mixed"] = "mixed";
        SortOrder["FilesFirst"] = "filesFirst";
        SortOrder["Type"] = "type";
        SortOrder["Modified"] = "modified";
        SortOrder["FoldersNestsFiles"] = "foldersNestsFiles";
    })(SortOrder || (exports.SortOrder = SortOrder = {}));
    var UndoConfirmLevel;
    (function (UndoConfirmLevel) {
        UndoConfirmLevel["Verbose"] = "verbose";
        UndoConfirmLevel["Default"] = "default";
        UndoConfirmLevel["Light"] = "light";
    })(UndoConfirmLevel || (exports.UndoConfirmLevel = UndoConfirmLevel = {}));
    var LexicographicOptions;
    (function (LexicographicOptions) {
        LexicographicOptions["Default"] = "default";
        LexicographicOptions["Upper"] = "upper";
        LexicographicOptions["Lower"] = "lower";
        LexicographicOptions["Unicode"] = "unicode";
    })(LexicographicOptions || (exports.LexicographicOptions = LexicographicOptions = {}));
    let $$db = $$db_1 = class $$db extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = this.B(new lifecycle_1.$lc());
        }
        static async open(resource, scheme, label, editorService, options) {
            await editorService.openEditor({
                original: { resource: $$db_1.h(scheme, resource) },
                modified: { resource },
                label,
                options
            });
        }
        static h(scheme, resource) {
            return resource.with({ scheme, query: JSON.stringify({ scheme: resource.scheme, query: resource.query }) });
        }
        static j(resource) {
            const { scheme, query } = JSON.parse(resource.query);
            return resource.with({ scheme, query });
        }
        async provideTextContent(resource) {
            if (!resource.query) {
                // We require the URI to use the `query` to transport the original scheme and query
                // as done by `resourceToTextFile`
                return null;
            }
            const savedFileResource = $$db_1.j(resource);
            // Make sure our text file is resolved up to date
            const codeEditorModel = await this.m(resource);
            // Make sure to keep contents up to date when it changes
            if (!this.a.value) {
                const disposables = new lifecycle_1.$jc();
                this.a.value = disposables;
                disposables.add(this.c.onDidFilesChange(changes => {
                    if (changes.contains(savedFileResource, 0 /* FileChangeType.UPDATED */)) {
                        this.m(resource, false /* do not create if missing */); // update model when resource changes
                    }
                }));
                if (codeEditorModel) {
                    disposables.add((0, functional_1.$bb)(codeEditorModel.onWillDispose)(() => this.a.clear()));
                }
            }
            return codeEditorModel;
        }
        async m(resource, createAsNeeded = true) {
            const savedFileResource = $$db_1.j(resource);
            const content = await this.b.readStream(savedFileResource);
            let codeEditorModel = this.g.getModel(resource);
            if (codeEditorModel) {
                this.g.updateModel(codeEditorModel, content.value);
            }
            else if (createAsNeeded) {
                const textFileModel = this.g.getModel(savedFileResource);
                let languageSelector;
                if (textFileModel) {
                    languageSelector = this.f.createById(textFileModel.getLanguageId());
                }
                else {
                    languageSelector = this.f.createByFilepathOrFirstLine(savedFileResource);
                }
                codeEditorModel = this.g.createModel(content.value, languageSelector, resource);
            }
            return codeEditorModel;
        }
    };
    exports.$$db = $$db;
    exports.$$db = $$db = $$db_1 = __decorate([
        __param(0, textfiles_1.$JD),
        __param(1, files_1.$6j),
        __param(2, language_1.$ct),
        __param(3, model_1.$yA)
    ], $$db);
    class $_db {
        static { this.b = 0; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = $_db.b++;
        }
        get editor() {
            return this.c;
        }
        get group() {
            return this.d;
        }
        get groupId() {
            return this.d.id;
        }
        getId() {
            return `openeditor:${this.groupId}:${this.a}`;
        }
        isPreview() {
            return !this.d.isPinned(this.editor);
        }
        isSticky() {
            return this.d.isSticky(this.editor);
        }
        getResource() {
            return editor_1.$3E.getOriginalUri(this.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
        }
    }
    exports.$_db = $_db;
});
//# sourceMappingURL=files.js.map