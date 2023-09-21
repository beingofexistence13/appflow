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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, actions_1, themables_1, event_1, lifecycle_1, linkedList_1, commands_1, contextkey_1, instantiation_1, keybindingsRegistry_1) {
    "use strict";
    var $Vu_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xu = exports.$Wu = exports.$Vu = exports.$Uu = exports.$Tu = exports.$Su = exports.$Ru = exports.$Qu = exports.$Pu = void 0;
    function $Pu(item) {
        return item.command !== undefined;
    }
    exports.$Pu = $Pu;
    function $Qu(item) {
        return item.submenu !== undefined;
    }
    exports.$Qu = $Qu;
    class $Ru {
        static { this.a = new Map(); }
        static { this.CommandPalette = new $Ru('CommandPalette'); }
        static { this.DebugBreakpointsContext = new $Ru('DebugBreakpointsContext'); }
        static { this.DebugCallStackContext = new $Ru('DebugCallStackContext'); }
        static { this.DebugConsoleContext = new $Ru('DebugConsoleContext'); }
        static { this.DebugVariablesContext = new $Ru('DebugVariablesContext'); }
        static { this.DebugWatchContext = new $Ru('DebugWatchContext'); }
        static { this.DebugToolBar = new $Ru('DebugToolBar'); }
        static { this.DebugToolBarStop = new $Ru('DebugToolBarStop'); }
        static { this.EditorContext = new $Ru('EditorContext'); }
        static { this.SimpleEditorContext = new $Ru('SimpleEditorContext'); }
        static { this.EditorContent = new $Ru('EditorContent'); }
        static { this.EditorLineNumberContext = new $Ru('EditorLineNumberContext'); }
        static { this.EditorContextCopy = new $Ru('EditorContextCopy'); }
        static { this.EditorContextPeek = new $Ru('EditorContextPeek'); }
        static { this.EditorContextShare = new $Ru('EditorContextShare'); }
        static { this.EditorTitle = new $Ru('EditorTitle'); }
        static { this.EditorTitleRun = new $Ru('EditorTitleRun'); }
        static { this.EditorTitleContext = new $Ru('EditorTitleContext'); }
        static { this.EditorTitleContextShare = new $Ru('EditorTitleContextShare'); }
        static { this.EmptyEditorGroup = new $Ru('EmptyEditorGroup'); }
        static { this.EmptyEditorGroupContext = new $Ru('EmptyEditorGroupContext'); }
        static { this.EditorTabsBarContext = new $Ru('EditorTabsBarContext'); }
        static { this.ExplorerContext = new $Ru('ExplorerContext'); }
        static { this.ExplorerContextShare = new $Ru('ExplorerContextShare'); }
        static { this.ExtensionContext = new $Ru('ExtensionContext'); }
        static { this.GlobalActivity = new $Ru('GlobalActivity'); }
        static { this.CommandCenter = new $Ru('CommandCenter'); }
        static { this.CommandCenterCenter = new $Ru('CommandCenterCenter'); }
        static { this.LayoutControlMenuSubmenu = new $Ru('LayoutControlMenuSubmenu'); }
        static { this.LayoutControlMenu = new $Ru('LayoutControlMenu'); }
        static { this.MenubarMainMenu = new $Ru('MenubarMainMenu'); }
        static { this.MenubarAppearanceMenu = new $Ru('MenubarAppearanceMenu'); }
        static { this.MenubarDebugMenu = new $Ru('MenubarDebugMenu'); }
        static { this.MenubarEditMenu = new $Ru('MenubarEditMenu'); }
        static { this.MenubarCopy = new $Ru('MenubarCopy'); }
        static { this.MenubarFileMenu = new $Ru('MenubarFileMenu'); }
        static { this.MenubarGoMenu = new $Ru('MenubarGoMenu'); }
        static { this.MenubarHelpMenu = new $Ru('MenubarHelpMenu'); }
        static { this.MenubarLayoutMenu = new $Ru('MenubarLayoutMenu'); }
        static { this.MenubarNewBreakpointMenu = new $Ru('MenubarNewBreakpointMenu'); }
        static { this.PanelAlignmentMenu = new $Ru('PanelAlignmentMenu'); }
        static { this.PanelPositionMenu = new $Ru('PanelPositionMenu'); }
        static { this.MenubarPreferencesMenu = new $Ru('MenubarPreferencesMenu'); }
        static { this.MenubarRecentMenu = new $Ru('MenubarRecentMenu'); }
        static { this.MenubarSelectionMenu = new $Ru('MenubarSelectionMenu'); }
        static { this.MenubarShare = new $Ru('MenubarShare'); }
        static { this.MenubarSwitchEditorMenu = new $Ru('MenubarSwitchEditorMenu'); }
        static { this.MenubarSwitchGroupMenu = new $Ru('MenubarSwitchGroupMenu'); }
        static { this.MenubarTerminalMenu = new $Ru('MenubarTerminalMenu'); }
        static { this.MenubarViewMenu = new $Ru('MenubarViewMenu'); }
        static { this.MenubarHomeMenu = new $Ru('MenubarHomeMenu'); }
        static { this.OpenEditorsContext = new $Ru('OpenEditorsContext'); }
        static { this.OpenEditorsContextShare = new $Ru('OpenEditorsContextShare'); }
        static { this.ProblemsPanelContext = new $Ru('ProblemsPanelContext'); }
        static { this.SCMChangeContext = new $Ru('SCMChangeContext'); }
        static { this.SCMResourceContext = new $Ru('SCMResourceContext'); }
        static { this.SCMResourceContextShare = new $Ru('SCMResourceContextShare'); }
        static { this.SCMResourceFolderContext = new $Ru('SCMResourceFolderContext'); }
        static { this.SCMResourceGroupContext = new $Ru('SCMResourceGroupContext'); }
        static { this.SCMSourceControl = new $Ru('SCMSourceControl'); }
        static { this.SCMTitle = new $Ru('SCMTitle'); }
        static { this.SearchContext = new $Ru('SearchContext'); }
        static { this.SearchActionMenu = new $Ru('SearchActionContext'); }
        static { this.StatusBarWindowIndicatorMenu = new $Ru('StatusBarWindowIndicatorMenu'); }
        static { this.StatusBarRemoteIndicatorMenu = new $Ru('StatusBarRemoteIndicatorMenu'); }
        static { this.StickyScrollContext = new $Ru('StickyScrollContext'); }
        static { this.TestItem = new $Ru('TestItem'); }
        static { this.TestItemGutter = new $Ru('TestItemGutter'); }
        static { this.TestMessageContext = new $Ru('TestMessageContext'); }
        static { this.TestMessageContent = new $Ru('TestMessageContent'); }
        static { this.TestPeekElement = new $Ru('TestPeekElement'); }
        static { this.TestPeekTitle = new $Ru('TestPeekTitle'); }
        static { this.TouchBarContext = new $Ru('TouchBarContext'); }
        static { this.TitleBarContext = new $Ru('TitleBarContext'); }
        static { this.TitleBarTitleContext = new $Ru('TitleBarTitleContext'); }
        static { this.TunnelContext = new $Ru('TunnelContext'); }
        static { this.TunnelPrivacy = new $Ru('TunnelPrivacy'); }
        static { this.TunnelProtocol = new $Ru('TunnelProtocol'); }
        static { this.TunnelPortInline = new $Ru('TunnelInline'); }
        static { this.TunnelTitle = new $Ru('TunnelTitle'); }
        static { this.TunnelLocalAddressInline = new $Ru('TunnelLocalAddressInline'); }
        static { this.TunnelOriginInline = new $Ru('TunnelOriginInline'); }
        static { this.ViewItemContext = new $Ru('ViewItemContext'); }
        static { this.ViewContainerTitle = new $Ru('ViewContainerTitle'); }
        static { this.ViewContainerTitleContext = new $Ru('ViewContainerTitleContext'); }
        static { this.ViewTitle = new $Ru('ViewTitle'); }
        static { this.ViewTitleContext = new $Ru('ViewTitleContext'); }
        static { this.CommentEditorActions = new $Ru('CommentEditorActions'); }
        static { this.CommentThreadTitle = new $Ru('CommentThreadTitle'); }
        static { this.CommentThreadActions = new $Ru('CommentThreadActions'); }
        static { this.CommentThreadAdditionalActions = new $Ru('CommentThreadAdditionalActions'); }
        static { this.CommentThreadTitleContext = new $Ru('CommentThreadTitleContext'); }
        static { this.CommentThreadCommentContext = new $Ru('CommentThreadCommentContext'); }
        static { this.CommentTitle = new $Ru('CommentTitle'); }
        static { this.CommentActions = new $Ru('CommentActions'); }
        static { this.InteractiveToolbar = new $Ru('InteractiveToolbar'); }
        static { this.InteractiveCellTitle = new $Ru('InteractiveCellTitle'); }
        static { this.InteractiveCellDelete = new $Ru('InteractiveCellDelete'); }
        static { this.InteractiveCellExecute = new $Ru('InteractiveCellExecute'); }
        static { this.InteractiveInputExecute = new $Ru('InteractiveInputExecute'); }
        static { this.NotebookToolbar = new $Ru('NotebookToolbar'); }
        static { this.NotebookStickyScrollContext = new $Ru('NotebookStickyScrollContext'); }
        static { this.NotebookCellTitle = new $Ru('NotebookCellTitle'); }
        static { this.NotebookCellDelete = new $Ru('NotebookCellDelete'); }
        static { this.NotebookCellInsert = new $Ru('NotebookCellInsert'); }
        static { this.NotebookCellBetween = new $Ru('NotebookCellBetween'); }
        static { this.NotebookCellListTop = new $Ru('NotebookCellTop'); }
        static { this.NotebookCellExecute = new $Ru('NotebookCellExecute'); }
        static { this.NotebookCellExecutePrimary = new $Ru('NotebookCellExecutePrimary'); }
        static { this.NotebookDiffCellInputTitle = new $Ru('NotebookDiffCellInputTitle'); }
        static { this.NotebookDiffCellMetadataTitle = new $Ru('NotebookDiffCellMetadataTitle'); }
        static { this.NotebookDiffCellOutputsTitle = new $Ru('NotebookDiffCellOutputsTitle'); }
        static { this.NotebookOutputToolbar = new $Ru('NotebookOutputToolbar'); }
        static { this.NotebookEditorLayoutConfigure = new $Ru('NotebookEditorLayoutConfigure'); }
        static { this.NotebookKernelSource = new $Ru('NotebookKernelSource'); }
        static { this.BulkEditTitle = new $Ru('BulkEditTitle'); }
        static { this.BulkEditContext = new $Ru('BulkEditContext'); }
        static { this.TimelineItemContext = new $Ru('TimelineItemContext'); }
        static { this.TimelineTitle = new $Ru('TimelineTitle'); }
        static { this.TimelineTitleContext = new $Ru('TimelineTitleContext'); }
        static { this.TimelineFilterSubMenu = new $Ru('TimelineFilterSubMenu'); }
        static { this.AccountsContext = new $Ru('AccountsContext'); }
        static { this.PanelTitle = new $Ru('PanelTitle'); }
        static { this.AuxiliaryBarTitle = new $Ru('AuxiliaryBarTitle'); }
        static { this.TerminalInstanceContext = new $Ru('TerminalInstanceContext'); }
        static { this.TerminalEditorInstanceContext = new $Ru('TerminalEditorInstanceContext'); }
        static { this.TerminalNewDropdownContext = new $Ru('TerminalNewDropdownContext'); }
        static { this.TerminalTabContext = new $Ru('TerminalTabContext'); }
        static { this.TerminalTabEmptyAreaContext = new $Ru('TerminalTabEmptyAreaContext'); }
        static { this.WebviewContext = new $Ru('WebviewContext'); }
        static { this.InlineCompletionsActions = new $Ru('InlineCompletionsActions'); }
        static { this.NewFile = new $Ru('NewFile'); }
        static { this.MergeInput1Toolbar = new $Ru('MergeToolbar1Toolbar'); }
        static { this.MergeInput2Toolbar = new $Ru('MergeToolbar2Toolbar'); }
        static { this.MergeBaseToolbar = new $Ru('MergeBaseToolbar'); }
        static { this.MergeInputResultToolbar = new $Ru('MergeToolbarResultToolbar'); }
        static { this.InlineSuggestionToolbar = new $Ru('InlineSuggestionToolbar'); }
        static { this.ChatContext = new $Ru('ChatContext'); }
        static { this.ChatCodeBlock = new $Ru('ChatCodeblock'); }
        static { this.ChatMessageTitle = new $Ru('ChatMessageTitle'); }
        static { this.ChatExecute = new $Ru('ChatExecute'); }
        static { this.ChatInputSide = new $Ru('ChatInputSide'); }
        static { this.AccessibleView = new $Ru('AccessibleView'); }
        /**
         * Create or reuse a `MenuId` with the given identifier
         */
        static for(identifier) {
            return $Ru.a.get(identifier) ?? new $Ru(identifier);
        }
        /**
         * Create a new `MenuId` with the unique identifier. Will throw if a menu
         * with the identifier already exists, use `MenuId.for(ident)` or a unique
         * identifier
         */
        constructor(identifier) {
            if ($Ru.a.has(identifier)) {
                throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
            }
            $Ru.a.set(identifier, this);
            this.id = identifier;
        }
    }
    exports.$Ru = $Ru;
    exports.$Su = (0, instantiation_1.$Bh)('menuService');
    class MenuRegistryChangeEvent {
        static { this.a = new Map(); }
        static for(id) {
            let value = this.a.get(id);
            if (!value) {
                value = new MenuRegistryChangeEvent(id);
                this.a.set(id, value);
            }
            return value;
        }
        static merge(events) {
            const ids = new Set();
            for (const item of events) {
                if (item instanceof MenuRegistryChangeEvent) {
                    ids.add(item.b);
                }
            }
            return ids;
        }
        constructor(b) {
            this.b = b;
            this.has = candidate => candidate === b;
        }
    }
    exports.$Tu = new class {
        constructor() {
            this.a = new Map();
            this.b = new Map();
            this.c = new event_1.$kd({
                merge: MenuRegistryChangeEvent.merge
            });
            this.onDidChangeMenu = this.c.event;
        }
        addCommand(command) {
            this.a.set(command.id, command);
            this.c.fire(MenuRegistryChangeEvent.for($Ru.CommandPalette));
            return (0, lifecycle_1.$ic)(() => {
                if (this.a.delete(command.id)) {
                    this.c.fire(MenuRegistryChangeEvent.for($Ru.CommandPalette));
                }
            });
        }
        getCommand(id) {
            return this.a.get(id);
        }
        getCommands() {
            const map = new Map();
            this.a.forEach((value, key) => map.set(key, value));
            return map;
        }
        appendMenuItem(id, item) {
            let list = this.b.get(id);
            if (!list) {
                list = new linkedList_1.$tc();
                this.b.set(id, list);
            }
            const rm = list.push(item);
            this.c.fire(MenuRegistryChangeEvent.for(id));
            return (0, lifecycle_1.$ic)(() => {
                rm();
                this.c.fire(MenuRegistryChangeEvent.for(id));
            });
        }
        appendMenuItems(items) {
            const result = new lifecycle_1.$jc();
            for (const { id, item } of items) {
                result.add(this.appendMenuItem(id, item));
            }
            return result;
        }
        getMenuItems(id) {
            let result;
            if (this.b.has(id)) {
                result = [...this.b.get(id)];
            }
            else {
                result = [];
            }
            if (id === $Ru.CommandPalette) {
                // CommandPalette is special because it shows
                // all commands by default
                this.d(result);
            }
            return result;
        }
        d(result) {
            const set = new Set();
            for (const item of result) {
                if ($Pu(item)) {
                    set.add(item.command.id);
                    if (item.alt) {
                        set.add(item.alt.id);
                    }
                }
            }
            this.a.forEach((command, id) => {
                if (!set.has(id)) {
                    result.push({ command });
                }
            });
        }
    };
    class $Uu extends actions_1.$ji {
        constructor(item, hideActions, actions) {
            super(`submenuitem.${item.submenu.id}`, typeof item.title === 'string' ? item.title : item.title.value, actions, 'submenu');
            this.item = item;
            this.hideActions = hideActions;
        }
    }
    exports.$Uu = $Uu;
    // implements IAction, does NOT extend Action, so that no one
    // subscribes to events of Action or modified properties
    let $Vu = $Vu_1 = class $Vu {
        static label(action, options) {
            return options?.renderShortTitle && action.shortTitle
                ? (typeof action.shortTitle === 'string' ? action.shortTitle : action.shortTitle.value)
                : (typeof action.title === 'string' ? action.title : action.title.value);
        }
        constructor(item, alt, options, hideActions, contextKeyService, b) {
            this.hideActions = hideActions;
            this.b = b;
            this.id = item.id;
            this.label = $Vu_1.label(item, options);
            this.tooltip = (typeof item.tooltip === 'string' ? item.tooltip : item.tooltip?.value) ?? '';
            this.enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
            this.checked = undefined;
            let icon;
            if (item.toggled) {
                const toggled = (item.toggled.condition ? item.toggled : { condition: item.toggled });
                this.checked = contextKeyService.contextMatchesRules(toggled.condition);
                if (this.checked && toggled.tooltip) {
                    this.tooltip = typeof toggled.tooltip === 'string' ? toggled.tooltip : toggled.tooltip.value;
                }
                if (this.checked && themables_1.ThemeIcon.isThemeIcon(toggled.icon)) {
                    icon = toggled.icon;
                }
                if (this.checked && toggled.title) {
                    this.label = typeof toggled.title === 'string' ? toggled.title : toggled.title.value;
                }
            }
            if (!icon) {
                icon = themables_1.ThemeIcon.isThemeIcon(item.icon) ? item.icon : undefined;
            }
            this.item = item;
            this.alt = alt ? new $Vu_1(alt, undefined, options, hideActions, contextKeyService, b) : undefined;
            this.a = options;
            this.class = icon && themables_1.ThemeIcon.asClassName(icon);
        }
        run(...args) {
            let runArgs = [];
            if (this.a?.arg) {
                runArgs = [...runArgs, this.a.arg];
            }
            if (this.a?.shouldForwardArgs) {
                runArgs = [...runArgs, ...args];
            }
            return this.b.executeCommand(this.id, ...runArgs);
        }
    };
    exports.$Vu = $Vu;
    exports.$Vu = $Vu = $Vu_1 = __decorate([
        __param(4, contextkey_1.$3i),
        __param(5, commands_1.$Fr)
    ], $Vu);
    class $Wu {
        constructor(desc) {
            this.desc = desc;
        }
    }
    exports.$Wu = $Wu;
    function $Xu(ctor) {
        const disposables = new lifecycle_1.$jc();
        const action = new ctor();
        const { f1, menu, keybinding, description, ...command } = action.desc;
        // command
        disposables.add(commands_1.$Gr.registerCommand({
            id: command.id,
            handler: (accessor, ...args) => action.run(accessor, ...args),
            description: description,
        }));
        // menu
        if (Array.isArray(menu)) {
            for (const item of menu) {
                disposables.add(exports.$Tu.appendMenuItem(item.id, { command: { ...command, precondition: item.precondition === null ? undefined : command.precondition }, ...item }));
            }
        }
        else if (menu) {
            disposables.add(exports.$Tu.appendMenuItem(menu.id, { command: { ...command, precondition: menu.precondition === null ? undefined : command.precondition }, ...menu }));
        }
        if (f1) {
            disposables.add(exports.$Tu.appendMenuItem($Ru.CommandPalette, { command, when: command.precondition }));
            disposables.add(exports.$Tu.addCommand(command));
        }
        // keybinding
        if (Array.isArray(keybinding)) {
            for (const item of keybinding) {
                disposables.add(keybindingsRegistry_1.$Nu.registerKeybindingRule({
                    ...item,
                    id: command.id,
                    when: command.precondition ? contextkey_1.$Ii.and(command.precondition, item.when) : item.when
                }));
            }
        }
        else if (keybinding) {
            disposables.add(keybindingsRegistry_1.$Nu.registerKeybindingRule({
                ...keybinding,
                id: command.id,
                when: command.precondition ? contextkey_1.$Ii.and(command.precondition, keybinding.when) : keybinding.when
            }));
        }
        return disposables;
    }
    exports.$Xu = $Xu;
});
//#endregion
//# sourceMappingURL=actions.js.map