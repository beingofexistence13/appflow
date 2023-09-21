/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/editorColorRegistry", "vs/base/common/arrays", "vs/platform/theme/common/themeService", "vs/editor/common/core/selection", "vs/platform/theme/common/theme", "vs/css!./currentLineHighlight"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, arrays, themeService_1, selection_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CurrentLineMarginHighlightOverlay = exports.CurrentLineHighlightOverlay = exports.AbstractLineHighlightOverlay = void 0;
    class AbstractLineHighlightOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._renderLineHighlight = options.get(95 /* EditorOption.renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            this._selectionIsEmpty = true;
            this._focused = false;
            this._cursorLineNumbers = [1];
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._renderData = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
        _readFromSelections() {
            let hasChanged = false;
            const cursorsLineNumbers = this._selections.map(s => s.positionLineNumber);
            cursorsLineNumbers.sort((a, b) => a - b);
            if (!arrays.equals(this._cursorLineNumbers, cursorsLineNumbers)) {
                this._cursorLineNumbers = cursorsLineNumbers;
                hasChanged = true;
            }
            const selectionIsEmpty = this._selections.every(s => s.isEmpty());
            if (this._selectionIsEmpty !== selectionIsEmpty) {
                this._selectionIsEmpty = selectionIsEmpty;
                hasChanged = true;
            }
            return hasChanged;
        }
        // --- begin event handlers
        onThemeChanged(e) {
            return this._readFromSelections();
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._renderLineHighlight = options.get(95 /* EditorOption.renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            return this._readFromSelections();
        }
        onFlushed(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollWidthChanged || e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onFocusChanged(e) {
            if (!this._renderLineHighlightOnlyWhenFocus) {
                return false;
            }
            this._focused = e.isFocused;
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (!this._shouldRenderThis()) {
                this._renderData = null;
                return;
            }
            const renderedLine = this._renderOne(ctx);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const len = this._cursorLineNumbers.length;
            let index = 0;
            const renderData = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                while (index < len && this._cursorLineNumbers[index] < lineNumber) {
                    index++;
                }
                if (index < len && this._cursorLineNumbers[index] === lineNumber) {
                    renderData[lineIndex] = renderedLine;
                }
                else {
                    renderData[lineIndex] = '';
                }
            }
            this._renderData = renderData;
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderData) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex >= this._renderData.length) {
                return '';
            }
            return this._renderData[lineIndex];
        }
        _shouldRenderInMargin() {
            return ((this._renderLineHighlight === 'gutter' || this._renderLineHighlight === 'all')
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
        _shouldRenderInContent() {
            return ((this._renderLineHighlight === 'line' || this._renderLineHighlight === 'all')
                && this._selectionIsEmpty
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
    }
    exports.AbstractLineHighlightOverlay = AbstractLineHighlightOverlay;
    class CurrentLineHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx) {
            const className = 'current-line' + (this._shouldRenderOther() ? ' current-line-both' : '');
            return `<div class="${className}" style="width:${Math.max(ctx.scrollWidth, this._contentWidth)}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderThis() {
            return this._shouldRenderInContent();
        }
        _shouldRenderOther() {
            return this._shouldRenderInMargin();
        }
    }
    exports.CurrentLineHighlightOverlay = CurrentLineHighlightOverlay;
    class CurrentLineMarginHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx) {
            const className = 'current-line' + (this._shouldRenderInMargin() ? ' current-line-margin' : '') + (this._shouldRenderOther() ? ' current-line-margin-both' : '');
            return `<div class="${className}" style="width:${this._contentLeft}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderThis() {
            return true;
        }
        _shouldRenderOther() {
            return this._shouldRenderInContent();
        }
    }
    exports.CurrentLineMarginHighlightOverlay = CurrentLineMarginHighlightOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const lineHighlight = theme.getColor(editorColorRegistry_1.editorLineHighlight);
        if (lineHighlight) {
            collector.addRule(`.monaco-editor .view-overlays .current-line { background-color: ${lineHighlight}; }`);
            collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { background-color: ${lineHighlight}; border: none; }`);
        }
        if (!lineHighlight || lineHighlight.isTransparent() || theme.defines(editorColorRegistry_1.editorLineHighlightBorder)) {
            const lineHighlightBorder = theme.getColor(editorColorRegistry_1.editorLineHighlightBorder);
            if (lineHighlightBorder) {
                collector.addRule(`.monaco-editor .view-overlays .current-line { border: 2px solid ${lineHighlightBorder}; }`);
                collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border: 2px solid ${lineHighlightBorder}; }`);
                if ((0, theme_1.isHighContrast)(theme.type)) {
                    collector.addRule(`.monaco-editor .view-overlays .current-line { border-width: 1px; }`);
                    collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border-width: 1px; }`);
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudExpbmVIaWdobGlnaHQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvY3VycmVudExpbmVIaWdobGlnaHQvY3VycmVudExpbmVIaWdobGlnaHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQXNCLDRCQUE2QixTQUFRLHVDQUFrQjtRQWE1RSxZQUFZLE9BQW9CO1lBQy9CLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFFeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUF5QixDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLDJDQUFrQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxPQUFPLENBQUMsR0FBRyx3REFBK0MsQ0FBQztZQUNwRyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQzdDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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