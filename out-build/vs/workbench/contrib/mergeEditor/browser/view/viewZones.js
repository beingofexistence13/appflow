/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/conflictActions", "vs/workbench/contrib/mergeEditor/browser/view/lineAlignment"], function (require, exports, dom_1, arrays_1, lineRange_1, utils_1, conflictActions_1, lineAlignment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XSb = exports.$WSb = exports.$VSb = void 0;
    class $VSb {
        constructor(e, f, g) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.b = new conflictActions_1.$SSb(this.e);
            this.c = new conflictActions_1.$SSb(this.f);
            this.d = new conflictActions_1.$SSb(this.g);
        }
        computeViewZones(reader, viewModel, options) {
            let input1LinesAdded = 0;
            let input2LinesAdded = 0;
            let baseLinesAdded = 0;
            let resultLinesAdded = 0;
            const input1ViewZones = [];
            const input2ViewZones = [];
            const baseViewZones = [];
            const resultViewZones = [];
            const model = viewModel.model;
            const resultDiffs = model.baseResultDiffs.read(reader);
            const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.join)(model.modifiedBaseRanges.read(reader), resultDiffs, (baseRange, diff) => baseRange.baseRange.touches(diff.inputRange)
                ? arrays_1.CompareResult.neitherLessOrGreaterThan
                : lineRange_1.$6ib.compareByStart(baseRange.baseRange, diff.inputRange));
            const shouldShowCodeLenses = options.codeLensesVisible;
            const showNonConflictingChanges = options.showNonConflictingChanges;
            let lastModifiedBaseRange = undefined;
            let lastBaseResultDiff = undefined;
            for (const m of baseRangeWithStoreAndTouchingDiffs) {
                if (shouldShowCodeLenses && m.left && (m.left.isConflicting || showNonConflictingChanges || !model.isHandled(m.left).read(reader))) {
                    const actions = new conflictActions_1.$TSb(viewModel, m.left);
                    if (options.shouldAlignResult || !actions.inputIsEmpty.read(reader)) {
                        input1ViewZones.push(new CommandViewZone(this.b, m.left.input1Range.startLineNumber - 1, actions.itemsInput1));
                        input2ViewZones.push(new CommandViewZone(this.c, m.left.input2Range.startLineNumber - 1, actions.itemsInput2));
                        if (options.shouldAlignBase) {
                            baseViewZones.push(new Placeholder(m.left.baseRange.startLineNumber - 1, 16));
                        }
                    }
                    const afterLineNumber = m.left.baseRange.startLineNumber + (lastBaseResultDiff?.resultingDeltaFromOriginalToModified ?? 0) - 1;
                    resultViewZones.push(new CommandViewZone(this.d, afterLineNumber, actions.resultItems));
                }
                const lastResultDiff = (0, arrays_1.$Nb)(m.rights);
                if (lastResultDiff) {
                    lastBaseResultDiff = lastResultDiff;
                }
                let alignedLines;
                if (m.left) {
                    alignedLines = (0, lineAlignment_1.$USb)(m.left).map(a => ({
                        input1Line: a[0],
                        baseLine: a[1],
                        input2Line: a[2],
                        resultLine: undefined,
                    }));
                    lastModifiedBaseRange = m.left;
                    // This is a total hack.
                    alignedLines[alignedLines.length - 1].resultLine =
                        m.left.baseRange.endLineNumberExclusive
                            + (lastBaseResultDiff ? lastBaseResultDiff.resultingDeltaFromOriginalToModified : 0);
                }
                else {
                    alignedLines = [{
                            baseLine: lastResultDiff.inputRange.endLineNumberExclusive,
                            input1Line: lastResultDiff.inputRange.endLineNumberExclusive + (lastModifiedBaseRange ? (lastModifiedBaseRange.input1Range.endLineNumberExclusive - lastModifiedBaseRange.baseRange.endLineNumberExclusive) : 0),
                            input2Line: lastResultDiff.inputRange.endLineNumberExclusive + (lastModifiedBaseRange ? (lastModifiedBaseRange.input2Range.endLineNumberExclusive - lastModifiedBaseRange.baseRange.endLineNumberExclusive) : 0),
                            resultLine: lastResultDiff.outputRange.endLineNumberExclusive,
                        }];
                }
                for (const { input1Line, baseLine, input2Line, resultLine } of alignedLines) {
                    if (!options.shouldAlignBase && (input1Line === undefined || input2Line === undefined)) {
                        continue;
                    }
                    const input1Line_ = input1Line !== undefined ? input1Line + input1LinesAdded : -1;
                    const input2Line_ = input2Line !== undefined ? input2Line + input2LinesAdded : -1;
                    const baseLine_ = baseLine + baseLinesAdded;
                    const resultLine_ = resultLine !== undefined ? resultLine + resultLinesAdded : -1;
                    const max = Math.max(options.shouldAlignBase ? baseLine_ : 0, input1Line_, input2Line_, options.shouldAlignResult ? resultLine_ : 0);
                    if (input1Line !== undefined) {
                        const diffInput1 = max - input1Line_;
                        if (diffInput1 > 0) {
                            input1ViewZones.push(new Spacer(input1Line - 1, diffInput1));
                            input1LinesAdded += diffInput1;
                        }
                    }
                    if (input2Line !== undefined) {
                        const diffInput2 = max - input2Line_;
                        if (diffInput2 > 0) {
                            input2ViewZones.push(new Spacer(input2Line - 1, diffInput2));
                            input2LinesAdded += diffInput2;
                        }
                    }
                    if (options.shouldAlignBase) {
                        const diffBase = max - baseLine_;
                        if (diffBase > 0) {
                            baseViewZones.push(new Spacer(baseLine - 1, diffBase));
                            baseLinesAdded += diffBase;
                        }
                    }
                    if (options.shouldAlignResult && resultLine !== undefined) {
                        const diffResult = max - resultLine_;
                        if (diffResult > 0) {
                            resultViewZones.push(new Spacer(resultLine - 1, diffResult));
                            resultLinesAdded += diffResult;
                        }
                    }
                }
            }
            return new $WSb(input1ViewZones, input2ViewZones, baseViewZones, resultViewZones);
        }
    }
    exports.$VSb = $VSb;
    class $WSb {
        constructor(input1ViewZones, input2ViewZones, baseViewZones, resultViewZones) {
            this.input1ViewZones = input1ViewZones;
            this.input2ViewZones = input2ViewZones;
            this.baseViewZones = baseViewZones;
            this.resultViewZones = resultViewZones;
        }
    }
    exports.$WSb = $WSb;
    /**
     * This is an abstract class to create various editor view zones.
    */
    class $XSb {
    }
    exports.$XSb = $XSb;
    class Spacer extends $XSb {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
        }
        create(viewZoneChangeAccessor, viewZoneIdsToCleanUp, disposableStore) {
            viewZoneIdsToCleanUp.push(viewZoneChangeAccessor.addZone({
                afterLineNumber: this.b,
                heightInLines: this.c,
                domNode: (0, dom_1.$)('div.diagonal-fill'),
            }));
        }
    }
    class Placeholder extends $XSb {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
        }
        create(viewZoneChangeAccessor, viewZoneIdsToCleanUp, disposableStore) {
            viewZoneIdsToCleanUp.push(viewZoneChangeAccessor.addZone({
                afterLineNumber: this.b,
                heightInPx: this.c,
                domNode: (0, dom_1.$)('div.conflict-actions-placeholder'),
            }));
        }
    }
    class CommandViewZone extends $XSb {
        constructor(b, c, d) {
            super();
            this.b = b;
            this.c = c;
            this.d = d;
        }
        create(viewZoneChangeAccessor, viewZoneIdsToCleanUp, disposableStore) {
            disposableStore.add(this.b.createWidget(viewZoneChangeAccessor, this.c, this.d, viewZoneIdsToCleanUp));
        }
    }
});
//# sourceMappingURL=viewZones.js.map