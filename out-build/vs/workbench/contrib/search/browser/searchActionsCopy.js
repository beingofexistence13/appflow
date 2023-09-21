define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchActionsCopy", "vs/platform/clipboard/common/clipboardService", "vs/platform/label/common/label", "vs/workbench/common/views", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/platform"], function (require, exports, nls, clipboardService_1, label_1, views_1, Constants, searchModel_1, actions_1, searchActionsBase_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oPb = void 0;
    //#region Actions
    (0, actions_1.$Xu)(class CopyMatchCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$JNb,
                title: {
                    value: nls.localize(0, null),
                    original: 'Copy'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.$qOb,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                },
                menu: [{
                        id: actions_1.$Ru.SearchContext,
                        when: Constants.$qOb,
                        group: 'search_2',
                        order: 1
                    }]
            });
        }
        async run(accessor, match) {
            await copyMatchCommand(accessor, match);
        }
    });
    (0, actions_1.$Xu)(class CopyPathCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$INb,
                title: {
                    value: nls.localize(1, null),
                    original: 'Copy Path'
                },
                category: searchActionsBase_1.$vNb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.$sOb,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
                    win: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
                    },
                },
                menu: [{
                        id: actions_1.$Ru.SearchContext,
                        when: Constants.$sOb,
                        group: 'search_2',
                        order: 2
                    }]
            });
        }
        async run(accessor, fileMatch) {
            await copyPathCommand(accessor, fileMatch);
        }
    });
    (0, actions_1.$Xu)(class CopyAllCommandAction extends actions_1.$Wu {
        constructor() {
            super({
                id: Constants.$KNb,
                title: {
                    value: nls.localize(2, null),
                    original: 'Copy All'
                },
                category: searchActionsBase_1.$vNb,
                menu: [{
                        id: actions_1.$Ru.SearchContext,
                        when: Constants.$oOb,
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
    exports.$oPb = platform_1.$i ? '\r\n' : '\n';
    async function copyPathCommand(accessor, fileMatch) {
        if (!fileMatch) {
            const selection = getSelectedRow(accessor);
            if (!(selection instanceof searchModel_1.$SMb || selection instanceof searchModel_1.$UMb)) {
                return;
            }
            fileMatch = selection;
        }
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const labelService = accessor.get(label_1.$Vz);
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
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const labelService = accessor.get(label_1.$Vz);
        let text;
        if (match instanceof searchModel_1.$PMb) {
            text = matchToString(match);
        }
        else if (match instanceof searchModel_1.$SMb) {
            text = fileMatchToString(match, labelService).text;
        }
        else if (match instanceof searchModel_1.$TMb) {
            text = folderMatchToString(match, labelService).text;
        }
        if (text) {
            await clipboardService.writeText(text);
        }
    }
    async function copyAllCommand(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const labelService = accessor.get(label_1.$Vz);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
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
        if (match instanceof searchModel_1.$SMb) {
            return fileMatchToString(match, labelService);
        }
        else {
            return folderMatchToString(match, labelService);
        }
    }
    function fileMatchToString(fileMatch, labelService) {
        const matchTextRows = fileMatch.matches()
            .sort(searchModel_1.$XMb)
            .map(match => matchToString(match, 2));
        const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
        return {
            text: `${uriString}${exports.$oPb}${matchTextRows.join(exports.$oPb)}`,
            count: matchTextRows.length
        };
    }
    function folderMatchToString(folderMatch, labelService) {
        const results = [];
        let numMatches = 0;
        const matches = folderMatch.matches().sort(searchModel_1.$XMb);
        matches.forEach(match => {
            const result = fileFolderMatchToString(match, labelService);
            numMatches += result.count;
            results.push(result.text);
        });
        return {
            text: results.join(exports.$oPb + exports.$oPb),
            count: numMatches
        };
    }
    function allFolderMatchesToString(folderMatches, labelService) {
        const folderResults = [];
        folderMatches = folderMatches.sort(searchModel_1.$XMb);
        for (let i = 0; i < folderMatches.length; i++) {
            const folderResult = folderMatchToString(folderMatches[i], labelService);
            if (folderResult.count) {
                folderResults.push(folderResult.text);
            }
        }
        return folderResults.join(exports.$oPb + exports.$oPb);
    }
    function getSelectedRow(accessor) {
        const viewsService = accessor.get(views_1.$$E);
        const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
        return searchView?.getControl().getSelection()[0];
    }
});
//#endregion
//# sourceMappingURL=searchActionsCopy.js.map