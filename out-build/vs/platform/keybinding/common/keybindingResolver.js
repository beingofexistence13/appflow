/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1D = exports.$ZD = exports.ResultKind = void 0;
    //#region resolution-result
    var ResultKind;
    (function (ResultKind) {
        /** No keybinding found this sequence of chords */
        ResultKind[ResultKind["NoMatchingKb"] = 0] = "NoMatchingKb";
        /** There're several keybindings that have the given sequence of chords as a prefix */
        ResultKind[ResultKind["MoreChordsNeeded"] = 1] = "MoreChordsNeeded";
        /** A single keybinding found to be dispatched/invoked */
        ResultKind[ResultKind["KbFound"] = 2] = "KbFound";
    })(ResultKind || (exports.ResultKind = ResultKind = {}));
    // util definitions to make working with the above types easier within this module:
    exports.$ZD = { kind: 0 /* ResultKind.NoMatchingKb */ };
    const MoreChordsNeeded = { kind: 1 /* ResultKind.MoreChordsNeeded */ };
    function KbFound(commandId, commandArgs, isBubble) {
        return { kind: 2 /* ResultKind.KbFound */, commandId, commandArgs, isBubble };
    }
    //#endregion
    /**
     * Stores mappings from keybindings to commands and from commands to keybindings.
     * Given a sequence of chords, `resolve`s which keybinding it matches
     */
    class $1D {
        constructor(
        /** built-in and extension-provided keybindings */
        defaultKeybindings, 
        /** user's keybindings */
        overrides, log) {
            this.c = log;
            this.d = defaultKeybindings;
            this.f = new Map();
            for (const defaultKeybinding of defaultKeybindings) {
                const command = defaultKeybinding.command;
                if (command && command.charAt(0) !== '-') {
                    this.f.set(command, true);
                }
            }
            this.g = new Map();
            this.h = new Map();
            this.e = $1D.handleRemovals([].concat(defaultKeybindings).concat(overrides));
            for (let i = 0, len = this.e.length; i < len; i++) {
                const k = this.e[i];
                if (k.chords.length === 0) {
                    // unbound
                    continue;
                }
                // substitute with constants that are registered after startup - https://github.com/microsoft/vscode/issues/174218#issuecomment-1437972127
                const when = k.when?.substituteConstants();
                if (when && when.type === 0 /* ContextKeyExprType.False */) {
                    // when condition is false
                    continue;
                }
                this.l(k.chords[0], k);
            }
        }
        static j(defaultKb, keypress, when) {
            if (keypress) {
                for (let i = 0; i < keypress.length; i++) {
                    if (keypress[i] !== defaultKb.chords[i]) {
                        return false;
                    }
                }
            }
            // `true` means always, as does `undefined`
            // so we will treat `true` === `undefined`
            if (when && when.type !== 1 /* ContextKeyExprType.True */) {
                if (!defaultKb.when) {
                    return false;
                }
                if (!(0, contextkey_1.$Ki)(when, defaultKb.when)) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Looks for rules containing "-commandId" and removes them.
         */
        static handleRemovals(rules) {
            // Do a first pass and construct a hash-map for removals
            const removals = new Map();
            for (let i = 0, len = rules.length; i < len; i++) {
                const rule = rules[i];
                if (rule.command && rule.command.charAt(0) === '-') {
                    const command = rule.command.substring(1);
                    if (!removals.has(command)) {
                        removals.set(command, [rule]);
                    }
                    else {
                        removals.get(command).push(rule);
                    }
                }
            }
            if (removals.size === 0) {
                // There are no removals
                return rules;
            }
            // Do a second pass and keep only non-removed keybindings
            const result = [];
            for (let i = 0, len = rules.length; i < len; i++) {
                const rule = rules[i];
                if (!rule.command || rule.command.length === 0) {
                    result.push(rule);
                    continue;
                }
                if (rule.command.charAt(0) === '-') {
                    continue;
                }
                const commandRemovals = removals.get(rule.command);
                if (!commandRemovals || !rule.isDefault) {
                    result.push(rule);
                    continue;
                }
                let isRemoved = false;
                for (const commandRemoval of commandRemovals) {
                    const when = commandRemoval.when;
                    if (this.j(rule, commandRemoval.chords, when)) {
                        isRemoved = true;
                        break;
                    }
                }
                if (!isRemoved) {
                    result.push(rule);
                    continue;
                }
            }
            return result;
        }
        l(keypress, item) {
            const conflicts = this.g.get(keypress);
            if (typeof conflicts === 'undefined') {
                // There is no conflict so far
                this.g.set(keypress, [item]);
                this.m(item);
                return;
            }
            for (let i = conflicts.length - 1; i >= 0; i--) {
                const conflict = conflicts[i];
                if (conflict.command === item.command) {
                    continue;
                }
                // Test if the shorter keybinding is a prefix of the longer one.
                // If the shorter keybinding is a prefix, it effectively will shadow the longer one and is considered a conflict.
                let isShorterKbPrefix = true;
                for (let i = 1; i < conflict.chords.length && i < item.chords.length; i++) {
                    if (conflict.chords[i] !== item.chords[i]) {
                        // The ith step does not conflict
                        isShorterKbPrefix = false;
                        break;
                    }
                }
                if (!isShorterKbPrefix) {
                    continue;
                }
                if ($1D.whenIsEntirelyIncluded(conflict.when, item.when)) {
                    // `item` completely overwrites `conflict`
                    // Remove conflict from the lookupMap
                    this.n(conflict);
                }
            }
            conflicts.push(item);
            this.m(item);
        }
        m(item) {
            if (!item.command) {
                return;
            }
            let arr = this.h.get(item.command);
            if (typeof arr === 'undefined') {
                arr = [item];
                this.h.set(item.command, arr);
            }
            else {
                arr.push(item);
            }
        }
        n(item) {
            if (!item.command) {
                return;
            }
            const arr = this.h.get(item.command);
            if (typeof arr === 'undefined') {
                return;
            }
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                    return;
                }
            }
        }
        /**
         * Returns true if it is provable `a` implies `b`.
         */
        static whenIsEntirelyIncluded(a, b) {
            if (!b || b.type === 1 /* ContextKeyExprType.True */) {
                return true;
            }
            if (!a || a.type === 1 /* ContextKeyExprType.True */) {
                return false;
            }
            return (0, contextkey_1.$4i)(a, b);
        }
        getDefaultBoundCommands() {
            return this.f;
        }
        getDefaultKeybindings() {
            return this.d;
        }
        getKeybindings() {
            return this.e;
        }
        lookupKeybindings(commandId) {
            const items = this.h.get(commandId);
            if (typeof items === 'undefined' || items.length === 0) {
                return [];
            }
            // Reverse to get the most specific item first
            const result = [];
            let resultLen = 0;
            for (let i = items.length - 1; i >= 0; i--) {
                result[resultLen++] = items[i];
            }
            return result;
        }
        lookupPrimaryKeybinding(commandId, context) {
            const items = this.h.get(commandId);
            if (typeof items === 'undefined' || items.length === 0) {
                return null;
            }
            if (items.length === 1) {
                return items[0];
            }
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                if (context.contextMatchesRules(item.when)) {
                    return item;
                }
            }
            return items[items.length - 1];
        }
        /**
         * Looks up a keybinding trigged as a result of pressing a sequence of chords - `[...currentChords, keypress]`
         *
         * Example: resolving 3 chords pressed sequentially - `cmd+k cmd+p cmd+i`:
         * 	`currentChords = [ 'cmd+k' , 'cmd+p' ]` and `keypress = `cmd+i` - last pressed chord
         */
        resolve(context, currentChords, keypress) {
            const pressedChords = [...currentChords, keypress];
            this.c(`| Resolving ${pressedChords}`);
            const kbCandidates = this.g.get(pressedChords[0]);
            if (kbCandidates === undefined) {
                // No bindings with such 0-th chord
                this.c(`\\ No keybinding entries.`);
                return exports.$ZD;
            }
            let lookupMap = null;
            if (pressedChords.length < 2) {
                lookupMap = kbCandidates;
            }
            else {
                // Fetch all chord bindings for `currentChords`
                lookupMap = [];
                for (let i = 0, len = kbCandidates.length; i < len; i++) {
                    const candidate = kbCandidates[i];
                    if (pressedChords.length > candidate.chords.length) { // # of pressed chords can't be less than # of chords in a keybinding to invoke
                        continue;
                    }
                    let prefixMatches = true;
                    for (let i = 1; i < pressedChords.length; i++) {
                        if (candidate.chords[i] !== pressedChords[i]) {
                            prefixMatches = false;
                            break;
                        }
                    }
                    if (prefixMatches) {
                        lookupMap.push(candidate);
                    }
                }
            }
            // check there's a keybinding with a matching when clause
            const result = this.o(context, lookupMap);
            if (!result) {
                this.c(`\\ From ${lookupMap.length} keybinding entries, no when clauses matched the context.`);
                return exports.$ZD;
            }
            // check we got all chords necessary to be sure a particular keybinding needs to be invoked
            if (pressedChords.length < result.chords.length) {
                // The chord sequence is not complete
                this.c(`\\ From ${lookupMap.length} keybinding entries, awaiting ${result.chords.length - pressedChords.length} more chord(s), when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
                return MoreChordsNeeded;
            }
            this.c(`\\ From ${lookupMap.length} keybinding entries, matched ${result.command}, when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
            return KbFound(result.command, result.commandArgs, result.bubble);
        }
        o(context, matches) {
            for (let i = matches.length - 1; i >= 0; i--) {
                const k = matches[i];
                if (!$1D.p(context, k.when)) {
                    continue;
                }
                return k;
            }
            return null;
        }
        static p(context, rules) {
            if (!rules) {
                return true;
            }
            return rules.evaluate(context);
        }
    }
    exports.$1D = $1D;
    function printWhenExplanation(when) {
        if (!when) {
            return `no when condition`;
        }
        return `${when.serialize()}`;
    }
    function printSourceExplanation(kb) {
        return (kb.extensionId
            ? (kb.isBuiltinExtension ? `built-in extension ${kb.extensionId}` : `user extension ${kb.extensionId}`)
            : (kb.isDefault ? `built-in` : `user`));
    }
});
//# sourceMappingURL=keybindingResolver.js.map