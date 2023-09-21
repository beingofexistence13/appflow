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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/htmlContent", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/anchorSelect/browser/anchorSelect", "vs/platform/contextkey/common/contextkey", "vs/css!./anchorSelect"], function (require, exports, aria_1, htmlContent_1, keyCodes_1, editorExtensions_1, selection_1, editorContextKeys_1, nls_1, contextkey_1) {
    "use strict";
    var SelectionAnchorController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e1 = void 0;
    exports.$e1 = new contextkey_1.$2i('selectionAnchorSet', false);
    let SelectionAnchorController = class SelectionAnchorController {
        static { SelectionAnchorController_1 = this; }
        static { this.ID = 'editor.contrib.selectionAnchorController'; }
        static get(editor) {
            return editor.getContribution(SelectionAnchorController_1.ID);
        }
        constructor(d, contextKeyService) {
            this.d = d;
            this.b = exports.$e1.bindTo(contextKeyService);
            this.c = d.onDidChangeModel(() => this.b.reset());
        }
        setSelectionAnchor() {
            if (this.d.hasModel()) {
                const position = this.d.getPosition();
                this.d.changeDecorations((accessor) => {
                    if (this.a) {
                        accessor.removeDecoration(this.a);
                    }
                    this.a = accessor.addDecoration(selection_1.$ms.fromPositions(position, position), {
                        description: 'selection-anchor',
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                        hoverMessage: new htmlContent_1.$Xj().appendText((0, nls_1.localize)(0, null)),
                        className: 'selection-anchor'
                    });
                });
                this.b.set(!!this.a);
                (0, aria_1.$$P)((0, nls_1.localize)(1, null, position.lineNumber, position.column));
            }
        }
        goToSelectionAnchor() {
            if (this.d.hasModel() && this.a) {
                const anchorPosition = this.d.getModel().getDecorationRange(this.a);
                if (anchorPosition) {
                    this.d.setPosition(anchorPosition.getStartPosition());
                }
            }
        }
        selectFromAnchorToCursor() {
            if (this.d.hasModel() && this.a) {
                const start = this.d.getModel().getDecorationRange(this.a);
                if (start) {
                    const end = this.d.getPosition();
                    this.d.setSelection(selection_1.$ms.fromPositions(start.getStartPosition(), end));
                    this.cancelSelectionAnchor();
                }
            }
        }
        cancelSelectionAnchor() {
            if (this.a) {
                const decorationId = this.a;
                this.d.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                    this.a = undefined;
                });
                this.b.set(false);
            }
        }
        dispose() {
            this.cancelSelectionAnchor();
            this.c.dispose();
        }
    };
    SelectionAnchorController = SelectionAnchorController_1 = __decorate([
        __param(1, contextkey_1.$3i)
    ], SelectionAnchorController);
    class SetSelectionAnchor extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.setSelectionAnchor',
                label: (0, nls_1.localize)(2, null),
                alias: 'Set Selection Anchor',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.setSelectionAnchor();
        }
    }
    class GoToSelectionAnchor extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.goToSelectionAnchor',
                label: (0, nls_1.localize)(3, null),
                alias: 'Go to Selection Anchor',
                precondition: exports.$e1,
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.goToSelectionAnchor();
        }
    }
    class SelectFromAnchorToCursor extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.selectFromAnchorToCursor',
                label: (0, nls_1.localize)(4, null),
                alias: 'Select from Anchor to Cursor',
                precondition: exports.$e1,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
        }
    }
    class CancelSelectionAnchor extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.cancelSelectionAnchor',
                label: (0, nls_1.localize)(5, null),
                alias: 'Cancel Selection Anchor',
                precondition: exports.$e1,
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
    (0, editorExtensions_1.$AV)(SelectionAnchorController.ID, SelectionAnchorController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$xV)(SetSelectionAnchor);
    (0, editorExtensions_1.$xV)(GoToSelectionAnchor);
    (0, editorExtensions_1.$xV)(SelectFromAnchorToCursor);
    (0, editorExtensions_1.$xV)(CancelSelectionAnchor);
});
//# sourceMappingURL=anchorSelect.js.map