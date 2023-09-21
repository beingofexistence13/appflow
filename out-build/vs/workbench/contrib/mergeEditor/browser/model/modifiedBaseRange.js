/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/workbench/contrib/mergeEditor/browser/model/editing", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, arrays_1, errors_1, strings_1, position_1, range_1, editing_1, mapping_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputState = exports.ModifiedBaseRangeState = exports.$Fjb = exports.$Ejb = exports.$Djb = exports.$Cjb = exports.$Bjb = exports.$Ajb = exports.$zjb = exports.ModifiedBaseRangeStateKind = exports.$yjb = void 0;
    /**
     * Describes modifications in input 1 and input 2 for a specific range in base.
     *
     * The UI offers a mechanism to either apply all changes from input 1 or input 2 or both.
     *
     * Immutable.
    */
    class $yjb {
        static fromDiffs(diffs1, diffs2, baseTextModel, input1TextModel, input2TextModel) {
            const alignments = mapping_1.$qjb.compute(diffs1, diffs2);
            return alignments.map((a) => new $yjb(a.inputRange, baseTextModel, a.output1Range, input1TextModel, a.output1LineMappings, a.output2Range, input2TextModel, a.output2LineMappings));
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
            this.input1CombinedDiff = mapping_1.$rjb.join(this.input1Diffs);
            this.input2CombinedDiff = mapping_1.$rjb.join(this.input2Diffs);
            this.isEqualChange = (0, arrays_1.$sb)(this.input1Diffs, this.input2Diffs, (a, b) => a.getLineEdit().equals(b.getLineEdit()));
            this.c = null;
            this.e = null;
            this.g = null;
            this.h = null;
            if (this.input1Diffs.length === 0 && this.input2Diffs.length === 0) {
                throw new errors_1.$ab('must have at least one diff');
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
            return this.f(1) !== undefined;
        }
        get isOrderRelevant() {
            const input1 = this.f(1);
            const input2 = this.f(2);
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
                throw new errors_1.$ab();
            }
            const smartCombinedEdit = state.smartCombination ? this.f(state.firstInput) : this.i(state.firstInput);
            if (smartCombinedEdit) {
                return { edit: smartCombinedEdit, effectiveState: state };
            }
            return {
                edit: diffs[$zjb(state.firstInput) - 1].diff.getLineEdit(),
                effectiveState: ModifiedBaseRangeState.base.withInputValue($zjb(state.firstInput), true, false),
            };
        }
        f(firstInput) {
            if (firstInput === 1 && this.c !== null) {
                return this.c;
            }
            else if (firstInput === 2 && this.e !== null) {
                return this.e;
            }
            const combinedDiffs = (0, utils_1.$_ib)(this.input1Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 1 }))), this.input2Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 2 })))).sort((0, arrays_1.$6b)((0, arrays_1.$5b)((d) => d.diff.inputRange, range_1.$ks.compareRangesUsingStarts), (0, arrays_1.$5b)((d) => (d.input === firstInput ? 1 : 2), arrays_1.$7b)));
            const sortedEdits = combinedDiffs.map(d => {
                const sourceTextModel = d.input === 1 ? this.input1TextModel : this.input2TextModel;
                return new editing_1.$hjb(d.diff.inputRange, sourceTextModel.getValueInRange(d.diff.outputRange));
            });
            const result = editsToLineRangeEdit(this.baseRange, sortedEdits, this.baseTextModel);
            if (firstInput === 1) {
                this.c = result;
            }
            else {
                this.e = result;
            }
            return result;
        }
        i(firstInput) {
            if (firstInput === 1 && this.g !== null) {
                return this.g;
            }
            else if (firstInput === 2 && this.h !== null) {
                return this.h;
            }
            let input1Lines = this.input1Range.getLines(this.input1TextModel);
            let input2Lines = this.input2Range.getLines(this.input2TextModel);
            if (firstInput === 2) {
                [input1Lines, input2Lines] = [input2Lines, input1Lines];
            }
            const result = new editing_1.$gjb(this.baseRange, input1Lines.concat(input2Lines));
            if (firstInput === 1) {
                this.g = result;
            }
            else {
                this.h = result;
            }
            return result;
        }
    }
    exports.$yjb = $yjb;
    function editsToLineRangeEdit(range, sortedEdits, textModel) {
        let text = '';
        const startsLineBefore = range.startLineNumber > 1;
        let currentPosition = startsLineBefore
            ? new position_1.$js(range.startLineNumber - 1, textModel.getLineMaxColumn(range.startLineNumber - 1))
            : new position_1.$js(range.startLineNumber, 1);
        for (const edit of sortedEdits) {
            const diffStart = edit.range.getStartPosition();
            if (!currentPosition.isBeforeOrEqual(diffStart)) {
                return undefined;
            }
            let originalText = textModel.getValueInRange(range_1.$ks.fromPositions(currentPosition, diffStart));
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
        const end = endsLineAfter ? new position_1.$js(range.endLineNumberExclusive, 1) : new position_1.$js(range.endLineNumberExclusive - 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        const originalText = textModel.getValueInRange(range_1.$ks.fromPositions(currentPosition, end));
        text += originalText;
        const lines = (0, strings_1.$Ae)(text);
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
        return new editing_1.$gjb(range, lines);
    }
    var ModifiedBaseRangeStateKind;
    (function (ModifiedBaseRangeStateKind) {
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["base"] = 0] = "base";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input1"] = 1] = "input1";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input2"] = 2] = "input2";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["both"] = 3] = "both";
        ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["unrecognized"] = 4] = "unrecognized";
    })(ModifiedBaseRangeStateKind || (exports.ModifiedBaseRangeStateKind = ModifiedBaseRangeStateKind = {}));
    function $zjb(inputNumber) {
        return inputNumber === 1 ? 2 : 1;
    }
    exports.$zjb = $zjb;
    class $Ajb {
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
    exports.$Ajb = $Ajb;
    class $Bjb extends $Ajb {
        get kind() { return ModifiedBaseRangeStateKind.base; }
        toString() { return 'base'; }
        swap() { return this; }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 1) {
                return value ? new $Cjb() : this;
            }
            else {
                return value ? new $Djb() : this;
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.base;
        }
    }
    exports.$Bjb = $Bjb;
    class $Cjb extends $Ajb {
        get kind() { return ModifiedBaseRangeStateKind.input1; }
        get includesInput1() { return true; }
        toString() { return '1✓'; }
        swap() { return new $Djb(); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 1) {
                return value ? this : new $Bjb();
            }
            else {
                return value ? new $Ejb(1, smartCombination) : new $Djb();
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.input1;
        }
    }
    exports.$Cjb = $Cjb;
    class $Djb extends $Ajb {
        get kind() { return ModifiedBaseRangeStateKind.input2; }
        get includesInput2() { return true; }
        toString() { return '2✓'; }
        swap() { return new $Cjb(); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (inputNumber === 2) {
                return value ? this : new $Bjb();
            }
            else {
                return value ? new $Ejb(2, smartCombination) : new $Djb();
            }
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.input2;
        }
    }
    exports.$Djb = $Djb;
    class $Ejb extends $Ajb {
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
        swap() { return new $Ejb($zjb(this.firstInput), this.smartCombination); }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (value) {
                return this;
            }
            return inputNumber === 1 ? new $Djb() : new $Cjb();
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.both && this.firstInput === other.firstInput && this.smartCombination === other.smartCombination;
        }
        getInput(inputNumber) {
            return inputNumber === this.firstInput ? 1 /* InputState.first */ : 2 /* InputState.second */;
        }
    }
    exports.$Ejb = $Ejb;
    class $Fjb extends $Ajb {
        get kind() { return ModifiedBaseRangeStateKind.unrecognized; }
        toString() { return 'unrecognized'; }
        swap() { return this; }
        withInputValue(inputNumber, value, smartCombination = false) {
            if (!value) {
                return this;
            }
            return inputNumber === 1 ? new $Cjb() : new $Djb();
        }
        equals(other) {
            return other.kind === ModifiedBaseRangeStateKind.unrecognized;
        }
    }
    exports.$Fjb = $Fjb;
    var ModifiedBaseRangeState;
    (function (ModifiedBaseRangeState) {
        ModifiedBaseRangeState.base = new $Bjb();
        ModifiedBaseRangeState.unrecognized = new $Fjb();
    })(ModifiedBaseRangeState || (exports.ModifiedBaseRangeState = ModifiedBaseRangeState = {}));
    var InputState;
    (function (InputState) {
        InputState[InputState["excluded"] = 0] = "excluded";
        InputState[InputState["first"] = 1] = "first";
        InputState[InputState["second"] = 2] = "second";
        InputState[InputState["unrecognized"] = 3] = "unrecognized";
    })(InputState || (exports.InputState = InputState = {}));
});
//# sourceMappingURL=modifiedBaseRange.js.map