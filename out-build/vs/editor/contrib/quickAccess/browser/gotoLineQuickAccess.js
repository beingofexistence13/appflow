/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess", "vs/nls!vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess"], function (require, exports, lifecycle_1, editorBrowser_1, editorNavigationQuickAccess_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zMb = void 0;
    class $zMb extends editorNavigationQuickAccess_1.$yMb {
        static { this.PREFIX = ':'; }
        constructor() {
            super({ canAcceptInBackground: true });
        }
        e(picker) {
            const label = (0, nls_1.localize)(0, null);
            picker.items = [{ label }];
            picker.ariaLabel = label;
            return lifecycle_1.$kc.None;
        }
        d(context, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.$jc();
            // Goto line once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item) {
                    if (!this.p(editor, item.lineNumber)) {
                        return;
                    }
                    this.f(context, { range: this.m(item.lineNumber, item.column), keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // React to picker changes
            const updatePickerAndEditor = () => {
                const position = this.n(editor, picker.value.trim().substr($zMb.PREFIX.length));
                const label = this.o(editor, position.lineNumber, position.column);
                // Picker
                picker.items = [{
                        lineNumber: position.lineNumber,
                        column: position.column,
                        label
                    }];
                // ARIA Label
                picker.ariaLabel = label;
                // Clear decorations for invalid range
                if (!this.p(editor, position.lineNumber)) {
                    this.clearDecorations(editor);
                    return;
                }
                // Reveal
                const range = this.m(position.lineNumber, position.column);
                editor.revealRangeInCenter(range, 0 /* ScrollType.Smooth */);
                // Decorate
                this.addDecorations(editor, range);
            };
            updatePickerAndEditor();
            disposables.add(picker.onDidChangeValue(() => updatePickerAndEditor()));
            // Adjust line number visibility as needed
            const codeEditor = (0, editorBrowser_1.$lV)(editor);
            if (codeEditor) {
                const options = codeEditor.getOptions();
                const lineNumbers = options.get(67 /* EditorOption.lineNumbers */);
                if (lineNumbers.renderType === 2 /* RenderLineNumbersType.Relative */) {
                    codeEditor.updateOptions({ lineNumbers: 'on' });
                    disposables.add((0, lifecycle_1.$ic)(() => codeEditor.updateOptions({ lineNumbers: 'relative' })));
                }
            }
            return disposables;
        }
        m(lineNumber = 1, column = 1) {
            return {
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column
            };
        }
        n(editor, value) {
            // Support line-col formats of `line,col`, `line:col`, `line#col`
            const numbers = value.split(/,|:|#/).map(part => parseInt(part, 10)).filter(part => !isNaN(part));
            const endLine = this.r(editor) + 1;
            return {
                lineNumber: numbers[0] > 0 ? numbers[0] : endLine + numbers[0],
                column: numbers[1]
            };
        }
        o(editor, lineNumber, column) {
            // Location valid: indicate this as picker label
            if (this.p(editor, lineNumber)) {
                if (this.q(editor, lineNumber, column)) {
                    return (0, nls_1.localize)(1, null, lineNumber, column);
                }
                return (0, nls_1.localize)(2, null, lineNumber);
            }
            // Location invalid: show generic label
            const position = editor.getPosition() || { lineNumber: 1, column: 1 };
            const lineCount = this.r(editor);
            if (lineCount > 1) {
                return (0, nls_1.localize)(3, null, position.lineNumber, position.column, lineCount);
            }
            return (0, nls_1.localize)(4, null, position.lineNumber, position.column);
        }
        p(editor, lineNumber) {
            if (!lineNumber || typeof lineNumber !== 'number') {
                return false;
            }
            return lineNumber > 0 && lineNumber <= this.r(editor);
        }
        q(editor, lineNumber, column) {
            if (!column || typeof column !== 'number') {
                return false;
            }
            const model = this.g(editor);
            if (!model) {
                return false;
            }
            const positionCandidate = { lineNumber, column };
            return model.validatePosition(positionCandidate).equals(positionCandidate);
        }
        r(editor) {
            return this.g(editor)?.getLineCount() ?? 0;
        }
    }
    exports.$zMb = $zMb;
});
//# sourceMappingURL=gotoLineQuickAccess.js.map