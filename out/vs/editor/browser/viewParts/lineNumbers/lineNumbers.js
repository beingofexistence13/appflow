/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/position", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/css!./lineNumbers"], function (require, exports, platform, dynamicViewOverlay_1, position_1, themeService_1, editorColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineNumbersOverlay = void 0;
    class LineNumbersOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        static { this.CLASS_NAME = 'line-numbers'; }
        constructor(context) {
            super();
            this._context = context;
            this._readConfig();
            this._lastCursorModelPosition = new position_1.Position(1, 1);
            this._renderResult = null;
            this._activeLineNumber = 1;
            this._context.addEventHandler(this);
        }
        _readConfig() {
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            const lineNumbers = options.get(67 /* EditorOption.lineNumbers */);
            this._renderLineNumbers = lineNumbers.renderType;
            this._renderCustomLineNumbers = lineNumbers.renderFn;
            this._renderFinalNewline = options.get(94 /* EditorOption.renderFinalNewline */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineNumbersLeft = layoutInfo.lineNumbersLeft;
            this._lineNumbersWidth = layoutInfo.lineNumbersWidth;
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            this._readConfig();
            return true;
        }
        onCursorStateChanged(e) {
            const primaryViewPosition = e.selections[0].getPosition();
            this._lastCursorModelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(primaryViewPosition);
            let shouldRender = false;
            if (this._activeLineNumber !== primaryViewPosition.lineNumber) {
                this._activeLineNumber = primaryViewPosition.lineNumber;
                shouldRender = true;
            }
            if (this._renderLineNumbers === 2 /* RenderLineNumbersType.Relative */ || this._renderLineNumbers === 3 /* RenderLineNumbersType.Interval */) {
                shouldRender = true;
            }
            return shouldRender;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        _getLineRenderLineNumber(viewLineNumber) {
            const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(viewLineNumber, 1));
            if (modelPosition.column !== 1) {
                return '';
            }
            const modelLineNumber = modelPosition.lineNumber;
            if (this._renderCustomLineNumbers) {
                return this._renderCustomLineNumbers(modelLineNumber);
            }
            if (this._renderLineNumbers === 2 /* RenderLineNumbersType.Relative */) {
                const diff = Math.abs(this._lastCursorModelPosition.lineNumber - modelLineNumber);
                if (diff === 0) {
                    return '<span class="relative-current-line-number">' + modelLineNumber + '</span>';
                }
                return String(diff);
            }
            if (this._renderLineNumbers === 3 /* RenderLineNumbersType.Interval */) {
                if (this._lastCursorModelPosition.lineNumber === modelLineNumber) {
                    return String(modelLineNumber);
                }
                if (modelLineNumber % 10 === 0) {
                    return String(modelLineNumber);
                }
                return '';
            }
            return String(modelLineNumber);
        }
        prepareRender(ctx) {
            if (this._renderLineNumbers === 0 /* RenderLineNumbersType.Off */) {
                this._renderResult = null;
                return;
            }
            const lineHeightClassName = (platform.isLinux ? (this._lineHeight % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const lineCount = this._context.viewModel.getLineCount();
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const renderLineNumber = this._getLineRenderLineNumber(lineNumber);
                if (!renderLineNumber) {
                    output[lineIndex] = '';
                    continue;
                }
                let extraClassName = '';
                if (lineNumber === lineCount && this._context.viewModel.getLineLength(lineNumber) === 0) {
                    // this is the last line
                    if (this._renderFinalNewline === 'off') {
                        output[lineIndex] = '';
                        continue;
                    }
                    if (this._renderFinalNewline === 'dimmed') {
                        extraClassName = ' dimmed-line-number';
                    }
                }
                if (lineNumber === this._activeLineNumber) {
                    extraClassName = ' active-line-number';
                }
                output[lineIndex] = (`<div class="${LineNumbersOverlay.CLASS_NAME}${lineHeightClassName}${extraClassName}" style="left:${this._lineNumbersLeft}px;width:${this._lineNumbersWidth}px;">${renderLineNumber}</div>`);
            }
            this._renderResult = output;
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                return '';
            }
            return this._renderResult[lineIndex];
        }
    }
    exports.LineNumbersOverlay = LineNumbersOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const editorLineNumbersColor = theme.getColor(editorColorRegistry_1.editorLineNumbers);
        const editorDimmedLineNumberColor = theme.getColor(editorColorRegistry_1.editorDimmedLineNumber);
        if (editorDimmedLineNumberColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorDimmedLineNumberColor}; }`);
        }
        else if (editorLineNumbersColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorLineNumbersColor.transparent(0.4)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZU51bWJlcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvbGluZU51bWJlcnMvbGluZU51bWJlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsa0JBQW1CLFNBQVEsdUNBQWtCO2lCQUVsQyxlQUFVLEdBQUcsY0FBYyxDQUFDO1FBY25ELFlBQVksT0FBb0I7WUFDL0IsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUV4QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFbkIsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU8sV0FBVztZQUNsQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQztZQUN4RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBMEIsQ0FBQztZQUMxRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQztZQUNqRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztZQUNyRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEdBQUcsMENBQWlDLENBQUM7WUFDeEUsTUFBTSxVQUFVLEdB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