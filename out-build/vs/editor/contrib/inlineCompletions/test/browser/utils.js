/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/coreCommands", "vs/base/common/observable"], function (require, exports, async_1, lifecycle_1, coreCommands_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$90b = exports.$80b = void 0;
    class $80b {
        constructor() {
            this.a = [];
            this.b = 0;
            this.c = new Array();
            this.d = false;
            this.e = undefined;
        }
        setReturnValue(value, delayMs = 0) {
            this.a = value ? [value] : [];
            this.b = delayMs;
        }
        setReturnValues(values, delayMs = 0) {
            this.a = values;
            this.b = delayMs;
        }
        getAndClearCallHistory() {
            const history = [...this.c];
            this.c = [];
            return history;
        }
        assertNotCalledTwiceWithin50ms() {
            if (this.d) {
                throw new Error('provideInlineCompletions has been called at least twice within 50ms. This should not happen.');
            }
        }
        async provideInlineCompletions(model, position, context, token) {
            const currentTimeMs = new Date().getTime();
            if (this.e && currentTimeMs - this.e < 50) {
                this.d = true;
            }
            this.e = currentTimeMs;
            this.c.push({
                position: position.toString(),
                triggerKind: context.triggerKind,
                text: model.getValue()
            });
            const result = new Array();
            result.push(...this.a);
            if (this.b > 0) {
                await (0, async_1.$Hg)(this.b);
            }
            return { items: result };
        }
        freeInlineCompletions() { }
        handleItemDidShow() { }
    }
    exports.$80b = $80b;
    class $90b extends lifecycle_1.$kc {
        get currentPrettyViewState() {
            return this.a;
        }
        constructor(model, b) {
            super();
            this.b = b;
            this.prettyViewStates = new Array();
            this.B((0, observable_1.autorun)(reader => {
                /** @description update */
                const ghostText = model.ghostText.read(reader);
                let view;
                if (ghostText) {
                    view = ghostText.render(this.b.getValue(), true);
                }
                else {
                    view = this.b.getValue();
                }
                if (this.a !== view) {
                    this.prettyViewStates.push(view);
                }
                this.a = view;
            }));
        }
        getAndClearViewStates() {
            const arr = [...this.prettyViewStates];
            this.prettyViewStates.length = 0;
            return arr;
        }
        keyboardType(text) {
            this.b.trigger('keyboard', 'type', { text });
        }
        cursorUp() {
            coreCommands_1.CoreNavigationCommands.CursorUp.runEditorCommand(null, this.b, null);
        }
        cursorRight() {
            coreCommands_1.CoreNavigationCommands.CursorRight.runEditorCommand(null, this.b, null);
        }
        cursorLeft() {
            coreCommands_1.CoreNavigationCommands.CursorLeft.runEditorCommand(null, this.b, null);
        }
        cursorDown() {
            coreCommands_1.CoreNavigationCommands.CursorDown.runEditorCommand(null, this.b, null);
        }
        cursorLineEnd() {
            coreCommands_1.CoreNavigationCommands.CursorLineEnd.runEditorCommand(null, this.b, null);
        }
        leftDelete() {
            coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, this.b, null);
        }
    }
    exports.$90b = $90b;
});
//# sourceMappingURL=utils.js.map