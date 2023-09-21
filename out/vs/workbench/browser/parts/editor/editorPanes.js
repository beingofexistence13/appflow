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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/browser/parts/editor/editor", "vs/base/common/types", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/parts/editor/editorPlaceholder", "vs/platform/editor/common/editor", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/platform/log/common/log", "vs/platform/dialogs/common/dialogs"], function (require, exports, nls_1, event_1, severity_1, lifecycle_1, editor_1, dom_1, platform_1, layoutService_1, instantiation_1, progress_1, editor_2, types_1, workspaceTrust_1, editorPlaceholder_1, editor_3, errors_1, errorMessage_1, log_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorPanes = void 0;
    let EditorPanes = class EditorPanes extends lifecycle_1.Disposable {
        //#endregion
        get minimumWidth() { return this._activeEditorPane?.minimumWidth ?? editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
        get minimumHeight() { return this._activeEditorPane?.minimumHeight ?? editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
        get maximumWidth() { return this._activeEditorPane?.maximumWidth ?? editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
        get maximumHeight() { return this._activeEditorPane?.maximumHeight ?? editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
        get activeEditorPane() { return this._activeEditorPane; }
        constructor(editorGroupParent, editorPanesParent, groupView, layoutService, instantiationService, editorProgressService, workspaceTrustService, logService, dialogService) {
            super();
            this.editorGroupParent = editorGroupParent;
            this.editorPanesParent = editorPanesParent;
            this.groupView = groupView;
            this.layoutService = layoutService;
            this.instantiationService = instantiationService;
            this.editorProgressService = editorProgressService;
            this.workspaceTrustService = workspaceTrustService;
            this.logService = logService;
            this.dialogService = dialogService;
            //#region Events
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidChangeSizeConstraints = this._register(new event_1.Emitter());
            this.onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
            this._activeEditorPane = null;
            this.editorPanes = [];
            this.activeEditorPaneDisposables = this._register(new lifecycle_1.DisposableStore());
            this.editorOperation = this._register(new progress_1.LongRunningOperation(this.editorProgressService));
            this.editorPanesRegistry = platform_1.Registry.as(editor_1.EditorExtensions.EditorPane);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.workspaceTrustService.onDidChangeTrust(() => this.onDidChangeWorkspaceTrust()));
        }
        onDidChangeWorkspaceTrust() {
            // If the active editor pane requires workspace trust
            // we need to re-open it anytime trust changes to
            // account for it.
            // For that we explicitly call into the group-view
            // to handle errors properly.
            const editor = this._activeEditorPane?.input;
            const options = this._activeEditorPane?.options;
            if (editor?.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */)) {
                this.groupView.openEditor(editor, options);
            }
        }
        async openEditor(editor, options, context = Object.create(null)) {
            try {
                return await this.doOpenEditor(this.getEditorPaneDescriptor(editor), editor, options, context);
            }
            catch (error) {
                // First check if caller instructed us to ignore error handling
                if (options?.ignoreError) {
                    return { error };
                }
                // In case of an error when opening an editor, we still want to show
                // an editor in the desired location to preserve the user intent and
                // view state (e.g. when restoring).
                //
                // For that reason we have place holder editors that can convey a
                // message with actions the user can click on.
                return this.doShowError(error, editor, options, context);
            }
        }
        async doShowError(error, editor, options, context) {
            // Always log the error to figure out what is going on
            this.logService.error(error);
            // Show as modal dialog when explicit user action unless disabled
            let errorHandled = false;
            if (options?.source === editor_3.EditorOpenSource.USER && (!(0, editor_1.isEditorOpenError)(error) || error.allowDialog)) {
                errorHandled = await this.doShowErrorDialog(error, editor);
            }
            // Return early if the user dealt with the error already
            if (errorHandled) {
                return { error };
            }
            // Show as editor placeholder: pass over the error to display
            const editorPlaceholderOptions = { ...options };
            if (!(0, errors_1.isCancellationError)(error)) {
                editorPlaceholderOptions.error = error;
            }
            return {
                ...(await this.doOpenEditor(editorPlaceholder_1.ErrorPlaceholderEditor.DESCRIPTOR, editor, editorPlaceholderOptions, context)),
                error
            };
        }
        async doShowErrorDialog(error, editor) {
            let severity = severity_1.default.Error;
            let message = undefined;
            let detail = (0, errorMessage_1.toErrorMessage)(error);
            let errorActions = undefined;
            if ((0, editor_1.isEditorOpenError)(error)) {
                errorActions = error.actions;
                severity = error.forceSeverity ?? severity_1.default.Error;
                if (error.forceMessage) {
                    message = error.message;
                    detail = undefined;
                }
            }
            if (!message) {
                message = (0, nls_1.localize)('editorOpenErrorDialog', "Unable to open '{0}'", editor.getName());
            }
            const buttons = [];
            if (errorActions && errorActions.length > 0) {
                for (const errorAction of errorActions) {
                    buttons.push({
                        label: errorAction.label,
                        run: () => errorAction
                    });
                }
            }
            else {
                buttons.push({
                    label: (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                    run: () => undefined
                });
            }
            let cancelButton = undefined;
            if (buttons.length === 1) {
                cancelButton = {
                    run: () => {
                        errorHandled = true; // treat cancel as handled and do not show placeholder
                        return undefined;
                    }
                };
            }
            let errorHandled = false; // by default, show placeholder
            const { result } = await this.dialogService.prompt({
                type: severity,
                message,
                detail,
                buttons,
                cancelButton
            });
            if (result) {
                const errorActionResult = result.run();
                if (errorActionResult instanceof Promise) {
                    errorActionResult.catch(error => this.dialogService.error((0, errorMessage_1.toErrorMessage)(error)));
                }
                errorHandled = true; // treat custom error action as handled and do not show placeholder
            }
            return errorHandled;
        }
        async doOpenEditor(descriptor, editor, options, context = Object.create(null)) {
            // Editor pane
            const pane = this.doShowEditorPane(descriptor);
            // Remember current active element for deciding to restore focus later
            const activeElement = document.activeElement;
            // Apply input to pane
            const { changed, cancelled } = await this.doSetInput(pane, editor, options, context);
            // Focus only if not cancelled and not prevented
            const focus = !options || !options.preserveFocus;
            if (!cancelled && focus && this.shouldRestoreFocus(activeElement)) {
                pane.focus();
            }
            return { pane, changed, cancelled };
        }
        shouldRestoreFocus(expectedActiveElement) {
            if (!this.layoutService.isRestored()) {
                return true; // restore focus if we are not restored yet on startup
            }
            if (!expectedActiveElement) {
                return true; // restore focus if nothing was focused
            }
            const activeElement = document.activeElement;
            if (!activeElement || activeElement === document.body) {
                return true; // restore focus if nothing is focused currently
            }
            const same = expectedActiveElement === activeElement;
            if (same) {
                return true; // restore focus if same element is still active
            }
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                // This is to avoid regressions from not restoring focus as we used to:
                // Only allow a different input element (or textarea) to remain focused
                // but not other elements that do not accept text input.
                return true;
            }
            if ((0, dom_1.isAncestor)(activeElement, this.editorGroupParent)) {
                return true; // restore focus if active element is still inside our editor group
            }
            return false; // do not restore focus
        }
        getEditorPaneDescriptor(editor) {
            if (editor.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */) && !this.workspaceTrustService.isWorkspaceTrusted()) {
                // Workspace trust: if an editor signals it needs workspace trust
                // but the current workspace is untrusted, we fallback to a generic
                // editor descriptor to indicate this an do NOT load the registered
                // editor.
                return editorPlaceholder_1.WorkspaceTrustRequiredPlaceholderEditor.DESCRIPTOR;
            }
            return (0, types_1.assertIsDefined)(this.editorPanesRegistry.getEditorPane(editor));
        }
        doShowEditorPane(descriptor) {
            // Return early if the currently active editor pane can handle the input
            if (this._activeEditorPane && descriptor.describes(this._activeEditorPane)) {
                return this._activeEditorPane;
            }
            // Hide active one first
            this.doHideActiveEditorPane();
            // Create editor pane
            const editorPane = this.doCreateEditorPane(descriptor);
            // Set editor as active
            this.doSetActiveEditorPane(editorPane);
            // Show editor
            const container = (0, types_1.assertIsDefined)(editorPane.getContainer());
            this.editorPanesParent.appendChild(container);
            (0, dom_1.show)(container);
            // Indicate to editor that it is now visible
            editorPane.setVisible(true, this.groupView);
            // Layout
            if (this.pagePosition) {
                editorPane.layout(new dom_1.Dimension(this.pagePosition.width, this.pagePosition.height), { top: this.pagePosition.top, left: this.pagePosition.left });
            }
            // Boundary sashes
            if (this.boundarySashes) {
                editorPane.setBoundarySashes(this.boundarySashes);
            }
            return editorPane;
        }
        doCreateEditorPane(descriptor) {
            // Instantiate editor
            const editorPane = this.doInstantiateEditorPane(descriptor);
            // Create editor container as needed
            if (!editorPane.getContainer()) {
                const editorPaneContainer = document.createElement('div');
                editorPaneContainer.classList.add('editor-instance');
                editorPane.create(editorPaneContainer);
            }
            return editorPane;
        }
        doInstantiateEditorPane(descriptor) {
            // Return early if already instantiated
            const existingEditorPane = this.editorPanes.find(editorPane => descriptor.describes(editorPane));
            if (existingEditorPane) {
                return existingEditorPane;
            }
            // Otherwise instantiate new
            const editorPane = this._register(descriptor.instantiate(this.instantiationService));
            this.editorPanes.push(editorPane);
            return editorPane;
        }
        doSetActiveEditorPane(editorPane) {
            this._activeEditorPane = editorPane;
            // Clear out previous active editor pane listeners
            this.activeEditorPaneDisposables.clear();
            // Listen to editor pane changes
            if (editorPane) {
                this.activeEditorPaneDisposables.add(editorPane.onDidChangeSizeConstraints(e => this._onDidChangeSizeConstraints.fire(e)));
                this.activeEditorPaneDisposables.add(editorPane.onDidFocus(() => this._onDidFocus.fire()));
            }
            // Indicate that size constraints could have changed due to new editor
            this._onDidChangeSizeConstraints.fire(undefined);
        }
        async doSetInput(editorPane, editor, options, context) {
            // If the input did not change, return early and only
            // apply the options unless the options instruct us to
            // force open it even if it is the same
            const inputMatches = editorPane.input?.matches(editor);
            if (inputMatches && !options?.forceReload) {
                editorPane.setOptions(options);
                return { changed: false, cancelled: false };
            }
            // Start a new editor input operation to report progress
            // and to support cancellation. Any new operation that is
            // started will cancel the previous one.
            const operation = this.editorOperation.start(this.layoutService.isRestored() ? 800 : 3200);
            let cancelled = false;
            try {
                // Clear the current input before setting new input
                // This ensures that a slow loading input will not
                // be visible for the duration of the new input to
                // load (https://github.com/microsoft/vscode/issues/34697)
                editorPane.clearInput();
                // Set the input to the editor pane
                await editorPane.setInput(editor, options, context, operation.token);
                if (!operation.isCurrent()) {
                    cancelled = true;
                }
            }
            catch (error) {
                if (!operation.isCurrent()) {
                    cancelled = true;
                }
                else {
                    throw error;
                }
            }
            finally {
                operation.stop();
            }
            return { changed: !inputMatches, cancelled };
        }
        doHideActiveEditorPane() {
            if (!this._activeEditorPane) {
                return;
            }
            // Stop any running operation
            this.editorOperation.stop();
            // Indicate to editor pane before removing the editor from
            // the DOM to give a chance to persist certain state that
            // might depend on still being the active DOM element.
            this.safeRun(() => this._activeEditorPane?.clearInput());
            this.safeRun(() => this._activeEditorPane?.setVisible(false, this.groupView));
            // Remove editor pane from parent
            const editorPaneContainer = this._activeEditorPane.getContainer();
            if (editorPaneContainer) {
                this.editorPanesParent.removeChild(editorPaneContainer);
                (0, dom_1.hide)(editorPaneContainer);
            }
            // Clear active editor pane
            this.doSetActiveEditorPane(null);
        }
        closeEditor(editor) {
            if (this._activeEditorPane?.input && editor.matches(this._activeEditorPane.input)) {
                this.doHideActiveEditorPane();
            }
        }
        setVisible(visible) {
            this.safeRun(() => this._activeEditorPane?.setVisible(visible, this.groupView));
        }
        layout(pagePosition) {
            this.pagePosition = pagePosition;
            this.safeRun(() => this._activeEditorPane?.layout(new dom_1.Dimension(pagePosition.width, pagePosition.height), pagePosition));
        }
        setBoundarySashes(sashes) {
            this.boundarySashes = sashes;
            this.safeRun(() => this._activeEditorPane?.setBoundarySashes(sashes));
        }
        safeRun(fn) {
            // We delegate many calls to the active editor pane which
            // can be any kind of editor. We must ensure that our calls
            // do not throw, for example in `layout()` because that can
            // mess with the grid layout.
            try {
                fn();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    };
    exports.EditorPanes = EditorPanes;
    exports.EditorPanes = EditorPanes = __decorate([
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, progress_1.IEditorProgressService),
        __param(6, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(7, log_1.ILogService),
        __param(8, dialogs_1.IDialogService)
    ], EditorPanes);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGFuZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yUGFuZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkR6RixJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsc0JBQVU7UUFVMUMsWUFBWTtRQUVaLElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLFlBQVksSUFBSSxzQ0FBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFHLElBQUksYUFBYSxLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsSUFBSSxzQ0FBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdHLElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLFlBQVksSUFBSSxzQ0FBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFHLElBQUksYUFBYSxLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsSUFBSSxzQ0FBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRzdHLElBQUksZ0JBQWdCLEtBQWdDLE9BQU8sSUFBSSxDQUFDLGlCQUE4QyxDQUFDLENBQUMsQ0FBQztRQVVqSCxZQUNTLGlCQUE4QixFQUM5QixpQkFBOEIsRUFDOUIsU0FBMkIsRUFDVixhQUF1RCxFQUN6RCxvQkFBNEQsRUFDM0QscUJBQThELEVBQ3BELHFCQUF3RSxFQUM3RixVQUF3QyxFQUNyQyxhQUE4QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQVZBLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBYTtZQUM5QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWE7WUFDOUIsY0FBUyxHQUFULFNBQVMsQ0FBa0I7WUFD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