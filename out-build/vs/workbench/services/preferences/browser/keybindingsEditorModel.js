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
define(["require", "exports", "vs/nls!vs/workbench/services/preferences/browser/keybindingsEditorModel", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/platform", "vs/base/common/filters", "vs/base/common/keybindingLabels", "vs/platform/actions/common/actions", "vs/workbench/common/editor/editorModel", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/workbench/services/keybinding/browser/unboundCommands", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions"], function (require, exports, nls_1, arrays_1, strings, platform_1, filters_1, keybindingLabels_1, actions_1, editorModel_1, keybinding_1, resolvedKeybindingItem_1, unboundCommands_1, types_1, extensions_1, extensions_2) {
    "use strict";
    var $Cyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cyb = exports.$Byb = void 0;
    exports.$Byb = 'keybinding.entry.template';
    const SOURCE_SYSTEM = (0, nls_1.localize)(0, null);
    const SOURCE_EXTENSION = (0, nls_1.localize)(1, null);
    const SOURCE_USER = (0, nls_1.localize)(2, null);
    const wordFilter = (0, filters_1.or)(filters_1.$yj, filters_1.$Dj, filters_1.$zj);
    const SOURCE_REGEX = /@source:\s*(user|default|system|extension)/i;
    const EXTENSION_REGEX = /@ext:\s*((".+")|([^\s]+))/i;
    let $Cyb = $Cyb_1 = class $Cyb extends editorModel_1.$xA {
        constructor(os, r, s) {
            super();
            this.r = r;
            this.s = s;
            this.c = [];
            this.g = [];
            this.n = {
                ui: keybindingLabels_1.$OR.modifierLabels[os],
                aria: keybindingLabels_1.$PR.modifierLabels[os],
                user: keybindingLabels_1.$RR.modifierLabels[os]
            };
        }
        fetch(searchValue, sortByPrecedence = false) {
            let keybindingItems = sortByPrecedence ? this.g : this.c;
            const commandIdMatches = /@command:\s*(.+)/i.exec(searchValue);
            if (commandIdMatches && commandIdMatches[1]) {
                return keybindingItems.filter(k => k.command === commandIdMatches[1])
                    .map(keybindingItem => ({ id: $Cyb_1.z(keybindingItem), keybindingItem, templateId: exports.$Byb }));
            }
            if (SOURCE_REGEX.test(searchValue)) {
                keybindingItems = this.t(keybindingItems, searchValue);
                searchValue = searchValue.replace(SOURCE_REGEX, '');
            }
            else {
                const extensionMatches = EXTENSION_REGEX.exec(searchValue);
                if (extensionMatches && (extensionMatches[2] || extensionMatches[3])) {
                    const extensionId = extensionMatches[2] ? extensionMatches[2].substring(1, extensionMatches[2].length - 1) : extensionMatches[3];
                    keybindingItems = this.u(keybindingItems, extensionId);
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
                return keybindingItems.map(keybindingItem => ({ id: $Cyb_1.z(keybindingItem), keybindingItem, templateId: exports.$Byb }));
            }
            return this.w(keybindingItems, searchValue);
        }
        t(keybindingItems, searchValue) {
            if (/@source:\s*default/i.test(searchValue) || /@source:\s*system/i.test(searchValue)) {
                return keybindingItems.filter(k => k.source === SOURCE_SYSTEM);
            }
            if (/@source:\s*user/i.test(searchValue)) {
                return keybindingItems.filter(k => k.source === SOURCE_USER);
            }
            if (/@source:\s*extension/i.test(searchValue)) {
                return keybindingItems.filter(k => !(0, types_1.$jf)(k.source) || k.source === SOURCE_EXTENSION);
            }
            return keybindingItems;
        }
        u(keybindingItems, extension) {
            extension = extension.toLowerCase().trim();
            return keybindingItems.filter(k => !(0, types_1.$jf)(k.source) && (extensions_2.$Vl.equals(k.source.identifier, extension) || k.source.displayName?.toLowerCase() === extension.toLowerCase()));
        }
        w(keybindingItems, searchValue) {
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
            const keybindingWords = this.y(words);
            for (const keybindingItem of keybindingItems) {
                const keybindingMatches = new KeybindingItemMatches(this.n, keybindingItem, searchValue, words, keybindingWords, completeMatch);
                if (keybindingMatches.commandIdMatches
                    || keybindingMatches.commandLabelMatches
                    || keybindingMatches.commandDefaultLabelMatches
                    || keybindingMatches.sourceMatches
                    || keybindingMatches.whenMatches
                    || keybindingMatches.keybindingMatches
                    || keybindingMatches.extensionIdMatches
                    || keybindingMatches.extensionLabelMatches) {
                    result.push({
                        id: $Cyb_1.z(keybindingItem),
                        templateId: exports.$Byb,
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
        y(wordsSeparatedBySpaces) {
            const result = [];
            for (const word of wordsSeparatedBySpaces) {
                result.push(...(0, arrays_1.$Fb)(word.split('+')));
            }
            return result;
        }
        async resolve(actionLabels = new Map()) {
            const extensions = new extensions_2.$Xl();
            for (const extension of this.s.extensions) {
                extensions.set(extension.identifier, extension);
            }
            this.g = [];
            const boundCommands = new Map();
            for (const keybinding of this.r.getKeybindings()) {
                if (keybinding.command) { // Skip keybindings without commands
                    this.g.push($Cyb_1.D(keybinding.command, keybinding, actionLabels, extensions));
                    boundCommands.set(keybinding.command, true);
                }
            }
            const commandsWithDefaultKeybindings = this.r.getDefaultKeybindings().map(keybinding => keybinding.command);
            for (const command of (0, unboundCommands_1.$Ayb)(boundCommands)) {
                const keybindingItem = new resolvedKeybindingItem_1.$XD(undefined, command, null, undefined, commandsWithDefaultKeybindings.indexOf(command) === -1, null, false);
                this.g.push($Cyb_1.D(command, keybindingItem, actionLabels, extensions));
            }
            this.g = (0, arrays_1.$Kb)(this.g, keybindingItem => $Cyb_1.z(keybindingItem));
            this.c = this.g.slice(0).sort((a, b) => $Cyb_1.C(a, b));
            return super.resolve();
        }
        static z(keybindingItem) {
            return keybindingItem.command + (keybindingItem?.keybinding?.getAriaLabel() ?? '') + keybindingItem.when + ((0, types_1.$jf)(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.identifier.value);
        }
        static C(a, b) {
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
        static D(command, keybindingItem, actions, extensions) {
            const menuCommand = actions_1.$Tu.getCommand(command);
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
                commandLabel: $Cyb_1.G(menuCommand, editorActionLabel),
                commandDefaultLabel: $Cyb_1.F(menuCommand),
                when: keybindingItem.when ? keybindingItem.when.serialize() : '',
                source
            };
        }
        static F(menuCommand) {
            if (!platform_1.Language.isDefaultVariant()) {
                if (menuCommand && menuCommand.title && menuCommand.title.original) {
                    const category = menuCommand.category ? menuCommand.category.original : undefined;
                    const title = menuCommand.title.original;
                    return category ? (0, nls_1.localize)(3, null, category, title) : title;
                }
            }
            return null;
        }
        static G(menuCommand, editorActionLabel) {
            if (menuCommand) {
                const category = menuCommand.category ? typeof menuCommand.category === 'string' ? menuCommand.category : menuCommand.category.value : undefined;
                const title = typeof menuCommand.title === 'string' ? menuCommand.title : menuCommand.title.value;
                return category ? (0, nls_1.localize)(4, null, category, title) : title;
            }
            if (editorActionLabel) {
                return editorActionLabel;
            }
            return '';
        }
    };
    exports.$Cyb = $Cyb;
    exports.$Cyb = $Cyb = $Cyb_1 = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, extensions_1.$MF)
    ], $Cyb);
    class KeybindingItemMatches {
        constructor(c, keybindingItem, searchValue, words, keybindingWords, completeMatch) {
            this.c = c;
            this.commandIdMatches = null;
            this.commandLabelMatches = null;
            this.commandDefaultLabelMatches = null;
            this.sourceMatches = null;
            this.whenMatches = null;
            this.keybindingMatches = null;
            this.extensionIdMatches = null;
            this.extensionLabelMatches = null;
            if (!completeMatch) {
                this.commandIdMatches = this.d(searchValue, keybindingItem.command, (0, filters_1.or)(filters_1.$Dj, filters_1.$Cj), words);
                this.commandLabelMatches = keybindingItem.commandLabel ? this.d(searchValue, keybindingItem.commandLabel, (word, wordToMatchAgainst) => (0, filters_1.$Dj)(word, keybindingItem.commandLabel, true), words) : null;
                this.commandDefaultLabelMatches = keybindingItem.commandDefaultLabel ? this.d(searchValue, keybindingItem.commandDefaultLabel, (word, wordToMatchAgainst) => (0, filters_1.$Dj)(word, keybindingItem.commandDefaultLabel, true), words) : null;
                this.whenMatches = keybindingItem.when ? this.d(null, keybindingItem.when, (0, filters_1.or)(filters_1.$Dj, filters_1.$Cj), words) : null;
                if ((0, types_1.$jf)(keybindingItem.source)) {
                    this.sourceMatches = this.d(searchValue, keybindingItem.source, (word, wordToMatchAgainst) => (0, filters_1.$Dj)(word, keybindingItem.source, true), words);
                }
                else {
                    this.extensionLabelMatches = keybindingItem.source.displayName ? this.d(searchValue, keybindingItem.source.displayName, (word, wordToMatchAgainst) => (0, filters_1.$Dj)(word, keybindingItem.commandLabel, true), words) : null;
                }
            }
            this.keybindingMatches = keybindingItem.keybinding ? this.g(keybindingItem.keybinding, searchValue, keybindingWords, completeMatch) : null;
        }
        d(searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
            let matches = searchValue ? wordFilter(searchValue, wordToMatchAgainst) : null;
            if (!matches) {
                matches = this.e(words, wordToMatchAgainst, wordMatchesFilter);
            }
            if (matches) {
                matches = this.f(matches);
            }
            return matches;
        }
        e(words, wordToMatchAgainst, wordMatchesFilter) {
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
        f(matches) {
            return (0, arrays_1.$Kb)(matches, (a => a.start + '.' + a.end)).filter(match => !matches.some(m => !(m.start === match.start && m.end === match.end) && (m.start <= match.start && m.end >= match.end))).sort((a, b) => a.start - b.start);
        }
        g(keybinding, searchValue, words, completeMatch) {
            const [firstPart, chordPart] = keybinding.getChords();
            const userSettingsLabel = keybinding.getUserSettingsLabel();
            const ariaLabel = keybinding.getAriaLabel();
            const label = keybinding.getLabel();
            if ((userSettingsLabel && strings.$He(searchValue, userSettingsLabel) === 0)
                || (ariaLabel && strings.$He(searchValue, ariaLabel) === 0)
                || (label && strings.$He(searchValue, label) === 0)) {
                return {
                    firstPart: this.r(firstPart),
                    chordPart: this.r(chordPart)
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
                    firstPartMatched = this.h(firstPart, firstPartMatch, word, completeMatch);
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
                    chordPartMatched = this.h(chordPart, chordPartMatch, word, completeMatch);
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
                matchFirstPart = matchFirstPart && this.s(word);
            }
            if (matchedWords.length !== words.length) {
                return null;
            }
            if (completeMatch) {
                if (!this.q(firstPart, firstPartMatch)) {
                    return null;
                }
                if (!(0, types_1.$wf)(chordPartMatch) && !this.q(chordPart, chordPartMatch)) {
                    return null;
                }
            }
            return this.p(firstPartMatch) || this.p(chordPartMatch) ? { firstPart: firstPartMatch, chordPart: chordPartMatch } : null;
        }
        h(chord, match, word, completeMatch) {
            let matched = false;
            if (this.j(chord, word)) {
                matched = true;
                match.metaKey = true;
            }
            if (this.l(chord, word)) {
                matched = true;
                match.ctrlKey = true;
            }
            if (this.n(chord, word)) {
                matched = true;
                match.shiftKey = true;
            }
            if (this.o(chord, word)) {
                matched = true;
                match.altKey = true;
            }
            if (this.i(chord, word, completeMatch)) {
                match.keyCode = true;
                matched = true;
            }
            return matched;
        }
        i(chord, word, completeMatch) {
            if (!chord) {
                return false;
            }
            const ariaLabel = chord.keyAriaLabel || '';
            if (completeMatch || ariaLabel.length === 1 || word.length === 1) {
                if (strings.$He(ariaLabel, word) === 0) {
                    return true;
                }
            }
            else {
                if ((0, filters_1.$zj)(word, ariaLabel)) {
                    return true;
                }
            }
            return false;
        }
        j(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.metaKey) {
                return false;
            }
            return this.v(word);
        }
        l(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.ctrlKey) {
                return false;
            }
            return this.u(word);
        }
        n(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.shiftKey) {
                return false;
            }
            return this.w(word);
        }
        o(chord, word) {
            if (!chord) {
                return false;
            }
            if (!chord.altKey) {
                return false;
            }
            return this.t(word);
        }
        p(keybindingMatch) {
            return !!keybindingMatch.altKey ||
                !!keybindingMatch.ctrlKey ||
                !!keybindingMatch.metaKey ||
                !!keybindingMatch.shiftKey ||
                !!keybindingMatch.keyCode;
        }
        q(chord, match) {
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
        r(chord) {
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
        s(word) {
            if (this.t(word)) {
                return true;
            }
            if (this.u(word)) {
                return true;
            }
            if (this.v(word)) {
                return true;
            }
            if (this.w(word)) {
                return true;
            }
            return false;
        }
        t(word) {
            if (strings.$Me(this.c.ui.altKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.aria.altKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.user.altKey, word)) {
                return true;
            }
            if (strings.$Me((0, nls_1.localize)(5, null), word)) {
                return true;
            }
            return false;
        }
        u(word) {
            if (strings.$Me(this.c.ui.ctrlKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.aria.ctrlKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.user.ctrlKey, word)) {
                return true;
            }
            return false;
        }
        v(word) {
            if (strings.$Me(this.c.ui.metaKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.aria.metaKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.user.metaKey, word)) {
                return true;
            }
            if (strings.$Me((0, nls_1.localize)(6, null), word)) {
                return true;
            }
            return false;
        }
        w(word) {
            if (strings.$Me(this.c.ui.shiftKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.aria.shiftKey, word)) {
                return true;
            }
            if (strings.$Me(this.c.user.shiftKey, word)) {
                return true;
            }
            return false;
        }
    }
});
//# sourceMappingURL=keybindingsEditorModel.js.map