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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/model/utils", "vs/editor/contrib/codeAction/browser/codeAction", "vs/nls!vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/platform/keybinding/common/keybinding", "vs/css!./lightBulbWidget"], function (require, exports, dom, touch_1, codicons_1, event_1, lifecycle_1, themables_1, utils_1, codeAction_1, nls, keybinding_1) {
    "use strict";
    var $J2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J2 = void 0;
    var LightBulbState;
    (function (LightBulbState) {
        let Type;
        (function (Type) {
            Type[Type["Hidden"] = 0] = "Hidden";
            Type[Type["Showing"] = 1] = "Showing";
        })(Type = LightBulbState.Type || (LightBulbState.Type = {}));
        LightBulbState.Hidden = { type: 0 /* Type.Hidden */ };
        class Showing {
            constructor(actions, trigger, editorPosition, widgetPosition) {
                this.actions = actions;
                this.trigger = trigger;
                this.editorPosition = editorPosition;
                this.widgetPosition = widgetPosition;
                this.type = 1 /* Type.Showing */;
            }
        }
        LightBulbState.Showing = Showing;
    })(LightBulbState || (LightBulbState = {}));
    let $J2 = class $J2 extends lifecycle_1.$kc {
        static { $J2_1 = this; }
        static { this.ID = 'editor.contrib.lightbulbWidget'; }
        static { this.a = [0 /* ContentWidgetPositionPreference.EXACT */]; }
        constructor(j, keybindingService) {
            super();
            this.j = j;
            this.c = this.B(new event_1.$fd());
            this.onClick = this.c.event;
            this.f = LightBulbState.Hidden;
            this.b = dom.$('div.lightBulbWidget');
            this.B(touch_1.$EP.ignoreTarget(this.b));
            this.j.addContentWidget(this);
            this.B(this.j.onDidChangeModelContent(_ => {
                // cancel when the line in question has been removed
                const editorModel = this.j.getModel();
                if (this.m.type !== 1 /* LightBulbState.Type.Showing */ || !editorModel || this.m.editorPosition.lineNumber >= editorModel.getLineCount()) {
                    this.hide();
                }
            }));
            this.B(dom.$pO(this.b, e => {
                if (this.m.type !== 1 /* LightBulbState.Type.Showing */) {
                    return;
                }
                // Make sure that focus / cursor location is not lost when clicking widget icon
                this.j.focus();
                e.preventDefault();
                // a bit of extra work to make sure the menu
                // doesn't cover the line-text
                const { top, height } = dom.$FO(this.b);
                const lineHeight = this.j.getOption(66 /* EditorOption.lineHeight */);
                let pad = Math.floor(lineHeight / 3);
                if (this.m.widgetPosition.position !== null && this.m.widgetPosition.position.lineNumber < this.m.editorPosition.lineNumber) {
                    pad += lineHeight;
                }
                this.c.fire({
                    x: e.posx,
                    y: top + height + pad,
                    actions: this.m.actions,
                    trigger: this.m.trigger,
                });
            }));
            this.B(dom.$nO(this.b, 'mouseenter', (e) => {
                if ((e.buttons & 1) !== 1) {
                    return;
                }
                // mouse enters lightbulb while the primary/left button
                // is being pressed -> hide the lightbulb
                this.hide();
            }));
            this.B(this.j.onDidChangeConfiguration(e => {
                // hide when told to do so
                if (e.hasChanged(64 /* EditorOption.lightbulb */) && !this.j.getOption(64 /* EditorOption.lightbulb */).enabled) {
                    this.hide();
                }
            }));
            this.B(event_1.Event.runAndSubscribe(keybindingService.onDidUpdateKeybindings, () => {
                this.g = keybindingService.lookupKeybinding(codeAction_1.$C1)?.getLabel() ?? undefined;
                this.h = keybindingService.lookupKeybinding(codeAction_1.$B1)?.getLabel() ?? undefined;
                this.n();
            }));
        }
        dispose() {
            super.dispose();
            this.j.removeContentWidget(this);
        }
        getId() {
            return 'LightBulbWidget';
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return this.f.type === 1 /* LightBulbState.Type.Showing */ ? this.f.widgetPosition : null;
        }
        update(actions, trigger, atPosition) {
            if (actions.validActions.length <= 0) {
                return this.hide();
            }
            const options = this.j.getOptions();
            if (!options.get(64 /* EditorOption.lightbulb */).enabled) {
                return this.hide();
            }
            const model = this.j.getModel();
            if (!model) {
                return this.hide();
            }
            const { lineNumber, column } = model.validatePosition(atPosition);
            const tabSize = model.getOptions().tabSize;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const lineContent = model.getLineContent(lineNumber);
            const indent = (0, utils_1.$XB)(lineContent, tabSize);
            const lineHasSpace = fontInfo.spaceWidth * indent > 22;
            const isFolded = (lineNumber) => {
                return lineNumber > 2 && this.j.getTopForLineNumber(lineNumber) === this.j.getTopForLineNumber(lineNumber - 1);
            };
            let effectiveLineNumber = lineNumber;
            if (!lineHasSpace) {
                if (lineNumber > 1 && !isFolded(lineNumber - 1)) {
                    effectiveLineNumber -= 1;
                }
                else if (!isFolded(lineNumber + 1)) {
                    effectiveLineNumber += 1;
                }
                else if (column * fontInfo.spaceWidth < 22) {
                    // cannot show lightbulb above/below and showing
                    // it inline would overlay the cursor...
                    return this.hide();
                }
            }
            this.m = new LightBulbState.Showing(actions, trigger, atPosition, {
                position: { lineNumber: effectiveLineNumber, column: 1 },
                preference: $J2_1.a
            });
            this.j.layoutContentWidget(this);
        }
        hide() {
            if (this.m === LightBulbState.Hidden) {
                return;
            }
            this.m = LightBulbState.Hidden;
            this.j.layoutContentWidget(this);
        }
        get m() { return this.f; }
        set m(value) {
            this.f = value;
            this.n();
        }
        n() {
            if (this.m.type === 1 /* LightBulbState.Type.Showing */ && this.m.actions.hasAutoFix) {
                // update icon
                this.b.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.lightBulb));
                this.b.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.lightbulbAutofix));
                if (this.g) {
                    this.r = nls.localize(0, null, this.g);
                    return;
                }
            }
            // update icon
            this.b.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.lightbulbAutofix));
            this.b.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.lightBulb));
            if (this.h) {
                this.r = nls.localize(1, null, this.h);
            }
            else {
                this.r = nls.localize(2, null);
            }
        }
        set r(value) {
            this.b.title = value;
        }
    };
    exports.$J2 = $J2;
    exports.$J2 = $J2 = $J2_1 = __decorate([
        __param(1, keybinding_1.$2D)
    ], $J2);
});
//# sourceMappingURL=lightBulbWidget.js.map