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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/tfIdf", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry"], function (require, exports, errorMessage_1, errors_1, filters_1, functional_1, lifecycle_1, map_1, tfIdf_1, nls_1, commands_1, configuration_1, dialogs_1, instantiation_1, keybinding_1, pickerQuickAccess_1, storage_1, telemetry_1) {
    "use strict";
    var AbstractCommandsQuickAccessProvider_1, CommandsHistory_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommandsHistory = exports.AbstractCommandsQuickAccessProvider = void 0;
    let AbstractCommandsQuickAccessProvider = class AbstractCommandsQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { AbstractCommandsQuickAccessProvider_1 = this; }
        static { this.PREFIX = '>'; }
        static { this.TFIDF_THRESHOLD = 0.5; }
        static { this.TFIDF_MAX_RESULTS = 5; }
        static { this.WORD_FILTER = (0, filters_1.or)(filters_1.matchesPrefix, filters_1.matchesWords, filters_1.matchesContiguousSubString); }
        constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
            super(AbstractCommandsQuickAccessProvider_1.PREFIX, options);
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.dialogService = dialogService;
            this.commandsHistory = this._register(this.instantiationService.createInstance(CommandsHistory));
            this.options = options;
        }
        async _getPicks(filter, _disposables, token, runOptions) {
            // Ask subclass for all command picks
            const allCommandPicks = await this.getCommandPicks(token);
            if (token.isCancellationRequested) {
                return [];
            }
            const runTfidf = (0, functional_1.once)(() => {
                const tfidf = new tfIdf_1.TfIdfCalculator();
                tfidf.updateDocuments(allCommandPicks.map(commandPick => ({
                    key: commandPick.commandId,
                    textChunks: [commandPick.label + (commandPick.commandAlias ? ` ${commandPick.commandAlias}` : '')]
                })));
                const result = tfidf.calculateScores(filter, token);
                return (0, tfIdf_1.normalizeTfIdfScores)(result)
                    .filter(score => score.score > AbstractCommandsQuickAccessProvider_1.TFIDF_THRESHOLD)
                    .slice(0, AbstractCommandsQuickAccessProvider_1.TFIDF_MAX_RESULTS);
            });
            // Filter
            const filteredCommandPicks = [];
            for (const commandPick of allCommandPicks) {
                const labelHighlights = AbstractCommandsQuickAccessProvider_1.WORD_FILTER(filter, commandPick.label) ?? undefined;
                const aliasHighlights = commandPick.commandAlias ? AbstractCommandsQuickAccessProvider_1.WORD_FILTER(filter, commandPick.commandAlias) ?? undefined : undefined;
                // Add if matching in label or alias
                if (labelHighlights || aliasHighlights) {
                    commandPick.highlights = {
                        label: labelHighlights,
                        detail: this.options.showAlias ? aliasHighlights : undefined
                    };
                    filteredCommandPicks.push(commandPick);
                }
                // Also add if we have a 100% command ID match
                else if (filter === commandPick.commandId) {
                    filteredCommandPicks.push(commandPick);
                }
                // Handle tf-idf scoring for the rest if there's a filter
                else if (filter.length >= 3) {
                    const tfidf = runTfidf();
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    // Add if we have a tf-idf score
                    const tfidfScore = tfidf.find(score => score.key === commandPick.commandId);
                    if (tfidfScore) {
                        commandPick.tfIdfScore = tfidfScore.score;
                        filteredCommandPicks.push(commandPick);
                    }
                }
            }
            // Add description to commands that have duplicate labels
            const mapLabelToCommand = new Map();
            for (const commandPick of filteredCommandPicks) {
                const existingCommandForLabel = mapLabelToCommand.get(commandPick.label);
                if (existingCommandForLabel) {
                    commandPick.description = commandPick.commandId;
                    existingCommandForLabel.description = existingCommandForLabel.commandId;
                }
                else {
                    mapLabelToCommand.set(commandPick.label, commandPick);
                }
            }
            // Sort by MRU order and fallback to name otherwise
            filteredCommandPicks.sort((commandPickA, commandPickB) => {
                // If a result came from tf-idf, we want to put that towards the bottom
                if (commandPickA.tfIdfScore && commandPickB.tfIdfScore) {
                    if (commandPickA.tfIdfScore === commandPickB.tfIdfScore) {
                        return commandPickA.label.localeCompare(commandPickB.label); // prefer lexicographically smaller command
                    }
                    return commandPickB.tfIdfScore - commandPickA.tfIdfScore; // prefer higher tf-idf score
                }
                else if (commandPickA.tfIdfScore) {
                    return 1; // first command has a score but other doesn't so other wins
                }
                else if (commandPickB.tfIdfScore) {
                    return -1; // other command has a score but first doesn't so first wins
                }
                const commandACounter = this.commandsHistory.peek(commandPickA.commandId);
                const commandBCounter = this.commandsHistory.peek(commandPickB.commandId);
                if (commandACounter && commandBCounter) {
                    return commandACounter > commandBCounter ? -1 : 1; // use more recently used command before older
                }
                if (commandACounter) {
                    return -1; // first command was used, so it wins over the non used one
                }
                if (commandBCounter) {
                    return 1; // other command was used so it wins over the command
                }
                if (this.options.suggestedCommandIds) {
                    const commandASuggestion = this.options.suggestedCommandIds.has(commandPickA.commandId);
                    const commandBSuggestion = this.options.suggestedCommandIds.has(commandPickB.commandId);
                    if (commandASuggestion && commandBSuggestion) {
                        return 0; // honor the order of the array
                    }
                    if (commandASuggestion) {
                        return -1; // first command was suggested, so it wins over the non suggested one
                    }
                    if (commandBSuggestion) {
                        return 1; // other command was suggested so it wins over the command
                    }
                }
                // both commands were never used, so we sort by name
                return commandPickA.label.localeCompare(commandPickB.label);
            });
            const commandPicks = [];
            let addOtherSeparator = false;
            let addSuggestedSeparator = true;
            let addCommonlyUsedSeparator = !!this.options.suggestedCommandIds;
            for (let i = 0; i < filteredCommandPicks.length; i++) {
                const commandPick = filteredCommandPicks[i];
                // Separator: recently used
                if (i === 0 && this.commandsHistory.peek(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)('recentlyUsed', "recently used") });
                    addOtherSeparator = true;
                }
                if (addSuggestedSeparator && commandPick.tfIdfScore !== undefined) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)('suggested', "similar commands") });
                    addSuggestedSeparator = false;
                }
                // Separator: commonly used
                if (addCommonlyUsedSeparator && commandPick.tfIdfScore === undefined && !this.commandsHistory.peek(commandPick.commandId) && this.options.suggestedCommandIds?.has(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)('commonlyUsed', "commonly used") });
                    addOtherSeparator = true;
                    addCommonlyUsedSeparator = false;
                }
                // Separator: other commands
                if (addOtherSeparator && commandPick.tfIdfScore === undefined && !this.commandsHistory.peek(commandPick.commandId) && !this.options.suggestedCommandIds?.has(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)('morecCommands', "other commands") });
                    addOtherSeparator = false;
                }
                // Command
                commandPicks.push(this.toCommandPick(commandPick, runOptions));
            }
            if (!this.hasAdditionalCommandPicks(filter, token)) {
                return commandPicks;
            }
            return {
                picks: commandPicks,
                additionalPicks: (async () => {
                    const additionalCommandPicks = await this.getAdditionalCommandPicks(allCommandPicks, filteredCommandPicks, filter, token);
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    const commandPicks = additionalCommandPicks.map(commandPick => this.toCommandPick(commandPick, runOptions));
                    // Basically, if we haven't already added a separator, we add one before the additional picks so long
                    // as one hasn't been added to the start of the array.
                    if (addSuggestedSeparator && commandPicks[0]?.type !== 'separator') {
                        commandPicks.unshift({ type: 'separator', label: (0, nls_1.localize)('suggested', "similar commands") });
                    }
                    return commandPicks;
                })()
            };
        }
        toCommandPick(commandPick, runOptions) {
            if (commandPick.type === 'separator') {
                return commandPick;
            }
            const keybinding = this.keybindingService.lookupKeybinding(commandPick.commandId);
            const ariaLabel = keybinding ?
                (0, nls_1.localize)('commandPickAriaLabelWithKeybinding', "{0}, {1}", commandPick.label, keybinding.getAriaLabel()) :
                commandPick.label;
            return {
                ...commandPick,
                ariaLabel,
                detail: this.options.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : undefined,
                keybinding,
                accept: async () => {
                    // Add to history
                    this.commandsHistory.push(commandPick.commandId);
                    // Telementry
                    this.telemetryService.publicLog2('workbenchActionExecuted', {
                        id: commandPick.commandId,
                        from: runOptions?.from ?? 'quick open'
                    });
                    // Run
                    try {
                        commandPick.args?.length
                            ? await this.commandService.executeCommand(commandPick.commandId, ...commandPick.args)
                            : await this.commandService.executeCommand(commandPick.commandId);
                    }
                    catch (error) {
                        if (!(0, errors_1.isCancellationError)(error)) {
                            this.dialogService.error((0, nls_1.localize)('canNotRun', "Command '{0}' resulted in an error", commandPick.label), (0, errorMessage_1.toErrorMessage)(error));
                        }
                    }
                }
            };
        }
    };
    exports.AbstractCommandsQuickAccessProvider = AbstractCommandsQuickAccessProvider;
    exports.AbstractCommandsQuickAccessProvider = AbstractCommandsQuickAccessProvider = AbstractCommandsQuickAccessProvider_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, commands_1.ICommandService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, dialogs_1.IDialogService)
    ], AbstractCommandsQuickAccessProvider);
    let CommandsHistory = class CommandsHistory extends lifecycle_1.Disposable {
        static { CommandsHistory_1 = this; }
        static { this.DEFAULT_COMMANDS_HISTORY_LENGTH = 50; }
        static { this.PREF_KEY_CACHE = 'commandPalette.mru.cache'; }
        static { this.PREF_KEY_COUNTER = 'commandPalette.mru.counter'; }
        static { this.counter = 1; }
        constructor(storageService, configurationService) {
            super();
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.configuredCommandsHistoryLength = 0;
            this.updateConfiguration();
            this.load();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.updateConfiguration(e)));
        }
        updateConfiguration(e) {
            if (e && !e.affectsConfiguration('workbench.commandPalette.history')) {
                return;
            }
            this.configuredCommandsHistoryLength = CommandsHistory_1.getConfiguredCommandHistoryLength(this.configurationService);
            if (CommandsHistory_1.cache && CommandsHistory_1.cache.limit !== this.configuredCommandsHistoryLength) {
                CommandsHistory_1.cache.limit = this.configuredCommandsHistoryLength;
                CommandsHistory_1.saveState(this.storageService);
            }
        }
        load() {
            const raw = this.storageService.get(CommandsHistory_1.PREF_KEY_CACHE, 0 /* StorageScope.PROFILE */);
            let serializedCache;
            if (raw) {
                try {
                    serializedCache = JSON.parse(raw);
                }
                catch (error) {
                    // invalid data
                }
            }
            const cache = CommandsHistory_1.cache = new map_1.LRUCache(this.configuredCommandsHistoryLength, 1);
            if (serializedCache) {
                let entries;
                if (serializedCache.usesLRU) {
                    entries = serializedCache.entries;
                }
                else {
                    entries = serializedCache.entries.sort((a, b) => a.value - b.value);
                }
                entries.forEach(entry => cache.set(entry.key, entry.value));
            }
            CommandsHistory_1.counter = this.storageService.getNumber(CommandsHistory_1.PREF_KEY_COUNTER, 0 /* StorageScope.PROFILE */, CommandsHistory_1.counter);
        }
        push(commandId) {
            if (!CommandsHistory_1.cache) {
                return;
            }
            CommandsHistory_1.cache.set(commandId, CommandsHistory_1.counter++); // set counter to command
            CommandsHistory_1.saveState(this.storageService);
        }
        peek(commandId) {
            return CommandsHistory_1.cache?.peek(commandId);
        }
        static saveState(storageService) {
            if (!CommandsHistory_1.cache) {
                return;
            }
            const serializedCache = { usesLRU: true, entries: [] };
            CommandsHistory_1.cache.forEach((value, key) => serializedCache.entries.push({ key, value }));
            storageService.store(CommandsHistory_1.PREF_KEY_CACHE, JSON.stringify(serializedCache), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store(CommandsHistory_1.PREF_KEY_COUNTER, CommandsHistory_1.counter, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        static getConfiguredCommandHistoryLength(configurationService) {
            const config = configurationService.getValue();
            const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
            if (typeof configuredCommandHistoryLength === 'number') {
                return configuredCommandHistoryLength;
            }
            return CommandsHistory_1.DEFAULT_COMMANDS_HISTORY_LENGTH;
        }
        static clearHistory(configurationService, storageService) {
            const commandHistoryLength = CommandsHistory_1.getConfiguredCommandHistoryLength(configurationService);
            CommandsHistory_1.cache = new map_1.LRUCache(commandHistoryLength);
            CommandsHistory_1.counter = 1;
            CommandsHistory_1.saveState(storageService);
        }
    };
    exports.CommandsHistory = CommandsHistory;
    exports.CommandsHistory = CommandsHistory = CommandsHistory_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, configuration_1.IConfigurationService)
    ], CommandsHistory);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHNRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9jb21tYW5kc1F1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ3pGLElBQWUsbUNBQW1DLEdBQWxELE1BQWUsbUNBQW9DLFNBQVEsNkNBQTRDOztpQkFFdEcsV0FBTSxHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUVJLG9CQUFlLEdBQUcsR0FBRyxBQUFOLENBQU87aUJBQ3RCLHNCQUFpQixHQUFHLENBQUMsQUFBSixDQUFLO2lCQUUvQixnQkFBVyxHQUFHLElBQUEsWUFBRSxFQUFDLHVCQUFhLEVBQUUsc0JBQVksRUFBRSxvQ0FBMEIsQ0FBQyxBQUE5RCxDQUErRDtRQU16RixZQUNDLE9BQW9DLEVBQ2Isb0JBQTRELEVBQy9ELGlCQUFzRCxFQUN6RCxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDdkQsYUFBOEM7WUFFOUQsS0FBSyxDQUFDLHFDQUFtQyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQU5uQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBVjlDLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFjNUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVTLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBYyxFQUFFLFlBQTZCLEVB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