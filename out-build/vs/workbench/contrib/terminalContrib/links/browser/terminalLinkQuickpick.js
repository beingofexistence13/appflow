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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/nls!vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/lifecycle"], function (require, exports, dom_1, event_1, nls_1, quickInput_1, terminal_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XWb = void 0;
    let $XWb = class $XWb extends lifecycle_1.$jc {
        constructor(b) {
            super();
            this.b = b;
            this.a = this.add(new event_1.$fd());
            this.onDidRequestMoreLinks = this.a.event;
        }
        async show(links) {
            // Get raw link picks
            const wordPicks = links.viewport.wordLinks ? await this.c(links.viewport.wordLinks) : undefined;
            const filePicks = links.viewport.fileLinks ? await this.c(links.viewport.fileLinks) : undefined;
            const folderPicks = links.viewport.folderLinks ? await this.c(links.viewport.folderLinks) : undefined;
            const webPicks = links.viewport.webLinks ? await this.c(links.viewport.webLinks) : undefined;
            const picks = [];
            if (webPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(0, null) });
                picks.push(...webPicks);
            }
            if (filePicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(1, null) });
                picks.push(...filePicks);
            }
            if (folderPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(2, null) });
                picks.push(...folderPicks);
            }
            if (wordPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(3, null) });
                picks.push(...wordPicks);
            }
            // Create and show quick pick
            const pick = this.b.createQuickPick();
            pick.items = picks;
            pick.placeholder = (0, nls_1.localize)(4, null);
            pick.sortByLabel = false;
            pick.show();
            // Show all results only when filtering begins, this is done so the quick pick will show up
            // ASAP with only the viewport entries.
            let accepted = false;
            const disposables = new lifecycle_1.$jc();
            disposables.add(event_1.Event.once(pick.onDidChangeValue)(async () => {
                const allLinks = await links.all;
                if (accepted) {
                    return;
                }
                const wordIgnoreLinks = [...(allLinks.fileLinks ?? []), ...(allLinks.folderLinks ?? []), ...(allLinks.webLinks ?? [])];
                const wordPicks = allLinks.wordLinks ? await this.c(allLinks.wordLinks, wordIgnoreLinks) : undefined;
                const filePicks = allLinks.fileLinks ? await this.c(allLinks.fileLinks) : undefined;
                const folderPicks = allLinks.folderLinks ? await this.c(allLinks.folderLinks) : undefined;
                const webPicks = allLinks.webLinks ? await this.c(allLinks.webLinks) : undefined;
                const picks = [];
                if (webPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)(5, null) });
                    picks.push(...webPicks);
                }
                if (filePicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)(6, null) });
                    picks.push(...filePicks);
                }
                if (folderPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)(7, null) });
                    picks.push(...folderPicks);
                }
                if (wordPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)(8, null) });
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
                    const event = new terminal_1.$Rib(dom_1.$3O.CLICK);
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
        async c(links, ignoreLinks) {
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
    exports.$XWb = $XWb;
    exports.$XWb = $XWb = __decorate([
        __param(0, quickInput_1.$Gq)
    ], $XWb);
});
//# sourceMappingURL=terminalLinkQuickpick.js.map