var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/themables", "vs/nls!vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/platform/quickinput/common/quickAccess", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/search/browser/searchView", "vs/workbench/contrib/search/common/search", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search"], function (require, exports, lifecycle_1, map_1, resources_1, themables_1, nls_1, configuration_1, instantiation_1, label_1, listService_1, pickerQuickAccess_1, quickAccess_1, workspace_1, views_1, searchIcons_1, searchModel_1, searchView_1, search_1, editorService_1, queryBuilder_1, search_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qPb = exports.$pPb = void 0;
    exports.$pPb = '% ';
    const DEFAULT_TEXT_QUERY_BUILDER_OPTIONS = {
        _reason: 'quickAccessSearch',
        disregardIgnoreFiles: false,
        disregardExcludeSettings: false,
        onlyOpenEditors: false,
        expandPatterns: true
    };
    const MAX_FILES_SHOWN = 30;
    const MAX_RESULTS_PER_FILE = 10;
    let $qPb = class $qPb extends pickerQuickAccess_1.$sqb {
        h(charsPerLine) {
            return {
                ...DEFAULT_TEXT_QUERY_BUILDER_OPTIONS,
                ...{
                    extraFileResources: this.j.invokeFunction(search_1.$MI),
                    maxResults: this.u.maxResults ?? undefined,
                    isSmartCase: this.u.smartCase,
                },
                previewOptions: {
                    matchLines: 1,
                    charsPerLine
                }
            };
        }
        constructor(j, m, n, r, s, t) {
            super(exports.$pPb, { canAcceptInBackground: true });
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = this.j.createInstance(queryBuilder_1.$AJ);
            this.b = this.j.createInstance(searchModel_1.$2Mb);
        }
        dispose() {
            this.b.dispose();
            super.dispose();
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(super.provide(picker, token, runOptions));
            disposables.add(picker.onDidHide(() => this.b.searchResult.toggleHighlights(false)));
            disposables.add(picker.onDidAccept(() => this.b.searchResult.toggleHighlights(false)));
            return disposables;
        }
        get u() {
            const editorConfig = this.t.getValue().workbench?.editor;
            const searchConfig = this.t.getValue().search;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                preserveInput: searchConfig.experimental.quickAccess.preserveInput,
                maxResults: searchConfig.maxResults,
                smartCase: searchConfig.smartCase,
            };
        }
        get defaultFilterValue() {
            if (this.u.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        w(contentPattern, token) {
            if (contentPattern === '') {
                return undefined;
            }
            const folderResources = this.m.getWorkspace().folders;
            const content = {
                pattern: contentPattern,
            };
            const charsPerLine = content.isRegExp ? 10000 : 1000; // from https://github.com/microsoft/vscode/blob/e7ad5651ac26fa00a40aa1e4010e81b92f655569/src/vs/workbench/contrib/search/browser/searchView.ts#L1508
            const query = this.a.text(content, folderResources.map(folder => folder.uri), this.h(charsPerLine));
            const result = this.b.search(query, undefined, token);
            const getAsyncResults = async () => {
                await result.asyncResults;
                const syncResultURIs = new map_1.$Ai(result.syncResults.map(e => e.resource));
                return this.b.searchResult.matches().filter(e => !syncResultURIs.has(e.resource));
            };
            return {
                syncResults: this.b.searchResult.matches(),
                asyncResults: getAsyncResults()
            };
        }
        y(model, currentElem) {
            // this function takes this._searchModel.searchResult and moves it to the search viewlet's search model.
            // then, this._searchModel will construct a new (empty) SearchResult, and the search viewlet's search result will be disposed.
            this.s.openView(search_2.$lI, false);
            const viewlet = this.s.getActiveViewWithId(search_2.$lI);
            viewlet.importSearchResult(model);
            const viewer = viewlet?.getControl();
            viewer.setFocus([currentElem], (0, listService_1.$s4)());
            viewer.setSelection([currentElem], (0, listService_1.$s4)());
            viewer.reveal(currentElem);
        }
        z(matches, limit) {
            matches = matches.sort(searchModel_1.$ZMb);
            const files = matches.length > limit ? matches.slice(0, limit) : matches;
            const picks = [];
            for (let fileIndex = 0; fileIndex < matches.length; fileIndex++) {
                if (fileIndex === limit) {
                    picks.push({
                        type: 'separator',
                    });
                    picks.push({
                        label: (0, nls_1.localize)(0, null),
                        iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.$bNb),
                        accept: async () => {
                            this.y(this.b, matches[limit]);
                        }
                    });
                    break;
                }
                const fileMatch = files[fileIndex];
                const label = (0, resources_1.$eg)(fileMatch.resource);
                const description = this.r.getUriLabel((0, resources_1.$hg)(fileMatch.resource), { relative: true });
                picks.push({
                    label,
                    type: 'separator',
                    tooltip: description,
                    buttons: [{
                            iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.$rNb),
                            tooltip: (0, nls_1.localize)(1, null)
                        }],
                });
                const results = fileMatch.matches() ?? [];
                for (let matchIndex = 0; matchIndex < results.length; matchIndex++) {
                    const element = results[matchIndex];
                    if (matchIndex === MAX_RESULTS_PER_FILE) {
                        picks.push({
                            label: (0, nls_1.localize)(2, null),
                            iconClass: themables_1.ThemeIcon.asClassName(searchIcons_1.$bNb),
                            accept: async () => {
                                this.y(this.b, element);
                            }
                        });
                        break;
                    }
                    const preview = element.preview();
                    const previewText = (preview.before + preview.inside + preview.after).trim().substring(0, 999);
                    const match = [{
                            start: preview.before.length,
                            end: preview.before.length + preview.inside.length
                        }];
                    picks.push({
                        label: `${previewText}`,
                        highlights: {
                            label: match
                        },
                        ariaLabel: `Match at location ${element.range().startLineNumber}:${element.range().startColumn} - ${previewText}`,
                        accept: async (keyMods, event) => {
                            await this.C(fileMatch, {
                                keyMods,
                                selection: (0, searchView_1.$mPb)(element, this.b),
                                preserveFocus: event.inBackground,
                                forcePinned: event.inBackground,
                                indexedCellOptions: element instanceof searchModel_1.$RMb ? { index: element.cellIndex, selection: element.range() } : undefined
                            });
                        }
                    });
                }
            }
            return picks;
        }
        async C(fileMatch, options) {
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.keyMods?.ctrlCmd || options.forcePinned || this.u.openEditorPinned,
                selection: options.selection
            };
            // from https://github.com/microsoft/vscode/blob/f40dabca07a1622b2a0ae3ee741cfc94ab964bef/src/vs/workbench/contrib/search/browser/anythingQuickAccess.ts#L1037
            const targetGroup = options.keyMods?.alt || (this.u.openEditorPinned && options.keyMods?.ctrlCmd) || options.forceOpenSideBySide ? editorService_1.$$C : editorService_1.$0C;
            await this.n.openEditor({
                resource: fileMatch.resource,
                options: editorOptions
            }, targetGroup);
        }
        g(contentPattern, disposables, token) {
            if (contentPattern === '') {
                this.b.searchResult.clear();
                return [];
            }
            const allMatches = this.w(contentPattern, token);
            if (!allMatches) {
                return null;
            }
            const matches = allMatches.syncResults;
            const syncResult = this.z(matches, MAX_FILES_SHOWN);
            if (syncResult.length > 0) {
                this.b.searchResult.toggleHighlights(true);
            }
            if (matches.length >= MAX_FILES_SHOWN) {
                return syncResult;
            }
            return {
                picks: syncResult,
                additionalPicks: allMatches.asyncResults
                    .then(asyncResults => this.z(asyncResults, MAX_FILES_SHOWN - matches.length))
                    .then(picks => {
                    if (picks.length > 0) {
                        this.b.searchResult.toggleHighlights(true);
                    }
                    return picks;
                })
            };
        }
    };
    exports.$qPb = $qPb;
    exports.$qPb = $qPb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, workspace_1.$Kh),
        __param(2, editorService_1.$9C),
        __param(3, label_1.$Vz),
        __param(4, views_1.$$E),
        __param(5, configuration_1.$8h)
    ], $qPb);
});
//# sourceMappingURL=textSearchQuickAccess.js.map