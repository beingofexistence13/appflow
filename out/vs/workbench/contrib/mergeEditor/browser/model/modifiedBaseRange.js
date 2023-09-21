/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/workbench/contrib/mergeEditor/browser/model/editing", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, arrays_1, errors_1, strings_1, position_1, range_1, editing_1, mapping_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputState = exports.ModifiedBaseRangeState = exports.ModifiedBaseRangeStateUnrecognized = exports.ModifiedBaseRangeStateBoth = exports.ModifiedBaseRangeStateInput2 = exports.ModifiedBaseRangeStateInput1 = exports.ModifiedBaseRangeStateBase = exports.AbstractModifiedBaseRangeState = exports.getOtherInputNumber = exports.ModifiedBaseRangeStateKind = exports.ModifiedBaseRange = void 0;
    /**
     * Describes modifications in input 1 and input 2 for a specific range in base.
     *
     * The UI offers a mechanism to either apply all changes from input 1 or input 2 or both.
     *
     * Immutable.
    */
    class ModifiedBaseRange {
        static fromDiffs(diffs1, diffs2, baseTextModel, input1TextModel, input2TextModel) {
            const alignments = mapping_1.MappingAlignment.compute(diffs1, diffs2);
            return alignments.map((a) => new ModifiedBaseRange(a.inputRange, baseTextModel, a.output1Range, input1TextModel, a.output1LineMappings, a.output2Range, input2TextModel, a.output2LineMappings));
        }
        constructor(baseRange, baseTextModel, input1Range, input1TextModel, 
        /**
         * From base to input1
        */
        input1Diffs, input2Range, input2TextModel, 
        /**
         * From base to input2
        */
        input2Diffs) {
            this.baseRange = baseRange;
            this.baseTextModel = baseTextModel;
            this.input1Range = input1Range;
            this.input1TextModel = input1TextModel;
            this.input1Diffs = input1Diffs;
            this.input2Range = input2Range;
            this.input2TextModel = input2TextModel;
            this.input2Diffs = input2Diffs;
            this.input1CombinedDiff = mapping_1.DetailedLineRangeMapping.join(this.input1Diffs);
            this.input2CombinedDiff = mapping_1.DetailedLineRangeMapping.join(this.input2Diffs);
            this.isEqualChange = (0, arrays_1.equals)(this.input1Diffs, this.input2Diffs, (a, b) => a.getLineEdit().equals(b.getLineEdit()));
            this.smartInput1LineRangeEdit = null;
            this.smartInput2LineRangeEdit = null;
            this.dumbInput1LineRangeEdit = null;
            this.dumbInput2LineRangeEdit = null;
            if (this.input1Diffs.length === 0 && this.input2Diffs.length === 0) {
                throw new errors_1.BugIndicatingError('must have at least one diff');
            }
        }
        getInputRange(inputNumber) {
            return inputNumber === 1 ? this.input1Range : this.input2Range;
        }
        getInputCombinedDiff(inputNumber) {
            return inputNumber === 1 ? this.input1CombinedDiff : this.input2CombinedDiff;
        }
        getInputDiffs(inputNumber) {
            return inputNumber === 1 ? this.input1Diffs : this.input2Diffs;
        }
        get isConflicting() {
            return this.input1Diffs.length > 0 && this.input2Diffs.length > 0;
        }
        get canBeCombined() {
            return this.smartCombineInputs(1) !== undefined;
        }
        get isOrderRelevant() {
            const input1 = this.smartCombineInputs(1);
            const input2 = this.smartCombineInputs(2);
            if (!input1 || !input2) {
                return false;
            }
            return !input1.equals(input2);
        }
        getEditForBase(state) {
            const diffs = [];
            if (state.includesInput1 && this.input1CombinedDiff) {
                diffs.push({ diff: this.input1CombinedDiff, inputNumber: 1 });
            }
            if (state.includesInput2 && this.input2CombinedDiff) {
                diffs.push({ diff: this.input2CombinedDiff, inputNumber: 2 });
            }
            if (diffs.length === 0) {
                return { edit: undefined, effectiveState: ModifiedBaseRangeState.base };
            }
            if (diffs.length === 1) {
                return { edit: diffs[0].diff.getLineEdit(), effectiveState: ModifiedBaseRangeState.base.withInputValue(diffs[0].inputNumber, true, false) };
            }
            if (state.kind !== ModifiedBaseRangeStateKind.both) {
                throw new errors_1.BugIndicatingError();
            }
            const smartCombinedEdit = state.smartCombination ? this.smartCombineInputs(state.firstInput) : this.dumbCombineInputs(state.firstInput);
            if (smartCombinedEdit) {
                return { edit: smartCombinedEdit, effectiveState: state };
            }
            return {
                edit: diffs[getOtherInputNumber(state.firstInput) - 1].diff.getLineEdit(),
                effectiveState: ModifiedBaseRangeState.base.withInputValue(getOtherInputNumber(state.firstInput), true, false),
            };
        }
        smartCombineInputs(firstInput) {
            if (firstInput === 1 && this.smartInput1LineRangeEdit !== null) {
                return this.smartInput1LineRangeEdit;
            }
            else if (firstInput === 2 && this.smartInput2LineRangeEdit !== null) {
                return this.smartInput2LineRangeEdit;
            }
            const combinedDiffs = (0, utils_1.concatArrays)(this.input1Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 1 }))), this.input2Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 2 })))).sort((0, arrays_1.tieBreakComparators)((0, arrays_1.compareBy)((d) => d.diff.inputRange, range_1.Range.compareRangesUsingStarts), (0, arrays_1.compareBy)((d) => (d.input === firstInput ? 1 : 2), arrays_1.numberComparator)));
            const sortedEdits = combinedDiffs.map(d => {
                const sourceTextModel = d.input === 1 ? this.input1TextModel : this.input2TextModel;
                return new editing_1.RangeEdit(d.diff.inputRange, sourceTextModel.getValueInRange(d.diff.outputRange));
            });
            const result = editsToLineRangeEdit(this.baseRange, sortedEdits, this.baseTextModel);
            if (firstInput === 1) {
                this.smartInput1LineRangeEdit = result;
            }
            else {
                this.smartInput2LineRangeEdit = result;
            }
            return result;
        }
        dumbCombineInputs(firstInput) {
            if (firstInput === 1 && this.dumbInput1LineRangeEdit !== null) {
                return this.dumbInput1LineRangeEdit;
            }
            else if (firstInput === 2 && this.dumbInput2LineRangeEdit !== null) {
                return this.dumbInput2LineRangeEdit;
            }
            let input1Lines = this.input1Range.getLines(this.input1TextModel);
            let input2Lines = this.input2Range.getLines(this.input2TextModel);
            if (firstInput === 2) {
                [input1Lines, input2Lines] = [input2Lines, input1Lines];
            }
            const result = new editing_1.LineRangeEdit(this.baseRange, input1Lines.concat(input2Lines));
            if (firstInput === 1) {
                this.dumbInput1LineRangeEdit = result;
            }
            else {
                this.dumbInput2LineRangeEdit = result;
            }
            return result;
        }
    }
    exports.ModifiedBaseRange = ModifiedBaseRange;
    function editsToLineRangeEdit(range, sortedEdits, textModel) {
        let text = '';
        const startsLineBefore = range.startLineNumber > 1;
        let currentPosition = startsLineBefore
            ? new position_1.Position(range.startLineNumber - 1, textModel.getLineMaxColumn(range.startLineNumber - 1))
            : new position_1.Position(range.startLineNumber, 1);
        for (const edit of sortedEdits) {
            const diffStart = edit.range.getStartPosition();
            if (!currentPosition.isBeforeOrEqual(diffStart)) {
                return undefined;
            }
            let originalText = textModel.getValueInRange(range_1.Range.fromPositions(currentPosition, diffStart));
            if (diffStart.lineNumber > textModel.getLineCount()) {
                // assert diffStart.lineNumber === textModel.getLineCount() + 1
                // getValueInRange doesn't include this virtual line break, as the document ends the line before.
                // endsLineAfter will be false.
                originalText += '\n';
            }
            text += originalText;
            text += edit.newText;
            currentPosition = edit.range.getEndPosition();
        }
        const endsLineAfter = range.endLineNumberExclusive <= textModel.getLineCount();
        const end = endsLineAfter ? new position_1.Position(range.endLineNumberExclusive, 1) : new position_1.Position(range.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        const originalText = textModel.getValueInRange(range_1.Range.fromPositions(currentPosition, end));
        text += originalText;
        const lines = (0, strings_1.splitLines)(text);
        if (startsLineBefore) {
            if (lines[0] !== '') {
                return undefined;
            }
            lines.shift();
        }
        if (endsLineAfter) {
            if (lines[lines.length - 1] !== '') {
                return undefined;
            }
            lines.pop();
        }
        return new editing_1.LineRangeEdit(range, lines);
    }
    var ModifiedBaseRangeStateKind;
    (function (ModifiedBaseRangeStateKind) {
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["base"] = 0] = "base";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input1"] = 1] = "input1";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input2"] = 2] = "input2";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["both"] = 3] = "both";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["unrecognized"] = 4] = "unrecognized";
    })(ModifiedBaseRangeStateKind || (exports.ModifiedBaseRangeStateKind = ModifiedBaseRangeStateKind = {}));
    function getOtherInputNumber(inputNumber) {
        return inputNumber === 1 ? 2 : 1;
    }
    exports.getOtherInputNumber = getOtherInputNumber;
    class AbstractModifiedBaseRangeState {
        constructor() { }
        get includesInput1() { return false; }
        get includesInput2() { return false; }
        includesInput(inputNumber) {
            return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
        }
        isInputIncluded(inputNumber) {
            return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
        }
        toggle(inputNumber) {
            return this.withInputValue(inputNumber, !this.includesInput(inputNumber), true);
        }
        getInput(inputNumber) {
            if (!this.isInputIncluded(inputNumber)) {
                return 0 /* InputState.excluded */;
            }
            return 1 /* InputState.first */;
        }
    }
    exports.AbstractModifiedBaseRangeState = AbstractModifiedBaseRangeState;
    class ModifiedBaseRangeStateBase extends AbstractModifiedBaseRangeState {
        get kind() { return ModifiedBaseRangeStateKind.base; }
        toString() { return 'base'; }
        swap() { return this; }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 1) {
                return value ? new ModifiedBaseRangeStateInput1() : this;
            }
            else {
                return value ? new ModifiedBaseRangeStateInput2() : this;
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.base;
        }
    }
    exports.ModifiedBaseRangeStateBase = ModifiedBaseRangeStateBase;
    class ModifiedBaseRangeStateInput1 extends AbstractModifiedBaseRangeState {
        get kind() { return ModifiedBaseRangeStateKind.input1; }
        get includesInput1() { return true; }
        toString() { return '1✓'; }
        swap() { return new ModifiedBaseRangeStateInput2(); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 1) {
                return value ? this : new ModifiedBaseRangeStateBase();
            }
            else {
                return value ? new ModifiedBaseRangeStateBoth(1, smartCombination) : new ModifiedBaseRangeStateInput2();
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.input1;
        }
    }
    exports.ModifiedBaseRangeStateInput1 = ModifiedBaseRangeStateInput1;
    class ModifiedBaseRangeStateInput2 extends AbstractModifiedBaseRangeState {
        get kind() { return ModifiedBaseRangeStateKind.input2; }
        get includesInput2() { return true; }
        toString() { return '2✓'; }
        swap() { return new ModifiedBaseRangeStateInput1(); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 2) {
                return value ? this : new ModifiedBaseRangeStateBase();
            }
            else {
                return value ? new ModifiedBaseRangeStateBoth(2, smartCombination) : new ModifiedBaseRangeStateInput2();
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.input2;
        }
    }
    exports.ModifiedBaseRangeStateInput2 = ModifiedBaseRangeStateInput2;
    class ModifiedBaseRangeStateBoth extends AbstractModifiedBaseRangeState {
        constructor(firstInput, smartCombination) {
            super();
            this.firstInput = firstInput;
            this.smartCombination = smartCombination;
        }
        get kind() { return ModifiedBaseRangeStateKind.both; }
        get includesInput1() { return true; }
        get includesInput2() { return true; }
        toString() {
            return '2✓';
        }
        swap() { return new ModifiedBaseRangeStateBoth(getOtherInputNumber(this.firstInput), this.smartCombination); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (value) {
                return this;
            }
            return inputNumber === 1 ? new ModifiedBaseRangeStateInput2() : new ModifiedBaseRangeStateInput1();
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.both && this.firstInput === other.firstInput && this.smartCombination === other.smartCombination;
        }
        getInput(inputNumber) {
            return inputNumber === this.firstInput ? 1 /* InputState.first */ : 2 /* InputState.second */;
        }
    }
    exports.ModifiedBaseRangeStateBoth = ModifiedBaseRangeStateBoth;
    class ModifiedBaseRangeStateUnrecognized extends AbstractModifiedBaseRangeState {
        get kind() { return ModifiedBaseRangeStateKind.unrecognized; }
        toString() { return 'unrecognized'; }
        swap() { return this; }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (!value) {
                return this;
            }
            return inputNumber === 1 ? new ModifiedBaseRangeStateInput1() : new ModifiedBaseRangeStateInput2();
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.unrecognized;
        }
    }
    exports.ModifiedBaseRangeStateUnrecognized = ModifiedBaseRangeStateUnrecognized;
    var ModifiedBaseRangeState;
    (function (ModifiedBaseRangeState) {
        ModifiedBaseRangeState.base = new ModifiedBaseRangeStateBase();
        ModifiedBaseRangeState.unrecognized = new ModifiedBaseRangeStateUnrecognized();
    })(ModifiedBaseRangeState || (exports.ModifiedBaseRangeState = ModifiedBaseRangeState = {}));
    var InputState;
    (function (InputState) {
        InputState[InputState["excluded"] = 0] = "excluded";
        InputState[InputState["first"] = 1] = "first";
        InputState[InputState["second"] = 2] = "second";
        InputState[InputState["unrecognized"] = 3] = "unrecognized";
    })(InputState || (exports.InputState = InputState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZpZWRCYXNlUmFuZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL21vZGVsL21vZGlmaWVkQmFzZVJhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRzs7Ozs7O01BTUU7SUFDRixNQUFhLGlCQUFpQjtRQUN0QixNQUFNLENBQUMsU0FBUyxDQUN0QixNQUEyQyxFQUMzQyxNQUEyQyxFQUMzQyxhQUF5QixFQUN6QixlQUEyQixFQUMzQixlQUEyQjtZQUUzQixNQUFNLFVBQVUsR0FBRywwQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVELE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FDcEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksaUJBQWlCLENBQzNCLENBQUMsQ0FBQyxVQUFVLEVBQ1osYUFBYSxFQUNiLENBQUMsQ0FBQyxZQUFZLEVBQ2QsZUFBZSxFQUNmLENBQUMsQ0FBQyxtQkFBbUIsRUFDckIsQ0FBQyxDQUFDLFlBQVksRUFDZCxlQUFlLEVBQ2YsQ0FBQyxDQUFDLG1CQUFtQixDQUNyQixDQUNELENBQUM7UUFDSCxDQUFDO1FBTUQsWUFDaUIsU0FBb0IsRUFDcEIsYUFBeUIsRUFDekIsV0FBc0IsRUFDdEIsZUFBMkI7UUFFM0M7O1VBRUU7UUFDYyxXQUFnRCxFQUNoRCxXQUFzQixFQUN0QixlQUEyQjtRQUUzQzs7VUFFRTtRQUNjLFdBQWdEO1lBZmhELGNBQVMsR0FBVCxTQUFTLENBQVc7WUFDcEIsa0JBQWEsR0FBYixhQUFhLENBQVk7WUFDekIsZ0JBQVcsR0FBWCxXQUFXLENBQVc7WUFDdEIsb0JBQWUsR0FBZixlQUFlLENBQVk7WUFLM0IsZ0JBQVcsR0FBWCxXQUFXLENBQXFDO1lBQ2hELGdCQUFXLEdBQVgs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