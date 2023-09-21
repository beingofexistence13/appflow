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
    var $SMb_1, $TMb_1, $5Mb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7Mb = exports.$6Mb = exports.$5Mb = exports.$4Mb = exports.$3Mb = exports.$2Mb = exports.$1Mb = exports.$ZMb = exports.$YMb = exports.$XMb = exports.$WMb = exports.$VMb = exports.$UMb = exports.$TMb = exports.$SMb = exports.$RMb = exports.$QMb = exports.$PMb = void 0;
    class $PMb {
        static { this.c = 250; }
        constructor(l, n, _fullPreviewRange, _documentRange) {
            this.l = l;
            this.n = n;
            this.g = n[_fullPreviewRange.startLineNumber];
            const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ?
                _fullPreviewRange.endColumn :
                this.g.length;
            this.h = new search_1.$vI(1, _fullPreviewRange.startColumn + 1, adjustedEndCol + 1);
            this.f = new range_1.$ks(_documentRange.startLineNumber + 1, _documentRange.startColumn + 1, _documentRange.endLineNumber + 1, _documentRange.endColumn + 1);
            this.k = _fullPreviewRange;
            this.d = this.l.id() + '>' + this.f + this.getMatchString();
        }
        id() {
            return this.d;
        }
        parent() {
            return this.l;
        }
        text() {
            return this.g;
        }
        range() {
            return this.f;
        }
        preview() {
            let before = this.g.substring(0, this.h.startColumn - 1), inside = this.getMatchString(), after = this.g.substring(this.h.endColumn - 1);
            before = (0, strings_1.$7e)(before, 26);
            before = before.trimStart();
            let charsRemaining = $PMb.c - before.length;
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
                thisMatchPreviewLines = this.n;
            }
            else {
                thisMatchPreviewLines = this.n.slice(this.k.startLineNumber, this.k.endLineNumber + 1);
                thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(0, this.k.endColumn);
                thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(this.k.startColumn);
            }
            return thisMatchPreviewLines.join('\n');
        }
        rangeInPreview() {
            // convert to editor's base 1 positions.
            return {
                ...this.k,
                startColumn: this.k.startColumn + 1,
                endColumn: this.k.endColumn + 1
            };
        }
        fullPreviewLines() {
            return this.n.slice(this.k.startLineNumber, this.k.endLineNumber + 1);
        }
        getMatchString() {
            return this.g.substring(this.h.startColumn - 1, this.h.endColumn - 1);
        }
    }
    exports.$PMb = $PMb;
    __decorate([
        decorators_1.$6g
    ], $PMb.prototype, "preview", null);
    class $QMb {
        constructor(g, h, k) {
            this.g = g;
            this.h = h;
            this.k = k;
            this.c = new Map();
            this.d = new Map();
            this.f = new Map();
        }
        get context() {
            return new Map(this.f);
        }
        matches() {
            return [...this.c.values(), ...this.d.values()];
        }
        get contentMatches() {
            return Array.from(this.c.values());
        }
        get webviewMatches() {
            return Array.from(this.d.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this.c.delete(match.id());
                this.d.delete(match.id());
            }
        }
        clearAllMatches() {
            this.c.clear();
            this.d.clear();
        }
        addContentMatches(textSearchMatches) {
            const contentMatches = $6Mb(textSearchMatches, this);
            contentMatches.forEach((match) => {
                this.c.set(match.id(), match);
            });
            this.addContext(textSearchMatches);
        }
        addContext(textSearchMatches) {
            if (this.cell instanceof searchNotebookHelpers_1.$KMb) {
                // todo: get closed notebook results in search editor
                return;
            }
            this.cell.resolveTextModel().then((textModel) => {
                const textResultsWithContext = (0, searchHelpers_1.$OMb)(textSearchMatches, textModel, this.parent.parent().query);
                const contexts = textResultsWithContext.filter((result => !(0, search_1.$pI)(result)));
                contexts.map(context => ({ ...context, lineNumber: context.lineNumber + 1 }))
                    .forEach((context) => { this.f.set(context.lineNumber, context.text); });
            });
        }
        addWebviewMatches(textSearchMatches) {
            const webviewMatches = $6Mb(textSearchMatches, this);
            webviewMatches.forEach((match) => {
                this.d.set(match.id(), match);
            });
            // TODO: add webview results to context
        }
        setCellModel(cell) {
            this.h = cell;
        }
        get parent() {
            return this.g;
        }
        get id() {
            return this.h.id;
        }
        get cellIndex() {
            return this.k;
        }
        get cell() {
            return this.h;
        }
    }
    exports.$QMb = $QMb;
    class $RMb extends $PMb {
        constructor(q, _fullPreviewLines, _fullPreviewRange, _documentRange, webviewIndex) {
            super(q.parent, _fullPreviewLines, _fullPreviewRange, _documentRange);
            this.q = q;
            this.d = this.l.id() + '>' + this.q.cellIndex + (webviewIndex ? '_' + webviewIndex : '') + '_' + this.s() + this.f + this.getMatchString();
            this.o = webviewIndex;
        }
        parent() {
            return this.q.parent;
        }
        get cellParent() {
            return this.q;
        }
        s() {
            return this.isWebviewMatch() ? 'webview' : 'content';
        }
        isWebviewMatch() {
            return this.o !== undefined;
        }
        get cellIndex() {
            return this.q.cellIndex;
        }
        get webviewIndex() {
            return this.o;
        }
        get cell() {
            return this.q.cell;
        }
    }
    exports.$RMb = $RMb;
    let $SMb = class $SMb extends lifecycle_1.$kc {
        static { $SMb_1 = this; }
        static { this.c = textModel_1.$RC.register({
            description: 'search-current-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 13,
            className: 'currentFindMatch',
            overviewRuler: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$zy),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$By),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this.f = textModel_1.$RC.register({
            description: 'search-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'findMatch',
            overviewRuler: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$zy),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.$hv)(colorRegistry_1.$By),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static g(selected) {
            return (selected ? $SMb_1.c : $SMb_1.f);
        }
        get context() {
            return new Map(this.I);
        }
        get cellContext() {
            const cellContext = new Map();
            this.z.forEach(cellMatch => {
                cellContext.set(cellMatch.id, cellMatch.context);
            });
            return cellContext;
        }
        // #endregion
        constructor(P, Q, R, S, U, W, X, Y, Z, labelService, $) {
            super();
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.labelService = labelService;
            this.$ = $;
            this.h = this.B(new event_1.$fd());
            this.onChange = this.h.event;
            this.n = this.B(new event_1.$fd());
            this.onDispose = this.n.event;
            this.u = null;
            this.w = null;
            this.D = null;
            this.H = [];
            this.I = new Map();
            // #region notebook fields
            this.J = null;
            this.L = null;
            this.fb = Promise.resolve();
            this.s = this.U.resource;
            this.y = new Map();
            this.C = new Set();
            this.G = new async_1.$Sg(this.cb.bind(this), 250);
            this.F = new lazy_1.$T(() => labelService.getUriBasenameLabel(this.resource));
            this.z = new Map();
            this.M = new async_1.$Sg(this.updateMatchesForEditorWidget.bind(this), 250);
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
            return this.z.get(cellID);
        }
        addCellMatch(rawCell) {
            const cellMatch = new $QMb(this, rawCell.cell, rawCell.index);
            this.z.set(cellMatch.id, cellMatch);
            this.addWebviewMatchesToCell(rawCell.cell.id, rawCell.webviewResults);
            this.addContentMatchesToCell(rawCell.cell.id, rawCell.contentResults);
        }
        get closestRoot() {
            return this.W;
        }
        hasWebviewMatches() {
            return this.matches().some(m => m instanceof $RMb && m.isWebviewMatch());
        }
        createMatches() {
            const model = this.Y.getModel(this.s);
            if (model) {
                this.bindModel(model);
                this.cb();
            }
            else {
                const notebookEditorWidgetBorrow = this.$.retrieveExistingWidgetFromURI(this.resource);
                if (notebookEditorWidgetBorrow?.value) {
                    this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
                }
                if (this.U.results) {
                    this.U.results
                        .filter(search_1.$pI)
                        .forEach(rawMatch => {
                        textSearchResultToMatches(rawMatch, this)
                            .forEach(m => this.add(m));
                    });
                }
                if ((0, searchNotebookHelpers_1.$FMb)(this.U)) {
                    this.U.cellResults?.forEach(cell => this.addCellMatch(cell));
                    this.kb(this.cellMatches());
                    this.h.fire({ forceUpdateModel: true });
                }
                this.addContext(this.U.results);
            }
        }
        bindModel(model) {
            this.u = model;
            this.w = this.u.onDidChangeContent(() => {
                this.G.schedule();
            });
            this.u.onWillDispose(() => this.ab());
            this.updateHighlights();
        }
        ab() {
            // Update matches because model might have some dirty changes
            this.cb();
            this.bb();
        }
        bb() {
            if (this.u) {
                this.G.cancel();
                this.u.changeDecorations((accessor) => {
                    this.H = accessor.deltaDecorations(this.H, []);
                });
                this.u = null;
                this.w.dispose();
            }
        }
        cb() {
            // this is called from a timeout and might fire
            // after the model has been disposed
            if (!this.u) {
                return;
            }
            this.y = new Map();
            const wordSeparators = this.P.isWordMatch && this.P.wordSeparators ? this.P.wordSeparators : null;
            const matches = this.u
                .findMatches(this.P.pattern, this.u.getFullModelRange(), !!this.P.isRegExp, !!this.P.isCaseSensitive, wordSeparators, false, this.R ?? Number.MAX_SAFE_INTEGER);
            this.eb(matches, true, this.u);
        }
        async db(lineNumber, modelChange) {
            if (!this.u) {
                return;
            }
            const range = {
                startLineNumber: lineNumber,
                startColumn: this.u.getLineMinColumn(lineNumber),
                endLineNumber: lineNumber,
                endColumn: this.u.getLineMaxColumn(lineNumber)
            };
            const oldMatches = Array.from(this.y.values()).filter(match => match.range().startLineNumber === lineNumber);
            oldMatches.forEach(match => this.y.delete(match.id()));
            const wordSeparators = this.P.isWordMatch && this.P.wordSeparators ? this.P.wordSeparators : null;
            const matches = this.u.findMatches(this.P.pattern, range, !!this.P.isRegExp, !!this.P.isCaseSensitive, wordSeparators, false, this.R ?? Number.MAX_SAFE_INTEGER);
            this.eb(matches, modelChange, this.u);
            // await this.updateMatchesForEditorWidget();
        }
        eb(matches, modelChange, model) {
            const textSearchResults = (0, searchHelpers_1.$NMb)(matches, model, this.Q);
            textSearchResults.forEach(textSearchResult => {
                textSearchResultToMatches(textSearchResult, this).forEach(match => {
                    if (!this.C.has(match.id())) {
                        this.add(match);
                        if (this.isMatchSelected(match)) {
                            this.D = match;
                        }
                    }
                });
            });
            this.addContext((0, searchHelpers_1.$OMb)(textSearchResults, model, this.parent().parent().query)
                .filter((result => !(0, search_1.$pI)(result)))
                .map(context => ({ ...context, lineNumber: context.lineNumber + 1 })));
            this.h.fire({ forceUpdateModel: modelChange });
            this.updateHighlights();
        }
        updateHighlights() {
            if (!this.u) {
                return;
            }
            this.u.changeDecorations((accessor) => {
                const newDecorations = (this.parent().showHighlights
                    ? this.matches().map(match => ({
                        range: match.range(),
                        options: $SMb_1.g(this.isMatchSelected(match))
                    }))
                    : []);
                this.H = accessor.deltaDecorations(this.H, newDecorations);
            });
        }
        id() {
            return this.resource.toString();
        }
        parent() {
            return this.S;
        }
        matches() {
            const cellMatches = Array.from(this.z.values()).flatMap((e) => e.matches());
            return [...this.y.values(), ...cellMatches];
        }
        textMatches() {
            return Array.from(this.y.values());
        }
        cellMatches() {
            return Array.from(this.z.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this.gb(match);
                this.C.add(match.id());
            }
            this.h.fire({ didRemove: true });
        }
        async replace(toReplace) {
            return this.fb = this.fb.finally(async () => {
                await this.Z.replace(toReplace);
                await this.db(toReplace.range().startLineNumber, false);
            });
        }
        setSelectedMatch(match) {
            if (match) {
                if (!this.isMatchSelected(match) && match instanceof $RMb) {
                    this.D = match;
                    return;
                }
                if (!this.y.has(match.id())) {
                    return;
                }
                if (this.isMatchSelected(match)) {
                    return;
                }
            }
            this.D = match;
            this.updateHighlights();
        }
        getSelectedMatch() {
            return this.D;
        }
        isMatchSelected(match) {
            return !!this.D && this.D.id() === match.id();
        }
        count() {
            return this.matches().length;
        }
        get resource() {
            return this.s;
        }
        name() {
            return this.F.value;
        }
        addContext(results) {
            if (!results) {
                return;
            }
            const contexts = results
                .filter((result => !(0, search_1.$pI)(result)));
            return contexts.forEach(context => this.I.set(context.lineNumber, context.text));
        }
        add(match, trigger) {
            this.y.set(match.id(), match);
            if (trigger) {
                this.h.fire({ forceUpdateModel: true });
            }
        }
        gb(match) {
            if (match instanceof $RMb) {
                match.cellParent.remove(match);
                if (match.cellParent.matches().length === 0) {
                    this.z.delete(match.cellParent.id);
                }
            }
            else {
                this.y.delete(match.id());
            }
            if (this.isMatchSelected(match)) {
                this.setSelectedMatch(null);
                this.N?.clearCurrentFindMatchDecoration();
            }
            else {
                this.updateHighlights();
            }
            if (match instanceof $RMb) {
                this.kb(this.cellMatches());
            }
        }
        async resolveFileStat(fileService) {
            this.t = await fileService.stat(this.resource).catch(() => undefined);
        }
        get fileStat() {
            return this.t;
        }
        set fileStat(stat) {
            this.t = stat;
        }
        dispose() {
            this.setSelectedMatch(null);
            this.bb();
            this.unbindNotebookEditorWidget();
            this.n.fire();
            super.dispose();
        }
        hasOnlyReadOnlyMatches() {
            return this.matches().every(match => (match instanceof $RMb && match.isWebviewMatch()));
        }
        // #region strictly notebook methods
        bindNotebookEditorWidget(widget) {
            if (this.J === widget) {
                return;
            }
            this.J = widget;
            this.L = this.J.textModel?.onDidChangeContent((e) => {
                if (!e.rawEvents.some(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellContent || event.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange)) {
                    return;
                }
                this.M.schedule();
            }) ?? null;
            this.hb();
        }
        unbindNotebookEditorWidget(widget) {
            if (widget && this.J !== widget) {
                return;
            }
            if (this.J) {
                this.M.cancel();
                this.L?.dispose();
            }
            this.ib();
            this.J = null;
        }
        updateNotebookHighlights() {
            if (this.parent().showHighlights) {
                this.hb();
                this.kb(Array.from(this.z.values()));
            }
            else {
                this.ib();
            }
        }
        hb() {
            if (!this.J) {
                return;
            }
            this.N?.stopWebviewFind();
            this.N?.dispose();
            this.N = new findMatchDecorationModel_1.$wob(this.J, this.X);
            if (this.D instanceof $RMb) {
                this.lb(this.D);
            }
        }
        ib() {
            if (this.N) {
                this.N?.stopWebviewFind();
                this.N?.dispose();
                this.N = undefined;
            }
        }
        jb(matches, modelChange) {
            if (!this.J) {
                return;
            }
            const oldCellMatches = new Map(this.z);
            if (this.J.getId() !== this.O) {
                this.z.clear();
                this.O = this.J.getId();
            }
            matches.forEach(match => {
                let existingCell = this.z.get(match.cell.id);
                if (this.J && !existingCell) {
                    const index = this.J.getCellIndex(match.cell);
                    const existingRawCell = oldCellMatches.get(`${searchNotebookHelpers_1.$JMb}${index}`);
                    if (existingRawCell) {
                        existingRawCell.setCellModel(match.cell);
                        existingRawCell.clearAllMatches();
                        existingCell = existingRawCell;
                    }
                }
                const cell = existingCell ?? new $QMb(this, match.cell, match.index);
                cell.addContentMatches((0, searchNotebookHelpers_1.$GMb)(match.contentMatches, match.cell));
                cell.addWebviewMatches((0, searchNotebookHelpers_1.$IMb)(match.webviewMatches));
                this.z.set(cell.id, cell);
            });
            this.N?.setAllFindMatchesDecorations(matches);
            if (this.D instanceof $RMb) {
                this.lb(this.D);
            }
            this.h.fire({ forceUpdateModel: modelChange });
        }
        kb(cells) {
            if (!this.N) {
                return;
            }
            const cellFindMatch = cells.map((cell) => {
                const webviewMatches = cell.webviewMatches.map(match => {
                    return {
                        index: match.webviewIndex,
                    };
                });
                const findMatches = cell.contentMatches.map(match => {
                    return new model_1.$Bu(match.range(), [match.text()]);
                });
                return {
                    cell: cell.cell,
                    index: cell.cellIndex,
                    contentMatches: findMatches,
                    webviewMatches: webviewMatches
                };
            });
            try {
                this.N.setAllFindMatchesDecorations(cellFindMatch);
            }
            catch (e) {
                // no op, might happen due to bugs related to cell output regex search
            }
        }
        async updateMatchesForEditorWidget() {
            if (!this.J) {
                return;
            }
            this.y = new Map();
            const wordSeparators = this.P.isWordMatch && this.P.wordSeparators ? this.P.wordSeparators : null;
            const allMatches = await this.J
                .find(this.P.pattern, {
                regex: this.P.isRegExp,
                wholeWord: this.P.isWordMatch,
                caseSensitive: this.P.isCaseSensitive,
                wordSeparators: wordSeparators ?? undefined,
                includeMarkupInput: this.P.notebookInfo?.isInNotebookMarkdownInput,
                includeMarkupPreview: this.P.notebookInfo?.isInNotebookMarkdownPreview,
                includeCodeInput: this.P.notebookInfo?.isInNotebookCellInput,
                includeOutput: this.P.notebookInfo?.isInNotebookCellOutput,
            }, cancellation_1.CancellationToken.None, false, true, this.X);
            this.jb(allMatches, true);
        }
        async showMatch(match) {
            const offset = await this.lb(match);
            this.setSelectedMatch(match);
            this.mb(match, offset);
        }
        async lb(match) {
            if (!this.N || match.cell instanceof searchNotebookHelpers_1.$KMb) {
                // match cell should never be a CellSearchModel if the notebook is open
                return null;
            }
            if (match.webviewIndex === undefined) {
                return this.N.highlightCurrentFindMatchDecorationInCell(match.cell, match.range());
            }
            else {
                return this.N.highlightCurrentFindMatchDecorationInWebview(match.cell, match.webviewIndex);
            }
        }
        mb(match, outputOffset) {
            if (!this.J || match.cell instanceof searchNotebookHelpers_1.$KMb) {
                // match cell should never be a CellSearchModel if the notebook is open
                return;
            }
            if (match.webviewIndex !== undefined) {
                const index = this.J.getCellIndex(match.cell);
                if (index !== undefined) {
                    this.J.revealCellOffsetInCenterAsync(match.cell, outputOffset ?? 0);
                }
            }
            else {
                match.cell.updateEditState(match.cell.getEditState(), 'focusNotebookCell');
                this.J.setCellEditorSelection(match.cell, match.range());
                this.J.revealRangeInCenterIfOutsideViewportAsync(match.cell, match.range());
            }
        }
    };
    exports.$SMb = $SMb;
    exports.$SMb = $SMb = $SMb_1 = __decorate([
        __param(7, model_2.$yA),
        __param(8, replace_1.$8Mb),
        __param(9, label_1.$Vz),
        __param(10, notebookEditorService_1.$1rb)
    ], $SMb);
    let $TMb = $TMb_1 = class $TMb extends lifecycle_1.$kc {
        constructor(y, z, C, D, F, G, H, I, J, labelService, L) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.c = this.B(new event_1.$fd());
            this.onChange = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDispose = this.f.event;
            this.u = false;
            this.g = new map_1.$zi();
            this.h = new map_1.$zi();
            this.n = ternarySearchTree_1.$Hh.forUris(key => this.L.extUri.ignorePathCasing(key));
            this.s = new map_1.$zi();
            this.t = new map_1.$zi();
            this.w = new lazy_1.$T(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : '');
        }
        get searchModel() {
            return this.G.searchModel;
        }
        get showHighlights() {
            return this.F.showHighlights;
        }
        get closestRoot() {
            return this.H;
        }
        set replacingAll(b) {
            this.u = b;
        }
        id() {
            return this.z;
        }
        get resource() {
            return this.y;
        }
        index() {
            return this.C;
        }
        name() {
            return this.w.value;
        }
        parent() {
            return this.F;
        }
        bindModel(model) {
            const fileMatch = this.g.get(model.uri);
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
            const fileMatch = this.g.get(resource);
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
            const fileMatch = this.g.get(resource);
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
            const folderMatch = this.J.createInstance($UMb, resource, id, index, query, this, this.G, baseWorkspaceFolder);
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
            this.S();
            this.c.fire({ elements: changed, removed: true, added: false, clearingAll });
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            const allMatches = getFileMatches(matches);
            this.R(allMatches);
        }
        async replace(match) {
            return this.I.replace([match]).then(() => {
                this.R([match], true, true, true);
            });
        }
        replaceAll() {
            const matches = this.matches();
            return this.Q(matches);
        }
        matches() {
            return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
        }
        fileMatchesIterator() {
            return this.g.values();
        }
        folderMatchesIterator() {
            return this.h.values();
        }
        isEmpty() {
            return (this.M() + this.N()) === 0;
        }
        getDownstreamFileMatch(uri) {
            const directChildFileMatch = this.g.get(uri);
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
        M() {
            return this.g.size;
        }
        N() {
            return this.h.size;
        }
        count() {
            return this.M() + this.N();
        }
        recursiveFileCount() {
            return this.allDownstreamFileMatches().length;
        }
        recursiveMatchCount() {
            return this.allDownstreamFileMatches().reduce((prev, match) => prev + match.count(), 0);
        }
        get query() {
            return this.D;
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
                            .filter(search_1.$pI)
                            .forEach(m => {
                            textSearchResultToMatches(m, existingFileMatch)
                                .forEach(m => existingFileMatch.add(m));
                        });
                    }
                    // add cell matches
                    if ((0, searchNotebookHelpers_1.$FMb)(rawFileMatch)) {
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
                    if (this instanceof $VMb || this instanceof $WMb) {
                        const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
                        added.push(fileMatch);
                    }
                }
            });
            const elements = [...added, ...updated];
            if (!silent && elements.length) {
                this.c.fire({ elements, added: !!added.length });
            }
        }
        doAddFile(fileMatch) {
            this.g.set(fileMatch.resource, fileMatch);
            if (this.s.has(fileMatch.resource)) {
                this.s.delete(fileMatch.resource);
            }
        }
        hasOnlyReadOnlyMatches() {
            return Array.from(this.g.values()).every(fm => fm.hasOnlyReadOnlyMatches());
        }
        O(parent, child) {
            return this.L.extUri.isEqualOrParent(child, parent) && !this.L.extUri.isEqual(child, parent);
        }
        P(folderMatch) {
            let matchItem = this;
            while (matchItem instanceof $TMb_1) {
                if (matchItem.id() === folderMatch.id()) {
                    return true;
                }
                matchItem = matchItem.parent();
            }
            return false;
        }
        getFolderMatch(resource) {
            const folderMatch = this.n.findSubstr(resource);
            return folderMatch;
        }
        doAddFolder(folderMatch) {
            if (this instanceof $UMb && !this.O(this.resource, folderMatch.resource)) {
                throw Error(`${folderMatch.resource} does not belong as a child of ${this.resource}`);
            }
            else if (this.P(folderMatch)) {
                throw Error(`${folderMatch.resource} is a parent of ${this.resource}`);
            }
            this.h.set(folderMatch.resource, folderMatch);
            this.n.set(folderMatch.resource, folderMatch);
            if (this.t.has(folderMatch.resource)) {
                this.t.delete(folderMatch.resource);
            }
        }
        async Q(matches) {
            const allMatches = getFileMatches(matches);
            await this.I.replace(allMatches);
            this.R(allMatches, true, true, true);
        }
        onFileChange(fileMatch, removed = false) {
            let added = false;
            if (!this.g.has(fileMatch.resource)) {
                this.doAddFile(fileMatch);
                added = true;
            }
            if (fileMatch.count() === 0) {
                this.R([fileMatch], false, false);
                added = false;
                removed = true;
            }
            if (!this.u) {
                this.c.fire({ elements: [fileMatch], added: added, removed: removed });
            }
        }
        onFolderChange(folderMatch, event) {
            if (!this.h.has(folderMatch.resource)) {
                this.doAddFolder(folderMatch);
            }
            if (folderMatch.isEmpty()) {
                this.h.delete(folderMatch.resource);
                folderMatch.dispose();
            }
            this.c.fire(event);
        }
        R(fileMatches, dispose = true, trigger = true, keepReadonly = false) {
            const removed = [];
            for (const match of fileMatches) {
                if (this.g.get(match.resource)) {
                    if (keepReadonly && match.hasWebviewMatches()) {
                        continue;
                    }
                    this.g.delete(match.resource);
                    if (dispose) {
                        match.dispose();
                    }
                    else {
                        this.s.set(match.resource, match);
                    }
                    removed.push(match);
                }
                else {
                    const folder = this.getFolderMatch(match.resource);
                    if (folder) {
                        folder.R([match], dispose, trigger);
                    }
                    else {
                        throw Error(`FileMatch ${match.resource} is not located within FolderMatch ${this.resource}`);
                    }
                }
            }
            if (trigger) {
                this.c.fire({ elements: removed, removed: true });
            }
        }
        S() {
            [...this.g.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this.h.values()].forEach((folderMatch) => folderMatch.S());
            [...this.s.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this.t.values()].forEach((folderMatch) => folderMatch.S());
            this.g.clear();
            this.h.clear();
            this.s.clear();
            this.t.clear();
        }
        dispose() {
            this.S();
            this.f.fire();
            super.dispose();
        }
    };
    exports.$TMb = $TMb;
    exports.$TMb = $TMb = $TMb_1 = __decorate([
        __param(7, replace_1.$8Mb),
        __param(8, instantiation_1.$Ah),
        __param(9, label_1.$Vz),
        __param(10, uriIdentity_1.$Ck)
    ], $TMb);
    let $UMb = class $UMb extends $TMb {
        constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService);
            this.U = new lazy_1.$T(() => this.L.extUri.removeTrailingPathSeparator(this.L.extUri.normalizePath(this.resource)));
        }
        get resource() {
            return this.y;
        }
        get normalizedResource() {
            return this.U.value;
        }
    };
    exports.$UMb = $UMb;
    exports.$UMb = $UMb = __decorate([
        __param(7, replace_1.$8Mb),
        __param(8, instantiation_1.$Ah),
        __param(9, label_1.$Vz),
        __param(10, uriIdentity_1.$Ck)
    ], $UMb);
    /**
     * FolderMatchWorkspaceRoot => folder for workspace root
     */
    let $VMb = class $VMb extends $UMb {
        constructor(_resource, _id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        W(uri) {
            return this.L.extUri.normalizePath(this.L.extUri.dirname(uri));
        }
        X(uri1, ur2) {
            return this.L.extUri.isEqual(uri1, ur2);
        }
        Y(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID) {
            const fileMatch = this.J.createInstance($SMb, query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID);
            parent.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => parent.onFileChange(fileMatch, didRemove));
            fileMatch.onDispose(() => disposable.dispose());
            return fileMatch;
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            if (!this.O(this.resource, rawFileMatch.resource)) {
                throw Error(`${rawFileMatch.resource} is not a descendant of ${this.resource}`);
            }
            const fileMatchParentParts = [];
            let uri = this.W(rawFileMatch.resource);
            while (!this.X(this.normalizedResource, uri)) {
                fileMatchParentParts.unshift(uri);
                const prevUri = uri;
                uri = this.L.extUri.removeTrailingPathSeparator(this.W(uri));
                if (this.X(prevUri, uri)) {
                    throw Error(`${rawFileMatch.resource} is not correctly configured as a child of ${this.normalizedResource}`);
                }
            }
            const root = this.closestRoot ?? this;
            let parent = this;
            for (let i = 0; i < fileMatchParentParts.length; i++) {
                let folderMatch = parent.getFolderMatch(fileMatchParentParts[i]);
                if (!folderMatch) {
                    folderMatch = parent.createIntermediateFolderMatch(fileMatchParentParts[i], fileMatchParentParts[i].toString(), -1, this.D, root);
                }
                parent = folderMatch;
            }
            return this.Y(this.D.contentPattern, this.D.previewOptions, this.D.maxResults, parent, rawFileMatch, root, searchInstanceID);
        }
    };
    exports.$VMb = $VMb;
    exports.$VMb = $VMb = __decorate([
        __param(5, replace_1.$8Mb),
        __param(6, instantiation_1.$Ah),
        __param(7, label_1.$Vz),
        __param(8, uriIdentity_1.$Ck)
    ], $VMb);
    /**
     * BaseFolderMatch => optional resource ("other files" node)
     * FolderMatch => required resource (normal folder node)
     */
    let $WMb = class $WMb extends $TMb {
        constructor(_id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(null, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            const fileMatch = this.J.createInstance($SMb, this.D.contentPattern, this.D.previewOptions, this.D.maxResults, this, rawFileMatch, null, searchInstanceID);
            this.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
            fileMatch.onDispose(() => disposable.dispose());
            return fileMatch;
        }
    };
    exports.$WMb = $WMb;
    exports.$WMb = $WMb = __decorate([
        __param(4, replace_1.$8Mb),
        __param(5, instantiation_1.$Ah),
        __param(6, label_1.$Vz),
        __param(7, uriIdentity_1.$Ck)
    ], $WMb);
    let elemAIndex = -1;
    let elemBIndex = -1;
    /**
     * Compares instances of the same match type. Different match types should not be siblings
     * and their sort order is undefined.
     */
    function $XMb(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        if (elementA instanceof $SMb && elementB instanceof $TMb) {
            return 1;
        }
        if (elementB instanceof $SMb && elementA instanceof $TMb) {
            return -1;
        }
        if (elementA instanceof $TMb && elementB instanceof $TMb) {
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
                    return (0, comparers_1.$cq)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.$0p)(elementA.name(), elementB.name());
                // Fall through otherwise
                default:
                    if (!elementA.resource || !elementB.resource) {
                        return 0;
                    }
                    return (0, comparers_1.$hq)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.$0p)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof $SMb && elementB instanceof $SMb) {
            switch (sortOrder) {
                case "countDescending" /* SearchSortOrder.CountDescending */:
                    return elementB.count() - elementA.count();
                case "countAscending" /* SearchSortOrder.CountAscending */:
                    return elementA.count() - elementB.count();
                case "type" /* SearchSortOrder.Type */:
                    return (0, comparers_1.$cq)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.$0p)(elementA.name(), elementB.name());
                case "modified" /* SearchSortOrder.Modified */: {
                    const fileStatA = elementA.fileStat;
                    const fileStatB = elementB.fileStat;
                    if (fileStatA && fileStatB) {
                        return fileStatB.mtime - fileStatA.mtime;
                    }
                }
                // Fall through otherwise
                default:
                    return (0, comparers_1.$hq)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.$0p)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof $RMb && elementB instanceof $RMb) {
            return $YMb(elementA, elementB);
        }
        if (elementA instanceof $PMb && elementB instanceof $PMb) {
            return range_1.$ks.compareRangesUsingStarts(elementA.range(), elementB.range());
        }
        return 0;
    }
    exports.$XMb = $XMb;
    function $YMb(match1, match2) {
        if (match1.cellIndex === match2.cellIndex) {
            if (match1.webviewIndex !== undefined && match2.webviewIndex !== undefined) {
                return match1.webviewIndex - match2.webviewIndex;
            }
            else if (match1.webviewIndex === undefined && match2.webviewIndex === undefined) {
                return range_1.$ks.compareRangesUsingStarts(match1.range(), match2.range());
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
    exports.$YMb = $YMb;
    function $ZMb(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        const elemAParents = createParentList(elementA);
        const elemBParents = createParentList(elementB);
        let i = elemAParents.length - 1;
        let j = elemBParents.length - 1;
        while (i >= 0 && j >= 0) {
            if (elemAParents[i].id() !== elemBParents[j].id()) {
                return $XMb(elemAParents[i], elemBParents[j], sortOrder);
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
    exports.$ZMb = $ZMb;
    function createParentList(element) {
        const parentArray = [];
        let currElement = element;
        while (!(currElement instanceof $1Mb)) {
            parentArray.push(currElement);
            currElement = currElement.parent();
        }
        return parentArray;
    }
    let $1Mb = class $1Mb extends lifecycle_1.$kc {
        constructor(searchModel, C, D, F, G, H) {
            super();
            this.searchModel = searchModel;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.c = this.B(new event_1.$id({
                merge: mergeSearchResultEvents
            }));
            this.onChange = this.c.event;
            this.f = [];
            this.g = null;
            this.h = ternarySearchTree_1.$Hh.forUris(key => this.G.extUri.ignorePathCasing(key));
            this.n = false;
            this.s = null;
            this.u = () => { };
            this.w = false;
            this.t = this.D.createInstance($5Mb);
            this.B(this.F.onModelAdded(model => this.J(model)));
            this.B(this.H.onDidAddNotebookEditor(widget => {
                if (widget instanceof notebookEditorWidget_1.$Crb) {
                    this.I(widget);
                }
            }));
            this.B(this.onChange(e => {
                if (e.removed) {
                    this.w = !this.isEmpty();
                }
            }));
        }
        async batchReplace(elementsToReplace) {
            try {
                this.c.pause();
                await Promise.all(elementsToReplace.map(async (elem) => {
                    const parent = elem.parent();
                    if ((parent instanceof $TMb || parent instanceof $SMb) && $7Mb(parent, elementsToReplace)) {
                        // skip any children who have parents in the array
                        return;
                    }
                    if (elem instanceof $SMb) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof $PMb) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof $TMb) {
                        await elem.replaceAll();
                    }
                }));
            }
            finally {
                this.c.resume();
            }
        }
        batchRemove(elementsToRemove) {
            // need to check that we aren't trying to remove elements twice
            const removedElems = [];
            try {
                this.c.pause();
                elementsToRemove.forEach((currentElement) => {
                    if (!$7Mb(currentElement, removedElems)) {
                        currentElement.parent().remove(currentElement);
                        removedElems.push(currentElement);
                    }
                });
            }
            finally {
                this.c.resume();
            }
        }
        get isDirty() {
            return this.w;
        }
        get query() {
            return this.s;
        }
        set query(query) {
            // When updating the query we could change the roots, so keep a reference to them to clean up when we trigger `disposePastResults`
            const oldFolderMatches = this.folderMatches();
            new Promise(resolve => this.u = resolve)
                .then(() => oldFolderMatches.forEach(match => match.clear()))
                .then(() => oldFolderMatches.forEach(match => match.dispose()))
                .then(() => this.w = false);
            this.t.removeHighlightRange();
            this.h = ternarySearchTree_1.$Hh.forUris(key => this.G.extUri.ignorePathCasing(key));
            if (!query) {
                return;
            }
            this.f = (query && query.folderQueries || [])
                .map(fq => fq.folder)
                .map((resource, index) => this.N(resource, resource.toString(), index, query));
            this.f.forEach(fm => this.h.set(fm.resource, fm));
            this.g = this.N(null, 'otherFiles', this.f.length + 1, query);
            this.s = query;
        }
        I(widget) {
            this.y?.dispose();
            this.y = widget.onWillChangeModel((model) => {
                if (model) {
                    this.M(widget, model?.uri);
                }
            });
            this.z?.dispose();
            // listen to view model change as we are searching on both inputs and outputs
            this.z = widget.onDidAttachViewModel(() => {
                if (widget.hasModel()) {
                    this.L(widget, widget.textModel.uri);
                }
            });
        }
        J(model) {
            const folderMatch = this.h.findSubstr(model.uri);
            folderMatch?.bindModel(model);
        }
        async L(editor, resource) {
            const folderMatch = this.h.findSubstr(resource);
            await folderMatch?.bindNotebookEditorWidget(editor, resource);
        }
        M(editor, resource) {
            const folderMatch = this.h.findSubstr(resource);
            folderMatch?.unbindNotebookEditorWidget(editor, resource);
        }
        N(resource, id, index, query) {
            let folderMatch;
            if (resource) {
                folderMatch = this.D.createInstance($VMb, resource, id, index, query, this);
            }
            else {
                folderMatch = this.D.createInstance($WMb, id, index, query, this);
            }
            const disposable = folderMatch.onChange((event) => this.c.fire(event));
            folderMatch.onDispose(() => disposable.dispose());
            return folderMatch;
        }
        add(allRaw, searchInstanceID, silent = false) {
            // Split up raw into a list per folder so we can do a batch add per folder.
            const { byFolder, other } = this.Q(allRaw);
            byFolder.forEach(raw => {
                if (!raw.length) {
                    return;
                }
                const folderMatch = this.O(raw[0].resource);
                folderMatch?.addFileMatch(raw, silent, searchInstanceID);
            });
            this.g?.addFileMatch(other, silent, searchInstanceID);
            this.u();
        }
        clear() {
            this.folderMatches().forEach((folderMatch) => folderMatch.clear(true));
            this.R();
            this.f = [];
            this.g = null;
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            matches.forEach(m => {
                if (m instanceof $TMb) {
                    m.clear();
                }
            });
            const fileMatches = matches.filter(m => m instanceof $SMb);
            const { byFolder, other } = this.Q(fileMatches);
            byFolder.forEach(matches => {
                if (!matches.length) {
                    return;
                }
                this.O(matches[0].resource).remove(matches);
            });
            if (other.length) {
                this.O(other[0].resource).remove(other);
            }
        }
        replace(match) {
            return this.O(match.resource).replace(match);
        }
        replaceAll(progress) {
            this.P = true;
            const promise = this.C.replace(this.matches(), progress);
            return promise.then(() => {
                this.P = false;
                this.clear();
            }, () => {
                this.P = false;
            });
        }
        folderMatches() {
            return this.g ?
                [
                    ...this.f,
                    this.g
                ] :
                [
                    ...this.f
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
            return this.n;
        }
        toggleHighlights(value) {
            if (this.n === value) {
                return;
            }
            this.n = value;
            let selectedMatch = null;
            this.matches().forEach((fileMatch) => {
                fileMatch.updateHighlights();
                fileMatch.updateNotebookHighlights();
                if (!selectedMatch) {
                    selectedMatch = fileMatch.getSelectedMatch();
                }
            });
            if (this.n && selectedMatch) {
                // TS?
                this.t.highlightRange(selectedMatch.parent().resource, selectedMatch.range());
            }
            else {
                this.t.removeHighlightRange();
            }
        }
        get rangeHighlightDecorations() {
            return this.t;
        }
        O(resource) {
            const folderMatch = this.h.findSubstr(resource);
            return folderMatch ? folderMatch : this.g;
        }
        set P(running) {
            this.folderMatches().forEach((folderMatch) => {
                folderMatch.replacingAll = running;
            });
        }
        Q(fileMatches) {
            const rawPerFolder = new map_1.$zi();
            const otherFileMatches = [];
            this.f.forEach(fm => rawPerFolder.set(fm.resource, []));
            fileMatches.forEach(rawFileMatch => {
                const folderMatch = this.O(rawFileMatch.resource);
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
        R() {
            this.folderMatches().forEach(folderMatch => folderMatch.dispose());
            this.f = [];
            this.h = ternarySearchTree_1.$Hh.forUris(key => this.G.extUri.ignorePathCasing(key));
            this.t.removeHighlightRange();
        }
        dispose() {
            this.y?.dispose();
            this.z?.dispose();
            this.u();
            this.R();
            this.t.dispose();
            super.dispose();
        }
    };
    exports.$1Mb = $1Mb;
    exports.$1Mb = $1Mb = __decorate([
        __param(1, replace_1.$8Mb),
        __param(2, instantiation_1.$Ah),
        __param(3, model_2.$yA),
        __param(4, uriIdentity_1.$Ck),
        __param(5, notebookEditorService_1.$1rb)
    ], $1Mb);
    let $2Mb = class $2Mb extends lifecycle_1.$kc {
        constructor(F, G, H, I, J, L) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.f = null;
            this.g = false;
            this.h = null;
            this.n = null;
            this.s = false;
            this.t = Promise.resolve();
            this.u = [];
            this.w = this.B(new event_1.$fd());
            this.onReplaceTermChanged = this.w.event;
            this.y = this.B(new event_1.$id({
                merge: mergeSearchResultEvents
            }));
            this.onSearchResultChanged = this.y.event;
            this.z = null;
            this.C = false;
            this.c = this.I.createInstance($1Mb, this);
            this.D = this.B(this.c.onChange((e) => this.y.fire(e)));
        }
        isReplaceActive() {
            return this.g;
        }
        set replaceActive(replaceActive) {
            this.g = replaceActive;
        }
        get replacePattern() {
            return this.n;
        }
        get replaceString() {
            return this.h || '';
        }
        set preserveCase(value) {
            this.s = value;
        }
        get preserveCase() {
            return this.s;
        }
        set replaceString(replaceString) {
            this.h = replaceString;
            if (this.f) {
                this.n = new replace_2.$MMb(replaceString, this.f.contentPattern);
            }
            this.w.fire();
        }
        get searchResult() {
            return this.c;
        }
        set searchResult(searchResult) {
            this.c.dispose();
            this.D.dispose();
            this.c = searchResult;
            this.c.searchModel = this;
            this.D = this.B(this.c.onChange((e) => this.y.fire(e)));
        }
        M(query, progressEmitter, searchQuery, searchInstanceID, onProgress, callerToken) {
            const asyncGenerateOnProgress = async (p) => {
                progressEmitter.fire();
                this.P(p, searchInstanceID, false);
                onProgress?.(p);
            };
            const syncGenerateOnProgress = (p) => {
                progressEmitter.fire();
                this.P(p, searchInstanceID, true);
                onProgress?.(p);
            };
            const tokenSource = this.z = new cancellation_1.$pd(callerToken);
            const notebookResult = this.L.notebookSearch(query, tokenSource.token, searchInstanceID, asyncGenerateOnProgress);
            const textResult = this.F.textSearchSplitSyncAsync(searchQuery, this.z.token, asyncGenerateOnProgress, notebookResult.openFilesToScan, notebookResult.allScannedFiles);
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
                this.J.trace(`whole search time | ${searchLength}ms`);
                return resolvedResult;
            };
            return {
                asyncResults: getAsyncResults(),
                syncResults
            };
        }
        search(query, onProgress, callerToken) {
            this.cancelSearch(true);
            this.f = query;
            if (!this.Q.searchOnType) {
                this.searchResult.clear();
            }
            const searchInstanceID = Date.now().toString();
            this.c.query = this.f;
            const progressEmitter = new event_1.$fd();
            this.n = new replace_2.$MMb(this.replaceString, this.f.contentPattern);
            // In search on type case, delay the streaming of results just a bit, so that we don't flash the only "local results" fast path
            this.t = new Promise(resolve => setTimeout(resolve, this.Q.searchOnType ? 150 : 0));
            const req = this.M(query, progressEmitter, this.f, searchInstanceID, onProgress, callerToken);
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
                this.G.publicLog('searchResultsFirstRender', { duration: Date.now() - start });
            });
            try {
                return {
                    asyncResults: asyncResults.then(value => {
                        this.N(value, Date.now() - start, searchInstanceID);
                        return value;
                    }, e => {
                        this.O(e, Date.now() - start);
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
                this.G.publicLog('searchResultsFinished', { duration: Date.now() - start });
            }
        }
        N(completed, duration, searchInstanceID) {
            if (!this.f) {
                throw new Error('onSearchCompleted must be called after a search is started');
            }
            this.c.add(this.u, searchInstanceID);
            this.u.length = 0;
            const options = Object.assign({}, this.f.contentPattern);
            delete options.pattern;
            const stats = completed && completed.stats;
            const fileSchemeOnly = this.f.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = this.f.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
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
            this.G.publicLog('searchResultsShown', {
                count: this.c.count(),
                fileCount: this.c.fileCount(),
                options,
                duration,
                type: stats && stats.type,
                scheme,
                searchOnTypeEnabled: this.Q.searchOnType
            });
            return completed;
        }
        O(e, duration) {
            if (errors.$2(e)) {
                this.N(this.C
                    ? { exit: 1 /* SearchCompletionExitCode.NewSearchStarted */, results: [], messages: [] }
                    : null, duration, '');
                this.C = false;
            }
        }
        P(p, searchInstanceID, sync = true) {
            if (p.resource) {
                this.u.push(p);
                if (sync) {
                    if (this.u.length) {
                        this.c.add(this.u, searchInstanceID, true);
                        this.u.length = 0;
                    }
                }
                else {
                    this.t.then(() => {
                        if (this.u.length) {
                            this.c.add(this.u, searchInstanceID, true);
                            this.u.length = 0;
                        }
                    });
                }
            }
        }
        get Q() {
            return this.H.getValue('search');
        }
        cancelSearch(cancelledForNewSearch = false) {
            if (this.z) {
                this.C = cancelledForNewSearch;
                this.z.cancel();
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
            other.searchResult = this.c;
            this.c = this.I.createInstance($1Mb, this);
        }
    };
    exports.$2Mb = $2Mb;
    exports.$2Mb = $2Mb = __decorate([
        __param(0, search_1.$oI),
        __param(1, telemetry_1.$9k),
        __param(2, configuration_1.$8h),
        __param(3, instantiation_1.$Ah),
        __param(4, log_1.$5i),
        __param(5, notebookSearch_1.$LMb)
    ], $2Mb);
    let $3Mb = class $3Mb {
        constructor(d) {
            this.d = d;
            this.c = null;
        }
        get searchModel() {
            if (!this.c) {
                this.c = this.d.createInstance($2Mb);
            }
            return this.c;
        }
    };
    exports.$3Mb = $3Mb;
    exports.$3Mb = $3Mb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $3Mb);
    exports.$4Mb = (0, instantiation_1.$Bh)('searchViewModelWorkbenchService');
    /**
     * Can add a range highlight decoration to a model.
     * It will automatically remove it when the model has its decorations changed.
     */
    let $5Mb = class $5Mb {
        static { $5Mb_1 = this; }
        constructor(g) {
            this.g = g;
            this.c = null;
            this.d = null;
            this.f = new lifecycle_1.$jc();
        }
        removeHighlightRange() {
            if (this.d && this.c) {
                const decorationId = this.c;
                this.d.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                });
            }
            this.c = null;
        }
        highlightRange(resource, range, ownerId = 0) {
            let model;
            if (uri_1.URI.isUri(resource)) {
                model = this.g.getModel(resource);
            }
            else {
                model = resource;
            }
            if (model) {
                this.h(model, range);
            }
        }
        h(model, range) {
            this.removeHighlightRange();
            model.changeDecorations((accessor) => {
                this.c = accessor.addDecoration(range, $5Mb_1.n);
            });
            this.k(model);
        }
        k(model) {
            if (this.d !== model) {
                this.l();
                this.d = model;
                this.f.add(this.d.onDidChangeDecorations((e) => {
                    this.l();
                    this.removeHighlightRange();
                    this.d = null;
                }));
                this.f.add(this.d.onWillDispose(() => {
                    this.l();
                    this.removeHighlightRange();
                    this.d = null;
                }));
            }
        }
        l() {
            this.f.clear();
        }
        dispose() {
            if (this.d) {
                this.removeHighlightRange();
                this.f.dispose();
                this.d = null;
            }
        }
        static { this.n = textModel_1.$RC.register({
            description: 'search-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
    };
    exports.$5Mb = $5Mb;
    exports.$5Mb = $5Mb = $5Mb_1 = __decorate([
        __param(0, model_2.$yA)
    ], $5Mb);
    function textSearchResultToMatches(rawMatch, fileMatch) {
        const previewLines = rawMatch.preview.text.split('\n');
        if (Array.isArray(rawMatch.ranges)) {
            return rawMatch.ranges.map((r, i) => {
                const previewRange = rawMatch.preview.matches[i];
                return new $PMb(fileMatch, previewLines, previewRange, r);
            });
        }
        else {
            const previewRange = rawMatch.preview.matches;
            const match = new $PMb(fileMatch, previewLines, previewRange, rawMatch.ranges);
            return [match];
        }
    }
    // text search to notebook matches
    function $6Mb(textSearchMatches, cell) {
        const notebookMatches = [];
        textSearchMatches.map((textSearchMatch) => {
            const previewLines = textSearchMatch.preview.text.split('\n');
            if (Array.isArray(textSearchMatch.ranges)) {
                textSearchMatch.ranges.forEach((r, i) => {
                    const previewRange = textSearchMatch.preview.matches[i];
                    const match = new $RMb(cell, previewLines, previewRange, r, textSearchMatch.webviewIndex);
                    notebookMatches.push(match);
                });
            }
            else {
                const previewRange = textSearchMatch.preview.matches;
                const match = new $RMb(cell, previewLines, previewRange, textSearchMatch.ranges, textSearchMatch.webviewIndex);
                notebookMatches.push(match);
            }
        });
        return notebookMatches;
    }
    exports.$6Mb = $6Mb;
    function $7Mb(element, testArray) {
        do {
            if (testArray.includes(element)) {
                return true;
            }
        } while (!(element.parent() instanceof $1Mb) && (element = element.parent()));
        return false;
    }
    exports.$7Mb = $7Mb;
    function getFileMatches(matches) {
        const folderMatches = [];
        const fileMatches = [];
        matches.forEach((e) => {
            if (e instanceof $SMb) {
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
//# sourceMappingURL=searchModel.js.map