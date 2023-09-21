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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/tfIdf", "vs/nls!vs/platform/quickinput/browser/commandsQuickAccess", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry"], function (require, exports, errorMessage_1, errors_1, filters_1, functional_1, lifecycle_1, map_1, tfIdf_1, nls_1, commands_1, configuration_1, dialogs_1, instantiation_1, keybinding_1, pickerQuickAccess_1, storage_1, telemetry_1) {
    "use strict";
    var $JLb_1, $KLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KLb = exports.$JLb = void 0;
    let $JLb = class $JLb extends pickerQuickAccess_1.$sqb {
        static { $JLb_1 = this; }
        static { this.PREFIX = '>'; }
        static { this.h = 0.5; }
        static { this.j = 5; }
        static { this.m = (0, filters_1.or)(filters_1.$yj, filters_1.$Dj, filters_1.$zj); }
        constructor(options, t, u, w, y, z) {
            super($JLb_1.PREFIX, options);
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.n = this.B(this.t.createInstance($KLb));
            this.f = options;
        }
        async g(filter, _disposables, token, runOptions) {
            // Ask subclass for all command picks
            const allCommandPicks = await this.F(token);
            if (token.isCancellationRequested) {
                return [];
            }
            const runTfidf = (0, functional_1.$bb)(() => {
                const tfidf = new tfIdf_1.$NS();
                tfidf.updateDocuments(allCommandPicks.map(commandPick => ({
                    key: commandPick.commandId,
                    textChunks: [commandPick.label + (commandPick.commandAlias ? ` ${commandPick.commandAlias}` : '')]
                })));
                const result = tfidf.calculateScores(filter, token);
                return (0, tfIdf_1.$OS)(result)
                    .filter(score => score.score > $JLb_1.h)
                    .slice(0, $JLb_1.j);
            });
            // Filter
            const filteredCommandPicks = [];
            for (const commandPick of allCommandPicks) {
                const labelHighlights = $JLb_1.m(filter, commandPick.label) ?? undefined;
                const aliasHighlights = commandPick.commandAlias ? $JLb_1.m(filter, commandPick.commandAlias) ?? undefined : undefined;
                // Add if matching in label or alias
                if (labelHighlights || aliasHighlights) {
                    commandPick.highlights = {
                        label: labelHighlights,
                        detail: this.f.showAlias ? aliasHighlights : undefined
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
                const commandACounter = this.n.peek(commandPickA.commandId);
                const commandBCounter = this.n.peek(commandPickB.commandId);
                if (commandACounter && commandBCounter) {
                    return commandACounter > commandBCounter ? -1 : 1; // use more recently used command before older
                }
                if (commandACounter) {
                    return -1; // first command was used, so it wins over the non used one
                }
                if (commandBCounter) {
                    return 1; // other command was used so it wins over the command
                }
                if (this.f.suggestedCommandIds) {
                    const commandASuggestion = this.f.suggestedCommandIds.has(commandPickA.commandId);
                    const commandBSuggestion = this.f.suggestedCommandIds.has(commandPickB.commandId);
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
            let addCommonlyUsedSeparator = !!this.f.suggestedCommandIds;
            for (let i = 0; i < filteredCommandPicks.length; i++) {
                const commandPick = filteredCommandPicks[i];
                // Separator: recently used
                if (i === 0 && this.n.peek(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)(0, null) });
                    addOtherSeparator = true;
                }
                if (addSuggestedSeparator && commandPick.tfIdfScore !== undefined) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)(1, null) });
                    addSuggestedSeparator = false;
                }
                // Separator: commonly used
                if (addCommonlyUsedSeparator && commandPick.tfIdfScore === undefined && !this.n.peek(commandPick.commandId) && this.f.suggestedCommandIds?.has(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)(2, null) });
                    addOtherSeparator = true;
                    addCommonlyUsedSeparator = false;
                }
                // Separator: other commands
                if (addOtherSeparator && commandPick.tfIdfScore === undefined && !this.n.peek(commandPick.commandId) && !this.f.suggestedCommandIds?.has(commandPick.commandId)) {
                    commandPicks.push({ type: 'separator', label: (0, nls_1.localize)(3, null) });
                    addOtherSeparator = false;
                }
                // Command
                commandPicks.push(this.D(commandPick, runOptions));
            }
            if (!this.G(filter, token)) {
                return commandPicks;
            }
            return {
                picks: commandPicks,
                additionalPicks: (async () => {
                    const additionalCommandPicks = await this.H(allCommandPicks, filteredCommandPicks, filter, token);
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    const commandPicks = additionalCommandPicks.map(commandPick => this.D(commandPick, runOptions));
                    // Basically, if we haven't already added a separator, we add one before the additional picks so long
                    // as one hasn't been added to the start of the array.
                    if (addSuggestedSeparator && commandPicks[0]?.type !== 'separator') {
                        commandPicks.unshift({ type: 'separator', label: (0, nls_1.localize)(4, null) });
                    }
                    return commandPicks;
                })()
            };
        }
        D(commandPick, runOptions) {
            if (commandPick.type === 'separator') {
                return commandPick;
            }
            const keybinding = this.u.lookupKeybinding(commandPick.commandId);
            const ariaLabel = keybinding ?
                (0, nls_1.localize)(5, null, commandPick.label, keybinding.getAriaLabel()) :
                commandPick.label;
            return {
                ...commandPick,
                ariaLabel,
                detail: this.f.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : undefined,
                keybinding,
                accept: async () => {
                    // Add to history
                    this.n.push(commandPick.commandId);
                    // Telementry
                    this.y.publicLog2('workbenchActionExecuted', {
                        id: commandPick.commandId,
                        from: runOptions?.from ?? 'quick open'
                    });
                    // Run
                    try {
                        commandPick.args?.length
                            ? await this.w.executeCommand(commandPick.commandId, ...commandPick.args)
                            : await this.w.executeCommand(commandPick.commandId);
                    }
                    catch (error) {
                        if (!(0, errors_1.$2)(error)) {
                            this.z.error((0, nls_1.localize)(6, null, commandPick.label), (0, errorMessage_1.$mi)(error));
                        }
                    }
                }
            };
        }
    };
    exports.$JLb = $JLb;
    exports.$JLb = $JLb = $JLb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, keybinding_1.$2D),
        __param(3, commands_1.$Fr),
        __param(4, telemetry_1.$9k),
        __param(5, dialogs_1.$oA)
    ], $JLb);
    let $KLb = class $KLb extends lifecycle_1.$kc {
        static { $KLb_1 = this; }
        static { this.DEFAULT_COMMANDS_HISTORY_LENGTH = 50; }
        static { this.c = 'commandPalette.mru.cache'; }
        static { this.f = 'commandPalette.mru.counter'; }
        static { this.h = 1; }
        constructor(m, n) {
            super();
            this.m = m;
            this.n = n;
            this.j = 0;
            this.s();
            this.t();
            this.r();
        }
        r() {
            this.B(this.n.onDidChangeConfiguration(e => this.s(e)));
        }
        s(e) {
            if (e && !e.affectsConfiguration('workbench.commandPalette.history')) {
                return;
            }
            this.j = $KLb_1.getConfiguredCommandHistoryLength(this.n);
            if ($KLb_1.g && $KLb_1.g.limit !== this.j) {
                $KLb_1.g.limit = this.j;
                $KLb_1.saveState(this.m);
            }
        }
        t() {
            const raw = this.m.get($KLb_1.c, 0 /* StorageScope.PROFILE */);
            let serializedCache;
            if (raw) {
                try {
                    serializedCache = JSON.parse(raw);
                }
                catch (error) {
                    // invalid data
                }
            }
            const cache = $KLb_1.g = new map_1.$Ci(this.j, 1);
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
            $KLb_1.h = this.m.getNumber($KLb_1.f, 0 /* StorageScope.PROFILE */, $KLb_1.h);
        }
        push(commandId) {
            if (!$KLb_1.g) {
                return;
            }
            $KLb_1.g.set(commandId, $KLb_1.h++); // set counter to command
            $KLb_1.saveState(this.m);
        }
        peek(commandId) {
            return $KLb_1.g?.peek(commandId);
        }
        static saveState(storageService) {
            if (!$KLb_1.g) {
                return;
            }
            const serializedCache = { usesLRU: true, entries: [] };
            $KLb_1.g.forEach((value, key) => serializedCache.entries.push({ key, value }));
            storageService.store($KLb_1.c, JSON.stringify(serializedCache), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store($KLb_1.f, $KLb_1.h, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        static getConfiguredCommandHistoryLength(configurationService) {
            const config = configurationService.getValue();
            const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
            if (typeof configuredCommandHistoryLength === 'number') {
                return configuredCommandHistoryLength;
            }
            return $KLb_1.DEFAULT_COMMANDS_HISTORY_LENGTH;
        }
        static clearHistory(configurationService, storageService) {
            const commandHistoryLength = $KLb_1.getConfiguredCommandHistoryLength(configurationService);
            $KLb_1.g = new map_1.$Ci(commandHistoryLength);
            $KLb_1.h = 1;
            $KLb_1.saveState(storageService);
        }
    };
    exports.$KLb = $KLb;
    exports.$KLb = $KLb = $KLb_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, configuration_1.$8h)
    ], $KLb);
});
//# sourceMappingURL=commandsQuickAccess.js.map