/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/ime", "vs/base/common/lifecycle", "vs/nls!vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybindingResolver"], function (require, exports, arrays, async_1, errors_1, event_1, ime_1, lifecycle_1, nls, keybindingResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ryb = void 0;
    const HIGH_FREQ_COMMANDS = /^(cursor|delete|undo|redo|tab|editor\.action\.clipboard)/;
    class $Ryb extends lifecycle_1.$kc {
        get onDidUpdateKeybindings() {
            return this.a ? this.a.event : event_1.Event.None; // Sinon stubbing walks properties on prototype
        }
        get inChordMode() {
            return this.b.length > 0;
        }
        constructor(n, s, t, u, w) {
            super();
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.a = this.B(new event_1.$fd());
            this.b = [];
            this.c = new async_1.$Rg();
            this.f = null;
            this.g = KeybindingModifierSet.EMPTY;
            this.h = null;
            this.j = new async_1.$Qg();
            this.m = false;
        }
        dispose() {
            super.dispose();
        }
        getDefaultKeybindingsContent() {
            return '';
        }
        toggleLogging() {
            this.m = !this.m;
            return this.m;
        }
        D(str) {
            if (this.m) {
                this.w.info(`[KeybindingService]: ${str}`);
            }
        }
        getDefaultKeybindings() {
            return this.y().getDefaultKeybindings();
        }
        getKeybindings() {
            return this.y().getKeybindings();
        }
        customKeybindingsCount() {
            return 0;
        }
        lookupKeybindings(commandId) {
            return arrays.$Fb(this.y().lookupKeybindings(commandId).map(item => item.resolvedKeybinding));
        }
        lookupKeybinding(commandId, context) {
            const result = this.y().lookupPrimaryKeybinding(commandId, context || this.n);
            if (!result) {
                return undefined;
            }
            return result.resolvedKeybinding;
        }
        dispatchEvent(e, target) {
            return this.I(e, target);
        }
        // TODO@ulugbekna: update namings to align with `_doDispatch`
        // TODO@ulugbekna: this fn doesn't seem to take into account single-modifier keybindings, eg `shift shift`
        softDispatch(e, target) {
            this.D(`/ Soft dispatching keyboard event`);
            const keybinding = this.resolveKeyboardEvent(e);
            if (keybinding.hasMultipleChords()) {
                console.warn('keyboard event should not be mapped to multiple chords');
                return keybindingResolver_1.$ZD;
            }
            const [firstChord,] = keybinding.getDispatchChords();
            if (firstChord === null) {
                // cannot be dispatched, probably only modifier keys
                this.D(`\\ Keyboard event cannot be dispatched`);
                return keybindingResolver_1.$ZD;
            }
            const contextValue = this.n.getContext(target);
            const currentChords = this.b.map((({ keypress }) => keypress));
            return this.y().resolve(contextValue, currentChords, firstChord);
        }
        F() {
            const chordLastInteractedTime = Date.now();
            this.c.cancelAndSet(() => {
                if (!this.z()) {
                    // Focus has been lost => leave chord mode
                    this.H();
                    return;
                }
                if (Date.now() - chordLastInteractedTime > 5000) {
                    // 5 seconds elapsed => leave chord mode
                    this.H();
                }
            }, 500);
        }
        G(firstChord, keypressLabel) {
            this.b.push({ keypress: firstChord, label: keypressLabel });
            switch (this.b.length) {
                case 0:
                    throw (0, errors_1.$6)('impossible');
                case 1:
                    // TODO@ulugbekna: revise this message and the one below (at least, fix terminology)
                    this.f = this.u.status(nls.localize(0, null, keypressLabel));
                    break;
                default: {
                    const fullKeypressLabel = this.b.map(({ label }) => label).join(', ');
                    this.f = this.u.status(nls.localize(1, null, fullKeypressLabel));
                }
            }
            this.F();
            if (ime_1.IME.enabled) {
                ime_1.IME.disable();
            }
        }
        H() {
            if (this.f) {
                this.f.dispose();
                this.f = null;
            }
            this.c.cancel();
            this.b = [];
            ime_1.IME.enable();
        }
        dispatchByUserSettingsLabel(userSettingsLabel, target) {
            this.D(`/ Dispatching keybinding triggered via menu entry accelerator - ${userSettingsLabel}`);
            const keybindings = this.resolveUserBinding(userSettingsLabel);
            if (keybindings.length === 0) {
                this.D(`\\ Could not resolve - ${userSettingsLabel}`);
            }
            else {
                this.L(keybindings[0], target, /*isSingleModiferChord*/ false);
            }
        }
        I(e, target) {
            return this.L(this.resolveKeyboardEvent(e), target, /*isSingleModiferChord*/ false);
        }
        J(e, target) {
            const keybinding = this.resolveKeyboardEvent(e);
            const [singleModifier,] = keybinding.getSingleModifierDispatchChords();
            if (singleModifier) {
                if (this.g.has(singleModifier)) {
                    this.D(`+ Ignoring single modifier ${singleModifier} due to it being pressed together with other keys.`);
                    this.g = KeybindingModifierSet.EMPTY;
                    this.j.cancel();
                    this.h = null;
                    return false;
                }
                this.g = KeybindingModifierSet.EMPTY;
                if (this.h === null) {
                    // we have a valid `singleModifier`, store it for the next keyup, but clear it in 300ms
                    this.D(`+ Storing single modifier for possible chord ${singleModifier}.`);
                    this.h = singleModifier;
                    this.j.cancelAndSet(() => {
                        this.D(`+ Clearing single modifier due to 300ms elapsed.`);
                        this.h = null;
                    }, 300);
                    return false;
                }
                if (singleModifier === this.h) {
                    // bingo!
                    this.D(`/ Dispatching single modifier chord ${singleModifier} ${singleModifier}`);
                    this.j.cancel();
                    this.h = null;
                    return this.L(keybinding, target, /*isSingleModiferChord*/ true);
                }
                this.D(`+ Clearing single modifier due to modifier mismatch: ${this.h} ${singleModifier}`);
                this.j.cancel();
                this.h = null;
                return false;
            }
            // When pressing a modifier and holding it pressed with any other modifier or key combination,
            // the pressed modifiers should no longer be considered for single modifier dispatch.
            const [firstChord,] = keybinding.getChords();
            this.g = new KeybindingModifierSet(firstChord);
            if (this.h !== null) {
                this.D(`+ Clearing single modifier due to other key up.`);
            }
            this.j.cancel();
            this.h = null;
            return false;
        }
        L(userKeypress, target, isSingleModiferChord = false) {
            let shouldPreventDefault = false;
            if (userKeypress.hasMultipleChords()) { // warn - because user can press a single chord at a time
                console.warn('Unexpected keyboard event mapped to multiple chords');
                return false;
            }
            let userPressedChord = null;
            let currentChords = null;
            if (isSingleModiferChord) {
                // The keybinding is the second keypress of a single modifier chord, e.g. "shift shift".
                // A single modifier can only occur when the same modifier is pressed in short sequence,
                // hence we disregard `_currentChord` and use the same modifier instead.
                const [dispatchKeyname,] = userKeypress.getSingleModifierDispatchChords();
                userPressedChord = dispatchKeyname;
                currentChords = dispatchKeyname ? [dispatchKeyname] : []; // TODO@ulugbekna: in the `else` case we assign an empty array - make sure `resolve` can handle an empty array well
            }
            else {
                [userPressedChord,] = userKeypress.getDispatchChords();
                currentChords = this.b.map(({ keypress }) => keypress);
            }
            if (userPressedChord === null) {
                this.D(`\\ Keyboard event cannot be dispatched in keydown phase.`);
                // cannot be dispatched, probably only modifier keys
                return shouldPreventDefault;
            }
            const contextValue = this.n.getContext(target);
            const keypressLabel = userKeypress.getLabel();
            const resolveResult = this.y().resolve(contextValue, currentChords, userPressedChord);
            switch (resolveResult.kind) {
                case 0 /* ResultKind.NoMatchingKb */: {
                    this.w.trace('KeybindingService#dispatch', keypressLabel, `[ No matching keybinding ]`);
                    if (this.inChordMode) {
                        const currentChordsLabel = this.b.map(({ label }) => label).join(', ');
                        this.D(`+ Leaving multi-chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
                        this.u.status(nls.localize(2, null, currentChordsLabel, keypressLabel), { hideAfter: 10 * 1000 /* 10s */ });
                        this.H();
                        shouldPreventDefault = true;
                    }
                    return shouldPreventDefault;
                }
                case 1 /* ResultKind.MoreChordsNeeded */: {
                    this.w.trace('KeybindingService#dispatch', keypressLabel, `[ Several keybindings match - more chords needed ]`);
                    shouldPreventDefault = true;
                    this.G(userPressedChord, keypressLabel);
                    this.D(this.b.length === 1 ? `+ Entering multi-chord mode...` : `+ Continuing multi-chord mode...`);
                    return shouldPreventDefault;
                }
                case 2 /* ResultKind.KbFound */: {
                    this.w.trace('KeybindingService#dispatch', keypressLabel, `[ Will dispatch command ${resolveResult.commandId} ]`);
                    if (resolveResult.commandId === null || resolveResult.commandId === '') {
                        if (this.inChordMode) {
                            const currentChordsLabel = this.b.map(({ label }) => label).join(', ');
                            this.D(`+ Leaving chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
                            this.u.status(nls.localize(3, null, currentChordsLabel, keypressLabel), { hideAfter: 10 * 1000 /* 10s */ });
                            this.H();
                            shouldPreventDefault = true;
                        }
                    }
                    else {
                        if (this.inChordMode) {
                            this.H();
                        }
                        if (!resolveResult.isBubble) {
                            shouldPreventDefault = true;
                        }
                        this.D(`+ Invoking command ${resolveResult.commandId}.`);
                        if (typeof resolveResult.commandArgs === 'undefined') {
                            this.s.executeCommand(resolveResult.commandId).then(undefined, err => this.u.warn(err));
                        }
                        else {
                            this.s.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(undefined, err => this.u.warn(err));
                        }
                        if (!HIGH_FREQ_COMMANDS.test(resolveResult.commandId)) {
                            this.t.publicLog2('workbenchActionExecuted', { id: resolveResult.commandId, from: 'keybinding', detail: userKeypress.getUserSettingsLabel() ?? undefined });
                        }
                    }
                    return shouldPreventDefault;
                }
            }
        }
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey) {
                // ignore ctrl/cmd-combination but not shift/alt-combinatios
                return false;
            }
            // weak check for certain ranges. this is properly implemented in a subclass
            // with access to the KeyboardMapperFactory.
            if ((event.keyCode >= 31 /* KeyCode.KeyA */ && event.keyCode <= 56 /* KeyCode.KeyZ */)
                || (event.keyCode >= 21 /* KeyCode.Digit0 */ && event.keyCode <= 30 /* KeyCode.Digit9 */)) {
                return true;
            }
            return false;
        }
    }
    exports.$Ryb = $Ryb;
    class KeybindingModifierSet {
        static { this.EMPTY = new KeybindingModifierSet(null); }
        constructor(source) {
            this.a = source ? source.ctrlKey : false;
            this.b = source ? source.shiftKey : false;
            this.c = source ? source.altKey : false;
            this.d = source ? source.metaKey : false;
        }
        has(modifier) {
            switch (modifier) {
                case 'ctrl': return this.a;
                case 'shift': return this.b;
                case 'alt': return this.c;
                case 'meta': return this.d;
            }
        }
    }
});
//# sourceMappingURL=abstractKeybindingService.js.map