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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/services/editorWorker", "vs/nls", "./inPlaceReplaceCommand", "vs/css!./inPlaceReplace"], function (require, exports, async_1, errors_1, editorState_1, editorExtensions_1, range_1, selection_1, editorContextKeys_1, textModel_1, editorWorker_1, nls, inPlaceReplaceCommand_1) {
    "use strict";
    var InPlaceReplaceController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let InPlaceReplaceController = class InPlaceReplaceController {
        static { InPlaceReplaceController_1 = this; }
        static { this.ID = 'editor.contrib.inPlaceReplaceController'; }
        static get(editor) {
            return editor.getContribution(InPlaceReplaceController_1.ID);
        }
        static { this.DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'in-place-replace',
            className: 'valueSetReplacement'
        }); }
        constructor(editor, editorWorkerService) {
            this.editor = editor;
            this.editorWorkerService = editorWorkerService;
            this.decorations = this.editor.createDecorationsCollection();
        }
        dispose() {
        }
        run(source, up) {
            // cancel any pending request
            this.currentRequest?.cancel();
            const editorSelection = this.editor.getSelection();
            const model = this.editor.getModel();
            if (!model || !editorSelection) {
                return undefined;
            }
            let selection = editorSelection;
            if (selection.startLineNumber !== selection.endLineNumber) {
                // Can't accept multiline selection
                return undefined;
            }
            const state = new editorState_1.EditorState(this.editor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
            const modelURI = model.uri;
            if (!this.editorWorkerService.canNavigateValueSet(modelURI)) {
                return Promise.resolve(undefined);
            }
            this.currentRequest = (0, async_1.createCancelablePromise)(token => this.editorWorkerService.navigateValueSet(modelURI, selection, up));
            return this.currentRequest.then(result => {
                if (!result || !result.range || !result.value) {
                    // No proper result
                    return;
                }
                if (!state.validate(this.editor)) {
                    // state has changed
                    return;
                }
                // Selection
                const editRange = range_1.Range.lift(result.range);
                let highlightRange = result.range;
                const diff = result.value.length - (selection.endColumn - selection.startColumn);
                // highlight
                highlightRange = {
                    startLineNumber: highlightRange.startLineNumber,
                    startColumn: highlightRange.startColumn,
                    endLineNumber: highlightRange.endLineNumber,
                    endColumn: highlightRange.startColumn + result.value.length
                };
                if (diff > 1) {
                    selection = new selection_1.Selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn + diff - 1);
                }
                // Insert new text
                const command = new inPlaceReplaceCommand_1.InPlaceReplaceCommand(editRange, selection, result.value);
                this.editor.pushUndoStop();
                this.editor.executeCommand(source, command);
                this.editor.pushUndoStop();
                // add decoration
                this.decorations.set([{
                        range: highlightRange,
                        options: InPlaceReplaceController_1.DECORATION
                    }]);
                // remove decoration after delay
                this.decorationRemover?.cancel();
                this.decorationRemover = (0, async_1.timeout)(350);
                this.decorationRemover.then(() => this.decorations.clear()).catch(errors_1.onUnexpectedError);
            }).catch(errors_1.onUnexpectedError);
        }
    };
    InPlaceReplaceController = InPlaceReplaceController_1 = __decorate([
        __param(1, editorWorker_1.IEditorWorkerService)
    ], InPlaceReplaceController);
    class InPlaceReplaceUp extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inPlaceReplace.up',
                label: nls.localize('InPlaceReplaceAction.previous.label', "Replace with Previous Value"),
                alias: 'Replace with Previous Value',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 87 /* KeyCode.Comma */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = InPlaceReplaceController.get(editor);
            if (!controller) {
                return Promise.resolve(undefined);
            }
            return controller.run(this.id, false);
        }
    }
    class InPlaceReplaceDown extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.inPlaceReplace.down',
                label: nls.localize('InPlaceReplaceAction.next.label', "Replace with Next Value"),
                alias: 'Replace with Next Value',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = InPlaceReplaceController.get(editor);
            if (!controller) {
                return Promise.resolve(undefined);
            }
            return controller.run(this.id, true);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(InPlaceReplaceController.ID, InPlaceReplaceController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(InPlaceReplaceUp);
    (0, editorExtensions_1.registerEditorAction)(InPlaceReplaceDown);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5QbGFjZVJlcGxhY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pblBsYWNlUmVwbGFjZS9icm93c2VyL2luUGxhY2VSZXBsYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7O2lCQUVOLE9BQUUsR0FBRyx5Q0FBeUMsQUFBNUMsQ0FBNkM7UUFFdEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQTJCLDBCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7aUJBRXVCLGVBQVUsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDcEUsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixTQUFTLEVBQUUscUJBQXFCO1NBQ2hDLENBQUMsQUFIZ0MsQ0FHL0I7UUFRSCxZQUNDLE1BQW1CLEVBQ0csbUJBQXlDO1lBRS9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztZQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUM5RCxDQUFDO1FBRU0sT0FBTztRQUNkLENBQUM7UUFFTSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQVc7WUFFckMsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFFOUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FB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