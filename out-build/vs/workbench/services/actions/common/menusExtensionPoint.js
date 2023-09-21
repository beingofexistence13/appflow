/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/actions/common/menusExtensionPoint", "vs/base/common/strings", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/base/common/arrays", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls_1, strings_1, resources, extensionsRegistry_1, contextkey_1, actions_1, lifecycle_1, themables_1, arrays_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9tb = void 0;
    const apiMenus = [
        {
            key: 'commandPalette',
            id: actions_1.$Ru.CommandPalette,
            description: (0, nls_1.localize)(0, null),
            supportsSubmenus: false
        },
        {
            key: 'touchBar',
            id: actions_1.$Ru.TouchBarContext,
            description: (0, nls_1.localize)(1, null),
            supportsSubmenus: false
        },
        {
            key: 'editor/title',
            id: actions_1.$Ru.EditorTitle,
            description: (0, nls_1.localize)(2, null)
        },
        {
            key: 'editor/title/run',
            id: actions_1.$Ru.EditorTitleRun,
            description: (0, nls_1.localize)(3, null)
        },
        {
            key: 'editor/context',
            id: actions_1.$Ru.EditorContext,
            description: (0, nls_1.localize)(4, null)
        },
        {
            key: 'editor/context/copy',
            id: actions_1.$Ru.EditorContextCopy,
            description: (0, nls_1.localize)(5, null)
        },
        {
            key: 'editor/context/share',
            id: actions_1.$Ru.EditorContextShare,
            description: (0, nls_1.localize)(6, null),
            proposed: 'contribShareMenu'
        },
        {
            key: 'explorer/context',
            id: actions_1.$Ru.ExplorerContext,
            description: (0, nls_1.localize)(7, null)
        },
        {
            key: 'explorer/context/share',
            id: actions_1.$Ru.ExplorerContextShare,
            description: (0, nls_1.localize)(8, null),
            proposed: 'contribShareMenu'
        },
        {
            key: 'editor/title/context',
            id: actions_1.$Ru.EditorTitleContext,
            description: (0, nls_1.localize)(9, null)
        },
        {
            key: 'editor/title/context/share',
            id: actions_1.$Ru.EditorTitleContextShare,
            description: (0, nls_1.localize)(10, null),
            proposed: 'contribShareMenu'
        },
        {
            key: 'debug/callstack/context',
            id: actions_1.$Ru.DebugCallStackContext,
            description: (0, nls_1.localize)(11, null)
        },
        {
            key: 'debug/variables/context',
            id: actions_1.$Ru.DebugVariablesContext,
            description: (0, nls_1.localize)(12, null)
        },
        {
            key: 'debug/toolBar',
            id: actions_1.$Ru.DebugToolBar,
            description: (0, nls_1.localize)(13, null)
        },
        {
            key: 'menuBar/home',
            id: actions_1.$Ru.MenubarHomeMenu,
            description: (0, nls_1.localize)(14, null),
            proposed: 'contribMenuBarHome',
            supportsSubmenus: false
        },
        {
            key: 'menuBar/edit/copy',
            id: actions_1.$Ru.MenubarCopy,
            description: (0, nls_1.localize)(15, null)
        },
        {
            key: 'scm/title',
            id: actions_1.$Ru.SCMTitle,
            description: (0, nls_1.localize)(16, null)
        },
        {
            key: 'scm/sourceControl',
            id: actions_1.$Ru.SCMSourceControl,
            description: (0, nls_1.localize)(17, null)
        },
        {
            key: 'scm/resourceState/context',
            id: actions_1.$Ru.SCMResourceContext,
            description: (0, nls_1.localize)(18, null)
        },
        {
            key: 'scm/resourceFolder/context',
            id: actions_1.$Ru.SCMResourceFolderContext,
            description: (0, nls_1.localize)(19, null)
        },
        {
            key: 'scm/resourceGroup/context',
            id: actions_1.$Ru.SCMResourceGroupContext,
            description: (0, nls_1.localize)(20, null)
        },
        {
            key: 'scm/change/title',
            id: actions_1.$Ru.SCMChangeContext,
            description: (0, nls_1.localize)(21, null)
        },
        {
            key: 'statusBar/remoteIndicator',
            id: actions_1.$Ru.StatusBarRemoteIndicatorMenu,
            description: (0, nls_1.localize)(22, null),
            supportsSubmenus: false
        },
        {
            key: 'terminal/context',
            id: actions_1.$Ru.TerminalInstanceContext,
            description: (0, nls_1.localize)(23, null)
        },
        {
            key: 'terminal/title/context',
            id: actions_1.$Ru.TerminalTabContext,
            description: (0, nls_1.localize)(24, null)
        },
        {
            key: 'view/title',
            id: actions_1.$Ru.ViewTitle,
            description: (0, nls_1.localize)(25, null)
        },
        {
            key: 'view/item/context',
            id: actions_1.$Ru.ViewItemContext,
            description: (0, nls_1.localize)(26, null)
        },
        {
            key: 'comments/comment/editorActions',
            id: actions_1.$Ru.CommentEditorActions,
            description: (0, nls_1.localize)(27, null),
            proposed: 'contribCommentEditorActionsMenu'
        },
        {
            key: 'comments/commentThread/title',
            id: actions_1.$Ru.CommentThreadTitle,
            description: (0, nls_1.localize)(28, null)
        },
        {
            key: 'comments/commentThread/context',
            id: actions_1.$Ru.CommentThreadActions,
            description: (0, nls_1.localize)(29, null),
            supportsSubmenus: false
        },
        {
            key: 'comments/commentThread/additionalActions',
            id: actions_1.$Ru.CommentThreadAdditionalActions,
            description: (0, nls_1.localize)(30, null),
            supportsSubmenus: false,
            proposed: 'contribCommentThreadAdditionalMenu'
        },
        {
            key: 'comments/commentThread/title/context',
            id: actions_1.$Ru.CommentThreadTitleContext,
            description: (0, nls_1.localize)(31, null),
            proposed: 'contribCommentPeekContext'
        },
        {
            key: 'comments/comment/title',
            id: actions_1.$Ru.CommentTitle,
            description: (0, nls_1.localize)(32, null)
        },
        {
            key: 'comments/comment/context',
            id: actions_1.$Ru.CommentActions,
            description: (0, nls_1.localize)(33, null),
            supportsSubmenus: false
        },
        {
            key: 'comments/commentThread/comment/context',
            id: actions_1.$Ru.CommentThreadCommentContext,
            description: (0, nls_1.localize)(34, null),
            proposed: 'contribCommentPeekContext'
        },
        {
            key: 'notebook/toolbar',
            id: actions_1.$Ru.NotebookToolbar,
            description: (0, nls_1.localize)(35, null)
        },
        {
            key: 'notebook/kernelSource',
            id: actions_1.$Ru.NotebookKernelSource,
            description: (0, nls_1.localize)(36, null),
            proposed: 'notebookKernelSource'
        },
        {
            key: 'notebook/cell/title',
            id: actions_1.$Ru.NotebookCellTitle,
            description: (0, nls_1.localize)(37, null)
        },
        {
            key: 'notebook/cell/execute',
            id: actions_1.$Ru.NotebookCellExecute,
            description: (0, nls_1.localize)(38, null)
        },
        {
            key: 'interactive/toolbar',
            id: actions_1.$Ru.InteractiveToolbar,
            description: (0, nls_1.localize)(39, null),
        },
        {
            key: 'interactive/cell/title',
            id: actions_1.$Ru.InteractiveCellTitle,
            description: (0, nls_1.localize)(40, null),
        },
        {
            key: 'testing/item/context',
            id: actions_1.$Ru.TestItem,
            description: (0, nls_1.localize)(41, null),
        },
        {
            key: 'testing/item/gutter',
            id: actions_1.$Ru.TestItemGutter,
            description: (0, nls_1.localize)(42, null),
        },
        {
            key: 'testing/message/context',
            id: actions_1.$Ru.TestMessageContext,
            description: (0, nls_1.localize)(43, null),
        },
        {
            key: 'testing/message/content',
            id: actions_1.$Ru.TestMessageContent,
            description: (0, nls_1.localize)(44, null),
        },
        {
            key: 'extension/context',
            id: actions_1.$Ru.ExtensionContext,
            description: (0, nls_1.localize)(45, null)
        },
        {
            key: 'timeline/title',
            id: actions_1.$Ru.TimelineTitle,
            description: (0, nls_1.localize)(46, null)
        },
        {
            key: 'timeline/item/context',
            id: actions_1.$Ru.TimelineItemContext,
            description: (0, nls_1.localize)(47, null)
        },
        {
            key: 'ports/item/context',
            id: actions_1.$Ru.TunnelContext,
            description: (0, nls_1.localize)(48, null)
        },
        {
            key: 'ports/item/origin/inline',
            id: actions_1.$Ru.TunnelOriginInline,
            description: (0, nls_1.localize)(49, null)
        },
        {
            key: 'ports/item/port/inline',
            id: actions_1.$Ru.TunnelPortInline,
            description: (0, nls_1.localize)(50, null)
        },
        {
            key: 'file/newFile',
            id: actions_1.$Ru.NewFile,
            description: (0, nls_1.localize)(51, null),
            supportsSubmenus: false,
        },
        {
            key: 'webview/context',
            id: actions_1.$Ru.WebviewContext,
            description: (0, nls_1.localize)(52, null)
        },
        {
            key: 'file/share',
            id: actions_1.$Ru.MenubarShare,
            description: (0, nls_1.localize)(53, null),
            proposed: 'contribShareMenu'
        },
        {
            key: 'editor/inlineCompletions/actions',
            id: actions_1.$Ru.InlineCompletionsActions,
            description: (0, nls_1.localize)(54, null),
            supportsSubmenus: false,
            proposed: 'inlineCompletionsAdditions'
        },
        {
            key: 'editor/content',
            id: actions_1.$Ru.EditorContent,
            description: (0, nls_1.localize)(55, null),
            proposed: 'contribEditorContentMenu'
        },
        {
            key: 'editor/lineNumber/context',
            id: actions_1.$Ru.EditorLineNumberContext,
            description: (0, nls_1.localize)(56, null)
        },
        {
            key: 'mergeEditor/result/title',
            id: actions_1.$Ru.MergeInputResultToolbar,
            description: (0, nls_1.localize)(57, null),
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
                collector.error((0, nls_1.localize)(58, null, 'command'));
                return false;
            }
            if (item.alt && typeof item.alt !== 'string') {
                collector.error((0, nls_1.localize)(59, null, 'alt'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)(60, null, 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)(61, null, 'group'));
                return false;
            }
            return true;
        }
        schema.isValidMenuItem = isValidMenuItem;
        function isValidSubmenuItem(item, collector) {
            if (typeof item.submenu !== 'string') {
                collector.error((0, nls_1.localize)(62, null, 'submenu'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)(63, null, 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)(64, null, 'group'));
                return false;
            }
            return true;
        }
        schema.isValidSubmenuItem = isValidSubmenuItem;
        function isValidItems(items, collector) {
            if (!Array.isArray(items)) {
                collector.error((0, nls_1.localize)(65, null));
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
                collector.error((0, nls_1.localize)(66, null));
                return false;
            }
            if (typeof submenu.id !== 'string') {
                collector.error((0, nls_1.localize)(67, null, 'id'));
                return false;
            }
            if (typeof submenu.label !== 'string') {
                collector.error((0, nls_1.localize)(68, null, 'label'));
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
                    description: (0, nls_1.localize)(69, null),
                    type: 'string'
                },
                alt: {
                    description: (0, nls_1.localize)(70, null),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)(71, null),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)(72, null),
                    type: 'string'
                }
            }
        };
        const submenuItem = {
            type: 'object',
            required: ['submenu'],
            properties: {
                submenu: {
                    description: (0, nls_1.localize)(73, null),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)(74, null),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)(75, null),
                    type: 'string'
                }
            }
        };
        const submenu = {
            type: 'object',
            required: ['id', 'label'],
            properties: {
                id: {
                    description: (0, nls_1.localize)(76, null),
                    type: 'string'
                },
                label: {
                    description: (0, nls_1.localize)(77, null),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)(78, null),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)(79, null),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)(80, null),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.menusContribution = {
            description: (0, nls_1.localize)(81, null),
            type: 'object',
            properties: (0, arrays_1.$Rb)(apiMenus, menu => menu.key, menu => ({
                markdownDescription: menu.proposed ? (0, nls_1.localize)(82, null, menu.proposed, menu.description) : menu.description,
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
            description: (0, nls_1.localize)(83, null),
            type: 'array',
            items: submenu
        };
        function isValidCommand(command, collector) {
            if (!command) {
                collector.error((0, nls_1.localize)(84, null));
                return false;
            }
            if ((0, strings_1.$me)(command.command)) {
                collector.error((0, nls_1.localize)(85, null, 'command'));
                return false;
            }
            if (!isValidLocalizedString(command.title, collector, 'title')) {
                return false;
            }
            if (command.shortTitle && !isValidLocalizedString(command.shortTitle, collector, 'shortTitle')) {
                return false;
            }
            if (command.enablement && typeof command.enablement !== 'string') {
                collector.error((0, nls_1.localize)(86, null, 'precondition'));
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
            collector.error((0, nls_1.localize)(87, null));
            return false;
        }
        function isValidLocalizedString(localized, collector, propertyName) {
            if (typeof localized === 'undefined') {
                collector.error((0, nls_1.localize)(88, null, propertyName));
                return false;
            }
            else if (typeof localized === 'string' && (0, strings_1.$me)(localized)) {
                collector.error((0, nls_1.localize)(89, null, propertyName));
                return false;
            }
            else if (typeof localized !== 'string' && ((0, strings_1.$me)(localized.original) || (0, strings_1.$me)(localized.value))) {
                collector.error((0, nls_1.localize)(90, null, `${propertyName}.value`, `${propertyName}.original`));
                return false;
            }
            return true;
        }
        const commandType = {
            type: 'object',
            required: ['command', 'title'],
            properties: {
                command: {
                    description: (0, nls_1.localize)(91, null),
                    type: 'string'
                },
                title: {
                    description: (0, nls_1.localize)(92, null),
                    type: 'string'
                },
                shortTitle: {
                    markdownDescription: (0, nls_1.localize)(93, null),
                    type: 'string'
                },
                category: {
                    description: (0, nls_1.localize)(94, null),
                    type: 'string'
                },
                enablement: {
                    description: (0, nls_1.localize)(95, null),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)(96, null),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)(97, null),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)(98, null),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.commandsContribution = {
            description: (0, nls_1.localize)(99, null),
            oneOf: [
                commandType,
                {
                    type: 'array',
                    items: commandType
                }
            ]
        };
    })(schema || (schema = {}));
    const _commandRegistrations = new lifecycle_1.$jc();
    exports.$9tb = extensionsRegistry_1.$2F.registerExtensionPoint({
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
    exports.$9tb.setHandler(extensions => {
        function handleCommand(userFriendlyCommand, extension) {
            if (!schema.isValidCommand(userFriendlyCommand, extension.collector)) {
                return;
            }
            const { icon, enablement, category, title, shortTitle, command } = userFriendlyCommand;
            let absoluteIcon;
            if (icon) {
                if (typeof icon === 'string') {
                    absoluteIcon = themables_1.ThemeIcon.fromString(icon) ?? { dark: resources.$ig(extension.description.extensionLocation, icon), light: resources.$ig(extension.description.extensionLocation, icon) };
                }
                else {
                    absoluteIcon = {
                        dark: resources.$ig(extension.description.extensionLocation, icon.dark),
                        light: resources.$ig(extension.description.extensionLocation, icon.light)
                    };
                }
            }
            const existingCmd = actions_1.$Tu.getCommand(command);
            if (existingCmd) {
                if (existingCmd.source) {
                    extension.collector.info((0, nls_1.localize)(100, null, userFriendlyCommand.command, existingCmd.source.title, existingCmd.source.id));
                }
                else {
                    extension.collector.info((0, nls_1.localize)(101, null, userFriendlyCommand.command));
                }
            }
            _commandRegistrations.add(actions_1.$Tu.addCommand({
                id: command,
                title,
                source: { id: extension.description.identifier.value, title: extension.description.displayName ?? extension.description.name },
                shortTitle,
                tooltip: title,
                category,
                precondition: contextkey_1.$Ii.deserialize(enablement),
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
    const submenusExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
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
                    collector.warn((0, nls_1.localize)(102, null, submenuInfo.id));
                    continue;
                }
                if (_submenus.has(submenuInfo.id)) {
                    collector.info((0, nls_1.localize)(103, null, submenuInfo.id));
                    continue;
                }
                if (!submenuInfo.label) {
                    collector.warn((0, nls_1.localize)(104, null, submenuInfo.label));
                    continue;
                }
                let absoluteIcon;
                if (submenuInfo.icon) {
                    if (typeof submenuInfo.icon === 'string') {
                        absoluteIcon = themables_1.ThemeIcon.fromString(submenuInfo.icon) || { dark: resources.$ig(extension.description.extensionLocation, submenuInfo.icon) };
                    }
                    else {
                        absoluteIcon = {
                            dark: resources.$ig(extension.description.extensionLocation, submenuInfo.icon.dark),
                            light: resources.$ig(extension.description.extensionLocation, submenuInfo.icon.light)
                        };
                    }
                }
                const item = {
                    id: actions_1.$Ru.for(`api:${submenuInfo.id}`),
                    label: submenuInfo.label,
                    icon: absoluteIcon
                };
                _submenus.set(submenuInfo.id, item);
            }
        }
    });
    const _apiMenusByKey = new Map(apiMenus.map(menu => ([menu.key, menu])));
    const _menuRegistrations = new lifecycle_1.$jc();
    const _submenuMenuItems = new Map();
    const menusExtensionPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
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
                if (menu.proposed && !(0, extensions_1.$PF)(extension.description, menu.proposed)) {
                    collector.error((0, nls_1.localize)(105, null, entry[0], menu.proposed, extension.description.identifier.value));
                    continue;
                }
                for (const menuItem of entry[1]) {
                    let item;
                    if (schema.isMenuItem(menuItem)) {
                        const command = actions_1.$Tu.getCommand(menuItem.command);
                        const alt = menuItem.alt && actions_1.$Tu.getCommand(menuItem.alt) || undefined;
                        if (!command) {
                            collector.error((0, nls_1.localize)(106, null, menuItem.command));
                            continue;
                        }
                        if (menuItem.alt && !alt) {
                            collector.warn((0, nls_1.localize)(107, null, menuItem.alt));
                        }
                        if (menuItem.command === menuItem.alt) {
                            collector.info((0, nls_1.localize)(108, null));
                        }
                        item = { command, alt, group: undefined, order: undefined, when: undefined };
                    }
                    else {
                        if (menu.supportsSubmenus === false) {
                            collector.error((0, nls_1.localize)(109, null));
                            continue;
                        }
                        const submenu = _submenus.get(menuItem.submenu);
                        if (!submenu) {
                            collector.error((0, nls_1.localize)(110, null, menuItem.submenu));
                            continue;
                        }
                        let submenuRegistrations = _submenuMenuItems.get(menu.id.id);
                        if (!submenuRegistrations) {
                            submenuRegistrations = new Set();
                            _submenuMenuItems.set(menu.id.id, submenuRegistrations);
                        }
                        if (submenuRegistrations.has(submenu.id.id)) {
                            collector.warn((0, nls_1.localize)(111, null, menuItem.submenu, entry[0]));
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
                    item.when = contextkey_1.$Ii.deserialize(menuItem.when);
                    _menuRegistrations.add(actions_1.$Tu.appendMenuItem(menu.id, item));
                }
            }
        }
    });
});
//# sourceMappingURL=menusExtensionPoint.js.map