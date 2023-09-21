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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/base/common/network", "vs/workbench/common/editor"], function (require, exports, lifecycle_1, nls_1, contextkey_1, resources_1, language_1, files_1, model_1, network_1, editor_1) {
    "use strict";
    var $Kdb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ldb = exports.$Kdb = exports.$Jdb = exports.$Idb = exports.$Hdb = exports.$Gdb = exports.$Fdb = exports.$Edb = exports.$Ddb = exports.$Cdb = exports.$Bdb = exports.$Adb = exports.$zdb = exports.$ydb = exports.$xdb = exports.$wdb = exports.$vdb = exports.$udb = exports.$tdb = exports.$sdb = exports.$rdb = exports.$qdb = exports.$pdb = exports.$odb = exports.$ndb = exports.$mdb = exports.$ldb = exports.$kdb = exports.$jdb = exports.$idb = exports.$hdb = exports.$gdb = exports.$fdb = exports.$edb = exports.$ddb = exports.$cdb = exports.$bdb = exports.$adb = exports.$_cb = exports.$$cb = exports.$0cb = exports.$9cb = exports.$8cb = exports.$7cb = exports.$6cb = exports.$5cb = exports.$4cb = exports.$3cb = exports.$2cb = exports.$1cb = exports.$Zcb = exports.$Ycb = exports.$Xcb = exports.$Wcb = exports.$Vcb = exports.$Ucb = exports.$Tcb = exports.$Scb = exports.$Rcb = exports.$Qcb = exports.$Pcb = void 0;
    //#region < --- Workbench --- >
    exports.$Pcb = new contextkey_1.$2i('workbenchState', undefined, { type: 'string', description: (0, nls_1.localize)(0, null) });
    exports.$Qcb = new contextkey_1.$2i('workspaceFolderCount', 0, (0, nls_1.localize)(1, null));
    exports.$Rcb = new contextkey_1.$2i('openFolderWorkspaceSupport', true, true);
    exports.$Scb = new contextkey_1.$2i('enterMultiRootWorkspaceSupport', true, true);
    exports.$Tcb = new contextkey_1.$2i('emptyWorkspaceSupport', true, true);
    exports.$Ucb = new contextkey_1.$2i('dirtyWorkingCopies', false, (0, nls_1.localize)(2, null));
    exports.$Vcb = new contextkey_1.$2i('remoteName', '', (0, nls_1.localize)(3, null));
    exports.$Wcb = new contextkey_1.$2i('virtualWorkspace', '', (0, nls_1.localize)(4, null));
    exports.$Xcb = new contextkey_1.$2i('temporaryWorkspace', false, (0, nls_1.localize)(5, null));
    exports.$Ycb = new contextkey_1.$2i('isFullscreen', false, (0, nls_1.localize)(6, null));
    exports.$Zcb = new contextkey_1.$2i('hasWebFileSystemAccess', false, true); // Support for FileSystemAccess web APIs (https://wicg.github.io/file-system-access)
    exports.$1cb = new contextkey_1.$2i('embedderIdentifier', undefined, (0, nls_1.localize)(7, null));
    //#endregion
    //#region < --- Editor --- >
    // Editor State Context Keys
    exports.$2cb = new contextkey_1.$2i('activeEditorIsDirty', false, (0, nls_1.localize)(8, null));
    exports.$3cb = new contextkey_1.$2i('activeEditorIsNotPreview', false, (0, nls_1.localize)(9, null));
    exports.$4cb = new contextkey_1.$2i('activeEditorIsFirstInGroup', false, (0, nls_1.localize)(10, null));
    exports.$5cb = new contextkey_1.$2i('activeEditorIsLastInGroup', false, (0, nls_1.localize)(11, null));
    exports.$6cb = new contextkey_1.$2i('activeEditorIsPinned', false, (0, nls_1.localize)(12, null));
    exports.$7cb = new contextkey_1.$2i('activeEditorIsReadonly', false, (0, nls_1.localize)(13, null));
    exports.$8cb = new contextkey_1.$2i('activeEditorCanToggleReadonly', true, (0, nls_1.localize)(14, null));
    exports.$9cb = new contextkey_1.$2i('activeEditorCanRevert', false, (0, nls_1.localize)(15, null));
    exports.$0cb = new contextkey_1.$2i('activeEditorCanSplitInGroup', true);
    // Editor Kind Context Keys
    exports.$$cb = new contextkey_1.$2i('activeEditor', null, { type: 'string', description: (0, nls_1.localize)(16, null) });
    exports.$_cb = new contextkey_1.$2i('activeEditorAvailableEditorIds', '', (0, nls_1.localize)(17, null));
    exports.$adb = new contextkey_1.$2i('textCompareEditorVisible', false, (0, nls_1.localize)(18, null));
    exports.$bdb = new contextkey_1.$2i('textCompareEditorActive', false, (0, nls_1.localize)(19, null));
    exports.$cdb = new contextkey_1.$2i('sideBySideEditorActive', false, (0, nls_1.localize)(20, null));
    // Editor Group Context Keys
    exports.$ddb = new contextkey_1.$2i('groupEditorsCount', 0, (0, nls_1.localize)(21, null));
    exports.$edb = new contextkey_1.$2i('activeEditorGroupEmpty', false, (0, nls_1.localize)(22, null));
    exports.$fdb = new contextkey_1.$2i('activeEditorGroupIndex', 0, (0, nls_1.localize)(23, null));
    exports.$gdb = new contextkey_1.$2i('activeEditorGroupLast', false, (0, nls_1.localize)(24, null));
    exports.$hdb = new contextkey_1.$2i('activeEditorGroupLocked', false, (0, nls_1.localize)(25, null));
    exports.$idb = new contextkey_1.$2i('multipleEditorGroups', false, (0, nls_1.localize)(26, null));
    exports.$jdb = exports.$idb.toNegated();
    // Editor Layout Context Keys
    exports.$kdb = new contextkey_1.$2i('editorIsOpen', false, (0, nls_1.localize)(27, null));
    exports.$ldb = new contextkey_1.$2i('inZenMode', false, (0, nls_1.localize)(28, null));
    exports.$mdb = new contextkey_1.$2i('isCenteredLayout', false, (0, nls_1.localize)(29, null));
    exports.$ndb = new contextkey_1.$2i('splitEditorsVertically', false, (0, nls_1.localize)(30, null));
    exports.$odb = new contextkey_1.$2i('editorAreaVisible', true, (0, nls_1.localize)(31, null));
    exports.$pdb = new contextkey_1.$2i('editorTabsVisible', true, (0, nls_1.localize)(32, null));
    //#endregion
    //#region < --- Side Bar --- >
    exports.$qdb = new contextkey_1.$2i('sideBarVisible', false, (0, nls_1.localize)(33, null));
    exports.$rdb = new contextkey_1.$2i('sideBarFocus', false, (0, nls_1.localize)(34, null));
    exports.$sdb = new contextkey_1.$2i('activeViewlet', '', (0, nls_1.localize)(35, null));
    //#endregion
    //#region < --- Status Bar --- >
    exports.$tdb = new contextkey_1.$2i('statusBarFocused', false, (0, nls_1.localize)(36, null));
    //#endregion
    //#region < --- Banner --- >
    exports.$udb = new contextkey_1.$2i('bannerFocused', false, (0, nls_1.localize)(37, null));
    //#endregion
    //#region < --- Notifications --- >
    exports.$vdb = new contextkey_1.$2i('notificationFocus', true, (0, nls_1.localize)(38, null));
    exports.$wdb = new contextkey_1.$2i('notificationCenterVisible', false, (0, nls_1.localize)(39, null));
    exports.$xdb = new contextkey_1.$2i('notificationToastsVisible', false, (0, nls_1.localize)(40, null));
    //#endregion
    //#region < --- Auxiliary Bar --- >
    exports.$ydb = new contextkey_1.$2i('activeAuxiliary', '', (0, nls_1.localize)(41, null));
    exports.$zdb = new contextkey_1.$2i('auxiliaryBarFocus', false, (0, nls_1.localize)(42, null));
    exports.$Adb = new contextkey_1.$2i('auxiliaryBarVisible', false, (0, nls_1.localize)(43, null));
    //#endregion
    //#region < --- Panel --- >
    exports.$Bdb = new contextkey_1.$2i('activePanel', '', (0, nls_1.localize)(44, null));
    exports.$Cdb = new contextkey_1.$2i('panelFocus', false, (0, nls_1.localize)(45, null));
    exports.$Ddb = new contextkey_1.$2i('panelPosition', 'bottom', (0, nls_1.localize)(46, null));
    exports.$Edb = new contextkey_1.$2i('panelAlignment', 'center', (0, nls_1.localize)(47, null));
    exports.$Fdb = new contextkey_1.$2i('panelVisible', false, (0, nls_1.localize)(48, null));
    exports.$Gdb = new contextkey_1.$2i('panelMaximized', false, (0, nls_1.localize)(49, null));
    //#endregion
    //#region < --- Views --- >
    exports.$Hdb = new contextkey_1.$2i('focusedView', '', (0, nls_1.localize)(50, null));
    function $Idb(viewId) { return `view.${viewId}.visible`; }
    exports.$Idb = $Idb;
    function $Jdb(viewContainerId) { return `viewContainer.${viewContainerId}.enabled`; }
    exports.$Jdb = $Jdb;
    //#endregion
    //#region < --- Resources --- >
    let $Kdb = class $Kdb {
        static { $Kdb_1 = this; }
        // NOTE: DO NOT CHANGE THE DEFAULT VALUE TO ANYTHING BUT
        // UNDEFINED! IT IS IMPORTANT THAT DEFAULTS ARE INHERITED
        // FROM THE PARENT CONTEXT AND ONLY UNDEFINED DOES THIS
        static { this.Scheme = new contextkey_1.$2i('resourceScheme', undefined, { type: 'string', description: (0, nls_1.localize)(51, null) }); }
        static { this.Filename = new contextkey_1.$2i('resourceFilename', undefined, { type: 'string', description: (0, nls_1.localize)(52, null) }); }
        static { this.Dirname = new contextkey_1.$2i('resourceDirname', undefined, { type: 'string', description: (0, nls_1.localize)(53, null) }); }
        static { this.Path = new contextkey_1.$2i('resourcePath', undefined, { type: 'string', description: (0, nls_1.localize)(54, null) }); }
        static { this.LangId = new contextkey_1.$2i('resourceLangId', undefined, { type: 'string', description: (0, nls_1.localize)(55, null) }); }
        static { this.Resource = new contextkey_1.$2i('resource', undefined, { type: 'URI', description: (0, nls_1.localize)(56, null) }); }
        static { this.Extension = new contextkey_1.$2i('resourceExtname', undefined, { type: 'string', description: (0, nls_1.localize)(57, null) }); }
        static { this.HasResource = new contextkey_1.$2i('resourceSet', undefined, { type: 'boolean', description: (0, nls_1.localize)(58, null) }); }
        static { this.IsFileSystemResource = new contextkey_1.$2i('isFileSystemResource', undefined, { type: 'boolean', description: (0, nls_1.localize)(59, null) }); }
        constructor(m, n, o, p) {
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.a = new lifecycle_1.$jc();
            this.d = $Kdb_1.Scheme.bindTo(this.m);
            this.f = $Kdb_1.Filename.bindTo(this.m);
            this.g = $Kdb_1.Dirname.bindTo(this.m);
            this.h = $Kdb_1.Path.bindTo(this.m);
            this.i = $Kdb_1.LangId.bindTo(this.m);
            this.c = $Kdb_1.Resource.bindTo(this.m);
            this.j = $Kdb_1.Extension.bindTo(this.m);
            this.k = $Kdb_1.HasResource.bindTo(this.m);
            this.l = $Kdb_1.IsFileSystemResource.bindTo(this.m);
            this.a.add(n.onDidChangeFileSystemProviderRegistrations(() => {
                const resource = this.get();
                this.l.set(Boolean(resource && n.hasProvider(resource)));
            }));
            this.a.add(p.onModelAdded(model => {
                if ((0, resources_1.$bg)(model.uri, this.get())) {
                    this.q();
                }
            }));
            this.a.add(p.onModelLanguageChanged(e => {
                if ((0, resources_1.$bg)(e.model.uri, this.get())) {
                    this.q();
                }
            }));
        }
        dispose() {
            this.a.dispose();
        }
        q() {
            const value = this.get();
            if (!value) {
                this.i.set(null);
                return;
            }
            const langId = this.p.getModel(value)?.getLanguageId() ?? this.o.guessLanguageIdByFilepathOrFirstLine(value);
            this.i.set(langId);
        }
        set(value) {
            value = value ?? undefined;
            if ((0, resources_1.$bg)(this.b, value)) {
                return;
            }
            this.b = value;
            this.m.bufferChangeEvents(() => {
                this.c.set(value ? value.toString() : null);
                this.d.set(value ? value.scheme : null);
                this.f.set(value ? (0, resources_1.$fg)(value) : null);
                this.g.set(value ? this.r((0, resources_1.$hg)(value)) : null);
                this.h.set(value ? this.r(value) : null);
                this.q();
                this.j.set(value ? (0, resources_1.$gg)(value) : null);
                this.k.set(Boolean(value));
                this.l.set(value ? this.n.hasProvider(value) : false);
            });
        }
        r(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return uri.fsPath;
            }
            return uri.path;
        }
        reset() {
            this.b = undefined;
            this.m.bufferChangeEvents(() => {
                this.c.reset();
                this.d.reset();
                this.f.reset();
                this.g.reset();
                this.h.reset();
                this.i.reset();
                this.j.reset();
                this.k.reset();
                this.l.reset();
            });
        }
        get() {
            return this.b;
        }
    };
    exports.$Kdb = $Kdb;
    exports.$Kdb = $Kdb = $Kdb_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, files_1.$6j),
        __param(2, language_1.$ct),
        __param(3, model_1.$yA)
    ], $Kdb);
    //#endregion
    function $Ldb(contextKey, editor, editorResolverService) {
        if (!editor) {
            contextKey.set('');
            return;
        }
        const editorResource = editor.resource;
        const editors = editorResource ? editorResolverService.getEditors(editorResource).map(editor => editor.id) : [];
        if (editorResource?.scheme === network_1.Schemas.untitled && editor.editorId !== editor_1.$HE.id) {
            // Non text editor untitled files cannot be easily serialized between extensions
            // so instead we disable this context key to prevent common commands that act on the active editor
            contextKey.set('');
        }
        else {
            contextKey.set(editors.join(','));
        }
    }
    exports.$Ldb = $Ldb;
});
//# sourceMappingURL=contextkeys.js.map