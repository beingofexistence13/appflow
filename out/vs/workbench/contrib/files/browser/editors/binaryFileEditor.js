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
define(["require", "exports", "vs/nls", "vs/workbench/browser/parts/editor/binaryEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/common/files", "vs/platform/storage/common/storage", "vs/platform/editor/common/editor", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, binaryEditor_1, telemetry_1, themeService_1, fileEditorInput_1, files_1, storage_1, editor_1, editorResolverService_1, editor_2, diffEditorInput_1, editorGroupsService_1) {
    "use strict";
    var BinaryFileEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryFileEditor = void 0;
    /**
     * An implementation of editor for binary files that cannot be displayed.
     */
    let BinaryFileEditor = class BinaryFileEditor extends binaryEditor_1.BaseBinaryResourceEditor {
        static { BinaryFileEditor_1 = this; }
        static { this.ID = files_1.BINARY_FILE_EDITOR_ID; }
        constructor(telemetryService, themeService, editorResolverService, storageService, editorGroupService) {
            super(BinaryFileEditor_1.ID, {
                openInternal: (input, options) => this.openInternal(input, options)
            }, telemetryService, themeService, storageService);
            this.editorResolverService = editorResolverService;
            this.editorGroupService = editorGroupService;
        }
        async openInternal(input, options) {
            if (input instanceof fileEditorInput_1.FileEditorInput && this.group?.activeEditor) {
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
                let resolvedEditor = await this.editorResolverService.resolveEditor({
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
                if ((0, editor_2.isEditorInputWithOptions)(resolvedEditor)) {
                    for (const editor of resolvedEditor.editor instanceof diffEditorInput_1.DiffEditorInput ? [resolvedEditor.editor.original, resolvedEditor.editor.modified] : [resolvedEditor.editor]) {
                        if (editor instanceof fileEditorInput_1.FileEditorInput) {
                            editor.setForceOpenAsText();
                            editor.setPreferredLanguageId(files_1.BINARY_TEXT_FILE_MODE); // https://github.com/microsoft/vscode/issues/131076
                        }
                    }
                }
                // Replace the active editor with the picked one
                await (this.group ?? this.editorGroupService.activeGroup).replaceEditors([{
                        editor: activeEditor,
                        replacement: resolvedEditor?.editor ?? input,
                        options: {
                            ...resolvedEditor?.options ?? options
                        }
                    }]);
            }
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)('binaryFileEditor', "Binary File Viewer");
        }
    };
    exports.BinaryFileEditor = BinaryFileEditor;
    exports.BinaryFileEditor = BinaryFileEditor = BinaryFileEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, editorResolverService_1.IEditorResolverService),
        __param(3, storage_1.IStorageService),
        __param(4, editorGroupsService_1.IEditorGroupsService)
    ], BinaryFileEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5RmlsZUVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZWRpdG9ycy9iaW5hcnlGaWxlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHOztPQUVHO0lBQ0ksSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSx1Q0FBd0I7O2lCQUU3QyxPQUFFLEdBQUcsNkJBQXFCLEFBQXhCLENBQXlCO1FBRTNDLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUNELHFCQUE2QyxFQUNyRSxjQUErQixFQUNULGtCQUF3QztZQUUvRSxLQUFLLENBQ0osa0JBQWdCLENBQUMsRUFBRSxFQUNuQjtnQkFDQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7YUFDbkUsRUFDRCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLGNBQWMsQ0FDZCxDQUFDO1lBWnVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFFL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtRQVdoRixDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFrQixFQUFFLE9BQW1DO1lBQ2pGLElBQUksS0FBSyxZQUFZLGlDQUFlLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUU7Z0JBRWpFLDZEQUE2RDtnQkFDN0QseURBQXlEO2dCQUN6RCxlQUFlO2dCQUNmLDBEQUEwRDtnQkFDMUQseURBQXlEO2dCQUN6RCxzREFBc0Q7Z0JBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO2dCQUM3QyxNQUFNLG1CQUFtQixHQUFHLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLG1CQUFtQixFQUFFO29CQUN6QixPQUFPLENBQUMsaUNBQWlDO2lCQUN6QztnQkFFRCxxQ0FBcUM7Z0JBQ3JDLElBQUksY0FBYyxHQUErQixNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7b0JBQy9GLEdBQUcsbUJBQW1CO29CQUN0QixPQUFPLEVBQUU7d0JBQ1IsR0FBRyxPQUFPO3dCQUNWLFFBQVEsRUFBRSx5QkFBZ0IsQ0FBQyxJQUFJO3FCQUMvQjtpQkFDRCxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFZixJQUFJLGNBQWMsZ0NBQXdCLEVBQUU7b0JBQzNDLGNBQWMsR0FBRyxTQUFTLENBQUM7aUJBQzNCO3FCQUFNLElBQUksY0FBYyxpQ0FBeUIsRUFBRTtvQkFDbkQsT0FBTztpQkFDUDtnQkFFRCw2REFBNkQ7Z0JBQzdELGlFQUFpRTtnQkFDakUsSUFBSSxJQUFBLGlDQUF3QixFQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUM3QyxLQUFLLE1BQU0sTUFBTSxJQUFJLGNBQWMsQ0FBQyxNQUFNLFlBQVksaUNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDbkssSUFBSSxNQUFNLFlBQVksaUNBQWUsRUFBRTs0QkFDdEMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7NEJBQzVCLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyw2QkFBcUIsQ0FBQyxDQUFDLENBQUMsb0RBQW9EO3lCQUMxRztxQkFDRDtpQkFDRDtnQkFFRCxnREFBZ0Q7Z0JBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDekUsTUFBTSxFQUFFLFlBQVk7d0JBQ3BCLFdBQVcsRUFBRSxjQUFjLEVBQUUsTUFBTSxJQUFJLEtBQUs7d0JBQzVDLE9BQU8sRUFBRTs0QkFDUixHQUFHLGNBQWMsRUFBRSxPQUFPLElBQUksT0FBTzt5QkFDckM7cUJBQ0QsQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUM7UUFFUSxRQUFRO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUMvRixDQUFDOztJQTVFVyw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQUsxQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsOENBQXNCLENBQUE7UUFDdEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSwwQ0FBb0IsQ0FBQTtPQVRWLGdCQUFnQixDQTZFNUIifQ==