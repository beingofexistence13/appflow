/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/color", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/common/config/editorOptions", "vs/editor/common/cursor/cursor", "vs/editor/common/cursorCommon", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/textModelEvents", "vs/editor/common/languages", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/textToHtmlTokenizer", "vs/editor/common/viewEvents", "vs/editor/common/viewLayout/viewLayout", "vs/editor/common/viewModel/minimapTokensColorTracker", "vs/editor/common/viewModel", "vs/editor/common/viewModel/viewModelDecorations", "vs/editor/common/viewModelEventDispatcher", "vs/editor/common/viewModel/viewModelLines"], function (require, exports, arrays_1, async_1, color_1, lifecycle_1, platform, strings, editorOptions_1, cursor_1, cursorCommon_1, position_1, range_1, textModelEvents, languages_1, modesRegistry_1, textToHtmlTokenizer_1, viewEvents, viewLayout_1, minimapTokensColorTracker_1, viewModel_1, viewModelDecorations_1, viewModelEventDispatcher_1, viewModelLines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qY = void 0;
    const USE_IDENTITY_LINES_COLLECTION = true;
    class $qY extends lifecycle_1.$kc {
        constructor(editorId, configuration, model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, scheduleAtNextAnimationFrame, t, u, w) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.H = new HiddenAreasModel();
            this.I = [];
            this.a = editorId;
            this.b = configuration;
            this.model = model;
            this.c = new viewModelEventDispatcher_1.$YX();
            this.onEvent = this.c.onEvent;
            this.cursorConfig = new cursorCommon_1.$IU(this.model.getLanguageId(), this.model.getOptions(), this.b, this.t);
            this.f = this.B(new async_1.$Sg(() => this.y(), 0));
            this.g = false;
            this.h = ViewportStart.create(this.model);
            if (USE_IDENTITY_LINES_COLLECTION && this.model.isTooLargeForTokenization()) {
                this.m = new viewModelLines_1.$lY(this.model);
            }
            else {
                const options = this.b.options;
                const fontInfo = options.get(50 /* EditorOption.fontInfo */);
                const wrappingStrategy = options.get(137 /* EditorOption.wrappingStrategy */);
                const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
                const wrappingIndent = options.get(136 /* EditorOption.wrappingIndent */);
                const wordBreak = options.get(128 /* EditorOption.wordBreak */);
                this.m = new viewModelLines_1.$kY(this.a, this.model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, fontInfo, this.model.getOptions().tabSize, wrappingStrategy, wrappingInfo.wrappingColumn, wrappingIndent, wordBreak);
            }
            this.coordinatesConverter = this.m.createCoordinatesConverter();
            this.n = this.B(new cursor_1.$bY(model, this, this.coordinatesConverter, this.cursorConfig));
            this.viewLayout = this.B(new viewLayout_1.$iY(this.b, this.getLineCount(), scheduleAtNextAnimationFrame));
            this.B(this.viewLayout.onDidScroll((e) => {
                if (e.scrollTopChanged) {
                    this.C();
                }
                if (e.scrollTopChanged) {
                    this.h.invalidate();
                }
                this.c.emitSingleViewEvent(new viewEvents.$4U(e));
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$3X(e.oldScrollWidth, e.oldScrollLeft, e.oldScrollHeight, e.oldScrollTop, e.scrollWidth, e.scrollLeft, e.scrollHeight, e.scrollTop));
            }));
            this.B(this.viewLayout.onDidContentSizeChange((e) => {
                this.c.emitOutgoingEvent(e);
            }));
            this.s = new viewModelDecorations_1.$mY(this.a, this.model, this.b, this.m, this.coordinatesConverter);
            this.G();
            this.B(this.b.onDidChangeFast((e) => {
                try {
                    const eventsCollector = this.c.beginEmitViewEvents();
                    this.F(eventsCollector, e);
                }
                finally {
                    this.c.endEmitViewEvents();
                }
            }));
            this.B(minimapTokensColorTracker_1.$FX.getInstance().onDidChange(() => {
                this.c.emitSingleViewEvent(new viewEvents.$7U());
            }));
            this.B(this.u.onDidColorThemeChange((theme) => {
                this.O();
                this.c.emitSingleViewEvent(new viewEvents.$5U(theme));
            }));
            this.y();
        }
        dispose() {
            // First remove listeners, as disposing the lines might end up sending
            // model decoration changed events ... and we no longer care about them ...
            super.dispose();
            this.s.dispose();
            this.m.dispose();
            this.h.dispose();
            this.c.dispose();
        }
        createLineBreaksComputer() {
            return this.m.createLineBreaksComputer();
        }
        addViewEventHandler(eventHandler) {
            this.c.addViewEventHandler(eventHandler);
        }
        removeViewEventHandler(eventHandler) {
            this.c.removeViewEventHandler(eventHandler);
        }
        y() {
            this.b.setViewLineCount(this.m.getViewLineCount());
        }
        z() {
            const linesViewportData = this.viewLayout.getLinesViewportData();
            const viewVisibleRange = new range_1.$ks(linesViewportData.startLineNumber, this.getLineMinColumn(linesViewportData.startLineNumber), linesViewportData.endLineNumber, this.getLineMaxColumn(linesViewportData.endLineNumber));
            const modelVisibleRanges = this.J(viewVisibleRange);
            return modelVisibleRanges;
        }
        visibleLinesStabilized() {
            const modelVisibleRanges = this.z();
            this.w.setVisibleLines(modelVisibleRanges, true);
        }
        C() {
            const modelVisibleRanges = this.z();
            this.w.setVisibleLines(modelVisibleRanges, false);
        }
        setHasFocus(hasFocus) {
            this.g = hasFocus;
            this.n.setHasFocus(hasFocus);
            this.c.emitSingleViewEvent(new viewEvents.$WU(hasFocus));
            this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$2X(!hasFocus, hasFocus));
        }
        onCompositionStart() {
            this.c.emitSingleViewEvent(new viewEvents.$QU());
        }
        onCompositionEnd() {
            this.c.emitSingleViewEvent(new viewEvents.$RU());
        }
        D() {
            // We might need to restore the current start view range, so save it (if available)
            // But only if the scroll position is not at the top of the file
            if (this.h.isValid && this.viewLayout.getCurrentScrollTop() > 0) {
                const previousViewportStartViewPosition = new position_1.$js(this.h.viewLineNumber, this.getLineMinColumn(this.h.viewLineNumber));
                const previousViewportStartModelPosition = this.coordinatesConverter.convertViewPositionToModelPosition(previousViewportStartViewPosition);
                return new StableViewport(previousViewportStartModelPosition, this.h.startLineDelta);
            }
            return new StableViewport(null, 0);
        }
        F(eventsCollector, e) {
            const stableViewport = this.D();
            const options = this.b.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const wrappingStrategy = options.get(137 /* EditorOption.wrappingStrategy */);
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const wrappingIndent = options.get(136 /* EditorOption.wrappingIndent */);
            const wordBreak = options.get(128 /* EditorOption.wordBreak */);
            if (this.m.setWrappingSettings(fontInfo, wrappingStrategy, wrappingInfo.wrappingColumn, wrappingIndent, wordBreak)) {
                eventsCollector.emitViewEvent(new viewEvents.$VU());
                eventsCollector.emitViewEvent(new viewEvents.$YU());
                eventsCollector.emitViewEvent(new viewEvents.$UU(null));
                this.n.onLineMappingChanged(eventsCollector);
                this.s.onLineMappingChanged();
                this.viewLayout.onFlushed(this.getLineCount());
                this.f.schedule();
            }
            if (e.hasChanged(90 /* EditorOption.readOnly */)) {
                // Must read again all decorations due to readOnly filtering
                this.s.reset();
                eventsCollector.emitViewEvent(new viewEvents.$UU(null));
            }
            eventsCollector.emitViewEvent(new viewEvents.$SU(e));
            this.viewLayout.onConfigurationChanged(e);
            stableViewport.recoverViewportStart(this.coordinatesConverter, this.viewLayout);
            if (cursorCommon_1.$IU.shouldRecreate(e)) {
                this.cursorConfig = new cursorCommon_1.$IU(this.model.getLanguageId(), this.model.getOptions(), this.b, this.t);
                this.n.updateConfiguration(this.cursorConfig);
            }
        }
        G() {
            this.B(this.model.onDidChangeContentOrInjectedText((e) => {
                try {
                    const eventsCollector = this.c.beginEmitViewEvents();
                    let hadOtherModelChange = false;
                    let hadModelLineChangeThatChangedLineMapping = false;
                    const changes = (e instanceof textModelEvents.$ru ? e.rawContentChangedEvent.changes : e.changes);
                    const versionId = (e instanceof textModelEvents.$ru ? e.rawContentChangedEvent.versionId : null);
                    // Do a first pass to compute line mappings, and a second pass to actually interpret them
                    const lineBreaksComputer = this.m.createLineBreaksComputer();
                    for (const change of changes) {
                        switch (change.changeType) {
                            case 4 /* textModelEvents.RawContentChangedType.LinesInserted */: {
                                for (let lineIdx = 0; lineIdx < change.detail.length; lineIdx++) {
                                    const line = change.detail[lineIdx];
                                    let injectedText = change.injectedTexts[lineIdx];
                                    if (injectedText) {
                                        injectedText = injectedText.filter(element => (!element.ownerId || element.ownerId === this.a));
                                    }
                                    lineBreaksComputer.addRequest(line, injectedText, null);
                                }
                                break;
                            }
                            case 2 /* textModelEvents.RawContentChangedType.LineChanged */: {
                                let injectedText = null;
                                if (change.injectedText) {
                                    injectedText = change.injectedText.filter(element => (!element.ownerId || element.ownerId === this.a));
                                }
                                lineBreaksComputer.addRequest(change.detail, injectedText, null);
                                break;
                            }
                        }
                    }
                    const lineBreaks = lineBreaksComputer.finalize();
                    const lineBreakQueue = new arrays_1.$0b(lineBreaks);
                    for (const change of changes) {
                        switch (change.changeType) {
                            case 1 /* textModelEvents.RawContentChangedType.Flush */: {
                                this.m.onModelFlushed();
                                eventsCollector.emitViewEvent(new viewEvents.$VU());
                                this.s.reset();
                                this.viewLayout.onFlushed(this.getLineCount());
                                hadOtherModelChange = true;
                                break;
                            }
                            case 3 /* textModelEvents.RawContentChangedType.LinesDeleted */: {
                                const linesDeletedEvent = this.m.onModelLinesDeleted(versionId, change.fromLineNumber, change.toLineNumber);
                                if (linesDeletedEvent !== null) {
                                    eventsCollector.emitViewEvent(linesDeletedEvent);
                                    this.viewLayout.onLinesDeleted(linesDeletedEvent.fromLineNumber, linesDeletedEvent.toLineNumber);
                                }
                                hadOtherModelChange = true;
                                break;
                            }
                            case 4 /* textModelEvents.RawContentChangedType.LinesInserted */: {
                                const insertedLineBreaks = lineBreakQueue.takeCount(change.detail.length);
                                const linesInsertedEvent = this.m.onModelLinesInserted(versionId, change.fromLineNumber, change.toLineNumber, insertedLineBreaks);
                                if (linesInsertedEvent !== null) {
                                    eventsCollector.emitViewEvent(linesInsertedEvent);
                                    this.viewLayout.onLinesInserted(linesInsertedEvent.fromLineNumber, linesInsertedEvent.toLineNumber);
                                }
                                hadOtherModelChange = true;
                                break;
                            }
                            case 2 /* textModelEvents.RawContentChangedType.LineChanged */: {
                                const changedLineBreakData = lineBreakQueue.dequeue();
                                const [lineMappingChanged, linesChangedEvent, linesInsertedEvent, linesDeletedEvent] = this.m.onModelLineChanged(versionId, change.lineNumber, changedLineBreakData);
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
                        this.m.acceptVersionId(versionId);
                    }
                    this.viewLayout.onHeightMaybeChanged();
                    if (!hadOtherModelChange && hadModelLineChangeThatChangedLineMapping) {
                        eventsCollector.emitViewEvent(new viewEvents.$YU());
                        eventsCollector.emitViewEvent(new viewEvents.$UU(null));
                        this.n.onLineMappingChanged(eventsCollector);
                        this.s.onLineMappingChanged();
                    }
                }
                finally {
                    this.c.endEmitViewEvents();
                }
                // Update the configuration and reset the centered view line
                const viewportStartWasValid = this.h.isValid;
                this.h.invalidate();
                this.b.setModelLineCount(this.model.getLineCount());
                this.y();
                // Recover viewport
                if (!this.g && this.model.getAttachedEditorCount() >= 2 && viewportStartWasValid) {
                    const modelRange = this.model._getTrackedRange(this.h.modelTrackedRange);
                    if (modelRange) {
                        const viewPosition = this.coordinatesConverter.convertModelPositionToViewPosition(modelRange.getStartPosition());
                        const viewPositionTop = this.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
                        this.viewLayout.setScrollPosition({ scrollTop: viewPositionTop + this.h.startLineDelta }, 1 /* ScrollType.Immediate */);
                    }
                }
                try {
                    const eventsCollector = this.c.beginEmitViewEvents();
                    if (e instanceof textModelEvents.$ru) {
                        eventsCollector.emitOutgoingEvent(new viewModelEventDispatcher_1.$$X(e.contentChangedEvent));
                    }
                    this.n.onModelContentChanged(eventsCollector, e);
                }
                finally {
                    this.c.endEmitViewEvents();
                }
                this.C();
            }));
            this.B(this.model.onDidChangeTokens((e) => {
                const viewRanges = [];
                for (let j = 0, lenJ = e.ranges.length; j < lenJ; j++) {
                    const modelRange = e.ranges[j];
                    const viewStartLineNumber = this.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(modelRange.fromLineNumber, 1)).lineNumber;
                    const viewEndLineNumber = this.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(modelRange.toLineNumber, this.model.getLineMaxColumn(modelRange.toLineNumber))).lineNumber;
                    viewRanges[j] = {
                        fromLineNumber: viewStartLineNumber,
                        toLineNumber: viewEndLineNumber
                    };
                }
                this.c.emitSingleViewEvent(new viewEvents.$6U(viewRanges));
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$aY(e));
            }));
            this.B(this.model.onDidChangeLanguageConfiguration((e) => {
                this.c.emitSingleViewEvent(new viewEvents.$XU());
                this.cursorConfig = new cursorCommon_1.$IU(this.model.getLanguageId(), this.model.getOptions(), this.b, this.t);
                this.n.updateConfiguration(this.cursorConfig);
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$0X(e));
            }));
            this.B(this.model.onDidChangeLanguage((e) => {
                this.cursorConfig = new cursorCommon_1.$IU(this.model.getLanguageId(), this.model.getOptions(), this.b, this.t);
                this.n.updateConfiguration(this.cursorConfig);
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$9X(e));
            }));
            this.B(this.model.onDidChangeOptions((e) => {
                // A tab size change causes a line mapping changed event => all view parts will repaint OK, no further event needed here
                if (this.m.setTabSize(this.model.getOptions().tabSize)) {
                    try {
                        const eventsCollector = this.c.beginEmitViewEvents();
                        eventsCollector.emitViewEvent(new viewEvents.$VU());
                        eventsCollector.emitViewEvent(new viewEvents.$YU());
                        eventsCollector.emitViewEvent(new viewEvents.$UU(null));
                        this.n.onLineMappingChanged(eventsCollector);
                        this.s.onLineMappingChanged();
                        this.viewLayout.onFlushed(this.getLineCount());
                    }
                    finally {
                        this.c.endEmitViewEvents();
                    }
                    this.f.schedule();
                }
                this.cursorConfig = new cursorCommon_1.$IU(this.model.getLanguageId(), this.model.getOptions(), this.b, this.t);
                this.n.updateConfiguration(this.cursorConfig);
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$_X(e));
            }));
            this.B(this.model.onDidChangeDecorations((e) => {
                this.s.onModelDecorationsChanged();
                this.c.emitSingleViewEvent(new viewEvents.$UU(e));
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$8X(e));
            }));
        }
        setHiddenAreas(ranges, source) {
            this.H.setHiddenAreas(source, ranges);
            const mergedRanges = this.H.getMergedRanges();
            if (mergedRanges === this.I) {
                return;
            }
            this.I = mergedRanges;
            const stableViewport = this.D();
            let lineMappingChanged = false;
            try {
                const eventsCollector = this.c.beginEmitViewEvents();
                lineMappingChanged = this.m.setHiddenAreas(mergedRanges);
                if (lineMappingChanged) {
                    eventsCollector.emitViewEvent(new viewEvents.$VU());
                    eventsCollector.emitViewEvent(new viewEvents.$YU());
                    eventsCollector.emitViewEvent(new viewEvents.$UU(null));
                    this.n.onLineMappingChanged(eventsCollector);
                    this.s.onLineMappingChanged();
                    this.viewLayout.onFlushed(this.getLineCount());
                    this.viewLayout.onHeightMaybeChanged();
                }
                stableViewport.recoverViewportStart(this.coordinatesConverter, this.viewLayout);
            }
            finally {
                this.c.endEmitViewEvents();
            }
            this.f.schedule();
            if (lineMappingChanged) {
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$5X());
            }
        }
        getVisibleRangesPlusViewportAboveBelow() {
            const layoutInfo = this.b.options.get(143 /* EditorOption.layoutInfo */);
            const lineHeight = this.b.options.get(66 /* EditorOption.lineHeight */);
            const linesAround = Math.max(20, Math.round(layoutInfo.height / lineHeight));
            const partialData = this.viewLayout.getLinesViewportData();
            const startViewLineNumber = Math.max(1, partialData.completelyVisibleStartLineNumber - linesAround);
            const endViewLineNumber = Math.min(this.getLineCount(), partialData.completelyVisibleEndLineNumber + linesAround);
            return this.J(new range_1.$ks(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber)));
        }
        getVisibleRanges() {
            const visibleViewRange = this.getCompletelyVisibleViewRange();
            return this.J(visibleViewRange);
        }
        getHiddenAreas() {
            return this.m.getHiddenAreas();
        }
        J(visibleViewRange) {
            const visibleRange = this.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
            const hiddenAreas = this.m.getHiddenAreas();
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
                    result[resultLen++] = new range_1.$ks(startLineNumber, startColumn, hiddenStartLineNumber - 1, this.model.getLineMaxColumn(hiddenStartLineNumber - 1));
                }
                startLineNumber = hiddenEndLineNumber + 1;
                startColumn = 1;
            }
            if (startLineNumber < endLineNumber || (startLineNumber === endLineNumber && startColumn < endColumn)) {
                result[resultLen++] = new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
            }
            return result;
        }
        getCompletelyVisibleViewRange() {
            const partialData = this.viewLayout.getLinesViewportData();
            const startViewLineNumber = partialData.completelyVisibleStartLineNumber;
            const endViewLineNumber = partialData.completelyVisibleEndLineNumber;
            return new range_1.$ks(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber));
        }
        getCompletelyVisibleViewRangeAtScrollTop(scrollTop) {
            const partialData = this.viewLayout.getLinesViewportDataAtScrollTop(scrollTop);
            const startViewLineNumber = partialData.completelyVisibleStartLineNumber;
            const endViewLineNumber = partialData.completelyVisibleEndLineNumber;
            return new range_1.$ks(startViewLineNumber, this.getLineMinColumn(startViewLineNumber), endViewLineNumber, this.getLineMaxColumn(endViewLineNumber));
        }
        saveState() {
            const compatViewState = this.viewLayout.saveState();
            const scrollTop = compatViewState.scrollTop;
            const firstViewLineNumber = this.viewLayout.getLineNumberAtVerticalOffset(scrollTop);
            const firstPosition = this.coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(firstViewLineNumber, this.getLineMinColumn(firstViewLineNumber)));
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
                return this.L(state);
            }
            const modelPosition = this.model.validatePosition(state.firstPosition);
            const viewPosition = this.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            const scrollTop = this.viewLayout.getVerticalOffsetForLineNumber(viewPosition.lineNumber) - state.firstPositionDeltaTop;
            return {
                scrollLeft: state.scrollLeft,
                scrollTop: scrollTop
            };
        }
        L(state) {
            return {
                scrollLeft: state.scrollLeft,
                scrollTop: state.scrollTopWithoutViewZones
            };
        }
        M() {
            return this.model.getOptions().tabSize;
        }
        getLineCount() {
            return this.m.getViewLineCount();
        }
        /**
         * Gives a hint that a lot of requests are about to come in for these line numbers.
         */
        setViewport(startLineNumber, endLineNumber, centeredLineNumber) {
            this.h.update(this, startLineNumber);
        }
        getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber) {
            return this.m.getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber);
        }
        getLinesIndentGuides(startLineNumber, endLineNumber) {
            return this.m.getViewLinesIndentGuides(startLineNumber, endLineNumber);
        }
        getBracketGuidesInRangeByLine(startLineNumber, endLineNumber, activePosition, options) {
            return this.m.getViewLinesBracketGuides(startLineNumber, endLineNumber, activePosition, options);
        }
        getLineContent(lineNumber) {
            return this.m.getViewLineContent(lineNumber);
        }
        getLineLength(lineNumber) {
            return this.m.getViewLineLength(lineNumber);
        }
        getLineMinColumn(lineNumber) {
            return this.m.getViewLineMinColumn(lineNumber);
        }
        getLineMaxColumn(lineNumber) {
            return this.m.getViewLineMaxColumn(lineNumber);
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            const result = strings.$Be(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 1;
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            const result = strings.$De(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 2;
        }
        getMinimapDecorationsInRange(range) {
            return this.s.getMinimapDecorationsInRange(range);
        }
        getDecorationsInViewport(visibleRange) {
            return this.s.getDecorationsViewportData(visibleRange).decorations;
        }
        getInjectedTextAt(viewPosition) {
            return this.m.getInjectedTextAt(viewPosition);
        }
        getViewportViewLineRenderingData(visibleRange, lineNumber) {
            const allInlineDecorations = this.s.getDecorationsViewportData(visibleRange).inlineDecorations;
            const inlineDecorations = allInlineDecorations[lineNumber - visibleRange.startLineNumber];
            return this.N(lineNumber, inlineDecorations);
        }
        getViewLineRenderingData(lineNumber) {
            const inlineDecorations = this.s.getInlineDecorationsOnLine(lineNumber);
            return this.N(lineNumber, inlineDecorations);
        }
        N(lineNumber, inlineDecorations) {
            const mightContainRTL = this.model.mightContainRTL();
            const mightContainNonBasicASCII = this.model.mightContainNonBasicASCII();
            const tabSize = this.M();
            const lineData = this.m.getViewLineData(lineNumber);
            if (lineData.inlineDecorations) {
                inlineDecorations = [
                    ...inlineDecorations,
                    ...lineData.inlineDecorations.map(d => d.toInlineDecoration(lineNumber))
                ];
            }
            return new viewModel_1.$aV(lineData.minColumn, lineData.maxColumn, lineData.content, lineData.continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, lineData.tokens, inlineDecorations, tabSize, lineData.startVisibleColumn);
        }
        getViewLineData(lineNumber) {
            return this.m.getViewLineData(lineNumber);
        }
        getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed) {
            const result = this.m.getViewLinesData(startLineNumber, endLineNumber, needed);
            return new viewModel_1.$$U(this.M(), result);
        }
        getAllOverviewRulerDecorations(theme) {
            const decorations = this.model.getOverviewRulerDecorations(this.a, (0, editorOptions_1.filterValidationDecorations)(this.b.options));
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
        O() {
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
            modelRanges.sort(range_1.$ks.compareRangesUsingStarts);
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
            if (languageId === modesRegistry_1.$Yt) {
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
                range = new range_1.$ks(lineNumber, this.model.getLineMinColumn(lineNumber), lineNumber, this.model.getLineMaxColumn(lineNumber));
            }
            const fontInfo = this.b.options.get(50 /* EditorOption.fontInfo */);
            const colorMap = this.Q();
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
                    + this.P(range, colorMap)
                    + '</div>')
            };
        }
        P(modelRange, colorMap) {
            const startLineNumber = modelRange.startLineNumber;
            const startColumn = modelRange.startColumn;
            const endLineNumber = modelRange.endLineNumber;
            const endColumn = modelRange.endColumn;
            const tabSize = this.M();
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
                    result += (0, textToHtmlTokenizer_1.$eY)(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, platform.$i);
                }
            }
            return result;
        }
        Q() {
            const colorMap = languages_1.$bt.getColorMap();
            const result = ['#000000'];
            if (colorMap) {
                for (let i = 1, len = colorMap.length; i < len; i++) {
                    result[i] = color_1.$Os.Format.CSS.formatHex(colorMap[i]);
                }
            }
            return result;
        }
        //#region cursor operations
        getPrimaryCursorState() {
            return this.n.getPrimaryCursorState();
        }
        getLastAddedCursorIndex() {
            return this.n.getLastAddedCursorIndex();
        }
        getCursorStates() {
            return this.n.getCursorStates();
        }
        setCursorStates(source, reason, states) {
            return this.S(eventsCollector => this.n.setStates(eventsCollector, source, reason, states));
        }
        getCursorColumnSelectData() {
            return this.n.getCursorColumnSelectData();
        }
        getCursorAutoClosedCharacters() {
            return this.n.getAutoClosedCharacters();
        }
        setCursorColumnSelectData(columnSelectData) {
            this.n.setCursorColumnSelectData(columnSelectData);
        }
        getPrevEditOperationType() {
            return this.n.getPrevEditOperationType();
        }
        setPrevEditOperationType(type) {
            this.n.setPrevEditOperationType(type);
        }
        getSelection() {
            return this.n.getSelection();
        }
        getSelections() {
            return this.n.getSelections();
        }
        getPosition() {
            return this.n.getPrimaryCursorState().modelState.position;
        }
        setSelections(source, selections, reason = 0 /* CursorChangeReason.NotSet */) {
            this.S(eventsCollector => this.n.setSelections(eventsCollector, source, selections, reason));
        }
        saveCursorState() {
            return this.n.saveState();
        }
        restoreCursorState(states) {
            this.S(eventsCollector => this.n.restoreState(eventsCollector, states));
        }
        R(callback) {
            if (this.n.context.cursorConfig.readOnly) {
                // we cannot edit when read only...
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$7X());
                return;
            }
            this.S(callback);
        }
        executeEdits(source, edits, cursorStateComputer) {
            this.R(eventsCollector => this.n.executeEdits(eventsCollector, source, edits, cursorStateComputer));
        }
        startComposition() {
            this.R(eventsCollector => this.n.startComposition(eventsCollector));
        }
        endComposition(source) {
            this.R(eventsCollector => this.n.endComposition(eventsCollector, source));
        }
        type(text, source) {
            this.R(eventsCollector => this.n.type(eventsCollector, text, source));
        }
        compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source) {
            this.R(eventsCollector => this.n.compositionType(eventsCollector, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source));
        }
        paste(text, pasteOnNewLine, multicursorText, source) {
            this.R(eventsCollector => this.n.paste(eventsCollector, text, pasteOnNewLine, multicursorText, source));
        }
        cut(source) {
            this.R(eventsCollector => this.n.cut(eventsCollector, source));
        }
        executeCommand(command, source) {
            this.R(eventsCollector => this.n.executeCommand(eventsCollector, command, source));
        }
        executeCommands(commands, source) {
            this.R(eventsCollector => this.n.executeCommands(eventsCollector, commands, source));
        }
        revealPrimaryCursor(source, revealHorizontal, minimalReveal = false) {
            this.S(eventsCollector => this.n.revealPrimary(eventsCollector, source, minimalReveal, 0 /* viewEvents.VerticalRevealType.Simple */, revealHorizontal, 0 /* ScrollType.Smooth */));
        }
        revealTopMostCursor(source) {
            const viewPosition = this.n.getTopMostViewPosition();
            const viewRange = new range_1.$ks(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
            this.S(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.$3U(source, false, viewRange, null, 0 /* viewEvents.VerticalRevealType.Simple */, true, 0 /* ScrollType.Smooth */)));
        }
        revealBottomMostCursor(source) {
            const viewPosition = this.n.getBottomMostViewPosition();
            const viewRange = new range_1.$ks(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column);
            this.S(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.$3U(source, false, viewRange, null, 0 /* viewEvents.VerticalRevealType.Simple */, true, 0 /* ScrollType.Smooth */)));
        }
        revealRange(source, revealHorizontal, viewRange, verticalType, scrollType) {
            this.S(eventsCollector => eventsCollector.emitViewEvent(new viewEvents.$3U(source, false, viewRange, null, verticalType, revealHorizontal, scrollType)));
        }
        //#endregion
        //#region viewLayout
        changeWhitespace(callback) {
            const hadAChange = this.viewLayout.changeWhitespace(callback);
            if (hadAChange) {
                this.c.emitSingleViewEvent(new viewEvents.$8U());
                this.c.emitOutgoingEvent(new viewModelEventDispatcher_1.$4X());
            }
        }
        //#endregion
        S(callback) {
            try {
                const eventsCollector = this.c.beginEmitViewEvents();
                return callback(eventsCollector);
            }
            finally {
                this.c.endEmitViewEvents();
            }
        }
        normalizePosition(position, affinity) {
            return this.m.normalizePosition(position, affinity);
        }
        /**
         * Gets the column at which indentation stops at a given line.
         * @internal
        */
        getLineIndentColumn(lineNumber) {
            return this.m.getLineIndentColumn(lineNumber);
        }
    }
    exports.$qY = $qY;
    class ViewportStart {
        static create(model) {
            const viewportStartLineTrackedRange = model._setTrackedRange(null, new range_1.$ks(1, 1, 1, 1), 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            return new ViewportStart(model, 1, false, viewportStartLineTrackedRange, 0);
        }
        get viewLineNumber() {
            return this.b;
        }
        get isValid() {
            return this.c;
        }
        get modelTrackedRange() {
            return this.f;
        }
        get startLineDelta() {
            return this.g;
        }
        constructor(a, b, c, f, g) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
        }
        dispose() {
            this.a._setTrackedRange(this.f, null, 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
        }
        update(viewModel, startLineNumber) {
            const position = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(startLineNumber, viewModel.getLineMinColumn(startLineNumber)));
            const viewportStartLineTrackedRange = viewModel.model._setTrackedRange(this.f, new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column), 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            const viewportStartLineTop = viewModel.viewLayout.getVerticalOffsetForLineNumber(startLineNumber);
            const scrollTop = viewModel.viewLayout.getCurrentScrollTop();
            this.b = startLineNumber;
            this.c = true;
            this.f = viewportStartLineTrackedRange;
            this.g = scrollTop - viewportStartLineTop;
        }
        invalidate() {
            this.c = false;
        }
    }
    class OverviewRulerDecorations {
        constructor() {
            this.a = Object.create(null);
            this.asArray = [];
        }
        accept(color, zIndex, startLineNumber, endLineNumber, lane) {
            const prevGroup = this.a[color];
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
                const group = new viewModel_1.$eV(color, zIndex, [lane, startLineNumber, endLineNumber]);
                this.a[color] = group;
                this.asArray.push(group);
            }
        }
    }
    class HiddenAreasModel {
        constructor() {
            this.a = new Map();
            this.b = false;
            this.c = [];
        }
        setHiddenAreas(source, ranges) {
            const existing = this.a.get(source);
            if (existing && rangeArraysEqual(existing, ranges)) {
                return;
            }
            this.a.set(source, ranges);
            this.b = true;
        }
        /**
         * The returned array is immutable.
        */
        getMergedRanges() {
            if (!this.b) {
                return this.c;
            }
            this.b = false;
            const newRanges = Array.from(this.a.values()).reduce((r, hiddenAreas) => mergeLineRangeArray(r, hiddenAreas), []);
            if (rangeArraysEqual(this.c, newRanges)) {
                return this.c;
            }
            this.c = newRanges;
            return this.c;
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
                result.push(new range_1.$ks(startLineNumber, 1, endLineNumber, 1));
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
//# sourceMappingURL=viewModelImpl.js.map