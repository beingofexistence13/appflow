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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/editors/binaryFileEditor", "vs/workbench/browser/parts/editor/binaryEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/common/files", "vs/platform/storage/common/storage", "vs/platform/editor/common/editor", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, binaryEditor_1, telemetry_1, themeService_1, fileEditorInput_1, files_1, storage_1, editor_1, editorResolverService_1, editor_2, diffEditorInput_1, editorGroupsService_1) {
    "use strict";
    var $6Lb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Lb = void 0;
    /**
     * An implementation of editor for binary files that cannot be displayed.
     */
    let $6Lb = class $6Lb extends binaryEditor_1.$Jvb {
        static { $6Lb_1 = this; }
        static { this.ID = files_1.$9db; }
        constructor(telemetryService, themeService, gb, storageService, hb) {
            super($6Lb_1.ID, {
                openInternal: (input, options) => this.ib(input, options)
            }, telemetryService, themeService, storageService);
            this.gb = gb;
            this.hb = hb;
        }
        async ib(input, options) {
            if (input instanceof fileEditorInput_1.$ULb && this.group?.activeEditor) {
                // We operate on the active editor here to support re-opening
                // diff editors where `input` may just be one side of the
                // diff editor.
                // Since `openInternal` can only ever be selected from the
                // active editor of the group, this is a safe assumption.
                // (https://github.com/microsoft/vscode/issues/124222)
                const activeEditor = this.group.activeEditor;
                const untypedActiveEditor = activeEditor?.toUntyped();
                if (!untypedActiveEditor) {
                    return; // we need untyped editor support
                }
                // Try to let the user pick an editor
                let resolvedEditor = await this.gb.resolveEditor({
                    ...untypedActiveEditor,
                    options: {
                        ...options,
                        override: editor_1.EditorResolution.PICK
                    }
                }, this.group);
                if (resolvedEditor === 2 /* ResolvedStatus.NONE */) {
                    resolvedEditor = undefined;
                }
                else if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                    return;
                }
                // If the result if a file editor, the user indicated to open
                // the binary file as text. As such we adjust the input for that.
                if ((0, editor_2.$YE)(resolvedEditor)) {
                    for (const editor of resolvedEditor.editor instanceof diffEditorInput_1.$3eb ? [resolvedEditor.editor.original, resolvedEditor.editor.modified] : [resolvedEditor.editor]) {
                        if (editor instanceof fileEditorInput_1.$ULb) {
                            editor.setForceOpenAsText();
                            editor.setPreferredLanguageId(files_1.$0db); // https://github.com/microsoft/vscode/issues/131076
                        }
                    }
                }
                // Replace the active editor with the picked one
                await (this.group ?? this.hb.activeGroup).replaceEditors([{
                        editor: activeEditor,
                        replacement: resolvedEditor?.editor ?? input,
                        options: {
                            ...resolvedEditor?.options ?? options
                        }
                    }]);
            }
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)(0, null);
        }
    };
    exports.$6Lb = $6Lb;
    exports.$6Lb = $6Lb = $6Lb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, editorResolverService_1.$pbb),
        __param(3, storage_1.$Vo),
        __param(4, editorGroupsService_1.$5C)
    ], $6Lb);
});
//# sourceMappingURL=binaryFileEditor.js.map