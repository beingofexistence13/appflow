/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/keybindingLabels", "vs/base/common/keybindings"], function (require, exports, errors_1, keybindingLabels_1, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Db = void 0;
    class $$Db extends keybindings_1.$Cq {
        constructor(os, chords) {
            super();
            if (chords.length === 0) {
                throw (0, errors_1.$5)(`chords`);
            }
            this.c = os;
            this.d = chords;
        }
        getLabel() {
            return keybindingLabels_1.$OR.toLabel(this.c, this.d, (keybinding) => this.f(keybinding));
        }
        getAriaLabel() {
            return keybindingLabels_1.$PR.toLabel(this.c, this.d, (keybinding) => this.g(keybinding));
        }
        getElectronAccelerator() {
            if (this.d.length > 1) {
                // [Electron Accelerators] Electron cannot handle chords
                return null;
            }
            if (this.d[0].isDuplicateModifierCase()) {
                // [Electron Accelerators] Electron cannot handle modifier only keybindings
                // e.g. "shift shift"
                return null;
            }
            return keybindingLabels_1.$QR.toLabel(this.c, this.d, (keybinding) => this.h(keybinding));
        }
        getUserSettingsLabel() {
            return keybindingLabels_1.$RR.toLabel(this.c, this.d, (keybinding) => this.l(keybinding));
        }
        isWYSIWYG() {
            return this.d.every((keybinding) => this.m(keybinding));
        }
        hasMultipleChords() {
            return (this.d.length > 1);
        }
        getChords() {
            return this.d.map((keybinding) => this.e(keybinding));
        }
        e(keybinding) {
            return new keybindings_1.$Bq(keybinding.ctrlKey, keybinding.shiftKey, keybinding.altKey, keybinding.metaKey, this.f(keybinding), this.g(keybinding));
        }
        getDispatchChords() {
            return this.d.map((keybinding) => this.n(keybinding));
        }
        getSingleModifierDispatchChords() {
            return this.d.map((keybinding) => this.o(keybinding));
        }
    }
    exports.$$Db = $$Db;
});
//# sourceMappingURL=baseResolvedKeybinding.js.map