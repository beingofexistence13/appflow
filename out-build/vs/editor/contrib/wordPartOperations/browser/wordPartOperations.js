/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/wordOperations/browser/wordOperations", "vs/platform/commands/common/commands"], function (require, exports, editorExtensions_1, cursorWordOperations_1, range_1, editorContextKeys_1, wordOperations_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q$ = exports.$P$ = exports.$O$ = exports.$N$ = exports.$M$ = exports.$L$ = exports.$K$ = exports.$J$ = void 0;
    class $J$ extends wordOperations_1.$z$ {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordPartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        h(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.$5V.deleteWordPartLeft(ctx);
            if (r) {
                return r;
            }
            return new range_1.$ks(1, 1, 1, 1);
        }
    }
    exports.$J$ = $J$;
    class $K$ extends wordOperations_1.$z$ {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordPartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        h(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.$5V.deleteWordPartRight(ctx);
            if (r) {
                return r;
            }
            const lineCount = ctx.model.getLineCount();
            const maxColumn = ctx.model.getLineMaxColumn(lineCount);
            return new range_1.$ks(lineCount, maxColumn, lineCount, maxColumn);
        }
    }
    exports.$K$ = $K$;
    class $L$ extends wordOperations_1.$g$ {
        j(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.$5V.moveWordPartLeft(wordSeparators, model, position);
        }
    }
    exports.$L$ = $L$;
    class $M$ extends $L$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordPartLeft',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$M$ = $M$;
    // Register previous id for compatibility purposes
    commands_1.$Gr.registerCommandAlias('cursorWordPartStartLeft', 'cursorWordPartLeft');
    class $N$ extends $L$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordPartLeftSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$N$ = $N$;
    // Register previous id for compatibility purposes
    commands_1.$Gr.registerCommandAlias('cursorWordPartStartLeftSelect', 'cursorWordPartLeftSelect');
    class $O$ extends wordOperations_1.$g$ {
        j(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.$5V.moveWordPartRight(wordSeparators, model, position);
        }
    }
    exports.$O$ = $O$;
    class $P$ extends $O$ {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordPartRight',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$P$ = $P$;
    class $Q$ extends $O$ {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordPartRightSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.$Q$ = $Q$;
    (0, editorExtensions_1.$wV)(new $J$());
    (0, editorExtensions_1.$wV)(new $K$());
    (0, editorExtensions_1.$wV)(new $M$());
    (0, editorExtensions_1.$wV)(new $N$());
    (0, editorExtensions_1.$wV)(new $P$());
    (0, editorExtensions_1.$wV)(new $Q$());
});
//# sourceMappingURL=wordPartOperations.js.map