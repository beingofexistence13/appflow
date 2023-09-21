/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/range", "vs/editor/common/model/textModelPart", "vs/editor/common/model/utils", "vs/editor/common/textModelGuides", "vs/base/common/errors"], function (require, exports, arraysFind_1, strings, cursorColumns_1, range_1, textModelPart_1, utils_1, textModelGuides_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketPairGuidesClassNames = exports.GuidesTextModelPart = void 0;
    class GuidesTextModelPart extends textModelPart_1.TextModelPart {
        constructor(textModel, languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.languageConfigurationService = languageConfigurationService;
        }
        getLanguageConfiguration(languageId) {
            return this.languageConfigurationService.getLanguageConfiguration(languageId);
        }
        _computeIndentLevel(lineIndex) {
            return (0, utils_1.computeIndentLevel)(this.textModel.getLineContent(lineIndex + 1), this.textModel.getOptions().tabSize);
        }
        getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber) {
            this.assertNotDisposed();
            const lineCount = this.textModel.getLineCount();
            if (lineNumber < 1 || lineNumber > lineCount) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            const foldingRules = this.getLanguageConfiguration(this.textModel.getLanguageId()).foldingRules;
            const offSide = Boolean(foldingRules && foldingRules.offSide);
            let up_aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let up_aboveContentLineIndent = -1;
            let up_belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let up_belowContentLineIndent = -1;
            const up_resolveIndents = (lineNumber) => {
                if (up_aboveContentLineIndex !== -1 &&
                    (up_aboveContentLineIndex === -2 ||
                        up_aboveContentLineIndex > lineNumber - 1)) {
                    up_aboveContentLineIndex = -1;
                    up_aboveContentLineIndent = -1;
                    // must find previous line with content
                    for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            up_aboveContentLineIndex = lineIndex;
                            up_aboveContentLineIndent = indent;
                            break;
                        }
                    }
                }
                if (up_belowContentLineIndex === -2) {
                    up_belowContentLineIndex = -1;
                    up_belowContentLineIndent = -1;
                    // must find next line with content
                    for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            up_belowContentLineIndex = lineIndex;
                            up_belowContentLineIndent = indent;
                            break;
                        }
                    }
                }
            };
            let down_aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let down_aboveContentLineIndent = -1;
            let down_belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let down_belowContentLineIndent = -1;
            const down_resolveIndents = (lineNumber) => {
                if (down_aboveContentLineIndex === -2) {
                    down_aboveContentLineIndex = -1;
                    down_aboveContentLineIndent = -1;
                    // must find previous line with content
                    for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            down_aboveContentLineIndex = lineIndex;
                            down_aboveContentLineIndent = indent;
                            break;
                        }
                    }
                }
                if (down_belowContentLineIndex !== -1 &&
                    (down_belowContentLineIndex === -2 ||
                        down_belowContentLineIndex < lineNumber - 1)) {
                    down_belowContentLineIndex = -1;
                    down_belowContentLineIndent = -1;
                    // must find next line with content
                    for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            down_belowContentLineIndex = lineIndex;
                            down_belowContentLineIndent = indent;
                            break;
                        }
                    }
                }
            };
            let startLineNumber = 0;
            let goUp = true;
            let endLineNumber = 0;
            let goDown = true;
            let indent = 0;
            let initialIndent = 0;
            for (let distance = 0; goUp || goDown; distance++) {
                const upLineNumber = lineNumber - distance;
                const downLineNumber = lineNumber + distance;
                if (distance > 1 && (upLineNumber < 1 || upLineNumber < minLineNumber)) {
                    goUp = false;
                }
                if (distance > 1 &&
                    (downLineNumber > lineCount || downLineNumber > maxLineNumber)) {
                    goDown = false;
                }
                if (distance > 50000) {
                    // stop processing
                    goUp = false;
                    goDown = false;
                }
                let upLineIndentLevel = -1;
                if (goUp && upLineNumber >= 1) {
                    // compute indent level going up
                    const currentIndent = this._computeIndentLevel(upLineNumber - 1);
                    if (currentIndent >= 0) {
                        // This line has content (besides whitespace)
                        // Use the line's indent
                        up_belowContentLineIndex = upLineNumber - 1;
                        up_belowContentLineIndent = currentIndent;
                        upLineIndentLevel = Math.ceil(currentIndent / this.textModel.getOptions().indentSize);
                    }
                    else {
                        up_resolveIndents(upLineNumber);
                        upLineIndentLevel = this._getIndentLevelForWhitespaceLine(offSide, up_aboveContentLineIndent, up_belowContentLineIndent);
                    }
                }
                let downLineIndentLevel = -1;
                if (goDown && downLineNumber <= lineCount) {
                    // compute indent level going down
                    const currentIndent = this._computeIndentLevel(downLineNumber - 1);
                    if (currentIndent >= 0) {
                        // This line has content (besides whitespace)
                        // Use the line's indent
                        down_aboveContentLineIndex = downLineNumber - 1;
                        down_aboveContentLineIndent = currentIndent;
                        downLineIndentLevel = Math.ceil(currentIndent / this.textModel.getOptions().indentSize);
                    }
                    else {
                        down_resolveIndents(downLineNumber);
                        downLineIndentLevel = this._getIndentLevelForWhitespaceLine(offSide, down_aboveContentLineIndent, down_belowContentLineIndent);
                    }
                }
                if (distance === 0) {
                    initialIndent = upLineIndentLevel;
                    continue;
                }
                if (distance === 1) {
                    if (downLineNumber <= lineCount &&
                        downLineIndentLevel >= 0 &&
                        initialIndent + 1 === downLineIndentLevel) {
                        // This is the beginning of a scope, we have special handling here, since we want the
                        // child scope indent to be active, not the parent scope
                        goUp = false;
                        startLineNumber = downLineNumber;
                        endLineNumber = downLineNumber;
                        indent = downLineIndentLevel;
                        continue;
                    }
                    if (upLineNumber >= 1 &&
                        upLineIndentLevel >= 0 &&
                        upLineIndentLevel - 1 === initialIndent) {
                        // This is the end of a scope, just like above
                        goDown = false;
                        startLineNumber = upLineNumber;
                        endLineNumber = upLineNumber;
                        indent = upLineIndentLevel;
                        continue;
                    }
                    startLineNumber = lineNumber;
                    endLineNumber = lineNumber;
                    indent = initialIndent;
                    if (indent === 0) {
                        // No need to continue
                        return { startLineNumber, endLineNumber, indent };
                    }
                }
                if (goUp) {
                    if (upLineIndentLevel >= indent) {
                        startLineNumber = upLineNumber;
                    }
                    else {
                        goUp = false;
                    }
                }
                if (goDown) {
                    if (downLineIndentLevel >= indent) {
                        endLineNumber = downLineNumber;
                    }
                    else {
                        goDown = false;
                    }
                }
            }
            return { startLineNumber, endLineNumber, indent };
        }
        getLinesBracketGuides(startLineNumber, endLineNumber, activePosition, options) {
            const result = [];
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                result.push([]);
            }
            // If requested, this could be made configurable.
            const includeSingleLinePairs = true;
            const bracketPairs = this.textModel.bracketPairs.getBracketPairsInRangeWithMinIndentation(new range_1.Range(startLineNumber, 1, endLineNumber, this.textModel.getLineMaxColumn(endLineNumber))).toArray();
            let activeBracketPairRange = undefined;
            if (activePosition && bracketPairs.length > 0) {
                const bracketsContainingActivePosition = (startLineNumber <= activePosition.lineNumber &&
                    activePosition.lineNumber <= endLineNumber
                    // We don't need to query the brackets again if the cursor is in the viewport
                    ? bracketPairs
                    : this.textModel.bracketPairs.getBracketPairsInRange(range_1.Range.fromPositions(activePosition)).toArray()).filter((bp) => range_1.Range.strictContainsPosition(bp.range, activePosition));
                activeBracketPairRange = (0, arraysFind_1.findLast)(bracketsContainingActivePosition, (i) => includeSingleLinePairs || i.range.startLineNumber !== i.range.endLineNumber)?.range;
            }
            const independentColorPoolPerBracketType = this.textModel.getOptions().bracketPairColorizationOptions.independentColorPoolPerBracketType;
            const colorProvider = new BracketPairGuidesClassNames();
            for (const pair of bracketPairs) {
                /*
    
    
                        {
                        |
                        }
    
                        {
                        |
                        ----}
    
                    ____{
                    |test
                    ----}
    
                    renderHorizontalEndLineAtTheBottom:
                        {
                        |
                        |x}
                        --
                    renderHorizontalEndLineAtTheBottom:
                    ____{
                    |test
                    | x }
                    ----
                */
                if (!pair.closingBracketRange) {
                    continue;
                }
                const isActive = activeBracketPairRange && pair.range.equalsRange(activeBracketPairRange);
                if (!isActive && !options.includeInactive) {
                    continue;
                }
                const className = colorProvider.getInlineClassName(pair.nestingLevel, pair.nestingLevelOfEqualBracketType, independentColorPoolPerBracketType) +
                    (options.highlightActive && isActive
                        ? ' ' + colorProvider.activeClassName
                        : '');
                const start = pair.openingBracketRange.getStartPosition();
                const end = pair.closingBracketRange.getStartPosition();
                const horizontalGuides = options.horizontalGuides === textModelGuides_1.HorizontalGuidesState.Enabled || (options.horizontalGuides === textModelGuides_1.HorizontalGuidesState.EnabledForActive && isActive);
                if (pair.range.startLineNumber === pair.range.endLineNumber) {
                    if (includeSingleLinePairs && horizontalGuides) {
                        result[pair.range.startLineNumber - startLineNumber].push(new textModelGuides_1.IndentGuide(-1, pair.openingBracketRange.getEndPosition().column, className, new textModelGuides_1.IndentGuideHorizontalLine(false, end.column), -1, -1));
                    }
                    continue;
                }
                const endVisibleColumn = this.getVisibleColumnFromPosition(end);
                const startVisibleColumn = this.getVisibleColumnFromPosition(pair.openingBracketRange.getStartPosition());
                const guideVisibleColumn = Math.min(startVisibleColumn, endVisibleColumn, pair.minVisibleColumnIndentation + 1);
                let renderHorizontalEndLineAtTheBottom = false;
                const firstNonWsIndex = strings.firstNonWhitespaceIndex(this.textModel.getLineContent(pair.closingBracketRange.startLineNumber));
                const hasTextBeforeClosingBracket = firstNonWsIndex < pair.closingBracketRange.startColumn - 1;
                if (hasTextBeforeClosingBracket) {
                    renderHorizontalEndLineAtTheBottom = true;
                }
                const visibleGuideStartLineNumber = Math.max(start.lineNumber, startLineNumber);
                const visibleGuideEndLineNumber = Math.min(end.lineNumber, endLineNumber);
                const offset = renderHorizontalEndLineAtTheBottom ? 1 : 0;
                for (let l = visibleGuideStartLineNumber; l < visibleGuideEndLineNumber + offset; l++) {
                    result[l - startLineNumber].push(new textModelGuides_1.IndentGuide(guideVisibleColumn, -1, className, null, l === start.lineNumber ? start.column : -1, l === end.lineNumber ? end.column : -1));
                }
                if (horizontalGuides) {
                    if (start.lineNumber >= startLineNumber && startVisibleColumn > guideVisibleColumn) {
                        result[start.lineNumber - startLineNumber].push(new textModelGuides_1.IndentGuide(guideVisibleColumn, -1, className, new textModelGuides_1.IndentGuideHorizontalLine(false, start.column), -1, -1));
                    }
                    if (end.lineNumber <= endLineNumber && endVisibleColumn > guideVisibleColumn) {
                        result[end.lineNumber - startLineNumber].push(new textModelGuides_1.IndentGuide(guideVisibleColumn, -1, className, new textModelGuides_1.IndentGuideHorizontalLine(!renderHorizontalEndLineAtTheBottom, end.column), -1, -1));
                    }
                }
            }
            for (const guides of result) {
                guides.sort((a, b) => a.visibleColumn - b.visibleColumn);
            }
            return result;
        }
        getVisibleColumnFromPosition(position) {
            return (cursorColumns_1.CursorColumns.visibleColumnFromColumn(this.textModel.getLineContent(position.lineNumber), position.column, this.textModel.getOptions().tabSize) + 1);
        }
        getLinesIndentGuides(startLineNumber, endLineNumber) {
            this.assertNotDisposed();
            const lineCount = this.textModel.getLineCount();
            if (startLineNumber < 1 || startLineNumber > lineCount) {
                throw new Error('Illegal value for startLineNumber');
            }
            if (endLineNumber < 1 || endLineNumber > lineCount) {
                throw new Error('Illegal value for endLineNumber');
            }
            const options = this.textModel.getOptions();
            const foldingRules = this.getLanguageConfiguration(this.textModel.getLanguageId()).foldingRules;
            const offSide = Boolean(foldingRules && foldingRules.offSide);
            const result = new Array(endLineNumber - startLineNumber + 1);
            let aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let aboveContentLineIndent = -1;
            let belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
            let belowContentLineIndent = -1;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const resultIndex = lineNumber - startLineNumber;
                const currentIndent = this._computeIndentLevel(lineNumber - 1);
                if (currentIndent >= 0) {
                    // This line has content (besides whitespace)
                    // Use the line's indent
                    aboveContentLineIndex = lineNumber - 1;
                    aboveContentLineIndent = currentIndent;
                    result[resultIndex] = Math.ceil(currentIndent / options.indentSize);
                    continue;
                }
                if (aboveContentLineIndex === -2) {
                    aboveContentLineIndex = -1;
                    aboveContentLineIndent = -1;
                    // must find previous line with content
                    for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            aboveContentLineIndex = lineIndex;
                            aboveContentLineIndent = indent;
                            break;
                        }
                    }
                }
                if (belowContentLineIndex !== -1 &&
                    (belowContentLineIndex === -2 || belowContentLineIndex < lineNumber - 1)) {
                    belowContentLineIndex = -1;
                    belowContentLineIndent = -1;
                    // must find next line with content
                    for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                        const indent = this._computeIndentLevel(lineIndex);
                        if (indent >= 0) {
                            belowContentLineIndex = lineIndex;
                            belowContentLineIndent = indent;
                            break;
                        }
                    }
                }
                result[resultIndex] = this._getIndentLevelForWhitespaceLine(offSide, aboveContentLineIndent, belowContentLineIndent);
            }
            return result;
        }
        _getIndentLevelForWhitespaceLine(offSide, aboveContentLineIndent, belowContentLineIndent) {
            const options = this.textModel.getOptions();
            if (aboveContentLineIndent === -1 || belowContentLineIndent === -1) {
                // At the top or bottom of the file
                return 0;
            }
            else if (aboveContentLineIndent < belowContentLineIndent) {
                // we are inside the region above
                return 1 + Math.floor(aboveContentLineIndent / options.indentSize);
            }
            else if (aboveContentLineIndent === belowContentLineIndent) {
                // we are in between two regions
                return Math.ceil(belowContentLineIndent / options.indentSize);
            }
            else {
                if (offSide) {
                    // same level as region below
                    return Math.ceil(belowContentLineIndent / options.indentSize);
                }
                else {
                    // we are inside the region that ends below
                    return 1 + Math.floor(belowContentLineIndent / options.indentSize);
                }
            }
        }
    }
    exports.GuidesTextModelPart = GuidesTextModelPart;
    class BracketPairGuidesClassNames {
        constructor() {
            this.activeClassName = 'indent-active';
        }
        getInlineClassName(nestingLevel, nestingLevelOfEqualBracketType, independentColorPoolPerBracketType) {
            return this.getInlineClassNameOfLevel(independentColorPoolPerBracketType ? nestingLevelOfEqualBracketType : nestingLevel);
        }
        getInlineClassNameOfLevel(level) {
            // To support a dynamic amount of colors up to 6 colors,
            // we use a number that is a lcm of all numbers from 1 to 6.
            return `bracket-indent-guide lvl-${level % 30}`;
        }
    }
    exports.BracketPairGuidesClassNames = BracketPairGuidesClassNames;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpZGVzVGV4dE1vZGVsUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvZ3VpZGVzVGV4dE1vZGVsUGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxtQkFBb0IsU0FBUSw2QkFBYTtRQUNyRCxZQUNrQixTQUFvQixFQUNwQiw0QkFBMkQ7WUFFNUUsS0FBSyxFQUFFLENBQUM7WUFIUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1lBQ3BCLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBK0I7UUFHN0UsQ0FBQztRQUVPLHdCQUF3QixDQUMvQixVQUFrQjtZQUVsQixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyx3QkFBd0IsQ0FDaEUsVUFBVSxDQUNWLENBQUM7UUFDSCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsU0FBaUI7WUFDNUMsT0FBTyxJQUFBLDBCQUFrQixFQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUNuQyxDQUFDO1FBQ0gsQ0FBQztRQUVNLG9CQUFvQixDQUMxQixVQUFrQixFQUNsQixhQUFxQixFQUNyQixhQUFxQjtZQUVyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRWhELElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxVQUFVLEdBQUcsU0FBUyxFQUFFO2dCQUM3QyxNQUFNLElBQUksMkJBQWtCLENBQUMsOEJBQThCLENBQUMsQ0FBQzthQUM3RDtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FDakQsSUFBSSxDQUFDLFNB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