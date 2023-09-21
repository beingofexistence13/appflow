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
define(["require", "exports", "vs/nls!vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/fastDomNode", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/base/common/async", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/keybindings"], function (require, exports, nls, platform_1, lifecycle_1, event_1, keybindingLabel_1, widget_1, dom, aria, keyboardEvent_1, fastDomNode_1, keybinding_1, contextView_1, instantiation_1, colorRegistry_1, preferencesWidgets_1, async_1, contextkey_1, defaultStyles_1) {
    "use strict";
    var $_Bb_1, $aCb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aCb = exports.$_Bb = exports.$$Bb = void 0;
    let $$Bb = class $$Bb extends preferencesWidgets_1.$9Bb {
        constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
            super(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService);
            this.R = this.B(new lifecycle_1.$jc());
            this.S = this.B(new event_1.$fd());
            this.onKeybinding = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onEnter = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onEscape = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onBlur = this.X.event;
            this.B((0, lifecycle_1.$ic)(() => this.stopRecordingKeys()));
            this.P = null;
            this.Q = '';
        }
        clear() {
            this.P = null;
            super.clear();
        }
        startRecordingKeys() {
            this.R.add(dom.$nO(this.inputBox.inputElement, dom.$3O.KEY_DOWN, (e) => this.Y(new keyboardEvent_1.$jO(e))));
            this.R.add(dom.$nO(this.inputBox.inputElement, dom.$3O.BLUR, () => this.X.fire()));
            this.R.add(dom.$nO(this.inputBox.inputElement, dom.$3O.INPUT, () => {
                // Prevent other characters from showing up
                this.setInputValue(this.Q);
            }));
        }
        stopRecordingKeys() {
            this.P = null;
            this.R.clear();
        }
        setInputValue(value) {
            this.Q = value;
            this.inputBox.value = this.Q;
        }
        Y(keyboardEvent) {
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
            const options = this.s;
            if (!options.recordEnter && keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.U.fire();
                return;
            }
            if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this.W.fire();
                return;
            }
            this.Z(keyboardEvent);
        }
        Z(keyboardEvent) {
            const keybinding = this.J.resolveKeyboardEvent(keyboardEvent);
            const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
            const options = this.s;
            if (!this.P) {
                this.P = [];
            }
            // TODO: note that we allow a keybinding "shift shift", but this widget doesn't allow input "shift shift" because the first "shift" will be incomplete - this is _not_ a regression
            const hasIncompleteChord = this.P.length > 0 && this.P[this.P.length - 1].getDispatchChords()[0] === null;
            if (hasIncompleteChord) {
                this.P[this.P.length - 1] = keybinding;
            }
            else {
                if (this.P.length === 2) { // TODO: limit chords # to 2 for now
                    this.P = [];
                }
                this.P.push(keybinding);
            }
            const value = this.P.map((keybinding) => keybinding.getUserSettingsLabel() || '').join(' ');
            this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
            this.inputBox.inputElement.title = info;
            this.S.fire(this.P);
        }
    };
    exports.$$Bb = $$Bb;
    exports.$$Bb = $$Bb = __decorate([
        __param(2, contextView_1.$VZ),
        __param(3, instantiation_1.$Ah),
        __param(4, contextkey_1.$3i),
        __param(5, keybinding_1.$2D)
    ], $$Bb);
    let $_Bb = class $_Bb extends widget_1.$IP {
        static { $_Bb_1 = this; }
        static { this.a = 400; }
        static { this.b = 110; }
        constructor(parent, L) {
            super();
            this.L = L;
            this.s = null;
            this.t = false;
            this.w = this.B(new event_1.$fd());
            this.y = this.B(new event_1.$fd());
            this.onDidChange = this.y.event;
            this.J = this.B(new event_1.$fd());
            this.onShowExistingKeybidings = this.J.event;
            this.g = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.g.setDisplay('none');
            this.g.setClassName('defineKeybindingWidget');
            this.g.setWidth($_Bb_1.a);
            this.g.setHeight($_Bb_1.b);
            const message = nls.localize(0, null);
            dom.$0O(this.g.domNode, dom.$('.message', undefined, message));
            this.g.domNode.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$Aw);
            this.g.domNode.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$Bw);
            this.g.domNode.style.boxShadow = `0 2px 8px ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Kv)}`;
            this.h = this.B(this.L.createInstance($$Bb, this.g.domNode, { ariaLabel: message, history: [], inputBoxStyles: defaultStyles_1.$s2 }));
            this.h.startRecordingKeys();
            this.B(this.h.onKeybinding(keybinding => this.M(keybinding)));
            this.B(this.h.onEnter(() => this.Q()));
            this.B(this.h.onEscape(() => this.P()));
            this.B(this.h.onBlur(() => this.O()));
            this.n = dom.$0O(this.g.domNode, dom.$('.output'));
            this.r = dom.$0O(this.g.domNode, dom.$('.existing'));
            if (parent) {
                dom.$0O(parent, this.g.domNode);
            }
        }
        get domNode() {
            return this.g.domNode;
        }
        define() {
            this.h.clear();
            return async_1.Promises.withAsyncBody(async (c) => {
                if (!this.t) {
                    this.t = true;
                    this.g.setDisplay('block');
                    this.s = null;
                    this.h.setInputValue('');
                    dom.$lO(this.n);
                    dom.$lO(this.r);
                    // Input is not getting focus without timeout in safari
                    // https://github.com/microsoft/vscode/issues/108817
                    await (0, async_1.$Hg)(0);
                    this.h.focus();
                }
                const disposable = this.w.event(() => {
                    c(this.N());
                    disposable.dispose();
                });
            });
        }
        layout(layout) {
            const top = Math.round((layout.height - $_Bb_1.b) / 2);
            this.g.setTop(top);
            const left = Math.round((layout.width - $_Bb_1.a) / 2);
            this.g.setLeft(left);
        }
        printExisting(numberOfExisting) {
            if (numberOfExisting > 0) {
                const existingElement = dom.$('span.existingText');
                const text = numberOfExisting === 1 ? nls.localize(1, null, numberOfExisting) : nls.localize(2, null, numberOfExisting);
                dom.$0O(existingElement, document.createTextNode(text));
                aria.$$P(text);
                this.r.appendChild(existingElement);
                existingElement.onmousedown = (e) => { e.preventDefault(); };
                existingElement.onmouseup = (e) => { e.preventDefault(); };
                existingElement.onclick = () => { this.J.fire(this.N()); };
            }
        }
        M(keybinding) {
            this.s = keybinding;
            dom.$lO(this.n);
            dom.$lO(this.r);
            const firstLabel = new keybindingLabel_1.$TR(this.n, platform_1.OS, defaultStyles_1.$g2);
            firstLabel.set(this.s?.[0] ?? undefined);
            if (this.s) {
                for (let i = 1; i < this.s.length; i++) {
                    this.n.appendChild(document.createTextNode(nls.localize(3, null)));
                    const chordLabel = new keybindingLabel_1.$TR(this.n, platform_1.OS, defaultStyles_1.$g2);
                    chordLabel.set(this.s[i]);
                }
            }
            const label = this.N();
            if (label) {
                this.y.fire(label);
            }
        }
        N() {
            let label = null;
            if (this.s) {
                label = this.s.map(keybinding => keybinding.getUserSettingsLabel()).join(' ');
            }
            return label;
        }
        O() {
            this.s = null;
            this.Q();
        }
        P() {
            if (this.s === null) {
                this.Q();
            }
            else {
                this.s = null;
                this.h.clear();
                dom.$lO(this.n);
                dom.$lO(this.r);
            }
        }
        Q() {
            this.g.setDisplay('none');
            this.t = false;
            this.w.fire();
        }
    };
    exports.$_Bb = $_Bb;
    exports.$_Bb = $_Bb = $_Bb_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $_Bb);
    let $aCb = class $aCb extends lifecycle_1.$kc {
        static { $aCb_1 = this; }
        static { this.a = 'editor.contrib.defineKeybindingWidget'; }
        constructor(f, instantiationService) {
            super();
            this.f = f;
            this.b = this.B(instantiationService.createInstance($_Bb, null));
            this.f.addOverlayWidget(this);
        }
        getId() {
            return $aCb_1.a;
        }
        getDomNode() {
            return this.b.domNode;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        dispose() {
            this.f.removeOverlayWidget(this);
            super.dispose();
        }
        start() {
            if (this.f.hasModel()) {
                this.f.revealPositionInCenterIfOutsideViewport(this.f.getPosition(), 0 /* ScrollType.Smooth */);
            }
            const layoutInfo = this.f.getLayoutInfo();
            this.b.layout(new dom.$BO(layoutInfo.width, layoutInfo.height));
            return this.b.define();
        }
    };
    exports.$aCb = $aCb;
    exports.$aCb = $aCb = $aCb_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $aCb);
});
//# sourceMappingURL=keybindingWidgets.js.map