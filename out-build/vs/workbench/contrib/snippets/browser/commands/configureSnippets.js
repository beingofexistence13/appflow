/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/snippets/browser/commands/configureSnippets", "vs/platform/actions/common/actions", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, extpath_1, path_1, resources_1, uri_1, language_1, nls, actions_1, files_1, label_1, opener_1, quickInput_1, workspace_1, abstractSnippetsActions_1, snippets_1, textfiles_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iYb = void 0;
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
                    label: (0, resources_1.$fg)(file.location),
                    filepath: file.location,
                    description: names.size === 0
                        ? nls.localize(0, null)
                        : nls.localize(1, null, [...names].join(', '))
                };
                existing.push(snippet);
                if (!source) {
                    continue;
                }
                const detail = nls.localize(2, null, source, labelService.getUriLabel(file.location, { relative: true }));
                const lastItem = added.get((0, resources_1.$fg)(file.location));
                if (lastItem) {
                    snippet.detail = detail;
                    lastItem.snippet.detail = lastItem.detail;
                }
                added.set((0, resources_1.$fg)(file.location), { snippet, detail });
            }
            else {
                // language snippet
                const mode = (0, resources_1.$fg)(file.location).replace(/\.json$/, '');
                existing.push({
                    label: (0, resources_1.$fg)(file.location),
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
                    filepath: (0, resources_1.$ig)(dir, `${languageId}.json`),
                    hint: true
                });
            }
        }
        existing.sort((a, b) => {
            const a_ext = (0, path_1.$be)(a.filepath.path);
            const b_ext = (0, path_1.$be)(b.filepath.path);
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
            const filename = (0, path_1.$be)(input) !== '.code-snippets'
                ? `${input}.code-snippets`
                : input;
            return (0, resources_1.$ig)(defaultPath, filename);
        }
        await fileService.createFolder(defaultPath);
        const input = await quickInputService.input({
            placeHolder: nls.localize(3, null),
            async validateInput(input) {
                if (!input) {
                    return nls.localize(4, null);
                }
                if (!(0, extpath_1.$Gf)(input)) {
                    return nls.localize(5, null, input);
                }
                if (await fileService.exists(createSnippetUri(input))) {
                    return nls.localize(6, null, input);
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
    class $iYb extends abstractSnippetsActions_1.$_Eb {
        constructor() {
            super({
                id: 'workbench.action.openSnippets',
                title: {
                    value: nls.localize(7, null),
                    original: 'Configure User Snippets'
                },
                shortTitle: {
                    value: nls.localize(8, null),
                    mnemonicTitle: nls.localize(9, null),
                    original: 'User Snippets'
                },
                f1: true,
                menu: [
                    { id: actions_1.$Ru.MenubarPreferencesMenu, group: '2_configuration', order: 5 },
                    { id: actions_1.$Ru.GlobalActivity, group: '2_configuration', order: 5 },
                ]
            });
        }
        async run(accessor) {
            const snippetService = accessor.get(snippets_1.$amb);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const opener = accessor.get(opener_1.$NT);
            const languageService = accessor.get(language_1.$ct);
            const userDataProfileService = accessor.get(userDataProfile_1.$CJ);
            const workspaceService = accessor.get(workspace_1.$Kh);
            const fileService = accessor.get(files_1.$6j);
            const textFileService = accessor.get(textfiles_1.$JD);
            const labelService = accessor.get(label_1.$Vz);
            const picks = await computePicks(snippetService, userDataProfileService, languageService, labelService);
            const existing = picks.existing;
            const globalSnippetPicks = [{
                    scope: nls.localize(10, null),
                    label: nls.localize(11, null),
                    uri: userDataProfileService.currentProfile.snippetsHome
                }];
            const workspaceSnippetPicks = [];
            for (const folder of workspaceService.getWorkspace().folders) {
                workspaceSnippetPicks.push({
                    scope: nls.localize(12, null, folder.name),
                    label: nls.localize(13, null, folder.name),
                    uri: folder.toResource('.vscode')
                });
            }
            if (existing.length > 0) {
                existing.unshift({ type: 'separator', label: nls.localize(14, null) });
                existing.push({ type: 'separator', label: nls.localize(15, null) });
            }
            else {
                existing.push({ type: 'separator', label: nls.localize(16, null) });
            }
            const pick = await quickInputService.pick([].concat(existing, globalSnippetPicks, workspaceSnippetPicks, picks.future), {
                placeHolder: nls.localize(17, null),
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
    exports.$iYb = $iYb;
});
//# sourceMappingURL=configureSnippets.js.map