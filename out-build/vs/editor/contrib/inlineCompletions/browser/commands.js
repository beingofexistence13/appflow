/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/suggest/browser/suggest", "vs/nls!vs/editor/contrib/inlineCompletions/browser/commands", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, observable_1, editorExtensions_1, editorContextKeys_1, commandIds_1, inlineCompletionContextKeys_1, inlineCompletionsController_1, suggest_1, nls, actions_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$48 = exports.$38 = exports.$28 = exports.$18 = exports.$Z8 = exports.$Y8 = exports.$X8 = exports.$W8 = void 0;
    class $W8 extends editorExtensions_1.$sV {
        static { this.ID = commandIds_1.$j5; }
        constructor() {
            super({
                id: $W8.ID,
                label: nls.localize(0, null),
                alias: 'Show Next Inline Suggestion',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.$95.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100,
                    primary: 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
                },
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            controller?.model.get()?.next();
        }
    }
    exports.$W8 = $W8;
    class $X8 extends editorExtensions_1.$sV {
        static { this.ID = commandIds_1.$i5; }
        constructor() {
            super({
                id: $X8.ID,
                label: nls.localize(1, null),
                alias: 'Show Previous Inline Suggestion',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.$95.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100,
                    primary: 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
                },
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            controller?.model.get()?.previous();
        }
    }
    exports.$X8 = $X8;
    class $Y8 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.trigger',
                label: nls.localize(2, null),
                alias: 'Trigger Inline Suggestion',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            controller?.model.get()?.triggerExplicitly();
        }
    }
    exports.$Y8 = $Y8;
    class $Z8 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.acceptNextWord',
                label: nls.localize(3, null),
                alias: 'Accept Next Word Of Inline Suggestion',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.$95.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.$95.inlineSuggestionVisible),
                },
                menuOpts: [{
                        menuId: actions_1.$Ru.InlineSuggestionToolbar,
                        title: nls.localize(4, null),
                        group: 'primary',
                        order: 2,
                    }],
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            await controller?.model.get()?.acceptNextWord(controller.editor);
        }
    }
    exports.$Z8 = $Z8;
    class $18 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.inlineSuggest.acceptNextLine',
                label: nls.localize(5, null),
                alias: 'Accept Next Line Of Inline Suggestion',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, inlineCompletionContextKeys_1.$95.inlineSuggestionVisible),
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 1,
                },
                menuOpts: [{
                        menuId: actions_1.$Ru.InlineSuggestionToolbar,
                        title: nls.localize(6, null),
                        group: 'secondary',
                        order: 2,
                    }],
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            await controller?.model.get()?.acceptNextLine(controller.editor);
        }
    }
    exports.$18 = $18;
    class $28 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: commandIds_1.$h5,
                label: nls.localize(7, null),
                alias: 'Accept Inline Suggestion',
                precondition: inlineCompletionContextKeys_1.$95.inlineSuggestionVisible,
                menuOpts: [{
                        menuId: actions_1.$Ru.InlineSuggestionToolbar,
                        title: nls.localize(8, null),
                        group: 'primary',
                        order: 1,
                    }],
                kbOpts: {
                    primary: 2 /* KeyCode.Tab */,
                    weight: 200,
                    kbExpr: contextkey_1.$Ii.and(inlineCompletionContextKeys_1.$95.inlineSuggestionVisible, editorContextKeys_1.EditorContextKeys.tabMovesFocus.toNegated(), inlineCompletionContextKeys_1.$95.inlineSuggestionHasIndentationLessThanTabSize, suggest_1.$V5.Visible.toNegated(), editorContextKeys_1.EditorContextKeys.hoverFocused.toNegated()),
                }
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            if (controller) {
                controller.model.get()?.accept(controller.editor);
                controller.editor.focus();
            }
        }
    }
    exports.$28 = $28;
    class $38 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.inlineSuggest.hide'; }
        constructor() {
            super({
                id: $38.ID,
                label: nls.localize(9, null),
                alias: 'Hide Inline Suggestion',
                precondition: inlineCompletionContextKeys_1.$95.inlineSuggestionVisible,
                kbOpts: {
                    weight: 100,
                    primary: 9 /* KeyCode.Escape */,
                }
            });
        }
        async run(accessor, editor) {
            const controller = inlineCompletionsController_1.$V8.get(editor);
            (0, observable_1.transaction)(tx => {
                controller?.model.get()?.stop(tx);
            });
        }
    }
    exports.$38 = $38;
    class $48 extends actions_1.$Wu {
        static { this.ID = 'editor.action.inlineSuggest.toggleAlwaysShowToolbar'; }
        constructor() {
            super({
                id: $48.ID,
                title: nls.localize(10, null),
                f1: false,
                precondition: undefined,
                menu: [{
                        id: actions_1.$Ru.InlineSuggestionToolbar,
                        group: 'secondary',
                        order: 10,
                    }],
                toggled: contextkey_1.$Ii.equals('config.editor.inlineSuggest.showToolbar', 'always')
            });
        }
        async run(accessor, editor) {
            const configService = accessor.get(configuration_1.$8h);
            const currentValue = configService.getValue('editor.inlineSuggest.showToolbar');
            const newValue = currentValue === 'always' ? 'onHover' : 'always';
            configService.updateValue('editor.inlineSuggest.showToolbar', newValue);
        }
    }
    exports.$48 = $48;
});
//# sourceMappingURL=commands.js.map