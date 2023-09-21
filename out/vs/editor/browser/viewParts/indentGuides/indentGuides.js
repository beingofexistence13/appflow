/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/types", "vs/editor/common/model/guidesTextModelPart", "vs/editor/common/textModelGuides", "vs/css!./indentGuides"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, themeService_1, position_1, arrays_1, types_1, guidesTextModelPart_1, textModelGuides_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndentGuidesOverlay = void 0;
    class IndentGuidesOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            this._primaryPosition = null;
            const options = this._context.configuration.options;
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._spaceWidth = fontInfo.spaceWidth;
            this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            this._bracketPairGuideOptions = options.get(16 /* EditorOption.guides */);
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._spaceWidth = fontInfo.spaceWidth;
            this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            this._bracketPairGuideOptions = options.get(16 /* EditorOption.guides */);
            return true;
        }
        onCursorStateChanged(e) {
            const selection = e.selections[0];
            const newPosition = selection.getPosition();
            if (!this._primaryPosition?.equals(newPosition)) {
                this._primaryPosition = newPosition;
                return true;
            }
            return false;
        }
        onDecorationsChanged(e) {
            // true for inline decorations
            return true;
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
            return e.scrollTopChanged; // || e.scrollWidthChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onLanguageConfigurationChanged(e) {
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (!this._bracketPairGuideOptions.indentation && this._bracketPairGuideOptions.bracketPairs === false) {
                this._renderResult = null;
                return;
            }
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const scrollWidth = ctx.scrollWidth;
            const lineHeight = this._lineHeight;
            const activeCursorPosition = this._primaryPosition;
            const indents = this.getGuidesByLine(visibleStartLineNumber, Math.min(visibleEndLineNumber + 1, this._context.viewModel.getLineCount()), activeCursorPosition);
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const indent = indents[lineIndex];
                let result = '';
                const leftOffset = ctx.visibleRangeForPosition(new position_1.Position(lineNumber, 1))?.left ?? 0;
                for (const guide of indent) {
                    const left = guide.column === -1
                        ? leftOffset + (guide.visibleColumn - 1) * this._spaceWidth
                        : ctx.visibleRangeForPosition(new position_1.Position(lineNumber, guide.column)).left;
                    if (left > scrollWidth || (this._maxIndentLeft > 0 && left > this._maxIndentLeft)) {
                        break;
                    }
                    const className = guide.horizontalLine ? (guide.horizontalLine.top ? 'horizontal-top' : 'horizontal-bottom') : 'vertical';
                    const width = guide.horizontalLine
                        ? (ctx.visibleRangeForPosition(new position_1.Position(lineNumber, guide.horizontalLine.endColumn))?.left ?? (left + this._spaceWidth)) - left
                        : this._spaceWidth;
                    result += `<div class="core-guide ${guide.className} ${className}" style="left:${left}px;height:${lineHeight}px;width:${width}px"></div>`;
                }
                output[lineIndex] = result;
            }
            this._renderResult = output;
        }
        getGuidesByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition) {
            const bracketGuides = this._bracketPairGuideOptions.bracketPairs !== false
                ? this._context.viewModel.getBracketGuidesInRangeByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition, {
                    highlightActive: this._bracketPairGuideOptions.highlightActiveBracketPair,
                    horizontalGuides: this._bracketPairGuideOptions.bracketPairsHorizontal === true
                        ? textModelGuides_1.HorizontalGuidesState.Enabled
                        : this._bracketPairGuideOptions.bracketPairsHorizontal === 'active'
                            ? textModelGuides_1.HorizontalGuidesState.EnabledForActive
                            : textModelGuides_1.HorizontalGuidesState.Disabled,
                    includeInactive: this._bracketPairGuideOptions.bracketPairs === true,
                })
                : null;
            const indentGuides = this._bracketPairGuideOptions.indentation
                ? this._context.viewModel.getLinesIndentGuides(visibleStartLineNumber, visibleEndLineNumber)
                : null;
            let activeIndentStartLineNumber = 0;
            let activeIndentEndLineNumber = 0;
            let activeIndentLevel = 0;
            if (this._bracketPairGuideOptions.highlightActiveIndentation !== false && activeCursorPosition) {
                const activeIndentInfo = this._context.viewModel.getActiveIndentGuide(activeCursorPosition.lineNumber, visibleStartLineNumber, visibleEndLineNumber);
                activeIndentStartLineNumber = activeIndentInfo.startLineNumber;
                activeIndentEndLineNumber = activeIndentInfo.endLineNumber;
                activeIndentLevel = activeIndentInfo.indent;
            }
            const { indentSize } = this._context.viewModel.model.getOptions();
            const result = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineGuides = new Array();
                result.push(lineGuides);
                const bracketGuidesInLine = bracketGuides ? bracketGuides[lineNumber - visibleStartLineNumber] : [];
                const bracketGuidesInLineQueue = new arrays_1.ArrayQueue(bracketGuidesInLine);
                const indentGuidesInLine = indentGuides ? indentGuides[lineNumber - visibleStartLineNumber] : 0;
                for (let indentLvl = 1; indentLvl <= indentGuidesInLine; indentLvl++) {
                    const indentGuide = (indentLvl - 1) * indentSize + 1;
                    const isActive = 
                    // Disable active indent guide if there are bracket guides.
                    (this._bracketPairGuideOptions.highlightActiveIndentation === 'always' || bracketGuidesInLine.length === 0) &&
                        activeIndentStartLineNumber <= lineNumber &&
                        lineNumber <= activeIndentEndLineNumber &&
                        indentLvl === activeIndentLevel;
                    lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => g.visibleColumn < indentGuide) || []);
                    const peeked = bracketGuidesInLineQueue.peek();
                    if (!peeked || peeked.visibleColumn !== indentGuide || peeked.horizontalLine) {
                        lineGuides.push(new textModelGuides_1.IndentGuide(indentGuide, -1, `core-guide-indent lvl-${(indentLvl - 1) % 30}` + (isActive ? ' indent-active' : ''), null, -1, -1));
                    }
                }
                lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => true) || []);
            }
            return result;
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
    exports.IndentGuidesOverlay = IndentGuidesOverlay;
    function transparentToUndefined(color) {
        if (color && color.isTransparent()) {
            return undefined;
        }
        return color;
    }
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const colors = [
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground1, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground1, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground1 },
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground2, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground2, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground2 },
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground3, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground3, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground3 },
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground4, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground4, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground4 },
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground5, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground5, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground5 },
            { bracketColor: editorColorRegistry_1.editorBracketHighlightingForeground6, guideColor: editorColorRegistry_1.editorBracketPairGuideBackground6, guideColorActive: editorColorRegistry_1.editorBracketPairGuideActiveBackground6 }
        ];
        const colorProvider = new guidesTextModelPart_1.BracketPairGuidesClassNames();
        const indentColors = [
            { indentColor: editorColorRegistry_1.editorIndentGuide1, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide1 },
            { indentColor: editorColorRegistry_1.editorIndentGuide2, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide2 },
            { indentColor: editorColorRegistry_1.editorIndentGuide3, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide3 },
            { indentColor: editorColorRegistry_1.editorIndentGuide4, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide4 },
            { indentColor: editorColorRegistry_1.editorIndentGuide5, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide5 },
            { indentColor: editorColorRegistry_1.editorIndentGuide6, indentColorActive: editorColorRegistry_1.editorActiveIndentGuide6 },
        ];
        const colorValues = colors
            .map(c => {
            const bracketColor = theme.getColor(c.bracketColor);
            const guideColor = theme.getColor(c.guideColor);
            const guideColorActive = theme.getColor(c.guideColorActive);
            const effectiveGuideColor = transparentToUndefined(transparentToUndefined(guideColor) ?? bracketColor?.transparent(0.3));
            const effectiveGuideColorActive = transparentToUndefined(transparentToUndefined(guideColorActive) ?? bracketColor);
            if (!effectiveGuideColor || !effectiveGuideColorActive) {
                return undefined;
            }
            return {
                guideColor: effectiveGuideColor,
                guideColorActive: effectiveGuideColorActive,
            };
        })
            .filter(types_1.isDefined);
        const indentColorValues = indentColors
            .map(c => {
            const indentColor = theme.getColor(c.indentColor);
            const indentColorActive = theme.getColor(c.indentColorActive);
            const effectiveIndentColor = transparentToUndefined(indentColor);
            const effectiveIndentColorActive = transparentToUndefined(indentColorActive);
            if (!effectiveIndentColor || !effectiveIndentColorActive) {
                return undefined;
            }
            return {
                indentColor: effectiveIndentColor,
                indentColorActive: effectiveIndentColorActive,
            };
        })
            .filter(types_1.isDefined);
        if (colorValues.length > 0) {
            for (let level = 0; level < 30; level++) {
                const colors = colorValues[level % colorValues.length];
                collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level).replace(/ /g, '.')} { --guide-color: ${colors.guideColor}; --guide-color-active: ${colors.guideColorActive}; }`);
            }
            collector.addRule(`.monaco-editor .vertical { box-shadow: 1px 0 0 0 var(--guide-color) inset; }`);
            collector.addRule(`.monaco-editor .horizontal-top { border-top: 1px solid var(--guide-color); }`);
            collector.addRule(`.monaco-editor .horizontal-bottom { border-bottom: 1px solid var(--guide-color); }`);
            collector.addRule(`.monaco-editor .vertical.${colorProvider.activeClassName} { box-shadow: 1px 0 0 0 var(--guide-color-active) inset; }`);
            collector.addRule(`.monaco-editor .horizontal-top.${colorProvider.activeClassName} { border-top: 1px solid var(--guide-color-active); }`);
            collector.addRule(`.monaco-editor .horizontal-bottom.${colorProvider.activeClassName} { border-bottom: 1px solid var(--guide-color-active); }`);
        }
        if (indentColorValues.length > 0) {
            for (let level = 0; level < 30; level++) {
                const colors = indentColorValues[level % indentColorValues.length];
                collector.addRule(`.monaco-editor .lines-content .core-guide-indent.lvl-${level} { --indent-color: ${colors.indentColor}; --indent-color-active: ${colors.indentColorActive}; }`);
            }
            collector.addRule(`.monaco-editor .lines-content .core-guide-indent { box-shadow: 1px 0 0 0 var(--indent-color) inset; }`);
            collector.addRule(`.monaco-editor .lines-content .core-guide-indent.indent-active { box-shadow: 1px 0 0 0 var(--indent-color-active) inset; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50R3VpZGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL2luZGVudEd1aWRlcy9pbmRlbnRHdWlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLG1CQUFvQixTQUFRLHVDQUFrQjtRQVUxRCxZQUFZLE9BQW9CO1lBQy9CLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUU3QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcscUNBQTJCLENBQUM7WUFDNUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFFcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxrQ0FBeUIsQ0FBQztZQUN4RCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDdkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsY0FBYyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ3hJLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxPQUFPLENBQUMsR0FBRyw4QkFBcUIsQ0FBQztZQUVqRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQsMkJBQTJCO1FBRVgsc0JBQXNCLENBQUMsQ0FBMkM7WUFDakYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLHFDQUEyQixDQUFDO1lBQzVELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBRXBELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFDeEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLGNBQWMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUN4SSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsOEJBQXFCLENBQUM7WUFFakUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ2Usb0JBQW9CLENBQUMsQ0FBeUM7WUFDN0UsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDZSxvQkFBb0IsQ0FBQyxDQUF5QztZQUM3RSw4QkFBOEI7WUFDOUIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ2UsU0FBUyxDQUFDLENBQThCO1lBQ3ZELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNlLGNBQWMsQ0FBQyxDQUFtQztZQUNqRSxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDZSxjQUFjLENBQUMsQ0FBbUM7WUFDakUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ2UsZUFBZSxDQUFDLENBQW9DO1lBQ25FLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNlLGVBQWUsQ0FBQyxDQUFvQztZQUNuRSxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLDJCQUEyQjtRQUN0RCxDQUFDO1FBQ2UsY0FBYyxDQUFDLENBQW1DO1lBQ2pFLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNlLDhCQUE4QixDQUFDLENBQTRDO1lBQzFGLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELHlCQUF5QjtRQUVsQixhQUFhLENBQUMsR0FBcUI7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksS0FBSyxLQUFLLEVBQUU7Z0JBQ3ZHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixPQUFPO2FBQ1A7WUFFRCxNQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO1lBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUNwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRXBDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1lBRW5ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQ25DLHNCQUFzQixFQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUMxRSxvQkFBb0IsQ0FDcEIsQ0FBQztZQUVGLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLElBQUksVUFBVSxHQUFHLHNCQUFzQixFQUFFLFVBQVUsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDL0YsTUFBTSxTQUFTLEdBQUcsVUFBVSxHQUFHLHNCQUFzQixDQUFDO2dCQUN0RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixDQUFDLElBQUksbUJBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUN2RixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtvQkFDM0IsTUFBTSxJQUFJLEdBQ1QsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7d0JBQ2xCLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXO3dCQUMzRCxDQUFDLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUM1QixJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FDckMsQ0FBQyxJQUFJLENBQUM7b0JBRVYsSUFBSSxJQUFJLEdBQUcsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTt3QkFDbEYsTUFBTTtxQkFDTjtvQkFFRCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUUxSCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsY0FBYzt3QkFDakMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUM3QixJQUFJLG1CQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQ3hELEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUk7d0JBQzVDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUVwQixNQUFNLElBQUksMEJBQTBCLEtBQUssQ0FBQyxTQUFTLElBQUksU0FBUyxpQkFBaUIsSUFBSSxhQUFhLFVBQVUsWUFBWSxLQUFLLFlBQVksQ0FBQztpQkFDMUk7Z0JBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzthQUMzQjtZQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQzdCLENBQUM7UUFFTyxlQUFlLENBQ3RCLHNCQUE4QixFQUM5QixvQkFBNEIsRUFDNUIsb0JBQXFDO1lBRXJDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEtBQUssS0FBSztnQkFDekUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUN0RCxzQkFBc0IsRUFDdEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQjtvQkFDQyxlQUFlLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQjtvQkFDekUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixLQUFLLElBQUk7d0JBQzlFLENBQUMsQ0FBQyx1Q0FBcUIsQ0FBQyxPQUFPO3dCQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixLQUFLLFFBQVE7NEJBQ2xFLENBQUMsQ0FBQyx1Q0FBcUIsQ0FBQyxnQkFBZ0I7NEJBQ3hDLENBQUMsQ0FBQyx1Q0FBcUIsQ0FBQyxRQUFRO29CQUNsQyxlQUFlLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksS0FBSyxJQUFJO2lCQUNwRSxDQUNEO2dCQUNELENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFUixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVztnQkFDN0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUM3QyxzQkFBc0IsRUFDdEIsb0JBQW9CLENBQ3BCO2dCQUNELENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFUixJQUFJLDJCQUEyQixHQUFHLENBQUMsQ0FBQztZQUNwQyxJQUFJLHlCQUF5QixHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUUxQixJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQywwQkFBMEIsS0FBSyxLQUFLLElBQUksb0JBQW9CLEVBQUU7Z0JBQy9GLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLHNCQUFzQixFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3JKLDJCQUEyQixHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQztnQkFDL0QseUJBQXlCLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO2dCQUMzRCxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7YUFDNUM7WUFFRCxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWxFLE1BQU0sTUFBTSxHQUFvQixFQUFFLENBQUM7WUFDbkMsS0FBSyxJQUFJLFVBQVUsR0FBRyxzQkFBc0IsRUFBRSxVQUFVLElBQUksb0JBQW9CLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBQy9GLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBSyxFQUFlLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXhCLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDcEcsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLG1CQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFFckUsTUFBTSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVoRyxLQUFLLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLElBQUksa0JBQWtCLEVBQUUsU0FBUyxFQUFFLEVBQUU7b0JBQ3JFLE1BQU0sV0FBVyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7b0JBQ3JELE1BQU0sUUFBUTtvQkFDYiwyREFBMkQ7b0JBQzNELENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQixLQUFLLFFBQVEsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO3dCQUMzRywyQkFBMkIsSUFBSSxVQUFVO3dCQUN6QyxVQUFVLElBQUkseUJBQXlCO3dCQUN2QyxTQUFTLEtBQUssaUJBQWlCLENBQUM7b0JBQ2pDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUNqRyxNQUFNLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsYUFBYSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO3dCQUM3RSxVQUFVLENBQUMsSUFBSSxDQUNkLElBQUksNkJBQVcsQ0FDZCxXQUFXLEVBQ1gsQ0FBQyxDQUFDLEVBQ0YseUJBQXlCLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ3BGLElBQUksRUFDSixDQUFDLENBQUMsRUFDRixDQUFDLENBQUMsQ0FDRixDQUNELENBQUM7cUJBQ0Y7aUJBQ0Q7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3hFO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sTUFBTSxDQUFDLGVBQXVCLEVBQUUsVUFBa0I7WUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxNQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsZUFBZSxDQUFDO1lBQy9DLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7Z0JBQzVELE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUNEO0lBdk9ELGtEQXVPQztJQUVELFNBQVMsc0JBQXNCLENBQUMsS0FBd0I7UUFDdkQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ25DLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsSUFBQSx5Q0FBMEIsRUFBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUUvQyxNQUFNLE1BQU0sR0FBRztZQUNkLEVBQUUsWUFBWSxFQUFFLDBEQUFvQyxFQUFFLFVBQVUsRUFBRSx1REFBaUMsRUFBRSxnQkFBZ0IsRUFBRSw2REFBdUMsRUFBRTtZQUNoSyxFQUFFLFlBQVksRUFBRSwwREFBb0MsRUFBRSxVQUFVLEVBQUUsdURBQWlDLEVBQUUsZ0JBQWdCLEVBQUUsNkRBQXVDLEVBQUU7WUFDaEssRUFBRSxZQUFZLEVBQUUsMERBQW9DLEVBQUUsVUFBVSxFQUFFLHVEQUFpQyxFQUFFLGdCQUFnQixFQUFFLDZEQUF1QyxFQUFFO1lBQ2hLLEVBQUUsWUFBWSxFQUFFLDBEQUFvQyxFQUFFLFVBQVUsRUFBRSx1REFBaUMsRUFBRSxnQkFBZ0IsRUFBRSw2REFBdUMsRUFBRTtZQUNoSyxFQUFFLFlBQVksRUFBRSwwREFBb0MsRUFBRSxVQUFVLEVBQUUsdURBQWlDLEVBQUUsZ0JBQWdCLEVBQUUsNkRBQXVDLEVBQUU7WUFDaEssRUFBRSxZQUFZLEVBQUUsMERBQW9DLEVBQUUsVUFBVSxFQUFFLHVEQUFpQyxFQUFFLGdCQUFnQixFQUFFLDZEQUF1QyxFQUFFO1NBQ2hLLENBQUM7UUFDRixNQUFNLGFBQWEsR0FBRyxJQUFJLGlEQUEyQixFQUFFLENBQUM7UUFFeEQsTUFBTSxZQUFZLEdBQUc7WUFDcEIsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7WUFDaEYsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7WUFDaEYsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7WUFDaEYsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7WUFDaEYsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7WUFDaEYsRUFBRSxXQUFXLEVBQUUsd0NBQWtCLEVBQUUsaUJBQWlCLEVBQUUsOENBQXdCLEVBQUU7U0FDaEYsQ0FBQztRQUVGLE1BQU0sV0FBVyxHQUFHLE1BQU07YUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRTVELE1BQU0sbUJBQW1CLEdBQUcsc0JBQXNCLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLElBQUksWUFBWSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pILE1BQU0seUJBQXlCLEdBQUcsc0JBQXNCLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQztZQUVuSCxJQUFJLENBQUMsbUJBQW1CLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDdkQsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxPQUFPO2dCQUNOLFVBQVUsRUFBRSxtQkFBbUI7Z0JBQy9CLGdCQUFnQixFQUFFLHlCQUF5QjthQUMzQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO2FBQ0QsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztRQUVwQixNQUFNLGlCQUFpQixHQUFHLFlBQVk7YUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1IsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTlELE1BQU0sb0JBQW9CLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakUsTUFBTSwwQkFBMEIsR0FBRyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUN6RCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE9BQU87Z0JBQ04sV0FBVyxFQUFFLG9CQUFvQjtnQkFDakMsaUJBQWlCLEVBQUUsMEJBQTBCO2FBQzdDLENBQUM7UUFDSCxDQUFDLENBQUM7YUFDRCxNQUFNLENBQUMsaUJBQVMsQ0FBQyxDQUFDO1FBRXBCLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDM0IsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZELFNBQVMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxxQkFBcUIsTUFBTSxDQUFDLFVBQVUsMkJBQTJCLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLENBQUM7YUFDck07WUFFRCxTQUFTLENBQUMsT0FBTyxDQUFDLDhFQUE4RSxDQUFDLENBQUM7WUFDbEcsU0FBUyxDQUFDLE9BQU8sQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO1lBQ2xHLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0ZBQW9GLENBQUMsQ0FBQztZQUV4RyxTQUFTLENBQUMsT0FBTyxDQUFDLDRCQUE0QixhQUFhLENBQUMsZUFBZSw2REFBNkQsQ0FBQyxDQUFDO1lBQzFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLGFBQWEsQ0FBQyxlQUFlLHVEQUF1RCxDQUFDLENBQUM7WUFDMUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsYUFBYSxDQUFDLGVBQWUsMERBQTBELENBQUMsQ0FBQztTQUNoSjtRQUVELElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUN4QyxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25FLFNBQVMsQ0FBQyxPQUFPLENBQUMsd0RBQXdELEtBQUssc0JBQXNCLE1BQU0sQ0FBQyxXQUFXLDRCQUE0QixNQUFNLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxDQUFDO2FBQ2xMO1lBRUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1lBQzNILFNBQVMsQ0FBQyxPQUFPLENBQUMsNEhBQTRILENBQUMsQ0FBQztTQUNoSjtJQUNGLENBQUMsQ0FBQyxDQUFDIn0=