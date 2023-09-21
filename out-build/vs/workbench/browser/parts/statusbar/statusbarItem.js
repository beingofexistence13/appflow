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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/theme/common/themeService", "vs/editor/common/editorCommon", "vs/base/browser/dom", "vs/platform/notification/common/notification", "vs/base/common/types", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/theme/common/iconRegistry", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/htmlContent", "vs/base/browser/touch"], function (require, exports, errorMessage_1, lifecycle_1, simpleIconLabel_1, commands_1, telemetry_1, statusbar_1, themeService_1, editorCommon_1, dom_1, notification_1, types_1, keyboardEvent_1, iconLabels_1, iconRegistry_1, iconLabelHover_1, htmlContent_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eyb = void 0;
    let $eyb = class $eyb extends lifecycle_1.$kc {
        get name() {
            return (0, types_1.$uf)(this.b).name;
        }
        get hasCommand() {
            return typeof this.b?.command !== 'undefined';
        }
        constructor(n, entry, r, s, t, u, w) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.b = undefined;
            this.c = this.B(new lifecycle_1.$lc());
            this.f = this.B(new lifecycle_1.$lc());
            this.g = this.B(new lifecycle_1.$lc());
            this.h = this.B(new lifecycle_1.$lc());
            this.j = this.B(new lifecycle_1.$lc());
            this.m = undefined;
            // Label Container
            this.labelContainer = document.createElement('a');
            this.labelContainer.tabIndex = -1; // allows screen readers to read title, but still prevents tab focus.
            this.labelContainer.setAttribute('role', 'button');
            this.labelContainer.className = 'statusbar-item-label';
            this.B(touch_1.$EP.addTarget(this.labelContainer)); // enable touch
            // Label (with support for progress)
            this.a = new StatusBarCodiconLabel(this.labelContainer);
            this.n.appendChild(this.labelContainer);
            // Beak Container
            this.beakContainer = document.createElement('div');
            this.beakContainer.className = 'status-bar-item-beak-container';
            this.n.appendChild(this.beakContainer);
            this.update(entry);
        }
        update(entry) {
            // Update: Progress
            this.a.showProgress = entry.showProgress ?? false;
            // Update: Text
            if (!this.b || entry.text !== this.b.text) {
                this.a.text = entry.text;
                if (entry.text) {
                    (0, dom_1.$dP)(this.labelContainer);
                }
                else {
                    (0, dom_1.$eP)(this.labelContainer);
                }
            }
            // Update: ARIA label
            //
            // Set the aria label on both elements so screen readers would read
            // the correct thing without duplication #96210
            if (!this.b || entry.ariaLabel !== this.b.ariaLabel) {
                this.n.setAttribute('aria-label', entry.ariaLabel);
                this.labelContainer.setAttribute('aria-label', entry.ariaLabel);
            }
            if (!this.b || entry.role !== this.b.role) {
                this.labelContainer.setAttribute('role', entry.role || 'button');
            }
            // Update: Hover
            if (!this.b || !this.y(this.b, entry)) {
                const hoverContents = (0, htmlContent_1.$Zj)(entry.tooltip) ? { markdown: entry.tooltip, markdownNotSupportedFallback: undefined } : entry.tooltip;
                if (this.m) {
                    this.m.update(hoverContents);
                }
                else {
                    this.m = this.B((0, iconLabelHover_1.$ZP)(this.r, this.n, hoverContents));
                }
            }
            // Update: Command
            if (!this.b || entry.command !== this.b.command) {
                this.g.clear();
                this.h.clear();
                this.j.clear();
                const command = entry.command;
                if (command && (command !== statusbar_1.$9$ || this.m) /* "Show Hover" is only valid when we have a hover */) {
                    this.g.value = (0, dom_1.$nO)(this.labelContainer, dom_1.$3O.CLICK, () => this.z(command));
                    this.h.value = (0, dom_1.$nO)(this.labelContainer, touch_1.EventType.Tap, () => this.z(command));
                    this.j.value = (0, dom_1.$nO)(this.labelContainer, dom_1.$3O.KEY_DOWN, e => {
                        const event = new keyboardEvent_1.$jO(e);
                        if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                            dom_1.$5O.stop(e);
                            this.z(command);
                        }
                    });
                    this.labelContainer.classList.remove('disabled');
                }
                else {
                    this.labelContainer.classList.add('disabled');
                }
            }
            // Update: Beak
            if (!this.b || entry.showBeak !== this.b.showBeak) {
                if (entry.showBeak) {
                    this.n.classList.add('has-beak');
                }
                else {
                    this.n.classList.remove('has-beak');
                }
            }
            const hasBackgroundColor = !!entry.backgroundColor || (entry.kind && entry.kind !== 'standard');
            // Update: Kind
            if (!this.b || entry.kind !== this.b.kind) {
                for (const kind of statusbar_1.$0$) {
                    this.n.classList.remove(`${kind}-kind`);
                }
                if (entry.kind && entry.kind !== 'standard') {
                    this.n.classList.add(`${entry.kind}-kind`);
                }
                this.n.classList.toggle('has-background-color', hasBackgroundColor);
            }
            // Update: Foreground
            if (!this.b || entry.color !== this.b.color) {
                this.C(this.labelContainer, entry.color);
            }
            // Update: Background
            if (!this.b || entry.backgroundColor !== this.b.backgroundColor) {
                this.n.classList.toggle('has-background-color', hasBackgroundColor);
                this.C(this.n, entry.backgroundColor, true);
            }
            // Remember for next round
            this.b = entry;
        }
        y({ tooltip }, { tooltip: otherTooltip }) {
            if (tooltip === undefined) {
                return otherTooltip === undefined;
            }
            if ((0, htmlContent_1.$Zj)(tooltip)) {
                return (0, htmlContent_1.$Zj)(otherTooltip) && (0, htmlContent_1.$1j)(tooltip, otherTooltip);
            }
            return tooltip === otherTooltip;
        }
        async z(command) {
            // Custom command from us: Show tooltip
            if (command === statusbar_1.$9$) {
                this.m?.show(true /* focus */);
            }
            // Any other command is going through command service
            else {
                const id = typeof command === 'string' ? command : command.id;
                const args = typeof command === 'string' ? [] : command.arguments ?? [];
                this.u.publicLog2('workbenchActionExecuted', { id, from: 'status bar' });
                try {
                    await this.s.executeCommand(id, ...args);
                }
                catch (error) {
                    this.t.error((0, errorMessage_1.$mi)(error));
                }
            }
        }
        C(container, color, isBackground) {
            let colorResult = undefined;
            if (isBackground) {
                this.f.clear();
            }
            else {
                this.c.clear();
            }
            if (color) {
                if ((0, editorCommon_1.isThemeColor)(color)) {
                    colorResult = this.w.getColorTheme().getColor(color.id)?.toString();
                    const listener = this.w.onDidColorThemeChange(theme => {
                        const colorValue = theme.getColor(color.id)?.toString();
                        if (isBackground) {
                            container.style.backgroundColor = colorValue ?? '';
                        }
                        else {
                            container.style.color = colorValue ?? '';
                        }
                    });
                    if (isBackground) {
                        this.f.value = listener;
                    }
                    else {
                        this.c.value = listener;
                    }
                }
                else {
                    colorResult = color;
                }
            }
            if (isBackground) {
                container.style.backgroundColor = colorResult ?? '';
            }
            else {
                container.style.color = colorResult ?? '';
            }
        }
    };
    exports.$eyb = $eyb;
    exports.$eyb = $eyb = __decorate([
        __param(3, commands_1.$Fr),
        __param(4, notification_1.$Yu),
        __param(5, telemetry_1.$9k),
        __param(6, themeService_1.$gv)
    ], $eyb);
    class StatusBarCodiconLabel extends simpleIconLabel_1.$LR {
        constructor(f) {
            super(f);
            this.f = f;
            this.b = (0, iconLabels_1.$yQ)(iconRegistry_1.$cv);
            this.c = '';
            this.d = false;
        }
        set showProgress(showProgress) {
            if (this.d !== showProgress) {
                this.d = showProgress;
                this.b = (0, iconLabels_1.$yQ)(showProgress === 'loading' ? iconRegistry_1.$dv : iconRegistry_1.$cv);
                this.text = this.c;
            }
        }
        set text(text) {
            // Progress: insert progress codicon as first element as needed
            // but keep it stable so that the animation does not reset
            if (this.d) {
                // Append as needed
                if (this.f.firstChild !== this.b) {
                    this.f.appendChild(this.b);
                }
                // Remove others
                for (const node of Array.from(this.f.childNodes)) {
                    if (node !== this.b) {
                        node.remove();
                    }
                }
                // If we have text to show, add a space to separate from progress
                let textContent = text ?? '';
                if (textContent) {
                    textContent = ` ${textContent}`;
                }
                // Append new elements
                (0, dom_1.$0O)(this.f, ...(0, iconLabels_1.$xQ)(textContent));
            }
            // No Progress: no special handling
            else {
                super.text = text;
            }
        }
    }
});
//# sourceMappingURL=statusbarItem.js.map