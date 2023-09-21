/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/cursor/cursorCollection", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorContext", "vs/editor/common/cursor/cursorDeleteOperations", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/textModelEvents", "vs/editor/common/viewEvents", "vs/base/common/lifecycle", "vs/editor/common/viewModelEventDispatcher"], function (require, exports, errors_1, strings, cursorCollection_1, cursorCommon_1, cursorContext_1, cursorDeleteOperations_1, cursorTypeOperations_1, range_1, selection_1, textModelEvents_1, viewEvents_1, lifecycle_1, viewModelEventDispatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bY = void 0;
    class $bY extends lifecycle_1.$kc {
        constructor(model, viewModel, coordinatesConverter, cursorConfig) {
            super();
            this.c = model;
            this.f = this.c.getVersionId();
            this.g = viewModel;
            this.h = coordinatesConverter;
            this.context = new cursorContext_1.$VX(this.c, this.g, this.h, cursorConfig);
            this.n = new cursorCollection_1.$XX(this.context);
            this.t = false;
            this.u = false;
            this.w = null;
            this.y = null;
            this.z = [];
            this.C = 0 /* EditOperationType.Other */;
        }
        dispose() {
            this.n.dispose();
            this.z = (0, lifecycle_1.$fc)(this.z);
            super.dispose();
        }
        updateConfiguration(cursorConfig) {
            this.context = new cursorContext_1.$VX(this.c, this.g, this.h, cursorConfig);
            this.n.updateContext(this.context);
        }
        onLineMappingChanged(eventsCollector) {
            if (this.f !== this.c.getVersionId()) {
                // There are model change events that I didn't yet receive.
                //
                // This can happen when editing the model, and the view model receives the change events first,
                // and the view model emits line mapping changed events, all before the cursor gets a chance to
                // recover from markers.
                //
                // The model change listener above will be called soon and we'll ensure a valid cursor state there.
                return;
            }
            // Ensure valid state
            this.setStates(eventsCollector, 'viewModel', 0 /* CursorChangeReason.NotSet */, this.getCursorStates());
        }
        setHasFocus(hasFocus) {
            this.t = hasFocus;
        }
        D() {
            if (this.z.length > 0) {
                const selections = this.n.getSelections();
                for (let i = 0; i < this.z.length; i++) {
                    const autoClosedAction = this.z[i];
                    if (!autoClosedAction.isValid(selections)) {
                        autoClosedAction.dispose();
                        this.z.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        // ------ some getters/setters
        getPrimaryCursorState() {
            return this.n.getPrimaryCursor();
        }
        getLastAddedCursorIndex() {
            return this.n.getLastAddedCursorIndex();
        }
        getCursorStates() {
            return this.n.getAll();
        }
        setStates(eventsCollector, source, reason, states) {
            let reachedMaxCursorCount = false;
            const multiCursorLimit = this.context.cursorConfig.multiCursorLimit;
            if (states !== null && states.length > multiCursorLimit) {
                states = states.slice(0, multiCursorLimit);
                reachedMaxCursorCount = true;
            }
            const oldState = CursorModelState.from(this.c, this);
            this.n.setStates(states);
            this.n.normalize();
            this.y = null;
            this.D();
            return this.I(eventsCollector, source, reason, oldState, reachedMaxCursorCount);
        }
        setCursorColumnSelectData(columnSelectData) {
            this.y = columnSelectData;
        }
        revealPrimary(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
            const viewPositions = this.n.getViewPositions();
            let revealViewRange = null;
            let revealViewSelections = null;
            if (viewPositions.length > 1) {
                revealViewSelections = this.n.getViewSelections();
            }
            else {
                revealViewRange = range_1.$ks.fromPositions(viewPositions[0], viewPositions[0]);
            }
            eventsCollector.emitViewEvent(new viewEvents_1.$3U(source, minimalReveal, revealViewRange, revealViewSelections, verticalType, revealHorizontal, scrollType));
        }
        saveState() {
            const result = [];
            const selections = this.n.getSelections();
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                result.push({
                    inSelectionMode: !selection.isEmpty(),
                    selectionStart: {
                        lineNumber: selection.selectionStartLineNumber,
                        column: selection.selectionStartColumn,
                    },
                    position: {
                        lineNumber: selection.positionLineNumber,
                        column: selection.positionColumn,
                    }
                });
            }
            return result;
        }
        restoreState(eventsCollector, states) {
            const desiredSelections = [];
            for (let i = 0, len = states.length; i < len; i++) {
                const state = states[i];
                let positionLineNumber = 1;
                let positionColumn = 1;
                // Avoid missing properties on the literal
                if (state.position && state.position.lineNumber) {
                    positionLineNumber = state.position.lineNumber;
                }
                if (state.position && state.position.column) {
                    positionColumn = state.position.column;
                }
                let selectionStartLineNumber = positionLineNumber;
                let selectionStartColumn = positionColumn;
                // Avoid missing properties on the literal
                if (state.selectionStart && state.selectionStart.lineNumber) {
                    selectionStartLineNumber = state.selectionStart.lineNumber;
                }
                if (state.selectionStart && state.selectionStart.column) {
                    selectionStartColumn = state.selectionStart.column;
                }
                desiredSelections.push({
                    selectionStartLineNumber: selectionStartLineNumber,
                    selectionStartColumn: selectionStartColumn,
                    positionLineNumber: positionLineNumber,
                    positionColumn: positionColumn
                });
            }
            this.setStates(eventsCollector, 'restoreState', 0 /* CursorChangeReason.NotSet */, cursorCommon_1.$JU.fromModelSelections(desiredSelections));
            this.revealPrimary(eventsCollector, 'restoreState', false, 0 /* VerticalRevealType.Simple */, true, 1 /* editorCommon.ScrollType.Immediate */);
        }
        onModelContentChanged(eventsCollector, event) {
            if (event instanceof textModelEvents_1.$qu) {
                // If injected texts change, the view positions of all cursors need to be updated.
                if (this.u) {
                    // The view positions will be updated when handling finishes
                    return;
                }
                // setStates might remove markers, which could trigger a decoration change.
                // If there are injected text decorations for that line, `onModelContentChanged` is emitted again
                // and an endless recursion happens.
                // _isHandling prevents that.
                this.u = true;
                try {
                    this.setStates(eventsCollector, 'modelChange', 0 /* CursorChangeReason.NotSet */, this.getCursorStates());
                }
                finally {
                    this.u = false;
                }
            }
            else {
                const e = event.rawContentChangedEvent;
                this.f = e.versionId;
                if (this.u) {
                    return;
                }
                const hadFlushEvent = e.containsEvent(1 /* RawContentChangedType.Flush */);
                this.C = 0 /* EditOperationType.Other */;
                if (hadFlushEvent) {
                    // a model.setValue() was called
                    this.n.dispose();
                    this.n = new cursorCollection_1.$XX(this.context);
                    this.D();
                    this.I(eventsCollector, 'model', 1 /* CursorChangeReason.ContentFlush */, null, false);
                }
                else {
                    if (this.t && e.resultingSelection && e.resultingSelection.length > 0) {
                        const cursorState = cursorCommon_1.$JU.fromModelSelections(e.resultingSelection);
                        if (this.setStates(eventsCollector, 'modelChange', e.isUndoing ? 5 /* CursorChangeReason.Undo */ : e.isRedoing ? 6 /* CursorChangeReason.Redo */ : 2 /* CursorChangeReason.RecoverFromMarkers */, cursorState)) {
                            this.revealPrimary(eventsCollector, 'modelChange', false, 0 /* VerticalRevealType.Simple */, true, 0 /* editorCommon.ScrollType.Smooth */);
                        }
                    }
                    else {
                        const selectionsFromMarkers = this.n.readSelectionFromMarkers();
                        this.setStates(eventsCollector, 'modelChange', 2 /* CursorChangeReason.RecoverFromMarkers */, cursorCommon_1.$JU.fromModelSelections(selectionsFromMarkers));
                    }
                }
            }
        }
        getSelection() {
            return this.n.getPrimaryCursor().modelState.selection;
        }
        getTopMostViewPosition() {
            return this.n.getTopMostViewPosition();
        }
        getBottomMostViewPosition() {
            return this.n.getBottomMostViewPosition();
        }
        getCursorColumnSelectData() {
            if (this.y) {
                return this.y;
            }
            const primaryCursor = this.n.getPrimaryCursor();
            const viewSelectionStart = primaryCursor.viewState.selectionStart.getStartPosition();
            const viewPosition = primaryCursor.viewState.position;
            return {
                isReal: false,
                fromViewLineNumber: viewSelectionStart.lineNumber,
                fromViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this.g, viewSelectionStart),
                toViewLineNumber: viewPosition.lineNumber,
                toViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this.g, viewPosition),
            };
        }
        getSelections() {
            return this.n.getSelections();
        }
        getPosition() {
            return this.n.getPrimaryCursor().modelState.position;
        }
        setSelections(eventsCollector, source, selections, reason) {
            this.setStates(eventsCollector, source, reason, cursorCommon_1.$JU.fromModelSelections(selections));
        }
        getPrevEditOperationType() {
            return this.C;
        }
        setPrevEditOperationType(type) {
            this.C = type;
        }
        // ------ auxiliary handling logic
        F(autoClosedCharactersRanges, autoClosedEnclosingRanges) {
            const autoClosedCharactersDeltaDecorations = [];
            const autoClosedEnclosingDeltaDecorations = [];
            for (let i = 0, len = autoClosedCharactersRanges.length; i < len; i++) {
                autoClosedCharactersDeltaDecorations.push({
                    range: autoClosedCharactersRanges[i],
                    options: {
                        description: 'auto-closed-character',
                        inlineClassName: 'auto-closed-character',
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
                    }
                });
                autoClosedEnclosingDeltaDecorations.push({
                    range: autoClosedEnclosingRanges[i],
                    options: {
                        description: 'auto-closed-enclosing',
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
                    }
                });
            }
            const autoClosedCharactersDecorations = this.c.deltaDecorations([], autoClosedCharactersDeltaDecorations);
            const autoClosedEnclosingDecorations = this.c.deltaDecorations([], autoClosedEnclosingDeltaDecorations);
            this.z.push(new AutoClosedAction(this.c, autoClosedCharactersDecorations, autoClosedEnclosingDecorations));
        }
        G(opResult) {
            if (!opResult) {
                // Nothing to execute
                return;
            }
            if (opResult.shouldPushStackElementBefore) {
                this.c.pushStackElement();
            }
            const result = CommandExecutor.executeCommands(this.c, this.n.getSelections(), opResult.commands);
            if (result) {
                // The commands were applied correctly
                this.H(result);
                // Check for auto-closing closed characters
                const autoClosedCharactersRanges = [];
                const autoClosedEnclosingRanges = [];
                for (let i = 0; i < opResult.commands.length; i++) {
                    const command = opResult.commands[i];
                    if (command instanceof cursorTypeOperations_1.$eW && command.enclosingRange && command.closeCharacterRange) {
                        autoClosedCharactersRanges.push(command.closeCharacterRange);
                        autoClosedEnclosingRanges.push(command.enclosingRange);
                    }
                }
                if (autoClosedCharactersRanges.length > 0) {
                    this.F(autoClosedCharactersRanges, autoClosedEnclosingRanges);
                }
                this.C = opResult.type;
            }
            if (opResult.shouldPushStackElementAfter) {
                this.c.pushStackElement();
            }
        }
        H(cursorState) {
            if (!cursorState || cursorState.length === 0) {
                cursorState = this.n.readSelectionFromMarkers();
            }
            this.y = null;
            this.n.setSelections(cursorState);
            this.n.normalize();
        }
        // -----------------------------------------------------------------------------------------------------------
        // ----- emitting events
        I(eventsCollector, source, reason, oldState, reachedMaxCursorCount) {
            const newState = CursorModelState.from(this.c, this);
            if (newState.equals(oldState)) {
                return false;
            }
            const selections = this.n.getSelections();
            const viewSelections = this.n.getViewSelections();
            // Let the view get the event first.
            eventsCollector.emitViewEvent(new viewEvents_1.$TU(viewSelections, selections, reason));
            // Only after the view has been notified, let the rest of the world know...
            if (!oldState
                || oldState.cursorState.length !== newState.cursorState.length
                || newState.cursorState.some((newCursorState, i) => !newCursorState.modelState.equals(oldState.cursorState[i].modelState))) {
                const oldSelections = oldState ? oldState.cursorState.map(s => s.modelState.selection) : null;
                const oldModelVersionId = oldState ? oldState.modelVersionId : 0;
                eventsCollector.emitOutgoingEvent(new viewModelEventDispatcher_1.$6X(oldSelections, selections, oldModelVersionId, newState.modelVersionId, source || 'keyboard', reason, reachedMaxCursorCount));
            }
            return true;
        }
        // -----------------------------------------------------------------------------------------------------------
        // ----- handlers beyond this point
        J(edits) {
            if (!edits.length) {
                return null;
            }
            const indices = [];
            for (let i = 0, len = edits.length; i < len; i++) {
                const edit = edits[i];
                if (!edit.text || edit.text.indexOf('\n') >= 0) {
                    return null;
                }
                const m = edit.text.match(/([)\]}>'"`])([^)\]}>'"`]*)$/);
                if (!m) {
                    return null;
                }
                const closeChar = m[1];
                const autoClosingPairsCandidates = this.context.cursorConfig.autoClosingPairs.autoClosingPairsCloseSingleChar.get(closeChar);
                if (!autoClosingPairsCandidates || autoClosingPairsCandidates.length !== 1) {
                    return null;
                }
                const openChar = autoClosingPairsCandidates[0].open;
                const closeCharIndex = edit.text.length - m[2].length - 1;
                const openCharIndex = edit.text.lastIndexOf(openChar, closeCharIndex - 1);
                if (openCharIndex === -1) {
                    return null;
                }
                indices.push([openCharIndex, closeCharIndex]);
            }
            return indices;
        }
        executeEdits(eventsCollector, source, edits, cursorStateComputer) {
            let autoClosingIndices = null;
            if (source === 'snippet') {
                autoClosingIndices = this.J(edits);
            }
            if (autoClosingIndices) {
                edits[0]._isTracked = true;
            }
            const autoClosedCharactersRanges = [];
            const autoClosedEnclosingRanges = [];
            const selections = this.c.pushEditOperations(this.getSelections(), edits, (undoEdits) => {
                if (autoClosingIndices) {
                    for (let i = 0, len = autoClosingIndices.length; i < len; i++) {
                        const [openCharInnerIndex, closeCharInnerIndex] = autoClosingIndices[i];
                        const undoEdit = undoEdits[i];
                        const lineNumber = undoEdit.range.startLineNumber;
                        const openCharIndex = undoEdit.range.startColumn - 1 + openCharInnerIndex;
                        const closeCharIndex = undoEdit.range.startColumn - 1 + closeCharInnerIndex;
                        autoClosedCharactersRanges.push(new range_1.$ks(lineNumber, closeCharIndex + 1, lineNumber, closeCharIndex + 2));
                        autoClosedEnclosingRanges.push(new range_1.$ks(lineNumber, openCharIndex + 1, lineNumber, closeCharIndex + 2));
                    }
                }
                const selections = cursorStateComputer(undoEdits);
                if (selections) {
                    // Don't recover the selection from markers because
                    // we know what it should be.
                    this.u = true;
                }
                return selections;
            });
            if (selections) {
                this.u = false;
                this.setSelections(eventsCollector, source, selections, 0 /* CursorChangeReason.NotSet */);
            }
            if (autoClosedCharactersRanges.length > 0) {
                this.F(autoClosedCharactersRanges, autoClosedEnclosingRanges);
            }
        }
        L(callback, eventsCollector, source, cursorChangeReason = 0 /* CursorChangeReason.NotSet */) {
            if (this.context.cursorConfig.readOnly) {
                // we cannot edit when read only...
                return;
            }
            const oldState = CursorModelState.from(this.c, this);
            this.n.stopTrackingSelections();
            this.u = true;
            try {
                this.n.ensureValidState();
                callback();
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
            this.u = false;
            this.n.startTrackingSelections();
            this.D();
            if (this.I(eventsCollector, source, cursorChangeReason, oldState, false)) {
                this.revealPrimary(eventsCollector, source, false, 0 /* VerticalRevealType.Simple */, true, 0 /* editorCommon.ScrollType.Smooth */);
            }
        }
        getAutoClosedCharacters() {
            return AutoClosedAction.getAllAutoClosedCharacters(this.z);
        }
        startComposition(eventsCollector) {
            this.w = new CompositionState(this.c, this.getSelections());
        }
        endComposition(eventsCollector, source) {
            const compositionOutcome = this.w ? this.w.deduceOutcome(this.c, this.getSelections()) : null;
            this.w = null;
            this.L(() => {
                if (source === 'keyboard') {
                    // composition finishes, let's check if we need to auto complete if necessary.
                    this.G(cursorTypeOperations_1.$dW.compositionEndWithInterceptors(this.C, this.context.cursorConfig, this.c, compositionOutcome, this.getSelections(), this.getAutoClosedCharacters()));
                }
            }, eventsCollector, source);
        }
        type(eventsCollector, text, source) {
            this.L(() => {
                if (source === 'keyboard') {
                    // If this event is coming straight from the keyboard, look for electric characters and enter
                    const len = text.length;
                    let offset = 0;
                    while (offset < len) {
                        const charLength = strings.$We(text, offset);
                        const chr = text.substr(offset, charLength);
                        // Here we must interpret each typed character individually
                        this.G(cursorTypeOperations_1.$dW.typeWithInterceptors(!!this.w, this.C, this.context.cursorConfig, this.c, this.getSelections(), this.getAutoClosedCharacters(), chr));
                        offset += charLength;
                    }
                }
                else {
                    this.G(cursorTypeOperations_1.$dW.typeWithoutInterceptors(this.C, this.context.cursorConfig, this.c, this.getSelections(), text));
                }
            }, eventsCollector, source);
        }
        compositionType(eventsCollector, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source) {
            if (text.length === 0 && replacePrevCharCnt === 0 && replaceNextCharCnt === 0) {
                // this edit is a no-op
                if (positionDelta !== 0) {
                    // but it still wants to move the cursor
                    const newSelections = this.getSelections().map(selection => {
                        const position = selection.getPosition();
                        return new selection_1.$ms(position.lineNumber, position.column + positionDelta, position.lineNumber, position.column + positionDelta);
                    });
                    this.setSelections(eventsCollector, source, newSelections, 0 /* CursorChangeReason.NotSet */);
                }
                return;
            }
            this.L(() => {
                this.G(cursorTypeOperations_1.$dW.compositionType(this.C, this.context.cursorConfig, this.c, this.getSelections(), text, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
            }, eventsCollector, source);
        }
        paste(eventsCollector, text, pasteOnNewLine, multicursorText, source) {
            this.L(() => {
                this.G(cursorTypeOperations_1.$dW.paste(this.context.cursorConfig, this.c, this.getSelections(), text, pasteOnNewLine, multicursorText || []));
            }, eventsCollector, source, 4 /* CursorChangeReason.Paste */);
        }
        cut(eventsCollector, source) {
            this.L(() => {
                this.G(cursorDeleteOperations_1.$3V.cut(this.context.cursorConfig, this.c, this.getSelections()));
            }, eventsCollector, source);
        }
        executeCommand(eventsCollector, command, source) {
            this.L(() => {
                this.n.killSecondaryCursors();
                this.G(new cursorCommon_1.$NU(0 /* EditOperationType.Other */, [command], {
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: false
                }));
            }, eventsCollector, source);
        }
        executeCommands(eventsCollector, commands, source) {
            this.L(() => {
                this.G(new cursorCommon_1.$NU(0 /* EditOperationType.Other */, commands, {
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: false
                }));
            }, eventsCollector, source);
        }
    }
    exports.$bY = $bY;
    /**
     * A snapshot of the cursor and the model state
     */
    class CursorModelState {
        static from(model, cursor) {
            return new CursorModelState(model.getVersionId(), cursor.getCursorStates());
        }
        constructor(modelVersionId, cursorState) {
            this.modelVersionId = modelVersionId;
            this.cursorState = cursorState;
        }
        equals(other) {
            if (!other) {
                return false;
            }
            if (this.modelVersionId !== other.modelVersionId) {
                return false;
            }
            if (this.cursorState.length !== other.cursorState.length) {
                return false;
            }
            for (let i = 0, len = this.cursorState.length; i < len; i++) {
                if (!this.cursorState[i].equals(other.cursorState[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    class AutoClosedAction {
        static getAllAutoClosedCharacters(autoClosedActions) {
            let autoClosedCharacters = [];
            for (const autoClosedAction of autoClosedActions) {
                autoClosedCharacters = autoClosedCharacters.concat(autoClosedAction.getAutoClosedCharactersRanges());
            }
            return autoClosedCharacters;
        }
        constructor(model, autoClosedCharactersDecorations, autoClosedEnclosingDecorations) {
            this.c = model;
            this.d = autoClosedCharactersDecorations;
            this.f = autoClosedEnclosingDecorations;
        }
        dispose() {
            this.d = this.c.deltaDecorations(this.d, []);
            this.f = this.c.deltaDecorations(this.f, []);
        }
        getAutoClosedCharactersRanges() {
            const result = [];
            for (let i = 0; i < this.d.length; i++) {
                const decorationRange = this.c.getDecorationRange(this.d[i]);
                if (decorationRange) {
                    result.push(decorationRange);
                }
            }
            return result;
        }
        isValid(selections) {
            const enclosingRanges = [];
            for (let i = 0; i < this.f.length; i++) {
                const decorationRange = this.c.getDecorationRange(this.f[i]);
                if (decorationRange) {
                    enclosingRanges.push(decorationRange);
                    if (decorationRange.startLineNumber !== decorationRange.endLineNumber) {
                        // Stop tracking if the range becomes multiline...
                        return false;
                    }
                }
            }
            enclosingRanges.sort(range_1.$ks.compareRangesUsingStarts);
            selections.sort(range_1.$ks.compareRangesUsingStarts);
            for (let i = 0; i < selections.length; i++) {
                if (i >= enclosingRanges.length) {
                    return false;
                }
                if (!enclosingRanges[i].strictContainsRange(selections[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    class CommandExecutor {
        static executeCommands(model, selectionsBefore, commands) {
            const ctx = {
                model: model,
                selectionsBefore: selectionsBefore,
                trackedRanges: [],
                trackedRangesDirection: []
            };
            const result = this.c(ctx, commands);
            for (let i = 0, len = ctx.trackedRanges.length; i < len; i++) {
                ctx.model._setTrackedRange(ctx.trackedRanges[i], null, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
            }
            return result;
        }
        static c(ctx, commands) {
            if (this.d(commands)) {
                return null;
            }
            const commandsData = this.f(ctx, commands);
            if (commandsData.operations.length === 0) {
                return null;
            }
            const rawOperations = commandsData.operations;
            const loserCursorsMap = this.h(rawOperations);
            if (loserCursorsMap.hasOwnProperty('0')) {
                // These commands are very messed up
                console.warn('Ignoring commands');
                return null;
            }
            // Remove operations belonging to losing cursors
            const filteredOperations = [];
            for (let i = 0, len = rawOperations.length; i < len; i++) {
                if (!loserCursorsMap.hasOwnProperty(rawOperations[i].identifier.major.toString())) {
                    filteredOperations.push(rawOperations[i]);
                }
            }
            // TODO@Alex: find a better way to do this.
            // give the hint that edit operations are tracked to the model
            if (commandsData.hadTrackedEditOperation && filteredOperations.length > 0) {
                filteredOperations[0]._isTracked = true;
            }
            let selectionsAfter = ctx.model.pushEditOperations(ctx.selectionsBefore, filteredOperations, (inverseEditOperations) => {
                const groupedInverseEditOperations = [];
                for (let i = 0; i < ctx.selectionsBefore.length; i++) {
                    groupedInverseEditOperations[i] = [];
                }
                for (const op of inverseEditOperations) {
                    if (!op.identifier) {
                        // perhaps auto whitespace trim edits
                        continue;
                    }
                    groupedInverseEditOperations[op.identifier.major].push(op);
                }
                const minorBasedSorter = (a, b) => {
                    return a.identifier.minor - b.identifier.minor;
                };
                const cursorSelections = [];
                for (let i = 0; i < ctx.selectionsBefore.length; i++) {
                    if (groupedInverseEditOperations[i].length > 0) {
                        groupedInverseEditOperations[i].sort(minorBasedSorter);
                        cursorSelections[i] = commands[i].computeCursorState(ctx.model, {
                            getInverseEditOperations: () => {
                                return groupedInverseEditOperations[i];
                            },
                            getTrackedSelection: (id) => {
                                const idx = parseInt(id, 10);
                                const range = ctx.model._getTrackedRange(ctx.trackedRanges[idx]);
                                if (ctx.trackedRangesDirection[idx] === 0 /* SelectionDirection.LTR */) {
                                    return new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                                }
                                return new selection_1.$ms(range.endLineNumber, range.endColumn, range.startLineNumber, range.startColumn);
                            }
                        });
                    }
                    else {
                        cursorSelections[i] = ctx.selectionsBefore[i];
                    }
                }
                return cursorSelections;
            });
            if (!selectionsAfter) {
                selectionsAfter = ctx.selectionsBefore;
            }
            // Extract losing cursors
            const losingCursors = [];
            for (const losingCursorIndex in loserCursorsMap) {
                if (loserCursorsMap.hasOwnProperty(losingCursorIndex)) {
                    losingCursors.push(parseInt(losingCursorIndex, 10));
                }
            }
            // Sort losing cursors descending
            losingCursors.sort((a, b) => {
                return b - a;
            });
            // Remove losing cursors
            for (const losingCursor of losingCursors) {
                selectionsAfter.splice(losingCursor, 1);
            }
            return selectionsAfter;
        }
        static d(commands) {
            for (let i = 0, len = commands.length; i < len; i++) {
                if (commands[i]) {
                    return false;
                }
            }
            return true;
        }
        static f(ctx, commands) {
            let operations = [];
            let hadTrackedEditOperation = false;
            for (let i = 0, len = commands.length; i < len; i++) {
                const command = commands[i];
                if (command) {
                    const r = this.g(ctx, i, command);
                    operations = operations.concat(r.operations);
                    hadTrackedEditOperation = hadTrackedEditOperation || r.hadTrackedEditOperation;
                }
            }
            return {
                operations: operations,
                hadTrackedEditOperation: hadTrackedEditOperation
            };
        }
        static g(ctx, majorIdentifier, command) {
            // This method acts as a transaction, if the command fails
            // everything it has done is ignored
            const operations = [];
            let operationMinor = 0;
            const addEditOperation = (range, text, forceMoveMarkers = false) => {
                if (range_1.$ks.isEmpty(range) && text === '') {
                    // This command wants to add a no-op => no thank you
                    return;
                }
                operations.push({
                    identifier: {
                        major: majorIdentifier,
                        minor: operationMinor++
                    },
                    range: range,
                    text: text,
                    forceMoveMarkers: forceMoveMarkers,
                    isAutoWhitespaceEdit: command.insertsAutoWhitespace
                });
            };
            let hadTrackedEditOperation = false;
            const addTrackedEditOperation = (selection, text, forceMoveMarkers) => {
                hadTrackedEditOperation = true;
                addEditOperation(selection, text, forceMoveMarkers);
            };
            const trackSelection = (_selection, trackPreviousOnEmpty) => {
                const selection = selection_1.$ms.liftSelection(_selection);
                let stickiness;
                if (selection.isEmpty()) {
                    if (typeof trackPreviousOnEmpty === 'boolean') {
                        if (trackPreviousOnEmpty) {
                            stickiness = 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */;
                        }
                        else {
                            stickiness = 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */;
                        }
                    }
                    else {
                        // Try to lock it with surrounding text
                        const maxLineColumn = ctx.model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn === maxLineColumn) {
                            stickiness = 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */;
                        }
                        else {
                            stickiness = 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */;
                        }
                    }
                }
                else {
                    stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
                }
                const l = ctx.trackedRanges.length;
                const id = ctx.model._setTrackedRange(null, selection, stickiness);
                ctx.trackedRanges[l] = id;
                ctx.trackedRangesDirection[l] = selection.getDirection();
                return l.toString();
            };
            const editOperationBuilder = {
                addEditOperation: addEditOperation,
                addTrackedEditOperation: addTrackedEditOperation,
                trackSelection: trackSelection
            };
            try {
                command.getEditOperations(ctx.model, editOperationBuilder);
            }
            catch (e) {
                // TODO@Alex use notification service if this should be user facing
                // e.friendlyMessage = nls.localize('corrupt.commands', "Unexpected exception while executing command.");
                (0, errors_1.$Y)(e);
                return {
                    operations: [],
                    hadTrackedEditOperation: false
                };
            }
            return {
                operations: operations,
                hadTrackedEditOperation: hadTrackedEditOperation
            };
        }
        static h(operations) {
            // This is destructive on the array
            operations = operations.slice(0);
            // Sort operations with last one first
            operations.sort((a, b) => {
                // Note the minus!
                return -(range_1.$ks.compareRangesUsingEnds(a.range, b.range));
            });
            // Operations can not overlap!
            const loserCursorsMap = {};
            for (let i = 1; i < operations.length; i++) {
                const previousOp = operations[i - 1];
                const currentOp = operations[i];
                if (range_1.$ks.getStartPosition(previousOp.range).isBefore(range_1.$ks.getEndPosition(currentOp.range))) {
                    let loserMajor;
                    if (previousOp.identifier.major > currentOp.identifier.major) {
                        // previousOp loses the battle
                        loserMajor = previousOp.identifier.major;
                    }
                    else {
                        loserMajor = currentOp.identifier.major;
                    }
                    loserCursorsMap[loserMajor.toString()] = true;
                    for (let j = 0; j < operations.length; j++) {
                        if (operations[j].identifier.major === loserMajor) {
                            operations.splice(j, 1);
                            if (j < i) {
                                i--;
                            }
                            j--;
                        }
                    }
                    if (i > 0) {
                        i--;
                    }
                }
            }
            return loserCursorsMap;
        }
    }
    class CompositionLineState {
        constructor(text, startSelection, endSelection) {
            this.text = text;
            this.startSelection = startSelection;
            this.endSelection = endSelection;
        }
    }
    class CompositionState {
        static d(textModel, selections) {
            const result = [];
            for (const selection of selections) {
                if (selection.startLineNumber !== selection.endLineNumber) {
                    return null;
                }
                result.push(new CompositionLineState(textModel.getLineContent(selection.startLineNumber), selection.startColumn - 1, selection.endColumn - 1));
            }
            return result;
        }
        constructor(textModel, selections) {
            this.c = CompositionState.d(textModel, selections);
        }
        /**
         * Returns the inserted text during this composition.
         * If the composition resulted in existing text being changed (i.e. not a pure insertion) it returns null.
         */
        deduceOutcome(textModel, selections) {
            if (!this.c) {
                return null;
            }
            const current = CompositionState.d(textModel, selections);
            if (!current) {
                return null;
            }
            if (this.c.length !== current.length) {
                return null;
            }
            const result = [];
            for (let i = 0, len = this.c.length; i < len; i++) {
                result.push(CompositionState.f(this.c[i], current[i]));
            }
            return result;
        }
        static f(original, current) {
            const commonPrefix = Math.min(original.startSelection, current.startSelection, strings.$Oe(original.text, current.text));
            const commonSuffix = Math.min(original.text.length - original.endSelection, current.text.length - current.endSelection, strings.$Pe(original.text, current.text));
            const deletedText = original.text.substring(commonPrefix, original.text.length - commonSuffix);
            const insertedText = current.text.substring(commonPrefix, current.text.length - commonSuffix);
            return new cursorTypeOperations_1.$fW(deletedText, original.startSelection - commonPrefix, original.endSelection - commonPrefix, insertedText, current.startSelection - commonPrefix, current.endSelection - commonPrefix);
        }
    }
});
//# sourceMappingURL=cursor.js.map