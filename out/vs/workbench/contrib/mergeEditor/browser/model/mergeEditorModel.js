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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/observable", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/nls", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/textModelDiffs", "vs/workbench/contrib/mergeEditor/browser/utils", "./modifiedBaseRange"], function (require, exports, arrays_1, errors_1, observable_1, range_1, language_1, nls_1, undoRedo_1, editorModel_1, lineRange_1, mapping_1, textModelDiffs_1, utils_1, modifiedBaseRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorModelState = exports.MergeEditorModel = void 0;
    let MergeEditorModel = class MergeEditorModel extends editorModel_1.EditorModel {
        constructor(base, input1, input2, resultTextModel, diffComputer, options, telemetry, languageService, undoRedoService) {
            super();
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.resultTextModel = resultTextModel;
            this.diffComputer = diffComputer;
            this.options = options;
            this.telemetry = telemetry;
            this.languageService = languageService;
            this.undoRedoService = undoRedoService;
            this.input1TextModelDiffs = this._register(new textModelDiffs_1.TextModelDiffs(this.base, this.input1.textModel, this.diffComputer));
            this.input2TextModelDiffs = this._register(new textModelDiffs_1.TextModelDiffs(this.base, this.input2.textModel, this.diffComputer));
            this.resultTextModelDiffs = this._register(new textModelDiffs_1.TextModelDiffs(this.base, this.resultTextModel, this.diffComputer));
            this.modifiedBaseRanges = (0, observable_1.derived)(this, (reader) => {
                const input1Diffs = this.input1TextModelDiffs.diffs.read(reader);
                const input2Diffs = this.input2TextModelDiffs.diffs.read(reader);
                return modifiedBaseRange_1.ModifiedBaseRange.fromDiffs(input1Diffs, input2Diffs, this.base, this.input1.textModel, this.input2.textModel);
            });
            this.modifiedBaseRangeResultStates = (0, observable_1.derived)(this, reader => {
                const map = new Map(this.modifiedBaseRanges.read(reader).map((s) => [
                    s, new ModifiedBaseRangeData(s)
                ]));
                return map;
            });
            this.resultSnapshot = this.resultTextModel.createSnapshot();
            this.baseInput1Diffs = this.input1TextModelDiffs.diffs;
            this.baseInput2Diffs = this.input2TextModelDiffs.diffs;
            this.baseResultDiffs = this.resultTextModelDiffs.diffs;
            this.input1ResultMapping = (0, observable_1.derived)(this, reader => {
                return this.getInputResultMapping(this.baseInput1Diffs.read(reader), this.baseResultDiffs.read(reader), this.input1.textModel.getLineCount());
            });
            this.resultInput1Mapping = (0, observable_1.derived)(this, reader => this.input1ResultMapping.read(reader).reverse());
            this.input2ResultMapping = (0, observable_1.derived)(this, reader => {
                return this.getInputResultMapping(this.baseInput2Diffs.read(reader), this.baseResultDiffs.read(reader), this.input2.textModel.getLineCount());
            });
            this.resultInput2Mapping = (0, observable_1.derived)(this, reader => this.input2ResultMapping.read(reader).reverse());
            this.baseResultMapping = (0, observable_1.derived)(this, reader => {
                const map = new mapping_1.DocumentLineRangeMap(this.baseResultDiffs.read(reader), -1);
                return new mapping_1.DocumentLineRangeMap(map.lineRangeMappings.map((m) => m.inputRange.isEmpty || m.outputRange.isEmpty
                    ? new mapping_1.LineRangeMapping(
                    // We can do this because two adjacent diffs have one line in between.
                    m.inputRange.deltaStart(-1), m.outputRange.deltaStart(-1))
                    : m), map.inputLineCount);
            });
            this.resultBaseMapping = (0, observable_1.derived)(this, reader => this.baseResultMapping.read(reader).reverse());
            this.diffComputingState = (0, observable_1.derived)(this, reader => {
                const states = [
                    this.input1TextModelDiffs,
                    this.input2TextModelDiffs,
                    this.resultTextModelDiffs,
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
                    this.input1TextModelDiffs,
                    this.input2TextModelDiffs,
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
            this.firstRun = true;
            this.unhandledConflictsCount = (0, observable_1.derived)(this, reader => {
                const map = this.modifiedBaseRangeResultStates.read(reader);
                let unhandledCount = 0;
                for (const [_key, value] of map) {
                    if (!value.handled.read(reader)) {
                        unhandledCount++;
                    }
                }
                return unhandledCount;
            });
            this.hasUnhandledConflicts = this.unhandledConflictsCount.map(value => /** @description hasUnhandledConflicts */ value > 0);
            this._register((0, observable_1.keepObserved)(this.modifiedBaseRangeResultStates));
            this._register((0, observable_1.keepObserved)(this.input1ResultMapping));
            this._register((0, observable_1.keepObserved)(this.input2ResultMapping));
            const initializePromise = this.initialize();
            this.onInitialized = this.onInitialized.then(async () => {
                await initializePromise;
            });
            initializePromise.then(() => {
                let shouldRecomputeHandledFromAccepted = true;
                this._register((0, observable_1.autorunHandleChanges)({
                    handleChange: (ctx) => {
                        if (ctx.didChange(this.modifiedBaseRangeResultStates)) {
                            shouldRecomputeHandledFromAccepted = true;
                        }
                        return ctx.didChange(this.resultTextModelDiffs.diffs)
                            // Ignore non-text changes as we update the state directly
                            ? ctx.change === 1 /* TextModelDiffChangeReason.textChange */
                            : true;
                    },
                }, (reader) => {
                    /** @description Merge Editor Model: Recompute State From Result */
                    const states = this.modifiedBaseRangeResultStates.read(reader);
                    if (!this.isUpToDate.read(reader)) {
                        return;
                    }
                    const resultDiffs = this.resultTextModelDiffs.diffs.read(reader);
                    (0, observable_1.transaction)(tx => {
                        /** @description Merge Editor Model: Recompute State */
                        this.updateBaseRangeAcceptedState(resultDiffs, states, tx);
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
        async initialize() {
            if (this.options.resetResult) {
                await this.reset();
            }
        }
        async reset() {
            await (0, observable_1.waitForState)(this.inputDiffComputingState, state => state === 2 /* MergeEditorModelState.upToDate */);
            const states = this.modifiedBaseRangeResultStates.get();
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
                        range: new range_1.Range(1, 1, Number.MAX_SAFE_INTEGER, 1),
                        text: this.computeAutoMergedResult()
                    }], () => null);
            });
        }
        computeAutoMergedResult() {
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
                appendLinesToResult(baseLines, lineRange_1.LineRange.fromLineNumbers(baseStartLineNumber, baseRange.baseRange.startLineNumber));
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
            appendLinesToResult(baseLines, lineRange_1.LineRange.fromLineNumbers(baseStartLineNumber, baseLines.length + 1));
            return resultLines.join(this.resultTextModel.getEOL());
        }
        hasBaseRange(baseRange) {
            return this.modifiedBaseRangeResultStates.get().has(baseRange);
        }
        get isApplyingEditInResult() { return this.resultTextModelDiffs.isApplyingChange; }
        getInputResultMapping(inputLinesDiffs, resultDiffs, inputLineCount) {
            const map = mapping_1.DocumentLineRangeMap.betweenOutputs(inputLinesDiffs, resultDiffs, inputLineCount);
            return new mapping_1.DocumentLineRangeMap(map.lineRangeMappings.map((m) => m.inputRange.isEmpty || m.outputRange.isEmpty
                ? new mapping_1.LineRangeMapping(
                // We can do this because two adjacent diffs have one line in between.
                m.inputRange.deltaStart(-1), m.outputRange.deltaStart(-1))
                : m), map.inputLineCount);
        }
        translateInputRangeToBase(input, range) {
            const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
            const map = new mapping_1.DocumentRangeMap(baseInputDiffs.flatMap(d => d.rangeMappings), 0).reverse();
            return map.projectRange(range).outputRange;
        }
        translateBaseRangeToInput(input, range) {
            const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
            const map = new mapping_1.DocumentRangeMap(baseInputDiffs.flatMap(d => d.rangeMappings), 0);
            return map.projectRange(range).outputRange;
        }
        getLineRangeInResult(baseRange, reader) {
            return this.resultTextModelDiffs.getResultLineRange(baseRange, reader);
        }
        translateResultRangeToBase(range) {
            const map = new mapping_1.DocumentRangeMap(this.baseResultDiffs.get().flatMap(d => d.rangeMappings), 0).reverse();
            return map.projectRange(range).outputRange;
        }
        translateBaseRangeToResult(range) {
            const map = new mapping_1.DocumentRangeMap(this.baseResultDiffs.get().flatMap(d => d.rangeMappings), 0);
            return map.projectRange(range).outputRange;
        }
        findModifiedBaseRangesInRange(rangeInBase) {
            // TODO use binary search
            return this.modifiedBaseRanges.get().filter(r => r.baseRange.intersects(rangeInBase));
        }
        updateBaseRangeAcceptedState(resultDiffs, states, tx) {
            const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.leftJoin)(states, resultDiffs, (baseRange, diff) => baseRange[0].baseRange.touches(diff.inputRange)
                ? arrays_1.CompareResult.neitherLessOrGreaterThan
                : lineRange_1.LineRange.compareByStart(baseRange[0].baseRange, diff.inputRange));
            for (const row of baseRangeWithStoreAndTouchingDiffs) {
                const newState = this.computeState(row.left[0], row.rights);
                const data = row.left[1];
                const oldState = data.accepted.get();
                if (!oldState.equals(newState)) {
                    if (!this.firstRun && !data.computedFromDiffing) {
                        // Don't set this on the first run - the first run might be used to restore state.
                        data.computedFromDiffing = true;
                        data.previousNonDiffingState = oldState;
                    }
                    data.accepted.set(newState, tx);
                }
            }
            if (this.firstRun) {
                this.firstRun = false;
            }
        }
        computeState(baseRange, conflictingDiffs) {
            if (conflictingDiffs.length === 0) {
                return modifiedBaseRange_1.ModifiedBaseRangeState.base;
            }
            const conflictingEdits = conflictingDiffs.map((d) => d.getLineEdit());
            function editsAgreeWithDiffs(diffs) {
                return (0, arrays_1.equals)(conflictingEdits, diffs.map((d) => d.getLineEdit()), (a, b) => a.equals(b));
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
                    const resultRange = this.resultTextModelDiffs.getResultLineRange(baseRange.baseRange);
                    const existingLines = resultRange.getLines(this.resultTextModel);
                    if ((0, arrays_1.equals)(edit.newLines, existingLines, (a, b) => a === b)) {
                        return s;
                    }
                }
            }
            return modifiedBaseRange_1.ModifiedBaseRangeState.unrecognized;
        }
        getState(baseRange) {
            const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
            if (!existingState) {
                throw new errors_1.BugIndicatingError('object must be from this instance');
            }
            return existingState.accepted;
        }
        setState(baseRange, state, _markInputAsHandled, tx, _pushStackElement = false) {
            if (!this.isUpToDate.get()) {
                throw new errors_1.BugIndicatingError('Cannot set state while updating');
            }
            const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
            if (!existingState) {
                throw new errors_1.BugIndicatingError('object must be from this instance');
            }
            const conflictingDiffs = this.resultTextModelDiffs.findTouchingDiffs(baseRange.baseRange);
            const group = new undoRedo_1.UndoRedoGroup();
            if (conflictingDiffs) {
                this.resultTextModelDiffs.removeDiffs(conflictingDiffs, tx, group);
            }
            const { edit, effectiveState } = baseRange.getEditForBase(state);
            existingState.accepted.set(effectiveState, tx);
            existingState.previousNonDiffingState = undefined;
            existingState.computedFromDiffing = false;
            const input1Handled = existingState.handledInput1.get();
            const input2Handled = existingState.handledInput2.get();
            if (!input1Handled || !input2Handled) {
                this.undoRedoService.pushElement(new MarkAsHandledUndoRedoElement(this.resultTextModel.uri, new WeakRef(this), new WeakRef(existingState), input1Handled, input2Handled), group);
            }
            if (edit) {
                this.resultTextModel.pushStackElement();
                this.resultTextModelDiffs.applyEditRelativeToOriginal(edit, tx, group);
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
            return this.modifiedBaseRangeResultStates.get().get(baseRange).handled;
        }
        isInputHandled(baseRange, inputNumber) {
            const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
            return inputNumber === 1 ? state.handledInput1 : state.handledInput2;
        }
        setInputHandled(baseRange, inputNumber, handled, tx) {
            const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
            if (state.handled.get() === handled) {
                return;
            }
            const dataRef = new WeakRef(ModifiedBaseRangeData);
            const modelRef = new WeakRef(this);
            this.undoRedoService.pushElement({
                type: 0 /* UndoRedoElementType.Resource */,
                resource: this.resultTextModel.uri,
                code: 'setInputHandled',
                label: (0, nls_1.localize)('setInputHandled', "Set Input Handled"),
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
            const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
            if (state.handled.get() === handled) {
                return;
            }
            state.handledInput1.set(handled, tx);
            state.handledInput2.set(handled, tx);
        }
        setLanguageId(languageId, source) {
            const language = this.languageService.createById(languageId);
            this.base.setLanguage(language, source);
            this.input1.textModel.setLanguage(language, source);
            this.input2.textModel.setLanguage(language, source);
            this.resultTextModel.setLanguage(language, source);
        }
        getInitialResultValue() {
            const chunks = [];
            while (true) {
                const chunk = this.resultSnapshot.read();
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
            const states = this.modifiedBaseRangeResultStates.get();
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
                const resultRange = this.resultTextModelDiffs.getResultLineRange(range.baseRange);
                appendLinesToResult(resultLines, lineRange_1.LineRange.fromLineNumbers(resultStartLineNumber, Math.max(resultStartLineNumber, resultRange.startLineNumber)));
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
            appendLinesToResult(resultLines, lineRange_1.LineRange.fromLineNumbers(resultStartLineNumber, resultLines.length + 1));
            return outputLines.join('\n');
        }
        get conflictCount() {
            return arrayCount(this.modifiedBaseRanges.get(), r => r.isConflicting);
        }
        get combinableConflictCount() {
            return arrayCount(this.modifiedBaseRanges.get(), r => r.isConflicting && r.canBeCombined);
        }
        get conflictsResolvedWithBase() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base);
        }
        get conflictsResolvedWithInput1() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1);
        }
        get conflictsResolvedWithInput2() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2);
        }
        get conflictsResolvedWithSmartCombination() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && state.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualNone() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => r.isConflicting &&
                s.accepted.get().kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized);
        }
        get manuallySolvedConflictCountThatEqualSmartCombine() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && state.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualInput1() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1;
            });
        }
        get manuallySolvedConflictCountThatEqualInput2() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && s.computedFromDiffing && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.base;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input1;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.input2;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && !s.previousNonDiffingState?.smartCombination;
            });
        }
        get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart() {
            return arrayCount(this.modifiedBaseRangeResultStates.get().entries(), ([r, s]) => {
                const state = s.accepted.get();
                return r.isConflicting && state.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === modifiedBaseRange_1.ModifiedBaseRangeStateKind.both && s.previousNonDiffingState?.smartCombination;
            });
        }
    };
    exports.MergeEditorModel = MergeEditorModel;
    exports.MergeEditorModel = MergeEditorModel = __decorate([
        __param(7, language_1.ILanguageService),
        __param(8, undoRedo_1.IUndoRedoService)
    ], MergeEditorModel);
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
        constructor(baseRange) {
            this.baseRange = baseRange;
            this.accepted = (0, observable_1.observableValue)(`BaseRangeState${this.baseRange.baseRange}`, modifiedBaseRange_1.ModifiedBaseRangeState.base);
            this.handledInput1 = (0, observable_1.observableValue)(`BaseRangeHandledState${this.baseRange.baseRange}.Input1`, false);
            this.handledInput2 = (0, observable_1.observableValue)(`BaseRangeHandledState${this.baseRange.baseRange}.Input2`, false);
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
        constructor(resource, mergeEditorModelRef, stateRef, input1Handled, input2Handled) {
            this.resource = resource;
            this.mergeEditorModelRef = mergeEditorModelRef;
            this.stateRef = stateRef;
            this.input1Handled = input1Handled;
            this.input2Handled = input2Handled;
            this.code = 'undoMarkAsHandled';
            this.label = (0, nls_1.localize)('undoMarkAsHandled', 'Undo Mark As Handled');
            this.type = 0 /* UndoRedoElementType.Resource */;
        }
        redo() {
            const mergeEditorModel = this.mergeEditorModelRef.deref();
            if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
                return;
            }
            const state = this.stateRef.deref();
            if (!state) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                state.handledInput1.set(true, tx);
                state.handledInput2.set(true, tx);
            });
        }
        undo() {
            const mergeEditorModel = this.mergeEditorModelRef.deref();
            if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
                return;
            }
            const state = this.stateRef.deref();
            if (!state) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                state.handledInput1.set(this.input1Handled, tx);
                state.handledInput2.set(this.input2Handled, tx);
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvbW9kZWwvbWVyZ2VFZGl0b3JNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEseUJBQVc7UUFxQmhELFlBQ1UsSUFBZ0IsRUFDaEIsTUFBaUIsRUFDakIsTUFBaUIsRUFDakIsZUFBMkIsRUFDbkIsWUFBZ0MsRUFDaEMsT0FBaUMsRUFDbEMsU0FBK0IsRUFDN0IsZUFBa0QsRUFDbEQsZUFBa0Q7WUFFcEUsS0FBSyxFQUFFLENBQUM7WUFWQyxTQUFJLEdBQUosSUFBSSxDQUFZO1lBQ2hCLFdBQU0sR0FBTixNQUFNLENBQVc7WUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBVztZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUNuQixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7WUFDaEMsWUFBTyxHQUFQLE9BQU8sQ0FBMEI7WUFDbEMsY0FBUyxHQUFULFNBQVMsQ0FBc0I7WUFDWixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDakMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBN0JwRCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksK0JBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQy9HLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwrQkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FB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