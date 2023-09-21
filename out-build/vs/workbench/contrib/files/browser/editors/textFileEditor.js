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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/editors/textFileEditor", "vs/base/common/performance", "vs/base/common/types", "vs/workbench/services/path/common/pathService", "vs/base/common/actions", "vs/workbench/contrib/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/binaryEditorModel", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/editor/common/editor", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/files/browser/files", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/configuration/common/configuration", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, performance_1, types_1, pathService_1, actions_1, files_1, textfiles_1, textCodeEditor_1, editor_1, editorOptions_1, binaryEditorModel_1, fileEditorInput_1, files_2, telemetry_1, workspace_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, editorService_1, editorGroupsService_1, editor_2, uriIdentity_1, files_3, panecomposite_1, configuration_1, preferences_1, host_1) {
    "use strict";
    var $aMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aMb = void 0;
    /**
     * An implementation of editor for file system resources.
     */
    let $aMb = class $aMb extends textCodeEditor_1.$Cvb {
        static { $aMb_1 = this; }
        static { this.ID = files_1.$7db; }
        constructor(telemetryService, fileService, f, instantiationService, $, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, Xb, Yb, Zb, $b, ac, bc, cc) {
            super($aMb_1.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
            this.f = f;
            this.$ = $;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            // Clear view state for deleted files
            this.B(this.xb.onDidFilesChange(e => this.dc(e)));
            // Move view state for moved files
            this.B(this.xb.onDidRunOperation(e => this.ec(e)));
        }
        dc(e) {
            for (const resource of e.rawDeleted) {
                this.mb(resource);
            }
        }
        ec(e) {
            if (e.operation === 2 /* FileOperation.MOVE */ && e.target) {
                this.lb(e.resource, e.target.resource, this.Zb.extUri);
            }
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)(0, null);
        }
        get input() {
            return this.X;
        }
        async setInput(input, options, context, token) {
            (0, performance_1.mark)('code/willSetInputToTextFileEditor');
            // Set input and resolve
            await super.setInput(input, options, context, token);
            try {
                const resolvedModel = await input.resolve(options);
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return;
                }
                // There is a special case where the text editor has to handle binary
                // file editor input: if a binary file has been resolved and cached
                // before, it maybe an actual instance of BinaryEditorModel. In this
                // case our text editor has to open this model using the binary editor.
                // We return early in this case.
                if (resolvedModel instanceof binaryEditorModel_1.$Fvb) {
                    return this.gc(input, options);
                }
                const textFileModel = resolvedModel;
                // Editor
                const control = (0, types_1.$uf)(this.a);
                control.setModel(textFileModel.textEditorModel);
                // Restore view state (unless provided by options)
                if (!(0, editor_1.$5E)(options?.viewState)) {
                    const editorViewState = this.kb(input, context);
                    if (editorViewState) {
                        if (options?.selection) {
                            editorViewState.cursorState = []; // prevent duplicate selections via options
                        }
                        control.restoreViewState(editorViewState);
                    }
                }
                // Apply options to editor if any
                if (options) {
                    (0, editorOptions_1.applyTextEditorOptions)(options, control, 1 /* ScrollType.Immediate */);
                }
                // Since the resolved model provides information about being readonly
                // or not, we apply it here to the editor even though the editor input
                // was already asked for being readonly or not. The rationale is that
                // a resolved model might have more specific information about being
                // readonly or not that the input did not have.
                control.updateOptions(this.Gb(textFileModel.isReadonly()));
                if (control.handleInitialized) {
                    control.handleInitialized();
                }
            }
            catch (error) {
                await this.fc(error, input, options);
            }
            (0, performance_1.mark)('code/didSetInputToTextFileEditor');
        }
        async fc(error, input, options) {
            // Handle case where content appears to be binary
            if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
                return this.gc(input, options);
            }
            // Handle case where we were asked to open a folder
            if (error.fileOperationResult === 0 /* FileOperationResult.FILE_IS_DIRECTORY */) {
                const actions = [];
                actions.push((0, actions_1.$li)({
                    id: 'workbench.files.action.openFolder', label: (0, nls_1.localize)(1, null), run: async () => {
                        return this.cc.openWindow([{ folderUri: input.resource }], { forceNewWindow: true });
                    }
                }));
                if (this.$.isInsideWorkspace(input.preferredResource)) {
                    actions.push((0, actions_1.$li)({
                        id: 'workbench.files.action.reveal', label: (0, nls_1.localize)(2, null), run: async () => {
                            await this.f.openPaneComposite(files_1.$Mdb, 0 /* ViewContainerLocation.Sidebar */, true);
                            return this.Yb.select(input.preferredResource, true);
                        }
                    }));
                }
                throw (0, editor_1.$7E)((0, nls_1.localize)(3, null), actions, { forceMessage: true });
            }
            // Handle case where a file is too large to open without confirmation
            if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                let message;
                if (error instanceof files_2.$ok) {
                    message = (0, nls_1.localize)(4, null, files_2.$Ak.formatSize(error.size));
                }
                else {
                    message = (0, nls_1.localize)(5, null);
                }
                throw (0, editor_1.$XE)(this.group, input, options, message, this.bc);
            }
            // Offer to create a file from the error if we have a file not found and the name is valid
            if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */ && await this.$b.hasValidBasename(input.preferredResource)) {
                const fileNotFoundError = (0, editor_1.$7E)(new files_2.$nk((0, nls_1.localize)(6, null), 1 /* FileOperationResult.FILE_NOT_FOUND */), [
                    (0, actions_1.$li)({
                        id: 'workbench.files.action.createMissingFile', label: (0, nls_1.localize)(7, null), run: async () => {
                            await this.Xb.create([{ resource: input.preferredResource }]);
                            return this.u.openEditor({
                                resource: input.preferredResource,
                                options: {
                                    pinned: true // new file gets pinned by default
                                }
                            });
                        }
                    })
                ], {
                    // Support the flow of directly pressing `Enter` on the dialog to
                    // create the file on the go. This is nice when for example following
                    // a link to a file that does not exist to scaffold it quickly.
                    allowDialog: true
                });
                throw fileNotFoundError;
            }
            // Otherwise make sure the error bubbles up
            throw error;
        }
        gc(input, options) {
            const defaultBinaryEditor = this.ac.getValue('workbench.editor.defaultBinaryEditor');
            const group = this.group ?? this.y.activeGroup;
            const editorOptions = {
                ...options,
                // Make sure to not steal away the currently active group
                // because we are triggering another openEditor() call
                // and do not control the initial intent that resulted
                // in us now opening as binary.
                activation: editor_2.EditorActivation.PRESERVE
            };
            // Check configuration and determine whether we open the binary
            // file input in a different editor or going through the same
            // editor.
            // Going through the same editor is debt, and a better solution
            // would be to introduce a real editor for the binary case
            // and avoid enforcing binary or text on the file editor input.
            if (defaultBinaryEditor && defaultBinaryEditor !== '' && defaultBinaryEditor !== editor_1.$HE.id) {
                this.hc(group, defaultBinaryEditor, input, editorOptions);
            }
            else {
                this.ic(group, defaultBinaryEditor, input, editorOptions);
            }
        }
        hc(group, editorId, editor, editorOptions) {
            this.u.replaceEditors([{
                    editor,
                    replacement: { resource: editor.resource, options: { ...editorOptions, override: editorId } }
                }], group);
        }
        ic(group, editorId, editor, editorOptions) {
            // Open binary as text
            if (editorId === editor_1.$HE.id) {
                editor.setForceOpenAsText();
                editor.setPreferredLanguageId(files_1.$0db); // https://github.com/microsoft/vscode/issues/131076
                editorOptions = { ...editorOptions, forceReload: true }; // Same pane and same input, must force reload to clear cached state
            }
            // Open as binary
            else {
                editor.setForceOpenAsBinary();
            }
            group.openEditor(editor, editorOptions);
        }
        clearInput() {
            super.clearInput();
            // Clear Model
            this.a?.setModel(null);
        }
        Lb(parent, initialOptions) {
            (0, performance_1.mark)('code/willCreateTextFileEditorControl');
            super.Lb(parent, initialOptions);
            (0, performance_1.mark)('code/didCreateTextFileEditorControl');
        }
        ob(input) {
            return input instanceof fileEditorInput_1.$ULb;
        }
        pb() {
            return true; // track view state even for disposed editors
        }
    };
    exports.$aMb = $aMb;
    exports.$aMb = $aMb = $aMb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, files_2.$6j),
        __param(2, panecomposite_1.$Yeb),
        __param(3, instantiation_1.$Ah),
        __param(4, workspace_1.$Kh),
        __param(5, storage_1.$Vo),
        __param(6, textResourceConfiguration_1.$FA),
        __param(7, editorService_1.$9C),
        __param(8, themeService_1.$gv),
        __param(9, editorGroupsService_1.$5C),
        __param(10, textfiles_1.$JD),
        __param(11, files_3.$xHb),
        __param(12, uriIdentity_1.$Ck),
        __param(13, pathService_1.$yJ),
        __param(14, configuration_1.$8h),
        __param(15, preferences_1.$BE),
        __param(16, host_1.$VT)
    ], $aMb);
});
//# sourceMappingURL=textFileEditor.js.map