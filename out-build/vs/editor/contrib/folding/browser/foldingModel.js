/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "./foldingRanges", "vs/base/common/hash"], function (require, exports, event_1, foldingRanges_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n8 = exports.$m8 = exports.$l8 = exports.$k8 = exports.$j8 = exports.$i8 = exports.$h8 = exports.$g8 = exports.$f8 = exports.$e8 = exports.$d8 = exports.$c8 = void 0;
    class $c8 {
        get regions() { return this.c; }
        get textModel() { return this.a; }
        get decorationProvider() { return this.b; }
        constructor(textModel, decorationProvider) {
            this.e = new event_1.$fd();
            this.onDidChange = this.e.event;
            this.a = textModel;
            this.b = decorationProvider;
            this.c = new foldingRanges_1.$a8(new Uint32Array(0), new Uint32Array(0));
            this.d = [];
        }
        toggleCollapseState(toggledRegions) {
            if (!toggledRegions.length) {
                return;
            }
            toggledRegions = toggledRegions.sort((r1, r2) => r1.regionIndex - r2.regionIndex);
            const processed = {};
            this.b.changeDecorations(accessor => {
                let k = 0; // index from [0 ... this.regions.length]
                let dirtyRegionEndLine = -1; // end of the range where decorations need to be updated
                let lastHiddenLine = -1; // the end of the last hidden lines
                const updateDecorationsUntil = (index) => {
                    while (k < index) {
                        const endLineNumber = this.c.getEndLineNumber(k);
                        const isCollapsed = this.c.isCollapsed(k);
                        if (endLineNumber <= dirtyRegionEndLine) {
                            const isManual = this.regions.getSource(k) !== 0 /* FoldSource.provider */;
                            accessor.changeDecorationOptions(this.d[k], this.b.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual));
                        }
                        if (isCollapsed && endLineNumber > lastHiddenLine) {
                            lastHiddenLine = endLineNumber;
                        }
                        k++;
                    }
                };
                for (const region of toggledRegions) {
                    const index = region.regionIndex;
                    const editorDecorationId = this.d[index];
                    if (editorDecorationId && !processed[editorDecorationId]) {
                        processed[editorDecorationId] = true;
                        updateDecorationsUntil(index); // update all decorations up to current index using the old dirtyRegionEndLine
                        const newCollapseState = !this.c.isCollapsed(index);
                        this.c.setCollapsed(index, newCollapseState);
                        dirtyRegionEndLine = Math.max(dirtyRegionEndLine, this.c.getEndLineNumber(index));
                    }
                }
                updateDecorationsUntil(this.c.length);
            });
            this.e.fire({ model: this, collapseStateChanged: toggledRegions });
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
            for (let i = 0; i < this.c.length; i++) {
                const foldRange = this.c.toFoldRange(i);
                if (foldRange.source === 0 /* FoldSource.provider */ || !intersects(foldRange)) {
                    newFoldingRanges.push(foldRange);
                }
            }
            this.updatePost(foldingRanges_1.$a8.fromFoldRanges(newFoldingRanges));
        }
        update(newRegions, blockedLineNumers = []) {
            const foldedOrManualRanges = this.f(blockedLineNumers);
            const newRanges = foldingRanges_1.$a8.sanitizeAndMerge(newRegions, foldedOrManualRanges, this.a.getLineCount());
            this.updatePost(foldingRanges_1.$a8.fromFoldRanges(newRanges));
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
                    startColumn: this.a.getLineMaxColumn(startLineNumber),
                    endLineNumber: endLineNumber,
                    endColumn: this.a.getLineMaxColumn(endLineNumber) + 1
                };
                newEditorDecorations.push({ range: decorationRange, options: this.b.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual) });
                if (isCollapsed && endLineNumber > lastHiddenLine) {
                    lastHiddenLine = endLineNumber;
                }
            }
            this.b.changeDecorations(accessor => this.d = accessor.deltaDecorations(this.d, newEditorDecorations));
            this.c = newRegions;
            this.e.fire({ model: this });
        }
        f(blockedLineNumers = []) {
            const isBlocked = (startLineNumber, endLineNumber) => {
                for (const blockedLineNumber of blockedLineNumers) {
                    if (startLineNumber < blockedLineNumber && blockedLineNumber <= endLineNumber) { // first line is visible
                        return true;
                    }
                }
                return false;
            };
            const foldedRanges = [];
            for (let i = 0, limit = this.c.length; i < limit; i++) {
                let isCollapsed = this.regions.isCollapsed(i);
                const source = this.regions.getSource(i);
                if (isCollapsed || source !== 0 /* FoldSource.provider */) {
                    const foldRange = this.c.toFoldRange(i);
                    const decRange = this.a.getDecorationRange(this.d[i]);
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
            const foldedOrManualRanges = this.f();
            const result = [];
            const maxLineNumber = this.a.getLineCount();
            for (let i = 0, limit = foldedOrManualRanges.length; i < limit; i++) {
                const range = foldedOrManualRanges[i];
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this.g(range.startLineNumber + 1, range.endLineNumber);
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
            const maxLineNumber = this.a.getLineCount();
            for (const range of state) {
                if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
                    continue;
                }
                const checksum = this.g(range.startLineNumber + 1, range.endLineNumber);
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
            const newRanges = foldingRanges_1.$a8.sanitizeAndMerge(this.c, rangesToRestore, maxLineNumber);
            this.updatePost(foldingRanges_1.$a8.fromFoldRanges(newRanges));
        }
        g(lineNumber1, lineNumber2) {
            const h = (0, hash_1.$pi)(this.a.getLineContent(lineNumber1)
                + this.a.getLineContent(lineNumber2));
            return h % 1000000; // 6 digits is plenty
        }
        dispose() {
            this.b.removeDecorations(this.d);
        }
        getAllRegionsAtLine(lineNumber, filter) {
            const result = [];
            if (this.c) {
                let index = this.c.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    const current = this.c.toRegion(index);
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
            if (this.c) {
                const index = this.c.findRange(lineNumber);
                if (index >= 0) {
                    return this.c.toRegion(index);
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
                for (let i = index, len = this.c.length; i < len; i++) {
                    const current = this.c.toRegion(i);
                    if (this.c.getStartLineNumber(i) < endLineNumber) {
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
                for (let i = index, len = this.c.length; i < len; i++) {
                    const current = this.c.toRegion(i);
                    if (this.c.getStartLineNumber(i) < endLineNumber) {
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
    exports.$c8 = $c8;
    /**
     * Collapse or expand the regions at the given locations
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function $d8(foldingModel, levels, lineNumbers) {
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
    exports.$d8 = $d8;
    /**
     * Collapse or expand the regions at the given locations including all children.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function $e8(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
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
    exports.$e8 = $e8;
    /**
     * Collapse or expand the regions at the given locations including all parents.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function $f8(foldingModel, doCollapse, levels, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region, level) => region.isCollapsed !== doCollapse && level <= levels);
            toToggle.push(...regions);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.$f8 = $f8;
    /**
     * Collapse or expand a region at the given locations. If the inner most region is already collapsed/expanded, uses the first parent instead.
     * @param doCollapse Whether to collapse or expand
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function $g8(foldingModel, doCollapse, lineNumbers) {
        const toToggle = [];
        for (const lineNumber of lineNumbers) {
            const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region) => region.isCollapsed !== doCollapse);
            if (regions.length > 0) {
                toToggle.push(regions[0]);
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.$g8 = $g8;
    /**
     * Folds or unfolds all regions that have a given level, except if they contain one of the blocked lines.
     * @param foldLevel level. Level == 1 is the top level
     * @param doCollapse Whether to collapse or expand
    */
    function $h8(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
        const filter = (region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some(line => region.containsLine(line));
        const toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.$h8 = $h8;
    /**
     * Folds or unfolds all regions, except if they contain or are contained by a region of one of the blocked lines.
     * @param doCollapse Whether to collapse or expand
     * @param blockedLineNumbers the location of regions to not collapse or expand
     */
    function $i8(foldingModel, doCollapse, blockedLineNumbers) {
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
    exports.$i8 = $i8;
    /**
     * Folds all regions for which the lines start with a given regex
     * @param foldingModel the folding model
     */
    function $j8(foldingModel, regExp, doCollapse) {
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
    exports.$j8 = $j8;
    /**
     * Folds all regions of the given type
     * @param foldingModel the folding model
     */
    function $k8(foldingModel, type, doCollapse) {
        const regions = foldingModel.regions;
        const toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i) && type === regions.getType(i)) {
                toToggle.push(regions.toRegion(i));
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.$k8 = $k8;
    /**
     * Get line to go to for parent fold of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Parent fold start line
     */
    function $l8(lineNumber, foldingModel) {
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
    exports.$l8 = $l8;
    /**
     * Get line to go to for previous fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Previous fold start line
     */
    function $m8(lineNumber, foldingModel) {
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
    exports.$m8 = $m8;
    /**
     * Get line to go to next fold at the same level of current line
     * @param lineNumber the current line number
     * @param foldingModel the folding model
     *
     * @return Next fold start line
     */
    function $n8(lineNumber, foldingModel) {
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
    exports.$n8 = $n8;
});
//# sourceMappingURL=foldingModel.js.map