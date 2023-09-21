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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/platform", "vs/base/common/filters", "vs/base/common/keybindingLabels", "vs/platform/actions/common/actions", "vs/workbench/common/editor/editorModel", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/workbench/services/keybinding/browser/unboundCommands", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions"], function (require, exports, nls_1, arrays_1, strings, platform_1, filters_1, keybindingLabels_1, actions_1, editorModel_1, keybinding_1, resolvedKeybindingItem_1, unboundCommands_1, types_1, extensions_1, extensions_2) {
    "use strict";
    var KeybindingsEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsEditorModel = exports.KEYBINDING_ENTRY_TEMPLATE_ID = void 0;
    exports.KEYBINDING_ENTRY_TEMPLATE_ID = 'keybinding.entry.template';
    const SOURCE_SYSTEM = (0, nls_1.localize)('default', "System");
    const SOURCE_EXTENSION = (0, nls_1.localize)('extension', "Extension");
    const SOURCE_USER = (0, nls_1.localize)('user', "User");
    const wordFilter = (0, filters_1.or)(filters_1.matchesPrefix, filters_1.matchesWords, filters_1.matchesContiguousSubString);
    const SOURCE_REGEX = /@source:\s*(user|default|system|extension)/i;
    const EXTENSION_REGEX = /@ext:\s*((".+")|([^\s]+))/i;
    let KeybindingsEditorModel = KeybindingsEditorModel_1 = class KeybindingsEditorModel extends editorModel_1.EditorModel {
        constructor(os, keybindingsService, extensionService) {
            super();
            this.keybindingsService = keybindingsService;
            this.extensionService = extensionService;
            this._keybindingItems = [];
            this._keybindingItemsSortedByPrecedence = [];
            this.modifierLabels = {
                ui: keybindingLabels_1.UILabelProvider.modifierLabels[os],
                aria: keybindingLabels_1.AriaLabelProvider.modifierLabels[os],
                user: keybindingLabels_1.UserSettingsLabelProvider.modifierLabels[os]
            };
        }
        fetch(searchValue, sortByPrecedence = false) {
            let keybindingItems = sortByPrecedence ? this._keybindingItemsSortedByPrecedence : this._keybindingItems;
            const commandIdMatches = /@command:\s*(.+)/i.exec(searchValue);
            if (commandIdMatches && commandIdMatches[1]) {
                return keybindingItems.filter(k => k.command === commandIdMatches[1])
                    .map(keybindingItem => ({ id: KeybindingsEditorModel_1.getId(keybindingItem), keybindingItem, templateId: exports.KEYBINDING_ENTRY_TEMPLATE_ID }));
            }
            if (SOURCE_REGEX.test(searchValue)) {
                keybindingItems = this.filterBySource(keybindingItems, searchValue);
                searchValue = searchValue.replace(SOURCE_REGEX, '');
            }
            else {
                const extensionMatches = EXTENSION_REGEX.exec(searchValue);
                if (extensionMatches && (extensionMatches[2] || extensionMatches[3])) {
                    const extensionId = extensionMatches[2] ? extensionMatches[2].substring(1, extensionMatches[2].length - 1) : extensionMatches[3];
                    keybindingItems = this.filterByExtension(keybindingItems, extensionId);
                    searchValue = searchValue.replace(EXTENSION_REGEX, '');
                }
                else {
                    const keybindingMatches = /@keybinding:\s*((\".+\")|(\S+))/i.exec(searchValue);
                    if (keybindingMatches && (keybindingMatches[2] || keybindingMatches[3])) {
                        searchValue = keybindingMatches[2] || `"${keybindingMatches[3]}"`;
                    }
                }
            }
            searchValue = searchValue.trim();
            if (!searchValue) {
                return keybindingItems.map(keybindingItem => ({ id: KeybindingsEditorModel_1.getId(keybindingItem), keybindingItem, templateId: exports.KEYBINDING_ENTRY_TEMPLATE_ID }));
            }
            return this.filterByText(keybindingItems, searchValue);
        }
        filterBySource(keybindingItems, searchValue) {
            if (/@source:\s*default/i.test(searchValue) || /@source:\s*system/i.test(searchValue)) {
                return keybindingItems.filter(k => k.source === SOURCE_SYSTEM);
            }
            if (/@source:\s*user/i.test(searchValue)) {
                return keybindingItems.filter(k => k.source === SOURCE_USER);
            }
            if (/@source:\s*extension/i.test(searchValue)) {
                return keybindingItems.filter(k => !(0, types_1.isString)(k.source) || k.source === SOURCE_EXTENSION);
            }
            return keybindingItems;
        }
        filterByExtension(keybindingItems, extension) {
            extension = extension.toLowerCase().trim();
            return keybindingItems.filter(k => !(0, types_1.isString)(k.source) && (extensions_2.ExtensionIdentifier.equals(k.source.identifier, extension) || k.source.displayName?.toLowerCase() === extension.toLowerCase()));
        }
        filterByText(keybindingItems, searchValue) {
            const quoteAtFirstChar = searchValue.charAt(0) === '"';
            const quoteAtLastChar = searchValue.charAt(searchValue.length - 1) === '"';
            const completeMatch = quoteAtFirstChar && quoteAtLastChar;
            if (quoteAtFirstChar) {
                searchValue = searchValue.substring(1);
            }
            if (quoteAtLastChar) {
                searchValue = searchValue.substring(0, searchValue.length - 1);
            }
            searchValue = searchValue.trim();
            const result = [];
            const words = searchValue.split(' ');
            const keybindingWords = this.splitKeybindingWords(words);
            for (const keybindingItem of keybindingItems) {
                const keybindingMatches = new KeybindingItemMatches(this.modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch);
                if (keybindingMatches.commandIdMatches
                    || keybindingMatches.commandLabelMatches
                    || keybindingMatches.commandDefaultLabelMatches
                    || keybindingMatches.sourceMatches
                    || keybindingMatches.whenMatches
                    || keybindingMatches.keybindingMatches
                    || keybindingMatches.extensionIdMatches
                    || keybindingMatches.extensionLabelMatches) {
                    result.push({
                        id: KeybindingsEditorModel_1.getId(keybindingItem),
                        templateId: exports.KEYBINDING_ENTRY_TEMPLATE_ID,
                        commandLabelMatches: keybindingMatches.commandLabelMatches || undefined,
                        commandDefaultLabelMatches: keybindingMatches.commandDefaultLabelMatches || undefined,
                        keybindingItem,
                        keybindingMatches: keybindingMatches.keybindingMatches || undefined,
                        commandIdMatches: keybindingMatches.commandIdMatches || undefined,
                        sourceMatches: keybindingMatches.sourceMatches || undefined,
                        whenMatches: keybindingMatches.whenMatches || undefined,
                        extensionIdMatches: keybindingMatches.extensionIdMatches || undefined,
                        extensionLabelMatches: keybindingMatches.extensionLabelMatches || undefined
                    });
                }
            }
            return result;
        }
        splitKeybindingWords(wordsSeparatedBySpaces) {
            const result = [];
            for (const word of wordsSeparatedBySpaces) {
                result.push(...(0, arrays_1.coalesce)(word.split('+')));
            }
            return result;
        }
        async resolve(actionLabels = new Map()) {
            const extensions = new extensions_2.ExtensionIdentifierMap();
            for (const extension of this.extensionService.extensions) {
                extensions.set(extension.identifier, extension);
            }
            this._keybindingItemsSortedByPrecedence = [];
            const boundCommands = new Map();
            for (const keybinding of this.keybindingsService.getKeybindings()) {
                if (keybinding.command) { // Skip keybindings without commands
                    this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel_1.toKeybindingEntry(keybinding.command, keybinding, actionLabels, extensions));
                    boundCommands.set(keybinding.command, true);
                }
            }
            const commandsWithDefaultKeybindings = this.keybindingsService.getDefaultKeybindings().map(keybinding => keybinding.command);
            for (const command of (0, unboundCommands_1.getAllUnboundCommands)(boundCommands)) {
                const keybindingItem = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, command, null, undefined, commandsWithDefaultKeybindings.indexOf(command) === -1, null, false);
                this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel_1.toKeybindingEntry(command, keybindingItem, actionLabels, extensions));
            }
            this._keybindingItemsSortedByPrecedence = (0, arrays_1.distinct)(this._keybindingItemsSortedByPrecedence, keybindingItem => KeybindingsEditorModel_1.getId(keybindingItem));
            this._keybindingItems = this._keybindingItemsSortedByPrecedence.slice(0).sort((a, b) => KeybindingsEditorModel_1.compareKeybindingData(a, b));
            return super.resolve();
        }
        static getId(keybindingItem) {
            return keybindingItem.command + (keybindingItem?.keybinding?.getAriaLabel() ?? '') + keybindingItem.when + ((0, types_1.isString)(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.identifier.value);
        }
        static compareKeybindingData(a, b) {
            if (a.keybinding && !b.keybinding) {
                return -1;
            }
            if (b.keybinding && !a.keybinding) {
                return 1;
            }
            if (a.commandLabel && !b.commandLabel) {
                return -1;
            }
            if (b.commandLabel && !a.commandLabel) {
                return 1;
            }
            if (a.commandLabel && b.commandLabel) {
                if (a.commandLabel !== b.commandLabel) {
                    return a.commandLabel.localeCompare(b.commandLabel);
                }
            }
            if (a.command === b.command) {
                return a.keybindingItem.isDefault ? 1 : -1;
            }
            return a.command.localeCompare(b.command);
        }
        static toKeybindingEntry(command, keybindingItem, actions, extensions) {
            const menuCommand = actions_1.MenuRegistry.getCommand(command);
            const editorActionLabel = actions.get(command);
            let source = SOURCE_USER;
            if (keybindingItem.isDefault) {
                const extensionId = keybindingItem.extensionId ?? (keybindingItem.resolvedKeybinding ? undefined : menuCommand?.source?.id);
                source = extensionId ? extensions.get(extensionId) ?? SOURCE_EXTENSION : SOURCE_SYSTEM;
            }
            return {
                keybinding: keybindingItem.resolvedKeybinding,
                keybindingItem,
                command,
                commandLabel: KeybindingsEditorModel_1.getCommandLabel(menuCommand, editorActionLabel),
                commandDefaultLabel: KeybindingsEditorModel_1.getCommandDefaultLabel(menuCommand),
                when: keybindingItem.when ? keybindingItem.when.serialize() : '',
                source
            };
        }
        static getCommandDefaultLabel(menuCommand) {
            if (!platform_1.Language.isDefaultVariant()) {
                if (menuCommand && menuCommand.title && menuCommand.title.original) {
                    const category = menuCommand.category ? menuCommand.category.original : undefined;
                    const title = menuCommand.title.original;
                    return category ? (0, nls_1.localize)('cat.title', "{0}: {1}", category, title) : title;
                }
            }
            return null;
        }
        static getCommandLabel(menuCommand, editorActionLabel) {
            if (menuCommand) {
                const category = menuCommand.category ? typeof menuCommand.category === 'string' ? menuCommand.category : menuCommand.category.value : undefined;
                const title = typeof menuCommand.title === 'string' ? menuCommand.title : menuCommand.title.value;
                return category ? (0, nls_1.localize)('cat.title', "{0}: {1}", category, title) : title;
            }
            if (editorActionLabel) {
                return editorActionLabel;
            }
            return '';
        }
    };
    exports.KeybindingsEditorModel = KeybindingsEditorModel;
    exports.KeybindingsEditorModel = KeybindingsEditorModel = KeybindingsEditorModel_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, extensions_1.IExtensionService)
    ], KeybindingsEditorModel);
    class KeybindingItemMatches {
        constructor(modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch) {
            this.modifierLabels = modifierLabels;
            this.commandIdMatches = null;
            this.commandLabelMatches = null;
            this.commandDefaultLabelMatches = null;
            this.sourceMatches = null;
            this.whenMatches = null;
            this.keybindingMatches = null;
            this.extensionIdMatches = null;
            this.extensionLabelMatches = null;
            if (!completeMatch) {
                this.commandIdMatches = this.matches(searchValue, keybindingItem.command, (0, filters_1.or)(filters_1.matchesWords, filters_1.matchesCamelCase), words);
                this.commandLabelMatches = keybindingItem.commandLabel ? this.matches(searchValue, keybindingItem.commandLabel, (word, wordToMatchAgainst) => (0, filters_1.matchesWords)(word, keybindingItem.commandLabel, true), words) : null;
                this.commandDefaultLabelMatches = keybindingItem.commandDefaultLabel ? this.matches(searchValue, keybindingItem.commandDefaultLabel, (word, wordToMatchAgainst) => (0, filters_1.matchesWords)(word, keybindingItem.commandDefaultLabel, true), words) : null;
                this.whenMatches = keybindingItem.when ? this.matches(null, keybindingItem.when, (0, filters_1.or)(filters_1.matchesWords, filters_1.matchesCamelCase), words) : null;
                if ((0, types_1.isString)(keybindingItem.source)) {
                    this.sourceMatches = this.matches(searchValue, keybindingItem.source, (word, wordToMatchAgainst) => (0, filters_1.matchesWords)(word, keybindingItem.source, true), words);
                }
                else {
                    this.extensionLabelMatches = keybindingItem.source.displayName ? this.matches(searchValue, keybindingItem.source.displayName, (word, wordToMatchAgainst) => (0, filters_1.matchesWords)(word, keybindingItem.commandLabel, true), words) : null;
                }
            }
            this.keybindingMatches = keybindingItem.keybinding ? this.matchesKeybinding(keybindingItem.keybinding, searchValue, keybindingWords, completeMatch) : null;
        }
        matches(searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
            let matches = searchValue ? wordFilter(searchValue, wordToMatchAgainst) : null;
            if (!matches) {
                matches = this.matchesWords(words, wordToMatchAgainst, wordMatchesFilter);
            }
            if (matches) {
                matches = this.filterAndSort(matches);
            }
            return matches;
        }
        matchesWords(words, wordToMatchAgainst, wordMatchesFilter) {
            let matches = [];
            for (const word of words) {
                const wordMatches = wordMatchesFilter(word, wordToMatchAgainst);
                if (wordMatches) {
                    matches = [...(matches || []), ...wordMatches];
                }
                else {
                    matches = null;
                    break;
                }
            }
            return matches;
        }
        filterAndSort(matches) {
            return (0, arrays_1.distinct)(matches, (a => a.start + '.' + a.end)).filter(match => !matches.some(m => !(m.start === match.start && m.end === match.end) && (m.start <= match.start && m.end >= match.end))).sort((a, b) => a.start - b.start);
        }
        matchesKeybinding(keybinding, searchValue, words, completeMatch) {
            const [firstPart, chordPart] = keybinding.getChords();
            const userSettingsLabel = keybinding.getUserSettingsLabel();
            const ariaLabel = keybinding.getAriaLabel();
            const label = keybinding.getLabel();
            if ((userSettingsLabel && strings.compareIgnoreCase(searchValue, userSettingsLabel) === 0)
                || (ariaLabel && strings.compareIgnoreCase(searchValue, ariaLabel) === 0)
                || (label && strings.compareIgnoreCase(searchValue, label) === 0)) {
                return {
                    firstPart: this.createCompleteMatch(firstPart),
                    chordPart: this.createCompleteMatch(chordPart)
                };
            }
            const firstPartMatch = {};
            let chordPartMatch = {};
            const matchedWords = [];
            const firstPartMatchedWords = [];
            let chordPartMatchedWords = [];
            let matchFirstPart = true;
            for (let index = 0; index < words.length; index++) {
                const word = words[index];
                let firstPartMatched = false;
                let chordPartMatched = false;
                matchFirstPart = matchFirstPart && !firstPartMatch.keyCode;
                let matchChordPart = !chordPartMatch.keyCode;
                if (matchFirstPart) {
                    firstPartMatched = this.matchPart(firstPart, firstPartMatch, word, completeMatch);
                    if (firstPartMatch.keyCode) {
                        for (const cordPartMatchedWordIndex of chordPartMatchedWords) {
                            if (firstPartMatchedWords.indexOf(cordPartMatchedWordIndex) === -1) {
                                matchedWords.splice(matchedWords.indexOf(cordPartMatchedWordIndex), 1);
                            }
                        }
                        chordPartMatch = {};
                        chordPartMatchedWords = [];
                        matchChordPart = false;
                    }
                }
                if (matchChordPart) {
                    chordPartMatched = this.matchPart(chordPart, chordPartMatch, word, completeMatch);
                }
                if (firstPartMatched) {
                    firstPartMatchedWords.push(index);
                }
                if (chordPartMatched) {
                    chordPartMatchedWords.push(index);
                }
                if (firstPartMatched || chordPartMatched) {
                    matchedWords.push(index);
                }
                matchFirstPart = matchFirstPart && this.isModifier(word);
            }
            if (matchedWords.length !== words.length) {
                return null;
            }
            if (completeMatch) {
                if (!this.isCompleteMatch(firstPart, firstPartMatch)) {
                    return null;
                }
                if (!(0, types_1.isEmptyObject)(chordPartMatch) && !this.isCompleteMatch(chordPart, chordPartMatch)) {
                    return null;
                }
            }
            return this.hasAnyMatch(firstPartMatch) || this.hasAnyMatch(chordPartMatch) ? { firstPart: firstPartMatch, chordPart: chordPartMatch } : null;
        }
        matchPart(chord, match, word, completeMatch) {
            let matched = false;
            if (this.matchesMetaModifier(chord, word)) {
                matched = true;
                match.metaKey = true;
            }
            if (this.matchesCtrlModifier(chord, word)) {
                matched = true;
                match.ctrlKey = true;
            }
            if (this.matchesShiftModifier(chord, word)) {
                matched = true;
                match.shiftKey = true;
            }
            if (this.matchesAltModifier(chord, word)) {
                matched = true;
                match.altKey = true;
            }
            if (this.matchesKeyCode(chord, word, completeMatch)) {
                match.keyCode = true;
                matched = true;
            }
            return matched;
        }
        matchesKeyCode(chord, word, completeMatch) {
            if (!chord) {
                return false;
            }
            const ariaLabel = chord.keyAriaLabel || '';
            if (completeMatch || ariaLabel.length === 1 || word.length === 1) {
                if (strings.compareIgnoreCase(ariaLabel, word) === 0) {
                    return true;
                }
            }
            else {
                if ((0, filters_1.matchesContiguousSubString)(word, ariaLabel)) {
                    return true;
                }
            }
            return false;
        }
        matchesMetaModifier(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.metaKey) {
                return false;
            }
            return this.wordMatchesMetaModifier(word);
        }
        matchesCtrlModifier(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.ctrlKey) {
                return false;
            }
            return this.wordMatchesCtrlModifier(word);
        }
        matchesShiftModifier(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.shiftKey) {
                return false;
            }
            return this.wordMatchesShiftModifier(word);
        }
        matchesAltModifier(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.altKey) {
                return false;
            }
            return this.wordMatchesAltModifier(word);
        }
        hasAnyMatch(keybindingMatch) {
            return !!keybindingMatch.altKey ||
                !!keybindingMatch.ctrlKey ||
                !!keybindingMatch.metaKey ||
                !!keybindingMatch.shiftKey ||
                !!keybindingMatch.keyCode;
        }
        isCompleteMatch(chord, match) {
            if (!chord) {
                return true;
            }
            if (!match.keyCode) {
                return false;
            }
            if (chord.metaKey && !match.metaKey) {
                return false;
            }
            if (chord.altKey && !match.altKey) {
                return false;
            }
            if (chord.ctrlKey && !match.ctrlKey) {
                return false;
            }
            if (chord.shiftKey && !match.shiftKey) {
                return false;
            }
            return true;
        }
        createCompleteMatch(chord) {
            const match = {};
            if (chord) {
                match.keyCode = true;
                if (chord.metaKey) {
                    match.metaKey = true;
                }
                if (chord.altKey) {
                    match.altKey = true;
                }
                if (chord.ctrlKey) {
                    match.ctrlKey = true;
                }
                if (chord.shiftKey) {
                    match.shiftKey = true;
                }
            }
            return match;
        }
        isModifier(word) {
            if (this.wordMatchesAltModifier(word)) {
                return true;
            }
            if (this.wordMatchesCtrlModifier(word)) {
                return true;
            }
            if (this.wordMatchesMetaModifier(word)) {
                return true;
            }
            if (this.wordMatchesShiftModifier(word)) {
                return true;
            }
            return false;
        }
        wordMatchesAltModifier(word) {
            if (strings.equalsIgnoreCase(this.modifierLabels.ui.altKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.aria.altKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.user.altKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase((0, nls_1.localize)('option', "option"), word)) {
                return true;
            }
            return false;
        }
        wordMatchesCtrlModifier(word) {
            if (strings.equalsIgnoreCase(this.modifierLabels.ui.ctrlKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.aria.ctrlKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.user.ctrlKey, word)) {
                return true;
            }
            return false;
        }
        wordMatchesMetaModifier(word) {
            if (strings.equalsIgnoreCase(this.modifierLabels.ui.metaKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.aria.metaKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.user.metaKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase((0, nls_1.localize)('meta', "meta"), word)) {
                return true;
            }
            return false;
        }
        wordMatchesShiftModifier(word) {
            if (strings.equalsIgnoreCase(this.modifierLabels.ui.shiftKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.aria.shiftKey, word)) {
                return true;
            }
            if (strings.equalsIgnoreCase(this.modifierLabels.user.shiftKey, word)) {
                return true;
            }
            return false;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9wcmVmZXJlbmNlcy9icm93c2VyL2tleWJpbmRpbmdzRWRpdG9yTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CbkYsUUFBQSw0QkFBNEIsR0FBRywyQkFBMkIsQ0FBQztJQUV4RSxNQUFNLGFBQWEsR0FBRyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBUTdDLE1BQU0sVUFBVSxHQUFHLElBQUEsWUFBRSxFQUFDLHVCQUFhLEVBQUUsc0JBQVksRUFBRSxvQ0FBMEIsQ0FBQyxDQUFDO0lBQy9FLE1BQU0sWUFBWSxHQUFHLDZDQUE2QyxDQUFDO0lBQ25FLE1BQU0sZUFBZSxHQUFHLDRCQUE0QixDQUFDO0lBRTlDLElBQU0sc0JBQXNCLDhCQUE1QixNQUFNLHNCQUF1QixTQUFRLHlCQUFXO1FBTXRELFlBQ0MsRUFBbUIsRUFDa0Isa0JBQXNDLEVBQ3ZDLGdCQUFtQztZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQUg2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3ZDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFHdkUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsa0NBQWtDLEdBQUcsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxjQUFjLEdBQUc7Z0JBQ3JCLEVBQUUsRUFBRSxrQ0FBZSxDQUFDLGNBQWMs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