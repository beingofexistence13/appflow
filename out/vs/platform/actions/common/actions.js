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
    var MenuItemAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerAction2 = exports.Action2 = exports.MenuItemAction = exports.SubmenuItemAction = exports.MenuRegistry = exports.IMenuService = exports.MenuId = exports.isISubmenuItem = exports.isIMenuItem = void 0;
    function isIMenuItem(item) {
        return item.command !== undefined;
    }
    exports.isIMenuItem = isIMenuItem;
    function isISubmenuItem(item) {
        return item.submenu !== undefined;
    }
    exports.isISubmenuItem = isISubmenuItem;
    class MenuId {
        static { this._instances = new Map(); }
        static { this.CommandPalette = new MenuId('CommandPalette'); }
        static { this.DebugBreakpointsContext = new MenuId('DebugBreakpointsContext'); }
        static { this.DebugCallStackContext = new MenuId('DebugCallStackContext'); }
        static { this.DebugConsoleContext = new MenuId('DebugConsoleContext'); }
        static { this.DebugVariablesContext = new MenuId('DebugVariablesContext'); }
        static { this.DebugWatchContext = new MenuId('DebugWatchContext'); }
        static { this.DebugToolBar = new MenuId('DebugToolBar'); }
        static { this.DebugToolBarStop = new MenuId('DebugToolBarStop'); }
        static { this.EditorContext = new MenuId('EditorContext'); }
        static { this.SimpleEditorContext = new MenuId('SimpleEditorContext'); }
        static { this.EditorContent = new MenuId('EditorContent'); }
        static { this.EditorLineNumberContext = new MenuId('EditorLineNumberContext'); }
        static { this.EditorContextCopy = new MenuId('EditorContextCopy'); }
        static { this.EditorContextPeek = new MenuId('EditorContextPeek'); }
        static { this.EditorContextShare = new MenuId('EditorContextShare'); }
        static { this.EditorTitle = new MenuId('EditorTitle'); }
        static { this.EditorTitleRun = new MenuId('EditorTitleRun'); }
        static { this.EditorTitleContext = new MenuId('EditorTitleContext'); }
        static { this.EditorTitleContextShare = new MenuId('EditorTitleContextShare'); }
        static { this.EmptyEditorGroup = new MenuId('EmptyEditorGroup'); }
        static { this.EmptyEditorGroupContext = new MenuId('EmptyEditorGroupContext'); }
        static { this.EditorTabsBarContext = new MenuId('EditorTabsBarContext'); }
        static { this.ExplorerContext = new MenuId('ExplorerContext'); }
        static { this.ExplorerContextShare = new MenuId('ExplorerContextShare'); }
        static { this.ExtensionContext = new MenuId('ExtensionContext'); }
        static { this.GlobalActivity = new MenuId('GlobalActivity'); }
        static { this.CommandCenter = new MenuId('CommandCenter'); }
        static { this.CommandCenterCenter = new MenuId('CommandCenterCenter'); }
        static { this.LayoutControlMenuSubmenu = new MenuId('LayoutControlMenuSubmenu'); }
        static { this.LayoutControlMenu = new MenuId('LayoutControlMenu'); }
        static { this.MenubarMainMenu = new MenuId('MenubarMainMenu'); }
        static { this.MenubarAppearanceMenu = new MenuId('MenubarAppearanceMenu'); }
        static { this.MenubarDebugMenu = new MenuId('MenubarDebugMenu'); }
        static { this.MenubarEditMenu = new MenuId('MenubarEditMenu'); }
        static { this.MenubarCopy = new MenuId('MenubarCopy'); }
        static { this.MenubarFileMenu = new MenuId('MenubarFileMenu'); }
        static { this.MenubarGoMenu = new MenuId('MenubarGoMenu'); }
        static { this.MenubarHelpMenu = new MenuId('MenubarHelpMenu'); }
        static { this.MenubarLayoutMenu = new MenuId('MenubarLayoutMenu'); }
        static { this.MenubarNewBreakpointMenu = new MenuId('MenubarNewBreakpointMenu'); }
        static { this.PanelAlignmentMenu = new MenuId('PanelAlignmentMenu'); }
        static { this.PanelPositionMenu = new MenuId('PanelPositionMenu'); }
        static { this.MenubarPreferencesMenu = new MenuId('MenubarPreferencesMenu'); }
        static { this.MenubarRecentMenu = new MenuId('MenubarRecentMenu'); }
        static { this.MenubarSelectionMenu = new MenuId('MenubarSelectionMenu'); }
        static { this.MenubarShare = new MenuId('MenubarShare'); }
        static { this.MenubarSwitchEditorMenu = new MenuId('MenubarSwitchEditorMenu'); }
        static { this.MenubarSwitchGroupMenu = new MenuId('MenubarSwitchGroupMenu'); }
        static { this.MenubarTerminalMenu = new MenuId('MenubarTerminalMenu'); }
        static { this.MenubarViewMenu = new MenuId('MenubarViewMenu'); }
        static { this.MenubarHomeMenu = new MenuId('MenubarHomeMenu'); }
        static { this.OpenEditorsContext = new MenuId('OpenEditorsContext'); }
        static { this.OpenEditorsContextShare = new MenuId('OpenEditorsContextShare'); }
        static { this.ProblemsPanelContext = new MenuId('ProblemsPanelContext'); }
        static { this.SCMChangeContext = new MenuId('SCMChangeContext'); }
        static { this.SCMResourceContext = new MenuId('SCMResourceContext'); }
        static { this.SCMResourceContextShare = new MenuId('SCMResourceContextShare'); }
        static { this.SCMResourceFolderContext = new MenuId('SCMResourceFolderContext'); }
        static { this.SCMResourceGroupContext = new MenuId('SCMResourceGroupContext'); }
        static { this.SCMSourceControl = new MenuId('SCMSourceControl'); }
        static { this.SCMTitle = new MenuId('SCMTitle'); }
        static { this.SearchContext = new MenuId('SearchContext'); }
        static { this.SearchActionMenu = new MenuId('SearchActionContext'); }
        static { this.StatusBarWindowIndicatorMenu = new MenuId('StatusBarWindowIndicatorMenu'); }
        static { this.StatusBarRemoteIndicatorMenu = new MenuId('StatusBarRemoteIndicatorMenu'); }
        static { this.StickyScrollContext = new MenuId('StickyScrollContext'); }
        static { this.TestItem = new MenuId('TestItem'); }
        static { this.TestItemGutter = new MenuId('TestItemGutter'); }
        static { this.TestMessageContext = new MenuId('TestMessageContext'); }
        static { this.TestMessageContent = new MenuId('TestMessageContent'); }
        static { this.TestPeekElement = new MenuId('TestPeekElement'); }
        static { this.TestPeekTitle = new MenuId('TestPeekTitle'); }
        static { this.TouchBarContext = new MenuId('TouchBarContext'); }
        static { this.TitleBarContext = new MenuId('TitleBarContext'); }
        static { this.TitleBarTitleContext = new MenuId('TitleBarTitleContext'); }
        static { this.TunnelContext = new MenuId('TunnelContext'); }
        static { this.TunnelPrivacy = new MenuId('TunnelPrivacy'); }
        static { this.TunnelProtocol = new MenuId('TunnelProtocol'); }
        static { this.TunnelPortInline = new MenuId('TunnelInline'); }
        static { this.TunnelTitle = new MenuId('TunnelTitle'); }
        static { this.TunnelLocalAddressInline = new MenuId('TunnelLocalAddressInline'); }
        static { this.TunnelOriginInline = new MenuId('TunnelOriginInline'); }
        static { this.ViewItemContext = new MenuId('ViewItemContext'); }
        static { this.ViewContainerTitle = new MenuId('ViewContainerTitle'); }
        static { this.ViewContainerTitleContext = new MenuId('ViewContainerTitleContext'); }
        static { this.ViewTitle = new MenuId('ViewTitle'); }
        static { this.ViewTitleContext = new MenuId('ViewTitleContext'); }
        static { this.CommentEditorActions = new MenuId('CommentEditorActions'); }
        static { this.CommentThreadTitle = new MenuId('CommentThreadTitle'); }
        static { this.CommentThreadActions = new MenuId('CommentThreadActions'); }
        static { this.CommentThreadAdditionalActions = new MenuId('CommentThreadAdditionalActions'); }
        static { this.CommentThreadTitleContext = new MenuId('CommentThreadTitleContext'); }
        static { this.CommentThreadCommentContext = new MenuId('CommentThreadCommentContext'); }
        static { this.CommentTitle = new MenuId('CommentTitle'); }
        static { this.CommentActions = new MenuId('CommentActions'); }
        static { this.InteractiveToolbar = new MenuId('InteractiveToolbar'); }
        static { this.InteractiveCellTitle = new MenuId('InteractiveCellTitle'); }
        static { this.InteractiveCellDelete = new MenuId('InteractiveCellDelete'); }
        static { this.InteractiveCellExecute = new MenuId('InteractiveCellExecute'); }
        static { this.InteractiveInputExecute = new MenuId('InteractiveInputExecute'); }
        static { this.NotebookToolbar = new MenuId('NotebookToolbar'); }
        static { this.NotebookStickyScrollContext = new MenuId('NotebookStickyScrollContext'); }
        static { this.NotebookCellTitle = new MenuId('NotebookCellTitle'); }
        static { this.NotebookCellDelete = new MenuId('NotebookCellDelete'); }
        static { this.NotebookCellInsert = new MenuId('NotebookCellInsert'); }
        static { this.NotebookCellBetween = new MenuId('NotebookCellBetween'); }
        static { this.NotebookCellListTop = new MenuId('NotebookCellTop'); }
        static { this.NotebookCellExecute = new MenuId('NotebookCellExecute'); }
        static { this.NotebookCellExecutePrimary = new MenuId('NotebookCellExecutePrimary'); }
        static { this.NotebookDiffCellInputTitle = new MenuId('NotebookDiffCellInputTitle'); }
        static { this.NotebookDiffCellMetadataTitle = new MenuId('NotebookDiffCellMetadataTitle'); }
        static { this.NotebookDiffCellOutputsTitle = new MenuId('NotebookDiffCellOutputsTitle'); }
        static { this.NotebookOutputToolbar = new MenuId('NotebookOutputToolbar'); }
        static { this.NotebookEditorLayoutConfigure = new MenuId('NotebookEditorLayoutConfigure'); }
        static { this.NotebookKernelSource = new MenuId('NotebookKernelSource'); }
        static { this.BulkEditTitle = new MenuId('BulkEditTitle'); }
        static { this.BulkEditContext = new MenuId('BulkEditContext'); }
        static { this.TimelineItemContext = new MenuId('TimelineItemContext'); }
        static { this.TimelineTitle = new MenuId('TimelineTitle'); }
        static { this.TimelineTitleContext = new MenuId('TimelineTitleContext'); }
        static { this.TimelineFilterSubMenu = new MenuId('TimelineFilterSubMenu'); }
        static { this.AccountsContext = new MenuId('AccountsContext'); }
        static { this.PanelTitle = new MenuId('PanelTitle'); }
        static { this.AuxiliaryBarTitle = new MenuId('AuxiliaryBarTitle'); }
        static { this.TerminalInstanceContext = new MenuId('TerminalInstanceContext'); }
        static { this.TerminalEditorInstanceContext = new MenuId('TerminalEditorInstanceContext'); }
        static { this.TerminalNewDropdownContext = new MenuId('TerminalNewDropdownContext'); }
        static { this.TerminalTabContext = new MenuId('TerminalTabContext'); }
        static { this.TerminalTabEmptyAreaContext = new MenuId('TerminalTabEmptyAreaContext'); }
        static { this.WebviewContext = new MenuId('WebviewContext'); }
        static { this.InlineCompletionsActions = new MenuId('InlineCompletionsActions'); }
        static { this.NewFile = new MenuId('NewFile'); }
        static { this.MergeInput1Toolbar = new MenuId('MergeToolbar1Toolbar'); }
        static { this.MergeInput2Toolbar = new MenuId('MergeToolbar2Toolbar'); }
        static { this.MergeBaseToolbar = new MenuId('MergeBaseToolbar'); }
        static { this.MergeInputResultToolbar = new MenuId('MergeToolbarResultToolbar'); }
        static { this.InlineSuggestionToolbar = new MenuId('InlineSuggestionToolbar'); }
        static { this.ChatContext = new MenuId('ChatContext'); }
        static { this.ChatCodeBlock = new MenuId('ChatCodeblock'); }
        static { this.ChatMessageTitle = new MenuId('ChatMessageTitle'); }
        static { this.ChatExecute = new MenuId('ChatExecute'); }
        static { this.ChatInputSide = new MenuId('ChatInputSide'); }
        static { this.AccessibleView = new MenuId('AccessibleView'); }
        /**
         * Create or reuse a `MenuId` with the given identifier
         */
        static for(identifier) {
            return MenuId._instances.get(identifier) ?? new MenuId(identifier);
        }
        /**
         * Create a new `MenuId` with the unique identifier. Will throw if a menu
         * with the identifier already exists, use `MenuId.for(ident)` or a unique
         * identifier
         */
        constructor(identifier) {
            if (MenuId._instances.has(identifier)) {
                throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
            }
            MenuId._instances.set(identifier, this);
            this.id = identifier;
        }
    }
    exports.MenuId = MenuId;
    exports.IMenuService = (0, instantiation_1.createDecorator)('menuService');
    class MenuRegistryChangeEvent {
        static { this._all = new Map(); }
        static for(id) {
            let value = this._all.get(id);
            if (!value) {
                value = new MenuRegistryChangeEvent(id);
                this._all.set(id, value);
            }
            return value;
        }
        static merge(events) {
            const ids = new Set();
            for (const item of events) {
                if (item instanceof MenuRegistryChangeEvent) {
                    ids.add(item.id);
                }
            }
            return ids;
        }
        constructor(id) {
            this.id = id;
            this.has = candidate => candidate === id;
        }
    }
    exports.MenuRegistry = new class {
        constructor() {
            this._commands = new Map();
            this._menuItems = new Map();
            this._onDidChangeMenu = new event_1.MicrotaskEmitter({
                merge: MenuRegistryChangeEvent.merge
            });
            this.onDidChangeMenu = this._onDidChangeMenu.event;
        }
        addCommand(command) {
            this._commands.set(command.id, command);
            this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._commands.delete(command.id)) {
                    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
                }
            });
        }
        getCommand(id) {
            return this._commands.get(id);
        }
        getCommands() {
            const map = new Map();
            this._commands.forEach((value, key) => map.set(key, value));
            return map;
        }
        appendMenuItem(id, item) {
            let list = this._menuItems.get(id);
            if (!list) {
                list = new linkedList_1.LinkedList();
                this._menuItems.set(id, list);
            }
            const rm = list.push(item);
            this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
            });
        }
        appendMenuItems(items) {
            const result = new lifecycle_1.DisposableStore();
            for (const { id, item } of items) {
                result.add(this.appendMenuItem(id, item));
            }
            return result;
        }
        getMenuItems(id) {
            let result;
            if (this._menuItems.has(id)) {
                result = [...this._menuItems.get(id)];
            }
            else {
                result = [];
            }
            if (id === MenuId.CommandPalette) {
                // CommandPalette is special because it shows
                // all commands by default
                this._appendImplicitItems(result);
            }
            return result;
        }
        _appendImplicitItems(result) {
            const set = new Set();
            for (const item of result) {
                if (isIMenuItem(item)) {
                    set.add(item.command.id);
                    if (item.alt) {
                        set.add(item.alt.id);
                    }
                }
            }
            this._commands.forEach((command, id) => {
                if (!set.has(id)) {
                    result.push({ command });
                }
            });
        }
    };
    class SubmenuItemAction extends actions_1.SubmenuAction {
        constructor(item, hideActions, actions) {
            super(`submenuitem.${item.submenu.id}`, typeof item.title === 'string' ? item.title : item.title.value, actions, 'submenu');
            this.item = item;
            this.hideActions = hideActions;
        }
    }
    exports.SubmenuItemAction = SubmenuItemAction;
    // implements IAction, does NOT extend Action, so that no one
    // subscribes to events of Action or modified properties
    let MenuItemAction = MenuItemAction_1 = class MenuItemAction {
        static label(action, options) {
            return options?.renderShortTitle && action.shortTitle
                ? (typeof action.shortTitle === 'string' ? action.shortTitle : action.shortTitle.value)
                : (typeof action.title === 'string' ? action.title : action.title.value);
        }
        constructor(item, alt, options, hideActions, contextKeyService, _commandService) {
            this.hideActions = hideActions;
            this._commandService = _commandService;
            this.id = item.id;
            this.label = MenuItemAction_1.label(item, options);
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
            this.alt = alt ? new MenuItemAction_1(alt, undefined, options, hideActions, contextKeyService, _commandService) : undefined;
            this._options = options;
            this.class = icon && themables_1.ThemeIcon.asClassName(icon);
        }
        run(...args) {
            let runArgs = [];
            if (this._options?.arg) {
                runArgs = [...runArgs, this._options.arg];
            }
            if (this._options?.shouldForwardArgs) {
                runArgs = [...runArgs, ...args];
            }
            return this._commandService.executeCommand(this.id, ...runArgs);
        }
    };
    exports.MenuItemAction = MenuItemAction;
    exports.MenuItemAction = MenuItemAction = MenuItemAction_1 = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, commands_1.ICommandService)
    ], MenuItemAction);
    class Action2 {
        constructor(desc) {
            this.desc = desc;
        }
    }
    exports.Action2 = Action2;
    function registerAction2(ctor) {
        const disposables = new lifecycle_1.DisposableStore();
        const action = new ctor();
        const { f1, menu, keybinding, description, ...command } = action.desc;
        // command
        disposables.add(commands_1.CommandsRegistry.registerCommand({
            id: command.id,
            handler: (accessor, ...args) => action.run(accessor, ...args),
            description: description,
        }));
        // menu
        if (Array.isArray(menu)) {
            for (const item of menu) {
                disposables.add(exports.MenuRegistry.appendMenuItem(item.id, { command: { ...command, precondition: item.precondition === null ? undefined : command.precondition }, ...item }));
            }
        }
        else if (menu) {
            disposables.add(exports.MenuRegistry.appendMenuItem(menu.id, { command: { ...command, precondition: menu.precondition === null ? undefined : command.precondition }, ...menu }));
        }
        if (f1) {
            disposables.add(exports.MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command, when: command.precondition }));
            disposables.add(exports.MenuRegistry.addCommand(command));
        }
        // keybinding
        if (Array.isArray(keybinding)) {
            for (const item of keybinding) {
                disposables.add(keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                    ...item,
                    id: command.id,
                    when: command.precondition ? contextkey_1.ContextKeyExpr.and(command.precondition, item.when) : item.when
                }));
            }
        }
        else if (keybinding) {
            disposables.add(keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                ...keybinding,
                id: command.id,
                when: command.precondition ? contextkey_1.ContextKeyExpr.and(command.precondition, keybinding.when) : keybinding.when
            }));
        }
        return disposables;
    }
    exports.registerAction2 = registerAction2;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2FjdGlvbnMvY29tbW9uL2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWtDaEcsU0FBZ0IsV0FBVyxDQUFDLElBQVM7UUFDcEMsT0FBUSxJQUFrQixDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUM7SUFDbEQsQ0FBQztJQUZELGtDQUVDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQVM7UUFDdkMsT0FBUSxJQUFxQixDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUM7SUFDckQsQ0FBQztJQUZELHdDQUVDO0lBRUQsTUFBYSxNQUFNO2lCQUVNLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztpQkFFL0MsbUJBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUM5Qyw0QkFBdUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2lCQUNoRSwwQkFBcUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2lCQUM1RCx3QkFBbUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUN4RCwwQkFBcUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2lCQUM1RCxzQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2lCQUNwRCxpQkFBWSxHQUFHLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2lCQUMxQyxxQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNsRCxrQkFBYSxHQUFHLElBQUksTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM1Qyx3QkFBbUIsR0FBRyxJQUFJLE1BQU0sQ0FB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