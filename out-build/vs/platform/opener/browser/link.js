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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/css!./link"], function (require, exports, dom_1, event_1, keyboardEvent_1, touch_1, event_2, lifecycle_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$40 = void 0;
    let $40 = class $40 extends lifecycle_1.$kc {
        get enabled() {
            return this.b;
        }
        set enabled(enabled) {
            if (enabled) {
                this.a.setAttribute('aria-disabled', 'false');
                this.a.tabIndex = 0;
                this.a.style.pointerEvents = 'auto';
                this.a.style.opacity = '1';
                this.a.style.cursor = 'pointer';
                this.b = false;
            }
            else {
                this.a.setAttribute('aria-disabled', 'true');
                this.a.tabIndex = -1;
                this.a.style.pointerEvents = 'none';
                this.a.style.opacity = '0.4';
                this.a.style.cursor = 'default';
                this.b = true;
            }
            this.b = enabled;
        }
        set link(link) {
            if (typeof link.label === 'string') {
                this.a.textContent = link.label;
            }
            else {
                (0, dom_1.$lO)(this.a);
                this.a.appendChild(link.label);
            }
            this.a.href = link.href;
            if (typeof link.tabIndex !== 'undefined') {
                this.a.tabIndex = link.tabIndex;
            }
            if (typeof link.title !== 'undefined') {
                this.a.title = link.title;
            }
            this.c = link;
        }
        constructor(container, c, options = {}, openerService) {
            super();
            this.c = c;
            this.b = true;
            this.a = (0, dom_1.$0O)(container, (0, dom_1.$)('a.monaco-link', {
                tabIndex: c.tabIndex ?? 0,
                href: c.href,
                title: c.title
            }, c.label));
            this.a.setAttribute('role', 'button');
            const onClickEmitter = this.B(new event_1.$9P(this.a, 'click'));
            const onKeyPress = this.B(new event_1.$9P(this.a, 'keypress'));
            const onEnterPress = event_2.Event.chain(onKeyPress.event, $ => $.map(e => new keyboardEvent_1.$jO(e))
                .filter(e => e.keyCode === 3 /* KeyCode.Enter */));
            const onTap = this.B(new event_1.$9P(this.a, touch_1.EventType.Tap)).event;
            this.B(touch_1.$EP.addTarget(this.a));
            const onOpen = event_2.Event.any(onClickEmitter.event, onEnterPress, onTap);
            this.B(onOpen(e => {
                if (!this.enabled) {
                    return;
                }
                dom_1.$5O.stop(e, true);
                if (options?.opener) {
                    options.opener(this.c.href);
                }
                else {
                    openerService.open(this.c.href, { allowCommands: true });
                }
            }));
            this.enabled = true;
        }
    };
    exports.$40 = $40;
    exports.$40 = $40 = __decorate([
        __param(3, opener_1.$NT)
    ], $40);
});
//# sourceMappingURL=link.js.map