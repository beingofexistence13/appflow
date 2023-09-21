/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/editing", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/base/common/observable"], function (require, exports, arrays_1, errors_1, lifecycle_1, mapping_1, editing_1, lineRange_1, utils_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelDiffState = exports.TextModelDiffChangeReason = exports.TextModelDiffs = void 0;
    class TextModelDiffs extends lifecycle_1.Disposable {
        get isApplyingChange() {
            return this.barrier.isActive;
        }
        constructor(baseTextModel, textModel, diffComputer) {
            super();
            this.baseTextModel = baseTextModel;
            this.textModel = textModel;
            this.diffComputer = diffComputer;
            this.recomputeCount = 0;
            this._state = (0, observable_1.observableValue)(this, 1 /* TextModelDiffState.initializing */);
            this._diffs = (0, observable_1.observableValue)(this, []);
            this.barrier = new utils_1.ReentrancyBarrier();
            this.isDisposed = false;
            this.isInitializing = true;
            const recomputeSignal = (0, observable_1.observableSignal)('recompute');
            this._register((0, observable_1.autorun)(reader => {
                /** @description Update diff state */
                recomputeSignal.read(reader);
                this.recompute(reader);
            }));
            this._register(baseTextModel.onDidChangeContent(this.barrier.makeExclusive(() => {
                recomputeSignal.trigger(undefined);
            })));
            this._register(textModel.onDidChangeContent(this.barrier.makeExclusive(() => {
                recomputeSignal.trigger(undefined);
            })));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.isDisposed = true;
            }));
        }
        get state() {
            return this._state;
        }
        /**
         * Diffs from base to input.
        */
        get diffs() {
            return this._diffs;
        }
        recompute(reader) {
            this.recomputeCount++;
            const currentRecomputeIdx = this.recomputeCount;
            if (this._state.get() === 1 /* TextModelDiffState.initializing */) {
                this.isInitializing = true;
            }
            (0, observable_1.transaction)(tx => {
                /** @description Starting Diff Computation. */
                this._state.set(this.isInitializing ? 1 /* TextModelDiffState.initializing */ : 3 /* TextModelDiffState.updating */, tx, 0 /* TextModelDiffChangeReason.other */);
            });
            const result = this.diffComputer.computeDiff(this.baseTextModel, this.textModel, reader);
            result.then((result) => {
                if (this.isDisposed) {
                    return;
                }
                if (currentRecomputeIdx !== this.recomputeCount) {
                    // There is a newer recompute call
                    return;
                }
                (0, observable_1.transaction)(tx => {
                    /** @description Completed Diff Computation */
                    if (result.diffs) {
                        this._state.set(2 /* TextModelDiffState.upToDate */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                        this._diffs.set(result.diffs, tx, 1 /* TextModelDiffChangeReason.textChange */);
                    }
                    else {
                        this._state.set(4 /* TextModelDiffState.error */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                    }
                    this.isInitializing = false;
                });
            });
        }
        ensureUpToDate() {
            if (this.state.get() !== 2 /* TextModelDiffState.upToDate */) {
                throw new errors_1.BugIndicatingError('Cannot remove diffs when the model is not up to date');
            }
        }
        removeDiffs(diffToRemoves, transaction, group) {
            this.ensureUpToDate();
            diffToRemoves.sort((0, arrays_1.compareBy)((d) => d.inputRange.startLineNumber, arrays_1.numberComparator));
            diffToRemoves.reverse();
            let diffs = this._diffs.get();
            for (const diffToRemove of diffToRemoves) {
                // TODO improve performance
                const len = diffs.length;
                diffs = diffs.filter((d) => d !== diffToRemove);
                if (len === diffs.length) {
                    throw new errors_1.BugIndicatingError();
                }
                this.barrier.runExclusivelyOrThrow(() => {
                    const edits = diffToRemove.getReverseLineEdit().toEdits(this.textModel.getLineCount());
                    this.textModel.pushEditOperations(null, edits, () => null, group);
                });
                diffs = diffs.map((d) => d.outputRange.isAfter(diffToRemove.outputRange)
                    ? d.addOutputLineDelta(diffToRemove.inputRange.lineCount - diffToRemove.outputRange.lineCount)
                    : d);
            }
            this._diffs.set(diffs, transaction, 0 /* TextModelDiffChangeReason.other */);
        }
        /**
         * Edit must be conflict free.
         */
        applyEditRelativeToOriginal(edit, transaction, group) {
            this.ensureUpToDate();
            const editMapping = new mapping_1.DetailedLineRangeMapping(edit.range, this.baseTextModel, new lineRange_1.LineRange(edit.range.startLineNumber, edit.newLines.length), this.textModel);
            let firstAfter = false;
            let delta = 0;
            const newDiffs = new Array();
            for (const diff of this.diffs.get()) {
                if (diff.inputRange.touches(edit.range)) {
                    throw new errors_1.BugIndicatingError('Edit must be conflict free.');
                }
                else if (diff.inputRange.isAfter(edit.range)) {
                    if (!firstAfter) {
                        firstAfter = true;
                        newDiffs.push(editMapping.addOutputLineDelta(delta));
                    }
                    newDiffs.push(diff.addOutputLineDelta(edit.newLines.length - edit.range.lineCount));
                }
                else {
                    newDiffs.push(diff);
                }
                if (!firstAfter) {
                    delta += diff.outputRange.lineCount - diff.inputRange.lineCount;
                }
            }
            if (!firstAfter) {
                firstAfter = true;
                newDiffs.push(editMapping.addOutputLineDelta(delta));
            }
            this.barrier.runExclusivelyOrThrow(() => {
                const edits = new editing_1.LineRangeEdit(edit.range.delta(delta), edit.newLines).toEdits(this.textModel.getLineCount());
                this.textModel.pushEditOperations(null, edits, () => null, group);
            });
            this._diffs.set(newDiffs, transaction, 0 /* TextModelDiffChangeReason.other */);
        }
        findTouchingDiffs(baseRange) {
            return this.diffs.get().filter(d => d.inputRange.touches(baseRange));
        }
        getResultLine(lineNumber, reader) {
            let offset = 0;
            const diffs = reader ? this.diffs.read(reader) : this.diffs.get();
            for (const diff of diffs) {
                if (diff.inputRange.contains(lineNumber) || diff.inputRange.endLineNumberExclusive === lineNumber) {
                    return diff;
                }
                else if (diff.inputRange.endLineNumberExclusive < lineNumber) {
                    offset = diff.resultingDeltaFromOriginalToModified;
                }
                else {
                    break;
                }
            }
            return lineNumber + offset;
        }
        getResultLineRange(baseRange, reader) {
            let start = this.getResultLine(baseRange.startLineNumber, reader);
            if (typeof start !== 'number') {
                start = start.outputRange.startLineNumber;
            }
            let endExclusive = this.getResultLine(baseRange.endLineNumberExclusive, reader);
            if (typeof endExclusive !== 'number') {
                endExclusive = endExclusive.outputRange.endLineNumberExclusive;
            }
            return lineRange_1.LineRange.fromLineNumbers(start, endExclusive);
        }
    }
    exports.TextModelDiffs = TextModelDiffs;
    var TextModelDiffChangeReason;
    (function (TextModelDiffChangeReason) {
        TextModelDiffChangeReason[TextModelDiffChangeReason["other"] = 0] = "other";
        TextModelDiffChangeReason[TextModelDiffChangeReason["textChange"] = 1] = "textChange";
    })(TextModelDiffChangeReason || (exports.TextModelDiffChangeReason = TextModelDiffChangeReason = {}));
    var TextModelDiffState;
    (function (TextModelDiffState) {
        TextModelDiffState[TextModelDiffState["initializing"] = 1] = "initializing";
        TextModelDiffState[TextModelDiffState["upToDate"] = 2] = "upToDate";
        TextModelDiffState[TextModelDiffState["updating"] = 3] = "updating";
        TextModelDiffState[TextModelDiffState["error"] = 4] = "error";
    })(TextModelDiffState || (exports.TextModelDiffState = TextModelDiffState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsRGlmZnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL21vZGVsL3RleHRNb2RlbERpZmZzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLGNBQWUsU0FBUSxzQkFBVTtRQVE3QyxJQUFXLGdCQUFnQjtZQUMxQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzlCLENBQUM7UUFFRCxZQUNrQixhQUF5QixFQUN6QixTQUFxQixFQUNyQixZQUFnQztZQUVqRCxLQUFLLEVBQUUsQ0FBQztZQUpTLGtCQUFhLEdBQWIsYUFBYSxDQUFZO1lBQ3pCLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFDckIsaUJBQVksR0FBWixZQUFZLENBQW9CO1lBZDFDLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsV0FBTSxHQUFHLElBQUEsNEJBQWUsRUFBZ0QsSUFBSSwwQ0FBa0MsQ0FBQztZQUMvRyxXQUFNLEdBQUcsSUFBQSw0QkFBZSxFQUF3RCxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFMUYsWUFBTyxHQUFHLElBQUkseUJBQWlCLEVBQUUsQ0FBQztZQUMzQyxlQUFVLEdBQUcsS0FBSyxDQUFDO1lBbURuQixtQkFBYyxHQUFHLElBQUksQ0FBQztZQXRDN0IsTUFBTSxlQUFlLEdBQUcsSUFBQSw2QkFBZ0IsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsb0JBQU8sRUFBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IscUNBQXFDO2dCQUNyQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFD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