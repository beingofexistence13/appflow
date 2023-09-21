/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/coreCommands", "vs/base/common/observable"], function (require, exports, async_1, lifecycle_1, coreCommands_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GhostTextContext = exports.MockInlineCompletionsProvider = void 0;
    class MockInlineCompletionsProvider {
        constructor() {
            this.returnValue = [];
            this.delayMs = 0;
            this.callHistory = new Array();
            this.calledTwiceIn50Ms = false;
            this.lastTimeMs = undefined;
        }
        setReturnValue(value, delayMs = 0) {
            this.returnValue = value ? [value] : [];
            this.delayMs = delayMs;
        }
        setReturnValues(values, delayMs = 0) {
            this.returnValue = values;
            this.delayMs = delayMs;
        }
        getAndClearCallHistory() {
            const history = [...this.callHistory];
            this.callHistory = [];
            return history;
        }
        assertNotCalledTwiceWithin50ms() {
            if (this.calledTwiceIn50Ms) {
                throw new Error('provideInlineCompletions has been called at least twice within 50ms. This should not happen.');
            }
        }
        async provideInlineCompletions(model, position, context, token) {
            const currentTimeMs = new Date().getTime();
            if (this.lastTimeMs && currentTimeMs - this.lastTimeMs < 50) {
                this.calledTwiceIn50Ms = true;
            }
            this.lastTimeMs = currentTimeMs;
            this.callHistory.push({
                position: position.toString(),
                triggerKind: context.triggerKind,
                text: model.getValue()
            });
            const result = new Array();
            result.push(...this.returnValue);
            if (this.delayMs > 0) {
                await (0, async_1.timeout)(this.delayMs);
            }
            return { items: result };
        }
        freeInlineCompletions() { }
        handleItemDidShow() { }
    }
    exports.MockInlineCompletionsProvider = MockInlineCompletionsProvider;
    class GhostTextContext extends lifecycle_1.Disposable {
        get currentPrettyViewState() {
            return this._currentPrettyViewState;
        }
        constructor(model, editor) {
            super();
            this.editor = editor;
            this.prettyViewStates = new Array();
            this._register((0, observable_1.autorun)(reader => {
                /** @description update */
                const ghostText = model.ghostText.read(reader);
                let view;
                if (ghostText) {
                    view = ghostText.render(this.editor.getValue(), true);
                }
                else {
                    view = this.editor.getValue();
                }
                if (this._currentPrettyViewState !== view) {
                    this.prettyViewStates.push(view);
                }
                this._currentPrettyViewState = view;
            }));
        }
        getAndClearViewStates() {
            const arr = [...this.prettyViewStates];
            this.prettyViewStates.length = 0;
            return arr;
        }
        keyboardType(text) {
            this.editor.trigger('keyboard', 'type', { text });
        }
        cursorUp() {
            coreCommands_1.CoreNavigationCommands.CursorUp.runEditorCommand(null, this.editor, null);
        }
        cursorRight() {
            coreCommands_1.CoreNavigationCommands.CursorRight.runEditorCommand(null, this.editor, null);
        }
        cursorLeft() {
            coreCommands_1.CoreNavigationCommands.CursorLeft.runEditorCommand(null, this.editor, null);
        }
        cursorDown() {
            coreCommands_1.CoreNavigationCommands.CursorDown.runEditorCommand(null, this.editor, null);
        }
        cursorLineEnd() {
            coreCommands_1.CoreNavigationCommands.CursorLineEnd.runEditorCommand(null, this.editor, null);
        }
        leftDelete() {
            coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, this.editor, null);
        }
    }
    exports.GhostTextContext = GhostTextContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy90ZXN0L2Jyb3dzZXIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsNkJBQTZCO1FBQTFDO1lBQ1MsZ0JBQVcsR0FBdUIsRUFBRSxDQUFDO1lBQ3JDLFlBQU8sR0FBVyxDQUFDLENBQUM7WUFFcEIsZ0JBQVcsR0FBRyxJQUFJLEtBQUssRUFBVyxDQUFDO1lBQ25DLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQXdCMUIsZUFBVSxHQUF1QixTQUFTLENBQUM7UUF5QnBELENBQUM7UUEvQ08sY0FBYyxDQUFDLEtBQW1DLEVBQUUsVUFBa0IsQ0FBQztZQUM3RSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxlQUFlLENBQUMsTUFBMEIsRUFBRSxVQUFrQixDQUFDO1lBQ3JFLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxzQkFBc0I7WUFDNUIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU0sOEJBQThCO1lBQ3BDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDhGQUE4RixDQUFDLENBQUM7YUFDaEg7UUFDRixD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