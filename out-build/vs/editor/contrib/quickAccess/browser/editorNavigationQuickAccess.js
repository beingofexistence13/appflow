/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/common/model", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/base/browser/ui/aria/aria"], function (require, exports, functional_1, lifecycle_1, editorBrowser_1, model_1, editorColorRegistry_1, themeService_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yMb = void 0;
    /**
     * A reusable quick access provider for the editor with support
     * for adding decorations for navigating in the currently active file
     * (for example "Go to line", "Go to symbol").
     */
    class $yMb {
        constructor(a) {
            this.a = a;
            //#endregion
            //#region Decorations Utils
            this.j = undefined;
        }
        //#region Provider methods
        provide(picker, token) {
            const disposables = new lifecycle_1.$jc();
            // Apply options if any
            picker.canAcceptInBackground = !!this.a?.canAcceptInBackground;
            // Disable filtering & sorting, we control the results
            picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
            // Provide based on current active editor
            const pickerDisposable = disposables.add(new lifecycle_1.$lc());
            pickerDisposable.value = this.b(picker, token);
            // Re-create whenever the active editor changes
            disposables.add(this.h(() => {
                // Clear old
                pickerDisposable.value = undefined;
                // Add new
                pickerDisposable.value = this.b(picker, token);
            }));
            return disposables;
        }
        b(picker, token) {
            const disposables = new lifecycle_1.$jc();
            // With text control
            const editor = this.i;
            if (editor && this.c(editor)) {
                const context = { editor };
                // Restore any view state if this picker was closed
                // without actually going to a line
                const codeEditor = (0, editorBrowser_1.$lV)(editor);
                if (codeEditor) {
                    // Remember view state and update it when the cursor position
                    // changes even later because it could be that the user has
                    // configured quick access to remain open when focus is lost and
                    // we always want to restore the current location.
                    let lastKnownEditorViewState = editor.saveViewState() ?? undefined;
                    disposables.add(codeEditor.onDidChangeCursorPosition(() => {
                        lastKnownEditorViewState = editor.saveViewState() ?? undefined;
                    }));
                    context.restoreViewState = () => {
                        if (lastKnownEditorViewState && editor === this.i) {
                            editor.restoreViewState(lastKnownEditorViewState);
                        }
                    };
                    disposables.add((0, functional_1.$bb)(token.onCancellationRequested)(() => context.restoreViewState?.()));
                }
                // Clean up decorations on dispose
                disposables.add((0, lifecycle_1.$ic)(() => this.clearDecorations(editor)));
                // Ask subclass for entries
                disposables.add(this.d(context, picker, token));
            }
            // Without text control
            else {
                disposables.add(this.e(picker, token));
            }
            return disposables;
        }
        /**
         * Subclasses to implement if they can operate on the text editor.
         */
        c(editor) {
            return true;
        }
        f({ editor }, options) {
            editor.setSelection(options.range);
            editor.revealRangeInCenter(options.range, 0 /* ScrollType.Smooth */);
            if (!options.preserveFocus) {
                editor.focus();
            }
            const model = editor.getModel();
            if (model && 'getLineContent' in model) {
                (0, aria_1.$_P)(`${model.getLineContent(options.range.startLineNumber)}`);
            }
        }
        g(editor) {
            return (0, editorBrowser_1.$jV)(editor) ?
                editor.getModel()?.modified :
                editor.getModel();
        }
        addDecorations(editor, range) {
            editor.changeDecorations(changeAccessor => {
                // Reset old decorations if any
                const deleteDecorations = [];
                if (this.j) {
                    deleteDecorations.push(this.j.overviewRulerDecorationId);
                    deleteDecorations.push(this.j.rangeHighlightId);
                    this.j = undefined;
                }
                // Add new decorations for the range
                const newDecorations = [
                    // highlight the entire line on the range
                    {
                        range,
                        options: {
                            description: 'quick-access-range-highlight',
                            className: 'rangeHighlight',
                            isWholeLine: true
                        }
                    },
                    // also add overview ruler highlight
                    {
                        range,
                        options: {
                            description: 'quick-access-range-highlight-overview',
                            overviewRuler: {
                                color: (0, themeService_1.$hv)(editorColorRegistry_1.$rB),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ];
                const [rangeHighlightId, overviewRulerDecorationId] = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
                this.j = { rangeHighlightId, overviewRulerDecorationId };
            });
        }
        clearDecorations(editor) {
            const rangeHighlightDecorationId = this.j;
            if (rangeHighlightDecorationId) {
                editor.changeDecorations(changeAccessor => {
                    changeAccessor.deltaDecorations([
                        rangeHighlightDecorationId.overviewRulerDecorationId,
                        rangeHighlightDecorationId.rangeHighlightId
                    ], []);
                });
                this.j = undefined;
            }
        }
    }
    exports.$yMb = $yMb;
});
//# sourceMappingURL=editorNavigationQuickAccess.js.map