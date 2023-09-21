/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/keybindingLabels", "vs/base/common/objects", "vs/nls!vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/css!./keybindingLabel"], function (require, exports, dom, keybindingLabels_1, objects_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TR = exports.$SR = void 0;
    const $ = dom.$;
    exports.$SR = {
        keybindingLabelBackground: undefined,
        keybindingLabelForeground: undefined,
        keybindingLabelBorder: undefined,
        keybindingLabelBottomBorder: undefined,
        keybindingLabelShadow: undefined
    };
    class $TR {
        constructor(container, j, options) {
            this.j = j;
            this.e = new Set();
            this.d = options || Object.create(null);
            const labelForeground = this.d.keybindingLabelForeground;
            this.c = dom.$0O(container, $('.monaco-keybinding'));
            if (labelForeground) {
                this.c.style.color = labelForeground;
            }
            this.h = false;
            container.appendChild(this.c);
        }
        get element() {
            return this.c;
        }
        set(keybinding, matches) {
            if (this.h && this.f === keybinding && $TR.q(this.g, matches)) {
                return;
            }
            this.f = keybinding;
            this.g = matches;
            this.k();
        }
        k() {
            this.l();
            if (this.f) {
                const chords = this.f.getChords();
                if (chords[0]) {
                    this.m(this.c, chords[0], this.g ? this.g.firstPart : null);
                }
                for (let i = 1; i < chords.length; i++) {
                    dom.$0O(this.c, $('span.monaco-keybinding-key-chord-separator', undefined, ' '));
                    this.m(this.c, chords[i], this.g ? this.g.chordPart : null);
                }
                const title = (this.d.disableTitle ?? false) ? undefined : this.f.getAriaLabel() || undefined;
                if (title !== undefined) {
                    this.c.title = title;
                }
                else {
                    this.c.removeAttribute('title');
                }
            }
            else if (this.d && this.d.renderUnboundKeybindings) {
                this.o(this.c);
            }
            this.h = true;
        }
        l() {
            dom.$lO(this.c);
            this.e.clear();
        }
        m(parent, chord, match) {
            const modifierLabels = keybindingLabels_1.$OR.modifierLabels[this.j];
            if (chord.ctrlKey) {
                this.n(parent, modifierLabels.ctrlKey, Boolean(match?.ctrlKey), modifierLabels.separator);
            }
            if (chord.shiftKey) {
                this.n(parent, modifierLabels.shiftKey, Boolean(match?.shiftKey), modifierLabels.separator);
            }
            if (chord.altKey) {
                this.n(parent, modifierLabels.altKey, Boolean(match?.altKey), modifierLabels.separator);
            }
            if (chord.metaKey) {
                this.n(parent, modifierLabels.metaKey, Boolean(match?.metaKey), modifierLabels.separator);
            }
            const keyLabel = chord.keyLabel;
            if (keyLabel) {
                this.n(parent, keyLabel, Boolean(match?.keyCode), '');
            }
        }
        n(parent, label, highlight, separator) {
            dom.$0O(parent, this.p(label, highlight ? '.highlight' : ''));
            if (separator) {
                dom.$0O(parent, $('span.monaco-keybinding-key-separator', undefined, separator));
            }
        }
        o(parent) {
            dom.$0O(parent, this.p((0, nls_1.localize)(0, null)));
        }
        p(label, extraClass = '') {
            const keyElement = $('span.monaco-keybinding-key' + extraClass, undefined, label);
            this.e.add(keyElement);
            if (this.d.keybindingLabelBackground) {
                keyElement.style.backgroundColor = this.d.keybindingLabelBackground;
            }
            if (this.d.keybindingLabelBorder) {
                keyElement.style.borderColor = this.d.keybindingLabelBorder;
            }
            if (this.d.keybindingLabelBottomBorder) {
                keyElement.style.borderBottomColor = this.d.keybindingLabelBottomBorder;
            }
            if (this.d.keybindingLabelShadow) {
                keyElement.style.boxShadow = `inset 0 -1px 0 ${this.d.keybindingLabelShadow}`;
            }
            return keyElement;
        }
        static q(a, b) {
            if (a === b || (!a && !b)) {
                return true;
            }
            return !!a && !!b && (0, objects_1.$Zm)(a.firstPart, b.firstPart) && (0, objects_1.$Zm)(a.chordPart, b.chordPart);
        }
    }
    exports.$TR = $TR;
});
//# sourceMappingURL=keybindingLabel.js.map