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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/observable", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/textModelDiffs", "vs/workbench/contrib/mergeEditor/browser/utils", "./modifiedBaseRange"], function (require, exports, arrays_1, errors_1, observable_1, range_1, language_1, nls_1, undoRedo_1, editorModel_1, lineRange_1, mapping_1, textModelDiffs_1, utils_1, modifiedBaseRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorModelState = exports.$Hjb = void 0;
    let $Hjb = class $Hjb extends editorModel_1.$xA {
        constructor(base, input1, input2, resultTextModel, w, y, telemetry, z, C) {
            super();
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.resultTextModel = resultTextModel;
            this.w = w;
            this.y = y;
            this.telemetry = telemetry;
            this.z = z;
            this.C = C;
            this.c = this.B(new textModelDiffs_1.$xjb(this.base, this.input1.textModel, this.w));
            this.g = this.B(new textModelDiffs_1.$xjb(this.base, this.input2.textModel, this.w));
            this.n = this.B(new textModelDiffs_1.$xjb(this.base, this.resultTextModel, this.w));
            this.modifiedBaseRanges = (0, observable_1.derived)(this, (reader) => {
                const input1Diffs = this.c.diffs.read(reader);
                const input2Diffs = this.g.diffs.read(reader);
                return modifiedBaseRange_1.$yjb.fromDiffs(input1Diffs, input2Diffs, this.base, this.input1.textModel, this.input2.textModel);
            });
            this.t = (0, observable_1.derived)(this, reader => {
                const map = new Map(this.modifiedBaseRanges.read(reader).map((s) => [
                    s, new ModifiedBaseRangeData(s)
                ]));
                return map;
            });
            this.u = this.resultTextModel.createSnapshot();
            this.baseInput1Diffs = this.c.diffs;
            this.baseInput2Diffs = this.g.diffs;
            this.baseResultDiffs = this.n.diffs;
            this.input1ResultMapping = (0, observable_1.derived)(this, reader => {
                return this.G(this.baseInput1Diffs.read(reader), this.baseResultDiffs.read(reader), this.input1.textModel.getLineCount());
            });
            this.resultInput1Mapping = (0, observable_1.derived)(this, reader => this.input1ResultMapping.read(reader).reverse());
            this.input2ResultMapping = (0, observable_1.derived)(this, reader => {
                return this.G(this.baseInput2Diffs.read(reader), this.baseResultDiffs.read(reader), this.input2.textModel.getLineCount());
            });
            this.resultInput2Mapping = (0, observable_1.derived)(this, reader => this.input2ResultMapping.read(reader).reverse());
            this.baseResultMapping = (0, observable_1.derived)(this, reader => {
                const map = new mapping_1.$pjb(this.baseResultDiffs.read(reader), -1);
                return new mapping_1.$pjb(map.lineRangeMappings.map((m) => m.inputRange.isEmpty || m.outputRange.isEmpty
                    ? new mapping_1.$ojb(
                    // We can do this because two adjacent diffs have one line in between.
                    m.inputRange.deltaStart(-1), m.outputRange.deltaStart(-1))
                    : m), map.inputLineCount);
            });
            this.resultBaseMapping = (0, observable_1.derived)(this, reader => this.baseResultMapping.read(reader).reverse());
            this.diffComputingState = (0, observable_1.derived)(this, reader => {
                const states = [
                    this.c,
                    this.g,
                    this.n,
                ].map((s) => s.state.read(reader));
                if (states.some((s) => s === 1 /* TextModelDiffState.initializing */)) {
                    return 1 /* MergeEditorModelState.initializing */;
                }
                if (states.some((s) => s === 3 /* TextModelDiffState.updating */)) {
                    return 3 /* MergeEditorModelState.updating */;
                }
                return 2 /* MergeEditorModelState.upToDate */;
            });
            this.inputDiffComputingState = (0, observable_1.derived)(this, reader => {
                const states = [
                    this.c,
                    this.g,
                ].map((s) => s.state.read(reader));
                if (states.some((s) => s === 1 /* TextModelDiffState.initializing */)) {
                    return 1 /* MergeEditorModelState.initializing */;
                }
                if (states.some((s) => s === 3 /* TextModelDiffState.updating */)) {
                    return 3 /* MergeEditorModelState.updating */;
                }
                return 2 /* MergeEditorModelState.upToDate */;
            });
            this.isUpToDate = (0, observable_1.derived)(this, reader => this.diffComputingState.read(reader) === 2 /* MergeEditorModelState.upToDate */);
            this.onInitialized = (0, observable_1.waitForState)(this.diffComputingState, state => state === 2 /* MergeEditorModelState.upToDate */).then(() => { });
            this.H = true;
            this.unhandledConflictsCount = (0, observable_1.derived)(this, reader => {
                const map = this.t.read(reader);
                let unhandledCount = 0;
                for (const [_key, value] of map) {
                    if (!value.handled.read(reader)) {
                        unhandledCount++;
                    }
                }
                return unhandledCount;
            });
            this.hasUnhandledConflicts = this.unhandledConflictsCount.map(value => /** @description hasUnhandledConflicts */ value > 0);
            this.B((0, observable_1.keepObserved)(this.t));
            this.B((0, observable_1.keepObserved)(this.input1ResultMapping));
            this.B((0, observable_1.keepObserved)(this.input2ResultMapping));
            const initializePromise = this.D();
            this.onInitialized = this.onInitialized.then(async () => {
                await initializePromise;
            });
            initializePromise.then(() => {
                let shouldRecomputeHandledFromAccepted = true;
                this.B((0, observable_1.autorunHandleChanges)({
                    handleChange: (ctx) => {
                        if (ctx.didChange(this.t)) {
                            shouldRecomputeHandledFromAccepted = true;
                        }
                        return ctx.didChange(this.n.diffs)
                            // Ignore non-text changes as we update the state directly
                            ? ctx.change === 1 /* TextModelDiffChangeReason.textChange */
                            : true;
                    },
                }, (reader) => {
                    /** @description Merge Editor Model: Recompute State From Result */
                    const states = this.t.read(reader);
                    if (!this.isUpToDate.read(reader)) {
                        return;
                    }
                    const resultDiffs = this.n.diffs.read(reader);
                    (0, observable_1.transaction)(tx => {
                        /** @description Merge Editor Model: Recompute State */
                        this.I(resultDiffs, states, tx);
                        if (shouldRecomputeHandledFromAccepted) {
                            shouldRecomputeHandledFromAccepted = false;
                            for (const [_range, observableState] of states) {
                                const state = observableState.accepted.get();
                                const handled = !(state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base || state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized);
                                observableState.handledInput1.set(handled, tx);
                                observableState.handledInput2.set(handled, tx);
                            }
                        }
                    });
                }));
            });
        }
        async D() {
            if (this.y.resetResult) {
                await this.reset();
            }
        }
        async reset() {
            await (0, observable_1.waitForState)(this.inputDiffComputingState, state => state === 2 /* MergeEditorModelState.upToDate */);
            const states = this.t.get();
            (0, observable_1.transaction)(tx => {
                /** @description Set initial state */
                for (const [range, state] of states) {
                    let newState;
                    let handled = false;
                    if (range.input1Diffs.length === 0) {
                        newState = modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(2, true);
                        handled = true;
                    }
                    else if (range.input2Diffs.length === 0) {
                        newState = modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(1, true);
                        handled = true;
                    }
                    else if (range.isEqualChange) {
                        newState = modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(1, true);
                        handled = true;
                    }
                    else {
                        newState = modifiedBaseRange_1.ModifiedBaseRangeState.base;
                        handled = false;
                    }
                    state.accepted.set(newState, tx);
                    state.computedFromDiffing = false;
                    state.previousNonDiffingState = undefined;
                    state.handledInput1.set(handled, tx);
                    state.handledInput2.set(handled, tx);
                }
                this.resultTextModel.pushEditOperations(null, [{
                        range: new range_1.$ks(1, 1, Number.MAX_SAFE_INTEGER, 1),
                        text: this.F()
                    }], () => null);
            });
        }
        F() {
            const baseRanges = this.modifiedBaseRanges.get();
            const baseLines = this.base.getLinesContent();
            const input1Lines = this.input1.textModel.getLinesContent();
            const input2Lines = this.input2.textModel.getLinesContent();
            const resultLines = [];
            function appendLinesToResult(source, lineRange) {
                for (let i = lineRange.startLineNumber; i < lineRange.endLineNumberExclusive; i++) {
                    resultLines.push(source[i - 1]);
                }
            }
            let baseStartLineNumber = 1;
            for (const baseRange of baseRanges) {
                appendLinesToResult(baseLines, lineRange_1.$6ib.fromLineNumbers(baseStartLineNumber, baseRange.baseRange.startLineNumber));
                baseStartLineNumber = baseRange.baseRange.endLineNumberExclusive;
                if (baseRange.input1Diffs.length === 0) {
                    appendLinesToResult(input2Lines, baseRange.input2Range);
                }
                else if (baseRange.input2Diffs.length === 0) {
                    appendLinesToResult(input1Lines, baseRange.input1Range);
                }
                else if (baseRange.isEqualChange) {
                    appendLinesToResult(input1Lines, baseRange.input1Range);
                }
                else {
                    appendLinesToResult(baseLines, baseRange.baseRange);
                }
            }
            appendLinesToResult(baseLines, lineRange_1.$6ib.fromLineNumbers(baseStartLineNumber, baseLines.length + 1));
            return resultLines.join(this.resultTextModel.getEOL());
        }
        hasBaseRange(baseRange) {
            return this.t.get().has(baseRange);
        }
        get isApplyingEditInResult() { return this.n.isApplyingChange; }
        G(inputLinesDiffs, resultDiffs, inputLineCount) {
            const map = mapping_1.$pjb.betweenOutputs(inputLinesDiffs, resultDiffs, inputLineCount);
            return new mapping_1.$pjb(map.lineRangeMappings.map((m) => m.inputRange.isEmpty || m.outputRange.isEmpty
                ? new mapping_1.$ojb(
                // We can do this because two adjacent diffs have one line in between.
                m.inputRange.deltaStart(-1), m.outputRange.deltaStart(-1))
                : m), map.inputLineCount);
        }
        translateInputRangeToBase(input, range) {
            const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
            const map = new mapping_1.$tjb(baseInputDiffs.flatMap(d => d.rangeMappings), 0).reverse();
            return map.projectRange(range).outputRange;
        }
        translateBaseRangeToInput(input, range) {
            const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
            const map = new mapping_1.$tjb(baseInputDiffs.flatMap(d => d.rangeMappings), 0);
            return map.projectRange(range).outputRange;
        }
        getLineRangeInResult(baseRange, reader) {
            return this.n.getResultLineRange(baseRange, reader);
        }
        translateResultRangeToBase(range) {
            const map = new mapping_1.$tjb(this.baseResultDiffs.get().flatMap(d => d.rangeMappings), 0).reverse();
            return map.projectRange(range).outputRange;
        }
        translateBaseRangeToResult(range) {
            const map = new mapping_1.$tjb(this.baseResultDiffs.get().flatMap(d => d.rangeMappings), 0);
            return map.projectRange(range).outputRange;
        }
        findModifiedBaseRangesInRange(rangeInBase) {
            // TODO use binary search
            return this.modifiedBaseRanges.get().filter(r => r.baseRange.intersects(rangeInBase));
        }
        I(resultDiffs, states, tx) {
            const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.$0ib)(states, resultDiffs, (baseRange, diff) => baseRange[0].baseRange.touches(diff.inputRange)
                ? arrays_1.CompareResult.neitherLessOrGreaterThan
                : lineRange_1.$6ib.compareByStart(baseRange[0].baseRange, diff.inputRange));
            for (const row of baseRangeWithStoreAndTouchingDiffs) {
                const newState = this.J(row.left[0], row.rights);
                const data = row.left[1];
                const oldState = data.accepted.get();
                if (!oldState.equals(newState)) {
                    if (!this.H && !data.computedFromDiffing) {
                        // Don't set this on the first run - the first run might be used to restore state.
                        data.computedFromDiffing = true;
                        data.previousNonDiffingState = oldState;
                    }
                    data.accepted.set(newState, tx);
                }
            }
            if (this.H) {
                this.H = false;
            }
        }
        J(baseRange, conflictingDiffs) {
            if (conflictingDiffs.length === 0) {
                return modifiedBaseRange_1.ModifiedBaseRangeState.base;
            }
            const conflictingEdits = conflictingDiffs.map((d) => d.getLineEdit());
            function editsAgreeWithDiffs(diffs) {
                return (0, arrays_1.$sb)(conflictingEdits, diffs.map((d) => d.getLineEdit()), (a, b) => a.equals(b));
            }
            if (editsAgreeWithDiffs(baseRange.input1Diffs)) {
                return modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(1, true);
            }
            if (editsAgreeWithDiffs(baseRange.input2Diffs)) {
                return modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(2, true);
            }
            const states = [
                modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, true),
                modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, true),
                modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, false),
                modifiedBaseRange_1.ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, false),
            ];
            for (const s of states) {
                const { edit } = baseRange.getEditForBase(s);
                if (edit) {
                    const resultRange = this.n.getResultLineRange(baseRange.baseRange);
                    const existingLines = resultRange.getLines(this.resultTextModel);
                    if ((0, arrays_1.$sb)(edit.newLines, existingLines, (a, b) => a === b)) {
                        return s;
                    }
                }
            }
            return modifiedBaseRange_1.ModifiedBaseRangeState.unrecognized;
        }
        getState(baseRange) {
            const existingState = this.t.get().get(baseRange);
            if (!existingState) {
                throw new errors_1.$ab('object must be from this instance');
            }
            return existingState.accepted;
        }
        setState(baseRange, state, _markInputAsHandled, tx, _pushStackElement = false) {
            if (!this.isUpToDate.get()) {
                throw new errors_1.$ab('Cannot set state while updating');
            }
            const existingState = this.t.get().get(baseRange);
            if (!existingState) {
                throw new errors_1.$ab('object must be from this instance');
            }
            const conflictingDiffs = this.n.findTouchingDiffs(baseRange.baseRange);
            const group = new undoRedo_1.$yu();
            if (conflictingDiffs) {
                this.n.removeDiffs(conflictingDiffs, tx, group);
            }
            const { edit, effectiveState } = baseRange.getEditForBase(state);
            existingState.accepted.set(effectiveState, tx);
            existingState.previousNonDiffingState = undefined;
            existingState.computedFromDiffing = false;
            const input1Handled = existingState.handledInput1.get();
            const input2Handled = existingState.handledInput2.get();
            if (!input1Handled || !input2Handled) {
                this.C.pushElement(new MarkAsHandledUndoRedoElement(this.resultTextModel.uri, new WeakRef(this), new WeakRef(existingState), input1Handled, input2Handled), group);
            }
            if (edit) {
                this.resultTextModel.pushStackElement();
                this.n.applyEditRelativeToOriginal(edit, tx, group);
                this.resultTextModel.pushStackElement();
            }
            // always set conflict as handled
            existingState.handledInput1.set(true, tx);
            existingState.handledInput2.set(true, tx);
        }
        resetDirtyConflictsToBase() {
            (0, observable_1.transaction)(tx => {
                /** @description Reset Unknown Base Range States */
                this.resultTextModel.pushStackElement();
                for (const range of this.modifiedBaseRanges.get()) {
                    if (this.getState(range).get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                        this.setState(range, modifiedBaseRange_1.ModifiedBaseRangeState.base, false, tx, false);
                    }
                }
                this.resultTextModel.pushStackElement();
            });
        }
        isHandled(baseRange) {
            return this.t.get().get(baseRange).handled;
        }
        isInputHandled(baseRange, inputNumber) {
            const state = this.t.get().get(baseRange);
            return inputNumber === 1 ? state.handledInput1 : state.handledInput2;
        }
        setInputHandled(baseRange, inputNumber, handled, tx) {
            const state = this.t.get().get(baseRange);
            if (state.handled.get() === handled) {
                return;
            }
            const dataRef = new WeakRef(ModifiedBaseRangeData);
            const modelRef = new WeakRef(this);
            this.C.pushElement({
                type: 0 /* UndoRedoElementType.Resource */,
                resource: this.resultTextModel.uri,
                code: 'setInputHandled',
                label: (0, nls_1.localize)(0, null),
                redo() {
                    const model = modelRef.deref();
                    const data = dataRef.deref();
                    if (model && !model.isDisposed() && data) {
                        (0, observable_1.transaction)(tx => {
                            if (inputNumber === 1) {
                                state.handledInput1.set(handled, tx);
                            }
                            else {
                                state.handledInput2.set(handled, tx);
                            }
                        });
                    }
                },
                undo() {
                    const model = modelRef.deref();
                    const data = dataRef.deref();
                    if (model && !model.isDisposed() && data) {
                        (0, observable_1.transaction)(tx => {
                            if (inputNumber === 1) {
                                state.handledInput1.set(!handled, tx);
                            }
                            else {
                                state.handledInput2.set(!handled, tx);
                            }
                        });
                    }
                },
            });
            if (inputNumber === 1) {
                state.handledInput1.set(handled, tx);
            }
            else {
                state.handledInput2.set(handled, tx);
            }
        }
        setHandled(baseRange, handled, tx) {
            const state = this.t.get().get(baseRange);
            if (state.handled.get() === handled) {
                return;
            }
            state.handledInput1.set(handled, tx);
            state.handledInput2.set(handled, tx);
        }
        setLanguageId(languageId, source) {
            const language = this.z.createById(languageId);
            this.base.setLanguage(language, source);
            this.input1.textModel.setLanguage(language, source);
            this.input2.textModel.setLanguage(language, source);
            this.resultTextModel.setLanguage(language, source);
        }
        getInitialResultValue() {
            const chunks = [];
            while (true) {
                const chunk = this.u.read();
                if (chunk === null) {
                    break;
                }
                chunks.push(chunk);
            }
            return chunks.join();
        }
        async getResultValueWithConflictMarkers() {
            await (0, observable_1.waitForState)(this.diffComputingState, state => state === 2 /* MergeEditorModelState.upToDate */);
            if (this.unhandledConflictsCount.get() === 0) {
                return this.resultTextModel.getValue();
            }
            const resultLines = this.resultTextModel.getLinesContent();
            const input1Lines = this.input1.textModel.getLinesContent();
            const input2Lines = this.input2.textModel.getLinesContent();
            const states = this.t.get();
            const outputLines = [];
            function appendLinesToResult(source, lineRange) {
                for (let i = lineRange.startLineNumber; i < lineRange.endLineNumberExclusive; i++) {
                    outputLines.push(source[i - 1]);
                }
            }
            let resultStartLineNumber = 1;
            for (const [range, state] of states) {
                if (state.handled.get()) {
                    continue;
                }
                const resultRange = this.n.getResultLineRange(range.baseRange);
                appendLinesToResult(resultLines, lineRange_1.$6ib.fromLineNumbers(resultStartLineNumber, Math.max(resultStartLineNumber, resultRange.startLineNumber)));
                resultStartLineNumber = resultRange.endLineNumberExclusive;
                outputLines.push('<<<<<<<');
                if (state.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized) {
                    // to prevent loss of data, use modified result as "ours"
                    appendLinesToResult(resultLines, resultRange);
                }
                else {
                    appendLinesToResult(input1Lines, range.input1Range);
                }
                outputLines.push('=======');
                appendLinesToResult(input2Lines, range.input2Range);
                outputLines.push('>>>>>>>');
            }
            appendLinesToResult(resultLines, lineRange_1.$6ib.fromLineNumbers(resultStartLineNumber, resultLines.length + 1));
            return outputLines.join('\n');
        }
        get conflictCount() {
            return arrayCount(this.modifiedBaseRanges.get(), r => r.isConflicting);
        }
        get combinableConflictCount() {
            return arrayCount(this.modifiedBaseRanges.get(), r => r.isConflicting && r.canBeCombined);
        }
        get conflictsResolvedWithBase() {
            return arrayCount(this.t.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base);
        }
        get conflictsResolvedWithInput1() {
            return arrayCount(this.t.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1);
        }
        get conflictsResolvedWithInput2() {
            return arrayCount(this.t.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2);
        }
        get conflictsResolvedWithSmartCombination() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && state.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualNone() {
            return arrayCount(this.t.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized);
        }
        get manuallySolvedConflictCountThatEqualSmartCombine() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && state.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualInput1() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1;
            });
        }
        get manuallySolvedConflictCountThatEqualInput2() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && !s.previousNonDiffingState?.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart() {
            return arrayCount(this.t.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && s.previousNonDiffingState?.smartCombination;
            });
        }
    };
    exports.$Hjb = $Hjb;
    exports.$Hjb = $Hjb = __decorate([
        __param(7, language_1.$ct),
        __param(8, undoRedo_1.$wu)
    ], $Hjb);
    function arrayCount(array, predicate) {
        let count = 0;
        for (const value of array) {
            if (predicate(value)) {
                count++;
            }
        }
        return count;
    }
    class ModifiedBaseRangeData {
        constructor(c) {
            this.c = c;
            this.accepted = (0, observable_1.observableValue)(`BaseRangeState${this.c.baseRange}`, modifiedBaseRange_1.ModifiedBaseRangeState.base);
            this.handledInput1 = (0, observable_1.observableValue)(`BaseRangeHandledState${this.c.baseRange}.Input1`, false);
            this.handledInput2 = (0, observable_1.observableValue)(`BaseRangeHandledState${this.c.baseRange}.Input2`, false);
            this.computedFromDiffing = false;
            this.previousNonDiffingState = undefined;
            this.handled = (0, observable_1.derived)(this, reader => this.handledInput1.read(reader) && this.handledInput2.read(reader));
        }
    }
    var MergeEditorModelState;
    (function (MergeEditorModelState) {
        MergeEditorModelState[MergeEditorModelState["initializing"] = 1] = "initializing";
        MergeEditorModelState[MergeEditorModelState["upToDate"] = 2] = "upToDate";
        MergeEditorModelState[MergeEditorModelState["updating"] = 3] = "updating";
    })(MergeEditorModelState || (exports.MergeEditorModelState = MergeEditorModelState = {}));
    class MarkAsHandledUndoRedoElement {
        constructor(resource, c, e, f, g) {
            this.resource = resource;
            this.c = c;
            this.e = e;
            this.f = f;
            this.g = g;
            this.code = 'undoMarkAsHandled';
            this.label = (0, nls_1.localize)(1, null);
            this.type = 0 /* UndoRedoElementType.Resource */;
        }
        redo() {
            const mergeEditorModel = this.c.deref();
            if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
                return;
            }
            const state = this.e.deref();
            if (!state) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                state.handledInput1.set(true, tx);
                state.handledInput2.set(true, tx);
            });
        }
        undo() {
            const mergeEditorModel = this.c.deref();
            if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
                return;
            }
            const state = this.e.deref();
            if (!state) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                state.handledInput1.set(this.f, tx);
                state.handledInput2.set(this.g, tx);
            });
        }
    }
});
//# sourceMappingURL=mergeEditorModel.js.map