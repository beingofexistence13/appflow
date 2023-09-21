/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, extpath_1, path_1, resources_1, uri_1, language_1, nls, actions_1, files_1, label_1, opener_1, quickInput_1, workspace_1, abstractSnippetsActions_1, snippets_1, textfiles_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigureSnippetsAction = void 0;
    var ISnippetPick;
    (function (ISnippetPick) {
        function is(thing) {
            return !!thing && uri_1.URI.isUri(thing.filepath);
        }
        ISnippetPick.is = is;
    })(ISnippetPick || (ISnippetPick = {}));
    async function computePicks(snippetService, userDataProfileService, languageService, labelService) {
        const existing = [];
        const future = [];
        const seen = new Set();
        const added = new Map();
        for (const file of await snippetService.getSnippetFiles()) {
            if (file.source === 3 /* SnippetSource.Extension */) {
                // skip extension snippets
                continue;
            }
            if (file.isGlobalSnippets) {
                await file.load();
                // list scopes for global snippets
                const names = new Set();
                let source;
                outer: for (const snippet of file.data) {
                    if (!source) {
                        source = snippet.source;
                    }
                    for (const scope of snippet.scopes) {
                        const name = languageService.getLanguageName(scope);
                        if (name) {
                            if (names.size >= 4) {
                                names.add(`${name}...`);
                                break outer;
                            }
                            else {
                                names.add(name);
                            }
                        }
                    }
                }
                const snippet = {
                    label: (0, resources_1.basename)(file.location),
                    filepath: file.location,
                    description: names.size === 0
                        ? nls.localize('global.scope', "(global)")
                        : nls.localize('global.1', "({0})", [...names].join(', '))
                };
                existing.push(snippet);
                if (!source) {
                    continue;
                }
                const detail = nls.localize('detail.label', "({0}) {1}", source, labelService.getUriLabel(file.location, { relative: true }));
                const lastItem = added.get((0, resources_1.basename)(file.location));
                if (lastItem) {
                    snippet.detail = detail;
                    lastItem.snippet.detail = lastItem.detail;
                }
                added.set((0, resources_1.basename)(file.location), { snippet, detail });
            }
            else {
                // language snippet
                const mode = (0, resources_1.basename)(file.location).replace(/\.json$/, '');
                existing.push({
                    label: (0, resources_1.basename)(file.location),
                    description: `(${languageService.getLanguageName(mode)})`,
                    filepath: file.location
                });
                seen.add(mode);
            }
        }
        const dir = userDataProfileService.currentProfile.snippetsHome;
        for (const languageId of languageService.getRegisteredLanguageIds()) {
            const label = languageService.getLanguageName(languageId);
            if (label && !seen.has(languageId)) {
                future.push({
                    label: languageId,
                    description: `(${label})`,
                    filepath: (0, resources_1.joinPath)(dir, `${languageId}.json`),
                    hint: true
                });
            }
        }
        existing.sort((a, b) => {
            const a_ext = (0, path_1.extname)(a.filepath.path);
            const b_ext = (0, path_1.extname)(b.filepath.path);
            if (a_ext === b_ext) {
                return a.label.localeCompare(b.label);
            }
            else if (a_ext === '.code-snippets') {
                return -1;
            }
            else {
                return 1;
            }
        });
        future.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        return { existing, future };
    }
    async function createSnippetFile(scope, defaultPath, quickInputService, fileService, textFileService, opener) {
        function createSnippetUri(input) {
            const filename = (0, path_1.extname)(input) !== '.code-snippets'
                ? `${input}.code-snippets`
                : input;
            return (0, resources_1.joinPath)(defaultPath, filename);
        }
        await fileService.createFolder(defaultPath);
        const input = await quickInputService.input({
            placeHolder: nls.localize('name', "Type snippet file name"),
            async validateInput(input) {
                if (!input) {
                    return nls.localize('bad_name1', "Invalid file name");
                }
                if (!(0, extpath_1.isValidBasename)(input)) {
                    return nls.localize('bad_name2', "'{0}' is not a valid file name", input);
                }
                if (await fileService.exists(createSnippetUri(input))) {
                    return nls.localize('bad_name3', "'{0}' already exists", input);
                }
                return undefined;
            }
        });
        if (!input) {
            return undefined;
        }
        const resource = createSnippetUri(input);
        await textFileService.write(resource, [
            '{',
            '\t// Place your ' + scope + ' snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and ',
            '\t// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope ',
            '\t// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is ',
            '\t// used to trigger the snippet and the body will be expanded and inserted. Possible variables are: ',
            '\t// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. ',
            '\t// Placeholders with the same ids are connected.',
            '\t// Example:',
            '\t// "Print to console": {',
            '\t// \t"scope": "javascript,typescript",',
            '\t// \t"prefix": "log",',
            '\t// \t"body": [',
            '\t// \t\t"console.log(\'$1\');",',
            '\t// \t\t"$2"',
            '\t// \t],',
            '\t// \t"description": "Log output to console"',
            '\t// }',
            '}'
        ].join('\n'));
        await opener.open(resource);
        return undefined;
    }
    async function createLanguageSnippetFile(pick, fileService, textFileService) {
        if (await fileService.exists(pick.filepath)) {
            return;
        }
        const contents = [
            '{',
            '\t// Place your snippets for ' + pick.label + ' here. Each snippet is defined under a snippet name and has a prefix, body and ',
            '\t// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:',
            '\t// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the ',
            '\t// same ids are connected.',
            '\t// Example:',
            '\t// "Print to console": {',
            '\t// \t"prefix": "log",',
            '\t// \t"body": [',
            '\t// \t\t"console.log(\'$1\');",',
            '\t// \t\t"$2"',
            '\t// \t],',
            '\t// \t"description": "Log output to console"',
            '\t// }',
            '}'
        ].join('\n');
        await textFileService.write(pick.filepath, contents);
    }
    class ConfigureSnippetsAction extends abstractSnippetsActions_1.SnippetsAction {
        constructor() {
            super({
                id: 'workbench.action.openSnippets',
                title: {
                    value: nls.localize('openSnippet.label', "Configure User Snippets"),
                    original: 'Configure User Snippets'
                },
                shortTitle: {
                    value: nls.localize('userSnippets', "User Snippets"),
                    mnemonicTitle: nls.localize({ key: 'miOpenSnippets', comment: ['&& denotes a mnemonic'] }, "User &&Snippets"),
                    original: 'User Snippets'
                },
                f1: true,
                menu: [
                    { id: actions_1.MenuId.MenubarPreferencesMenu, group: '2_configuration', order: 5 },
                    { id: actions_1.MenuId.GlobalActivity, group: '2_configuration', order: 5 },
                ]
            });
        }
        async run(accessor) {
            const snippetService = accessor.get(snippets_1.ISnippetsService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const opener = accessor.get(opener_1.IOpenerService);
            const languageService = accessor.get(language_1.ILanguageService);
            const userDataProfileService = accessor.get(userDataProfile_1.IUserDataProfileService);
            const workspaceService = accessor.get(workspace_1.IWorkspaceContextService);
            const fileService = accessor.get(files_1.IFileService);
            const textFileService = accessor.get(textfiles_1.ITextFileService);
            const labelService = accessor.get(label_1.ILabelService);
            const picks = await computePicks(snippetService, userDataProfileService, languageService, labelService);
            const existing = picks.existing;
            const globalSnippetPicks = [{
                    scope: nls.localize('new.global_scope', 'global'),
                    label: nls.localize('new.global', "New Global Snippets file..."),
                    uri: userDataProfileService.currentProfile.snippetsHome
                }];
            const workspaceSnippetPicks = [];
            for (const folder of workspaceService.getWorkspace().folders) {
                workspaceSnippetPicks.push({
                    scope: nls.localize('new.workspace_scope', "{0} workspace", folder.name),
                    label: nls.localize('new.folder', "New Snippets file for '{0}'...", folder.name),
                    uri: folder.toResource('.vscode')
                });
            }
            if (existing.length > 0) {
                existing.unshift({ type: 'separator', label: nls.localize('group.global', "Existing Snippets") });
                existing.push({ type: 'separator', label: nls.localize('new.global.sep', "New Snippets") });
            }
            else {
                existing.push({ type: 'separator', label: nls.localize('new.global.sep', "New Snippets") });
            }
            const pick = await quickInputService.pick([].concat(existing, globalSnippetPicks, workspaceSnippetPicks, picks.future), {
                placeHolder: nls.localize('openSnippet.pickLanguage', "Select Snippets File or Create Snippets"),
                matchOnDescription: true
            });
            if (globalSnippetPicks.indexOf(pick) >= 0) {
                return createSnippetFile(pick.scope, pick.uri, quickInputService, fileService, textFileService, opener);
            }
            else if (workspaceSnippetPicks.indexOf(pick) >= 0) {
                return createSnippetFile(pick.scope, pick.uri, quickInputService, fileService, textFileService, opener);
            }
            else if (ISnippetPick.is(pick)) {
                if (pick.hint) {
                    await createLanguageSnippetFile(pick, fileService, textFileService);
                }
                return opener.open(pick.filepath);
            }
        }
    }
    exports.ConfigureSnippetsAction = ConfigureSnippetsAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlU25pcHBldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zbmlwcGV0cy9icm93c2VyL2NvbW1hbmRzL2NvbmZpZ3VyZVNuaXBwZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsSUFBVSxZQUFZLENBSXJCO0lBSkQsV0FBVSxZQUFZO1FBQ3JCLFNBQWdCLEVBQUUsQ0FBQyxLQUF5QjtZQUMzQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBZ0IsS0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFGZSxlQUFFLEtBRWpCLENBQUE7SUFDRixDQUFDLEVBSlMsWUFBWSxLQUFaLFlBQVksUUFJckI7SUFPRCxLQUFLLFVBQVUsWUFBWSxDQUFDLGNBQWdDLEVBQUUsc0JBQStDLEVBQUUsZUFBaUMsRUFBRSxZQUEyQjtRQUU1SyxNQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFFbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBcUQsQ0FBQztRQUUzRSxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sY0FBYyxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBRTFELElBQUksSUFBSSxDQUFDLE1BQU0sb0NBQTRCLEVBQUU7Z0JBQzVDLDBCQUEwQjtnQkFDMUIsU0FBUzthQUNUO1lBRUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBRTFCLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVsQixrQ0FBa0M7Z0JBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7Z0JBQ2hDLElBQUksTUFB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