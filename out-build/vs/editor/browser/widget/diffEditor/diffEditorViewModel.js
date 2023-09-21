/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/diffProviderFactoryService", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/lineRange", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer", "vs/editor/common/diff/rangeMapping", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos"], function (require, exports, async_1, cancellation_1, lifecycle_1, observable_1, diffProviderFactoryService_1, utils_1, lineRange_1, defaultLinesDiffComputer_1, rangeMapping_1, beforeEditPositionMapper_1, combineTextEditInfos_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pZ = exports.$oZ = exports.$nZ = exports.$mZ = void 0;
    let $mZ = class $mZ extends lifecycle_1.$kc {
        setActiveMovedText(movedText) {
            this.h.set(movedText, undefined);
        }
        setHoveredMovedText(movedText) {
            this.j.set(movedText, undefined);
        }
        constructor(model, u, w, y) {
            super();
            this.model = model;
            this.u = u;
            this.w = w;
            this.y = y;
            this.a = (0, observable_1.observableValue)(this, false);
            this.isDiffUpToDate = this.a;
            this.f = (0, observable_1.observableValue)(this, undefined);
            this.diff = this.f;
            this.g = (0, observable_1.observableValue)(this, { regions: [], originalDecorationIds: [], modifiedDecorationIds: [] });
            this.unchangedRegions = (0, observable_1.derived)(this, r => {
                if (this.u.hideUnchangedRegions.read(r)) {
                    return this.g.read(r).regions;
                }
                else {
                    // Reset state
                    (0, observable_1.transaction)(tx => {
                        for (const r of this.g.get().regions) {
                            r.collapseAll(tx);
                        }
                    });
                    return [];
                }
            });
            this.movedTextToCompare = (0, observable_1.observableValue)(this, undefined);
            this.h = (0, observable_1.observableValue)(this, undefined);
            this.j = (0, observable_1.observableValue)(this, undefined);
            this.activeMovedText = (0, observable_1.derived)(this, r => this.movedTextToCompare.read(r) ?? this.j.read(r) ?? this.h.read(r));
            this.n = new cancellation_1.$pd();
            this.t = (0, observable_1.derived)(this, reader => {
                const diffProvider = this.y.createDiffProvider(this.w, {
                    diffAlgorithm: this.u.diffAlgorithm.read(reader)
                });
                const onChangeSignal = (0, observable_1.observableSignalFromEvent)('onDidChange', diffProvider.onDidChange);
                return {
                    diffProvider,
                    onChangeSignal,
                };
            });
            this.B((0, lifecycle_1.$ic)(() => this.n.cancel()));
            const contentChangedSignal = (0, observable_1.observableSignal)('contentChangedSignal');
            const debouncer = this.B(new async_1.$Sg(() => contentChangedSignal.trigger(undefined), 200));
            const updateUnchangedRegions = (result, tx, reader) => {
                const newUnchangedRegions = $pZ.fromDiffs(result.changes, model.original.getLineCount(), model.modified.getLineCount(), this.u.hideUnchangedRegionsMinimumLineCount.read(reader), this.u.hideUnchangedRegionsContextLineCount.read(reader));
                // Transfer state from cur state
                const lastUnchangedRegions = this.g.get();
                const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds
                    .map(id => model.original.getDecorationRange(id))
                    .filter(r => !!r)
                    .map(r => lineRange_1.$ts.fromRange(r));
                const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds
                    .map(id => model.modified.getDecorationRange(id))
                    .filter(r => !!r)
                    .map(r => lineRange_1.$ts.fromRange(r));
                const originalDecorationIds = model.original.deltaDecorations(lastUnchangedRegions.originalDecorationIds, newUnchangedRegions.map(r => ({ range: r.originalUnchangedRange.toInclusiveRange(), options: { description: 'unchanged' } })));
                const modifiedDecorationIds = model.modified.deltaDecorations(lastUnchangedRegions.modifiedDecorationIds, newUnchangedRegions.map(r => ({ range: r.modifiedUnchangedRange.toInclusiveRange(), options: { description: 'unchanged' } })));
                for (const r of newUnchangedRegions) {
                    for (let i = 0; i < lastUnchangedRegions.regions.length; i++) {
                        if (r.originalUnchangedRange.intersectsStrict(lastUnchangedRegionsOrigRanges[i])
                            && r.modifiedUnchangedRange.intersectsStrict(lastUnchangedRegionsModRanges[i])) {
                            r.setHiddenModifiedRange(lastUnchangedRegions.regions[i].getHiddenModifiedRange(undefined), tx);
                            break;
                        }
                    }
                }
                this.g.set({
                    regions: newUnchangedRegions,
                    originalDecorationIds,
                    modifiedDecorationIds
                }, tx);
            };
            this.B(model.modified.onDidChangeContent((e) => {
                const diff = this.f.get();
                if (diff) {
                    const textEdits = beforeEditPositionMapper_1.$IA.fromModelContentChanges(e.changes);
                    const result = applyModifiedEdits(this.b, textEdits, model.original, model.modified);
                    if (result) {
                        this.b = result;
                        (0, observable_1.transaction)(tx => {
                            this.f.set($nZ.fromDiffResult(this.b), tx);
                            updateUnchangedRegions(result, tx);
                            const currentSyncedMovedText = this.movedTextToCompare.get();
                            this.movedTextToCompare.set(currentSyncedMovedText ? this.b.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                        });
                    }
                }
                debouncer.schedule();
            }));
            this.B(model.original.onDidChangeContent((e) => {
                const diff = this.f.get();
                if (diff) {
                    const textEdits = beforeEditPositionMapper_1.$IA.fromModelContentChanges(e.changes);
                    const result = applyOriginalEdits(this.b, textEdits, model.original, model.modified);
                    if (result) {
                        this.b = result;
                        (0, observable_1.transaction)(tx => {
                            this.f.set($nZ.fromDiffResult(this.b), tx);
                            updateUnchangedRegions(result, tx);
                            const currentSyncedMovedText = this.movedTextToCompare.get();
                            this.movedTextToCompare.set(currentSyncedMovedText ? this.b.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                        });
                    }
                }
                debouncer.schedule();
            }));
            this.B((0, observable_1.autorunWithStore)(async (reader, store) => {
                /** @description compute diff */
                // So that they get recomputed when these settings change
                this.u.hideUnchangedRegionsMinimumLineCount.read(reader);
                this.u.hideUnchangedRegionsContextLineCount.read(reader);
                debouncer.cancel();
                contentChangedSignal.read(reader);
                const documentDiffProvider = this.t.read(reader);
                documentDiffProvider.onChangeSignal.read(reader);
                (0, utils_1.$gZ)(defaultLinesDiffComputer_1.$WY, reader);
                this.a.set(false, undefined);
                let originalTextEditInfos = [];
                store.add(model.original.onDidChangeContent((e) => {
                    const edits = beforeEditPositionMapper_1.$IA.fromModelContentChanges(e.changes);
                    originalTextEditInfos = (0, combineTextEditInfos_1.$OA)(originalTextEditInfos, edits);
                }));
                let modifiedTextEditInfos = [];
                store.add(model.modified.onDidChangeContent((e) => {
                    const edits = beforeEditPositionMapper_1.$IA.fromModelContentChanges(e.changes);
                    modifiedTextEditInfos = (0, combineTextEditInfos_1.$OA)(modifiedTextEditInfos, edits);
                }));
                let result = await documentDiffProvider.diffProvider.computeDiff(model.original, model.modified, {
                    ignoreTrimWhitespace: this.u.ignoreTrimWhitespace.read(reader),
                    maxComputationTimeMs: this.u.maxComputationTimeMs.read(reader),
                    computeMoves: this.u.showMoves.read(reader),
                }, this.n.token);
                if (this.n.token.isCancellationRequested) {
                    return;
                }
                result = applyOriginalEdits(result, originalTextEditInfos, model.original, model.modified) ?? result;
                result = applyModifiedEdits(result, modifiedTextEditInfos, model.original, model.modified) ?? result;
                (0, observable_1.transaction)(tx => {
                    updateUnchangedRegions(result, tx);
                    this.b = result;
                    const state = $nZ.fromDiffResult(result);
                    this.f.set(state, tx);
                    this.a.set(true, tx);
                    const currentSyncedMovedText = this.movedTextToCompare.get();
                    this.movedTextToCompare.set(currentSyncedMovedText ? this.b.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                });
            }));
        }
        ensureModifiedLineIsVisible(lineNumber, tx) {
            if (this.diff.get()?.mappings.length === 0) {
                return;
            }
            const unchangedRegions = this.g.get().regions;
            for (const r of unchangedRegions) {
                if (r.getHiddenModifiedRange(undefined).contains(lineNumber)) {
                    r.showModifiedLine(lineNumber, tx);
                    return;
                }
            }
        }
        ensureOriginalLineIsVisible(lineNumber, tx) {
            if (this.diff.get()?.mappings.length === 0) {
                return;
            }
            const unchangedRegions = this.g.get().regions;
            for (const r of unchangedRegions) {
                if (r.getHiddenOriginalRange(undefined).contains(lineNumber)) {
                    r.showOriginalLine(lineNumber, tx);
                    return;
                }
            }
        }
        async waitForDiff() {
            await (0, observable_1.waitForState)(this.isDiffUpToDate, s => s);
        }
        serializeState() {
            const regions = this.g.get();
            return {
                collapsedRegions: regions.regions.map(r => ({ range: r.getHiddenModifiedRange(undefined).serialize() }))
            };
        }
        restoreSerializedState(state) {
            const ranges = state.collapsedRegions.map(r => lineRange_1.$ts.deserialize(r.range));
            const regions = this.g.get();
            (0, observable_1.transaction)(tx => {
                for (const r of regions.regions) {
                    for (const range of ranges) {
                        if (r.modifiedUnchangedRange.intersect(range)) {
                            r.setHiddenModifiedRange(range, tx);
                            break;
                        }
                    }
                }
            });
        }
    };
    exports.$mZ = $mZ;
    exports.$mZ = $mZ = __decorate([
        __param(3, diffProviderFactoryService_1.$6Y)
    ], $mZ);
    class $nZ {
        static fromDiffResult(result) {
            return new $nZ(result.changes.map(c => new $oZ(c)), result.moves || [], result.identical, result.quitEarly);
        }
        constructor(mappings, movedTexts, identical, quitEarly) {
            this.mappings = mappings;
            this.movedTexts = movedTexts;
            this.identical = identical;
            this.quitEarly = quitEarly;
        }
    }
    exports.$nZ = $nZ;
    class $oZ {
        constructor(lineRangeMapping) {
            this.lineRangeMapping = lineRangeMapping;
            /*
            readonly movedTo: MovedText | undefined,
            readonly movedFrom: MovedText | undefined,
    
            if (movedTo) {
                assertFn(() =>
                    movedTo.lineRangeMapping.modifiedRange.equals(lineRangeMapping.modifiedRange)
                    && lineRangeMapping.originalRange.isEmpty
                    && !movedFrom
                );
            } else if (movedFrom) {
                assertFn(() =>
                    movedFrom.lineRangeMapping.originalRange.equals(lineRangeMapping.originalRange)
                    && lineRangeMapping.modifiedRange.isEmpty
                    && !movedTo
                );
            }
            */
        }
    }
    exports.$oZ = $oZ;
    class $pZ {
        static fromDiffs(changes, originalLineCount, modifiedLineCount, minHiddenLineCount, minContext) {
            const inversedMappings = rangeMapping_1.$ws.inverse(changes, originalLineCount, modifiedLineCount);
            const result = [];
            for (const mapping of inversedMappings) {
                let origStart = mapping.original.startLineNumber;
                let modStart = mapping.modified.startLineNumber;
                let length = mapping.original.length;
                const atStart = origStart === 1 && modStart === 1;
                const atEnd = origStart + length === originalLineCount + 1 && modStart + length === modifiedLineCount + 1;
                if ((atStart || atEnd) && length >= minContext + minHiddenLineCount) {
                    if (atStart && !atEnd) {
                        length -= minContext;
                    }
                    if (atEnd && !atStart) {
                        origStart += minContext;
                        modStart += minContext;
                        length -= minContext;
                    }
                    result.push(new $pZ(origStart, modStart, length, 0, 0));
                }
                else if (length >= minContext * 2 + minHiddenLineCount) {
                    origStart += minContext;
                    modStart += minContext;
                    length -= minContext * 2;
                    result.push(new $pZ(origStart, modStart, length, 0, 0));
                }
            }
            return result;
        }
        get originalUnchangedRange() {
            return lineRange_1.$ts.ofLength(this.originalLineNumber, this.lineCount);
        }
        get modifiedUnchangedRange() {
            return lineRange_1.$ts.ofLength(this.modifiedLineNumber, this.lineCount);
        }
        constructor(originalLineNumber, modifiedLineNumber, lineCount, visibleLineCountTop, visibleLineCountBottom) {
            this.originalLineNumber = originalLineNumber;
            this.modifiedLineNumber = modifiedLineNumber;
            this.lineCount = lineCount;
            this.a = (0, observable_1.observableValue)(this, 0);
            this.visibleLineCountTop = this.a;
            this.b = (0, observable_1.observableValue)(this, 0);
            this.visibleLineCountBottom = this.b;
            this.d = (0, observable_1.derived)(this, reader => /** @description isVisible */ this.visibleLineCountTop.read(reader) + this.visibleLineCountBottom.read(reader) === this.lineCount && !this.isDragged.read(reader));
            this.isDragged = (0, observable_1.observableValue)(this, false);
            this.a.set(visibleLineCountTop, undefined);
            this.b.set(visibleLineCountBottom, undefined);
        }
        shouldHideControls(reader) {
            return this.d.read(reader);
        }
        getHiddenOriginalRange(reader) {
            return lineRange_1.$ts.ofLength(this.originalLineNumber + this.a.read(reader), this.lineCount - this.a.read(reader) - this.b.read(reader));
        }
        getHiddenModifiedRange(reader) {
            return lineRange_1.$ts.ofLength(this.modifiedLineNumber + this.a.read(reader), this.lineCount - this.a.read(reader) - this.b.read(reader));
        }
        setHiddenModifiedRange(range, tx) {
            const visibleLineCountTop = range.startLineNumber - this.modifiedLineNumber;
            const visibleLineCountBottom = (this.modifiedLineNumber + this.lineCount) - range.endLineNumberExclusive;
            this.setState(visibleLineCountTop, visibleLineCountBottom, tx);
        }
        getMaxVisibleLineCountTop() {
            return this.lineCount - this.b.get();
        }
        getMaxVisibleLineCountBottom() {
            return this.lineCount - this.a.get();
        }
        showMoreAbove(count = 10, tx) {
            const maxVisibleLineCountTop = this.getMaxVisibleLineCountTop();
            this.a.set(Math.min(this.a.get() + count, maxVisibleLineCountTop), tx);
        }
        showMoreBelow(count = 10, tx) {
            const maxVisibleLineCountBottom = this.lineCount - this.a.get();
            this.b.set(Math.min(this.b.get() + count, maxVisibleLineCountBottom), tx);
        }
        showAll(tx) {
            this.b.set(this.lineCount - this.a.get(), tx);
        }
        showModifiedLine(lineNumber, tx) {
            const top = lineNumber + 1 - (this.modifiedLineNumber + this.a.get());
            const bottom = (this.modifiedLineNumber - this.b.get() + this.lineCount) - lineNumber;
            if (top < bottom) {
                this.a.set(this.a.get() + top, tx);
            }
            else {
                this.b.set(this.b.get() + bottom, tx);
            }
        }
        showOriginalLine(lineNumber, tx) {
            const top = lineNumber - this.originalLineNumber;
            const bottom = (this.originalLineNumber + this.lineCount) - lineNumber;
            if (top < bottom) {
                this.a.set(Math.min(this.a.get() + bottom - top, this.getMaxVisibleLineCountTop()), tx);
            }
            else {
                this.b.set(Math.min(this.b.get() + top - bottom, this.getMaxVisibleLineCountBottom()), tx);
            }
        }
        collapseAll(tx) {
            this.a.set(0, tx);
            this.b.set(0, tx);
        }
        setState(visibleLineCountTop, visibleLineCountBottom, tx) {
            visibleLineCountTop = Math.max(Math.min(visibleLineCountTop, this.lineCount), 0);
            visibleLineCountBottom = Math.max(Math.min(visibleLineCountBottom, this.lineCount - visibleLineCountTop), 0);
            this.a.set(visibleLineCountTop, tx);
            this.b.set(visibleLineCountBottom, tx);
        }
    }
    exports.$pZ = $pZ;
    function applyOriginalEdits(diff, textEdits, originalTextModel, modifiedTextModel) {
        return undefined;
        /*
        TODO@hediet
        if (textEdits.length === 0) {
            return diff;
        }
    
        const diff2 = flip(diff);
        const diff3 = applyModifiedEdits(diff2, textEdits, modifiedTextModel, originalTextModel);
        if (!diff3) {
            return undefined;
        }
        return flip(diff3);*/
    }
    /*
    function flip(diff: IDocumentDiff): IDocumentDiff {
        return {
            changes: diff.changes.map(c => c.flip()),
            moves: diff.moves.map(m => m.flip()),
            identical: diff.identical,
            quitEarly: diff.quitEarly,
        };
    }
    */
    function applyModifiedEdits(diff, textEdits, originalTextModel, modifiedTextModel) {
        return undefined;
        /*
        TODO@hediet
        if (textEdits.length === 0) {
            return diff;
        }
        if (diff.changes.some(c => !c.innerChanges) || diff.moves.length > 0) {
            // TODO support these cases
            return undefined;
        }
    
        const changes = applyModifiedEditsToLineRangeMappings(diff.changes, textEdits, originalTextModel, modifiedTextModel);
    
        const moves = diff.moves.map(m => {
            const newModifiedRange = applyEditToLineRange(m.lineRangeMapping.modified, textEdits);
            return newModifiedRange ? new MovedText(
                new SimpleLineRangeMapping(m.lineRangeMapping.original, newModifiedRange),
                applyModifiedEditsToLineRangeMappings(m.changes, textEdits, originalTextModel, modifiedTextModel),
            ) : undefined;
        }).filter(isDefined);
    
        return {
            identical: false,
            quitEarly: false,
            changes,
            moves,
        };*/
    }
});
/*
function applyEditToLineRange(range: LineRange, textEdits: TextEditInfo[]): LineRange | undefined {
    let rangeStartLineNumber = range.startLineNumber;
    let rangeEndLineNumberEx = range.endLineNumberExclusive;

    for (let i = textEdits.length - 1; i >= 0; i--) {
        const textEdit = textEdits[i];
        const textEditStartLineNumber = lengthGetLineCount(textEdit.startOffset) + 1;
        const textEditEndLineNumber = lengthGetLineCount(textEdit.endOffset) + 1;
        const newLengthLineCount = lengthGetLineCount(textEdit.newLength);
        const delta = newLengthLineCount - (textEditEndLineNumber - textEditStartLineNumber);

        if (textEditEndLineNumber < rangeStartLineNumber) {
            // the text edit is before us
            rangeStartLineNumber += delta;
            rangeEndLineNumberEx += delta;
        } else if (textEditStartLineNumber > rangeEndLineNumberEx) {
            // the text edit is after us
            // NOOP
        } else if (textEditStartLineNumber < rangeStartLineNumber && rangeEndLineNumberEx < textEditEndLineNumber) {
            // the range is fully contained in the text edit
            return undefined;
        } else if (textEditStartLineNumber < rangeStartLineNumber && textEditEndLineNumber <= rangeEndLineNumberEx) {
            // the text edit ends inside our range
            rangeStartLineNumber = textEditEndLineNumber + 1;
            rangeStartLineNumber += delta;
            rangeEndLineNumberEx += delta;
        } else if (rangeStartLineNumber <= textEditStartLineNumber && textEditEndLineNumber < rangeStartLineNumber) {
            // the text edit starts inside our range
            rangeEndLineNumberEx = textEditStartLineNumber;
        } else {
            rangeEndLineNumberEx += delta;
        }
    }

    return new LineRange(rangeStartLineNumber, rangeEndLineNumberEx);
}

function applyModifiedEditsToLineRangeMappings(changes: readonly LineRangeMapping[], textEdits: TextEditInfo[], originalTextModel: ITextModel, modifiedTextModel: ITextModel): LineRangeMapping[] {
    const diffTextEdits = changes.flatMap(c => c.innerChanges!.map(c => new TextEditInfo(
        positionToLength(c.originalRange.getStartPosition()),
        positionToLength(c.originalRange.getEndPosition()),
        lengthOfRange(c.modifiedRange).toLength(),
    )));

    const combined = combineTextEditInfos(diffTextEdits, textEdits);

    let lastOriginalEndOffset = lengthZero;
    let lastModifiedEndOffset = lengthZero;
    const rangeMappings = combined.map(c => {
        const modifiedStartOffset = lengthAdd(lastModifiedEndOffset, lengthDiffNonNegative(lastOriginalEndOffset, c.startOffset));
        lastOriginalEndOffset = c.endOffset;
        lastModifiedEndOffset = lengthAdd(modifiedStartOffset, c.newLength);

        return new RangeMapping(
            Range.fromPositions(lengthToPosition(c.startOffset), lengthToPosition(c.endOffset)),
            Range.fromPositions(lengthToPosition(modifiedStartOffset), lengthToPosition(lastModifiedEndOffset)),
        );
    });

    const newChanges = lineRangeMappingFromRangeMappings(
        rangeMappings,
        originalTextModel.getLinesContent(),
        modifiedTextModel.getLinesContent(),
    );
    return newChanges;
}
*/
//# sourceMappingURL=diffEditorViewModel.js.map