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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/lifecycle"], function (require, exports, dom_1, event_1, nls_1, quickInput_1, terminal_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkQuickpick = void 0;
    let TerminalLinkQuickpick = class TerminalLinkQuickpick extends lifecycle_1.DisposableStore {
        constructor(_quickInputService) {
            super();
            this._quickInputService = _quickInputService;
            this._onDidRequestMoreLinks = this.add(new event_1.Emitter());
            this.onDidRequestMoreLinks = this._onDidRequestMoreLinks.event;
        }
        async show(links) {
            // Get raw link picks
            const wordPicks = links.viewport.wordLinks ? await this._generatePicks(links.viewport.wordLinks) : undefined;
            const filePicks = links.viewport.fileLinks ? await this._generatePicks(links.viewport.fileLinks) : undefined;
            const folderPicks = links.viewport.folderLinks ? await this._generatePicks(links.viewport.folderLinks) : undefined;
            const webPicks = links.viewport.webLinks ? await this._generatePicks(links.viewport.webLinks) : undefined;
            const picks = [];
            if (webPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.urlLinks', "Url") });
                picks.push(...webPicks);
            }
            if (filePicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFileLinks', "File") });
                picks.push(...filePicks);
            }
            if (folderPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFolderLinks', "Folder") });
                picks.push(...folderPicks);
            }
            if (wordPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.searchLinks', "Workspace Search") });
                picks.push(...wordPicks);
            }
            // Create and show quick pick
            const pick = this._quickInputService.createQuickPick();
            pick.items = picks;
            pick.placeholder = (0, nls_1.localize)('terminal.integrated.openDetectedLink', "Select the link to open, type to filter all links");
            pick.sortByLabel = false;
            pick.show();
            // Show all results only when filtering begins, this is done so the quick pick will show up
            // ASAP with only the viewport entries.
            let accepted = false;
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(event_1.Event.once(pick.onDidChangeValue)(async () => {
                const allLinks = await links.all;
                if (accepted) {
                    return;
                }
                const wordIgnoreLinks = [...(allLinks.fileLinks ?? []), ...(allLinks.folderLinks ?? []), ...(allLinks.webLinks ?? [])];
                const wordPicks = allLinks.wordLinks ? await this._generatePicks(allLinks.wordLinks, wordIgnoreLinks) : undefined;
                const filePicks = allLinks.fileLinks ? await this._generatePicks(allLinks.fileLinks) : undefined;
                const folderPicks = allLinks.folderLinks ? await this._generatePicks(allLinks.folderLinks) : undefined;
                const webPicks = allLinks.webLinks ? await this._generatePicks(allLinks.webLinks) : undefined;
                const picks = [];
                if (webPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.urlLinks', "Url") });
                    picks.push(...webPicks);
                }
                if (filePicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFileLinks', "File") });
                    picks.push(...filePicks);
                }
                if (folderPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFolderLinks', "Folder") });
                    picks.push(...folderPicks);
                }
                if (wordPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.searchLinks', "Workspace Search") });
                    picks.push(...wordPicks);
                }
                pick.items = picks;
            }));
            return new Promise(r => {
                disposables.add(pick.onDidHide(() => {
                    disposables.dispose();
                    r();
                }));
                disposables.add(event_1.Event.once(pick.onDidAccept)(() => {
                    accepted = true;
                    const event = new terminal_1.TerminalLinkQuickPickEvent(dom_1.EventType.CLICK);
                    const activeItem = pick.activeItems?.[0];
                    if (activeItem && 'link' in activeItem) {
                        activeItem.link.activate(event, activeItem.label);
                    }
                    disposables.dispose();
                    r();
                }));
            });
        }
        /**
         * @param ignoreLinks Links with labels to not include in the picks.
         */
        async _generatePicks(links, ignoreLinks) {
            if (!links) {
                return;
            }
            const linkKeys = new Set();
            const picks = [];
            for (const link of links) {
                const label = link.text;
                if (!linkKeys.has(label) && (!ignoreLinks || !ignoreLinks.some(e => e.text === label))) {
                    linkKeys.add(label);
                    picks.push({ label, link });
                }
            }
            return picks.length > 0 ? picks : undefined;
        }
    };
    exports.TerminalLinkQuickpick = TerminalLinkQuickpick;
    exports.TerminalLinkQuickpick = TerminalLinkQuickpick = __decorate([
        __param(0, quickInput_1.IQuickInputService)
    ], TerminalLinkQuickpick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUXVpY2twaWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rUXVpY2twaWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLDJCQUFlO1FBS3pELFlBQ3FCLGtCQUF1RDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUY2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBSjNELDJCQUFzQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQy9ELDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7UUFNbkUsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBaUU7WUFDM0UscUJBQXFCO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzdHLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzdHLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFB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