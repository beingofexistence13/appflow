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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/comparers", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/strings", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/searchNotebookHelpers", "vs/workbench/contrib/search/common/notebookSearch", "vs/workbench/services/search/common/replace", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchHelpers"], function (require, exports, async_1, cancellation_1, comparers_1, decorators_1, errors, event_1, lazy_1, lifecycle_1, map_1, network_1, strings_1, ternarySearchTree_1, uri_1, range_1, model_1, textModel_1, model_2, configuration_1, instantiation_1, label_1, log_1, telemetry_1, colorRegistry_1, themeService_1, uriIdentity_1, findMatchDecorationModel_1, notebookEditorWidget_1, notebookEditorService_1, notebookCommon_1, replace_1, searchNotebookHelpers_1, notebookSearch_1, replace_2, search_1, searchHelpers_1) {
    "use strict";
    var FileMatch_1, FolderMatch_1, RangeHighlightDecorations_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.arrayContainsElementOrParent = exports.textSearchMatchesToNotebookMatches = exports.RangeHighlightDecorations = exports.ISearchViewModelWorkbenchService = exports.SearchViewModelWorkbenchService = exports.SearchModel = exports.SearchResult = exports.searchComparer = exports.compareNotebookPos = exports.searchMatchComparer = exports.FolderMatchNoRoot = exports.FolderMatchWorkspaceRoot = exports.FolderMatchWithResource = exports.FolderMatch = exports.FileMatch = exports.MatchInNotebook = exports.CellMatch = exports.Match = void 0;
    class Match {
        static { this.MAX_PREVIEW_CHARS = 250; }
        constructor(_parent, _fullPreviewLines, _fullPreviewRange, _documentRange) {
            this._parent = _parent;
            this._fullPreviewLines = _fullPreviewLines;
            this._oneLinePreviewText = _fullPreviewLines[_fullPreviewRange.startLineNumber];
            const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ?
                _fullPreviewRange.endColumn :
                this._oneLinePreviewText.length;
            this._rangeInPreviewText = new search_1.OneLineRange(1, _fullPreviewRange.startColumn + 1, adjustedEndCol + 1);
            this._range = new range_1.Range(_documentRange.startLineNumber + 1, _documentRange.startColumn + 1, _documentRange.endLineNumber + 1, _documentRange.endColumn + 1);
            this._fullPreviewRange = _fullPreviewRange;
            this._id = this._parent.id() + '>' + this._range + this.getMatchString();
        }
        id() {
            return this._id;
        }
        parent() {
            return this._parent;
        }
        text() {
            return this._oneLinePreviewText;
        }
        range() {
            return this._range;
        }
        preview() {
            let before = this._oneLinePreviewText.substring(0, this._rangeInPreviewText.startColumn - 1), inside = this.getMatchString(), after = this._oneLinePreviewText.substring(this._rangeInPreviewText.endColumn - 1);
            before = (0, strings_1.lcut)(before, 26);
            before = before.trimStart();
            let charsRemaining = Match.MAX_PREVIEW_CHARS - before.length;
            inside = inside.substr(0, charsRemaining);
            charsRemaining -= inside.length;
            after = after.substr(0, charsRemaining);
            return {
                before,
                inside,
                after,
            };
        }
        get replaceString() {
            const searchModel = this.parent().parent().searchModel;
            if (!searchModel.replacePattern) {
                throw new Error('searchModel.replacePattern must be set before accessing replaceString');
            }
            const fullMatchText = this.fullMatchText();
            let replaceString = searchModel.replacePattern.getReplaceString(fullMatchText, searchModel.preserveCase);
            if (replaceString !== null) {
                return replaceString;
            }
            // Search/find normalize line endings - check whether \r prevents regex from matching
            const fullMatchTextWithoutCR = fullMatchText.replace(/\r\n/g, '\n');
            if (fullMatchTextWithoutCR !== fullMatchText) {
                replaceString = searchModel.replacePattern.getReplaceString(fullMatchTextWithoutCR, searchModel.preserveCase);
                if (replaceString !== null) {
                    return replaceString;
                }
            }
            // If match string is not matching then regex pattern has a lookahead expression
            const contextMatchTextWithSurroundingContent = this.fullMatchText(true);
            replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithSurroundingContent, searchModel.preserveCase);
            if (replaceString !== null) {
                return replaceString;
            }
            // Search/find normalize line endings, this time in full context
            const contextMatchTextWithoutCR = contextMatchTextWithSurroundingContent.replace(/\r\n/g, '\n');
            if (contextMatchTextWithoutCR !== contextMatchTextWithSurroundingContent) {
                replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithoutCR, searchModel.preserveCase);
                if (replaceString !== null) {
                    return replaceString;
                }
            }
            // Match string is still not matching. Could be unsupported matches (multi-line).
            return searchModel.replacePattern.pattern;
        }
        fullMatchText(includeSurrounding = false) {
            let thisMatchPreviewLines;
            if (includeSurrounding) {
                thisMatchPreviewLines = this._fullPreviewLines;
            }
            else {
                thisMatchPreviewLines = this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
                thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(0, this._fullPreviewRange.endColumn);
                thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(this._fullPreviewRange.startColumn);
            }
            return thisMatchPreviewLines.join('\n');
        }
        rangeInPreview() {
            // convert to editor's base 1 positions.
            return {
                ...this._fullPreviewRange,
                startColumn: this._fullPreviewRange.startColumn + 1,
                endColumn: this._fullPreviewRange.endColumn + 1
            };
        }
        fullPreviewLines() {
            return this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
        }
        getMatchString() {
            return this._oneLinePreviewText.substring(this._rangeInPreviewText.startColumn - 1, this._rangeInPreviewText.endColumn - 1);
        }
    }
    exports.Match = Match;
    __decorate([
        decorators_1.memoize
    ], Match.prototype, "preview", null);
    class CellMatch {
        constructor(_parent, _cell, _cellIndex) {
            this._parent = _parent;
            this._cell = _cell;
            this._cellIndex = _cellIndex;
            this._contentMatches = new Map();
            this._webviewMatches = new Map();
            this._context = new Map();
        }
        get context() {
            return new Map(this._context);
        }
        matches() {
            return [...this._contentMatches.values(), ...this._webviewMatches.values()];
        }
        get contentMatches() {
            return Array.from(this._contentMatches.values());
        }
        get webviewMatches() {
            return Array.from(this._webviewMatches.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this._contentMatches.delete(match.id());
                this._webviewMatches.delete(match.id());
            }
        }
        clearAllMatches() {
            this._contentMatches.clear();
            this._webviewMatches.clear();
        }
        addContentMatches(textSearchMatches) {
            const contentMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
            contentMatches.forEach((match) => {
                this._contentMatches.set(match.id(), match);
            });
            this.addContext(textSearchMatches);
        }
        addContext(textSearchMatches) {
            if (this.cell instanceof searchNotebookHelpers_1.CellSearchModel) {
                // todo: get closed notebook results in search editor
                return;
            }
            this.cell.resolveTextModel().then((textModel) => {
                const textResultsWithContext = (0, searchHelpers_1.addContextToEditorMatches)(textSearchMatches, textModel, this.parent.parent().query);
                const contexts = textResultsWithContext.filter((result => !(0, search_1.resultIsMatch)(result)));
                contexts.map(context => ({ ...context, lineNumber: context.lineNumber + 1 }))
                    .forEach((context) => { this._context.set(context.lineNumber, context.text); });
            });
        }
        addWebviewMatches(textSearchMatches) {
            const webviewMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
            webviewMatches.forEach((match) => {
                this._webviewMatches.set(match.id(), match);
            });
            // TODO: add webview results to context
        }
        setCellModel(cell) {
            this._cell = cell;
        }
        get parent() {
            return this._parent;
        }
        get id() {
            return this._cell.id;
        }
        get cellIndex() {
            return this._cellIndex;
        }
        get cell() {
            return this._cell;
        }
    }
    exports.CellMatch = CellMatch;
    class MatchInNotebook extends Match {
        constructor(_cellParent, _fullPreviewLines, _fullPreviewRange, _documentRange, webviewIndex) {
            super(_cellParent.parent, _fullPreviewLines, _fullPreviewRange, _documentRange);
            this._cellParent = _cellParent;
            this._id = this._parent.id() + '>' + this._cellParent.cellIndex + (webviewIndex ? '_' + webviewIndex : '') + '_' + this.notebookMatchTypeString() + this._range + this.getMatchString();
            this._webviewIndex = webviewIndex;
        }
        parent() {
            return this._cellParent.parent;
        }
        get cellParent() {
            return this._cellParent;
        }
        notebookMatchTypeString() {
            return this.isWebviewMatch() ? 'webview' : 'content';
        }
        isWebviewMatch() {
            return this._webviewIndex !== undefined;
        }
        get cellIndex() {
            return this._cellParent.cellIndex;
        }
        get webviewIndex() {
            return this._webviewIndex;
        }
        get cell() {
            return this._cellParent.cell;
        }
    }
    exports.MatchInNotebook = MatchInNotebook;
    let FileMatch = class FileMatch extends lifecycle_1.Disposable {
        static { FileMatch_1 = this; }
        static { this._CURRENT_FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            description: 'search-current-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 13,
            className: 'currentFindMatch',
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            description: 'search-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'findMatch',
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static getDecorationOption(selected) {
            return (selected ? FileMatch_1._CURRENT_FIND_MATCH : FileMatch_1._FIND_MATCH);
        }
        get context() {
            return new Map(this._context);
        }
        get cellContext() {
            const cellContext = new Map();
            this._cellMatches.forEach(cellMatch => {
                cellContext.set(cellMatch.id, cellMatch.context);
            });
            return cellContext;
        }
        // #endregion
        constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, searchInstanceID, modelService, replaceService, labelService, notebookEditorService) {
            super();
            this._query = _query;
            this._previewOptions = _previewOptions;
            this._maxResults = _maxResults;
            this._parent = _parent;
            this.rawMatch = rawMatch;
            this._closestRoot = _closestRoot;
            this.searchInstanceID = searchInstanceID;
            this.modelService = modelService;
            this.replaceService = replaceService;
            this.labelService = labelService;
            this.notebookEditorService = notebookEditorService;
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this._model = null;
            this._modelListener = null;
            this._selectedMatch = null;
            this._modelDecorations = [];
            this._context = new Map();
            // #region notebook fields
            this._notebookEditorWidget = null;
            this._editorWidgetListener = null;
            this.replaceQ = Promise.resolve();
            this._resource = this.rawMatch.resource;
            this._textMatches = new Map();
            this._removedTextMatches = new Set();
            this._updateScheduler = new async_1.RunOnceScheduler(this.updateMatchesForModel.bind(this), 250);
            this._name = new lazy_1.Lazy(() => labelService.getUriBasenameLabel(this.resource));
            this._cellMatches = new Map();
            this._notebookUpdateScheduler = new async_1.RunOnceScheduler(this.updateMatchesForEditorWidget.bind(this), 250);
            this.createMatches();
        }
        addWebviewMatchesToCell(cellID, webviewMatches) {
            const cellMatch = this.getCellMatch(cellID);
            if (cellMatch !== undefined) {
                cellMatch.addWebviewMatches(webviewMatches);
            }
        }
        addContentMatchesToCell(cellID, contentMatches) {
            const cellMatch = this.getCellMatch(cellID);
            if (cellMatch !== undefined) {
                cellMatch.addContentMatches(contentMatches);
            }
        }
        getCellMatch(cellID) {
            return this._cellMatches.get(cellID);
        }
        addCellMatch(rawCell) {
            const cellMatch = new CellMatch(this, rawCell.cell, rawCell.index);
            this._cellMatches.set(cellMatch.id, cellMatch);
            this.addWebviewMatchesToCell(rawCell.cell.id, rawCell.webviewResults);
            this.addContentMatchesToCell(rawCell.cell.id, rawCell.contentResults);
        }
        get closestRoot() {
            return this._closestRoot;
        }
        hasWebviewMatches() {
            return this.matches().some(m => m instanceof MatchInNotebook && m.isWebviewMatch());
        }
        createMatches() {
            const model = this.modelService.getModel(this._resource);
            if (model) {
                this.bindModel(model);
                this.updateMatchesForModel();
            }
            else {
                const notebookEditorWidgetBorrow = this.notebookEditorService.retrieveExistingWidgetFromURI(this.resource);
                if (notebookEditorWidgetBorrow?.value) {
                    this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
                }
                if (this.rawMatch.results) {
                    this.rawMatch.results
                        .filter(search_1.resultIsMatch)
                        .forEach(rawMatch => {
                        textSearchResultToMatches(rawMatch, this)
                            .forEach(m => this.add(m));
                    });
                }
                if ((0, searchNotebookHelpers_1.isIFileMatchWithCells)(this.rawMatch)) {
                    this.rawMatch.cellResults?.forEach(cell => this.addCellMatch(cell));
                    this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
                    this._onChange.fire({ forceUpdateModel: true });
                }
                this.addContext(this.rawMatch.results);
            }
        }
        bindModel(model) {
            this._model = model;
            this._modelListener = this._model.onDidChangeContent(() => {
                this._updateScheduler.schedule();
            });
            this._model.onWillDispose(() => this.onModelWillDispose());
            this.updateHighlights();
        }
        onModelWillDispose() {
            // Update matches because model might have some dirty changes
            this.updateMatchesForModel();
            this.unbindModel();
        }
        unbindModel() {
            if (this._model) {
                this._updateScheduler.cancel();
                this._model.changeDecorations((accessor) => {
                    this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, []);
                });
                this._model = null;
                this._modelListener.dispose();
            }
        }
        updateMatchesForModel() {
            // this is called from a timeout and might fire
            // after the model has been disposed
            if (!this._model) {
                return;
            }
            this._textMatches = new Map();
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const matches = this._model
                .findMatches(this._query.pattern, this._model.getFullModelRange(), !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
            this.updateMatches(matches, true, this._model);
        }
        async updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
            if (!this._model) {
                return;
            }
            const range = {
                startLineNumber: lineNumber,
                startColumn: this._model.getLineMinColumn(lineNumber),
                endLineNumber: lineNumber,
                endColumn: this._model.getLineMaxColumn(lineNumber)
            };
            const oldMatches = Array.from(this._textMatches.values()).filter(match => match.range().startLineNumber === lineNumber);
            oldMatches.forEach(match => this._textMatches.delete(match.id()));
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const matches = this._model.findMatches(this._query.pattern, range, !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
            this.updateMatches(matches, modelChange, this._model);
            // await this.updateMatchesForEditorWidget();
        }
        updateMatches(matches, modelChange, model) {
            const textSearchResults = (0, searchHelpers_1.editorMatchesToTextSearchResults)(matches, model, this._previewOptions);
            textSearchResults.forEach(textSearchResult => {
                textSearchResultToMatches(textSearchResult, this).forEach(match => {
                    if (!this._removedTextMatches.has(match.id())) {
                        this.add(match);
                        if (this.isMatchSelected(match)) {
                            this._selectedMatch = match;
                        }
                    }
                });
            });
            this.addContext((0, searchHelpers_1.addContextToEditorMatches)(textSearchResults, model, this.parent().parent().query)
                .filter((result => !(0, search_1.resultIsMatch)(result)))
                .map(context => ({ ...context, lineNumber: context.lineNumber + 1 })));
            this._onChange.fire({ forceUpdateModel: modelChange });
            this.updateHighlights();
        }
        updateHighlights() {
            if (!this._model) {
                return;
            }
            this._model.changeDecorations((accessor) => {
                const newDecorations = (this.parent().showHighlights
                    ? this.matches().map(match => ({
                        range: match.range(),
                        options: FileMatch_1.getDecorationOption(this.isMatchSelected(match))
                    }))
                    : []);
                this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, newDecorations);
            });
        }
        id() {
            return this.resource.toString();
        }
        parent() {
            return this._parent;
        }
        matches() {
            const cellMatches = Array.from(this._cellMatches.values()).flatMap((e) => e.matches());
            return [...this._textMatches.values(), ...cellMatches];
        }
        textMatches() {
            return Array.from(this._textMatches.values());
        }
        cellMatches() {
            return Array.from(this._cellMatches.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this.removeMatch(match);
                this._removedTextMatches.add(match.id());
            }
            this._onChange.fire({ didRemove: true });
        }
        async replace(toReplace) {
            return this.replaceQ = this.replaceQ.finally(async () => {
                await this.replaceService.replace(toReplace);
                await this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false);
            });
        }
        setSelectedMatch(match) {
            if (match) {
                if (!this.isMatchSelected(match) && match instanceof MatchInNotebook) {
                    this._selectedMatch = match;
                    return;
                }
                if (!this._textMatches.has(match.id())) {
                    return;
                }
                if (this.isMatchSelected(match)) {
                    return;
                }
            }
            this._selectedMatch = match;
            this.updateHighlights();
        }
        getSelectedMatch() {
            return this._selectedMatch;
        }
        isMatchSelected(match) {
            return !!this._selectedMatch && this._selectedMatch.id() === match.id();
        }
        count() {
            return this.matches().length;
        }
        get resource() {
            return this._resource;
        }
        name() {
            return this._name.value;
        }
        addContext(results) {
            if (!results) {
                return;
            }
            const contexts = results
                .filter((result => !(0, search_1.resultIsMatch)(result)));
            return contexts.forEach(context => this._context.set(context.lineNumber, context.text));
        }
        add(match, trigger) {
            this._textMatches.set(match.id(), match);
            if (trigger) {
                this._onChange.fire({ forceUpdateModel: true });
            }
        }
        removeMatch(match) {
            if (match instanceof MatchInNotebook) {
                match.cellParent.remove(match);
                if (match.cellParent.matches().length === 0) {
                    this._cellMatches.delete(match.cellParent.id);
                }
            }
            else {
                this._textMatches.delete(match.id());
            }
            if (this.isMatchSelected(match)) {
                this.setSelectedMatch(null);
                this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
            }
            else {
                this.updateHighlights();
            }
            if (match instanceof MatchInNotebook) {
                this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
            }
        }
        async resolveFileStat(fileService) {
            this._fileStat = await fileService.stat(this.resource).catch(() => undefined);
        }
        get fileStat() {
            return this._fileStat;
        }
        set fileStat(stat) {
            this._fileStat = stat;
        }
        dispose() {
            this.setSelectedMatch(null);
            this.unbindModel();
            this.unbindNotebookEditorWidget();
            this._onDispose.fire();
            super.dispose();
        }
        hasOnlyReadOnlyMatches() {
            return this.matches().every(match => (match instanceof MatchInNotebook && match.isWebviewMatch()));
        }
        // #region strictly notebook methods
        bindNotebookEditorWidget(widget) {
            if (this._notebookEditorWidget === widget) {
                return;
            }
            this._notebookEditorWidget = widget;
            this._editorWidgetListener = this._notebookEditorWidget.textModel?.onDidChangeContent((e) => {
                if (!e.rawEvents.some(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellContent || event.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange)) {
                    return;
                }
                this._notebookUpdateScheduler.schedule();
            }) ?? null;
            this._addNotebookHighlights();
        }
        unbindNotebookEditorWidget(widget) {
            if (widget && this._notebookEditorWidget !== widget) {
                return;
            }
            if (this._notebookEditorWidget) {
                this._notebookUpdateScheduler.cancel();
                this._editorWidgetListener?.dispose();
            }
            this._removeNotebookHighlights();
            this._notebookEditorWidget = null;
        }
        updateNotebookHighlights() {
            if (this.parent().showHighlights) {
                this._addNotebookHighlights();
                this.setNotebookFindMatchDecorationsUsingCellMatches(Array.from(this._cellMatches.values()));
            }
            else {
                this._removeNotebookHighlights();
            }
        }
        _addNotebookHighlights() {
            if (!this._notebookEditorWidget) {
                return;
            }
            this._findMatchDecorationModel?.stopWebviewFind();
            this._findMatchDecorationModel?.dispose();
            this._findMatchDecorationModel = new findMatchDecorationModel_1.FindMatchDecorationModel(this._notebookEditorWidget, this.searchInstanceID);
            if (this._selectedMatch instanceof MatchInNotebook) {
                this.highlightCurrentFindMatchDecoration(this._selectedMatch);
            }
        }
        _removeNotebookHighlights() {
            if (this._findMatchDecorationModel) {
                this._findMatchDecorationModel?.stopWebviewFind();
                this._findMatchDecorationModel?.dispose();
                this._findMatchDecorationModel = undefined;
            }
        }
        updateNotebookMatches(matches, modelChange) {
            if (!this._notebookEditorWidget) {
                return;
            }
            const oldCellMatches = new Map(this._cellMatches);
            if (this._notebookEditorWidget.getId() !== this._lastEditorWidgetIdForUpdate) {
                this._cellMatches.clear();
                this._lastEditorWidgetIdForUpdate = this._notebookEditorWidget.getId();
            }
            matches.forEach(match => {
                let existingCell = this._cellMatches.get(match.cell.id);
                if (this._notebookEditorWidget && !existingCell) {
                    const index = this._notebookEditorWidget.getCellIndex(match.cell);
                    const existingRawCell = oldCellMatches.get(`${searchNotebookHelpers_1.rawCellPrefix}${index}`);
                    if (existingRawCell) {
                        existingRawCell.setCellModel(match.cell);
                        existingRawCell.clearAllMatches();
                        existingCell = existingRawCell;
                    }
                }
                const cell = existingCell ?? new CellMatch(this, match.cell, match.index);
                cell.addContentMatches((0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(match.contentMatches, match.cell));
                cell.addWebviewMatches((0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(match.webviewMatches));
                this._cellMatches.set(cell.id, cell);
            });
            this._findMatchDecorationModel?.setAllFindMatchesDecorations(matches);
            if (this._selectedMatch instanceof MatchInNotebook) {
                this.highlightCurrentFindMatchDecoration(this._selectedMatch);
            }
            this._onChange.fire({ forceUpdateModel: modelChange });
        }
        setNotebookFindMatchDecorationsUsingCellMatches(cells) {
            if (!this._findMatchDecorationModel) {
                return;
            }
            const cellFindMatch = cells.map((cell) => {
                const webviewMatches = cell.webviewMatches.map(match => {
                    return {
                        index: match.webviewIndex,
                    };
                });
                const findMatches = cell.contentMatches.map(match => {
                    return new model_1.FindMatch(match.range(), [match.text()]);
                });
                return {
                    cell: cell.cell,
                    index: cell.cellIndex,
                    contentMatches: findMatches,
                    webviewMatches: webviewMatches
                };
            });
            try {
                this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatch);
            }
            catch (e) {
                // no op, might happen due to bugs related to cell output regex search
            }
        }
        async updateMatchesForEditorWidget() {
            if (!this._notebookEditorWidget) {
                return;
            }
            this._textMatches = new Map();
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const allMatches = await this._notebookEditorWidget
                .find(this._query.pattern, {
                regex: this._query.isRegExp,
                wholeWord: this._query.isWordMatch,
                caseSensitive: this._query.isCaseSensitive,
                wordSeparators: wordSeparators ?? undefined,
                includeMarkupInput: this._query.notebookInfo?.isInNotebookMarkdownInput,
                includeMarkupPreview: this._query.notebookInfo?.isInNotebookMarkdownPreview,
                includeCodeInput: this._query.notebookInfo?.isInNotebookCellInput,
                includeOutput: this._query.notebookInfo?.isInNotebookCellOutput,
            }, cancellation_1.CancellationToken.None, false, true, this.searchInstanceID);
            this.updateNotebookMatches(allMatches, true);
        }
        async showMatch(match) {
            const offset = await this.highlightCurrentFindMatchDecoration(match);
            this.setSelectedMatch(match);
            this.revealCellRange(match, offset);
        }
        async highlightCurrentFindMatchDecoration(match) {
            if (!this._findMatchDecorationModel || match.cell instanceof searchNotebookHelpers_1.CellSearchModel) {
                // match cell should never be a CellSearchModel if the notebook is open
                return null;
            }
            if (match.webviewIndex === undefined) {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(match.cell, match.range());
            }
            else {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(match.cell, match.webviewIndex);
            }
        }
        revealCellRange(match, outputOffset) {
            if (!this._notebookEditorWidget || match.cell instanceof searchNotebookHelpers_1.CellSearchModel) {
                // match cell should never be a CellSearchModel if the notebook is open
                return;
            }
            if (match.webviewIndex !== undefined) {
                const index = this._notebookEditorWidget.getCellIndex(match.cell);
                if (index !== undefined) {
                    this._notebookEditorWidget.revealCellOffsetInCenterAsync(match.cell, outputOffset ?? 0);
                }
            }
            else {
                match.cell.updateEditState(match.cell.getEditState(), 'focusNotebookCell');
                this._notebookEditorWidget.setCellEditorSelection(match.cell, match.range());
                this._notebookEditorWidget.revealRangeInCenterIfOutsideViewportAsync(match.cell, match.range());
            }
        }
    };
    exports.FileMatch = FileMatch;
    exports.FileMatch = FileMatch = FileMatch_1 = __decorate([
        __param(7, model_2.IModelService),
        __param(8, replace_1.IReplaceService),
        __param(9, label_1.ILabelService),
        __param(10, notebookEditorService_1.INotebookEditorService)
    ], FileMatch);
    let FolderMatch = FolderMatch_1 = class FolderMatch extends lifecycle_1.Disposable {
        constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
            super();
            this._resource = _resource;
            this._id = _id;
            this._index = _index;
            this._query = _query;
            this._parent = _parent;
            this._searchResult = _searchResult;
            this._closestRoot = _closestRoot;
            this.replaceService = replaceService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this._replacingAll = false;
            this._fileMatches = new map_1.ResourceMap();
            this._folderMatches = new map_1.ResourceMap();
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._unDisposedFileMatches = new map_1.ResourceMap();
            this._unDisposedFolderMatches = new map_1.ResourceMap();
            this._name = new lazy_1.Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : '');
        }
        get searchModel() {
            return this._searchResult.searchModel;
        }
        get showHighlights() {
            return this._parent.showHighlights;
        }
        get closestRoot() {
            return this._closestRoot;
        }
        set replacingAll(b) {
            this._replacingAll = b;
        }
        id() {
            return this._id;
        }
        get resource() {
            return this._resource;
        }
        index() {
            return this._index;
        }
        name() {
            return this._name.value;
        }
        parent() {
            return this._parent;
        }
        bindModel(model) {
            const fileMatch = this._fileMatches.get(model.uri);
            if (fileMatch) {
                fileMatch.bindModel(model);
            }
            else {
                const folderMatch = this.getFolderMatch(model.uri);
                const match = folderMatch?.getDownstreamFileMatch(model.uri);
                match?.bindModel(model);
            }
        }
        async bindNotebookEditorWidget(editor, resource) {
            const fileMatch = this._fileMatches.get(resource);
            if (fileMatch) {
                fileMatch.bindNotebookEditorWidget(editor);
                await fileMatch.updateMatchesForEditorWidget();
            }
            else {
                const folderMatches = this.folderMatchesIterator();
                for (const elem of folderMatches) {
                    await elem.bindNotebookEditorWidget(editor, resource);
                }
            }
        }
        unbindNotebookEditorWidget(editor, resource) {
            const fileMatch = this._fileMatches.get(resource);
            if (fileMatch) {
                fileMatch.unbindNotebookEditorWidget(editor);
            }
            else {
                const folderMatches = this.folderMatchesIterator();
                for (const elem of folderMatches) {
                    elem.unbindNotebookEditorWidget(editor, resource);
                }
            }
        }
        createIntermediateFolderMatch(resource, id, index, query, baseWorkspaceFolder) {
            const folderMatch = this.instantiationService.createInstance(FolderMatchWithResource, resource, id, index, query, this, this._searchResult, baseWorkspaceFolder);
            this.configureIntermediateMatch(folderMatch);
            this.doAddFolder(folderMatch);
            return folderMatch;
        }
        configureIntermediateMatch(folderMatch) {
            const disposable = folderMatch.onChange((event) => this.onFolderChange(folderMatch, event));
            folderMatch.onDispose(() => disposable.dispose());
        }
        clear(clearingAll = false) {
            const changed = this.allDownstreamFileMatches();
            this.disposeMatches();
            this._onChange.fire({ elements: changed, removed: true, added: false, clearingAll });
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            const allMatches = getFileMatches(matches);
            this.doRemoveFile(allMatches);
        }
        async replace(match) {
            return this.replaceService.replace([match]).then(() => {
                this.doRemoveFile([match], true, true, true);
            });
        }
        replaceAll() {
            const matches = this.matches();
            return this.batchReplace(matches);
        }
        matches() {
            return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
        }
        fileMatchesIterator() {
            return this._fileMatches.values();
        }
        folderMatchesIterator() {
            return this._folderMatches.values();
        }
        isEmpty() {
            return (this.fileCount() + this.folderCount()) === 0;
        }
        getDownstreamFileMatch(uri) {
            const directChildFileMatch = this._fileMatches.get(uri);
            if (directChildFileMatch) {
                return directChildFileMatch;
            }
            const folderMatch = this.getFolderMatch(uri);
            const match = folderMatch?.getDownstreamFileMatch(uri);
            if (match) {
                return match;
            }
            return null;
        }
        allDownstreamFileMatches() {
            let recursiveChildren = [];
            const iterator = this.folderMatchesIterator();
            for (const elem of iterator) {
                recursiveChildren = recursiveChildren.concat(elem.allDownstreamFileMatches());
            }
            return [...this.fileMatchesIterator(), ...recursiveChildren];
        }
        fileCount() {
            return this._fileMatches.size;
        }
        folderCount() {
            return this._folderMatches.size;
        }
        count() {
            return this.fileCount() + this.folderCount();
        }
        recursiveFileCount() {
            return this.allDownstreamFileMatches().length;
        }
        recursiveMatchCount() {
            return this.allDownstreamFileMatches().reduce((prev, match) => prev + match.count(), 0);
        }
        get query() {
            return this._query;
        }
        addFileMatch(raw, silent, searchInstanceID) {
            // when adding a fileMatch that has intermediate directories
            const added = [];
            const updated = [];
            raw.forEach(rawFileMatch => {
                const existingFileMatch = this.getDownstreamFileMatch(rawFileMatch.resource);
                if (existingFileMatch) {
                    if (rawFileMatch.results) {
                        rawFileMatch
                            .results
                            .filter(search_1.resultIsMatch)
                            .forEach(m => {
                            textSearchResultToMatches(m, existingFileMatch)
                                .forEach(m => existingFileMatch.add(m));
                        });
                    }
                    // add cell matches
                    if ((0, searchNotebookHelpers_1.isIFileMatchWithCells)(rawFileMatch)) {
                        rawFileMatch.cellResults?.forEach(rawCellMatch => {
                            const existingCellMatch = existingFileMatch.getCellMatch(rawCellMatch.cell.id);
                            if (existingCellMatch) {
                                existingCellMatch.addContentMatches(rawCellMatch.contentResults);
                                existingCellMatch.addWebviewMatches(rawCellMatch.webviewResults);
                            }
                            else {
                                existingFileMatch.addCellMatch(rawCellMatch);
                            }
                        });
                    }
                    updated.push(existingFileMatch);
                    existingFileMatch.addContext(rawFileMatch.results);
                }
                else {
                    if (this instanceof FolderMatchWorkspaceRoot || this instanceof FolderMatchNoRoot) {
                        const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
                        added.push(fileMatch);
                    }
                }
            });
            const elements = [...added, ...updated];
            if (!silent && elements.length) {
                this._onChange.fire({ elements, added: !!added.length });
            }
        }
        doAddFile(fileMatch) {
            this._fileMatches.set(fileMatch.resource, fileMatch);
            if (this._unDisposedFileMatches.has(fileMatch.resource)) {
                this._unDisposedFileMatches.delete(fileMatch.resource);
            }
        }
        hasOnlyReadOnlyMatches() {
            return Array.from(this._fileMatches.values()).every(fm => fm.hasOnlyReadOnlyMatches());
        }
        uriHasParent(parent, child) {
            return this.uriIdentityService.extUri.isEqualOrParent(child, parent) && !this.uriIdentityService.extUri.isEqual(child, parent);
        }
        isInParentChain(folderMatch) {
            let matchItem = this;
            while (matchItem instanceof FolderMatch_1) {
                if (matchItem.id() === folderMatch.id()) {
                    return true;
                }
                matchItem = matchItem.parent();
            }
            return false;
        }
        getFolderMatch(resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            return folderMatch;
        }
        doAddFolder(folderMatch) {
            if (this instanceof FolderMatchWithResource && !this.uriHasParent(this.resource, folderMatch.resource)) {
                throw Error(`${folderMatch.resource} does not belong as a child of ${this.resource}`);
            }
            else if (this.isInParentChain(folderMatch)) {
                throw Error(`${folderMatch.resource} is a parent of ${this.resource}`);
            }
            this._folderMatches.set(folderMatch.resource, folderMatch);
            this._folderMatchesMap.set(folderMatch.resource, folderMatch);
            if (this._unDisposedFolderMatches.has(folderMatch.resource)) {
                this._unDisposedFolderMatches.delete(folderMatch.resource);
            }
        }
        async batchReplace(matches) {
            const allMatches = getFileMatches(matches);
            await this.replaceService.replace(allMatches);
            this.doRemoveFile(allMatches, true, true, true);
        }
        onFileChange(fileMatch, removed = false) {
            let added = false;
            if (!this._fileMatches.has(fileMatch.resource)) {
                this.doAddFile(fileMatch);
                added = true;
            }
            if (fileMatch.count() === 0) {
                this.doRemoveFile([fileMatch], false, false);
                added = false;
                removed = true;
            }
            if (!this._replacingAll) {
                this._onChange.fire({ elements: [fileMatch], added: added, removed: removed });
            }
        }
        onFolderChange(folderMatch, event) {
            if (!this._folderMatches.has(folderMatch.resource)) {
                this.doAddFolder(folderMatch);
            }
            if (folderMatch.isEmpty()) {
                this._folderMatches.delete(folderMatch.resource);
                folderMatch.dispose();
            }
            this._onChange.fire(event);
        }
        doRemoveFile(fileMatches, dispose = true, trigger = true, keepReadonly = false) {
            const removed = [];
            for (const match of fileMatches) {
                if (this._fileMatches.get(match.resource)) {
                    if (keepReadonly && match.hasWebviewMatches()) {
                        continue;
                    }
                    this._fileMatches.delete(match.resource);
                    if (dispose) {
                        match.dispose();
                    }
                    else {
                        this._unDisposedFileMatches.set(match.resource, match);
                    }
                    removed.push(match);
                }
                else {
                    const folder = this.getFolderMatch(match.resource);
                    if (folder) {
                        folder.doRemoveFile([match], dispose, trigger);
                    }
                    else {
                        throw Error(`FileMatch ${match.resource} is not located within FolderMatch ${this.resource}`);
                    }
                }
            }
            if (trigger) {
                this._onChange.fire({ elements: removed, removed: true });
            }
        }
        disposeMatches() {
            [...this._fileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this._folderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
            [...this._unDisposedFileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this._unDisposedFolderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
            this._fileMatches.clear();
            this._folderMatches.clear();
            this._unDisposedFileMatches.clear();
            this._unDisposedFolderMatches.clear();
        }
        dispose() {
            this.disposeMatches();
            this._onDispose.fire();
            super.dispose();
        }
    };
    exports.FolderMatch = FolderMatch;
    exports.FolderMatch = FolderMatch = FolderMatch_1 = __decorate([
        __param(7, replace_1.IReplaceService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, label_1.ILabelService),
        __param(10, uriIdentity_1.IUriIdentityService)
    ], FolderMatch);
    let FolderMatchWithResource = class FolderMatchWithResource extends FolderMatch {
        constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService);
            this._normalizedResource = new lazy_1.Lazy(() => this.uriIdentityService.extUri.removeTrailingPathSeparator(this.uriIdentityService.extUri.normalizePath(this.resource)));
        }
        get resource() {
            return this._resource;
        }
        get normalizedResource() {
            return this._normalizedResource.value;
        }
    };
    exports.FolderMatchWithResource = FolderMatchWithResource;
    exports.FolderMatchWithResource = FolderMatchWithResource = __decorate([
        __param(7, replace_1.IReplaceService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, label_1.ILabelService),
        __param(10, uriIdentity_1.IUriIdentityService)
    ], FolderMatchWithResource);
    /**
     * FolderMatchWorkspaceRoot => folder for workspace root
     */
    let FolderMatchWorkspaceRoot = class FolderMatchWorkspaceRoot extends FolderMatchWithResource {
        constructor(_resource, _id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        normalizedUriParent(uri) {
            return this.uriIdentityService.extUri.normalizePath(this.uriIdentityService.extUri.dirname(uri));
        }
        uriEquals(uri1, ur2) {
            return this.uriIdentityService.extUri.isEqual(uri1, ur2);
        }
        createFileMatch(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID) {
            const fileMatch = this.instantiationService.createInstance(FileMatch, query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID);
            parent.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => parent.onFileChange(fileMatch, didRemove));
            fileMatch.onDispose(() => disposable.dispose());
            return fileMatch;
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            if (!this.uriHasParent(this.resource, rawFileMatch.resource)) {
                throw Error(`${rawFileMatch.resource} is not a descendant of ${this.resource}`);
            }
            const fileMatchParentParts = [];
            let uri = this.normalizedUriParent(rawFileMatch.resource);
            while (!this.uriEquals(this.normalizedResource, uri)) {
                fileMatchParentParts.unshift(uri);
                const prevUri = uri;
                uri = this.uriIdentityService.extUri.removeTrailingPathSeparator(this.normalizedUriParent(uri));
                if (this.uriEquals(prevUri, uri)) {
                    throw Error(`${rawFileMatch.resource} is not correctly configured as a child of ${this.normalizedResource}`);
                }
            }
            const root = this.closestRoot ?? this;
            let parent = this;
            for (let i = 0; i < fileMatchParentParts.length; i++) {
                let folderMatch = parent.getFolderMatch(fileMatchParentParts[i]);
                if (!folderMatch) {
                    folderMatch = parent.createIntermediateFolderMatch(fileMatchParentParts[i], fileMatchParentParts[i].toString(), -1, this._query, root);
                }
                parent = folderMatch;
            }
            return this.createFileMatch(this._query.contentPattern, this._query.previewOptions, this._query.maxResults, parent, rawFileMatch, root, searchInstanceID);
        }
    };
    exports.FolderMatchWorkspaceRoot = FolderMatchWorkspaceRoot;
    exports.FolderMatchWorkspaceRoot = FolderMatchWorkspaceRoot = __decorate([
        __param(5, replace_1.IReplaceService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, label_1.ILabelService),
        __param(8, uriIdentity_1.IUriIdentityService)
    ], FolderMatchWorkspaceRoot);
    /**
     * BaseFolderMatch => optional resource ("other files" node)
     * FolderMatch => required resource (normal folder node)
     */
    let FolderMatchNoRoot = class FolderMatchNoRoot extends FolderMatch {
        constructor(_id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(null, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            const fileMatch = this.instantiationService.createInstance(FileMatch, this._query.contentPattern, this._query.previewOptions, this._query.maxResults, this, rawFileMatch, null, searchInstanceID);
            this.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
            fileMatch.onDispose(() => disposable.dispose());
            return fileMatch;
        }
    };
    exports.FolderMatchNoRoot = FolderMatchNoRoot;
    exports.FolderMatchNoRoot = FolderMatchNoRoot = __decorate([
        __param(4, replace_1.IReplaceService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, label_1.ILabelService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], FolderMatchNoRoot);
    let elemAIndex = -1;
    let elemBIndex = -1;
    /**
     * Compares instances of the same match type. Different match types should not be siblings
     * and their sort order is undefined.
     */
    function searchMatchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        if (elementA instanceof FileMatch && elementB instanceof FolderMatch) {
            return 1;
        }
        if (elementB instanceof FileMatch && elementA instanceof FolderMatch) {
            return -1;
        }
        if (elementA instanceof FolderMatch && elementB instanceof FolderMatch) {
            elemAIndex = elementA.index();
            elemBIndex = elementB.index();
            if (elemAIndex !== -1 && elemBIndex !== -1) {
                return elemAIndex - elemBIndex;
            }
            switch (sortOrder) {
                case "countDescending" /* SearchSortOrder.CountDescending */:
                    return elementB.count() - elementA.count();
                case "countAscending" /* SearchSortOrder.CountAscending */:
                    return elementA.count() - elementB.count();
                case "type" /* SearchSortOrder.Type */:
                    return (0, comparers_1.compareFileExtensions)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
                // Fall through otherwise
                default:
                    if (!elementA.resource || !elementB.resource) {
                        return 0;
                    }
                    return (0, comparers_1.comparePaths)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof FileMatch && elementB instanceof FileMatch) {
            switch (sortOrder) {
                case "countDescending" /* SearchSortOrder.CountDescending */:
                    return elementB.count() - elementA.count();
                case "countAscending" /* SearchSortOrder.CountAscending */:
                    return elementA.count() - elementB.count();
                case "type" /* SearchSortOrder.Type */:
                    return (0, comparers_1.compareFileExtensions)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
                case "modified" /* SearchSortOrder.Modified */: {
                    const fileStatA = elementA.fileStat;
                    const fileStatB = elementB.fileStat;
                    if (fileStatA && fileStatB) {
                        return fileStatB.mtime - fileStatA.mtime;
                    }
                }
                // Fall through otherwise
                default:
                    return (0, comparers_1.comparePaths)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof MatchInNotebook && elementB instanceof MatchInNotebook) {
            return compareNotebookPos(elementA, elementB);
        }
        if (elementA instanceof Match && elementB instanceof Match) {
            return range_1.Range.compareRangesUsingStarts(elementA.range(), elementB.range());
        }
        return 0;
    }
    exports.searchMatchComparer = searchMatchComparer;
    function compareNotebookPos(match1, match2) {
        if (match1.cellIndex === match2.cellIndex) {
            if (match1.webviewIndex !== undefined && match2.webviewIndex !== undefined) {
                return match1.webviewIndex - match2.webviewIndex;
            }
            else if (match1.webviewIndex === undefined && match2.webviewIndex === undefined) {
                return range_1.Range.compareRangesUsingStarts(match1.range(), match2.range());
            }
            else {
                // webview matches should always be after content matches
                if (match1.webviewIndex !== undefined) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        }
        else if (match1.cellIndex < match2.cellIndex) {
            return -1;
        }
        else {
            return 1;
        }
    }
    exports.compareNotebookPos = compareNotebookPos;
    function searchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        const elemAParents = createParentList(elementA);
        const elemBParents = createParentList(elementB);
        let i = elemAParents.length - 1;
        let j = elemBParents.length - 1;
        while (i >= 0 && j >= 0) {
            if (elemAParents[i].id() !== elemBParents[j].id()) {
                return searchMatchComparer(elemAParents[i], elemBParents[j], sortOrder);
            }
            i--;
            j--;
        }
        const elemAAtEnd = i === 0;
        const elemBAtEnd = j === 0;
        if (elemAAtEnd && !elemBAtEnd) {
            return 1;
        }
        else if (!elemAAtEnd && elemBAtEnd) {
            return -1;
        }
        return 0;
    }
    exports.searchComparer = searchComparer;
    function createParentList(element) {
        const parentArray = [];
        let currElement = element;
        while (!(currElement instanceof SearchResult)) {
            parentArray.push(currElement);
            currElement = currElement.parent();
        }
        return parentArray;
    }
    let SearchResult = class SearchResult extends lifecycle_1.Disposable {
        constructor(searchModel, replaceService, instantiationService, modelService, uriIdentityService, notebookEditorService) {
            super();
            this.searchModel = searchModel;
            this.replaceService = replaceService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.uriIdentityService = uriIdentityService;
            this.notebookEditorService = notebookEditorService;
            this._onChange = this._register(new event_1.PauseableEmitter({
                merge: mergeSearchResultEvents
            }));
            this.onChange = this._onChange.event;
            this._folderMatches = [];
            this._otherFilesMatch = null;
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._showHighlights = false;
            this._query = null;
            this.disposePastResults = () => { };
            this._isDirty = false;
            this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations);
            this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
            this._register(this.notebookEditorService.onDidAddNotebookEditor(widget => {
                if (widget instanceof notebookEditorWidget_1.NotebookEditorWidget) {
                    this.onDidAddNotebookEditorWidget(widget);
                }
            }));
            this._register(this.onChange(e => {
                if (e.removed) {
                    this._isDirty = !this.isEmpty();
                }
            }));
        }
        async batchReplace(elementsToReplace) {
            try {
                this._onChange.pause();
                await Promise.all(elementsToReplace.map(async (elem) => {
                    const parent = elem.parent();
                    if ((parent instanceof FolderMatch || parent instanceof FileMatch) && arrayContainsElementOrParent(parent, elementsToReplace)) {
                        // skip any children who have parents in the array
                        return;
                    }
                    if (elem instanceof FileMatch) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof Match) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof FolderMatch) {
                        await elem.replaceAll();
                    }
                }));
            }
            finally {
                this._onChange.resume();
            }
        }
        batchRemove(elementsToRemove) {
            // need to check that we aren't trying to remove elements twice
            const removedElems = [];
            try {
                this._onChange.pause();
                elementsToRemove.forEach((currentElement) => {
                    if (!arrayContainsElementOrParent(currentElement, removedElems)) {
                        currentElement.parent().remove(currentElement);
                        removedElems.push(currentElement);
                    }
                });
            }
            finally {
                this._onChange.resume();
            }
        }
        get isDirty() {
            return this._isDirty;
        }
        get query() {
            return this._query;
        }
        set query(query) {
            // When updating the query we could change the roots, so keep a reference to them to clean up when we trigger `disposePastResults`
            const oldFolderMatches = this.folderMatches();
            new Promise(resolve => this.disposePastResults = resolve)
                .then(() => oldFolderMatches.forEach(match => match.clear()))
                .then(() => oldFolderMatches.forEach(match => match.dispose()))
                .then(() => this._isDirty = false);
            this._rangeHighlightDecorations.removeHighlightRange();
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            if (!query) {
                return;
            }
            this._folderMatches = (query && query.folderQueries || [])
                .map(fq => fq.folder)
                .map((resource, index) => this._createBaseFolderMatch(resource, resource.toString(), index, query));
            this._folderMatches.forEach(fm => this._folderMatchesMap.set(fm.resource, fm));
            this._otherFilesMatch = this._createBaseFolderMatch(null, 'otherFiles', this._folderMatches.length + 1, query);
            this._query = query;
        }
        onDidAddNotebookEditorWidget(widget) {
            this._onWillChangeModelListener?.dispose();
            this._onWillChangeModelListener = widget.onWillChangeModel((model) => {
                if (model) {
                    this.onNotebookEditorWidgetRemoved(widget, model?.uri);
                }
            });
            this._onDidChangeModelListener?.dispose();
            // listen to view model change as we are searching on both inputs and outputs
            this._onDidChangeModelListener = widget.onDidAttachViewModel(() => {
                if (widget.hasModel()) {
                    this.onNotebookEditorWidgetAdded(widget, widget.textModel.uri);
                }
            });
        }
        onModelAdded(model) {
            const folderMatch = this._folderMatchesMap.findSubstr(model.uri);
            folderMatch?.bindModel(model);
        }
        async onNotebookEditorWidgetAdded(editor, resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            await folderMatch?.bindNotebookEditorWidget(editor, resource);
        }
        onNotebookEditorWidgetRemoved(editor, resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            folderMatch?.unbindNotebookEditorWidget(editor, resource);
        }
        _createBaseFolderMatch(resource, id, index, query) {
            let folderMatch;
            if (resource) {
                folderMatch = this.instantiationService.createInstance(FolderMatchWorkspaceRoot, resource, id, index, query, this);
            }
            else {
                folderMatch = this.instantiationService.createInstance(FolderMatchNoRoot, id, index, query, this);
            }
            const disposable = folderMatch.onChange((event) => this._onChange.fire(event));
            folderMatch.onDispose(() => disposable.dispose());
            return folderMatch;
        }
        add(allRaw, searchInstanceID, silent = false) {
            // Split up raw into a list per folder so we can do a batch add per folder.
            const { byFolder, other } = this.groupFilesByFolder(allRaw);
            byFolder.forEach(raw => {
                if (!raw.length) {
                    return;
                }
                const folderMatch = this.getFolderMatch(raw[0].resource);
                folderMatch?.addFileMatch(raw, silent, searchInstanceID);
            });
            this._otherFilesMatch?.addFileMatch(other, silent, searchInstanceID);
            this.disposePastResults();
        }
        clear() {
            this.folderMatches().forEach((folderMatch) => folderMatch.clear(true));
            this.disposeMatches();
            this._folderMatches = [];
            this._otherFilesMatch = null;
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            matches.forEach(m => {
                if (m instanceof FolderMatch) {
                    m.clear();
                }
            });
            const fileMatches = matches.filter(m => m instanceof FileMatch);
            const { byFolder, other } = this.groupFilesByFolder(fileMatches);
            byFolder.forEach(matches => {
                if (!matches.length) {
                    return;
                }
                this.getFolderMatch(matches[0].resource).remove(matches);
            });
            if (other.length) {
                this.getFolderMatch(other[0].resource).remove(other);
            }
        }
        replace(match) {
            return this.getFolderMatch(match.resource).replace(match);
        }
        replaceAll(progress) {
            this.replacingAll = true;
            const promise = this.replaceService.replace(this.matches(), progress);
            return promise.then(() => {
                this.replacingAll = false;
                this.clear();
            }, () => {
                this.replacingAll = false;
            });
        }
        folderMatches() {
            return this._otherFilesMatch ?
                [
                    ...this._folderMatches,
                    this._otherFilesMatch
                ] :
                [
                    ...this._folderMatches
                ];
        }
        matches() {
            const matches = [];
            this.folderMatches().forEach(folderMatch => {
                matches.push(folderMatch.allDownstreamFileMatches());
            });
            return [].concat(...matches);
        }
        isEmpty() {
            return this.folderMatches().every((folderMatch) => folderMatch.isEmpty());
        }
        fileCount() {
            return this.folderMatches().reduce((prev, match) => prev + match.recursiveFileCount(), 0);
        }
        count() {
            return this.matches().reduce((prev, match) => prev + match.count(), 0);
        }
        get showHighlights() {
            return this._showHighlights;
        }
        toggleHighlights(value) {
            if (this._showHighlights === value) {
                return;
            }
            this._showHighlights = value;
            let selectedMatch = null;
            this.matches().forEach((fileMatch) => {
                fileMatch.updateHighlights();
                fileMatch.updateNotebookHighlights();
                if (!selectedMatch) {
                    selectedMatch = fileMatch.getSelectedMatch();
                }
            });
            if (this._showHighlights && selectedMatch) {
                // TS?
                this._rangeHighlightDecorations.highlightRange(selectedMatch.parent().resource, selectedMatch.range());
            }
            else {
                this._rangeHighlightDecorations.removeHighlightRange();
            }
        }
        get rangeHighlightDecorations() {
            return this._rangeHighlightDecorations;
        }
        getFolderMatch(resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            return folderMatch ? folderMatch : this._otherFilesMatch;
        }
        set replacingAll(running) {
            this.folderMatches().forEach((folderMatch) => {
                folderMatch.replacingAll = running;
            });
        }
        groupFilesByFolder(fileMatches) {
            const rawPerFolder = new map_1.ResourceMap();
            const otherFileMatches = [];
            this._folderMatches.forEach(fm => rawPerFolder.set(fm.resource, []));
            fileMatches.forEach(rawFileMatch => {
                const folderMatch = this.getFolderMatch(rawFileMatch.resource);
                if (!folderMatch) {
                    // foldermatch was previously removed by user or disposed for some reason
                    return;
                }
                const resource = folderMatch.resource;
                if (resource) {
                    rawPerFolder.get(resource).push(rawFileMatch);
                }
                else {
                    otherFileMatches.push(rawFileMatch);
                }
            });
            return {
                byFolder: rawPerFolder,
                other: otherFileMatches
            };
        }
        disposeMatches() {
            this.folderMatches().forEach(folderMatch => folderMatch.dispose());
            this._folderMatches = [];
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._rangeHighlightDecorations.removeHighlightRange();
        }
        dispose() {
            this._onWillChangeModelListener?.dispose();
            this._onDidChangeModelListener?.dispose();
            this.disposePastResults();
            this.disposeMatches();
            this._rangeHighlightDecorations.dispose();
            super.dispose();
        }
    };
    exports.SearchResult = SearchResult;
    exports.SearchResult = SearchResult = __decorate([
        __param(1, replace_1.IReplaceService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, model_2.IModelService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, notebookEditorService_1.INotebookEditorService)
    ], SearchResult);
    let SearchModel = class SearchModel extends lifecycle_1.Disposable {
        constructor(searchService, telemetryService, configurationService, instantiationService, logService, notebookSearchService) {
            super();
            this.searchService = searchService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.notebookSearchService = notebookSearchService;
            this._searchQuery = null;
            this._replaceActive = false;
            this._replaceString = null;
            this._replacePattern = null;
            this._preserveCase = false;
            this._startStreamDelay = Promise.resolve();
            this._resultQueue = [];
            this._onReplaceTermChanged = this._register(new event_1.Emitter());
            this.onReplaceTermChanged = this._onReplaceTermChanged.event;
            this._onSearchResultChanged = this._register(new event_1.PauseableEmitter({
                merge: mergeSearchResultEvents
            }));
            this.onSearchResultChanged = this._onSearchResultChanged.event;
            this.currentCancelTokenSource = null;
            this.searchCancelledForNewSearch = false;
            this._searchResult = this.instantiationService.createInstance(SearchResult, this);
            this._searchResultChangedListener = this._register(this._searchResult.onChange((e) => this._onSearchResultChanged.fire(e)));
        }
        isReplaceActive() {
            return this._replaceActive;
        }
        set replaceActive(replaceActive) {
            this._replaceActive = replaceActive;
        }
        get replacePattern() {
            return this._replacePattern;
        }
        get replaceString() {
            return this._replaceString || '';
        }
        set preserveCase(value) {
            this._preserveCase = value;
        }
        get preserveCase() {
            return this._preserveCase;
        }
        set replaceString(replaceString) {
            this._replaceString = replaceString;
            if (this._searchQuery) {
                this._replacePattern = new replace_2.ReplacePattern(replaceString, this._searchQuery.contentPattern);
            }
            this._onReplaceTermChanged.fire();
        }
        get searchResult() {
            return this._searchResult;
        }
        set searchResult(searchResult) {
            this._searchResult.dispose();
            this._searchResultChangedListener.dispose();
            this._searchResult = searchResult;
            this._searchResult.searchModel = this;
            this._searchResultChangedListener = this._register(this._searchResult.onChange((e) => this._onSearchResultChanged.fire(e)));
        }
        doSearch(query, progressEmitter, searchQuery, searchInstanceID, onProgress, callerToken) {
            const asyncGenerateOnProgress = async (p) => {
                progressEmitter.fire();
                this.onSearchProgress(p, searchInstanceID, false);
                onProgress?.(p);
            };
            const syncGenerateOnProgress = (p) => {
                progressEmitter.fire();
                this.onSearchProgress(p, searchInstanceID, true);
                onProgress?.(p);
            };
            const tokenSource = this.currentCancelTokenSource = new cancellation_1.CancellationTokenSource(callerToken);
            const notebookResult = this.notebookSearchService.notebookSearch(query, tokenSource.token, searchInstanceID, asyncGenerateOnProgress);
            const textResult = this.searchService.textSearchSplitSyncAsync(searchQuery, this.currentCancelTokenSource.token, asyncGenerateOnProgress, notebookResult.openFilesToScan, notebookResult.allScannedFiles);
            const syncResults = textResult.syncResults.results;
            syncResults.forEach(p => { if (p) {
                syncGenerateOnProgress(p);
            } });
            const getAsyncResults = async () => {
                const searchStart = Date.now();
                // resolve async parts of search
                const allClosedEditorResults = await textResult.asyncResults;
                const resolvedNotebookResults = await notebookResult.completeData;
                tokenSource.dispose();
                const searchLength = Date.now() - searchStart;
                const resolvedResult = {
                    results: [...allClosedEditorResults.results, ...resolvedNotebookResults.results],
                    messages: [...allClosedEditorResults.messages, ...resolvedNotebookResults.messages],
                    limitHit: allClosedEditorResults.limitHit || resolvedNotebookResults.limitHit,
                    exit: allClosedEditorResults.exit,
                    stats: allClosedEditorResults.stats,
                };
                this.logService.trace(`whole search time | ${searchLength}ms`);
                return resolvedResult;
            };
            return {
                asyncResults: getAsyncResults(),
                syncResults
            };
        }
        search(query, onProgress, callerToken) {
            this.cancelSearch(true);
            this._searchQuery = query;
            if (!this.searchConfig.searchOnType) {
                this.searchResult.clear();
            }
            const searchInstanceID = Date.now().toString();
            this._searchResult.query = this._searchQuery;
            const progressEmitter = new event_1.Emitter();
            this._replacePattern = new replace_2.ReplacePattern(this.replaceString, this._searchQuery.contentPattern);
            // In search on type case, delay the streaming of results just a bit, so that we don't flash the only "local results" fast path
            this._startStreamDelay = new Promise(resolve => setTimeout(resolve, this.searchConfig.searchOnType ? 150 : 0));
            const req = this.doSearch(query, progressEmitter, this._searchQuery, searchInstanceID, onProgress, callerToken);
            const asyncResults = req.asyncResults;
            const syncResults = req.syncResults;
            if (onProgress) {
                syncResults.forEach(p => {
                    if (p) {
                        onProgress(p);
                    }
                });
            }
            const start = Date.now();
            Promise.race([asyncResults, event_1.Event.toPromise(progressEmitter.event)]).finally(() => {
                /* __GDPR__
                    "searchResultsFirstRender" : {
                        "owner": "roblourens",
                        "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                    }
                */
                this.telemetryService.publicLog('searchResultsFirstRender', { duration: Date.now() - start });
            });
            try {
                return {
                    asyncResults: asyncResults.then(value => {
                        this.onSearchCompleted(value, Date.now() - start, searchInstanceID);
                        return value;
                    }, e => {
                        this.onSearchError(e, Date.now() - start);
                        throw e;
                    }),
                    syncResults
                };
            }
            finally {
                /* __GDPR__
                    "searchResultsFinished" : {
                        "owner": "roblourens",
                        "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                    }
                */
                this.telemetryService.publicLog('searchResultsFinished', { duration: Date.now() - start });
            }
        }
        onSearchCompleted(completed, duration, searchInstanceID) {
            if (!this._searchQuery) {
                throw new Error('onSearchCompleted must be called after a search is started');
            }
            this._searchResult.add(this._resultQueue, searchInstanceID);
            this._resultQueue.length = 0;
            const options = Object.assign({}, this._searchQuery.contentPattern);
            delete options.pattern;
            const stats = completed && completed.stats;
            const fileSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
            const scheme = fileSchemeOnly ? network_1.Schemas.file :
                otherSchemeOnly ? 'other' :
                    'mixed';
            /* __GDPR__
                "searchResultsShown" : {
                    "owner": "roblourens",
                    "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "fileCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "options": { "${inline}": [ "${IPatternInfo}" ] },
                    "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "type" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "scheme" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "searchOnTypeEnabled" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('searchResultsShown', {
                count: this._searchResult.count(),
                fileCount: this._searchResult.fileCount(),
                options,
                duration,
                type: stats && stats.type,
                scheme,
                searchOnTypeEnabled: this.searchConfig.searchOnType
            });
            return completed;
        }
        onSearchError(e, duration) {
            if (errors.isCancellationError(e)) {
                this.onSearchCompleted(this.searchCancelledForNewSearch
                    ? { exit: 1 /* SearchCompletionExitCode.NewSearchStarted */, results: [], messages: [] }
                    : null, duration, '');
                this.searchCancelledForNewSearch = false;
            }
        }
        onSearchProgress(p, searchInstanceID, sync = true) {
            if (p.resource) {
                this._resultQueue.push(p);
                if (sync) {
                    if (this._resultQueue.length) {
                        this._searchResult.add(this._resultQueue, searchInstanceID, true);
                        this._resultQueue.length = 0;
                    }
                }
                else {
                    this._startStreamDelay.then(() => {
                        if (this._resultQueue.length) {
                            this._searchResult.add(this._resultQueue, searchInstanceID, true);
                            this._resultQueue.length = 0;
                        }
                    });
                }
            }
        }
        get searchConfig() {
            return this.configurationService.getValue('search');
        }
        cancelSearch(cancelledForNewSearch = false) {
            if (this.currentCancelTokenSource) {
                this.searchCancelledForNewSearch = cancelledForNewSearch;
                this.currentCancelTokenSource.cancel();
                return true;
            }
            return false;
        }
        dispose() {
            this.cancelSearch();
            this.searchResult.dispose();
            super.dispose();
        }
        transferSearchResult(other) {
            other.searchResult = this._searchResult;
            this._searchResult = this.instantiationService.createInstance(SearchResult, this);
        }
    };
    exports.SearchModel = SearchModel;
    exports.SearchModel = SearchModel = __decorate([
        __param(0, search_1.ISearchService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, log_1.ILogService),
        __param(5, notebookSearch_1.INotebookSearchService)
    ], SearchModel);
    let SearchViewModelWorkbenchService = class SearchViewModelWorkbenchService {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
            this._searchModel = null;
        }
        get searchModel() {
            if (!this._searchModel) {
                this._searchModel = this.instantiationService.createInstance(SearchModel);
            }
            return this._searchModel;
        }
    };
    exports.SearchViewModelWorkbenchService = SearchViewModelWorkbenchService;
    exports.SearchViewModelWorkbenchService = SearchViewModelWorkbenchService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], SearchViewModelWorkbenchService);
    exports.ISearchViewModelWorkbenchService = (0, instantiation_1.createDecorator)('searchViewModelWorkbenchService');
    /**
     * Can add a range highlight decoration to a model.
     * It will automatically remove it when the model has its decorations changed.
     */
    let RangeHighlightDecorations = class RangeHighlightDecorations {
        static { RangeHighlightDecorations_1 = this; }
        constructor(_modelService) {
            this._modelService = _modelService;
            this._decorationId = null;
            this._model = null;
            this._modelDisposables = new lifecycle_1.DisposableStore();
        }
        removeHighlightRange() {
            if (this._model && this._decorationId) {
                const decorationId = this._decorationId;
                this._model.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                });
            }
            this._decorationId = null;
        }
        highlightRange(resource, range, ownerId = 0) {
            let model;
            if (uri_1.URI.isUri(resource)) {
                model = this._modelService.getModel(resource);
            }
            else {
                model = resource;
            }
            if (model) {
                this.doHighlightRange(model, range);
            }
        }
        doHighlightRange(model, range) {
            this.removeHighlightRange();
            model.changeDecorations((accessor) => {
                this._decorationId = accessor.addDecoration(range, RangeHighlightDecorations_1._RANGE_HIGHLIGHT_DECORATION);
            });
            this.setModel(model);
        }
        setModel(model) {
            if (this._model !== model) {
                this.clearModelListeners();
                this._model = model;
                this._modelDisposables.add(this._model.onDidChangeDecorations((e) => {
                    this.clearModelListeners();
                    this.removeHighlightRange();
                    this._model = null;
                }));
                this._modelDisposables.add(this._model.onWillDispose(() => {
                    this.clearModelListeners();
                    this.removeHighlightRange();
                    this._model = null;
                }));
            }
        }
        clearModelListeners() {
            this._modelDisposables.clear();
        }
        dispose() {
            if (this._model) {
                this.removeHighlightRange();
                this._modelDisposables.dispose();
                this._model = null;
            }
        }
        static { this._RANGE_HIGHLIGHT_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'search-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
    };
    exports.RangeHighlightDecorations = RangeHighlightDecorations;
    exports.RangeHighlightDecorations = RangeHighlightDecorations = RangeHighlightDecorations_1 = __decorate([
        __param(0, model_2.IModelService)
    ], RangeHighlightDecorations);
    function textSearchResultToMatches(rawMatch, fileMatch) {
        const previewLines = rawMatch.preview.text.split('\n');
        if (Array.isArray(rawMatch.ranges)) {
            return rawMatch.ranges.map((r, i) => {
                const previewRange = rawMatch.preview.matches[i];
                return new Match(fileMatch, previewLines, previewRange, r);
            });
        }
        else {
            const previewRange = rawMatch.preview.matches;
            const match = new Match(fileMatch, previewLines, previewRange, rawMatch.ranges);
            return [match];
        }
    }
    // text search to notebook matches
    function textSearchMatchesToNotebookMatches(textSearchMatches, cell) {
        const notebookMatches = [];
        textSearchMatches.map((textSearchMatch) => {
            const previewLines = textSearchMatch.preview.text.split('\n');
            if (Array.isArray(textSearchMatch.ranges)) {
                textSearchMatch.ranges.forEach((r, i) => {
                    const previewRange = textSearchMatch.preview.matches[i];
                    const match = new MatchInNotebook(cell, previewLines, previewRange, r, textSearchMatch.webviewIndex);
                    notebookMatches.push(match);
                });
            }
            else {
                const previewRange = textSearchMatch.preview.matches;
                const match = new MatchInNotebook(cell, previewLines, previewRange, textSearchMatch.ranges, textSearchMatch.webviewIndex);
                notebookMatches.push(match);
            }
        });
        return notebookMatches;
    }
    exports.textSearchMatchesToNotebookMatches = textSearchMatchesToNotebookMatches;
    function arrayContainsElementOrParent(element, testArray) {
        do {
            if (testArray.includes(element)) {
                return true;
            }
        } while (!(element.parent() instanceof SearchResult) && (element = element.parent()));
        return false;
    }
    exports.arrayContainsElementOrParent = arrayContainsElementOrParent;
    function getFileMatches(matches) {
        const folderMatches = [];
        const fileMatches = [];
        matches.forEach((e) => {
            if (e instanceof FileMatch) {
                fileMatches.push(e);
            }
            else {
                folderMatches.push(e);
            }
        });
        return fileMatches.concat(folderMatches.map(e => e.allDownstreamFileMatches()).flat());
    }
    function mergeSearchResultEvents(events) {
        const retEvent = {
            elements: [],
            added: false,
            removed: false,
        };
        events.forEach((e) => {
            if (e.added) {
                retEvent.added = true;
            }
            if (e.removed) {
                retEvent.removed = true;
            }
            retEvent.elements = retEvent.elements.concat(e.elements);
        });
        return retEvent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMENoRyxNQUFhLEtBQUs7aUJBRU8sc0JBQWlCLEdBQUcsR0FBRyxDQUFDO1FBUWhELFlBQXNCLE9BQWtCLEVBQVUsaUJBQTJCLEVBQUUsaUJBQStCLEVBQUUsY0FBNEI7WUFBdEgsWUFBTyxHQUFQLE9BQU8sQ0FBVztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBVTtZQUM1RSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDaEYsTUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxLQUFLLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM3RixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztZQUNqQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV0RyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBSyxDQUN0QixjQUFjLENBQUMsZUFBZSxHQUFHLENBQUMsRUFDbEMsY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQzlCLGNBQWMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUNoQyxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztZQUUzQyxJQUFJLENBQUMs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