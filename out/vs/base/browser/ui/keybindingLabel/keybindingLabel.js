/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/keybindingLabels", "vs/base/common/objects", "vs/nls", "vs/css!./keybindingLabel"], function (require, exports, dom, keybindingLabels_1, objects_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingLabel = exports.unthemedKeybindingLabelOptions = void 0;
    const $ = dom.$;
    exports.unthemedKeybindingLabelOptions = {
        keybindingLabelBackground: undefined,
        keybindingLabelForeground: undefined,
        keybindingLabelBorder: undefined,
        keybindingLabelBottomBorder: undefined,
        keybindingLabelShadow: undefined
    };
    class KeybindingLabel {
        constructor(container, os, options) {
            this.os = os;
            this.keyElements = new Set();
            this.options = options || Object.create(null);
            const labelForeground = this.options.keybindingLabelForeground;
            this.domNode = dom.append(container, $('.monaco-keybinding'));
            if (labelForeground) {
                this.domNode.style.color = labelForeground;
            }
            this.didEverRender = false;
            container.appendChild(this.domNode);
        }
        get element() {
            return this.domNode;
        }
        set(keybinding, matches) {
            if (this.didEverRender && this.keybinding === keybinding && KeybindingLabel.areSame(this.matches, matches)) {
                return;
            }
            this.keybinding = keybinding;
            this.matches = matches;
            this.render();
        }
        render() {
            this.clear();
            if (this.keybinding) {
                const chords = this.keybinding.getChords();
                if (chords[0]) {
                    this.renderChord(this.domNode, chords[0], this.matches ? this.matches.firstPart : null);
                }
                for (let i = 1; i < chords.length; i++) {
                    dom.append(this.domNode, $('span.monaco-keybinding-key-chord-separator', undefined, ' '));
                    this.renderChord(this.domNode, chords[i], this.matches ? this.matches.chordPart : null);
                }
                const title = (this.options.disableTitle ?? false) ? undefined : this.keybinding.getAriaLabel() || undefined;
                if (title !== undefined) {
                    this.domNode.title = title;
                }
                else {
                    this.domNode.removeAttribute('title');
                }
            }
            else if (this.options && this.options.renderUnboundKeybindings) {
                this.renderUnbound(this.domNode);
            }
            this.didEverRender = true;
        }
        clear() {
            dom.clearNode(this.domNode);
            this.keyElements.clear();
        }
        renderChord(parent, chord, match) {
            const modifierLabels = keybindingLabels_1.UILabelProvider.modifierLabels[this.os];
            if (chord.ctrlKey) {
                this.renderKey(parent, modifierLabels.ctrlKey, Boolean(match?.ctrlKey), modifierLabels.separator);
            }
            if (chord.shiftKey) {
                this.renderKey(parent, modifierLabels.shiftKey, Boolean(match?.shiftKey), modifierLabels.separator);
            }
            if (chord.altKey) {
                this.renderKey(parent, modifierLabels.altKey, Boolean(match?.altKey), modifierLabels.separator);
            }
            if (chord.metaKey) {
                this.renderKey(parent, modifierLabels.metaKey, Boolean(match?.metaKey), modifierLabels.separator);
            }
            const keyLabel = chord.keyLabel;
            if (keyLabel) {
                this.renderKey(parent, keyLabel, Boolean(match?.keyCode), '');
            }
        }
        renderKey(parent, label, highlight, separator) {
            dom.append(parent, this.createKeyElement(label, highlight ? '.highlight' : ''));
            if (separator) {
                dom.append(parent, $('span.monaco-keybinding-key-separator', undefined, separator));
            }
        }
        renderUnbound(parent) {
            dom.append(parent, this.createKeyElement((0, nls_1.localize)('unbound', "Unbound")));
        }
        createKeyElement(label, extraClass = '') {
            const keyElement = $('span.monaco-keybinding-key' + extraClass, undefined, label);
            this.keyElements.add(keyElement);
            if (this.options.keybindingLabelBackground) {
                keyElement.style.backgroundColor = this.options.keybindingLabelBackground;
            }
            if (this.options.keybindingLabelBorder) {
                keyElement.style.borderColor = this.options.keybindingLabelBorder;
            }
            if (this.options.keybindingLabelBottomBorder) {
                keyElement.style.borderBottomColor = this.options.keybindingLabelBottomBorder;
            }
            if (this.options.keybindingLabelShadow) {
                keyElement.style.boxShadow = `inset 0 -1px 0 ${this.options.keybindingLabelShadow}`;
            }
            return keyElement;
        }
        static areSame(a, b) {
            if (a === b || (!a && !b)) {
                return true;
            }
            return !!a && !!b && (0, objects_1.equals)(a.firstPart, b.firstPart) && (0, objects_1.equals)(a.chordPart, b.chordPart);
        }
    }
    exports.KeybindingLabel = KeybindingLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0xhYmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2tleWJpbmRpbmdMYWJlbC9rZXliaW5kaW5nTGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUErQkgsUUFBQSw4QkFBOEIsR0FBMkI7UUFDckUseUJBQXlCLEVBQUUsU0FBUztRQUNwQyx5QkFBeUIsRUFBRSxTQUFTO1FBQ3BDLHFCQUFxQixFQUFFLFNBQVM7UUFDaEMsMkJBQTJCLEVBQUUsU0FBUztRQUN0QyxxQkFBcUIsRUFBRSxTQUFTO0tBQ2hDLENBQUM7SUFFRixNQUFhLGVBQWU7UUFXM0IsWUFBWSxTQUFzQixFQUFVLEVBQW1CLEVBQUUsT0FBZ0M7WUFBckQsT0FBRSxHQUFGLEVBQUUsQ0FBaUI7WUFOOUMsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztZQU96RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUM7WUFFL0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksZUFBZSxFQUFFO2dCQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDO2FBQzNDO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsQ0FBQztR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