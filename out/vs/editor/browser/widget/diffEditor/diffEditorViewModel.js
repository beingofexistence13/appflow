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
    exports.UnchangedRegion = exports.DiffMapping = exports.DiffState = exports.DiffEditorViewModel = void 0;
    let DiffEditorViewModel = class DiffEditorViewModel extends lifecycle_1.Disposable {
        setActiveMovedText(movedText) {
            this._activeMovedText.set(movedText, undefined);
        }
        setHoveredMovedText(movedText) {
            this._hoveredMovedText.set(movedText, undefined);
        }
        constructor(model, _options, _editor, _diffProviderFactoryService) {
            super();
            this.model = model;
            this._options = _options;
            this._editor = _editor;
            this._diffProviderFactoryService = _diffProviderFactoryService;
            this._isDiffUpToDate = (0, observable_1.observableValue)(this, false);
            this.isDiffUpToDate = this._isDiffUpToDate;
            this._diff = (0, observable_1.observableValue)(this, undefined);
            this.diff = this._diff;
            this._unchangedRegions = (0, observable_1.observableValue)(this, { regions: [], originalDecorationIds: [], modifiedDecorationIds: [] });
            this.unchangedRegions = (0, observable_1.derived)(this, r => {
                if (this._options.hideUnchangedRegions.read(r)) {
                    return this._unchangedRegions.read(r).regions;
                }
                else {
                    // Reset state
                    (0, observable_1.transaction)(tx => {
                        for (const r of this._unchangedRegions.get().regions) {
                            r.collapseAll(tx);
                        }
                    });
                    return [];
                }
            });
            this.movedTextToCompare = (0, observable_1.observableValue)(this, undefined);
            this._activeMovedText = (0, observable_1.observableValue)(this, undefined);
            this._hoveredMovedText = (0, observable_1.observableValue)(this, undefined);
            this.activeMovedText = (0, observable_1.derived)(this, r => this.movedTextToCompare.read(r) ?? this._hoveredMovedText.read(r) ?? this._activeMovedText.read(r));
            this._cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            this._diffProvider = (0, observable_1.derived)(this, reader => {
                const diffProvider = this._diffProviderFactoryService.createDiffProvider(this._editor, {
                    diffAlgorithm: this._options.diffAlgorithm.read(reader)
                });
                const onChangeSignal = (0, observable_1.observableSignalFromEvent)('onDidChange', diffProvider.onDidChange);
                return {
                    diffProvider,
                    onChangeSignal,
                };
            });
            this._register((0, lifecycle_1.toDisposable)(() => this._cancellationTokenSource.cancel()));
            const contentChangedSignal = (0, observable_1.observableSignal)('contentChangedSignal');
            const debouncer = this._register(new async_1.RunOnceScheduler(() => contentChangedSignal.trigger(undefined), 200));
            const updateUnchangedRegions = (result, tx, reader) => {
                const newUnchangedRegions = UnchangedRegion.fromDiffs(result.changes, model.original.getLineCount(), model.modified.getLineCount(), this._options.hideUnchangedRegionsMinimumLineCount.read(reader), this._options.hideUnchangedRegionsContextLineCount.read(reader));
                // Transfer state from cur state
                const lastUnchangedRegions = this._unchangedRegions.get();
                const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds
                    .map(id => model.original.getDecorationRange(id))
                    .filter(r => !!r)
                    .map(r => lineRange_1.LineRange.fromRange(r));
                const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds
                    .map(id => model.modified.getDecorationRange(id))
                    .filter(r => !!r)
                    .map(r => lineRange_1.LineRange.fromRange(r));
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
                this._unchangedRegions.set({
                    regions: newUnchangedRegions,
                    originalDecorationIds,
                    modifiedDecorationIds
                }, tx);
            };
            this._register(model.modified.onDidChangeContent((e) => {
                const diff = this._diff.get();
                if (diff) {
                    const textEdits = beforeEditPositionMapper_1.TextEditInfo.fromModelContentChanges(e.changes);
                    const result = applyModifiedEdits(this._lastDiff, textEdits, model.original, model.modified);
                    if (result) {
                        this._lastDiff = result;
                        (0, observable_1.transaction)(tx => {
                            this._diff.set(DiffState.fromDiffResult(this._lastDiff), tx);
                            updateUnchangedRegions(result, tx);
                            const currentSyncedMovedText = this.movedTextToCompare.get();
                            this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                        });
                    }
                }
                debouncer.schedule();
            }));
            this._register(model.original.onDidChangeContent((e) => {
                const diff = this._diff.get();
                if (diff) {
                    const textEdits = beforeEditPositionMapper_1.TextEditInfo.fromModelContentChanges(e.changes);
                    const result = applyOriginalEdits(this._lastDiff, textEdits, model.original, model.modified);
                    if (result) {
                        this._lastDiff = result;
                        (0, observable_1.transaction)(tx => {
                            this._diff.set(DiffState.fromDiffResult(this._lastDiff), tx);
                            updateUnchangedRegions(result, tx);
                            const currentSyncedMovedText = this.movedTextToCompare.get();
                            this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                        });
                    }
                }
                debouncer.schedule();
            }));
            this._register((0, observable_1.autorunWithStore)(async (reader, store) => {
                /** @description compute diff */
                // So that they get recomputed when these settings change
                this._options.hideUnchangedRegionsMinimumLineCount.read(reader);
                this._options.hideUnchangedRegionsContextLineCount.read(reader);
                debouncer.cancel();
                contentChangedSignal.read(reader);
                const documentDiffProvider = this._diffProvider.read(reader);
                documentDiffProvider.onChangeSignal.read(reader);
                (0, utils_1.readHotReloadableExport)(defaultLinesDiffComputer_1.DefaultLinesDiffComputer, reader);
                this._isDiffUpToDate.set(false, undefined);
                let originalTextEditInfos = [];
                store.add(model.original.onDidChangeContent((e) => {
                    const edits = beforeEditPositionMapper_1.TextEditInfo.fromModelContentChanges(e.changes);
                    originalTextEditInfos = (0, combineTextEditInfos_1.combineTextEditInfos)(originalTextEditInfos, edits);
                }));
                let modifiedTextEditInfos = [];
                store.add(model.modified.onDidChangeContent((e) => {
                    const edits = beforeEditPositionMapper_1.TextEditInfo.fromModelContentChanges(e.changes);
                    modifiedTextEditInfos = (0, combineTextEditInfos_1.combineTextEditInfos)(modifiedTextEditInfos, edits);
                }));
                let result = await documentDiffProvider.diffProvider.computeDiff(model.original, model.modified, {
                    ignoreTrimWhitespace: this._options.ignoreTrimWhitespace.read(reader),
                    maxComputationTimeMs: this._options.maxComputationTimeMs.read(reader),
                    computeMoves: this._options.showMoves.read(reader),
                }, this._cancellationTokenSource.token);
                if (this._cancellationTokenSource.token.isCancellationRequested) {
                    return;
                }
                result = applyOriginalEdits(result, originalTextEditInfos, model.original, model.modified) ?? result;
                result = applyModifiedEdits(result, modifiedTextEditInfos, model.original, model.modified) ?? result;
                (0, observable_1.transaction)(tx => {
                    updateUnchangedRegions(result, tx);
                    this._lastDiff = result;
                    const state = DiffState.fromDiffResult(result);
                    this._diff.set(state, tx);
                    this._isDiffUpToDate.set(true, tx);
                    const currentSyncedMovedText = this.movedTextToCompare.get();
                    this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find(m => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : undefined, tx);
                });
            }));
        }
        ensureModifiedLineIsVisible(lineNumber, tx) {
            if (this.diff.get()?.mappings.length === 0) {
                return;
            }
            const unchangedRegions = this._unchangedRegions.get().regions;
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
            const unchangedRegions = this._unchangedRegions.get().regions;
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
            const regions = this._unchangedRegions.get();
            return {
                collapsedRegions: regions.regions.map(r => ({ range: r.getHiddenModifiedRange(undefined).serialize() }))
            };
        }
        restoreSerializedState(state) {
            const ranges = state.collapsedRegions.map(r => lineRange_1.LineRange.deserialize(r.range));
            const regions = this._unchangedRegions.get();
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
    exports.DiffEditorViewModel = DiffEditorViewModel;
    exports.DiffEditorViewModel = DiffEditorViewModel = __decorate([
        __param(3, diffProviderFactoryService_1.IDiffProviderFactoryService)
    ], DiffEditorViewModel);
    class DiffState {
        static fromDiffResult(result) {
            return new DiffState(result.changes.map(c => new DiffMapping(c)), result.moves || [], result.identical, result.quitEarly);
        }
        constructor(mappings, movedTexts, identical, quitEarly) {
            this.mappings = mappings;
            this.movedTexts = movedTexts;
            this.identical = identical;
            this.quitEarly = quitEarly;
        }
    }
    exports.DiffState = DiffState;
    class DiffMapping {
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
    exports.DiffMapping = DiffMapping;
    class UnchangedRegion {
        static fromDiffs(changes, originalLineCount, modifiedLineCount, minHiddenLineCount, minContext) {
            const inversedMappings = rangeMapping_1.DetailedLineRangeMapping.inverse(changes, originalLineCount, modifiedLineCount);
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
                    result.push(new UnchangedRegion(origStart, modStart, length, 0, 0));
                }
                else if (length >= minContext * 2 + minHiddenLineCount) {
                    origStart += minContext;
                    modStart += minContext;
                    length -= minContext * 2;
                    result.push(new UnchangedRegion(origStart, modStart, length, 0, 0));
                }
            }
            return result;
        }
        get originalUnchangedRange() {
            return lineRange_1.LineRange.ofLength(this.originalLineNumber, this.lineCount);
        }
        get modifiedUnchangedRange() {
            return lineRange_1.LineRange.ofLength(this.modifiedLineNumber, this.lineCount);
        }
        constructor(originalLineNumber, modifiedLineNumber, lineCount, visibleLineCountTop, visibleLineCountBottom) {
            this.originalLineNumber = originalLineNumber;
            this.modifiedLineNumber = modifiedLineNumber;
            this.lineCount = lineCount;
            this._visibleLineCountTop = (0, observable_1.observableValue)(this, 0);
            this.visibleLineCountTop = this._visibleLineCountTop;
            this._visibleLineCountBottom = (0, observable_1.observableValue)(this, 0);
            this.visibleLineCountBottom = this._visibleLineCountBottom;
            this._shouldHideControls = (0, observable_1.derived)(this, reader => /** @description isVisible */ this.visibleLineCountTop.read(reader) + this.visibleLineCountBottom.read(reader) === this.lineCount && !this.isDragged.read(reader));
            this.isDragged = (0, observable_1.observableValue)(this, false);
            this._visibleLineCountTop.set(visibleLineCountTop, undefined);
            this._visibleLineCountBottom.set(visibleLineCountBottom, undefined);
        }
        shouldHideControls(reader) {
            return this._shouldHideControls.read(reader);
        }
        getHiddenOriginalRange(reader) {
            return lineRange_1.LineRange.ofLength(this.originalLineNumber + this._visibleLineCountTop.read(reader), this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader));
        }
        getHiddenModifiedRange(reader) {
            return lineRange_1.LineRange.ofLength(this.modifiedLineNumber + this._visibleLineCountTop.read(reader), this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader));
        }
        setHiddenModifiedRange(range, tx) {
            const visibleLineCountTop = range.startLineNumber - this.modifiedLineNumber;
            const visibleLineCountBottom = (this.modifiedLineNumber + this.lineCount) - range.endLineNumberExclusive;
            this.setState(visibleLineCountTop, visibleLineCountBottom, tx);
        }
        getMaxVisibleLineCountTop() {
            return this.lineCount - this._visibleLineCountBottom.get();
        }
        getMaxVisibleLineCountBottom() {
            return this.lineCount - this._visibleLineCountTop.get();
        }
        showMoreAbove(count = 10, tx) {
            const maxVisibleLineCountTop = this.getMaxVisibleLineCountTop();
            this._visibleLineCountTop.set(Math.min(this._visibleLineCountTop.get() + count, maxVisibleLineCountTop), tx);
        }
        showMoreBelow(count = 10, tx) {
            const maxVisibleLineCountBottom = this.lineCount - this._visibleLineCountTop.get();
            this._visibleLineCountBottom.set(Math.min(this._visibleLineCountBottom.get() + count, maxVisibleLineCountBottom), tx);
        }
        showAll(tx) {
            this._visibleLineCountBottom.set(this.lineCount - this._visibleLineCountTop.get(), tx);
        }
        showModifiedLine(lineNumber, tx) {
            const top = lineNumber + 1 - (this.modifiedLineNumber + this._visibleLineCountTop.get());
            const bottom = (this.modifiedLineNumber - this._visibleLineCountBottom.get() + this.lineCount) - lineNumber;
            if (top < bottom) {
                this._visibleLineCountTop.set(this._visibleLineCountTop.get() + top, tx);
            }
            else {
                this._visibleLineCountBottom.set(this._visibleLineCountBottom.get() + bottom, tx);
            }
        }
        showOriginalLine(lineNumber, tx) {
            const top = lineNumber - this.originalLineNumber;
            const bottom = (this.originalLineNumber + this.lineCount) - lineNumber;
            if (top < bottom) {
                this._visibleLineCountTop.set(Math.min(this._visibleLineCountTop.get() + bottom - top, this.getMaxVisibleLineCountTop()), tx);
            }
            else {
                this._visibleLineCountBottom.set(Math.min(this._visibleLineCountBottom.get() + top - bottom, this.getMaxVisibleLineCountBottom()), tx);
            }
        }
        collapseAll(tx) {
            this._visibleLineCountTop.set(0, tx);
            this._visibleLineCountBottom.set(0, tx);
        }
        setState(visibleLineCountTop, visibleLineCountBottom, tx) {
            visibleLineCountTop = Math.max(Math.min(visibleLineCountTop, this.lineCount), 0);
            visibleLineCountBottom = Math.max(Math.min(visibleLineCountBottom, this.lineCount - visibleLineCountTop), 0);
            this._visibleLineCountTop.set(visibleLineCountTop, tx);
            this._visibleLineCountBottom.set(visibleLineCountBottom, tx);
        }
    }
    exports.UnchangedRegion = UnchangedRegion;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvclZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2RpZmZFZGl0b3JWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBbUMzQyxrQkFBa0IsQ0FBQyxTQUFnQztZQUN6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRU0sbUJBQW1CLENBQUMsU0FBZ0M7WUFDMUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQWVELFlBQ2lCLEtBQXVCLEVBQ3RCLFFBQTJCLEVBQzNCLE9BQW9CLEVBQ1IsMkJBQXlFO1lBRXRHLEtBQUssRUFBRSxDQUFDO1lBTFEsVUFBSyxHQUFMLEtBQUssQ0FBa0I7WUFDdEIsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDM0IsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNTLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7WUEzRHRGLG9CQUFlLEdBQUcsSUFBQSw0QkFBZSxFQUFVLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RCxtQkFBYyxHQUF5QixJQUFJLENBQUMsZUFBZSxDQUFDO1lBRzNELFVBQUssR0FBRyxJQUFBLDRCQUFlLEVBQXdCLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNqRSxTQUFJLEdBQXVDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFckQsc0JBQWlCLEdBQUcsSUFBQSw0QkFBZSxFQUNuRCxJQUFJLEVBQ0osRUFBRSxPQUFPLEVBQUUsRUFBRSxF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