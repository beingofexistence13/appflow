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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/textDiffEditor", "vs/base/common/objects", "vs/base/common/types", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/textDiffEditorModel", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/uri", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/base/browser/dom", "vs/platform/files/common/files", "vs/workbench/services/preferences/common/preferences", "vs/base/common/stopwatch", "vs/editor/browser/widget/diffEditor/diffEditorWidget"], function (require, exports, nls_1, objects_1, types_1, textEditor_1, editor_1, editorOptions_1, diffEditorInput_1, textDiffEditorModel_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, platform_1, uri_1, editorGroupsService_1, editorService_1, editor_2, contextkey_1, resources_1, dom_1, files_1, preferences_1, stopwatch_1, diffEditorWidget_1) {
    "use strict";
    var $$tb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$tb = void 0;
    /**
     * The text editor that leverages the diff text editor for the editing experience.
     */
    let $$tb = class $$tb extends textEditor_1.$oeb {
        static { $$tb_1 = this; }
        static { this.ID = editor_1.$JE; }
        get scopedContextKeyService() {
            if (!this.a) {
                return undefined;
            }
            const originalEditor = this.a.getOriginalEditor();
            const modifiedEditor = this.a.getModifiedEditor();
            return (originalEditor.hasTextFocus() ? originalEditor : modifiedEditor).invokeWithinContext(accessor => accessor.get(contextkey_1.$3i));
        }
        constructor(telemetryService, instantiationService, storageService, configurationService, editorService, themeService, editorGroupService, fileService, f) {
            super($$tb_1.ID, telemetryService, instantiationService, storageService, configurationService, themeService, editorService, editorGroupService, fileService);
            this.f = f;
            this.a = undefined;
            this.c = undefined;
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)(0, null);
        }
        Lb(parent, configuration) {
            this.a = this.B(this.m.createInstance(diffEditorWidget_1.$6Z, parent, configuration, {}));
        }
        Mb(options) {
            this.a?.updateOptions(options);
        }
        Nb() {
            return this.a?.getModifiedEditor();
        }
        async setInput(input, options, context, token) {
            // Cleanup previous things associated with the input
            this.c = undefined;
            // Set input and resolve
            await super.setInput(input, options, context, token);
            try {
                const resolvedModel = await input.resolve(options);
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Fallback to open as binary if not text
                if (!(resolvedModel instanceof textDiffEditorModel_1.$2eb)) {
                    this.Vb(input, options);
                    return undefined;
                }
                // Set Editor Model
                const control = (0, types_1.$uf)(this.a);
                const resolvedDiffEditorModel = resolvedModel;
                const vm = resolvedDiffEditorModel.textDiffEditorModel ? control.createViewModel(resolvedDiffEditorModel.textDiffEditorModel) : null;
                await vm?.waitForDiff();
                control.setModel(vm);
                // Restore view state (unless provided by options)
                let hasPreviousViewState = false;
                if (!(0, editor_1.$5E)(options?.viewState)) {
                    hasPreviousViewState = this.Ub(input, options, context, control);
                }
                // Apply options to editor if any
                let optionsGotApplied = false;
                if (options) {
                    optionsGotApplied = (0, editorOptions_1.applyTextEditorOptions)(options, control, 1 /* ScrollType.Immediate */);
                }
                if (!optionsGotApplied && !hasPreviousViewState) {
                    control.revealFirstDiff();
                }
                // Since the resolved model provides information about being readonly
                // or not, we apply it here to the editor even though the editor input
                // was already asked for being readonly or not. The rationale is that
                // a resolved model might have more specific information about being
                // readonly or not that the input did not have.
                control.updateOptions({
                    ...this.Gb(resolvedDiffEditorModel.modifiedModel?.isReadonly()),
                    originalEditable: !resolvedDiffEditorModel.originalModel?.isReadonly()
                });
                // Start to measure input lifecycle
                this.c = new stopwatch_1.$bd(false);
            }
            catch (error) {
                await this.Tb(error, input, options);
            }
        }
        async Tb(error, input, options) {
            // Handle case where content appears to be binary
            if (this.$b(error)) {
                return this.Vb(input, options);
            }
            // Handle case where a file is too large to open without confirmation
            if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                let message;
                if (error instanceof files_1.$ok) {
                    message = (0, nls_1.localize)(1, null, files_1.$Ak.formatSize(error.size));
                }
                else {
                    message = (0, nls_1.localize)(2, null);
                }
                throw (0, editor_1.$XE)(this.group, input, options, message, this.f);
            }
            // Otherwise make sure the error bubbles up
            throw error;
        }
        Ub(editor, options, context, control) {
            const editorViewState = this.kb(editor, context);
            if (editorViewState) {
                if (options?.selection && editorViewState.modified) {
                    editorViewState.modified.cursorState = []; // prevent duplicate selections via options
                }
                control.restoreViewState(editorViewState);
                return true;
            }
            return false;
        }
        Vb(input, options) {
            const original = input.original;
            const modified = input.modified;
            const binaryDiffInput = this.m.createInstance(diffEditorInput_1.$3eb, input.getName(), input.getDescription(), original, modified, true);
            // Forward binary flag to input if supported
            const fileEditorFactory = platform_1.$8m.as(editor_1.$GE.EditorFactory).getFileEditorFactory();
            if (fileEditorFactory.isFileEditor(original)) {
                original.setForceOpenAsBinary();
            }
            if (fileEditorFactory.isFileEditor(modified)) {
                modified.setForceOpenAsBinary();
            }
            // Replace this editor with the binary one
            (this.group ?? this.y.activeGroup).replaceEditors([{
                    editor: input,
                    replacement: binaryDiffInput,
                    options: {
                        ...options,
                        // Make sure to not steal away the currently active group
                        // because we are triggering another openEditor() call
                        // and do not control the initial intent that resulted
                        // in us now opening as binary.
                        activation: editor_2.EditorActivation.PRESERVE,
                        pinned: this.group?.isPinned(input),
                        sticky: this.group?.isSticky(input)
                    }
                }]);
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, (0, types_1.$uf)(this.a), 0 /* ScrollType.Smooth */);
            }
        }
        zb(e, resource) {
            if (super.zb(e, resource)) {
                return true;
            }
            return e.affectsConfiguration(resource, 'diffEditor') || e.affectsConfiguration(resource, 'accessibility.verbosity.diffEditor');
        }
        Bb(configuration) {
            const editorConfiguration = super.Bb(configuration);
            // Handle diff editor specially by merging in diffEditor configuration
            if ((0, types_1.$lf)(configuration.diffEditor)) {
                const diffEditorConfiguration = (0, objects_1.$Vm)(configuration.diffEditor);
                // User settings defines `diffEditor.codeLens`, but here we rename that to `diffEditor.diffCodeLens` to avoid collisions with `editor.codeLens`.
                diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
                delete diffEditorConfiguration.codeLens;
                // User settings defines `diffEditor.wordWrap`, but here we rename that to `diffEditor.diffWordWrap` to avoid collisions with `editor.wordWrap`.
                diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
                delete diffEditorConfiguration.wordWrap;
                Object.assign(editorConfiguration, diffEditorConfiguration);
            }
            const verbose = configuration.accessibility?.verbosity?.diffEditor ?? false;
            editorConfiguration.accessibilityVerbose = verbose;
            return editorConfiguration;
        }
        Hb() {
            return {
                ...super.Hb(),
                ...this.Gb(this.input?.isReadonly()),
                originalEditable: this.input instanceof diffEditorInput_1.$3eb && !this.input.original.isReadonly(),
                lineDecorationsWidth: '2ch'
            };
        }
        Fb(input) {
            if (input instanceof diffEditorInput_1.$3eb) {
                this.a?.updateOptions({
                    ...this.Gb(input.isReadonly()),
                    originalEditable: !input.original.isReadonly(),
                });
            }
            else {
                super.Fb(input);
            }
        }
        $b(error) {
            if (Array.isArray(error)) {
                const errors = error;
                return errors.some(error => this.$b(error));
            }
            return error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */;
        }
        clearInput() {
            super.clearInput();
            // Log input lifecycle telemetry
            const inputLifecycleElapsed = this.c?.elapsed();
            this.c = undefined;
            if (typeof inputLifecycleElapsed === 'number') {
                this.ac(inputLifecycleElapsed, this.getControl()?.getModel()?.modified?.getLanguageId());
            }
            // Clear Model
            this.a?.setModel(null);
        }
        ac(duration, languageId) {
            let collapseUnchangedRegions = false;
            if (this.a instanceof diffEditorWidget_1.$6Z) {
                collapseUnchangedRegions = this.a.collapseUnchangedRegions;
            }
            this.P.publicLog2('diffEditor.editorVisibleTime', {
                editorVisibleTimeMs: duration,
                languageId: languageId ?? '',
                collapseUnchangedRegions,
            });
        }
        getControl() {
            return this.a;
        }
        focus() {
            this.a?.focus();
        }
        hasFocus() {
            return this.a?.hasTextFocus() || super.hasFocus();
        }
        bb(visible, group) {
            super.bb(visible, group);
            if (visible) {
                this.a?.onVisible();
            }
            else {
                this.a?.onHide();
            }
        }
        layout(dimension) {
            this.a?.layout(dimension);
        }
        setBoundarySashes(sashes) {
            this.a?.setBoundarySashes(sashes);
        }
        ob(input) {
            return input instanceof diffEditorInput_1.$3eb;
        }
        nb(resource) {
            if (!this.a) {
                return undefined;
            }
            const model = this.a.getModel();
            if (!model || !model.modified || !model.original) {
                return undefined; // view state always needs a model
            }
            const modelUri = this.qb(model);
            if (!modelUri) {
                return undefined; // model URI is needed to make sure we save the view state correctly
            }
            if (!(0, resources_1.$bg)(modelUri, resource)) {
                return undefined; // prevent saving view state for a model that is not the expected one
            }
            return this.a.saveViewState() ?? undefined;
        }
        qb(modelOrInput) {
            let original;
            let modified;
            if (modelOrInput instanceof diffEditorInput_1.$3eb) {
                original = modelOrInput.original.resource;
                modified = modelOrInput.modified.resource;
            }
            else if (!(0, editor_1.$UE)(modelOrInput)) {
                original = modelOrInput.original.uri;
                modified = modelOrInput.modified.uri;
            }
            if (!original || !modified) {
                return undefined;
            }
            // create a URI that is the Base64 concatenation of original + modified resource
            return uri_1.URI.from({ scheme: 'diff', path: `${(0, dom_1.$wP)(original.toString())}${(0, dom_1.$wP)(modified.toString())}` });
        }
    };
    exports.$$tb = $$tb;
    exports.$$tb = $$tb = $$tb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, storage_1.$Vo),
        __param(3, textResourceConfiguration_1.$FA),
        __param(4, editorService_1.$9C),
        __param(5, themeService_1.$gv),
        __param(6, editorGroupsService_1.$5C),
        __param(7, files_1.$6j),
        __param(8, preferences_1.$BE)
    ], $$tb);
});
//# sourceMappingURL=textDiffEditor.js.map