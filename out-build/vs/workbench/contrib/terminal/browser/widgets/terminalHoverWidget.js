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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/workbench/services/hover/browser/hover", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, widget_1, dom, hover_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TWb = void 0;
    const $ = dom.$;
    let $TWb = class $TWb extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.id = 'hover';
        }
        attach(container) {
            const showLinkHover = this.h.getValue("terminal.integrated.showLinkHover" /* TerminalSettingId.ShowLinkHover */);
            if (!showLinkHover) {
                return;
            }
            const target = new CellHoverTarget(container, this.a);
            const hover = this.g.showHover({
                target,
                content: this.b,
                actions: this.c,
                linkHandler: this.f,
                // .xterm-hover lets xterm know that the hover is part of a link
                additionalClasses: ['xterm-hover']
            });
            if (hover) {
                this.B(hover);
            }
        }
    };
    exports.$TWb = $TWb;
    exports.$TWb = $TWb = __decorate([
        __param(4, hover_1.$zib),
        __param(5, configuration_1.$8h)
    ], $TWb);
    class CellHoverTarget extends widget_1.$IP {
        get targetElements() { return this.b; }
        constructor(container, c) {
            super();
            this.c = c;
            this.b = [];
            this.a = $('div.terminal-hover-targets.xterm-hover');
            const rowCount = this.c.viewportRange.end.y - this.c.viewportRange.start.y + 1;
            // Add top target row
            const width = (this.c.viewportRange.end.y > this.c.viewportRange.start.y ? this.c.terminalDimensions.width - this.c.viewportRange.start.x : this.c.viewportRange.end.x - this.c.viewportRange.start.x + 1) * this.c.cellDimensions.width;
            const topTarget = $('div.terminal-hover-target.hoverHighlight');
            topTarget.style.left = `${this.c.viewportRange.start.x * this.c.cellDimensions.width}px`;
            topTarget.style.bottom = `${(this.c.terminalDimensions.height - this.c.viewportRange.start.y - 1) * this.c.cellDimensions.height}px`;
            topTarget.style.width = `${width}px`;
            topTarget.style.height = `${this.c.cellDimensions.height}px`;
            this.b.push(this.a.appendChild(topTarget));
            // Add middle target rows
            if (rowCount > 2) {
                const middleTarget = $('div.terminal-hover-target.hoverHighlight');
                middleTarget.style.left = `0px`;
                middleTarget.style.bottom = `${(this.c.terminalDimensions.height - this.c.viewportRange.start.y - 1 - (rowCount - 2)) * this.c.cellDimensions.height}px`;
                middleTarget.style.width = `${this.c.terminalDimensions.width * this.c.cellDimensions.width}px`;
                middleTarget.style.height = `${(rowCount - 2) * this.c.cellDimensions.height}px`;
                this.b.push(this.a.appendChild(middleTarget));
            }
            // Add bottom target row
            if (rowCount > 1) {
                const bottomTarget = $('div.terminal-hover-target.hoverHighlight');
                bottomTarget.style.left = `0px`;
                bottomTarget.style.bottom = `${(this.c.terminalDimensions.height - this.c.viewportRange.end.y - 1) * this.c.cellDimensions.height}px`;
                bottomTarget.style.width = `${(this.c.viewportRange.end.x + 1) * this.c.cellDimensions.width}px`;
                bottomTarget.style.height = `${this.c.cellDimensions.height}px`;
                this.b.push(this.a.appendChild(bottomTarget));
            }
            if (this.c.modifierDownCallback && this.c.modifierUpCallback) {
                let down = false;
                this.B(dom.$nO(document, 'keydown', e => {
                    if (e.ctrlKey && !down) {
                        down = true;
                        this.c.modifierDownCallback();
                    }
                }));
                this.B(dom.$nO(document, 'keyup', e => {
                    if (!e.ctrlKey) {
                        down = false;
                        this.c.modifierUpCallback();
                    }
                }));
            }
            container.appendChild(this.a);
            this.B((0, lifecycle_1.$ic)(() => this.a?.remove()));
        }
    }
});
//# sourceMappingURL=terminalHoverWidget.js.map