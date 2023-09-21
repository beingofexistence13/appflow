/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/snippets/browser/snippetPicker", "vs/workbench/contrib/snippets/browser/snippets", "vs/platform/quickinput/common/quickInput", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event"], function (require, exports, nls, snippets_1, quickInput_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jYb = void 0;
    async function $jYb(accessor, languageIdOrSnippets) {
        const snippetService = accessor.get(snippets_1.$amb);
        const quickInputService = accessor.get(quickInput_1.$Gq);
        let snippets;
        if (Array.isArray(languageIdOrSnippets)) {
            snippets = languageIdOrSnippets;
        }
        else {
            snippets = (await snippetService.getSnippets(languageIdOrSnippets, { includeDisabledSnippets: true, includeNoPrefixSnippets: true }));
        }
        snippets.sort((a, b) => a.snippetSource - b.snippetSource);
        const makeSnippetPicks = () => {
            const result = [];
            let prevSnippet;
            for (const snippet of snippets) {
                const pick = {
                    label: snippet.prefix || snippet.name,
                    detail: snippet.description || snippet.body,
                    snippet
                };
                if (!prevSnippet || prevSnippet.snippetSource !== snippet.snippetSource || prevSnippet.source !== snippet.source) {
                    let label = '';
                    switch (snippet.snippetSource) {
                        case 1 /* SnippetSource.User */:
                            label = nls.localize(0, null);
                            break;
                        case 3 /* SnippetSource.Extension */:
                            label = snippet.source;
                            break;
                        case 2 /* SnippetSource.Workspace */:
                            label = nls.localize(1, null);
                            break;
                    }
                    result.push({ type: 'separator', label });
                }
                if (snippet.snippetSource === 3 /* SnippetSource.Extension */) {
                    const isEnabled = snippetService.isEnabled(snippet);
                    if (isEnabled) {
                        pick.buttons = [{
                                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.eyeClosed),
                                tooltip: nls.localize(2, null)
                            }];
                    }
                    else {
                        pick.description = nls.localize(3, null);
                        pick.buttons = [{
                                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.eye),
                                tooltip: nls.localize(4, null)
                            }];
                    }
                }
                result.push(pick);
                prevSnippet = snippet;
            }
            return result;
        };
        const picker = quickInputService.createQuickPick();
        picker.placeholder = nls.localize(5, null);
        picker.matchOnDetail = true;
        picker.ignoreFocusOut = false;
        picker.keepScrollPosition = true;
        picker.onDidTriggerItemButton(ctx => {
            const isEnabled = snippetService.isEnabled(ctx.item.snippet);
            snippetService.updateEnablement(ctx.item.snippet, !isEnabled);
            picker.items = makeSnippetPicks();
        });
        picker.items = makeSnippetPicks();
        if (!picker.items.length) {
            picker.validationMessage = nls.localize(6, null);
        }
        picker.show();
        // wait for an item to be picked or the picker to become hidden
        await Promise.race([event_1.Event.toPromise(picker.onDidAccept), event_1.Event.toPromise(picker.onDidHide)]);
        const result = picker.selectedItems[0]?.snippet;
        picker.dispose();
        return result;
    }
    exports.$jYb = $jYb;
});
//# sourceMappingURL=snippetPicker.js.map