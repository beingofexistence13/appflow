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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/theme/common/themeService", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/platform/editor/common/editor", "vs/workbench/browser/editor", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/files/common/files", "vs/base/common/errorMessage", "vs/platform/dialogs/common/dialogs", "vs/base/common/strings", "vs/css!./media/editorplaceholder"], function (require, exports, nls_1, severity_1, editor_1, editorPane_1, telemetry_1, scrollableElement_1, themeService_1, dom_1, lifecycle_1, storage_1, types_1, commands_1, workspace_1, editor_2, editor_3, button_1, defaultStyles_1, simpleIconLabel_1, files_1, errorMessage_1, dialogs_1, strings_1) {
    "use strict";
    var EditorPlaceholder_1, WorkspaceTrustRequiredPlaceholderEditor_1, ErrorPlaceholderEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorPlaceholderEditor = exports.WorkspaceTrustRequiredPlaceholderEditor = exports.EditorPlaceholder = void 0;
    let EditorPlaceholder = class EditorPlaceholder extends editorPane_1.EditorPane {
        static { EditorPlaceholder_1 = this; }
        static { this.PLACEHOLDER_LABEL_MAX_LENGTH = 1024; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this.inputDisposable = this._register(new lifecycle_1.MutableDisposable());
        }
        createEditor(parent) {
            // Container
            this.container = document.createElement('div');
            this.container.className = 'monaco-editor-pane-placeholder';
            this.container.style.outline = 'none';
            this.container.tabIndex = 0; // enable focus support from the editor part (do not remove)
            // Custom Scrollbars
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.container, { horizontal: 1 /* ScrollbarVisibility.Auto */, vertical: 1 /* ScrollbarVisibility.Auto */ }));
            parent.appendChild(this.scrollbar.getDomNode());
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }
            // Render Input
            this.inputDisposable.value = await this.renderInput(input, options);
        }
        async renderInput(input, options) {
            const [container, scrollbar] = (0, types_1.assertAllDefined)(this.container, this.scrollbar);
            // Reset any previous contents
            (0, dom_1.clearNode)(container);
            // Delegate to implementation for contents
            const disposables = new lifecycle_1.DisposableStore();
            const { icon, label, actions } = await this.getContents(input, options, disposables);
            const truncatedLabel = (0, strings_1.truncate)(label, EditorPlaceholder_1.PLACEHOLDER_LABEL_MAX_LENGTH);
            // Icon
            const iconContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-icon-container'));
            const iconWidget = new simpleIconLabel_1.SimpleIconLabel(iconContainer);
            iconWidget.text = icon;
            // Label
            const labelContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-label-container'));
            const labelWidget = document.createElement('span');
            labelWidget.textContent = truncatedLabel;
            labelContainer.appendChild(labelWidget);
            // ARIA label
            container.setAttribute('aria-label', `${(0, editor_3.computeEditorAriaLabel)(input, undefined, this.group, undefined)}, ${truncatedLabel}`);
            // Buttons
            if (actions.length) {
                const actionsContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-buttons-container'));
                const buttons = disposables.add(new button_1.ButtonBar(actionsContainer));
                for (let i = 0; i < actions.length; i++) {
                    const button = disposables.add(buttons.addButton({
                        ...defaultStyles_1.defaultButtonStyles,
                        secondary: i !== 0
                    }));
                    button.label = actions[i].label;
                    disposables.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e, true);
                        }
                        actions[i].run();
                    }));
                }
            }
            // Adjust scrollbar
            scrollbar.scanDomNode();
            return disposables;
        }
        clearInput() {
            if (this.container) {
                (0, dom_1.clearNode)(this.container);
            }
            this.inputDisposable.clear();
            super.clearInput();
        }
        layout(dimension) {
            const [container, scrollbar] = (0, types_1.assertAllDefined)(this.container, this.scrollbar);
            // Pass on to Container
            (0, dom_1.size)(container, dimension.width, dimension.height);
            // Adjust scrollbar
            scrollbar.scanDomNode();
            // Toggle responsive class
            container.classList.toggle('max-height-200px', dimension.height <= 200);
        }
        focus() {
            const container = (0, types_1.assertIsDefined)(this.container);
            container.focus();
        }
        dispose() {
            this.container?.remove();
            super.dispose();
        }
    };
    exports.EditorPlaceholder = EditorPlaceholder;
    exports.EditorPlaceholder = EditorPlaceholder = EditorPlaceholder_1 = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService)
    ], EditorPlaceholder);
    let WorkspaceTrustRequiredPlaceholderEditor = class WorkspaceTrustRequiredPlaceholderEditor extends EditorPlaceholder {
        static { WorkspaceTrustRequiredPlaceholderEditor_1 = this; }
        static { this.ID = 'workbench.editors.workspaceTrustRequiredEditor'; }
        static { this.LABEL = (0, nls_1.localize)('trustRequiredEditor', "Workspace Trust Required"); }
        static { this.DESCRIPTOR = editor_3.EditorPaneDescriptor.create(WorkspaceTrustRequiredPlaceholderEditor_1, WorkspaceTrustRequiredPlaceholderEditor_1.ID, WorkspaceTrustRequiredPlaceholderEditor_1.LABEL); }
        constructor(telemetryService, themeService, commandService, workspaceService, storageService) {
            super(WorkspaceTrustRequiredPlaceholderEditor_1.ID, telemetryService, themeService, storageService);
            this.commandService = commandService;
            this.workspaceService = workspaceService;
        }
        getTitle() {
            return WorkspaceTrustRequiredPlaceholderEditor_1.LABEL;
        }
        async getContents() {
            return {
                icon: '$(workspace-untrusted)',
                label: (0, workspace_1.isSingleFolderWorkspaceIdentifier)((0, workspace_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace())) ?
                    (0, nls_1.localize)('requiresFolderTrustText', "The file is not displayed in the editor because trust has not been granted to the folder.") :
                    (0, nls_1.localize)('requiresWorkspaceTrustText', "The file is not displayed in the editor because trust has not been granted to the workspace."),
                actions: [
                    {
                        label: (0, nls_1.localize)('manageTrust', "Manage Workspace Trust"),
                        run: () => this.commandService.executeCommand('workbench.trust.manage')
                    }
                ]
            };
        }
    };
    exports.WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor;
    exports.WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor = WorkspaceTrustRequiredPlaceholderEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, commands_1.ICommandService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, storage_1.IStorageService)
    ], WorkspaceTrustRequiredPlaceholderEditor);
    let ErrorPlaceholderEditor = class ErrorPlaceholderEditor extends EditorPlaceholder {
        static { ErrorPlaceholderEditor_1 = this; }
        static { this.ID = 'workbench.editors.errorEditor'; }
        static { this.LABEL = (0, nls_1.localize)('errorEditor', "Error Editor"); }
        static { this.DESCRIPTOR = editor_3.EditorPaneDescriptor.create(ErrorPlaceholderEditor_1, ErrorPlaceholderEditor_1.ID, ErrorPlaceholderEditor_1.LABEL); }
        constructor(telemetryService, themeService, storageService, fileService, dialogService) {
            super(ErrorPlaceholderEditor_1.ID, telemetryService, themeService, storageService);
            this.fileService = fileService;
            this.dialogService = dialogService;
        }
        async getContents(input, options, disposables) {
            const resource = input.resource;
            const group = this.group;
            const error = options.error;
            const isFileNotFound = error?.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            // Error Label
            let label;
            if (isFileNotFound) {
                label = (0, nls_1.localize)('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found.");
            }
            else if ((0, editor_1.isEditorOpenError)(error) && error.forceMessage) {
                label = error.message;
            }
            else if (error) {
                label = (0, nls_1.localize)('unknownErrorEditorTextWithError', "The editor could not be opened due to an unexpected error: {0}", (0, errorMessage_1.toErrorMessage)(error));
            }
            else {
                label = (0, nls_1.localize)('unknownErrorEditorTextWithoutError', "The editor could not be opened due to an unexpected error.");
            }
            // Error Icon
            let icon = '$(error)';
            if ((0, editor_1.isEditorOpenError)(error)) {
                if (error.forceSeverity === severity_1.default.Info) {
                    icon = '$(info)';
                }
                else if (error.forceSeverity === severity_1.default.Warning) {
                    icon = '$(warning)';
                }
            }
            // Actions
            let actions = undefined;
            if ((0, editor_1.isEditorOpenError)(error) && error.actions.length > 0) {
                actions = error.actions.map(action => {
                    return {
                        label: action.label,
                        run: () => {
                            const result = action.run();
                            if (result instanceof Promise) {
                                result.catch(error => this.dialogService.error((0, errorMessage_1.toErrorMessage)(error)));
                            }
                        }
                    };
                });
            }
            else if (group) {
                actions = [
                    {
                        label: (0, nls_1.localize)('retry', "Try Again"),
                        run: () => group.openEditor(input, { ...options, source: editor_2.EditorOpenSource.USER /* explicit user gesture */ })
                    }
                ];
            }
            // Auto-reload when file is added
            if (group && isFileNotFound && resource && this.fileService.hasProvider(resource)) {
                disposables.add(this.fileService.onDidFilesChange(e => {
                    if (e.contains(resource, 1 /* FileChangeType.ADDED */, 0 /* FileChangeType.UPDATED */)) {
                        group.openEditor(input, options);
                    }
                }));
            }
            return { icon, label, actions: actions ?? [] };
        }
    };
    exports.ErrorPlaceholderEditor = ErrorPlaceholderEditor;
    exports.ErrorPlaceholderEditor = ErrorPlaceholderEditor = ErrorPlaceholderEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, files_1.IFileService),
        __param(4, dialogs_1.IDialogService)
    ], ErrorPlaceholderEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGxhY2Vob2xkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yUGxhY2Vob2xkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTRDekYsSUFBZSxpQkFBaUIsR0FBaEMsTUFBZSxpQkFBa0IsU0FBUSx1QkFBVTs7aUJBRWpDLGlDQUE0QixHQUFHLElBQUksQUFBUCxDQUFRO1FBTTVELFlBQ0MsRUFBVSxFQUNTLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN6QixjQUErQjtZQUVoRCxLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQVJuRCxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7UUFTbEUsQ0FBQztRQUVTLFlBQVksQ0FBQyxNQUFtQjtZQUV6QyxZQUFZO1lBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLGdDQUFnQyxDQUFDO1lBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsNERBQTREO1lBRXpGLG9CQUFvQjtZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3Q0FBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxrQ0FBMEIsRUFBRSxRQUFRLGtDQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hKLE1BQU0sQ0FB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