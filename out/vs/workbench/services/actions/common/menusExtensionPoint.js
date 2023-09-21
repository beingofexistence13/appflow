/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/base/common/arrays", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, strings_1, resources, extensionsRegistry_1, contextkey_1, actions_1, lifecycle_1, themables_1, arrays_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.commandsExtensionPoint = void 0;
    const apiMenus = [
        {
            key: 'commandPalette',
            id: actions_1.MenuId.CommandPalette,
            description: (0, nls_1.localize)('menus.commandPalette', "The Command Palette"),
            supportsSubmenus: false
        },
        {
            key: 'touchBar',
            id: actions_1.MenuId.TouchBarContext,
            description: (0, nls_1.localize)('menus.touchBar', "The touch bar (macOS only)"),
            supportsSubmenus: false
        },
        {
            key: 'editor/title',
            id: actions_1.MenuId.EditorTitle,
            description: (0, nls_1.localize)('menus.editorTitle', "The editor title menu")
        },
        {
            key: 'editor/title/run',
            id: actions_1.MenuId.EditorTitleRun,
            description: (0, nls_1.localize)('menus.editorTitleRun', "Run submenu inside the editor title menu")
        },
        {
            key: 'editor/context',
            id: actions_1.MenuId.EditorContext,
            description: (0, nls_1.localize)('menus.editorContext', "The editor context menu")
        },
        {
            key: 'editor/context/copy',
            id: actions_1.MenuId.EditorContextCopy,
            description: (0, nls_1.localize)('menus.editorContextCopyAs', "'Copy as' submenu in the editor context menu")
        },
        {
            key: 'editor/context/share',
            id: actions_1.MenuId.EditorContextShare,
            description: (0, nls_1.localize)('menus.editorContextShare', "'Share' submenu in the editor context menu"),
            proposed: 'contribShareMenu'
        },
        {
            key: 'explorer/context',
            id: actions_1.MenuId.ExplorerContext,
            description: (0, nls_1.localize)('menus.explorerContext', "The file explorer context menu")
        },
        {
            key: 'explorer/context/share',
            id: actions_1.MenuId.ExplorerContextShare,
            description: (0, nls_1.localize)('menus.explorerContextShare', "'Share' submenu in the file explorer context menu"),
            proposed: 'contribShareMenu'
        },
        {
            key: 'editor/title/context',
            id: actions_1.MenuId.EditorTitleContext,
            description: (0, nls_1.localize)('menus.editorTabContext', "The editor tabs context menu")
        },
        {
            key: 'editor/title/context/share',
            id: actions_1.MenuId.EditorTitleContextShare,
            description: (0, nls_1.localize)('menus.editorTitleContextShare', "'Share' submenu inside the editor title context menu"),
            proposed: 'contribShareMenu'
        },
        {
            key: 'debug/callstack/context',
            id: actions_1.MenuId.DebugCallStackContext,
            description: (0, nls_1.localize)('menus.debugCallstackContext', "The debug callstack view context menu")
        },
        {
            key: 'debug/variables/context',
            id: actions_1.MenuId.DebugVariablesContext,
            description: (0, nls_1.localize)('menus.debugVariablesContext', "The debug variables view context menu")
        },
        {
            key: 'debug/toolBar',
            id: actions_1.MenuId.DebugToolBar,
            description: (0, nls_1.localize)('menus.debugToolBar', "The debug toolbar menu")
        },
        {
            key: 'menuBar/home',
            id: actions_1.MenuId.MenubarHomeMenu,
            description: (0, nls_1.localize)('menus.home', "The home indicator context menu (web only)"),
            proposed: 'contribMenuBarHome',
            supportsSubmenus: false
        },
        {
            key: 'menuBar/edit/copy',
            id: actions_1.MenuId.MenubarCopy,
            description: (0, nls_1.localize)('menus.opy', "'Copy as' submenu in the top level Edit menu")
        },
        {
            key: 'scm/title',
            id: actions_1.MenuId.SCMTitle,
            description: (0, nls_1.localize)('menus.scmTitle', "The Source Control title menu")
        },
        {
            key: 'scm/sourceControl',
            id: actions_1.MenuId.SCMSourceControl,
            description: (0, nls_1.localize)('menus.scmSourceControl', "The Source Control menu")
        },
        {
            key: 'scm/resourceState/context',
            id: actions_1.MenuId.SCMResourceContext,
            description: (0, nls_1.localize)('menus.resourceStateContext', "The Source Control resource state context menu")
        },
        {
            key: 'scm/resourceFolder/context',
            id: actions_1.MenuId.SCMResourceFolderContext,
            description: (0, nls_1.localize)('menus.resourceFolderContext', "The Source Control resource folder context menu")
        },
        {
            key: 'scm/resourceGroup/context',
            id: actions_1.MenuId.SCMResourceGroupContext,
            description: (0, nls_1.localize)('menus.resourceGroupContext', "The Source Control resource group context menu")
        },
        {
            key: 'scm/change/title',
            id: actions_1.MenuId.SCMChangeContext,
            description: (0, nls_1.localize)('menus.changeTitle', "The Source Control inline change menu")
        },
        {
            key: 'statusBar/remoteIndicator',
            id: actions_1.MenuId.StatusBarRemoteIndicatorMenu,
            description: (0, nls_1.localize)('menus.statusBarRemoteIndicator', "The remote indicator menu in the status bar"),
            supportsSubmenus: false
        },
        {
            key: 'terminal/context',
            id: actions_1.MenuId.TerminalInstanceContext,
            description: (0, nls_1.localize)('menus.terminalContext', "The terminal context menu")
        },
        {
            key: 'terminal/title/context',
            id: actions_1.MenuId.TerminalTabContext,
            description: (0, nls_1.localize)('menus.terminalTabContext', "The terminal tabs context menu")
        },
        {
            key: 'view/title',
            id: actions_1.MenuId.ViewTitle,
            description: (0, nls_1.localize)('view.viewTitle', "The contributed view title menu")
        },
        {
            key: 'view/item/context',
            id: actions_1.MenuId.ViewItemContext,
            description: (0, nls_1.localize)('view.itemContext', "The contributed view item context menu")
        },
        {
            key: 'comments/comment/editorActions',
            id: actions_1.MenuId.CommentEditorActions,
            description: (0, nls_1.localize)('commentThread.editorActions', "The contributed comment editor actions"),
            proposed: 'contribCommentEditorActionsMenu'
        },
        {
            key: 'comments/commentThread/title',
            id: actions_1.MenuId.CommentThreadTitle,
            description: (0, nls_1.localize)('commentThread.title', "The contributed comment thread title menu")
        },
        {
            key: 'comments/commentThread/context',
            id: actions_1.MenuId.CommentThreadActions,
            description: (0, nls_1.localize)('commentThread.actions', "The contributed comment thread context menu, rendered as buttons below the comment editor"),
            supportsSubmenus: false
        },
        {
            key: 'comments/commentThread/additionalActions',
            id: actions_1.MenuId.CommentThreadAdditionalActions,
            description: (0, nls_1.localize)('commentThread.actions', "The contributed comment thread context menu, rendered as buttons below the comment editor"),
            supportsSubmenus: false,
            proposed: 'contribCommentThreadAdditionalMenu'
        },
        {
            key: 'comments/commentThread/title/context',
            id: actions_1.MenuId.CommentThreadTitleContext,
            description: (0, nls_1.localize)('commentThread.titleContext', "The contributed comment thread title's peek context menu, rendered as a right click menu on the comment thread's peek title."),
            proposed: 'contribCommentPeekContext'
        },
        {
            key: 'comments/comment/title',
            id: actions_1.MenuId.CommentTitle,
            description: (0, nls_1.localize)('comment.title', "The contributed comment title menu")
        },
        {
            key: 'comments/comment/context',
            id: actions_1.MenuId.CommentActions,
            description: (0, nls_1.localize)('comment.actions', "The contributed comment context menu, rendered as buttons below the comment editor"),
            supportsSubmenus: false
        },
        {
            key: 'comments/commentThread/comment/context',
            id: actions_1.MenuId.CommentThreadCommentContext,
            description: (0, nls_1.localize)('comment.commentContext', "The contributed comment context menu, rendered as a right click menu on the an individual comment in the comment thread's peek view."),
            proposed: 'contribCommentPeekContext'
        },
        {
            key: 'notebook/toolbar',
            id: actions_1.MenuId.NotebookToolbar,
            description: (0, nls_1.localize)('notebook.toolbar', "The contributed notebook toolbar menu")
        },
        {
            key: 'notebook/kernelSource',
            id: actions_1.MenuId.NotebookKernelSource,
            description: (0, nls_1.localize)('notebook.kernelSource', "The contributed notebook kernel sources menu"),
            proposed: 'notebookKernelSource'
        },
        {
            key: 'notebook/cell/title',
            id: actions_1.MenuId.NotebookCellTitle,
            description: (0, nls_1.localize)('notebook.cell.title', "The contributed notebook cell title menu")
        },
        {
            key: 'notebook/cell/execute',
            id: actions_1.MenuId.NotebookCellExecute,
            description: (0, nls_1.localize)('notebook.cell.execute', "The contributed notebook cell execution menu")
        },
        {
            key: 'interactive/toolbar',
            id: actions_1.MenuId.InteractiveToolbar,
            description: (0, nls_1.localize)('interactive.toolbar', "The contributed interactive toolbar menu"),
        },
        {
            key: 'interactive/cell/title',
            id: actions_1.MenuId.InteractiveCellTitle,
            description: (0, nls_1.localize)('interactive.cell.title', "The contributed interactive cell title menu"),
        },
        {
            key: 'testing/item/context',
            id: actions_1.MenuId.TestItem,
            description: (0, nls_1.localize)('testing.item.context', "The contributed test item menu"),
        },
        {
            key: 'testing/item/gutter',
            id: actions_1.MenuId.TestItemGutter,
            description: (0, nls_1.localize)('testing.item.gutter.title', "The menu for a gutter decoration for a test item"),
        },
        {
            key: 'testing/message/context',
            id: actions_1.MenuId.TestMessageContext,
            description: (0, nls_1.localize)('testing.message.context.title', "A prominent button overlaying editor content where the message is displayed"),
        },
        {
            key: 'testing/message/content',
            id: actions_1.MenuId.TestMessageContent,
            description: (0, nls_1.localize)('testing.message.content.title', "Context menu for the message in the results tree"),
        },
        {
            key: 'extension/context',
            id: actions_1.MenuId.ExtensionContext,
            description: (0, nls_1.localize)('menus.extensionContext', "The extension context menu")
        },
        {
            key: 'timeline/title',
            id: actions_1.MenuId.TimelineTitle,
            description: (0, nls_1.localize)('view.timelineTitle', "The Timeline view title menu")
        },
        {
            key: 'timeline/item/context',
            id: actions_1.MenuId.TimelineItemContext,
            description: (0, nls_1.localize)('view.timelineContext', "The Timeline view item context menu")
        },
        {
            key: 'ports/item/context',
            id: actions_1.MenuId.TunnelContext,
            description: (0, nls_1.localize)('view.tunnelContext', "The Ports view item context menu")
        },
        {
            key: 'ports/item/origin/inline',
            id: actions_1.MenuId.TunnelOriginInline,
            description: (0, nls_1.localize)('view.tunnelOriginInline', "The Ports view item origin inline menu")
        },
        {
            key: 'ports/item/port/inline',
            id: actions_1.MenuId.TunnelPortInline,
            description: (0, nls_1.localize)('view.tunnelPortInline', "The Ports view item port inline menu")
        },
        {
            key: 'file/newFile',
            id: actions_1.MenuId.NewFile,
            description: (0, nls_1.localize)('file.newFile', "The 'New File...' quick pick, shown on welcome page and File menu."),
            supportsSubmenus: false,
        },
        {
            key: 'webview/context',
            id: actions_1.MenuId.WebviewContext,
            description: (0, nls_1.localize)('webview.context', "The webview context menu")
        },
        {
            key: 'file/share',
            id: actions_1.MenuId.MenubarShare,
            description: (0, nls_1.localize)('menus.share', "Share submenu shown in the top level File menu."),
            proposed: 'contribShareMenu'
        },
        {
            key: 'editor/inlineCompletions/actions',
            id: actions_1.MenuId.InlineCompletionsActions,
            description: (0, nls_1.localize)('inlineCompletions.actions', "The actions shown when hovering on an inline completion"),
            supportsSubmenus: false,
            proposed: 'inlineCompletionsAdditions'
        },
        {
            key: 'editor/content',
            id: actions_1.MenuId.EditorContent,
            description: (0, nls_1.localize)('merge.toolbar', "The prominent button in an editor, overlays its content"),
            proposed: 'contribEditorContentMenu'
        },
        {
            key: 'editor/lineNumber/context',
            id: actions_1.MenuId.EditorLineNumberContext,
            description: (0, nls_1.localize)('editorLineNumberContext', "The contributed editor line number context menu")
        },
        {
            key: 'mergeEditor/result/title',
            id: actions_1.MenuId.MergeInputResultToolbar,
            description: (0, nls_1.localize)('menus.mergeEditorResult', "The result toolbar of the merge editor"),
            proposed: 'contribMergeEditorMenus'
        },
    ];
    var schema;
    (function (schema) {
        // --- menus, submenus contribution point
        function isMenuItem(item) {
            return typeof item.command === 'string';
        }
        schema.isMenuItem = isMenuItem;
        function isValidMenuItem(item, collector) {
            if (typeof item.command !== 'string') {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
                return false;
            }
            if (item.alt && typeof item.alt !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'alt'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'group'));
                return false;
            }
            return true;
        }
        schema.isValidMenuItem = isValidMenuItem;
        function isValidSubmenuItem(item, collector) {
            if (typeof item.submenu !== 'string') {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'submenu'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'group'));
                return false;
            }
            return true;
        }
        schema.isValidSubmenuItem = isValidSubmenuItem;
        function isValidItems(items, collector) {
            if (!Array.isArray(items)) {
                collector.error((0, nls_1.localize)('requirearray', "submenu items must be an array"));
                return false;
            }
            for (const item of items) {
                if (isMenuItem(item)) {
                    if (!isValidMenuItem(item, collector)) {
                        return false;
                    }
                }
                else {
                    if (!isValidSubmenuItem(item, collector)) {
                        return false;
                    }
                }
            }
            return true;
        }
        schema.isValidItems = isValidItems;
        function isValidSubmenu(submenu, collector) {
            if (typeof submenu !== 'object') {
                collector.error((0, nls_1.localize)('require', "submenu items must be an object"));
                return false;
            }
            if (typeof submenu.id !== 'string') {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'id'));
                return false;
            }
            if (typeof submenu.label !== 'string') {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'label'));
                return false;
            }
            return true;
        }
        schema.isValidSubmenu = isValidSubmenu;
        const menuItem = {
            type: 'object',
            required: ['command'],
            properties: {
                command: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.command', 'Identifier of the command to execute. The command must be declared in the \'commands\'-section'),
                    type: 'string'
                },
                alt: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.alt', 'Identifier of an alternative command to execute. The command must be declared in the \'commands\'-section'),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.when', 'Condition which must be true to show this item'),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.group', 'Group into which this item belongs'),
                    type: 'string'
                }
            }
        };
        const submenuItem = {
            type: 'object',
            required: ['submenu'],
            properties: {
                submenu: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.submenu', 'Identifier of the submenu to display in this item.'),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.when', 'Condition which must be true to show this item'),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.menuItem.group', 'Group into which this item belongs'),
                    type: 'string'
                }
            }
        };
        const submenu = {
            type: 'object',
            required: ['id', 'label'],
            properties: {
                id: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.submenu.id', 'Identifier of the menu to display as a submenu.'),
                    type: 'string'
                },
                label: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.submenu.label', 'The label of the menu item which leads to this submenu.'),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)({ key: 'vscode.extension.contributes.submenu.icon', comment: ['do not translate or change `\\$(zap)`, \\ in front of $ is important.'] }, '(Optional) Icon which is used to represent the submenu in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\\$(zap)`'),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)('vscode.extension.contributes.submenu.icon.light', 'Icon path when a light theme is used'),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)('vscode.extension.contributes.submenu.icon.dark', 'Icon path when a dark theme is used'),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.menusContribution = {
            description: (0, nls_1.localize)('vscode.extension.contributes.menus', "Contributes menu items to the editor"),
            type: 'object',
            properties: (0, arrays_1.index)(apiMenus, menu => menu.key, menu => ({
                markdownDescription: menu.proposed ? (0, nls_1.localize)('proposed', "Proposed API, requires `enabledApiProposal: [\"{0}\"]` - {1}", menu.proposed, menu.description) : menu.description,
                type: 'array',
                items: menu.supportsSubmenus === false ? menuItem : { oneOf: [menuItem, submenuItem] }
            })),
            additionalProperties: {
                description: 'Submenu',
                type: 'array',
                items: { oneOf: [menuItem, submenuItem] }
            }
        };
        schema.submenusContribution = {
            description: (0, nls_1.localize)('vscode.extension.contributes.submenus', "Contributes submenu items to the editor"),
            type: 'array',
            items: submenu
        };
        function isValidCommand(command, collector) {
            if (!command) {
                collector.error((0, nls_1.localize)('nonempty', "expected non-empty value."));
                return false;
            }
            if ((0, strings_1.isFalsyOrWhitespace)(command.command)) {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
                return false;
            }
            if (!isValidLocalizedString(command.title, collector, 'title')) {
                return false;
            }
            if (command.shortTitle && !isValidLocalizedString(command.shortTitle, collector, 'shortTitle')) {
                return false;
            }
            if (command.enablement && typeof command.enablement !== 'string') {
                collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'precondition'));
                return false;
            }
            if (command.category && !isValidLocalizedString(command.category, collector, 'category')) {
                return false;
            }
            if (!isValidIcon(command.icon, collector)) {
                return false;
            }
            return true;
        }
        schema.isValidCommand = isValidCommand;
        function isValidIcon(icon, collector) {
            if (typeof icon === 'undefined') {
                return true;
            }
            if (typeof icon === 'string') {
                return true;
            }
            else if (typeof icon.dark === 'string' && typeof icon.light === 'string') {
                return true;
            }
            collector.error((0, nls_1.localize)('opticon', "property `icon` can be omitted or must be either a string or a literal like `{dark, light}`"));
            return false;
        }
        function isValidLocalizedString(localized, collector, propertyName) {
            if (typeof localized === 'undefined') {
                collector.error((0, nls_1.localize)('requireStringOrObject', "property `{0}` is mandatory and must be of type `string` or `object`", propertyName));
                return false;
            }
            else if (typeof localized === 'string' && (0, strings_1.isFalsyOrWhitespace)(localized)) {
                collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", propertyName));
                return false;
            }
            else if (typeof localized !== 'string' && ((0, strings_1.isFalsyOrWhitespace)(localized.original) || (0, strings_1.isFalsyOrWhitespace)(localized.value))) {
                collector.error((0, nls_1.localize)('requirestrings', "properties `{0}` and `{1}` are mandatory and must be of type `string`", `${propertyName}.value`, `${propertyName}.original`));
                return false;
            }
            return true;
        }
        const commandType = {
            type: 'object',
            required: ['command', 'title'],
            properties: {
                command: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.command', 'Identifier of the command to execute'),
                    type: 'string'
                },
                title: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.title', 'Title by which the command is represented in the UI'),
                    type: 'string'
                },
                shortTitle: {
                    markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.commandType.shortTitle', '(Optional) Short title by which the command is represented in the UI. Menus pick either `title` or `shortTitle` depending on the context in which they show commands.'),
                    type: 'string'
                },
                category: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.category', '(Optional) Category string by which the command is grouped in the UI'),
                    type: 'string'
                },
                enablement: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.precondition', '(Optional) Condition which must be true to enable the command in the UI (menu and keybindings). Does not prevent executing the command by other means, like the `executeCommand`-api.'),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)({ key: 'vscode.extension.contributes.commandType.icon', comment: ['do not translate or change `\\$(zap)`, \\ in front of $ is important.'] }, '(Optional) Icon which is used to represent the command in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\\$(zap)`'),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.icon.light', 'Icon path when a light theme is used'),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)('vscode.extension.contributes.commandType.icon.dark', 'Icon path when a dark theme is used'),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.commandsContribution = {
            description: (0, nls_1.localize)('vscode.extension.contributes.commands', "Contributes commands to the command palette."),
            oneOf: [
                commandType,
                {
                    type: 'array',
                    items: commandType
                }
            ]
        };
    })(schema || (schema = {}));
    const _commandRegistrations = new lifecycle_1.DisposableStore();
    exports.commandsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'commands',
        jsonSchema: schema.commandsContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                if (contrib.command) {
                    result.push(`onCommand:${contrib.command}`);
                }
            }
        }
    });
    exports.commandsExtensionPoint.setHandler(extensions => {
        function handleCommand(userFriendlyCommand, extension) {
            if (!schema.isValidCommand(userFriendlyCommand, extension.collector)) {
                return;
            }
            const { icon, enablement, category, title, shortTitle, command } = userFriendlyCommand;
            let absoluteIcon;
            if (icon) {
                if (typeof icon === 'string') {
                    absoluteIcon = themables_1.ThemeIcon.fromString(icon) ?? { dark: resources.joinPath(extension.description.extensionLocation, icon), light: resources.joinPath(extension.description.extensionLocation, icon) };
                }
                else {
                    absoluteIcon = {
                        dark: resources.joinPath(extension.description.extensionLocation, icon.dark),
                        light: resources.joinPath(extension.description.extensionLocation, icon.light)
                    };
                }
            }
            const existingCmd = actions_1.MenuRegistry.getCommand(command);
            if (existingCmd) {
                if (existingCmd.source) {
                    extension.collector.info((0, nls_1.localize)('dup1', "Command `{0}` already registered by {1} ({2})", userFriendlyCommand.command, existingCmd.source.title, existingCmd.source.id));
                }
                else {
                    extension.collector.info((0, nls_1.localize)('dup0', "Command `{0}` already registered", userFriendlyCommand.command));
                }
            }
            _commandRegistrations.add(actions_1.MenuRegistry.addCommand({
                id: command,
                title,
                source: { id: extension.description.identifier.value, title: extension.description.displayName ?? extension.description.name },
                shortTitle,
                tooltip: title,
                category,
                precondition: contextkey_1.ContextKeyExpr.deserialize(enablement),
                icon: absoluteIcon
            }));
        }
        // remove all previous command registrations
        _commandRegistrations.clear();
        for (const extension of extensions) {
            const { value } = extension;
            if (Array.isArray(value)) {
                for (const command of value) {
                    handleCommand(command, extension);
                }
            }
            else {
                handleCommand(value, extension);
            }
        }
    });
    const _submenus = new Map();
    const submenusExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'submenus',
        jsonSchema: schema.submenusContribution
    });
    submenusExtensionPoint.setHandler(extensions => {
        _submenus.clear();
        for (const extension of extensions) {
            const { value, collector } = extension;
            for (const [, submenuInfo] of Object.entries(value)) {
                if (!schema.isValidSubmenu(submenuInfo, collector)) {
                    continue;
                }
                if (!submenuInfo.id) {
                    collector.warn((0, nls_1.localize)('submenuId.invalid.id', "`{0}` is not a valid submenu identifier", submenuInfo.id));
                    continue;
                }
                if (_submenus.has(submenuInfo.id)) {
                    collector.info((0, nls_1.localize)('submenuId.duplicate.id', "The `{0}` submenu was already previously registered.", submenuInfo.id));
                    continue;
                }
                if (!submenuInfo.label) {
                    collector.warn((0, nls_1.localize)('submenuId.invalid.label', "`{0}` is not a valid submenu label", submenuInfo.label));
                    continue;
                }
                let absoluteIcon;
                if (submenuInfo.icon) {
                    if (typeof submenuInfo.icon === 'string') {
                        absoluteIcon = themables_1.ThemeIcon.fromString(submenuInfo.icon) || { dark: resources.joinPath(extension.description.extensionLocation, submenuInfo.icon) };
                    }
                    else {
                        absoluteIcon = {
                            dark: resources.joinPath(extension.description.extensionLocation, submenuInfo.icon.dark),
                            light: resources.joinPath(extension.description.extensionLocation, submenuInfo.icon.light)
                        };
                    }
                }
                const item = {
                    id: actions_1.MenuId.for(`api:${submenuInfo.id}`),
                    label: submenuInfo.label,
                    icon: absoluteIcon
                };
                _submenus.set(submenuInfo.id, item);
            }
        }
    });
    const _apiMenusByKey = new Map(apiMenus.map(menu => ([menu.key, menu])));
    const _menuRegistrations = new lifecycle_1.DisposableStore();
    const _submenuMenuItems = new Map();
    const menusExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'menus',
        jsonSchema: schema.menusContribution,
        deps: [submenusExtensionPoint]
    });
    menusExtensionPoint.setHandler(extensions => {
        // remove all previous menu registrations
        _menuRegistrations.clear();
        _submenuMenuItems.clear();
        for (const extension of extensions) {
            const { value, collector } = extension;
            for (const entry of Object.entries(value)) {
                if (!schema.isValidItems(entry[1], collector)) {
                    continue;
                }
                let menu = _apiMenusByKey.get(entry[0]);
                if (!menu) {
                    const submenu = _submenus.get(entry[0]);
                    if (submenu) {
                        menu = {
                            key: entry[0],
                            id: submenu.id,
                            description: ''
                        };
                    }
                }
                if (!menu) {
                    continue;
                }
                if (menu.proposed && !(0, extensions_1.isProposedApiEnabled)(extension.description, menu.proposed)) {
                    collector.error((0, nls_1.localize)('proposedAPI.invalid', "{0} is a proposed menu identifier. It requires 'package.json#enabledApiProposals: [\"{1}\"]' and is only available when running out of dev or with the following command line switch: --enable-proposed-api {2}", entry[0], menu.proposed, extension.description.identifier.value));
                    continue;
                }
                for (const menuItem of entry[1]) {
                    let item;
                    if (schema.isMenuItem(menuItem)) {
                        const command = actions_1.MenuRegistry.getCommand(menuItem.command);
                        const alt = menuItem.alt && actions_1.MenuRegistry.getCommand(menuItem.alt) || undefined;
                        if (!command) {
                            collector.error((0, nls_1.localize)('missing.command', "Menu item references a command `{0}` which is not defined in the 'commands' section.", menuItem.command));
                            continue;
                        }
                        if (menuItem.alt && !alt) {
                            collector.warn((0, nls_1.localize)('missing.altCommand', "Menu item references an alt-command `{0}` which is not defined in the 'commands' section.", menuItem.alt));
                        }
                        if (menuItem.command === menuItem.alt) {
                            collector.info((0, nls_1.localize)('dupe.command', "Menu item references the same command as default and alt-command"));
                        }
                        item = { command, alt, group: undefined, order: undefined, when: undefined };
                    }
                    else {
                        if (menu.supportsSubmenus === false) {
                            collector.error((0, nls_1.localize)('unsupported.submenureference', "Menu item references a submenu for a menu which doesn't have submenu support."));
                            continue;
                        }
                        const submenu = _submenus.get(menuItem.submenu);
                        if (!submenu) {
                            collector.error((0, nls_1.localize)('missing.submenu', "Menu item references a submenu `{0}` which is not defined in the 'submenus' section.", menuItem.submenu));
                            continue;
                        }
                        let submenuRegistrations = _submenuMenuItems.get(menu.id.id);
                        if (!submenuRegistrations) {
                            submenuRegistrations = new Set();
                            _submenuMenuItems.set(menu.id.id, submenuRegistrations);
                        }
                        if (submenuRegistrations.has(submenu.id.id)) {
                            collector.warn((0, nls_1.localize)('submenuItem.duplicate', "The `{0}` submenu was already contributed to the `{1}` menu.", menuItem.submenu, entry[0]));
                            continue;
                        }
                        submenuRegistrations.add(submenu.id.id);
                        item = { submenu: submenu.id, icon: submenu.icon, title: submenu.label, group: undefined, order: undefined, when: undefined };
                    }
                    if (menuItem.group) {
                        const idx = menuItem.group.lastIndexOf('@');
                        if (idx > 0) {
                            item.group = menuItem.group.substr(0, idx);
                            item.order = Number(menuItem.group.substr(idx + 1)) || undefined;
                        }
                        else {
                            item.group = menuItem.group;
                        }
                    }
                    item.when = contextkey_1.ContextKeyExpr.deserialize(menuItem.when);
                    _menuRegistrations.add(actions_1.MenuRegistry.appendMenuItem(menu.id, item));
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudXNFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9hY3Rpb25zL2NvbW1vbi9tZW51c0V4dGVuc2lvblBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCaEcsTUFBTSxRQUFRLEdBQWU7UUFDNUI7WUFDQyxHQUFHLEVBQUUsZ0JBQWdCO1lBQ3JCLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWM7WUFDekIsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLHFCQUFxQixDQUFDO1lBQ3BFLGdCQUFnQixFQUFFLEtBQUs7U0FDdkI7UUFDRDtZQUNDLEdBQUcsRUFBRSxVQUFVO1lBQ2YsRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTtZQUMxQixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsNEJBQTRCLENBQUM7WUFDckUsZ0JBQWdCLEVBQUUsS0FBSztTQUN2QjtRQUNEO1lBQ0MsR0FBRyxFQUFFLGNBQWM7WUFDbkIsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVztZQUN0QixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsdUJBQXVCLENBQUM7U0FDbkU7UUFDRDtZQUNDLEdBQUcsRUFBRSxrQkFBa0I7WUFDdkIsRUFBRSxFQUFFLGdCQUFNLENBQUMsY0FBYztZQUN6QixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsMENBQTBDLENBQUM7U0FDekY7UUFDRDtZQUNDLEdBQUcsRUFBRSxnQkFBZ0I7WUFDckIsRUFBRSxFQUFFLGdCQUFNLENBQUMsYUFBYTtZQUN4QixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUseUJBQXlCLENBQUM7U0FDdkU7UUFDRDtZQUNDLEdBQUcsRUFBRSxxQkFBcUI7WUFD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