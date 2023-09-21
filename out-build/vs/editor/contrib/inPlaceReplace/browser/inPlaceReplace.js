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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/services/editorWorker", "vs/nls!vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace", "./inPlaceReplaceCommand", "vs/css!./inPlaceReplace"], function (require, exports, async_1, errors_1, editorState_1, editorExtensions_1, range_1, selection_1, editorContextKeys_1, textModel_1, editorWorker_1, nls, inPlaceReplaceCommand_1) {
    "use strict";
    var InPlaceReplaceController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let InPlaceReplaceController = class InPlaceReplaceController {
        static { InPlaceReplaceController_1 = this; }
        static { this.ID = 'editor.contrib.inPlaceReplaceController'; }
        static get(editor) {
            return editor.getContribution(InPlaceReplaceController_1.ID);
        }
        static { this.a = textModel_1.$RC.register({
            description: 'in-place-replace',
            className: 'valueSetReplacement'
        }); }
        constructor(editor, editorWorkerService) {
            this.b = editor;
            this.c = editorWorkerService;
            this.d = this.b.createDecorationsCollection();
        }
        dispose() {
        }
        run(source, up) {
            // cancel any pending request
            this.e?.cancel();
            const editorSelection = this.b.getSelection();
            const model = this.b.getModel();
            if (!model || !editorSelection) {
                return undefined;
            }
            let selection = editorSelection;
            if (selection.startLineNumber !== selection.endLineNumber) {
                // Can't accept multiline selection
                return undefined;
            }
            const state = new editorState_1.$s1(this.b, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
            const modelURI = model.uri;
            if (!this.c.canNavigateValueSet(modelURI)) {
                return Promise.resolve(undefined);
            }
            this.e = (0, async_1.$ug)(token => this.c.navigateValueSet(modelURI, selection, up));
            return this.e.then(result => {
                if (!result || !result.range || !result.value) {
                    // No proper result
                    return;
                }
                if (!state.validate(this.b)) {
                    // state has changed
                    return;
                }
                // Selection
                const editRange = range_1.$ks.lift(result.range);
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
                    selection = new selection_1.$ms(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn + diff - 1);
                }
                // Insert new text
                const command = new inPlaceReplaceCommand_1.$t9(editRange, selection, result.value);
                this.b.pushUndoStop();
                this.b.executeCommand(source, command);
                this.b.pushUndoStop();
                // add decoration
                this.d.set([{
                        range: highlightRange,
                        options: InPlaceReplaceController_1.a
                    }]);
                // remove decoration after delay
                this.f?.cancel();
                this.f = (0, async_1.$Hg)(350);
                this.f.then(() => this.d.clear()).catch(errors_1.$Y);
            }).catch(errors_1.$Y);
        }
    };
    InPlaceReplaceController = InPlaceReplaceController_1 = __decorate([
        __param(1, editorWorker_1.$4Y)
    ], InPlaceReplaceController);
    class InPlaceReplaceUp extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inPlaceReplace.up',
                label: nls.localize(0, null),
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
    class InPlaceReplaceDown extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inPlaceReplace.down',
                label: nls.localize(1, null),
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
    (0, editorExtensions_1.$AV)(InPlaceReplaceController.ID, InPlaceReplaceController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)(InPlaceReplaceUp);
    (0, editorExtensions_1.$xV)(InPlaceReplaceDown);
});
//# sourceMappingURL=inPlaceReplace.js.map