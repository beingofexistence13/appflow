/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/cursor/cursorCollection", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorContext", "vs/editor/common/cursor/cursorDeleteOperations", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/textModelEvents", "vs/editor/common/viewEvents", "vs/base/common/lifecycle", "vs/editor/common/viewModelEventDispatcher"], function (require, exports, errors_1, strings, cursorCollection_1, cursorCommon_1, cursorContext_1, cursorDeleteOperations_1, cursorTypeOperations_1, range_1, selection_1, textModelEvents_1, viewEvents_1, lifecycle_1, viewModelEventDispatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorsController = void 0;
    class CursorsController extends lifecycle_1.Disposable {
        constructor(model, viewModel, coordinatesConverter, cursorConfig) {
            super();
            this._model = model;
            this._knownModelVersionId = this._model.getVersionId();
            this._viewModel = viewModel;
            this._coordinatesConverter = coordinatesConverter;
            this.context = new cursorContext_1.CursorContext(this._model, this._viewModel, this._coordinatesConverter, cursorConfig);
            this._cursors = new cursorCollection_1.CursorCollection(this.context);
            this._hasFocus = false;
            this._isHandling = false;
            this._compositionState = null;
            this._columnSelectData = null;
            this._autoClosedActions = [];
            this._prevEditOperationType = 0 /* EditOperationType.Other */;
        }
        dispose() {
            this._cursors.dispose();
            this._autoClosedActions = (0, lifecycle_1.dispose)(this._autoClosedActions);
            super.dispose();
        }
        updateConfiguration(cursorConfig) {
            this.context = new cursorContext_1.CursorContext(this._model, this._viewModel, this._coordinatesConverter, cursorConfig);
            this._cursors.updateContext(this.context);
        }
        onLineMappingChanged(eventsCollector) {
            if (this._knownModelVersionId !== this._model.getVersionId()) {
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
            this._hasFocus = hasFocus;
        }
        _validateAutoClosedActions() {
            if (this._autoClosedActions.length > 0) {
                const selections = this._cursors.getSelections();
                for (let i = 0; i < this._autoClosedActions.length; i++) {
                    const autoClosedAction = this._autoClosedActions[i];
                    if (!autoClosedAction.isValid(selections)) {
                        autoClosedAction.dispose();
                        this._autoClosedActions.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        // ------ some getters/setters
        getPrimaryCursorState() {
            return this._cursors.getPrimaryCursor();
        }
        getLastAddedCursorIndex() {
            return this._cursors.getLastAddedCursorIndex();
        }
        getCursorStates() {
            return this._cursors.getAll();
        }
        setStates(eventsCollector, source, reason, states) {
            let reachedMaxCursorCount = false;
            const multiCursorLimit = this.context.cursorConfig.multiCursorLimit;
            if (states !== null && states.length > multiCursorLimit) {
                states = states.slice(0, multiCursorLimit);
                reachedMaxCursorCount = true;
            }
            const oldState = CursorModelState.from(this._model, this);
            this._cursors.setStates(states);
            this._cursors.normalize();
            this._columnSelectData = null;
            this._validateAutoClosedActions();
            return this._emitStateChangedIfNecessary(eventsCollector, source, reason, oldState, reachedMaxCursorCount);
        }
        setCursorColumnSelectData(columnSelectData) {
            this._columnSelectData = columnSelectData;
        }
        revealPrimary(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
            const viewPositions = this._cursors.getViewPositions();
            let revealViewRange = null;
            let revealViewSelections = null;
            if (viewPositions.length > 1) {
                revealViewSelections = this._cursors.getViewSelections();
            }
            else {
                revealViewRange = range_1.Range.fromPositions(viewPositions[0], viewPositions[0]);
            }
            eventsCollector.emitViewEvent(new viewEvents_1.ViewRevealRangeRequestEvent(source, minimalReveal, revealViewRange, revealViewSelections, verticalType, revealHorizontal, scrollType));
        }
        saveState() {
            const result = [];
            const selections = this._cursors.getSelections();
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
            this.setStates(eventsCollector, 'restoreState', 0 /* CursorChangeReason.NotSet */, cursorCommon_1.CursorState.fromModelSelections(desiredSelections));
            this.revealPrimary(eventsCollector, 'restoreState', false, 0 /* VerticalRevealType.Simple */, true, 1 /* editorCommon.ScrollType.Immediate */);
        }
        onModelContentChanged(eventsCollector, event) {
            if (event instanceof textModelEvents_1.ModelInjectedTextChangedEvent) {
                // If injected texts change, the view positions of all cursors need to be updated.
                if (this._isHandling) {
                    // The view positions will be updated when handling finishes
                    return;
                }
                // setStates might remove markers, which could trigger a decoration change.
                // If there are injected text decorations for that line, `onModelContentChanged` is emitted again
                // and an endless recursion happens.
                // _isHandling prevents that.
                this._isHandling = true;
                try {
                    this.setStates(eventsCollector, 'modelChange', 0 /* CursorChangeReason.NotSet */, this.getCursorStates());
                }
                finally {
                    this._isHandling = false;
                }
            }
            else {
                const e = event.rawContentChangedEvent;
                this._knownModelVersionId = e.versionId;
                if (this._isHandling) {
                    return;
                }
                const hadFlushEvent = e.containsEvent(1 /* RawContentChangedType.Flush */);
                this._prevEditOperationType = 0 /* EditOperationType.Other */;
                if (hadFlushEvent) {
                    // a model.setValue() was called
                    this._cursors.dispose();
                    this._cursors = new cursorCollection_1.CursorCollection(this.context);
                    this._validateAutoClosedActions();
                    this._emitStateChangedIfNecessary(eventsCollector, 'model', 1 /* CursorChangeReason.ContentFlush */, null, false);
                }
                else {
                    if (this._hasFocus && e.resultingSelection && e.resultingSelection.length > 0) {
                        const cursorState = cursorCommon_1.CursorState.fromModelSelections(e.resultingSelection);
                        if (this.setStates(eventsCollector, 'modelChange', e.isUndoing ? 5 /* CursorChangeReason.Undo */ : e.isRedoing ? 6 /* CursorChangeReason.Redo */ : 2 /* CursorChangeReason.RecoverFromMarkers */, cursorState)) {
                            this.revealPrimary(eventsCollector, 'modelChange', false, 0 /* VerticalRevealType.Simple */, true, 0 /* editorCommon.ScrollType.Smooth */);
                        }
                    }
                    else {
                        const selectionsFromMarkers = this._cursors.readSelectionFromMarkers();
                        this.setStates(eventsCollector, 'modelChange', 2 /* CursorChangeReason.RecoverFromMarkers */, cursorCommon_1.CursorState.fromModelSelections(selectionsFromMarkers));
                    }
                }
            }
        }
        getSelection() {
            return this._cursors.getPrimaryCursor().modelState.selection;
        }
        getTopMostViewPosition() {
            return this._cursors.getTopMostViewPosition();
        }
        getBottomMostViewPosition() {
            return this._cursors.getBottomMostViewPosition();
        }
        getCursorColumnSelectData() {
            if (this._columnSelectData) {
                return this._columnSelectData;
            }
            const primaryCursor = this._cursors.getPrimaryCursor();
            const viewSelectionStart = primaryCursor.viewState.selectionStart.getStartPosition();
            const viewPosition = primaryCursor.viewState.position;
            return {
                isReal: false,
                fromViewLineNumber: viewSelectionStart.lineNumber,
                fromViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this._viewModel, viewSelectionStart),
                toViewLineNumber: viewPosition.lineNumber,
                toViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this._viewModel, viewPosition),
            };
        }
        getSelections() {
            return this._cursors.getSelections();
        }
        getPosition() {
            return this._cursors.getPrimaryCursor().modelState.position;
        }
        setSelections(eventsCollector, source, selections, reason) {
            this.setStates(eventsCollector, source, reason, cursorCommon_1.CursorState.fromModelSelections(selections));
        }
        getPrevEditOperationType() {
            return this._prevEditOperationType;
        }
        setPrevEditOperationType(type) {
            this._prevEditOperationType = type;
        }
        // ------ auxiliary handling logic
        _pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges) {
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
            const autoClosedCharactersDecorations = this._model.deltaDecorations([], autoClosedCharactersDeltaDecorations);
            const autoClosedEnclosingDecorations = this._model.deltaDecorations([], autoClosedEnclosingDeltaDecorations);
            this._autoClosedActions.push(new AutoClosedAction(this._model, autoClosedCharactersDecorations, autoClosedEnclosingDecorations));
        }
        _executeEditOperation(opResult) {
            if (!opResult) {
                // Nothing to execute
                return;
            }
            if (opResult.shouldPushStackElementBefore) {
                this._model.pushStackElement();
            }
            const result = CommandExecutor.executeCommands(this._model, this._cursors.getSelections(), opResult.commands);
            if (result) {
                // The commands were applied correctly
                this._interpretCommandResult(result);
                // Check for auto-closing closed characters
                const autoClosedCharactersRanges = [];
                const autoClosedEnclosingRanges = [];
                for (let i = 0; i < opResult.commands.length; i++) {
                    const command = opResult.commands[i];
                    if (command instanceof cursorTypeOperations_1.TypeWithAutoClosingCommand && command.enclosingRange && command.closeCharacterRange) {
                        autoClosedCharactersRanges.push(command.closeCharacterRange);
                        autoClosedEnclosingRanges.push(command.enclosingRange);
                    }
                }
                if (autoClosedCharactersRanges.length > 0) {
                    this._pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges);
                }
                this._prevEditOperationType = opResult.type;
            }
            if (opResult.shouldPushStackElementAfter) {
                this._model.pushStackElement();
            }
        }
        _interpretCommandResult(cursorState) {
            if (!cursorState || cursorState.length === 0) {
                cursorState = this._cursors.readSelectionFromMarkers();
            }
            this._columnSelectData = null;
            this._cursors.setSelections(cursorState);
            this._cursors.normalize();
        }
        // -----------------------------------------------------------------------------------------------------------
        // ----- emitting events
        _emitStateChangedIfNecessary(eventsCollector, source, reason, oldState, reachedMaxCursorCount) {
            const newState = CursorModelState.from(this._model, this);
            if (newState.equals(oldState)) {
                return false;
            }
            const selections = this._cursors.getSelections();
            const viewSelections = this._cursors.getViewSelections();
            // Let the view get the event first.
            eventsCollector.emitViewEvent(new viewEvents_1.ViewCursorStateChangedEvent(viewSelections, selections, reason));
            // Only after the view has been notified, let the rest of the world know...
            if (!oldState
                || oldState.cursorState.length !== newState.cursorState.length
                || newState.cursorState.some((newCursorState, i) => !newCursorState.modelState.equals(oldState.cursorState[i].modelState))) {
                const oldSelections = oldState ? oldState.cursorState.map(s => s.modelState.selection) : null;
                const oldModelVersionId = oldState ? oldState.modelVersionId : 0;
                eventsCollector.emitOutgoingEvent(new viewModelEventDispatcher_1.CursorStateChangedEvent(oldSelections, selections, oldModelVersionId, newState.modelVersionId, source || 'keyboard', reason, reachedMaxCursorCount));
            }
            return true;
        }
        // -----------------------------------------------------------------------------------------------------------
        // ----- handlers beyond this point
        _findAutoClosingPairs(edits) {
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
                autoClosingIndices = this._findAutoClosingPairs(edits);
            }
            if (autoClosingIndices) {
                edits[0]._isTracked = true;
            }
            const autoClosedCharactersRanges = [];
            const autoClosedEnclosingRanges = [];
            const selections = this._model.pushEditOperations(this.getSelections(), edits, (undoEdits) => {
                if (autoClosingIndices) {
                    for (let i = 0, len = autoClosingIndices.length; i < len; i++) {
                        const [openCharInnerIndex, closeCharInnerIndex] = autoClosingIndices[i];
                        const undoEdit = undoEdits[i];
                        const lineNumber = undoEdit.range.startLineNumber;
                        const openCharIndex = undoEdit.range.startColumn - 1 + openCharInnerIndex;
                        const closeCharIndex = undoEdit.range.startColumn - 1 + closeCharInnerIndex;
                        autoClosedCharactersRanges.push(new range_1.Range(lineNumber, closeCharIndex + 1, lineNumber, closeCharIndex + 2));
                        autoClosedEnclosingRanges.push(new range_1.Range(lineNumber, openCharIndex + 1, lineNumber, closeCharIndex + 2));
                    }
                }
                const selections = cursorStateComputer(undoEdits);
                if (selections) {
                    // Don't recover the selection from markers because
                    // we know what it should be.
                    this._isHandling = true;
                }
                return selections;
            });
            if (selections) {
                this._isHandling = false;
                this.setSelections(eventsCollector, source, selections, 0 /* CursorChangeReason.NotSet */);
            }
            if (autoClosedCharactersRanges.length > 0) {
                this._pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges);
            }
        }
        _executeEdit(callback, eventsCollector, source, cursorChangeReason = 0 /* CursorChangeReason.NotSet */) {
            if (this.context.cursorConfig.readOnly) {
                // we cannot edit when read only...
                return;
            }
            const oldState = CursorModelState.from(this._model, this);
            this._cursors.stopTrackingSelections();
            this._isHandling = true;
            try {
                this._cursors.ensureValidState();
                callback();
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
            this._isHandling = false;
            this._cursors.startTrackingSelections();
            this._validateAutoClosedActions();
            if (this._emitStateChangedIfNecessary(eventsCollector, source, cursorChangeReason, oldState, false)) {
                this.revealPrimary(eventsCollector, source, false, 0 /* VerticalRevealType.Simple */, true, 0 /* editorCommon.ScrollType.Smooth */);
            }
        }
        getAutoClosedCharacters() {
            return AutoClosedAction.getAllAutoClosedCharacters(this._autoClosedActions);
        }
        startComposition(eventsCollector) {
            this._compositionState = new CompositionState(this._model, this.getSelections());
        }
        endComposition(eventsCollector, source) {
            const compositionOutcome = this._compositionState ? this._compositionState.deduceOutcome(this._model, this.getSelections()) : null;
            this._compositionState = null;
            this._executeEdit(() => {
                if (source === 'keyboard') {
                    // composition finishes, let's check if we need to auto complete if necessary.
                    this._executeEditOperation(cursorTypeOperations_1.TypeOperations.compositionEndWithInterceptors(this._prevEditOperationType, this.context.cursorConfig, this._model, compositionOutcome, this.getSelections(), this.getAutoClosedCharacters()));
                }
            }, eventsCollector, source);
        }
        type(eventsCollector, text, source) {
            this._executeEdit(() => {
                if (source === 'keyboard') {
                    // If this event is coming straight from the keyboard, look for electric characters and enter
                    const len = text.length;
                    let offset = 0;
                    while (offset < len) {
                        const charLength = strings.nextCharLength(text, offset);
                        const chr = text.substr(offset, charLength);
                        // Here we must interpret each typed character individually
                        this._executeEditOperation(cursorTypeOperations_1.TypeOperations.typeWithInterceptors(!!this._compositionState, this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), this.getAutoClosedCharacters(), chr));
                        offset += charLength;
                    }
                }
                else {
                    this._executeEditOperation(cursorTypeOperations_1.TypeOperations.typeWithoutInterceptors(this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), text));
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
                        return new selection_1.Selection(position.lineNumber, position.column + positionDelta, position.lineNumber, position.column + positionDelta);
                    });
                    this.setSelections(eventsCollector, source, newSelections, 0 /* CursorChangeReason.NotSet */);
                }
                return;
            }
            this._executeEdit(() => {
                this._executeEditOperation(cursorTypeOperations_1.TypeOperations.compositionType(this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), text, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
            }, eventsCollector, source);
        }
        paste(eventsCollector, text, pasteOnNewLine, multicursorText, source) {
            this._executeEdit(() => {
                this._executeEditOperation(cursorTypeOperations_1.TypeOperations.paste(this.context.cursorConfig, this._model, this.getSelections(), text, pasteOnNewLine, multicursorText || []));
            }, eventsCollector, source, 4 /* CursorChangeReason.Paste */);
        }
        cut(eventsCollector, source) {
            this._executeEdit(() => {
                this._executeEditOperation(cursorDeleteOperations_1.DeleteOperations.cut(this.context.cursorConfig, this._model, this.getSelections()));
            }, eventsCollector, source);
        }
        executeCommand(eventsCollector, command, source) {
            this._executeEdit(() => {
                this._cursors.killSecondaryCursors();
                this._executeEditOperation(new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, [command], {
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: false
                }));
            }, eventsCollector, source);
        }
        executeCommands(eventsCollector, commands, source) {
            this._executeEdit(() => {
                this._executeEditOperation(new cursorCommon_1.EditOperationResult(0 /* EditOperationType.Other */, commands, {
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: false
                }));
            }, eventsCollector, source);
        }
    }
    exports.CursorsController = CursorsController;
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
            this._model = model;
            this._autoClosedCharactersDecorations = autoClosedCharactersDecorations;
            this._autoClosedEnclosingDecorations = autoClosedEnclosingDecorations;
        }
        dispose() {
            this._autoClosedCharactersDecorations = this._model.deltaDecorations(this._autoClosedCharactersDecorations, []);
            this._autoClosedEnclosingDecorations = this._model.deltaDecorations(this._autoClosedEnclosingDecorations, []);
        }
        getAutoClosedCharactersRanges() {
            const result = [];
            for (let i = 0; i < this._autoClosedCharactersDecorations.length; i++) {
                const decorationRange = this._model.getDecorationRange(this._autoClosedCharactersDecorations[i]);
                if (decorationRange) {
                    result.push(decorationRange);
                }
            }
            return result;
        }
        isValid(selections) {
            const enclosingRanges = [];
            for (let i = 0; i < this._autoClosedEnclosingDecorations.length; i++) {
                const decorationRange = this._model.getDecorationRange(this._autoClosedEnclosingDecorations[i]);
                if (decorationRange) {
                    enclosingRanges.push(decorationRange);
                    if (decorationRange.startLineNumber !== decorationRange.endLineNumber) {
                        // Stop tracking if the range becomes multiline...
                        return false;
                    }
                }
            }
            enclosingRanges.sort(range_1.Range.compareRangesUsingStarts);
            selections.sort(range_1.Range.compareRangesUsingStarts);
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
            const result = this._innerExecuteCommands(ctx, commands);
            for (let i = 0, len = ctx.trackedRanges.length; i < len; i++) {
                ctx.model._setTrackedRange(ctx.trackedRanges[i], null, 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */);
            }
            return result;
        }
        static _innerExecuteCommands(ctx, commands) {
            if (this._arrayIsEmpty(commands)) {
                return null;
            }
            const commandsData = this._getEditOperations(ctx, commands);
            if (commandsData.operations.length === 0) {
                return null;
            }
            const rawOperations = commandsData.operations;
            const loserCursorsMap = this._getLoserCursorMap(rawOperations);
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
                                    return new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                                }
                                return new selection_1.Selection(range.endLineNumber, range.endColumn, range.startLineNumber, range.startColumn);
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
        static _arrayIsEmpty(commands) {
            for (let i = 0, len = commands.length; i < len; i++) {
                if (commands[i]) {
                    return false;
                }
            }
            return true;
        }
        static _getEditOperations(ctx, commands) {
            let operations = [];
            let hadTrackedEditOperation = false;
            for (let i = 0, len = commands.length; i < len; i++) {
                const command = commands[i];
                if (command) {
                    const r = this._getEditOperationsFromCommand(ctx, i, command);
                    operations = operations.concat(r.operations);
                    hadTrackedEditOperation = hadTrackedEditOperation || r.hadTrackedEditOperation;
                }
            }
            return {
                operations: operations,
                hadTrackedEditOperation: hadTrackedEditOperation
            };
        }
        static _getEditOperationsFromCommand(ctx, majorIdentifier, command) {
            // This method acts as a transaction, if the command fails
            // everything it has done is ignored
            const operations = [];
            let operationMinor = 0;
            const addEditOperation = (range, text, forceMoveMarkers = false) => {
                if (range_1.Range.isEmpty(range) && text === '') {
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
                const selection = selection_1.Selection.liftSelection(_selection);
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
                (0, errors_1.onUnexpectedError)(e);
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
        static _getLoserCursorMap(operations) {
            // This is destructive on the array
            operations = operations.slice(0);
            // Sort operations with last one first
            operations.sort((a, b) => {
                // Note the minus!
                return -(range_1.Range.compareRangesUsingEnds(a.range, b.range));
            });
            // Operations can not overlap!
            const loserCursorsMap = {};
            for (let i = 1; i < operations.length; i++) {
                const previousOp = operations[i - 1];
                const currentOp = operations[i];
                if (range_1.Range.getStartPosition(previousOp.range).isBefore(range_1.Range.getEndPosition(currentOp.range))) {
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
        static _capture(textModel, selections) {
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
            this._original = CompositionState._capture(textModel, selections);
        }
        /**
         * Returns the inserted text during this composition.
         * If the composition resulted in existing text being changed (i.e. not a pure insertion) it returns null.
         */
        deduceOutcome(textModel, selections) {
            if (!this._original) {
                return null;
            }
            const current = CompositionState._capture(textModel, selections);
            if (!current) {
                return null;
            }
            if (this._original.length !== current.length) {
                return null;
            }
            const result = [];
            for (let i = 0, len = this._original.length; i < len; i++) {
                result.push(CompositionState._deduceOutcome(this._original[i], current[i]));
            }
            return result;
        }
        static _deduceOutcome(original, current) {
            const commonPrefix = Math.min(original.startSelection, current.startSelection, strings.commonPrefixLength(original.text, current.text));
            const commonSuffix = Math.min(original.text.length - original.endSelection, current.text.length - current.endSelection, strings.commonSuffixLength(original.text, current.text));
            const deletedText = original.text.substring(commonPrefix, original.text.length - commonSuffix);
            const insertedText = current.text.substring(commonPrefix, current.text.length - commonSuffix);
            return new cursorTypeOperations_1.CompositionOutcome(deletedText, original.startSelection - commonPrefix, original.endSelection - commonPrefix, insertedText, current.startSelection - commonPrefix, current.endSelection - commonPrefix);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3IvY3Vyc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSxpQkFBa0IsU0FBUSxzQkFBVTtRQWdCaEQsWUFBWSxLQUFpQixFQUFFLFNBQTZCLEVBQUUsb0JBQTJDLEVBQUUsWUFBaUM7WUFDM0ksS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDZCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN6RyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxzQkFBc0Isa0NBQTBCLENBQUM7UUFDdkQsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxP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