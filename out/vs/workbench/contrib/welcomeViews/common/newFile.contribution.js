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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, types_1, nls_1, actions_1, commands_1, contextkey_1, keybinding_1, quickInput_1, platform_1, contributions_1) {
    "use strict";
    var NewFileTemplatesManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const builtInSource = (0, nls_1.localize)('Built-In', "Built-In");
    const category = { value: (0, nls_1.localize)('Create', "Create"), original: 'Create' };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'welcome.showNewFileEntries',
                title: { value: (0, nls_1.localize)('welcome.newFile', "New File..."), original: 'New File...' },
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ + 2048 /* KeyMod.CtrlCmd */ + 256 /* KeyMod.WinCtrl */ + 44 /* KeyCode.KeyN */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                },
                menu: {
                    id: actions_1.MenuId.MenubarFileMenu,
                    group: '1_new',
                    order: 2
                }
            });
        }
        async run(accessor) {
            return (0, types_1.assertIsDefined)(NewFileTemplatesManager.Instance).run();
        }
    });
    let NewFileTemplatesManager = class NewFileTemplatesManager extends lifecycle_1.Disposable {
        static { NewFileTemplatesManager_1 = this; }
        constructor(quickInputService, contextKeyService, commandService, keybindingService, menuService) {
            super();
            this.quickInputService = quickInputService;
            this.contextKeyService = contextKeyService;
            this.commandService = commandService;
            this.keybindingService = keybindingService;
            NewFileTemplatesManager_1.Instance = this;
            this._register({ dispose() { if (NewFileTemplatesManager_1.Instance === this) {
                    NewFileTemplatesManager_1.Instance = undefined;
                } } });
            this.menu = menuService.createMenu(actions_1.MenuId.NewFile, contextKeyService);
        }
        allEntries() {
            const items = [];
            for (const [groupName, group] of this.menu.getActions({ renderShortTitle: true })) {
                for (const action of group) {
                    if (action instanceof actions_1.MenuItemAction) {
                        items.push({ commandID: action.item.id, from: action.item.source?.title ?? builtInSource, title: action.label, group: groupName });
                    }
                }
            }
            return items;
        }
        async run() {
            const entries = this.allEntries();
            if (entries.length === 0) {
                throw Error('Unexpected empty new items list');
            }
            else if (entries.length === 1) {
                this.commandService.executeCommand(entries[0].commandID);
                return true;
            }
            else {
                return this.selectNewEntry(entries);
            }
        }
        async selectNewEntry(entries) {
            let resolveResult;
            const resultPromise = new Promise(resolve => {
                resolveResult = resolve;
            });
            const disposables = new lifecycle_1.DisposableStore();
            const qp = this.quickInputService.createQuickPick();
            qp.title = (0, nls_1.localize)('newFileTitle', "New File...");
            qp.placeholder = (0, nls_1.localize)('newFilePlaceholder', "Select File Type or Enter File Name...");
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
                'file': (0, nls_1.localize)('file', "File"),
                'notebook': (0, nls_1.localize)('notebook', "Notebook"),
            };
            const refreshQp = (entries) => {
                const items = [];
                let lastSeparator;
                entries
                    .sort((a, b) => -sortCategories(a, b))
                    .forEach((entry) => {
                    const command = entry.commandID;
                    const keybinding = this.keybindingService.lookupKeybinding(command || '', this.contextKeyService);
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
                                tooltip: (0, nls_1.localize)('change keybinding', "Configure Keybinding")
                            }
                        ] : [],
                        detail: '',
                        description: entry.from,
                    });
                });
                qp.items = items;
            };
            refreshQp(entries);
            disposables.add(this.menu.onDidChange(() => refreshQp(this.allEntries())));
            disposables.add(qp.onDidChangeValue((val) => {
                if (val === '') {
                    refreshQp(entries);
                    return;
                }
                const currentTextEntry = {
                    commandID: 'workbench.action.files.newFile',
                    commandArgs: { languageId: undefined, viewType: undefined, fileName: val },
                    title: (0, nls_1.localize)('miNewFileWithName', "Create New File ({0})", val),
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
                    await this.commandService.executeCommand(selected.commandID, selected.commandArgs);
                }
            }));
            disposables.add(qp.onDidHide(() => {
                qp.dispose();
                disposables.dispose();
                resolveResult(false);
            }));
            disposables.add(qp.onDidTriggerItemButton(e => {
                qp.hide();
                this.commandService.executeCommand('workbench.action.openGlobalKeybindings', e.item.commandID);
                resolveResult(false);
            }));
            qp.show();
            return resultPromise;
        }
    };
    NewFileTemplatesManager = NewFileTemplatesManager_1 = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, commands_1.ICommandService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, actions_1.IMenuService)
    ], NewFileTemplatesManager);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NewFileTemplatesManager, 3 /* LifecyclePhase.Restored */);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NewFile, {
        group: 'file',
        command: {
            id: 'workbench.action.files.newUntitledFile',
            title: (0, nls_1.localize)('miNewFile2', "Text File")
        },
        order: 1
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3RmlsZS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lVmlld3MvY29tbW9uL25ld0ZpbGUuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCaEcsTUFBTSxhQUFhLEdBQUcsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sUUFBUSxHQUFxQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBRS9GLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDRCQUE0QjtnQkFDaEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUU7Z0JBQ3JGLFFBQVE7Z0JBQ1IsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE9BQU8sRUFBRSxnREFBMkIsMkJBQWlCLHdCQUFlO29CQUNwRSxNQUFNLDZDQUFtQztpQkFDekM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7b0JBQzFCLEtBQUssRUFBRSxPQUFPO29CQUNkLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsT0FBTyxJQUFBLHVCQUFlLEVBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEUs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