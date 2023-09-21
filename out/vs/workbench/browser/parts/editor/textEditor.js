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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/event", "vs/base/common/types", "vs/base/common/lifecycle", "vs/workbench/browser/editor", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files"], function (require, exports, nls_1, objects_1, event_1, types_1, lifecycle_1, editor_1, editorWithViewState_1, storage_1, instantiation_1, telemetry_1, themeService_1, textResourceConfiguration_1, editorGroupsService_1, editorService_1, files_1) {
    "use strict";
    var AbstractTextEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextEditorPaneSelection = exports.AbstractTextEditor = void 0;
    /**
     * The base class of editors that leverage any kind of text editor for the editing experience.
     */
    let AbstractTextEditor = class AbstractTextEditor extends editorWithViewState_1.AbstractEditorWithViewState {
        static { AbstractTextEditor_1 = this; }
        static { this.VIEW_STATE_PREFERENCE_KEY = 'textEditorViewState'; }
        constructor(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService) {
            super(id, AbstractTextEditor_1.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this.fileService = fileService;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this.inputListener = this._register(new lifecycle_1.MutableDisposable());
            // Listen to configuration changes
            this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.handleConfigurationChangeEvent(e)));
            // ARIA: if a group is added or removed, update the editor's ARIA
            // label so that it appears in the label for when there are > 1 groups
            this._register(event_1.Event.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
                const ariaLabel = this.computeAriaLabel();
                this.editorContainer?.setAttribute('aria-label', ariaLabel);
                this.updateEditorControlOptions({ ariaLabel });
            }));
            // Listen to file system provider changes
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProvider(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProvider(e.scheme)));
        }
        handleConfigurationChangeEvent(e) {
            const resource = this.getActiveResource();
            if (!this.shouldHandleConfigurationChangeEvent(e, resource)) {
                return;
            }
            if (this.isVisible()) {
                this.updateEditorConfiguration(resource);
            }
            else {
                this.hasPendingConfigurationChange = true;
            }
        }
        shouldHandleConfigurationChangeEvent(e, resource) {
            return e.affectsConfiguration(resource, 'editor');
        }
        consumePendingConfigurationChangeEvent() {
            if (this.hasPendingConfigurationChange) {
                this.updateEditorConfiguration();
                this.hasPendingConfigurationChange = false;
            }
        }
        computeConfiguration(configuration) {
            // Specific editor options always overwrite user configuration
            const editorConfiguration = (0, types_1.isObject)(configuration.editor) ? (0, objects_1.deepClone)(configuration.editor) : Object.create(null);
            Object.assign(editorConfiguration, this.getConfigurationOverrides());
            // ARIA label
            editorConfiguration.ariaLabel = this.computeAriaLabel();
            return editorConfiguration;
        }
        computeAriaLabel() {
            return this._input ? (0, editor_1.computeEditorAriaLabel)(this._input, undefined, this.group, this.editorGroupService.count) : (0, nls_1.localize)('editor', "Editor");
        }
        onDidChangeFileSystemProvider(scheme) {
            if (!this.input) {
                return;
            }
            if (this.getActiveResource()?.scheme === scheme) {
                this.updateReadonly(this.input);
            }
        }
        onDidChangeInputCapabilities(input) {
            if (this.input === input) {
                this.updateReadonly(input);
            }
        }
        updateReadonly(input) {
            this.updateEditorControlOptions({ ...this.getReadonlyConfiguration(input.isReadonly()) });
        }
        getReadonlyConfiguration(isReadonly) {
            return {
                readOnly: !!isReadonly,
                readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
            };
        }
        getConfigurationOverrides() {
            return {
                overviewRulerLanes: 3,
                lineNumbersMinChars: 3,
                fixedOverflowWidgets: true,
                ...this.getReadonlyConfiguration(this.input?.isReadonly()),
                renderValidationDecorations: 'on' // render problems even in readonly editors (https://github.com/microsoft/vscode/issues/89057)
            };
        }
        createEditor(parent) {
            // Create editor control
            this.editorContainer = parent;
            this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
            // Listeners
            this.registerCodeEditorListeners();
        }
        registerCodeEditorListeners() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
                this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
                this._register(mainControl.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e) })));
                this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            }
        }
        toEditorPaneSelectionChangeReason(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        getSelection() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                const selection = mainControl.getSelection();
                if (selection) {
                    return new TextEditorPaneSelection(selection);
                }
            }
            return undefined;
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Update our listener for input capabilities
            this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
            // Update editor options after having set the input. We do this because there can be
            // editor input specific options (e.g. an ARIA label depending on the input showing)
            this.updateEditorConfiguration();
            // Update aria label on editor
            const editorContainer = (0, types_1.assertIsDefined)(this.editorContainer);
            editorContainer.setAttribute('aria-label', this.computeAriaLabel());
        }
        clearInput() {
            // Clear input listener
            this.inputListener.clear();
            super.clearInput();
        }
        setEditorVisible(visible, group) {
            if (visible) {
                this.consumePendingConfigurationChangeEvent();
            }
            super.setEditorVisible(visible, group);
        }
        toEditorViewStateResource(input) {
            return input.resource;
        }
        updateEditorConfiguration(resource = this.getActiveResource()) {
            let configuration = undefined;
            if (resource) {
                configuration = this.textResourceConfigurationService.getValue(resource);
            }
            if (!configuration) {
                return;
            }
            const editorConfiguration = this.computeConfiguration(configuration);
            // Try to figure out the actual editor options that changed from the last time we updated the editor.
            // We do this so that we are not overwriting some dynamic editor settings (e.g. word wrap) that might
            // have been applied to the editor directly.
            let editorSettingsToApply = editorConfiguration;
            if (this.lastAppliedEditorOptions) {
                editorSettingsToApply = (0, objects_1.distinct)(this.lastAppliedEditorOptions, editorSettingsToApply);
            }
            if (Object.keys(editorSettingsToApply).length > 0) {
                this.lastAppliedEditorOptions = editorConfiguration;
                this.updateEditorControlOptions(editorSettingsToApply);
            }
        }
        getActiveResource() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                const model = mainControl.getModel();
                if (model) {
                    return model.uri;
                }
            }
            if (this.input) {
                return this.input.resource;
            }
            return undefined;
        }
        dispose() {
            this.lastAppliedEditorOptions = undefined;
            super.dispose();
        }
    };
    exports.AbstractTextEditor = AbstractTextEditor;
    exports.AbstractTextEditor = AbstractTextEditor = AbstractTextEditor_1 = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, files_1.IFileService)
    ], AbstractTextEditor);
    class TextEditorPaneSelection {
        static { this.TEXT_EDITOR_SELECTION_THRESHOLD = 10; } // number of lines to move in editor to justify for significant change
        constructor(textSelection) {
            this.textSelection = textSelection;
        }
        compare(other) {
            if (!(other instanceof TextEditorPaneSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
            const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
            if (thisLineNumber === otherLineNumber) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
                return 2 /* EditorPaneSelectionCompareResult.SIMILAR */; // when in close proximity, treat selection as being similar
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const textEditorOptions = {
                ...options,
                selection: this.textSelection,
                selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
            };
            return textEditorOptions;
        }
        log() {
            return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
        }
    }
    exports.TextEditorPaneSelection = TextEditorPaneSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci90ZXh0RWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF1Q2hHOztPQUVHO0lBQ0ksSUFBZSxrQkFBa0IsR0FBakMsTUFBZSxrQkFBK0MsU0FBUSxpREFBOEI7O2lCQUVsRiw4QkFBeUIsR0FBRyxxQkFBcUIsQUFBeEIsQ0FBeUI7UUFZMUUsWUFDQyxFQUFVLEVBQ1MsZ0JBQW1DLEVBQy9CLG9CQUEyQyxFQUNqRCxjQUErQixFQUNiLGdDQUFtRSxFQUN2RixZQUEyQixFQUMxQixhQUE2QixFQUN2QixrQkFBd0MsRUFDaEQsV0FBNEM7WUFFMUQsS0FBSyxDQUFDLEVBQUUsRUFBRSxvQkFBa0IsQ0FBQyx5QkFBeUIsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsZ0NBQWdDLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBRmxLLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBbkJ4QywwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFtQyxDQUFDLENBQUM7WUFDakcseUJBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQU9oRCxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFleEUsa0NBQWtDO1lBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1SCxpRUFBaUU7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