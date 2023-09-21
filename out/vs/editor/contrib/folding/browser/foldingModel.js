/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "./foldingRanges", "vs/base/common/hash"], function (require, exports, event_1, foldingRanges_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNextFoldLine = exports.getPreviousFoldLine = exports.getParentFoldLine = exports.setCollapseStateForType = exports.setCollapseStateForMatchingLines = exports.setCollapseStateForRest = exports.setCollapseStateAtLevel = exports.setCollapseStateUp = exports.setCollapseStateLevelsUp = exports.setCollapseStateLevelsDown = exports.toggleCollapseState = exports.FoldingModel = void 0;
    class FoldingModel {
        get regions() { return this._regions; }
        get textModel() { return this._textModel; }
        get decorationProvider() { return this._decorationProvider; }
        constructor(textModel, decorationProvider) {
            this._updateEventEmitter = new event_1.Emitter();
            this.onDidChange = this._updateEventEmitter.event;
            this._textModel = textModel;
            this._decorationProvider = decorationProvider;
            this._regions = new foldingRanges_1.FoldingRegions(new Uint32Array(0), new Uint32Array(0));
            this._editorDecorationIds = [];
        }
        toggleCollapseState(toggledRegions) {
            if (!toggledRegions.length) {
                return;
            }
            toggledRegions = toggledRegions.sort((r1, r2) => r1.regionIndex - r2.regionIndex);
            const processed = {};
            this._decorationProvider.changeDecorations(accessor => {
                let k = 0; // index from [0 ... this.regions.length]
                let dirtyRegionEndLine = -1; // end of the range where decorations need to be updated
                let lastHiddenLine = -1; // the end of the last hidden lines
                const updateDecorationsUntil = (index) => {
                    while (k < index) {
                        const endLineNumber = this._regions.getEndLineNumber(k);
                        const isCollapsed = this._regions.isCollapsed(k);
                        if (endLineNumber <= dirtyRegionEndLine) {
                            const isManual = this.regions.getSource(k) !== 0 /* FoldSource.provider */;
                            accessor.changeDecorationOptions(this._editorDecorationIds[k], this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual));
                        }
                        if (isCollapsed && endLineNumber > lastHiddenLine) {
                            lastHiddenLine = endLineNumber;
                        }
                        k++;
                    }
                };
                for (const region of toggledRegions) {
                    const index = region.regionIndex;
                    const editorDecorationId = this._editorDecorationIds[index];
                    if (editorDecorationId && !processed[editorDecorationId]) {
                        processed[editorDecorationId] = true;
                        updateDecorationsUntil(index); // update all decorations up to current index using the old dirtyRegionEndLine
                        const newCollapseState = !this._regions.isCollapsed(index);
                        this._regions.setCollapsed(index, newCollapseState);
                        dirtyRegionEndLine = Math.max(dirtyRegionEndLine, this._regions.getEndLineNumber(index));
                    }
                }
                updateDecorationsUntil(this._regions.length);
            });
            this._updateEventEmitter.fire({ model: this, collapseStateChanged: toggledRegions });
        }
        removeManualRanges(ranges) {
            const newFoldingRanges = new Array();
            const intersects = (foldRange) => {
                for (const range of ranges) {
                    if (!(range.startLineNumber > foldRange.endLineNumber || foldRange.startLineNumber > range.endLineNumber)) {
                        return true;
                    }
                }
                return false;
            };
            for (let i = 0; i < this._regions.length; i++) {
                const foldRange = this._regions.toFoldRange(i);
                if (foldRange.source === 0 /* FoldSource.provider */ || !intersects(foldRange)) {
                    newFoldingRanges.push(foldRange);
                }
            }
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newFoldingRanges));
        }
        update(newRegions, blockedLineNumers = []) {
            const foldedOrManualRanges = this._currentFoldedOrManualRanges(blockedLineNumers);
            const newRanges = foldingRanges_1.FoldingRegions.sanitizeAndMerge(newRegions, foldedOrManualRanges, this._textModel.getLineCount());
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newRanges));
        }
        updatePost(newRegions) {
            const newEditorDecorations = [];
            let lastHiddenLine = -1;
            for (let index = 0, limit = newRegions.length; index < limit; index++) {
                const startLineNumber = newRegions.getStartLineNumber(index);
                const endLineNumber = newRegions.getEndLineNumber(index);
                const isCollapsed = newRegions.isCollapsed(index);
                const isManual = newRegions.getSource(index) !== 0 /* FoldSource.provider */;
                const decorationRange = {
                    startLineNumber: startLineNumber,
                    startColumn: this._textModel.getLineMaxColumn(startLineNumber),
                    endLineNumber: endLineNumber,
                    endColumn: this._textModel.getLineMaxColumn(endLineNumber) + 1
                };
                newEditorDecorations.push({ range: decorationRange, options: this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual) });
                if (isCollapsed && endLineNumber > lastHiddenLine) {
                    lastHiddenLine = endLineNumber;
                }
            }
            this._decorationProvider.changeDecorations(accessor => this._editorDecorationIds = accessor.deltaDecorations(this._editorDecorationIds, newEditorDecorations));
            this._regions = newRegions;
            this._updateEventEmitter.fire({ model: this });
        }
        _currentFoldedOrManualRanges(blockedLineNumers = []) {
            const isBlocked = (startLineNumber, endLineNumber) => {
                for (const blockedLineNumber of blockedLineNumers) {
                    if (startLineNumber < blockedLineNumber && blockedLineNumber <= endLineNumber) { // first line is visible
                        return true;
                    }
                }
                return false;
            };
            const foldedRanges = [];
            for (let i = 0, limit = this._regions.length; i < limit; i++) {
                let isCollapsed = this.regions.isCollapsed(i);
                const source = this.regions.getSource(i);
                if (isCollapsed || source !== 0 /* FoldSource.provider */) {
                    const foldRange = this._regions.toFoldRange(i);
                    const decRange = this._textModel.getDecorationRange(this._editorDecorationIds[i]);
                    if (decRange) {
                        if (isCollapsed && isBlocked(decRange.startLineNumber, decRange.endLineNumber)) {
                            isCollapsed = false; // uncollapse is the range is blocked
                        }
                        foldedRanges.push({
                            startLineNumber: decRange.startLineNumber,
                            endLineNumber: decRange.endLineNumber,
                            type: foldRange.type,
                            isCollapsed,
                            source
                        });
                    }
                }
            }
            return foldedRanges;
        }
        /**
         * Collapse state memento, for persistence only
         */
        getMemento() {
            const foldedOrManualRanges = this._currentFoldedOrManualRanges();
            const result = [];
            const maxLineNumber = this._textModel.getLineCount();
            for (let i = 0, limit = foldedOrManualRanges.length; i < limit; i++) {
                const range = foldedOrManualRanges[i];
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this._getLinesChecksum(range.startLineNumber + 1, range.endLineNumber);
                result.push({
                    startLineNumber: range.startLineNumber,
                    endLineNumber: range.endLineNumber,
                    isCollapsed: range.isCollapsed,
                    source: range.source,
                    checksum: checksum
                });
            }
            return (result.length > 0) ? result : undefined;
        }
        /**
         * Apply persisted state, for persistence only
         */
        applyMemento(state) {
            if (!Array.isArray(state)) {
                return;
            }
            const rangesToRestore = [];
            const maxLineNumber = this._textModel.getLineCount();
            for (const range of state) {
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this._getLinesChecksum(range.startLineNumber + 1, range.endLineNumber);
                if (!range.checksum || checksum === range.checksum) {
                    rangesToRestore.push({
                        startLineNumber: range.startLineNumber,
                        endLineNumber: range.endLineNumber,
                        type: undefined,
                        isCollapsed: range.isCollapsed ?? true,
                        source: range.source ?? 0 /* FoldSource.provider */
                    });
                }
            }
            const newRanges = foldingRanges_1.FoldingRegions.sanitizeAndMerge(this._regions, rangesToRestore, maxLineNumber);
            this.updatePost(foldingRanges_1.FoldingRegions.fromFoldRanges(newRanges));
        }
        _getLinesChecksum(lineNumber1, lineNumber2) {
            const h = (0, hash_1.hash)(this._textModel.getLineContent(lineNumber1)
                + this._textModel.getLineContent(lineNumber2));
            return h % 1000000; // 6 digits is plenty
        }
        dispose() {
            this._decorationProvider.removeDecorations(this._editorDecorationIds);
        }
        getAllRegionsAtLine(lineNumber, filter) {
            const result = [];
            if (this._regions) {
                let index = this._regions.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    const current = this._regions.toRegion(index);
                    if (!filter || filter(current, level)) {
                        result.push(current);
                    }
                    level++;
                    index = current.parentIndex;
                }
            }
            return result;
        }
        getRegionAtLine(lineNumber) {
            if (this._regions) {
                const index = this._regions.findRange(lineNumber);
                if (index >= 0) {
                    return this._regions.toRegion(index);
                }
            }
            return null;
        }
        getRegionsInside(region, filter) {
            const result = [];
            const index = region ? region.regionIndex + 1 : 0;
            const endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
            if (filter && filter.length === 2) {
                const levelStack = [];
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
                            levelStack.pop();
                        }
                        levelStack.push(current);
                        if (filter(current, levelStack.length)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                for (let i = index, len = this._regions.length; i < len; i++) {
                    const current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        if (!filter || filter(current)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return result;
        }
    }
    exports.FoldingModel = FoldingModel;
    /**
     * Collapse or expand the regions at the given locations
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function toggleCollapseState(foldingModel, levels, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const region = foldingModel.getRegionAtLine(lineNumber);
            if (region) {
                const doCollapse = !region.isCollapsed;
                toToggle.push(region);
                if (levels > 1) {
                    const regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                    toToggle.push(...regionsInside);
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.toggleCollapseState = toggleCollapseState;
    /**
     * Collapse or expand the regions at the given locations including all children.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function setCollapseStateLevelsDown(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
        const toToggle = [];
        if (lineNumbers && lineNumbers.length > 0) {
            for (const lineNumber of lineNumbers) {
                const region = foldingModel.getRegionAtLine(lineNumber);
                if (region) {
                    if (region.isCollapsed !== doCollapse) {
                        toToggle.push(region);
                    }
                    if (levels > 1) {
                        const regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                        toToggle.push(...regionsInside);
                    }
                }
            }
        }
        else {
            const regionsInside = foldingModel.getRegionsInside(null, (r, level) => r.isCollapsed !== doCollapse && level < levels);
            toToggle.push(...regionsInside);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsDown = setCollapseStateLevelsDown;
    /**
     * Collapse or expand the regions at the given locations including all parents.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateLevelsUp(foldingModel, doCollapse, levels, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region, level) => region.isCollapsed !== doCollapse && level <= levels);
            toToggle.push(...regions);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsUp = setCollapseStateLevelsUp;
    /**
     * Collapse or expand a region at the given locations. If the inner most region is already collapsed/expanded, uses the first parent instead.
     * @param doCollapse Whether to collapse or expand
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateUp(foldingModel, doCollapse, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region) => region.isCollapsed !== doCollapse);
            if (regions.length > 0) {
                toToggle.push(regions[0]);
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateUp = setCollapseStateUp;
    /**
     * Folds or unfolds all regions that have a given level, except if they contain one of the blocked lines.
     * @param foldLevel level. Level == 1 is the top level
     * @param doCollapse Whether to collapse or expand
    */
    function setCollapseStateAtLevel(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
        const filter = (region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some(line => region.containsLine(line));
        const toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateAtLevel = setCollapseStateAtLevel;
    /**
     * Folds or unfolds all regions, except if they contain or are contained by a region of one of the blocked lines.
     * @param doCollapse Whether to collapse or expand
     * @param blockedLineNumbers the location of regions to not collapse or expand
     */
    function setCollapseStateForRest(foldingModel, doCollapse, blockedLineNumbers) {
        const filteredRegions = [];
        for (const lineNumber of blockedLineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, undefined);
            if (regions.length > 0) {
                filteredRegions.push(regions[0]);
            }
        }
        const filter = (region) => filteredRegions.every((filteredRegion) => !filteredRegion.containedBy(region) && !region.containedBy(filteredRegion)) && region.isCollapsed !== doCollapse;
        const toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForRest = setCollapseStateForRest;
    /**
     * Folds all regions for which the lines start with a given regex
     * @param foldingModel the folding model
     */
    function setCollapseStateForMatchingLines(foldingModel, regExp, doCollapse) {
        const editorModel = foldingModel.textModel;
        const regions = foldingModel.regions;
        const toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i)) {
                const startLineNumber = regions.getStartLineNumber(i);
                if (regExp.test(editorModel.getLineContent(startLineNumber))) {
                    toToggle.push(regions.toRegion(i));
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForMatchingLines = setCollapseStateForMatchingLines;
    /**
     * Folds all regions of the given type
     * @param foldingModel the folding model
     */
    function setCollapseStateForType(foldingModel, type, doCollapse) {
        const regions = foldingModel.regions;
        const toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i) && type === regions.getType(i)) {
                toToggle.push(regions.toRegion(i));
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForType = setCollapseStateForType;
    /**
     * Get line to go to for parent fold of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Parent fold start line
     */
    function getParentFoldLine(lineNumber, foldingModel) {
        let startLineNumber = null;
        const foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        if (foldingRegion !== null) {
            startLineNumber = foldingRegion.startLineNumber;
            // If current line is not the start of the current fold, go to top line of current fold. If not, go to parent fold
            if (lineNumber === startLineNumber) {
                const parentFoldingIdx = foldingRegion.parentIndex;
                if (parentFoldingIdx !== -1) {
                    startLineNumber = foldingModel.regions.getStartLineNumber(parentFoldingIdx);
                }
                else {
                    startLineNumber = null;
                }
            }
        }
        return startLineNumber;
    }
    exports.getParentFoldLine = getParentFoldLine;
    /**
     * Get line to go to for previous fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Previous fold start line
     */
    function getPreviousFoldLine(lineNumber, foldingModel) {
        let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        // If on the folding range start line, go to previous sibling.
        if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
            // If current line is not the start of the current fold, go to top line of current fold. If not, go to previous fold.
            if (lineNumber !== foldingRegion.startLineNumber) {
                return foldingRegion.startLineNumber;
            }
            else {
                // Find min line number to stay within parent.
                const expectedParentIndex = foldingRegion.parentIndex;
                let minLineNumber = 0;
                if (expectedParentIndex !== -1) {
                    minLineNumber = foldingModel.regions.getStartLineNumber(foldingRegion.parentIndex);
                }
                // Find fold at same level.
                while (foldingRegion !== null) {
                    if (foldingRegion.regionIndex > 0) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
                        // Keep at same level.
                        if (foldingRegion.startLineNumber <= minLineNumber) {
                            return null;
                        }
                        else if (foldingRegion.parentIndex === expectedParentIndex) {
                            return foldingRegion.startLineNumber;
                        }
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        else {
            // Go to last fold that's before the current line.
            if (foldingModel.regions.length > 0) {
                foldingRegion = foldingModel.regions.toRegion(foldingModel.regions.length - 1);
                while (foldingRegion !== null) {
                    // Found fold before current line.
                    if (foldingRegion.startLineNumber < lineNumber) {
                        return foldingRegion.startLineNumber;
                    }
                    if (foldingRegion.regionIndex > 0) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
                    }
                    else {
                        foldingRegion = null;
                    }
                }
            }
        }
        return null;
    }
    exports.getPreviousFoldLine = getPreviousFoldLine;
    /**
     * Get line to go to next fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Next fold start line
     */
    function getNextFoldLine(lineNumber, foldingModel) {
        let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
        // If on the folding range start line, go to next sibling.
        if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
            // Find max line number to stay within parent.
            const expectedParentIndex = foldingRegion.parentIndex;
            let maxLineNumber = 0;
            if (expectedParentIndex !== -1) {
                maxLineNumber = foldingModel.regions.getEndLineNumber(foldingRegion.parentIndex);
            }
            else if (foldingModel.regions.length === 0) {
                return null;
            }
            else {
                maxLineNumber = foldingModel.regions.getEndLineNumber(foldingModel.regions.length - 1);
            }
            // Find fold at same level.
            while (foldingRegion !== null) {
                if (foldingRegion.regionIndex < foldingModel.regions.length) {
                    foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
                    // Keep at same level.
                    if (foldingRegion.startLineNumber >= maxLineNumber) {
                        return null;
                    }
                    else if (foldingRegion.parentIndex === expectedParentIndex) {
                        return foldingRegion.startLineNumber;
                    }
                }
                else {
                    return null;
                }
            }
        }
        else {
            // Go to first fold that's after the current line.
            if (foldingModel.regions.length > 0) {
                foldingRegion = foldingModel.regions.toRegion(0);
                while (foldingRegion !== null) {
                    // Found fold after current line.
                    if (foldingRegion.startLineNumber > lineNumber) {
                        return foldingRegion.startLineNumber;
                    }
                    if (foldingRegion.regionIndex < foldingModel.regions.length) {
                        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
                    }
                    else {
                        foldingRegion = null;
                    }
                }
            }
        }
        return null;
    }
    exports.getNextFoldLine = getNextFoldLine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9sZGluZy9icm93c2VyL2ZvbGRpbmdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEwQmhHLE1BQWEsWUFBWTtRQVV4QixJQUFXLE9BQU8sS0FBcUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFXLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQVcsa0JBQWtCLEtBQUssT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRXBFLFlBQVksU0FBcUIsRUFBRSxrQkFBdUM7WUFQekQsd0JBQW1CLEdBQUcsSUFBSSxlQUFPLEVBQTJCLENBQUM7WUFDOUQsZ0JBQVcsR0FBbUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQU81RixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDhCQUFjLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxjQUErQjtZQUN6RCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtnQkFDM0IsT0FBTzthQUNQO1lBQ0QsY0FBYyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUs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