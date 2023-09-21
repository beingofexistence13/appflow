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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorPanes", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/browser/parts/editor/editor", "vs/base/common/types", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/browser/parts/editor/editorPlaceholder", "vs/platform/editor/common/editor", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/platform/log/common/log", "vs/platform/dialogs/common/dialogs"], function (require, exports, nls_1, event_1, severity_1, lifecycle_1, editor_1, dom_1, platform_1, layoutService_1, instantiation_1, progress_1, editor_2, types_1, workspaceTrust_1, editorPlaceholder_1, editor_3, errors_1, errorMessage_1, log_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xxb = void 0;
    let $xxb = class $xxb extends lifecycle_1.$kc {
        //#endregion
        get minimumWidth() { return this.c?.minimumWidth ?? editor_2.$4T.width; }
        get minimumHeight() { return this.c?.minimumHeight ?? editor_2.$4T.height; }
        get maximumWidth() { return this.c?.maximumWidth ?? editor_2.$5T.width; }
        get maximumHeight() { return this.c?.maximumHeight ?? editor_2.$5T.height; }
        get activeEditorPane() { return this.c; }
        constructor(r, s, t, u, w, y, z, C, D) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            //#region Events
            this.a = this.B(new event_1.$fd());
            this.onDidFocus = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeSizeConstraints = this.b.event;
            this.c = null;
            this.f = [];
            this.g = this.B(new lifecycle_1.$jc());
            this.m = this.B(new progress_1.$6u(this.y));
            this.n = platform_1.$8m.as(editor_1.$GE.EditorPane);
            this.F();
        }
        F() {
            this.B(this.z.onDidChangeTrust(() => this.G()));
        }
        G() {
            // If the active editor pane requires workspace trust
            // we need to re-open it anytime trust changes to
            // account for it.
            // For that we explicitly call into the group-view
            // to handle errors properly.
            const editor = this.c?.input;
            const options = this.c?.options;
            if (editor?.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */)) {
                this.t.openEditor(editor, options);
            }
        }
        async openEditor(editor, options, context = Object.create(null)) {
            try {
                return await this.J(this.M(editor), editor, options, context);
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
                return this.H(error, editor, options, context);
            }
        }
        async H(error, editor, options, context) {
            // Always log the error to figure out what is going on
            this.C.error(error);
            // Show as modal dialog when explicit user action unless disabled
            let errorHandled = false;
            if (options?.source === editor_3.EditorOpenSource.USER && (!(0, editor_1.$6E)(error) || error.allowDialog)) {
                errorHandled = await this.I(error, editor);
            }
            // Return early if the user dealt with the error already
            if (errorHandled) {
                return { error };
            }
            // Show as editor placeholder: pass over the error to display
            const editorPlaceholderOptions = { ...options };
            if (!(0, errors_1.$2)(error)) {
                editorPlaceholderOptions.error = error;
            }
            return {
                ...(await this.J(editorPlaceholder_1.$Ivb.DESCRIPTOR, editor, editorPlaceholderOptions, context)),
                error
            };
        }
        async I(error, editor) {
            let severity = severity_1.default.Error;
            let message = undefined;
            let detail = (0, errorMessage_1.$mi)(error);
            let errorActions = undefined;
            if ((0, editor_1.$6E)(error)) {
                errorActions = error.actions;
                severity = error.forceSeverity ?? severity_1.default.Error;
                if (error.forceMessage) {
                    message = error.message;
                    detail = undefined;
                }
            }
            if (!message) {
                message = (0, nls_1.localize)(0, null, editor.getName());
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
                    label: (0, nls_1.localize)(1, null),
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
            const { result } = await this.D.prompt({
                type: severity,
                message,
                detail,
                buttons,
                cancelButton
            });
            if (result) {
                const errorActionResult = result.run();
                if (errorActionResult instanceof Promise) {
                    errorActionResult.catch(error => this.D.error((0, errorMessage_1.$mi)(error)));
                }
                errorHandled = true; // treat custom error action as handled and do not show placeholder
            }
            return errorHandled;
        }
        async J(descriptor, editor, options, context = Object.create(null)) {
            // Editor pane
            const pane = this.N(descriptor);
            // Remember current active element for deciding to restore focus later
            const activeElement = document.activeElement;
            // Apply input to pane
            const { changed, cancelled } = await this.R(pane, editor, options, context);
            // Focus only if not cancelled and not prevented
            const focus = !options || !options.preserveFocus;
            if (!cancelled && focus && this.L(activeElement)) {
                pane.focus();
            }
            return { pane, changed, cancelled };
        }
        L(expectedActiveElement) {
            if (!this.u.isRestored()) {
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
            if ((0, dom_1.$NO)(activeElement, this.r)) {
                return true; // restore focus if active element is still inside our editor group
            }
            return false; // do not restore focus
        }
        M(editor) {
            if (editor.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */) && !this.z.isWorkspaceTrusted()) {
                // Workspace trust: if an editor signals it needs workspace trust
                // but the current workspace is untrusted, we fallback to a generic
                // editor descriptor to indicate this an do NOT load the registered
                // editor.
                return editorPlaceholder_1.$Hvb.DESCRIPTOR;
            }
            return (0, types_1.$uf)(this.n.getEditorPane(editor));
        }
        N(descriptor) {
            // Return early if the currently active editor pane can handle the input
            if (this.c && descriptor.describes(this.c)) {
                return this.c;
            }
            // Hide active one first
            this.S();
            // Create editor pane
            const editorPane = this.O(descriptor);
            // Set editor as active
            this.Q(editorPane);
            // Show editor
            const container = (0, types_1.$uf)(editorPane.getContainer());
            this.s.appendChild(container);
            (0, dom_1.$dP)(container);
            // Indicate to editor that it is now visible
            editorPane.setVisible(true, this.t);
            // Layout
            if (this.h) {
                editorPane.layout(new dom_1.$BO(this.h.width, this.h.height), { top: this.h.top, left: this.h.left });
            }
            // Boundary sashes
            if (this.j) {
                editorPane.setBoundarySashes(this.j);
            }
            return editorPane;
        }
        O(descriptor) {
            // Instantiate editor
            const editorPane = this.P(descriptor);
            // Create editor container as needed
            if (!editorPane.getContainer()) {
                const editorPaneContainer = document.createElement('div');
                editorPaneContainer.classList.add('editor-instance');
                editorPane.create(editorPaneContainer);
            }
            return editorPane;
        }
        P(descriptor) {
            // Return early if already instantiated
            const existingEditorPane = this.f.find(editorPane => descriptor.describes(editorPane));
            if (existingEditorPane) {
                return existingEditorPane;
            }
            // Otherwise instantiate new
            const editorPane = this.B(descriptor.instantiate(this.w));
            this.f.push(editorPane);
            return editorPane;
        }
        Q(editorPane) {
            this.c = editorPane;
            // Clear out previous active editor pane listeners
            this.g.clear();
            // Listen to editor pane changes
            if (editorPane) {
                this.g.add(editorPane.onDidChangeSizeConstraints(e => this.b.fire(e)));
                this.g.add(editorPane.onDidFocus(() => this.a.fire()));
            }
            // Indicate that size constraints could have changed due to new editor
            this.b.fire(undefined);
        }
        async R(editorPane, editor, options, context) {
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
            const operation = this.m.start(this.u.isRestored() ? 800 : 3200);
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
        S() {
            if (!this.c) {
                return;
            }
            // Stop any running operation
            this.m.stop();
            // Indicate to editor pane before removing the editor from
            // the DOM to give a chance to persist certain state that
            // might depend on still being the active DOM element.
            this.U(() => this.c?.clearInput());
            this.U(() => this.c?.setVisible(false, this.t));
            // Remove editor pane from parent
            const editorPaneContainer = this.c.getContainer();
            if (editorPaneContainer) {
                this.s.removeChild(editorPaneContainer);
                (0, dom_1.$eP)(editorPaneContainer);
            }
            // Clear active editor pane
            this.Q(null);
        }
        closeEditor(editor) {
            if (this.c?.input && editor.matches(this.c.input)) {
                this.S();
            }
        }
        setVisible(visible) {
            this.U(() => this.c?.setVisible(visible, this.t));
        }
        layout(pagePosition) {
            this.h = pagePosition;
            this.U(() => this.c?.layout(new dom_1.$BO(pagePosition.width, pagePosition.height), pagePosition));
        }
        setBoundarySashes(sashes) {
            this.j = sashes;
            this.U(() => this.c?.setBoundarySashes(sashes));
        }
        U(fn) {
            // We delegate many calls to the active editor pane which
            // can be any kind of editor. We must ensure that our calls
            // do not throw, for example in `layout()` because that can
            // mess with the grid layout.
            try {
                fn();
            }
            catch (error) {
                this.C.error(error);
            }
        }
    };
    exports.$xxb = $xxb;
    exports.$xxb = $xxb = __decorate([
        __param(3, layoutService_1.$Meb),
        __param(4, instantiation_1.$Ah),
        __param(5, progress_1.$7u),
        __param(6, workspaceTrust_1.$$z),
        __param(7, log_1.$5i),
        __param(8, dialogs_1.$oA)
    ], $xxb);
});
//# sourceMappingURL=editorPanes.js.map