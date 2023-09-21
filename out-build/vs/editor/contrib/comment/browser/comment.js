/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/comment/browser/blockCommentCommand", "vs/editor/contrib/comment/browser/lineCommentCommand", "vs/nls!vs/editor/contrib/comment/browser/comment", "vs/platform/actions/common/actions"], function (require, exports, keyCodes_1, editorExtensions_1, range_1, editorContextKeys_1, languageConfigurationRegistry_1, blockCommentCommand_1, lineCommentCommand_1, nls, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CommentLineAction extends editorExtensions_1.$sV {
        constructor(type, opts) {
            super(opts);
            this.d = type;
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            const commands = [];
            const modelOptions = model.getOptions();
            const commentsOptions = editor.getOption(23 /* EditorOption.comments */);
            const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignoreFirstLine: false }));
            selections.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.selection, b.selection));
            // Remove selections that would result in copying the same line
            let prev = selections[0];
            for (let i = 1; i < selections.length; i++) {
                const curr = selections[i];
                if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
                    // these two selections would copy the same line
                    if (prev.index < curr.index) {
                        // prev wins
                        curr.ignoreFirstLine = true;
                    }
                    else {
                        // curr wins
                        prev.ignoreFirstLine = true;
                        prev = curr;
                    }
                }
            }
            for (const selection of selections) {
                commands.push(new lineCommentCommand_1.$W6(languageConfigurationService, selection.selection, modelOptions.tabSize, this.d, commentsOptions.insertSpace, commentsOptions.ignoreEmptyLines, selection.ignoreFirstLine));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class ToggleCommentLineAction extends CommentLineAction {
        constructor() {
            super(0 /* Type.Toggle */, {
                id: 'editor.action.commentLine',
                label: nls.localize(0, null),
                alias: 'Toggle Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize(1, null),
                    order: 1
                }
            });
        }
    }
    class AddLineCommentAction extends CommentLineAction {
        constructor() {
            super(1 /* Type.ForceAdd */, {
                id: 'editor.action.addCommentLine',
                label: nls.localize(2, null),
                alias: 'Add Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class RemoveLineCommentAction extends CommentLineAction {
        constructor() {
            super(2 /* Type.ForceRemove */, {
                id: 'editor.action.removeCommentLine',
                label: nls.localize(3, null),
                alias: 'Remove Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class BlockCommentAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.blockComment',
                label: nls.localize(4, null),
                alias: 'Toggle Block Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize(5, null),
                    order: 2
                }
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            if (!editor.hasModel()) {
                return;
            }
            const commentsOptions = editor.getOption(23 /* EditorOption.comments */);
            const commands = [];
            const selections = editor.getSelections();
            for (const selection of selections) {
                commands.push(new blockCommentCommand_1.$V6(selection, commentsOptions.insertSpace, languageConfigurationService));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    (0, editorExtensions_1.$xV)(ToggleCommentLineAction);
    (0, editorExtensions_1.$xV)(AddLineCommentAction);
    (0, editorExtensions_1.$xV)(RemoveLineCommentAction);
    (0, editorExtensions_1.$xV)(BlockCommentAction);
});
//# sourceMappingURL=comment.js.map