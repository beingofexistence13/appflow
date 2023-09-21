/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/types", "vs/editor/common/model/guidesTextModelPart", "vs/editor/common/textModelGuides", "vs/css!./indentGuides"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, themeService_1, position_1, arrays_1, types_1, guidesTextModelPart_1, textModelGuides_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sX = void 0;
    class $sX extends dynamicViewOverlay_1.$eX {
        constructor(context) {
            super();
            this.a = context;
            this.b = null;
            const options = this.a.configuration.options;
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this.j = options.get(66 /* EditorOption.lineHeight */);
            this.m = fontInfo.spaceWidth;
            this.r = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            this.s = options.get(16 /* EditorOption.guides */);
            this.n = null;
            this.a.addEventHandler(this);
        }
        dispose() {
            this.a.removeEventHandler(this);
            this.n = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this.a.configuration.options;
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this.j = options.get(66 /* EditorOption.lineHeight */);
            this.m = fontInfo.spaceWidth;
            this.r = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            this.s = options.get(16 /* EditorOption.guides */);
            return true;
        }
        onCursorStateChanged(e) {
            const selection = e.selections[0];
            const newPosition = selection.getPosition();
            if (!this.b?.equals(newPosition)) {
                this.b = newPosition;
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
            if (!this.s.indentation && this.s.bracketPairs === false) {
                this.n = null;
                return;
            }
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const scrollWidth = ctx.scrollWidth;
            const lineHeight = this.j;
            const activeCursorPosition = this.b;
            const indents = this.t(visibleStartLineNumber, Math.min(visibleEndLineNumber + 1, this.a.viewModel.getLineCount()), activeCursorPosition);
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const indent = indents[lineIndex];
                let result = '';
                const leftOffset = ctx.visibleRangeForPosition(new position_1.$js(lineNumber, 1))?.left ?? 0;
                for (const guide of indent) {
                    const left = guide.column === -1
                        ? leftOffset + (guide.visibleColumn - 1) * this.m
                        : ctx.visibleRangeForPosition(new position_1.$js(lineNumber, guide.column)).left;
                    if (left > scrollWidth || (this.r > 0 && left > this.r)) {
                        break;
                    }
                    const className = guide.horizontalLine ? (guide.horizontalLine.top ? 'horizontal-top' : 'horizontal-bottom') : 'vertical';
                    const width = guide.horizontalLine
                        ? (ctx.visibleRangeForPosition(new position_1.$js(lineNumber, guide.horizontalLine.endColumn))?.left ?? (left + this.m)) - left
                        : this.m;
                    result += `<div class="core-guide ${guide.className} ${className}" style="left:${left}px;height:${lineHeight}px;width:${width}px"></div>`;
                }
                output[lineIndex] = result;
            }
            this.n = output;
        }
        t(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition) {
            const bracketGuides = this.s.bracketPairs !== false
                ? this.a.viewModel.getBracketGuidesInRangeByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition, {
                    highlightActive: this.s.highlightActiveBracketPair,
                    horizontalGuides: this.s.bracketPairsHorizontal === true
                        ? textModelGuides_1.HorizontalGuidesState.Enabled
                        : this.s.bracketPairsHorizontal === 'active'
                            ? textModelGuides_1.HorizontalGuidesState.EnabledForActive
                            : textModelGuides_1.HorizontalGuidesState.Disabled,
                    includeInactive: this.s.bracketPairs === true,
                })
                : null;
            const indentGuides = this.s.indentation
                ? this.a.viewModel.getLinesIndentGuides(visibleStartLineNumber, visibleEndLineNumber)
                : null;
            let activeIndentStartLineNumber = 0;
            let activeIndentEndLineNumber = 0;
            let activeIndentLevel = 0;
            if (this.s.highlightActiveIndentation !== false && activeCursorPosition) {
                const activeIndentInfo = this.a.viewModel.getActiveIndentGuide(activeCursorPosition.lineNumber, visibleStartLineNumber, visibleEndLineNumber);
                activeIndentStartLineNumber = activeIndentInfo.startLineNumber;
                activeIndentEndLineNumber = activeIndentInfo.endLineNumber;
                activeIndentLevel = activeIndentInfo.indent;
            }
            const { indentSize } = this.a.viewModel.model.getOptions();
            const result = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineGuides = new Array();
                result.push(lineGuides);
                const bracketGuidesInLine = bracketGuides ? bracketGuides[lineNumber - visibleStartLineNumber] : [];
                const bracketGuidesInLineQueue = new arrays_1.$0b(bracketGuidesInLine);
                const indentGuidesInLine = indentGuides ? indentGuides[lineNumber - visibleStartLineNumber] : 0;
                for (let indentLvl = 1; indentLvl <= indentGuidesInLine; indentLvl++) {
                    const indentGuide = (indentLvl - 1) * indentSize + 1;
                    const isActive = 
                    // Disable active indent guide if there are bracket guides.
                    (this.s.highlightActiveIndentation === 'always' || bracketGuidesInLine.length === 0) &&
                        activeIndentStartLineNumber <= lineNumber &&
                        lineNumber <= activeIndentEndLineNumber &&
                        indentLvl === activeIndentLevel;
                    lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => g.visibleColumn < indentGuide) || []);
                    const peeked = bracketGuidesInLineQueue.peek();
                    if (!peeked || peeked.visibleColumn !== indentGuide || peeked.horizontalLine) {
                        lineGuides.push(new textModelGuides_1.$su(indentGuide, -1, `core-guide-indent lvl-${(indentLvl - 1) % 30}` + (isActive ? ' indent-active' : ''), null, -1, -1));
                    }
                }
                lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => true) || []);
            }
            return result;
        }
        render(startLineNumber, lineNumber) {
            if (!this.n) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this.n.length) {
                return '';
            }
            return this.n[lineIndex];
        }
    }
    exports.$sX = $sX;
    function transparentToUndefined(color) {
        if (color && color.isTransparent()) {
            return undefined;
        }
        return color;
    }
    (0, themeService_1.$mv)((theme, collector) => {
        const colors = [
            { bracketColor: editorColorRegistry_1.$vB, guideColor: editorColorRegistry_1.$CB, guideColorActive: editorColorRegistry_1.$IB },
            { bracketColor: editorColorRegistry_1.$wB, guideColor: editorColorRegistry_1.$DB, guideColorActive: editorColorRegistry_1.$JB },
            { bracketColor: editorColorRegistry_1.$xB, guideColor: editorColorRegistry_1.$EB, guideColorActive: editorColorRegistry_1.$KB },
            { bracketColor: editorColorRegistry_1.$yB, guideColor: editorColorRegistry_1.$FB, guideColorActive: editorColorRegistry_1.$LB },
            { bracketColor: editorColorRegistry_1.$zB, guideColor: editorColorRegistry_1.$GB, guideColorActive: editorColorRegistry_1.$MB },
            { bracketColor: editorColorRegistry_1.$AB, guideColor: editorColorRegistry_1.$HB, guideColorActive: editorColorRegistry_1.$NB }
        ];
        const colorProvider = new guidesTextModelPart_1.$ZB();
        const indentColors = [
            { indentColor: editorColorRegistry_1.$4A, indentColorActive: editorColorRegistry_1.$0A },
            { indentColor: editorColorRegistry_1.$5A, indentColorActive: editorColorRegistry_1.$$A },
            { indentColor: editorColorRegistry_1.$6A, indentColorActive: editorColorRegistry_1.$_A },
            { indentColor: editorColorRegistry_1.$7A, indentColorActive: editorColorRegistry_1.$aB },
            { indentColor: editorColorRegistry_1.$8A, indentColorActive: editorColorRegistry_1.$bB },
            { indentColor: editorColorRegistry_1.$9A, indentColorActive: editorColorRegistry_1.$cB },
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
            .filter(types_1.$rf);
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
            .filter(types_1.$rf);
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
//# sourceMappingURL=indentGuides.js.map