/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess", "vs/nls"], function (require, exports, lifecycle_1, editorBrowser_1, editorNavigationQuickAccess_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractGotoLineQuickAccessProvider = void 0;
    class AbstractGotoLineQuickAccessProvider extends editorNavigationQuickAccess_1.AbstractEditorNavigationQuickAccessProvider {
        static { this.PREFIX = ':'; }
        constructor() {
            super({ canAcceptInBackground: true });
        }
        provideWithoutTextEditor(picker) {
            const label = (0, nls_1.localize)('cannotRunGotoLine', "Open a text editor first to go to a line.");
            picker.items = [{ label }];
            picker.ariaLabel = label;
            return lifecycle_1.Disposable.None;
        }
        provideWithTextEditor(context, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.DisposableStore();
            // Goto line once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item) {
                    if (!this.isValidLineNumber(editor, item.lineNumber)) {
                        return;
                    }
                    this.gotoLocation(context, { range: this.toRange(item.lineNumber, item.column), keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // React to picker changes
            const updatePickerAndEditor = () => {
                const position = this.parsePosition(editor, picker.value.trim().substr(AbstractGotoLineQuickAccessProvider.PREFIX.length));
                const label = this.getPickLabel(editor, position.lineNumber, position.column);
                // Picker
                picker.items = [{
                        lineNumber: position.lineNumber,
                        column: position.column,
                        label
                    }];
                // ARIA Label
                picker.ariaLabel = label;
                // Clear decorations for invalid range
                if (!this.isValidLineNumber(editor, position.lineNumber)) {
                    this.clearDecorations(editor);
                    return;
                }
                // Reveal
                const range = this.toRange(position.lineNumber, position.column);
                editor.revealRangeInCenter(range, 0 /* ScrollType.Smooth */);
                // Decorate
                this.addDecorations(editor, range);
            };
            updatePickerAndEditor();
            disposables.add(picker.onDidChangeValue(() => updatePickerAndEditor()));
            // Adjust line number visibility as needed
            const codeEditor = (0, editorBrowser_1.getCodeEditor)(editor);
            if (codeEditor) {
                const options = codeEditor.getOptions();
                const lineNumbers = options.get(67 /* EditorOption.lineNumbers */);
                if (lineNumbers.renderType === 2 /* RenderLineNumbersType.Relative */) {
                    codeEditor.updateOptions({ lineNumbers: 'on' });
                    disposables.add((0, lifecycle_1.toDisposable)(() => codeEditor.updateOptions({ lineNumbers: 'relative' })));
                }
            }
            return disposables;
        }
        toRange(lineNumber = 1, column = 1) {
            return {
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column
            };
        }
        parsePosition(editor, value) {
            // Support line-col formats of `line,col`, `line:col`, `line#col`
            const numbers = value.split(/,|:|#/).map(part => parseInt(part, 10)).filter(part => !isNaN(part));
            const endLine = this.lineCount(editor) + 1;
            return {
                lineNumber: numbers[0] > 0 ? numbers[0] : endLine + numbers[0],
                column: numbers[1]
            };
        }
        getPickLabel(editor, lineNumber, column) {
            // Location valid: indicate this as picker label
            if (this.isValidLineNumber(editor, lineNumber)) {
                if (this.isValidColumn(editor, lineNumber, column)) {
                    return (0, nls_1.localize)('gotoLineColumnLabel', "Go to line {0} and character {1}.", lineNumber, column);
                }
                return (0, nls_1.localize)('gotoLineLabel', "Go to line {0}.", lineNumber);
            }
            // Location invalid: show generic label
            const position = editor.getPosition() || { lineNumber: 1, column: 1 };
            const lineCount = this.lineCount(editor);
            if (lineCount > 1) {
                return (0, nls_1.localize)('gotoLineLabelEmptyWithLimit', "Current Line: {0}, Character: {1}. Type a line number between 1 and {2} to navigate to.", position.lineNumber, position.column, lineCount);
            }
            return (0, nls_1.localize)('gotoLineLabelEmpty', "Current Line: {0}, Character: {1}. Type a line number to navigate to.", position.lineNumber, position.column);
        }
        isValidLineNumber(editor, lineNumber) {
            if (!lineNumber || typeof lineNumber !== 'number') {
                return false;
            }
            return lineNumber > 0 && lineNumber <= this.lineCount(editor);
        }
        isValidColumn(editor, lineNumber, column) {
            if (!column || typeof column !== 'number') {
                return false;
            }
            const model = this.getModel(editor);
            if (!model) {
                return false;
            }
            const positionCandidate = { lineNumber, column };
            return model.validatePosition(positionCandidate).equals(positionCandidate);
        }
        lineCount(editor) {
            return this.getModel(editor)?.getLineCount() ?? 0;
        }
    }
    exports.AbstractGotoLineQuickAccessProvider = AbstractGotoLineQuickAccessProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ290b0xpbmVRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3F1aWNrQWNjZXNzL2Jyb3dzZXIvZ290b0xpbmVRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBc0IsbUNBQW9DLFNBQVEseUVBQTJDO2lCQUVyRyxXQUFNLEdBQUcsR0FBRyxDQUFDO1FBRXBCO1lBQ0MsS0FBSyxDQUFDLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRVMsd0JBQXdCLENBQUMsTUFBMEM7WUFDNUUsTUFBTSxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztZQUV6RixNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXpCLE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQUVTLHFCQUFxQixDQUFDLE9BQXNDLEVBQUUsTUFBMEMsRUFBRSxLQUF3QjtZQUMzSSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTFDLHdCQUF3QjtZQUN4QixXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO2dCQUNwQyxJQUFJLElBQUksRUFBRTtvQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFD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