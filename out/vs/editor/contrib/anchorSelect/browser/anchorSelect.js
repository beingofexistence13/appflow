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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/htmlContent", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/css!./anchorSelect"], function (require, exports, aria_1, htmlContent_1, keyCodes_1, editorExtensions_1, selection_1, editorContextKeys_1, nls_1, contextkey_1) {
    "use strict";
    var SelectionAnchorController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionAnchorSet = void 0;
    exports.SelectionAnchorSet = new contextkey_1.RawContextKey('selectionAnchorSet', false);
    let SelectionAnchorController = class SelectionAnchorController {
        static { SelectionAnchorController_1 = this; }
        static { this.ID = 'editor.contrib.selectionAnchorController'; }
        static get(editor) {
            return editor.getContribution(SelectionAnchorController_1.ID);
        }
        constructor(editor, contextKeyService) {
            this.editor = editor;
            this.selectionAnchorSetContextKey = exports.SelectionAnchorSet.bindTo(contextKeyService);
            this.modelChangeListener = editor.onDidChangeModel(() => this.selectionAnchorSetContextKey.reset());
        }
        setSelectionAnchor() {
            if (this.editor.hasModel()) {
                const position = this.editor.getPosition();
                this.editor.changeDecorations((accessor) => {
                    if (this.decorationId) {
                        accessor.removeDecoration(this.decorationId);
                    }
                    this.decorationId = accessor.addDecoration(selection_1.Selection.fromPositions(position, position), {
                        description: 'selection-anchor',
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                        hoverMessage: new htmlContent_1.MarkdownString().appendText((0, nls_1.localize)('selectionAnchor', "Selection Anchor")),
                        className: 'selection-anchor'
                    });
                });
                this.selectionAnchorSetContextKey.set(!!this.decorationId);
                (0, aria_1.alert)((0, nls_1.localize)('anchorSet', "Anchor set at {0}:{1}", position.lineNumber, position.column));
            }
        }
        goToSelectionAnchor() {
            if (this.editor.hasModel() && this.decorationId) {
                const anchorPosition = this.editor.getModel().getDecorationRange(this.decorationId);
                if (anchorPosition) {
                    this.editor.setPosition(anchorPosition.getStartPosition());
                }
            }
        }
        selectFromAnchorToCursor() {
            if (this.editor.hasModel() && this.decorationId) {
                const start = this.editor.getModel().getDecorationRange(this.decorationId);
                if (start) {
                    const end = this.editor.getPosition();
                    this.editor.setSelection(selection_1.Selection.fromPositions(start.getStartPosition(), end));
                    this.cancelSelectionAnchor();
                }
            }
        }
        cancelSelectionAnchor() {
            if (this.decorationId) {
                const decorationId = this.decorationId;
                this.editor.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                    this.decorationId = undefined;
                });
                this.selectionAnchorSetContextKey.set(false);
            }
        }
        dispose() {
            this.cancelSelectionAnchor();
            this.modelChangeListener.dispose();
        }
    };
    SelectionAnchorController = SelectionAnchorController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], SelectionAnchorController);
    class SetSelectionAnchor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.setSelectionAnchor',
                label: (0, nls_1.localize)('setSelectionAnchor', "Set Selection Anchor"),
                alias: 'Set Selection Anchor',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.setSelectionAnchor();
        }
    }
    class GoToSelectionAnchor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.goToSelectionAnchor',
                label: (0, nls_1.localize)('goToSelectionAnchor', "Go to Selection Anchor"),
                alias: 'Go to Selection Anchor',
                precondition: exports.SelectionAnchorSet,
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.goToSelectionAnchor();
        }
    }
    class SelectFromAnchorToCursor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.selectFromAnchorToCursor',
                label: (0, nls_1.localize)('selectFromAnchorToCursor', "Select from Anchor to Cursor"),
                alias: 'Select from Anchor to Cursor',
                precondition: exports.SelectionAnchorSet,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
        }
    }
    class CancelSelectionAnchor extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.cancelSelectionAnchor',
                label: (0, nls_1.localize)('cancelSelectionAnchor', "Cancel Selection Anchor"),
                alias: 'Cancel Selection Anchor',
                precondition: exports.SelectionAnchorSet,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.cancelSelectionAnchor();
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(SelectionAnchorController.ID, SelectionAnchorController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(SetSelectionAnchor);
    (0, editorExtensions_1.registerEditorAction)(GoToSelectionAnchor);
    (0, editorExtensions_1.registerEditorAction)(SelectFromAnchorToCursor);
    (0, editorExtensions_1.registerEditorAction)(CancelSelectionAnchor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yU2VsZWN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvYW5jaG9yU2VsZWN0L2Jyb3dzZXIvYW5jaG9yU2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQm5GLFFBQUEsa0JBQWtCLEdBQUcsSUFBSSwwQkFBYSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWpGLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCOztpQkFFUCxPQUFFLEdBQUcsMENBQTBDLEFBQTdDLENBQThDO1FBRXZFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDN0IsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUE0QiwyQkFBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBTUQsWUFDUyxNQUFtQixFQUNQLGlCQUFxQztZQURqRCxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBRzNCLElBQUksQ0FBQyw0QkFBNEIsR0FBRywwQkFBa0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQzFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDdEIsUUFB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