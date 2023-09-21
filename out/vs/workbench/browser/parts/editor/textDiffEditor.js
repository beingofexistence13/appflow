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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/textDiffEditorModel", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/uri", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/base/browser/dom", "vs/platform/files/common/files", "vs/workbench/services/preferences/common/preferences", "vs/base/common/stopwatch", "vs/editor/browser/widget/diffEditor/diffEditorWidget"], function (require, exports, nls_1, objects_1, types_1, textEditor_1, editor_1, editorOptions_1, diffEditorInput_1, textDiffEditorModel_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, platform_1, uri_1, editorGroupsService_1, editorService_1, editor_2, contextkey_1, resources_1, dom_1, files_1, preferences_1, stopwatch_1, diffEditorWidget_1) {
    "use strict";
    var TextDiffEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextDiffEditor = void 0;
    /**
     * The text editor that leverages the diff text editor for the editing experience.
     */
    let TextDiffEditor = class TextDiffEditor extends textEditor_1.AbstractTextEditor {
        static { TextDiffEditor_1 = this; }
        static { this.ID = editor_1.TEXT_DIFF_EDITOR_ID; }
        get scopedContextKeyService() {
            if (!this.diffEditorControl) {
                return undefined;
            }
            const originalEditor = this.diffEditorControl.getOriginalEditor();
            const modifiedEditor = this.diffEditorControl.getModifiedEditor();
            return (originalEditor.hasTextFocus() ? originalEditor : modifiedEditor).invokeWithinContext(accessor => accessor.get(contextkey_1.IContextKeyService));
        }
        constructor(telemetryService, instantiationService, storageService, configurationService, editorService, themeService, editorGroupService, fileService, preferencesService) {
            super(TextDiffEditor_1.ID, telemetryService, instantiationService, storageService, configurationService, themeService, editorService, editorGroupService, fileService);
            this.preferencesService = preferencesService;
            this.diffEditorControl = undefined;
            this.inputLifecycleStopWatch = undefined;
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('textDiffEditor', "Text Diff Editor");
        }
        createEditorControl(parent, configuration) {
            this.diffEditorControl = this._register(this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, parent, configuration, {}));
        }
        updateEditorControlOptions(options) {
            this.diffEditorControl?.updateOptions(options);
        }
        getMainControl() {
            return this.diffEditorControl?.getModifiedEditor();
        }
        async setInput(input, options, context, token) {
            // Cleanup previous things associated with the input
            this.inputLifecycleStopWatch = undefined;
            // Set input and resolve
            await super.setInput(input, options, context, token);
            try {
                const resolvedModel = await input.resolve(options);
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Fallback to open as binary if not text
                if (!(resolvedModel instanceof textDiffEditorModel_1.TextDiffEditorModel)) {
                    this.openAsBinary(input, options);
                    return undefined;
                }
                // Set Editor Model
                const control = (0, types_1.assertIsDefined)(this.diffEditorControl);
                const resolvedDiffEditorModel = resolvedModel;
                const vm = resolvedDiffEditorModel.textDiffEditorModel ? control.createViewModel(resolvedDiffEditorModel.textDiffEditorModel) : null;
                await vm?.waitForDiff();
                control.setModel(vm);
                // Restore view state (unless provided by options)
                let hasPreviousViewState = false;
                if (!(0, editor_1.isTextEditorViewState)(options?.viewState)) {
                    hasPreviousViewState = this.restoreTextDiffEditorViewState(input, options, context, control);
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
                    ...this.getReadonlyConfiguration(resolvedDiffEditorModel.modifiedModel?.isReadonly()),
                    originalEditable: !resolvedDiffEditorModel.originalModel?.isReadonly()
                });
                // Start to measure input lifecycle
                this.inputLifecycleStopWatch = new stopwatch_1.StopWatch(false);
            }
            catch (error) {
                await this.handleSetInputError(error, input, options);
            }
        }
        async handleSetInputError(error, input, options) {
            // Handle case where content appears to be binary
            if (this.isFileBinaryError(error)) {
                return this.openAsBinary(input, options);
            }
            // Handle case where a file is too large to open without confirmation
            if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                let message;
                if (error instanceof files_1.TooLargeFileOperationError) {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithSize', "At least one file is not displayed in the text compare editor because it is very large ({0}).", files_1.ByteSize.formatSize(error.size));
                }
                else {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithoutSize', "At least one file is not displayed in the text compare editor because it is very large.");
                }
                throw (0, editor_1.createTooLargeFileError)(this.group, input, options, message, this.preferencesService);
            }
            // Otherwise make sure the error bubbles up
            throw error;
        }
        restoreTextDiffEditorViewState(editor, options, context, control) {
            const editorViewState = this.loadEditorViewState(editor, context);
            if (editorViewState) {
                if (options?.selection && editorViewState.modified) {
                    editorViewState.modified.cursorState = []; // prevent duplicate selections via options
                }
                control.restoreViewState(editorViewState);
                return true;
            }
            return false;
        }
        openAsBinary(input, options) {
            const original = input.original;
            const modified = input.modified;
            const binaryDiffInput = this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, input.getName(), input.getDescription(), original, modified, true);
            // Forward binary flag to input if supported
            const fileEditorFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).getFileEditorFactory();
            if (fileEditorFactory.isFileEditor(original)) {
                original.setForceOpenAsBinary();
            }
            if (fileEditorFactory.isFileEditor(modified)) {
                modified.setForceOpenAsBinary();
            }
            // Replace this editor with the binary one
            (this.group ?? this.editorGroupService.activeGroup).replaceEditors([{
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
                (0, editorOptions_1.applyTextEditorOptions)(options, (0, types_1.assertIsDefined)(this.diffEditorControl), 0 /* ScrollType.Smooth */);
            }
        }
        shouldHandleConfigurationChangeEvent(e, resource) {
            if (super.shouldHandleConfigurationChangeEvent(e, resource)) {
                return true;
            }
            return e.affectsConfiguration(resource, 'diffEditor') || e.affectsConfiguration(resource, 'accessibility.verbosity.diffEditor');
        }
        computeConfiguration(configuration) {
            const editorConfiguration = super.computeConfiguration(configuration);
            // Handle diff editor specially by merging in diffEditor configuration
            if ((0, types_1.isObject)(configuration.diffEditor)) {
                const diffEditorConfiguration = (0, objects_1.deepClone)(configuration.diffEditor);
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
        getConfigurationOverrides() {
            return {
                ...super.getConfigurationOverrides(),
                ...this.getReadonlyConfiguration(this.input?.isReadonly()),
                originalEditable: this.input instanceof diffEditorInput_1.DiffEditorInput && !this.input.original.isReadonly(),
                lineDecorationsWidth: '2ch'
            };
        }
        updateReadonly(input) {
            if (input instanceof diffEditorInput_1.DiffEditorInput) {
                this.diffEditorControl?.updateOptions({
                    ...this.getReadonlyConfiguration(input.isReadonly()),
                    originalEditable: !input.original.isReadonly(),
                });
            }
            else {
                super.updateReadonly(input);
            }
        }
        isFileBinaryError(error) {
            if (Array.isArray(error)) {
                const errors = error;
                return errors.some(error => this.isFileBinaryError(error));
            }
            return error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */;
        }
        clearInput() {
            super.clearInput();
            // Log input lifecycle telemetry
            const inputLifecycleElapsed = this.inputLifecycleStopWatch?.elapsed();
            this.inputLifecycleStopWatch = undefined;
            if (typeof inputLifecycleElapsed === 'number') {
                this.logInputLifecycleTelemetry(inputLifecycleElapsed, this.getControl()?.getModel()?.modified?.getLanguageId());
            }
            // Clear Model
            this.diffEditorControl?.setModel(null);
        }
        logInputLifecycleTelemetry(duration, languageId) {
            let collapseUnchangedRegions = false;
            if (this.diffEditorControl instanceof diffEditorWidget_1.DiffEditorWidget) {
                collapseUnchangedRegions = this.diffEditorControl.collapseUnchangedRegions;
            }
            this.telemetryService.publicLog2('diffEditor.editorVisibleTime', {
                editorVisibleTimeMs: duration,
                languageId: languageId ?? '',
                collapseUnchangedRegions,
            });
        }
        getControl() {
            return this.diffEditorControl;
        }
        focus() {
            this.diffEditorControl?.focus();
        }
        hasFocus() {
            return this.diffEditorControl?.hasTextFocus() || super.hasFocus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (visible) {
                this.diffEditorControl?.onVisible();
            }
            else {
                this.diffEditorControl?.onHide();
            }
        }
        layout(dimension) {
            this.diffEditorControl?.layout(dimension);
        }
        setBoundarySashes(sashes) {
            this.diffEditorControl?.setBoundarySashes(sashes);
        }
        tracksEditorViewState(input) {
            return input instanceof diffEditorInput_1.DiffEditorInput;
        }
        computeEditorViewState(resource) {
            if (!this.diffEditorControl) {
                return undefined;
            }
            const model = this.diffEditorControl.getModel();
            if (!model || !model.modified || !model.original) {
                return undefined; // view state always needs a model
            }
            const modelUri = this.toEditorViewStateResource(model);
            if (!modelUri) {
                return undefined; // model URI is needed to make sure we save the view state correctly
            }
            if (!(0, resources_1.isEqual)(modelUri, resource)) {
                return undefined; // prevent saving view state for a model that is not the expected one
            }
            return this.diffEditorControl.saveViewState() ?? undefined;
        }
        toEditorViewStateResource(modelOrInput) {
            let original;
            let modified;
            if (modelOrInput instanceof diffEditorInput_1.DiffEditorInput) {
                original = modelOrInput.original.resource;
                modified = modelOrInput.modified.resource;
            }
            else if (!(0, editor_1.isEditorInput)(modelOrInput)) {
                original = modelOrInput.original.uri;
                modified = modelOrInput.modified.uri;
            }
            if (!original || !modified) {
                return undefined;
            }
            // create a URI that is the Base64 concatenation of original + modified resource
            return uri_1.URI.from({ scheme: 'diff', path: `${(0, dom_1.multibyteAwareBtoa)(original.toString())}${(0, dom_1.multibyteAwareBtoa)(modified.toString())}` });
        }
    };
    exports.TextDiffEditor = TextDiffEditor;
    exports.TextDiffEditor = TextDiffEditor = TextDiffEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(4, editorService_1.IEditorService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, files_1.IFileService),
        __param(8, preferences_1.IPreferencesService)
    ], TextDiffEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dERpZmZFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvdGV4dERpZmZFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DaEc7O09BRUc7SUFDSSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsK0JBQXdDOztpQkFDM0QsT0FBRSxHQUFHLDRCQUFtQixBQUF0QixDQUF1QjtRQU16QyxJQUFhLHVCQUF1QjtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUM1QixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRWxFLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUM1SSxDQUFDO1FBRUQsWUFDb0IsZ0JBQW1DLEVBQy9CLG9CQUEyQyxFQUNqRCxjQUErQixFQUNiLG9CQUF1RCxFQUMxRSxhQUE2QixFQUM5QixZQUEyQixFQUNwQixrQkFBd0MsRUFDaEQsV0FBeUIsRUFDbEIsa0JBQXdEO1lBRTdFLEtBQUssQ0FBQyxnQkFBYyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFB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