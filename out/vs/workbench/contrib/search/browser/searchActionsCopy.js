define(["require", "exports", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/label/common/label", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/platform"], function (require, exports, nls, clipboardService_1, label_1, views_1, Constants, searchModel_1, actions_1, searchActionsBase_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lineDelimiter = void 0;
    //#region Actions
    (0, actions_1.registerAction2)(class CopyMatchCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyMatchCommandId,
                title: {
                    value: nls.localize('copyMatchLabel', "Copy"),
                    original: 'Copy'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.FileMatchOrMatchFocusKey,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                },
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.FileMatchOrMatchFocusKey,
                        group: 'search_2',
                        order: 1
                    }]
            });
        }
        async run(accessor, match) {
            await copyMatchCommand(accessor, match);
        }
    });
    (0, actions_1.registerAction2)(class CopyPathCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyPathCommandId,
                title: {
                    value: nls.localize('copyPathLabel', "Copy Path"),
                    original: 'Copy Path'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
                    win: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
                    },
                },
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
                        group: 'search_2',
                        order: 2
                    }]
            });
        }
        async run(accessor, fileMatch) {
            await copyPathCommand(accessor, fileMatch);
        }
    });
    (0, actions_1.registerAction2)(class CopyAllCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyAllCommandId,
                title: {
                    value: nls.localize('copyAllLabel', "Copy All"),
                    original: 'Copy All'
                },
                category: searchActionsBase_1.category,
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.HasSearchResults,
                        group: 'search_2',
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            await copyAllCommand(accessor);
        }
    });
    //#endregion
    //#region Helpers
    exports.lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
    async function copyPathCommand(accessor, fileMatch) {
        if (!fileMatch) {
            const selection = getSelectedRow(accessor);
            if (!(selection instanceof searchModel_1.FileMatch || selection instanceof searchModel_1.FolderMatchWithResource)) {
                return;
            }
            fileMatch = selection;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        const text = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
        await clipboardService.writeText(text);
    }
    async function copyMatchCommand(accessor, match) {
        if (!match) {
            const selection = getSelectedRow(accessor);
            if (!selection) {
                return;
            }
            match = selection;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        let text;
        if (match instanceof searchModel_1.Match) {
            text = matchToString(match);
        }
        else if (match instanceof searchModel_1.FileMatch) {
            text = fileMatchToString(match, labelService).text;
        }
        else if (match instanceof searchModel_1.FolderMatch) {
            text = folderMatchToString(match, labelService).text;
        }
        if (text) {
            await clipboardService.writeText(text);
        }
    }
    async function copyAllCommand(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const root = searchView.searchResult;
            const text = allFolderMatchesToString(root.folderMatches(), labelService);
            await clipboardService.writeText(text);
        }
    }
    function matchToString(match, indent = 0) {
        const getFirstLinePrefix = () => `${match.range().startLineNumber},${match.range().startColumn}`;
        const getOtherLinePrefix = (i) => match.range().startLineNumber + i + '';
        const fullMatchLines = match.fullPreviewLines();
        const largestPrefixSize = fullMatchLines.reduce((largest, _, i) => {
            const thisSize = i === 0 ?
                getFirstLinePrefix().length :
                getOtherLinePrefix(i).length;
            return Math.max(thisSize, largest);
        }, 0);
        const formattedLines = fullMatchLines
            .map((line, i) => {
            const prefix = i === 0 ?
                getFirstLinePrefix() :
                getOtherLinePrefix(i);
            const paddingStr = ' '.repeat(largestPrefixSize - prefix.length);
            const indentStr = ' '.repeat(indent);
            return `${indentStr}${prefix}: ${paddingStr}${line}`;
        });
        return formattedLines.join('\n');
    }
    function fileFolderMatchToString(match, labelService) {
        if (match instanceof searchModel_1.FileMatch) {
            return fileMatchToString(match, labelService);
        }
        else {
            return folderMatchToString(match, labelService);
        }
    }
    function fileMatchToString(fileMatch, labelService) {
        const matchTextRows = fileMatch.matches()
            .sort(searchModel_1.searchMatchComparer)
            .map(match => matchToString(match, 2));
        const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
        return {
            text: `${uriString}${exports.lineDelimiter}${matchTextRows.join(exports.lineDelimiter)}`,
            count: matchTextRows.length
        };
    }
    function folderMatchToString(folderMatch, labelService) {
        const results = [];
        let numMatches = 0;
        const matches = folderMatch.matches().sort(searchModel_1.searchMatchComparer);
        matches.forEach(match => {
            const result = fileFolderMatchToString(match, labelService);
            numMatches += result.count;
            results.push(result.text);
        });
        return {
            text: results.join(exports.lineDelimiter + exports.lineDelimiter),
            count: numMatches
        };
    }
    function allFolderMatchesToString(folderMatches, labelService) {
        const folderResults = [];
        folderMatches = folderMatches.sort(searchModel_1.searchMatchComparer);
        for (let i = 0; i < folderMatches.length; i++) {
            const folderResult = folderMatchToString(folderMatches[i], labelService);
            if (folderResult.count) {
                folderResults.push(folderResult.text);
            }
        }
        return folderResults.join(exports.lineDelimiter + exports.lineDelimiter);
    }
    function getSelectedRow(accessor) {
        const viewsService = accessor.get(views_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        return searchView?.getControl().getSelection()[0];
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc0NvcHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hBY3Rpb25zQ29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBaUJBLGlCQUFpQjtJQUNqQixJQUFBLHlCQUFlLEVBQUMsTUFBTSxzQkFBdUIsU0FBUSxpQkFBTztRQUUzRDtZQUVDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLGtCQUFrQjtnQkFDaEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQztvQkFDN0MsUUFBUSxFQUFFLE1BQU07aUJBQ2hCO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLElBQUksRUFBRSxTQUFTLENBQUMsd0JBQXdCO29CQUN4QyxPQUFPLEVBQUUsaURBQTZCO2lCQUN0QztnQkFDRCxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixJQUFJLEVBQUUsU0FBUyxDQUFDLHdCQUF3Qjt3QkFDeEMsS0FBSyxFQUFFLFVBQVU7d0JBQ2pCLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFFSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEtBQWtDO1lBQ2hGLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxxQkFBc0IsU0FBUSxpQkFBTztRQUUxRDtZQUVDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLGlC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