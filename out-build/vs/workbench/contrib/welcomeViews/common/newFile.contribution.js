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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls!vs/workbench/contrib/welcomeViews/common/newFile.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, types_1, nls_1, actions_1, commands_1, contextkey_1, keybinding_1, quickInput_1, platform_1, contributions_1) {
    "use strict";
    var NewFileTemplatesManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const builtInSource = (0, nls_1.localize)(0, null);
    const category = { value: (0, nls_1.localize)(1, null), original: 'Create' };
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'welcome.showNewFileEntries',
                title: { value: (0, nls_1.localize)(2, null), original: 'New File...' },
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ + 2048 /* KeyMod.CtrlCmd */ + 256 /* KeyMod.WinCtrl */ + 44 /* KeyCode.KeyN */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                },
                menu: {
                    id: actions_1.$Ru.MenubarFileMenu,
                    group: '1_new',
                    order: 2
                }
            });
        }
        async run(accessor) {
            return (0, types_1.$uf)(NewFileTemplatesManager.Instance).run();
        }
    });
    let NewFileTemplatesManager = class NewFileTemplatesManager extends lifecycle_1.$kc {
        static { NewFileTemplatesManager_1 = this; }
        constructor(f, g, h, j, menuService) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            NewFileTemplatesManager_1.Instance = this;
            this.B({ dispose() { if (NewFileTemplatesManager_1.Instance === this) {
                    NewFileTemplatesManager_1.Instance = undefined;
                } } });
            this.c = menuService.createMenu(actions_1.$Ru.NewFile, g);
        }
        m() {
            const items = [];
            for (const [groupName, group] of this.c.getActions({ renderShortTitle: true })) {
                for (const action of group) {
                    if (action instanceof actions_1.$Vu) {
                        items.push({ commandID: action.item.id, from: action.item.source?.title ?? builtInSource, title: action.label, group: groupName });
                    }
                }
            }
            return items;
        }
        async run() {
            const entries = this.m();
            if (entries.length === 0) {
                throw Error('Unexpected empty new items list');
            }
            else if (entries.length === 1) {
                this.h.executeCommand(entries[0].commandID);
                return true;
            }
            else {
                return this.n(entries);
            }
        }
        async n(entries) {
            let resolveResult;
            const resultPromise = new Promise(resolve => {
                resolveResult = resolve;
            });
            const disposables = new lifecycle_1.$jc();
            const qp = this.f.createQuickPick();
            qp.title = (0, nls_1.localize)(3, null);
            qp.placeholder = (0, nls_1.localize)(4, null);
            qp.sortByLabel = false;
            qp.matchOnDetail = true;
            qp.matchOnDescription = true;
            const sortCategories = (a, b) => {
                const categoryPriority = { 'file': 1, 'notebook': 2 };
                if (categoryPriority[a.group] && categoryPriority[b.group]) {
                    if (categoryPriority[a.group] !== categoryPriority[b.group]) {
                        return categoryPriority[b.group] - categoryPriority[a.group];
                    }
                }
                else if (categoryPriority[a.group]) {
                    return 1;
                }
                else if (categoryPriority[b.group]) {
                    return -1;
                }
                if (a.from === builtInSource) {
                    return 1;
                }
                if (b.from === builtInSource) {
                    return -1;
                }
                return a.from.localeCompare(b.from);
            };
            const displayCategory = {
                'file': (0, nls_1.localize)(5, null),
                'notebook': (0, nls_1.localize)(6, null),
            };
            const refreshQp = (entries) => {
                const items = [];
                let lastSeparator;
                entries
                    .sort((a, b) => -sortCategories(a, b))
                    .forEach((entry) => {
                    const command = entry.commandID;
                    const keybinding = this.j.lookupKeybinding(command || '', this.g);
                    if (lastSeparator !== entry.group) {
                        items.push({
                            type: 'separator',
                            label: displayCategory[entry.group] ?? entry.group
                        });
                        lastSeparator = entry.group;
                    }
                    items.push({
                        ...entry,
                        label: entry.title,
                        type: 'item',
                        keybinding,
                        buttons: command ? [
                            {
                                iconClass: 'codicon codicon-gear',
                                tooltip: (0, nls_1.localize)(7, null)
                            }
                        ] : [],
                        detail: '',
                        description: entry.from,
                    });
                });
                qp.items = items;
            };
            refreshQp(entries);
            disposables.add(this.c.onDidChange(() => refreshQp(this.m())));
            disposables.add(qp.onDidChangeValue((val) => {
                if (val === '') {
                    refreshQp(entries);
                    return;
                }
                const currentTextEntry = {
                    commandID: 'workbench.action.files.newFile',
                    commandArgs: { languageId: undefined, viewType: undefined, fileName: val },
                    title: (0, nls_1.localize)(8, null, val),
                    group: 'file',
                    from: builtInSource,
                };
                refreshQp([currentTextEntry, ...entries]);
            }));
            disposables.add(qp.onDidAccept(async (e) => {
                const selected = qp.selectedItems[0];
                resolveResult(!!selected);
                qp.hide();
                if (selected) {
                    await this.h.executeCommand(selected.commandID, selected.commandArgs);
                }
            }));
            disposables.add(qp.onDidHide(() => {
                qp.dispose();
                disposables.dispose();
                resolveResult(false);
            }));
            disposables.add(qp.onDidTriggerItemButton(e => {
                qp.hide();
                this.h.executeCommand('workbench.action.openGlobalKeybindings', e.item.commandID);
                resolveResult(false);
            }));
            qp.show();
            return resultPromise;
        }
    };
    NewFileTemplatesManager = NewFileTemplatesManager_1 = __decorate([
        __param(0, quickInput_1.$Gq),
        __param(1, contextkey_1.$3i),
        __param(2, commands_1.$Fr),
        __param(3, keybinding_1.$2D),
        __param(4, actions_1.$Su)
    ], NewFileTemplatesManager);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NewFileTemplatesManager, 3 /* LifecyclePhase.Restored */);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.NewFile, {
        group: 'file',
        command: {
            id: 'workbench.action.files.newUntitledFile',
            title: (0, nls_1.localize)(9, null)
        },
        order: 1
    });
});
//# sourceMappingURL=newFile.contribution.js.map