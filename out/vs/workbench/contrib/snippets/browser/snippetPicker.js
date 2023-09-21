/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/snippets/browser/snippets", "vs/platform/quickinput/common/quickInput", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event"], function (require, exports, nls, snippets_1, quickInput_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pickSnippet = void 0;
    async function pickSnippet(accessor, languageIdOrSnippets) {
        const snippetService = accessor.get(snippets_1.ISnippetsService);
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
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
                            label = nls.localize('sep.userSnippet', "User Snippets");
                            break;
                        case 3 /* SnippetSource.Extension */:
                            label = snippet.source;
                            break;
                        case 2 /* SnippetSource.Workspace */:
                            label = nls.localize('sep.workspaceSnippet', "Workspace Snippets");
                            break;
                    }
                    result.push({ type: 'separator', label });
                }
                if (snippet.snippetSource === 3 /* SnippetSource.Extension */) {
                    const isEnabled = snippetService.isEnabled(snippet);
                    if (isEnabled) {
                        pick.buttons = [{
                                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.eyeClosed),
                                tooltip: nls.localize('disableSnippet', 'Hide from IntelliSense')
                            }];
                    }
                    else {
                        pick.description = nls.localize('isDisabled', "(hidden from IntelliSense)");
                        pick.buttons = [{
                                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.eye),
                                tooltip: nls.localize('enable.snippet', 'Show in IntelliSense')
                            }];
                    }
                }
                result.push(pick);
                prevSnippet = snippet;
            }
            return result;
        };
        const picker = quickInputService.createQuickPick();
        picker.placeholder = nls.localize('pick.placeholder', "Select a snippet");
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
            picker.validationMessage = nls.localize('pick.noSnippetAvailable', "No snippet available");
        }
        picker.show();
        // wait for an item to be picked or the picker to become hidden
        await Promise.race([event_1.Event.toPromise(picker.onDidAccept), event_1.Event.toPromise(picker.onDidHide)]);
        const result = picker.selectedItems[0]?.snippet;
        picker.dispose();
        return result;
    }
    exports.pickSnippet = pickSnippet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvc25pcHBldFBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXekYsS0FBSyxVQUFVLFdBQVcsQ0FBQyxRQUEwQixFQUFFLG9CQUF3QztRQUVyRyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7UUFNM0QsSUFBSSxRQUFtQixDQUFDO1FBQ3hCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQ3hDLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztTQUNoQzthQUFNO1lBQ04sUUFBUSxHQUFHLENBQUMsTUFBTSxjQUFjLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0STtRQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUzRCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsRUFBRTtZQUM3QixNQUFNLE1BQU0sR0FBbUMsRUFBRSxDQUFDO1lBQ2xELElBQUksV0FBZ0MsQ0FBQztZQUNyQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEdBQWlCO29CQUMxQixLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSTtvQkFD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