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
define(["require", "exports", "vs/base/browser/ui/toggle/toggle", "vs/base/common/platform", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminalEnvironment", "vs/platform/theme/common/colorRegistry", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/common/history", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/base/common/uri", "vs/base/common/date", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/browser/quickPickPin", "vs/platform/storage/common/storage"], function (require, exports, toggle_1, platform_1, model_1, resolverService_1, nls_1, instantiation_1, quickInput_1, terminalEnvironment_1, colorRegistry_1, themables_1, terminalIcons_1, history_1, terminalStrings_1, uri_1, date_1, editorService_1, quickPickPin_1, storage_1) {
    "use strict";
    var TerminalOutputProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showRunRecentQuickPick = void 0;
    async function showRunRecentQuickPick(accessor, instance, terminalInRunCommandPicker, type, filterMode, value) {
        if (!instance.xterm) {
            return;
        }
        const editorService = accessor.get(editorService_1.IEditorService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const storageService = accessor.get(storage_1.IStorageService);
        const runRecentStorageKey = `${"terminal.pinnedRecentCommands" /* TerminalStorageKeys.PinnedRecentCommandsPrefix */}.${instance.shellType}`;
        let placeholder;
        let items = [];
        const commandMap = new Set();
        const removeFromCommandHistoryButton = {
            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.commandHistoryRemoveIcon),
            tooltip: (0, nls_1.localize)('removeCommand', "Remove from Command History")
        };
        const commandOutputButton = {
            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.commandHistoryOutputIcon),
            tooltip: (0, nls_1.localize)('viewCommandOutput', "View Command Output"),
            alwaysVisible: false
        };
        if (type === 'command') {
            placeholder = platform_1.isMacintosh ? (0, nls_1.localize)('selectRecentCommandMac', 'Select a command to run (hold Option-key to edit the command)') : (0, nls_1.localize)('selectRecentCommand', 'Select a command to run (hold Alt-key to edit the command)');
            const cmdDetection = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const commands = cmdDetection?.commands;
            // Current session history
            const executingCommand = cmdDetection?.executingCommand;
            if (executingCommand) {
                commandMap.add(executingCommand);
            }
            function formatLabel(label) {
                return label
                    // Replace new lines with "enter" symbol
                    .replace(/\r?\n/g, '\u23CE')
                    // Replace 3 or more spaces with midline horizontal ellipsis which looks similar
                    // to whitespace in the editor
                    .replace(/\s\s\s+/g, '\u22EF');
            }
            if (commands && commands.length > 0) {
                for (const entry of commands) {
                    // Trim off any whitespace and/or line endings, replace new lines with the
                    // Downwards Arrow with Corner Leftwards symbol
                    const label = entry.command.trim();
                    if (label.length === 0 || commandMap.has(label)) {
                        continue;
                    }
                    let description = (0, terminalEnvironment_1.collapseTildePath)(entry.cwd, instance.userHome, instance.os === 1 /* OperatingSystem.Windows */ ? '\\' : '/');
                    if (entry.exitCode) {
                        // Since you cannot get the last command's exit code on pwsh, just whether it failed
                        // or not, -1 is treated specially as simply failed
                        if (entry.exitCode === -1) {
                            description += ' failed';
                        }
                        else {
                            description += ` exitCode: ${entry.exitCode}`;
                        }
                    }
                    description = description.trim();
                    const buttons = [commandOutputButton];
                    // Merge consecutive commands
                    const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
                    if (lastItem?.type !== 'separator' && lastItem?.label === label) {
                        lastItem.id = entry.timestamp.toString();
                        lastItem.description = description;
                        continue;
                    }
                    items.push({
                        label: formatLabel(label),
                        rawLabel: label,
                        description,
                        id: entry.timestamp.toString(),
                        command: entry,
                        buttons: entry.hasOutput() ? buttons : undefined
                    });
                    commandMap.add(label);
                }
                items = items.reverse();
            }
            if (executingCommand) {
                items.unshift({
                    label: formatLabel(executingCommand),
                    rawLabel: executingCommand,
                    description: cmdDetection.cwd
                });
            }
            if (items.length > 0) {
                items.unshift({ type: 'separator', label: terminalStrings_1.terminalStrings.currentSessionCategory });
            }
            // Gather previous session history
            const history = instantiationService.invokeFunction(history_1.getCommandHistory);
            const previousSessionItems = [];
            for (const [label, info] of history.entries) {
                // Only add previous session item if it's not in this session
                if (!commandMap.has(label) && info.shellType === instance.shellType) {
                    previousSessionItems.unshift({
                        label: formatLabel(label),
                        rawLabel: label,
                        buttons: [removeFromCommandHistoryButton]
                    });
                    commandMap.add(label);
                }
            }
            if (previousSessionItems.length > 0) {
                items.push({ type: 'separator', label: terminalStrings_1.terminalStrings.previousSessionCategory }, ...previousSessionItems);
            }
            // Gather shell file history
            const shellFileHistory = await instantiationService.invokeFunction(history_1.getShellFileHistory, instance.shellType);
            const dedupedShellFileItems = [];
            for (const label of shellFileHistory) {
                if (!commandMap.has(label)) {
                    dedupedShellFileItems.unshift({
                        label: formatLabel(label),
                        rawLabel: label
                    });
                }
            }
            if (dedupedShellFileItems.length > 0) {
                items.push({ type: 'separator', label: (0, nls_1.localize)('shellFileHistoryCategory', '{0} history', instance.shellType) }, ...dedupedShellFileItems);
            }
        }
        else {
            placeholder = platform_1.isMacintosh
                ? (0, nls_1.localize)('selectRecentDirectoryMac', 'Select a directory to go to (hold Option-key to edit the command)')
                : (0, nls_1.localize)('selectRecentDirectory', 'Select a directory to go to (hold Alt-key to edit the command)');
            const cwds = instance.capabilities.get(0 /* TerminalCapability.CwdDetection */)?.cwds || [];
            if (cwds && cwds.length > 0) {
                for (const label of cwds) {
                    items.push({ label, rawLabel: label });
                }
                items = items.reverse();
                items.unshift({ type: 'separator', label: terminalStrings_1.terminalStrings.currentSessionCategory });
            }
            // Gather previous session history
            const history = instantiationService.invokeFunction(history_1.getDirectoryHistory);
            const previousSessionItems = [];
            // Only add previous session item if it's not in this session and it matches the remote authority
            for (const [label, info] of history.entries) {
                if ((info === null || info.remoteAuthority === instance.remoteAuthority) && !cwds.includes(label)) {
                    previousSessionItems.unshift({
                        label,
                        rawLabel: label,
                        buttons: [removeFromCommandHistoryButton]
                    });
                }
            }
            if (previousSessionItems.length > 0) {
                items.push({ type: 'separator', label: terminalStrings_1.terminalStrings.previousSessionCategory }, ...previousSessionItems);
            }
        }
        if (items.length === 0) {
            return;
        }
        const fuzzySearchToggle = new toggle_1.Toggle({
            title: 'Fuzzy search',
            icon: terminalIcons_1.commandHistoryFuzzySearchIcon,
            isChecked: filterMode === 'fuzzy',
            inputActiveOptionBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBorder),
            inputActiveOptionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionForeground),
            inputActiveOptionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBackground)
        });
        fuzzySearchToggle.onChange(() => {
            instantiationService.invokeFunction(showRunRecentQuickPick, instance, terminalInRunCommandPicker, type, fuzzySearchToggle.checked ? 'fuzzy' : 'contiguous', quickPick.value);
        });
        const outputProvider = instantiationService.createInstance(TerminalOutputProvider);
        const quickPick = quickInputService.createQuickPick();
        const originalItems = items;
        quickPick.items = [...originalItems];
        quickPick.sortByLabel = false;
        quickPick.placeholder = placeholder;
        quickPick.matchOnLabelMode = filterMode || 'contiguous';
        quickPick.toggles = [fuzzySearchToggle];
        quickPick.onDidTriggerItemButton(async (e) => {
            if (e.button === removeFromCommandHistoryButton) {
                if (type === 'command') {
                    instantiationService.invokeFunction(history_1.getCommandHistory)?.remove(e.item.label);
                }
                else {
                    instantiationService.invokeFunction(history_1.getDirectoryHistory)?.remove(e.item.label);
                }
            }
            else if (e.button === commandOutputButton) {
                const selectedCommand = e.item.command;
                const output = selectedCommand?.getOutput();
                if (output && selectedCommand?.command) {
                    const textContent = await outputProvider.provideTextContent(uri_1.URI.from({
                        scheme: TerminalOutputProvider.scheme,
                        path: `${selectedCommand.command}... ${(0, date_1.fromNow)(selectedCommand.timestamp, true)}`,
                        fragment: output,
                        query: `terminal-output-${selectedCommand.timestamp}-${instance.instanceId}`
                    }));
                    if (textContent) {
                        await editorService.openEditor({
                            resource: textContent.uri
                        });
                    }
                }
            }
            await instantiationService.invokeFunction(showRunRecentQuickPick, instance, terminalInRunCommandPicker, type, filterMode, value);
        });
        quickPick.onDidChangeValue(async (value) => {
            if (!value) {
                await instantiationService.invokeFunction(showRunRecentQuickPick, instance, terminalInRunCommandPicker, type, filterMode, value);
            }
        });
        quickPick.onDidAccept(async () => {
            const result = quickPick.activeItems[0];
            let text;
            if (type === 'cwd') {
                text = `cd ${await instance.preparePathForShell(result.rawLabel)}`;
            }
            else { // command
                text = result.rawLabel;
            }
            quickPick.hide();
            instance.runCommand(text, !quickPick.keyMods.alt);
            if (quickPick.keyMods.alt) {
                instance.focus();
            }
        });
        if (value) {
            quickPick.value = value;
        }
        return new Promise(r => {
            terminalInRunCommandPicker.set(true);
            (0, quickPickPin_1.showWithPinnedItems)(storageService, runRecentStorageKey, quickPick, true);
            quickPick.onDidHide(() => {
                terminalInRunCommandPicker.set(false);
                r();
            });
        });
    }
    exports.showRunRecentQuickPick = showRunRecentQuickPick;
    let TerminalOutputProvider = class TerminalOutputProvider {
        static { TerminalOutputProvider_1 = this; }
        static { this.scheme = 'TERMINAL_OUTPUT'; }
        constructor(textModelResolverService, _modelService) {
            this._modelService = _modelService;
            textModelResolverService.registerTextModelContentProvider(TerminalOutputProvider_1.scheme, this);
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this._modelService.createModel(resource.fragment, null, resource, false);
        }
    };
    TerminalOutputProvider = TerminalOutputProvider_1 = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService)
    ], TerminalOutputProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxSdW5SZWNlbnRRdWlja1BpY2suanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsUnVuUmVjZW50UXVpY2tQaWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQnpGLEtBQUssVUFBVSxzQkFBc0IsQ0FDM0MsUUFBMEIsRUFDMUIsUUFBMkIsRUFDM0IsMEJBQWdELEVBQ2hELElBQXVCLEVBQ3ZCLFVBQW1DLEVBQ25DLEtBQWM7UUFFZCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtZQUNwQixPQUFPO1NBQ1A7UUFFRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUNqRSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztRQUMzRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFlLENBQUMsQ0FBQztRQUVyRCxNQUFNLG1CQUFtQixHQUFHLEdBQUcsb0ZBQThDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RHLElBQUksV0FBbUIsQ0FBQztRQUV4QixJQUFJLEtBQUssR0FBMkUsRUFBRSxDQUFDO1FBQ3ZGLE1BQU0sVUFBVSxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTFDLE1BQU0sOEJBQThCLEdBQXNCO1lBQ3pELFNBQVMsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyx3Q0FBd0IsQ0FBQztZQUMxRCxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLDZCQUE2QixDQUFDO1NB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