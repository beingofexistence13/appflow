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
define(["require", "exports", "vs/base/browser/ui/toggle/toggle", "vs/base/common/platform", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/terminal/browser/terminalRunRecentQuickPick", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminalEnvironment", "vs/platform/theme/common/colorRegistry", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/common/history", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/base/common/uri", "vs/base/common/date", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/browser/quickPickPin", "vs/platform/storage/common/storage"], function (require, exports, toggle_1, platform_1, model_1, resolverService_1, nls_1, instantiation_1, quickInput_1, terminalEnvironment_1, colorRegistry_1, themables_1, terminalIcons_1, history_1, terminalStrings_1, uri_1, date_1, editorService_1, quickPickPin_1, storage_1) {
    "use strict";
    var TerminalOutputProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Vb = void 0;
    async function $9Vb(accessor, instance, terminalInRunCommandPicker, type, filterMode, value) {
        if (!instance.xterm) {
            return;
        }
        const editorService = accessor.get(editorService_1.$9C);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const quickInputService = accessor.get(quickInput_1.$Gq);
        const storageService = accessor.get(storage_1.$Vo);
        const runRecentStorageKey = `${"terminal.pinnedRecentCommands" /* TerminalStorageKeys.PinnedRecentCommandsPrefix */}.${instance.shellType}`;
        let placeholder;
        let items = [];
        const commandMap = new Set();
        const removeFromCommandHistoryButton = {
            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.$wib),
            tooltip: (0, nls_1.localize)(0, null)
        };
        const commandOutputButton = {
            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.$xib),
            tooltip: (0, nls_1.localize)(1, null),
            alwaysVisible: false
        };
        if (type === 'command') {
            placeholder = platform_1.$j ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null);
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
                    let description = (0, terminalEnvironment_1.$QM)(entry.cwd, instance.userHome, instance.os === 1 /* OperatingSystem.Windows */ ? '\\' : '/');
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
                items.unshift({ type: 'separator', label: terminalStrings_1.$pVb.currentSessionCategory });
            }
            // Gather previous session history
            const history = instantiationService.invokeFunction(history_1.$sVb);
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
                items.push({ type: 'separator', label: terminalStrings_1.$pVb.previousSessionCategory }, ...previousSessionItems);
            }
            // Gather shell file history
            const shellFileHistory = await instantiationService.invokeFunction(history_1.$uVb, instance.shellType);
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
                items.push({ type: 'separator', label: (0, nls_1.localize)(4, null, instance.shellType) }, ...dedupedShellFileItems);
            }
        }
        else {
            placeholder = platform_1.$j
                ? (0, nls_1.localize)(5, null)
                : (0, nls_1.localize)(6, null);
            const cwds = instance.capabilities.get(0 /* TerminalCapability.CwdDetection */)?.cwds || [];
            if (cwds && cwds.length > 0) {
                for (const label of cwds) {
                    items.push({ label, rawLabel: label });
                }
                items = items.reverse();
                items.unshift({ type: 'separator', label: terminalStrings_1.$pVb.currentSessionCategory });
            }
            // Gather previous session history
            const history = instantiationService.invokeFunction(history_1.$tVb);
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
                items.push({ type: 'separator', label: terminalStrings_1.$pVb.previousSessionCategory }, ...previousSessionItems);
            }
        }
        if (items.length === 0) {
            return;
        }
        const fuzzySearchToggle = new toggle_1.$KQ({
            title: 'Fuzzy search',
            icon: terminalIcons_1.$yib,
            isChecked: filterMode === 'fuzzy',
            inputActiveOptionBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Pv),
            inputActiveOptionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Sv),
            inputActiveOptionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Rv)
        });
        fuzzySearchToggle.onChange(() => {
            instantiationService.invokeFunction($9Vb, instance, terminalInRunCommandPicker, type, fuzzySearchToggle.checked ? 'fuzzy' : 'contiguous', quickPick.value);
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
                    instantiationService.invokeFunction(history_1.$sVb)?.remove(e.item.label);
                }
                else {
                    instantiationService.invokeFunction(history_1.$tVb)?.remove(e.item.label);
                }
            }
            else if (e.button === commandOutputButton) {
                const selectedCommand = e.item.command;
                const output = selectedCommand?.getOutput();
                if (output && selectedCommand?.command) {
                    const textContent = await outputProvider.provideTextContent(uri_1.URI.from({
                        scheme: TerminalOutputProvider.scheme,
                        path: `${selectedCommand.command}... ${(0, date_1.$6l)(selectedCommand.timestamp, true)}`,
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
            await instantiationService.invokeFunction($9Vb, instance, terminalInRunCommandPicker, type, filterMode, value);
        });
        quickPick.onDidChangeValue(async (value) => {
            if (!value) {
                await instantiationService.invokeFunction($9Vb, instance, terminalInRunCommandPicker, type, filterMode, value);
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
            (0, quickPickPin_1.$8Vb)(storageService, runRecentStorageKey, quickPick, true);
            quickPick.onDidHide(() => {
                terminalInRunCommandPicker.set(false);
                r();
            });
        });
    }
    exports.$9Vb = $9Vb;
    let TerminalOutputProvider = class TerminalOutputProvider {
        static { TerminalOutputProvider_1 = this; }
        static { this.scheme = 'TERMINAL_OUTPUT'; }
        constructor(textModelResolverService, a) {
            this.a = a;
            textModelResolverService.registerTextModelContentProvider(TerminalOutputProvider_1.scheme, this);
        }
        async provideTextContent(resource) {
            const existing = this.a.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this.a.createModel(resource.fragment, null, resource, false);
        }
    };
    TerminalOutputProvider = TerminalOutputProvider_1 = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA)
    ], TerminalOutputProvider);
});
//# sourceMappingURL=terminalRunRecentQuickPick.js.map