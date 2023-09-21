/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/color", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/common/config/editorOptions", "vs/editor/common/cursor/cursor", "vs/editor/common/cursorCommon", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/textModelEvents", "vs/editor/common/languages", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/textToHtmlTokenizer", "vs/editor/common/viewEvents", "vs/editor/common/viewLayout/viewLayout", "vs/editor/common/viewModel/minimapTokensColorTracker", "vs/editor/common/viewModel", "vs/editor/common/viewModel/viewModelDecorations", "vs/editor/common/viewModelEventDispatcher", "vs/editor/common/viewModel/viewModelLines"], function (require, exports, arrays_1, async_1, color_1, lifecycle_1, platform, strings, editorOptions_1, cursor_1, cursorCommon_1, position_1, range_1, textModelEvents, languages_1, modesRegistry_1, textToHtmlTokenizer_1, viewEvents, viewLayout_1, minimapTokensColorTracker_1, viewModel_1, viewModelDecorations_1, viewModelEventDispatcher_1, viewModelLines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewModel = void 0;
    const USE_IDENTITY_LINES_COLLECTION = true;
    class ViewModel extends lifecycle_1.Disposable {
        constructor(editorId, configuration, model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, scheduleAtNextAnimationFrame, languageConfigurationService, _themeService, _attachedView) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._themeService = _themeService;
            this._attachedView = _attachedView;
            this.hiddenAreasModel = new HiddenAreasModel();
            this.previousHiddenAreas = [];
            this._editorId = editorId;
            this._configuration = configuration;
            this.model = model;
            this._eventDispatcher = new viewModelEventDispatcher_1.ViewModelEventDispatcher();
            this.onEvent = this._eventDispatcher.onEvent;
            this.cursorConfig = new cursorCommon_1.CursorConfiguration(this.model.getLanguageId(), this.model.getOptions(), this._configuration, this.languageConfigurationService);
            this._updateConfigurationViewLineCount = this._register(new async_1.RunOnceScheduler(() => this._updateConfigurationViewLineCountNow(), 0));
            this._hasFocus = false;
            this._viewportStart = ViewportStart.create(this.model);
            if (USE_IDENTITY_LINES_COLLECTION && this.model.isTooLargeForTokenization()) {
                this._lines = new viewModelLines_1.ViewModelLinesFromModelAsIs(this.model);
            }
            else {
                const options = this._configuration.options;
                const fontInfo = options.get(50 /* EditorOption.fontInfo */);
                const wrappingStrategy = options.get(137 /* EditorOption.wrappingStrategy */);
                const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
                const wrappingIndent = options.get(136 /* EditorOption.wrappingIndent */);
                const wordBreak = options.get(128 /* EditorOption.wordBreak */);
                this._lines = new viewModelLines_1.ViewModelLinesFromProjectedModel(this._editorId, this.model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, fontInfo, this.model.getOptions().tabSize, wrappingStrategy, wrappingInfo.wrappingColumn, wrappingIndent, wordBreak);
            }
            this.coordinatesConverter = this._lines.createCoordinatesConverter();
            this._cursor = this._register(new cursor_1.CursorsController(model, this, this.coordinatesConverter, this.cursorConfig));
            this.viewLayout = this._register(new viewLayout_1.ViewLayout(this._configuration, this.getLineCount(), scheduleAtNextAnimationFrame));
            this._register(this.viewLayout.onDidScroll((e) => {
                if (e.scrollTopChanged) {
                    this._handleVisibleLinesChanged();
                }
                if (e.scrollTopChanged) {
                    this._viewportStart.invalidate();
                }
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewScrollChangedEvent(e));
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ScrollChangedEvent(e.oldScrollWidth, e.oldScrollLeft, e.oldScrollHeight, e.oldScrollTop, e.scrollWidth, e.scrollLeft, e.scrollHeight, e.scrollTop));
            }));
            this._register(this.viewLayout.onDidContentSizeChange((e) => {
                this._eventDispatcher.emitOutgoingEvent(e);
            }));
            this._decorations = new viewModelDecorations_1.ViewModelDecorations(this._editorId, this.model, this._configuration, this._lines, this.coordinatesConverter);
            this._registerModelEvents();
            this._register(this._configuration.onDidChangeFast((e) => {
                try {
                    const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                    this._onConfigurationChanged(eventsCollector, e);
                }
                finally {
                    this._eventDispatcher.endEmitViewEvents();
                }
            }));
            this._register(minimapTokensColorTracker_1.MinimapTokensColorTracker.getInstance().onDidChange(() => {
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewTokensColorsChangedEvent());
            }));
            this._register(this._themeService.onDidColorThemeChange((theme) => {
                this._invalidateDecorationsColorCache();
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewThemeChangedEvent(theme));
            }));
            this._updateConfigurationViewLineCountNow();
        }
        dispose() {
            // First remove listeners, as disposing the lines might end up sending
            // model decoration changed events ... and we no longer care about them ...
            super.dispose();
            this._decorations.dispose();
            this._lines.dispose();
            this._viewportStart.dispose();
            this._eventDispatcher.dispose();
        }
        createLineBreaksComputer() {
            return this._lines.createLineBreaksComputer();
        }
        addViewEventHandler(eventHandler) {
            this._eventDispatcher.addViewEventHandler(eventHandler);
        }
        removeViewEventHandler(eventHandler) {
            this._eventDispatcher.removeViewEventHandler(eventHandler);
        }
        _updateConfigurationViewLineCountNow() {
            this._configuration.setViewLineCount(this._lines.getViewLineCount());
        }
        getModelVisibleRanges() {
            const linesViewportData = this.viewLayout.getLinesViewportData();
            const viewVisibleRange = new range_1.Range(linesViewportData.startLineNumber, this.getLineMinColumn(linesViewportData.startLineNumber), linesViewportData.endLineNumber, this.getLineMaxColumn(linesViewportData.endLineNumber));
            const modelVisibleRanges = this._toModelVisibleRanges(viewVisibleRange);
            return modelVisibleRanges;
        }
        visibleLinesStabilized() {
            const modelVisibleRanges = this.getModelVisibleRanges();
            this._attachedView.setVisibleLines(modelVisibleRanges, true);
        }
        _handleVisibleLinesChanged() {
            const modelVisibleRanges = this.getModelVisibleRanges();
            this._attachedView.setVisibleLines(modelVisibleRanges, false);
        }
        setHasFocus(hasFocus) {
            this._hasFocus = hasFocus;
            this._cursor.setHasFocus(hasFocus);
            this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewFocusChangedEvent(hasFocus));
            this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.FocusChangedEvent(!hasFocus, hasFocus));
        }
        onCompositionStart() {
            this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewCompositionStartEvent());
        }
        onCompositionEnd() {
            this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewCompositionEndEvent());
        }
        _captureStableViewport() {
            // We might need to restore the current start view range, so save it (if available)
            // But only if the scroll position is not at the top of the file
            if (this._viewportStart.isValid && this.viewLayout.getCurrentScrollTop() > 0) {
                const previousViewportStartViewPosition = new position_1.Position(this._viewportStart.viewLineNumber, this.getLineMinColumn(this._viewportStart.viewLineNumber));
                const previousViewportStartModelPosition = this.coordinatesConverter.convertViewPositionToModelPosition(previousViewportStartViewPosition);
                return new StableViewport(previousViewportStartModelPosition, this._viewportStart.startLineDelta);
            }
            return new StableViewport(null, 0);
        }
        _onConfigurationChanged(eventsCollector, e) {
            const stableViewport = this._captureStableViewport();
            const options = this._configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingStrategy = options.get(137 /* EditorOption.wrappingStrategy */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const wrappingIndent = options.get(136 /* EditorOption.wrappingIndent */);
            const wordBreak = options.get(128 /* EditorOption.wordBreak */);
            if (this._lines.setWrappingSettings(fontInfo, wrappingStrategy, wrappingInfo.wrappingColumn, wrappingIndent, wordBreak)) {
                eventsCollector.emitViewEvent(new viewEvents.ViewFlushedEvent());
                eventsCollector.emitViewEvent(new viewEvents.ViewLineMappingChangedEvent());
                eventsCollector.emitViewEvent(new viewEvents.ViewDecorationsChangedEvent(null));
                this._cursor.onLineMappingChanged(eventsCollector);
                this._decorations.onLineMappingChanged();
                this.viewLayout.onFlushed(this.getLineCount());
                this._updateConfigurationViewLineCount.schedule();
            }
            if (e.hasChanged(90 /* EditorOption.readOnly */)) {
                // Must read again all decorations due to readOnly filtering
                this._decorations.reset();
                eventsCollector.emitViewEvent(new viewEvents.ViewDecorationsChangedEvent(null));
            }
            eventsCollector.emitViewEvent(new viewEvents.ViewConfigurationChangedEvent(e));
            this.viewLayout.onConfigurationChanged(e);
            stableViewport.recoverViewportStart(this.coordinatesConverter, this.viewLayout);
            if (cursorCommon_1.CursorConfiguration.shouldRecreate(e)) {
                this.cursorConfig = new cursorCommon_1.CursorConfiguration(this.model.getLanguageId(), this.model.getOptions(), this._configuration, this.languageConfigurationService);
                this._cursor.updateConfiguration(this.cursorConfig);
            }
        }
        _registerModelEvents() {
            this._register(this.model.onDidChangeContentOrInjectedText((e) => {
                try {
                    const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                    let hadOtherModelChange = false;
                    let hadModelLineChangeThatChangedLineMapping = false;
                    const changes = (e instanceof textModelEvents.InternalModelContentChangeEvent ? e.rawContentChangedEvent.changes : e.changes);
                    const versionId = (e instanceof textModelEvents.InternalModelContentChangeEvent ? e.rawContentChangedEvent.versionId : null);
                    // Do a first pass to compute line mappings, and a second pass to actually interpret them
                    const lineBreaksComputer = this._lines.createLineBreaksComputer();
                    for (const change of changes) {
                        switch (change.changeType) {
                            case 4 /* textModelEvents.RawContentChangedType.LinesInserted */: {
                                for (let lineIdx = 0; lineIdx < change.detail.length; lineIdx++) {
                                    const line = change.detail[lineIdx];
                                    let injectedText = change.injectedTexts[lineIdx];
                                    if (injectedText) {
                                        injectedText = injectedText.filter(element => (!element.ownerId || element.ownerId === this._editorId));
                                    }
                                    lineBreaksComputer.addRequest(line, injectedText, null);
                                }
                                break;
                            }
                            case 2 /* textModelEvents.RawContentChangedType.LineChanged */: {
                                let injectedText = null;
                                if (change.injectedText) {
                                    injectedText = change.injectedText.filter(element => (!element.ownerId || element.ownerId === this._editorId));
                                }
                                lineBreaksComputer.addRequest(change.detail, injectedText, null);
                                break;
                            }
                        }
                    }
                    const lineBreaks = lineBreaksComputer.finalize();
                    const lineBreakQueue = new arrays_1.ArrayQueue(lineBreaks);
                    for (const change of changes) {
                        switch (change.changeType) {
                            case 1 /* textModelEvents.RawContentChangedType.Flush */: {
                                this._lines.onModelFlushed();
                                eventsCollector.emitViewEvent(new viewEvents.ViewFlushedEvent());
                                this._decorations.reset();
                                this.viewLayout.onFlushed(this.getLineCount());
                                hadOtherModelChange = true;
                                break;
                            }
                            case 3 /* textModelEvents.RawContentChangedType.LinesDeleted */: {
                                const linesDeletedEvent = this._lines.onModelLinesDeleted(versionId, change.fromLineNumber, change.toLineNumber);
                                if (linesDeletedEvent !== null) {
                                    eventsCollector.emitViewEvent(linesDeletedEvent);
                                    this.viewLayout.onLinesDeleted(linesDeletedEvent.fromLineNumber, linesDeletedEvent.toLineNumber);
                                }
                                hadOtherModelChange = true;
                                break;
                            }
                            case 4 /* textModelEvents.RawContentChangedType.LinesInserted */: {
                                const insertedLineBreaks = lineBreakQueue.takeCount(change.detail.length);
                                const linesInsertedEvent = this._lines.onModelLinesInserted(versionId, change.fromLineNumber, change.toLineNumber, insertedLineBreaks);
                                if (linesInsertedEvent !== null) {
                                    eventsCollector.emitViewEvent(linesInsertedEvent);
                                    this.viewLayout.onLinesInserted(linesInsertedEvent.fromLineNumber, linesInsertedEvent.toLineNumber);
                                }
                                hadOtherModelChange = true;
                                break;
                            }
                            case 2 /* textModelEvents.RawContentChangedType.LineChanged */: {
                                const changedLineBreakData = lineBreakQueue.dequeue();
                                const [lineMappingChanged, linesChangedEvent, linesInsertedEvent, linesDeletedEvent] = this._lines.onModelLineChanged(versionId, change.lineNumber, changedLineBreakData);
                                hadModelLineChangeThatChangedLineMapping = lineMappingChanged;
                                if (linesChangedEvent) {
                                    eventsCollector.emitViewEvent(linesChangedEvent);
                                }
                                if (linesInsertedEvent) {
                                    eventsCollector.emitViewEvent(linesInsertedEvent);
                                    this.viewLayout.onLinesInserted(linesInsertedEvent.fromLineNumber, linesInsertedEvent.toLineNumber);
                                }
                                if (linesDeletedEvent) {
                                    eventsCollector.emitViewEvent(linesDeletedEvent);
                                    this.viewLayout.onLinesDeleted(linesDeletedEvent.fromLineNumber, linesDeletedEvent.toLineNumber);
                                }
                                break;
                            }
                            case 5 /* textModelEvents.RawContentChangedType.EOLChanged */: {
                                // Nothing to do. The new version will be accepted below
                                break;
                            }
                        }
                    }
                    if (versionId !== null) {
                        this._lines.acceptVersionId(versionId);
                    }
                    this.viewLayout.onHeightMaybeChanged();
                    if (!hadOtherModelChange && hadModelLineChangeThatChangedLineMapping) {
                        eventsCollector.emitViewEvent(new viewEvents.ViewLineMappingChangedEvent());
                        eventsCollector.emitViewEvent(new viewEvents.ViewDecorationsChangedEvent(null));
                        this._cursor.onLineMappingChanged(eventsCollector);
                        this._decorations.onLineMappingChanged();
                    }
                }
                finally {
                    this._eventDispatcher.endEmitViewEvents();
                }
                // Update the configuration and reset the centered view line
                const viewportStartWasValid = this._viewportStart.isValid;
                this._viewportStart.invalidate();
                this._configuration.setModelLineCount(this.model.getLineCount());
                this._updateConfigurationViewLineCountNow();
                // Recover viewport
                if (!this._hasFocus && this.model.getAttachedEditorCount() >= 2 && viewportStartWasValid) {
                    const modelRange = this.model._getTrackedRange(this._viewportStart.modelTrackedRange);
                    if (modelRange) {
                        const viewPosition = this.coordinatesConverter.convertModelPositionToViewPosition(modelRange.getStartPosition());
                        const viewPositionTop = this.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
                        this.viewLayout.setScrollPosition({ scrollTop: viewPositionTop + this._viewportStart.startLineDelta }, 1 /* ScrollType.Immediate */);
                    }
                }
                try {
                    const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                    if (e instanceof textModelEvents.InternalModelContentChangeEvent) {
                        eventsCollector.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelContentChangedEvent(e.contentChangedEvent));
                    }
                    this._cursor.onModelContentChanged(eventsCollector, e);
                }
                finally {
                    this._eventDispatcher.endEmitViewEvents();
                }
                this._handleVisibleLinesChanged();
            }));
            this._register(this.model.onDidChangeTokens((e) => {
                const viewRanges = [];
                for (let j = 0, lenJ = e.ranges.length; j < lenJ; j++) {
                    const modelRange = e.ranges[j];
                    const viewStartLineNumber = this.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.fromLineNumber, 1)).lineNumber;
                    const viewEndLineNumber = this.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.toLineNumber, this.model.getLineMaxColumn(modelRange.toLineNumber))).lineNumber;
                    viewRanges[j] = {
                        fromLineNumber: viewStartLineNumber,
                        toLineNumber: viewEndLineNumber
                    };
                }
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewTokensChangedEvent(viewRanges));
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelTokensChangedEvent(e));
            }));
            this._register(this.model.onDidChangeLanguageConfiguration((e) => {
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewLanguageConfigurationEvent());
                this.cursorConfig = new cursorCommon_1.CursorConfiguration(this.model.getLanguageId(), this.model.getOptions(), this._configuration, this.languageConfigurationService);
                this._cursor.updateConfiguration(this.cursorConfig);
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelLanguageConfigurationChangedEvent(e));
            }));
            this._register(this.model.onDidChangeLanguage((e) => {
                this.cursorConfig = new cursorCommon_1.CursorConfiguration(this.model.getLanguageId(), this.model.getOptions(), this._configuration, this.languageConfigurationService);
                this._cursor.updateConfiguration(this.cursorConfig);
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelLanguageChangedEvent(e));
            }));
            this._register(this.model.onDidChangeOptions((e) => {
                // A tab size change causes a line mapping changed event => all view parts will repaint OK, no further event needed here
                if (this._lines.setTabSize(this.model.getOptions().tabSize)) {
                    try {
                        const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                        eventsCollector.emitViewEvent(new viewEvents.ViewFlushedEvent());
                        eventsCollector.emitViewEvent(new viewEvents.ViewLineMappingChangedEvent());
                        eventsCollector.emitViewEvent(new viewEvents.ViewDecorationsChangedEvent(null));
                        this._cursor.onLineMappingChanged(eventsCollector);
                        this._decorations.onLineMappingChanged();
                        this.viewLayout.onFlushed(this.getLineCount());
                    }
                    finally {
                        this._eventDispatcher.endEmitViewEvents();
                    }
                    this._updateConfigurationViewLineCount.schedule();
                }
                this.cursorConfig = new cursorCommon_1.CursorConfiguration(this.model.getLanguageId(), this.model.getOptions(), this._configuration, this.languageConfigurationService);
                this._cursor.updateConfiguration(this.cursorConfig);
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelOptionsChangedEvent(e));
            }));
            this._register(this.model.onDidChangeDecorations((e) => {
                this._decorations.onModelDecorationsChanged();
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewDecorationsChangedEvent(e));
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ModelDecorationsChangedEvent(e));
            }));
        }
        setHiddenAreas(ranges, source) {
            this.hiddenAreasModel.setHiddenAreas(source, ranges);
            const mergedRanges = this.hiddenAreasModel.getMergedRanges();
            if (mergedRanges === this.previousHiddenAreas) {
                return;
            }
            this.previousHiddenAreas = mergedRanges;
            const stableViewport = this._captureStableViewport();
            let lineMappingChanged = false;
            try {
                const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                lineMappingChanged = this._lines.setHiddenAreas(mergedRanges);
                if (lineMappingChanged) {
                    eventsCollector.emitViewEvent(new viewEvents.ViewFlushedEvent());
                    eventsCollector.emitViewEvent(new viewEvents.ViewLineMappingChangedEvent());
                    eventsCollector.emitViewEvent(new viewEvents.ViewDecorationsChangedEvent(null));
                    this._cursor.onLineMappingChanged(eventsCollector);
                    this._decorations.onLineMappingChanged();
                    this.viewLayout.onFlushed(this.getLineCount());
                    this.viewLayout.onHeightMaybeChanged();
                }
                stableViewport.recoverViewportStart(this.coordinatesConverter, this.viewLayout);
            }
            finally {
                this._eventDispatcher.endEmitViewEvents();
            }
            this._updateConfigurationViewLineCount.schedule();
            if (lineMappingChanged) {
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.HiddenAreasChangedEvent());
            }
        }
        getVisibleRangesPlusViewportAboveBelow() {
            const layoutInfo = this._configuration.options.get(143 /* EditorOption.layoutInfo */);
            const lineHeight = this._configuration.options.get(66 /* EditorOption.lineHeight */);
            const linesAround = Math.max(20, Math.round(layoutInfo.height / lineHeight));
            const partialData = this.viewLayout.getLinesViewportData();
            const startViewLineNumber = Math.max(1, partialData.completelyVisibleStartLineNumber - linesAround);
            const endViewLineNumber = Math.min(this.getLineCount(), partialData.completelyVisibleEndLineNumber + linesAround);
            return this._toModelVisibleRanges(new range_1.Range(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber)));
        }
        getVisibleRanges() {
            const visibleViewRange = this.getCompletelyVisibleViewRange();
            return this._toModelVisibleRanges(visibleViewRange);
        }
        getHiddenAreas() {
            return this._lines.getHiddenAreas();
        }
        _toModelVisibleRanges(visibleViewRange) {
            const visibleRange = this.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
            const hiddenAreas = this._lines.getHiddenAreas();
            if (hiddenAreas.length === 0) {
                return [visibleRange];
            }
            const result = [];
            let resultLen = 0;
            let startLineNumber = visibleRange.startLineNumber;
            let startColumn = visibleRange.startColumn;
            const endLineNumber = visibleRange.endLineNumber;
            const endColumn = visibleRange.endColumn;
            for (let i = 0, len = hiddenAreas.length; i < len; i++) {
                const hiddenStartLineNumber = hiddenAreas[i].startLineNumber;
                const hiddenEndLineNumber = hiddenAreas[i].endLineNumber;
                if (hiddenEndLineNumber < startLineNumber) {
                    continue;
                }
                if (hiddenStartLineNumber > endLineNumber) {
                    continue;
                }
                if (startLineNumber < hiddenStartLineNumber) {
                    result[resultLen++] = new range_1.Range(startLineNumber, startColumn, hiddenStartLineNumber - 1, this.model.getLineMaxColumn(hiddenStartLineNumber - 1));
                }
                startLineNumber = hiddenEndLineNumber + 1;
                startColumn = 1;
            }
            if (startLineNumber < endLineNumber || (startLineNumber === endLineNumber && startColumn < endColumn)) {
                result[resultLen++] = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
            }
            return result;
        }
        getCompletelyVisibleViewRange() {
            const partialData = this.viewLayout.getLinesViewportData();
            const startViewLineNumber = partialData.completelyVisibleStartLineNumber;
            const endViewLineNumber = partialData.completelyVisibleEndLineNumber;
            return new range_1.Range(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber));
        }
        getCompletelyVisibleViewRangeAtScrollTop(scrollTop) {
            const partialData = this.viewLayout.getLinesViewportDataAtScrollTop(scrollTop);
            const startViewLineNumber = partialData.completelyVisibleStartLineNumber;
            const endViewLineNumber = partialData.completelyVisibleEndLineNumber;
            return new range_1.Range(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber));
        }
        saveState() {
            const compatViewState = this.viewLayout.saveState();
            const scrollTop = compatViewState.scrollTop;
            const firstViewLineNumber = this.viewLayout.getLineNumberAtVerticalOffset(scrollTop);
            const firstPosition = this.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(firstViewLineNumber, this.getLineMinColumn(firstViewLineNumber)));
            const firstPositionDeltaTop = this.viewLayout.getVerticalOffsetForLineNumber(firstViewLineNumber) - scrollTop;
            return {
                scrollLeft: compatViewState.scrollLeft,
                firstPosition: firstPosition,
                firstPositionDeltaTop: firstPositionDeltaTop
            };
        }
        reduceRestoreState(state) {
            if (typeof state.firstPosition === 'undefined') {
                // This is a view state serialized by an older version
                return this._reduceRestoreStateCompatibility(state);
            }
            const modelPosition = this.model.validatePosition(state.firstPosition);
            const viewPosition = this.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            const scrollTop = this.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber) - state.firstPositionDeltaTop;
            return {
                scrollLeft: state.scrollLeft,
                scrollTop: scrollTop
            };
        }
        _reduceRestoreStateCompatibility(state) {
            return {
                scrollLeft: state.scrollLeft,
                scrollTop: state.scrollTopWithoutViewZones
            };
        }
        getTabSize() {
            return this.model.getOptions().tabSize;
        }
        getLineCount() {
            return this._lines.getViewLineCount();
        }
        /**
         * Gives a hint that a lot of requests are about to come in for these line numbers.
         */
        setViewport(startLineNumber, endLineNumber, centeredLineNumber) {
            this._viewportStart.update(this, startLineNumber);
        }
        getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber) {
            return this._lines.getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber);
        }
        getLinesIndentGuides(startLineNumber, endLineNumber) {
            return this._lines.getViewLinesIndentGuides(startLineNumber, endLineNumber);
        }
        getBracketGuidesInRangeByLine(startLineNumber, endLineNumber, activePosition, options) {
            return this._lines.getViewLinesBracketGuides(startLineNumber, endLineNumber, activePosition, options);
        }
        getLineContent(lineNumber) {
            return this._lines.getViewLineContent(lineNumber);
        }
        getLineLength(lineNumber) {
            return this._lines.getViewLineLength(lineNumber);
        }
        getLineMinColumn(lineNumber) {
            return this._lines.getViewLineMinColumn(lineNumber);
        }
        getLineMaxColumn(lineNumber) {
            return this._lines.getViewLineMaxColumn(lineNumber);
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            const result = strings.firstNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 1;
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            const result = strings.lastNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 2;
        }
        getMinimapDecorationsInRange(range) {
            return this._decorations.getMinimapDecorationsInRange(range);
        }
        getDecorationsInViewport(visibleRange) {
            return this._decorations.getDecorationsViewportData(visibleRange).decorations;
        }
        getInjectedTextAt(viewPosition) {
            return this._lines.getInjectedTextAt(viewPosition);
        }
        getViewportViewLineRenderingData(visibleRange, lineNumber) {
            const allInlineDecorations = this._decorations.getDecorationsViewportData(visibleRange).inlineDecorations;
            const inlineDecorations = allInlineDecorations[lineNumber - visibleRange.startLineNumber];
            return this._getViewLineRenderingData(lineNumber, inlineDecorations);
        }
        getViewLineRenderingData(lineNumber) {
            const inlineDecorations = this._decorations.getInlineDecorationsOnLine(lineNumber);
            return this._getViewLineRenderingData(lineNumber, inlineDecorations);
        }
        _getViewLineRenderingData(lineNumber, inlineDecorations) {
            const mightContainRTL = this.model.mightContainRTL();
            const mightContainNonBasicASCII = this.model.mightContainNonBasicASCII();
            const tabSize = this.getTabSize();
            const lineData = this._lines.getViewLineData(lineNumber);
            if (lineData.inlineDecorations) {
                inlineDecorations = [
                    ...inlineDecorations,
                    ...lineData.inlineDecorations.map(d => d.toInlineDecoration(lineNumber))
                ];
            }
            return new viewModel_1.ViewLineRenderingData(lineData.minColumn, lineData.maxColumn, lineData.content, lineData.continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, lineData.tokens, inlineDecorations, tabSize, lineData.startVisibleColumn);
        }
        getViewLineData(lineNumber) {
            return this._lines.getViewLineData(lineNumber);
        }
        getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed) {
            const result = this._lines.getViewLinesData(startLineNumber, endLineNumber, needed);
            return new viewModel_1.MinimapLinesRenderingData(this.getTabSize(), result);
        }
        getAllOverviewRulerDecorations(theme) {
            const decorations = this.model.getOverviewRulerDecorations(this._editorId, (0, editorOptions_1.filterValidationDecorations)(this._configuration.options));
            const result = new OverviewRulerDecorations();
            for (const decoration of decorations) {
                const decorationOptions = decoration.options;
                const opts = decorationOptions.overviewRuler;
                if (!opts) {
                    continue;
                }
                const lane = opts.position;
                if (lane === 0) {
                    continue;
                }
                const color = opts.getColor(theme.value);
                const viewStartLineNumber = this.coordinatesConverter.getViewLineNumberOfModelPosition(decoration.range.startLineNumber, decoration.range.startColumn);
                const viewEndLineNumber = this.coordinatesConverter.getViewLineNumberOfModelPosition(decoration.range.endLineNumber, decoration.range.endColumn);
                result.accept(color, decorationOptions.zIndex, viewStartLineNumber, viewEndLineNumber, lane);
            }
            return result.asArray;
        }
        _invalidateDecorationsColorCache() {
            const decorations = this.model.getOverviewRulerDecorations();
            for (const decoration of decorations) {
                const opts1 = decoration.options.overviewRuler;
                opts1?.invalidateCachedColor();
                const opts2 = decoration.options.minimap;
                opts2?.invalidateCachedColor();
            }
        }
        getValueInRange(range, eol) {
            const modelRange = this.coordinatesConverter.convertViewRangeToModelRange(range);
            return this.model.getValueInRange(modelRange, eol);
        }
        getValueLengthInRange(range, eol) {
            const modelRange = this.coordinatesConverter.convertViewRangeToModelRange(range);
            return this.model.getValueLengthInRange(modelRange, eol);
        }
        modifyPosition(position, offset) {
            const modelPosition = this.coordinatesConverter.convertViewPositionToModelPosition(position);
            return this.model.modifyPosition(modelPosition, offset);
        }
        deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt) {
            const modelAnchor = this.coordinatesConverter.convertViewPositionToModelPosition(viewAnchorPosition);
            if (this.model.getEOL().length === 2) {
                // This model uses CRLF, so the delta must take that into account
                if (deltaOffset < 0) {
                    deltaOffset -= lineFeedCnt;
                }
                else {
                    deltaOffset += lineFeedCnt;
                }
            }
            const modelAnchorOffset = this.model.getOffsetAt(modelAnchor);
            const resultOffset = modelAnchorOffset + deltaOffset;
            return this.model.getPositionAt(resultOffset);
        }
        getPlainTextToCopy(modelRanges, emptySelectionClipboard, forceCRLF) {
            const newLineCharacter = forceCRLF ? '\r\n' : this.model.getEOL();
            modelRanges = modelRanges.slice(0);
            modelRanges.sort(range_1.Range.compareRangesUsingStarts);
            let hasEmptyRange = false;
            let hasNonEmptyRange = false;
            for (const range of modelRanges) {
                if (range.isEmpty()) {
                    hasEmptyRange = true;
                }
                else {
                    hasNonEmptyRange = true;
                }
            }
            if (!hasNonEmptyRange) {
                // all ranges are empty
                if (!emptySelectionClipboard) {
                    return '';
                }
                const modelLineNumbers = modelRanges.map((r) => r.startLineNumber);
                let result = '';
                for (let i = 0; i < modelLineNumbers.length; i++) {
                    if (i > 0 && modelLineNumbers[i - 1] === modelLineNumbers[i]) {
                        continue;
                    }
                    result += this.model.getLineContent(modelLineNumbers[i]) + newLineCharacter;
                }
                return result;
            }
            if (hasEmptyRange && emptySelectionClipboard) {
                // mixed empty selections and non-empty selections
                const result = [];
                let prevModelLineNumber = 0;
                for (const modelRange of modelRanges) {
                    const modelLineNumber = modelRange.startLineNumber;
                    if (modelRange.isEmpty()) {
                        if (modelLineNumber !== prevModelLineNumber) {
                            result.push(this.model.getLineContent(modelLineNumber));
                        }
                    }
                    else {
                        result.push(this.model.getValueInRange(modelRange, forceCRLF ? 2 /* EndOfLinePreference.CRLF */ : 0 /* EndOfLinePreference.TextDefined */));
                    }
                    prevModelLineNumber = modelLineNumber;
                }
                return result.length === 1 ? result[0] : result;
            }
            const result = [];
            for (const modelRange of modelRanges) {
                if (!modelRange.isEmpty()) {
                    result.push(this.model.getValueInRange(modelRange, forceCRLF ? 2 /* EndOfLinePreference.CRLF */ : 0 /* EndOfLinePreference.TextDefined */));
                }
            }
            return result.length === 1 ? result[0] : result;
        }
        getRichTextToCopy(modelRanges, emptySelectionClipboard) {
            const languageId = this.model.getLanguageId();
            if (languageId === modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                return null;
            }
            if (modelRanges.length !== 1) {
                // no multiple selection support at this time
                return null;
            }
            let range = modelRanges[0];
            if (range.isEmpty()) {
                if (!emptySelectionClipboard) {
                    // nothing to copy
                    return null;
                }
                const lineNumber = range.startLineNumber;
                range = new range_1.Range(lineNumber, this.model.getLineMinColumn(lineNumber), lineNumber, this.model.getLineMaxColumn(lineNumber));
            }
            const fontInfo = this._configuration.options.get(50 /* EditorOption.fontInfo */);
            const colorMap = this._getColorMap();
            const hasBadChars = (/[:;\\\/<>]/.test(fontInfo.fontFamily));
            const useDefaultFontFamily = (hasBadChars || fontInfo.fontFamily === editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily);
            let fontFamily;
            if (useDefaultFontFamily) {
                fontFamily = editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            }
            else {
                fontFamily = fontInfo.fontFamily;
                fontFamily = fontFamily.replace(/"/g, '\'');
                const hasQuotesOrIsList = /[,']/.test(fontFamily);
                if (!hasQuotesOrIsList) {
                    const needsQuotes = /[+ ]/.test(fontFamily);
                    if (needsQuotes) {
                        fontFamily = `'${fontFamily}'`;
                    }
                }
                fontFamily = `${fontFamily}, ${editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily}`;
            }
            return {
                mode: languageId,
                html: (`<div style="`
                    + `color: ${colorMap[1 /* ColorId.DefaultForeground */]};`
                    + `background-color: ${colorMap[2 /* ColorId.DefaultBackground */]};`
                    + `font-family: ${fontFamily};`
                    + `font-weight: ${fontInfo.fontWeight};`
                    + `font-size: ${fontInfo.fontSize}px;`
                    + `line-height: ${fontInfo.lineHeight}px;`
                    + `white-space: pre;`
                    + `">`
                    + this._getHTMLToCopy(range, colorMap)
                    + '</div>')
            };
        }
        _getHTMLToCopy(modelRange, colorMap) {
            const startLineNumber = modelRange.startLineNumber;
            const startColumn = modelRange.startColumn;
            const endLineNumber = modelRange.endLineNumber;
            const endColumn = modelRange.endColumn;
            const tabSize = this.getTabSize();
            let result = '';
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineTokens = this.model.tokenization.getLineTokens(lineNumber);
                const lineContent = lineTokens.getLineContent();
                const startOffset = (lineNumber === startLineNumber ? startColumn - 1 : 0);
                const endOffset = (lineNumber === endLineNumber ? endColumn - 1 : lineContent.length);
                if (lineContent === '') {
                    result += '<br>';
                }
                else {
                    result += (0, textToHtmlTokenizer_1.tokenizeLineToHTML)(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, platform.isWindows);
                }
            }
            return result;
        }
        _getColorMap() {
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            const result = ['#000000'];
            if (colorMap) {
                for (let i = 1, len = colorMap.length; i < len; i++) {
                    result[i] = color_1.Color.Format.CSS.formatHex(colorMap[i]);
                }
            }
            return result;
        }
        //#region cursor operations
        getPrimaryCursorState() {
            return this._cursor.getPrimaryCursorState();
        }
        getLastAddedCursorIndex() {
            return this._cursor.getLastAddedCursorIndex();
        }
        getCursorStates() {
            return this._cursor.getCursorStates();
        }
        setCursorStates(source, reason, states) {
            return this._withViewEventsCollector(eventsCollector => this._cursor.setStates(eventsCollector, source, reason, states));
        }
        getCursorColumnSelectData() {
            return this._cursor.getCursorColumnSelectData();
        }
        getCursorAutoClosedCharacters() {
            return this._cursor.getAutoClosedCharacters();
        }
        setCursorColumnSelectData(columnSelectData) {
            this._cursor.setCursorColumnSelectData(columnSelectData);
        }
        getPrevEditOperationType() {
            return this._cursor.getPrevEditOperationType();
        }
        setPrevEditOperationType(type) {
            this._cursor.setPrevEditOperationType(type);
        }
        getSelection() {
            return this._cursor.getSelection();
        }
        getSelections() {
            return this._cursor.getSelections();
        }
        getPosition() {
            return this._cursor.getPrimaryCursorState().modelState.position;
        }
        setSelections(source, selections, reason = 0 /* CursorChangeReason.NotSet */) {
            this._withViewEventsCollector(eventsCollector => this._cursor.setSelections(eventsCollector, source, selections, reason));
        }
        saveCursorState() {
            return this._cursor.saveState();
        }
        restoreCursorState(states) {
            this._withViewEventsCollector(eventsCollector => this._cursor.restoreState(eventsCollector, states));
        }
        _executeCursorEdit(callback) {
            if (this._cursor.context.cursorConfig.readOnly) {
                // we cannot edit when read only...
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ReadOnlyEditAttemptEvent());
                return;
            }
            this._withViewEventsCollector(callback);
        }
        executeEdits(source, edits, cursorStateComputer) {
            this._executeCursorEdit(eventsCollector => this._cursor.executeEdits(eventsCollector, source, edits, cursorStateComputer));
        }
        startComposition() {
            this._executeCursorEdit(eventsCollector => this._cursor.startComposition(eventsCollector));
        }
        endComposition(source) {
            this._executeCursorEdit(eventsCollector => this._cursor.endComposition(eventsCollector, source));
        }
        type(text, source) {
            this._executeCursorEdit(eventsCollector => this._cursor.type(eventsCollector, text, source));
        }
        compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source) {
            this._executeCursorEdit(eventsCollector => this._cursor.compositionType(eventsCollector, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source));
        }
        paste(text, pasteOnNewLine, multicursorText, source) {
            this._executeCursorEdit(eventsCollector => this._cursor.paste(eventsCollector, text, pasteOnNewLine, multicursorText, source));
        }
        cut(source) {
            this._executeCursorEdit(eventsCollector => this._cursor.cut(eventsCollector, source));
        }
        executeCommand(command, source) {
            this._executeCursorEdit(eventsCollector => this._cursor.executeCommand(eventsCollector, command, source));
        }
        executeCommands(commands, source) {
            this._executeCursorEdit(eventsCollector => this._cursor.executeCommands(eventsCollector, commands, source));
        }
        revealPrimaryCursor(source, revealHorizontal, minimalReveal = false) {
            this._withViewEventsCollector(eventsCollector => this._cursor.revealPrimary(eventsCollector, source, minimalReveal, 0 /* viewEvents.VerticalRevealType.Simple */, revealHorizontal, 0 /* ScrollType.Smooth */));
        }
        revealTopMostCursor(source) {
            const viewPosition = this._cursor.getTopMostViewPosition();
            const viewRange = new range_1.Range(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
            this._withViewEventsCollector(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.ViewRevealRangeRequestEvent(source, false, viewRange, null, 0 /* viewEvents.VerticalRevealType.Simple */, true, 0 /* ScrollType.Smooth */)));
        }
        revealBottomMostCursor(source) {
            const viewPosition = this._cursor.getBottomMostViewPosition();
            const viewRange = new range_1.Range(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
            this._withViewEventsCollector(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.ViewRevealRangeRequestEvent(source, false, viewRange, null, 0 /* viewEvents.VerticalRevealType.Simple */, true, 0 /* ScrollType.Smooth */)));
        }
        revealRange(source, revealHorizontal, viewRange, verticalType, scrollType) {
            this._withViewEventsCollector(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.ViewRevealRangeRequestEvent(source, false, viewRange, null, verticalType, revealHorizontal, scrollType)));
        }
        //#endregion
        //#region viewLayout
        changeWhitespace(callback) {
            const hadAChange = this.viewLayout.changeWhitespace(callback);
            if (hadAChange) {
                this._eventDispatcher.emitSingleViewEvent(new viewEvents.ViewZonesChangedEvent());
                this._eventDispatcher.emitOutgoingEvent(new viewModelEventDispatcher_1.ViewZonesChangedEvent());
            }
        }
        //#endregion
        _withViewEventsCollector(callback) {
            try {
                const eventsCollector = this._eventDispatcher.beginEmitViewEvents();
                return callback(eventsCollector);
            }
            finally {
                this._eventDispatcher.endEmitViewEvents();
            }
        }
        normalizePosition(position, affinity) {
            return this._lines.normalizePosition(position, affinity);
        }
        /**
         * Gets the column at which indentation stops at a given line.
         * @internal
        */
        getLineIndentColumn(lineNumber) {
            return this._lines.getLineIndentColumn(lineNumber);
        }
    }
    exports.ViewModel = ViewModel;
    class ViewportStart {
        static create(model) {
            const viewportStartLineTrackedRange = model._setTrackedRange(null, new range_1.Range(1, 1, 1, 1), 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            return new ViewportStart(model, 1, false, viewportStartLineTrackedRange, 0);
        }
        get viewLineNumber() {
            return this._viewLineNumber;
        }
        get isValid() {
            return this._isValid;
        }
        get modelTrackedRange() {
            return this._modelTrackedRange;
        }
        get startLineDelta() {
            return this._startLineDelta;
        }
        constructor(_model, _viewLineNumber, _isValid, _modelTrackedRange, _startLineDelta) {
            this._model = _model;
            this._viewLineNumber = _viewLineNumber;
            this._isValid = _isValid;
            this._modelTrackedRange = _modelTrackedRange;
            this._startLineDelta = _startLineDelta;
        }
        dispose() {
            this._model._setTrackedRange(this._modelTrackedRange, null, 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
        }
        update(viewModel, startLineNumber) {
            const position = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(startLineNumber, viewModel.getLineMinColumn(startLineNumber)));
            const viewportStartLineTrackedRange = viewModel.model._setTrackedRange(this._modelTrackedRange, new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column), 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            const viewportStartLineTop = viewModel.viewLayout.getVerticalOffsetForLineNumber(startLineNumber);
            const scrollTop = viewModel.viewLayout.getCurrentScrollTop();
            this._viewLineNumber = startLineNumber;
            this._isValid = true;
            this._modelTrackedRange = viewportStartLineTrackedRange;
            this._startLineDelta = scrollTop - viewportStartLineTop;
        }
        invalidate() {
            this._isValid = false;
        }
    }
    class OverviewRulerDecorations {
        constructor() {
            this._asMap = Object.create(null);
            this.asArray = [];
        }
        accept(color, zIndex, startLineNumber, endLineNumber, lane) {
            const prevGroup = this._asMap[color];
            if (prevGroup) {
                const prevData = prevGroup.data;
                const prevLane = prevData[prevData.length - 3];
                const prevEndLineNumber = prevData[prevData.length - 1];
                if (prevLane === lane && prevEndLineNumber + 1 >= startLineNumber) {
                    // merge into prev
                    if (endLineNumber > prevEndLineNumber) {
                        prevData[prevData.length - 1] = endLineNumber;
                    }
                    return;
                }
                // push
                prevData.push(lane, startLineNumber, endLineNumber);
            }
            else {
                const group = new viewModel_1.OverviewRulerDecorationsGroup(color, zIndex, [lane, startLineNumber, endLineNumber]);
                this._asMap[color] = group;
                this.asArray.push(group);
            }
        }
    }
    class HiddenAreasModel {
        constructor() {
            this.hiddenAreas = new Map();
            this.shouldRecompute = false;
            this.ranges = [];
        }
        setHiddenAreas(source, ranges) {
            const existing = this.hiddenAreas.get(source);
            if (existing && rangeArraysEqual(existing, ranges)) {
                return;
            }
            this.hiddenAreas.set(source, ranges);
            this.shouldRecompute = true;
        }
        /**
         * The returned array is immutable.
        */
        getMergedRanges() {
            if (!this.shouldRecompute) {
                return this.ranges;
            }
            this.shouldRecompute = false;
            const newRanges = Array.from(this.hiddenAreas.values()).reduce((r, hiddenAreas) => mergeLineRangeArray(r, hiddenAreas), []);
            if (rangeArraysEqual(this.ranges, newRanges)) {
                return this.ranges;
            }
            this.ranges = newRanges;
            return this.ranges;
        }
    }
    function mergeLineRangeArray(arr1, arr2) {
        const result = [];
        let i = 0;
        let j = 0;
        while (i < arr1.length && j < arr2.length) {
            const item1 = arr1[i];
            const item2 = arr2[j];
            if (item1.endLineNumber < item2.startLineNumber - 1) {
                result.push(arr1[i++]);
            }
            else if (item2.endLineNumber < item1.startLineNumber - 1) {
                result.push(arr2[j++]);
            }
            else {
                const startLineNumber = Math.min(item1.startLineNumber, item2.startLineNumber);
                const endLineNumber = Math.max(item1.endLineNumber, item2.endLineNumber);
                result.push(new range_1.Range(startLineNumber, 1, endLineNumber, 1));
                i++;
                j++;
            }
        }
        while (i < arr1.length) {
            result.push(arr1[i++]);
        }
        while (j < arr2.length) {
            result.push(arr2[j++]);
        }
        return result;
    }
    function rangeArraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (!arr1[i].equalsRange(arr2[i])) {
                return false;
            }
        }
        return true;
    }
    /**
     * Maintain a stable viewport by trying to keep the first line in the viewport constant.
     */
    class StableViewport {
        constructor(viewportStartModelPosition, startLineDelta) {
            this.viewportStartModelPosition = viewportStartModelPosition;
            this.startLineDelta = startLineDelta;
        }
        recoverViewportStart(coordinatesConverter, viewLayout) {
            if (!this.viewportStartModelPosition) {
                return;
            }
            const viewPosition = coordinatesConverter.convertModelPositionToViewPosition(this.viewportStartModelPosition);
            const viewPositionTop = viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
            viewLayout.setScrollPosition({ scrollTop: viewPositionTop + this.startLineDelta }, 1 /* ScrollType.Immediate */);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld01vZGVsL3ZpZXdNb2RlbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUNoRyxNQUFNLDZCQUE2QixHQUFHLElBQUksQ0FBQztJQUUzQyxNQUFhLFNBQVUsU0FBUSxzQkFBVTtRQWlCeEMsWUFDQyxRQUFnQixFQUNoQixhQUFtQyxFQUNuQyxLQUFpQixFQUNqQiw0QkFBd0QsRUFDeEQsa0NBQThELEVBQzlELDRCQUFtRSxFQUNsRCw0QkFBMkQsRUFDM0QsYUFBNEIsRUFDNUIsYUFBNEI7WUFFN0MsS0FBSyxFQUFFLENBQUM7WUFKUyxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBQzNELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBNFk3QixxQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDbkQsd0JBQW1CLEdBQXFCLEVBQUUsQ0FBQztZQXpZbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7WUFDN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGtDQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyw0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