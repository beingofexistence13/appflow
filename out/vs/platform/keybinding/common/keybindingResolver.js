/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingResolver = exports.NoMatchingKb = exports.ResultKind = void 0;
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
    exports.NoMatchingKb = { kind: 0 /* ResultKind.NoMatchingKb */ };
    const MoreChordsNeeded = { kind: 1 /* ResultKind.MoreChordsNeeded */ };
    function KbFound(commandId, commandArgs, isBubble) {
        return { kind: 2 /* ResultKind.KbFound */, commandId, commandArgs, isBubble };
    }
    //#endregion
    /**
     * Stores mappings from keybindings to commands and from commands to keybindings.
     * Given a sequence of chords, `resolve`s which keybinding it matches
     */
    class KeybindingResolver {
        constructor(
        /** built-in and extension-provided keybindings */
        defaultKeybindings, 
        /** user's keybindings */
        overrides, log) {
            this._log = log;
            this._defaultKeybindings = defaultKeybindings;
            this._defaultBoundCommands = new Map();
            for (const defaultKeybinding of defaultKeybindings) {
                const command = defaultKeybinding.command;
                if (command && command.charAt(0) !== '-') {
                    this._defaultBoundCommands.set(command, true);
                }
            }
            this._map = new Map();
            this._lookupMap = new Map();
            this._keybindings = KeybindingResolver.handleRemovals([].concat(defaultKeybindings).concat(overrides));
            for (let i = 0, len = this._keybindings.length; i < len; i++) {
                const k = this._keybindings[i];
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
                this._addKeyPress(k.chords[0], k);
            }
        }
        static _isTargetedForRemoval(defaultKb, keypress, when) {
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
                if (!(0, contextkey_1.expressionsAreEqualWithConstantSubstitution)(when, defaultKb.when)) {
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
                    if (this._isTargetedForRemoval(rule, commandRemoval.chords, when)) {
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
        _addKeyPress(keypress, item) {
            const conflicts = this._map.get(keypress);
            if (typeof conflicts === 'undefined') {
                // There is no conflict so far
                this._map.set(keypress, [item]);
                this._addToLookupMap(item);
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
                if (KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
                    // `item` completely overwrites `conflict`
                    // Remove conflict from the lookupMap
                    this._removeFromLookupMap(conflict);
                }
            }
            conflicts.push(item);
            this._addToLookupMap(item);
        }
        _addToLookupMap(item) {
            if (!item.command) {
                return;
            }
            let arr = this._lookupMap.get(item.command);
            if (typeof arr === 'undefined') {
                arr = [item];
                this._lookupMap.set(item.command, arr);
            }
            else {
                arr.push(item);
            }
        }
        _removeFromLookupMap(item) {
            if (!item.command) {
                return;
            }
            const arr = this._lookupMap.get(item.command);
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
            return (0, contextkey_1.implies)(a, b);
        }
        getDefaultBoundCommands() {
            return this._defaultBoundCommands;
        }
        getDefaultKeybindings() {
            return this._defaultKeybindings;
        }
        getKeybindings() {
            return this._keybindings;
        }
        lookupKeybindings(commandId) {
            const items = this._lookupMap.get(commandId);
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
            const items = this._lookupMap.get(commandId);
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
            this._log(`| Resolving ${pressedChords}`);
            const kbCandidates = this._map.get(pressedChords[0]);
            if (kbCandidates === undefined) {
                // No bindings with such 0-th chord
                this._log(`\\ No keybinding entries.`);
                return exports.NoMatchingKb;
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
            const result = this._findCommand(context, lookupMap);
            if (!result) {
                this._log(`\\ From ${lookupMap.length} keybinding entries, no when clauses matched the context.`);
                return exports.NoMatchingKb;
            }
            // check we got all chords necessary to be sure a particular keybinding needs to be invoked
            if (pressedChords.length < result.chords.length) {
                // The chord sequence is not complete
                this._log(`\\ From ${lookupMap.length} keybinding entries, awaiting ${result.chords.length - pressedChords.length} more chord(s), when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
                return MoreChordsNeeded;
            }
            this._log(`\\ From ${lookupMap.length} keybinding entries, matched ${result.command}, when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
            return KbFound(result.command, result.commandArgs, result.bubble);
        }
        _findCommand(context, matches) {
            for (let i = matches.length - 1; i >= 0; i--) {
                const k = matches[i];
                if (!KeybindingResolver._contextMatchesRules(context, k.when)) {
                    continue;
                }
                return k;
            }
            return null;
        }
        static _contextMatchesRules(context, rules) {
            if (!rules) {
                return true;
            }
            return rules.evaluate(context);
        }
    }
    exports.KeybindingResolver = KeybindingResolver;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0va2V5YmluZGluZy9jb21tb24va2V5YmluZGluZ1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRywyQkFBMkI7SUFFM0IsSUFBa0IsVUFTakI7SUFURCxXQUFrQixVQUFVO1FBQzNCLGtEQUFrRDtRQUNsRCwyREFBWSxDQUFBO1FBRVosc0ZBQXNGO1FBQ3RGLG1FQUFnQixDQUFBO1FBRWhCLHlEQUF5RDtRQUN6RCxpREFBTyxDQUFBO0lBQ1IsQ0FBQyxFQVRpQixVQUFVLDBCQUFWLFVBQVUsUUFTM0I7SUFRRCxtRkFBbUY7SUFFdEUsUUFBQSxZQUFZLEdBQXFCLEVBQUUsSUFBSSxpQ0FBeUIsRUFBRSxDQUFDO0lBQ2hGLE1BQU0sZ0JBQWdCLEdBQXFCLEVBQUUsSUFBSSxxQ0FBNkIsRUFBRSxDQUFDO0lBQ2pGLFNBQVMsT0FBTyxDQUFDLFNBQXdCLEVBQUUsV0FBZ0IsRUFBRSxRQUFpQjtRQUM3RSxPQUFPLEVBQUUsSUFBSSw0QkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxZQUFZO0lBRVo7OztPQUdHO0lBQ0gsTUFBYSxrQkFBa0I7UUFROUI7UUFDQyxrREFBa0Q7UUFDbEQsa0JBQTRDO1FBQzVDLHlCQUF5QjtRQUN6QixTQUFtQyxFQUNuQyxHQUEwQjtZQUUxQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7WUFFOUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1lBQ3hELEtBQUssTUFBTSxpQkFBaUIsSUFBSSxrQkFBa0IsRUFBRTtnQkFDbkQsTUFBTSxPQUFP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