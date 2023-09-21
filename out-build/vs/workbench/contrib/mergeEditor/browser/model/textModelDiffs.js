/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/editing", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/base/common/observable"], function (require, exports, arrays_1, errors_1, lifecycle_1, mapping_1, editing_1, lineRange_1, utils_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelDiffState = exports.TextModelDiffChangeReason = exports.$xjb = void 0;
    class $xjb extends lifecycle_1.$kc {
        get isApplyingChange() {
            return this.f.isActive;
        }
        constructor(h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = 0;
            this.b = (0, observable_1.observableValue)(this, 1 /* TextModelDiffState.initializing */);
            this.c = (0, observable_1.observableValue)(this, []);
            this.f = new utils_1.$7ib();
            this.g = false;
            this.n = true;
            const recomputeSignal = (0, observable_1.observableSignal)('recompute');
            this.B((0, observable_1.autorun)(reader => {
                /** @description Update diff state */
                recomputeSignal.read(reader);
                this.r(reader);
            }));
            this.B(h.onDidChangeContent(this.f.makeExclusive(() => {
                recomputeSignal.trigger(undefined);
            })));
            this.B(j.onDidChangeContent(this.f.makeExclusive(() => {
                recomputeSignal.trigger(undefined);
            })));
            this.B((0, lifecycle_1.$ic)(() => {
                this.g = true;
            }));
        }
        get state() {
            return this.b;
        }
        /**
         * Diffs from base to input.
        */
        get diffs() {
            return this.c;
        }
        r(reader) {
            this.a++;
            const currentRecomputeIdx = this.a;
            if (this.b.get() === 1 /* TextModelDiffState.initializing */) {
                this.n = true;
            }
            (0, observable_1.transaction)(tx => {
                /** @description Starting Diff Computation. */
                this.b.set(this.n ? 1 /* TextModelDiffState.initializing */ : 3 /* TextModelDiffState.updating */, tx, 0 /* TextModelDiffChangeReason.other */);
            });
            const result = this.m.computeDiff(this.h, this.j, reader);
            result.then((result) => {
                if (this.g) {
                    return;
                }
                if (currentRecomputeIdx !== this.a) {
                    // There is a newer recompute call
                    return;
                }
                (0, observable_1.transaction)(tx => {
                    /** @description Completed Diff Computation */
                    if (result.diffs) {
                        this.b.set(2 /* TextModelDiffState.upToDate */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                        this.c.set(result.diffs, tx, 1 /* TextModelDiffChangeReason.textChange */);
                    }
                    else {
                        this.b.set(4 /* TextModelDiffState.error */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                    }
                    this.n = false;
                });
            });
        }
        s() {
            if (this.state.get() !== 2 /* TextModelDiffState.upToDate */) {
                throw new errors_1.$ab('Cannot remove diffs when the model is not up to date');
            }
        }
        removeDiffs(diffToRemoves, transaction, group) {
            this.s();
            diffToRemoves.sort((0, arrays_1.$5b)((d) => d.inputRange.startLineNumber, arrays_1.$7b));
            diffToRemoves.reverse();
            let diffs = this.c.get();
            for (const diffToRemove of diffToRemoves) {
                // TODO improve performance
                const len = diffs.length;
                diffs = diffs.filter((d) => d !== diffToRemove);
                if (len === diffs.length) {
                    throw new errors_1.$ab();
                }
                this.f.runExclusivelyOrThrow(() => {
                    const edits = diffToRemove.getReverseLineEdit().toEdits(this.j.getLineCount());
                    this.j.pushEditOperations(null, edits, () => null, group);
                });
                diffs = diffs.map((d) => d.outputRange.isAfter(diffToRemove.outputRange)
                    ? d.addOutputLineDelta(diffToRemove.inputRange.lineCount - diffToRemove.outputRange.lineCount)
                    : d);
            }
            this.c.set(diffs, transaction, 0 /* TextModelDiffChangeReason.other */);
        }
        /**
         * Edit must be conflict free.
         */
        applyEditRelativeToOriginal(edit, transaction, group) {
            this.s();
            const editMapping = new mapping_1.$rjb(edit.range, this.h, new lineRange_1.$6ib(edit.range.startLineNumber, edit.newLines.length), this.j);
            let firstAfter = false;
            let delta = 0;
            const newDiffs = new Array();
            for (const diff of this.diffs.get()) {
                if (diff.inputRange.touches(edit.range)) {
                    throw new errors_1.$ab('Edit must be conflict free.');
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
            this.f.runExclusivelyOrThrow(() => {
                const edits = new editing_1.$gjb(edit.range.delta(delta), edit.newLines).toEdits(this.j.getLineCount());
                this.j.pushEditOperations(null, edits, () => null, group);
            });
            this.c.set(newDiffs, transaction, 0 /* TextModelDiffChangeReason.other */);
        }
        findTouchingDiffs(baseRange) {
            return this.diffs.get().filter(d => d.inputRange.touches(baseRange));
        }
        t(lineNumber, reader) {
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
            let start = this.t(baseRange.startLineNumber, reader);
            if (typeof start !== 'number') {
                start = start.outputRange.startLineNumber;
            }
            let endExclusive = this.t(baseRange.endLineNumberExclusive, reader);
            if (typeof endExclusive !== 'number') {
                endExclusive = endExclusive.outputRange.endLineNumberExclusive;
            }
            return lineRange_1.$6ib.fromLineNumbers(start, endExclusive);
        }
    }
    exports.$xjb = $xjb;
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
//# sourceMappingURL=textModelDiffs.js.map