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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/languagePacks/common/localizedStrings", "vs/platform/log/browser/log"], function (require, exports, dom_1, arrays_1, platform_1, environment_1, files_1, localizedStrings_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F2b = exports.$E2b = void 0;
    let $E2b = class $E2b {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getLogs() {
            return (0, log_1.$Y1b)(this.a, this.b);
        }
        async setValue(selector, text) {
            const element = document.querySelector(selector);
            if (!element) {
                return Promise.reject(new Error(`Element not found: ${selector}`));
            }
            const inputElement = element;
            inputElement.value = text;
            const event = new Event('input', { bubbles: true, cancelable: true });
            inputElement.dispatchEvent(event);
        }
        async isActiveElement(selector) {
            const element = document.querySelector(selector);
            if (element !== document.activeElement) {
                const chain = [];
                let el = document.activeElement;
                while (el) {
                    const tagName = el.tagName;
                    const id = el.id ? `#${el.id}` : '';
                    const classes = (0, arrays_1.$Fb)(el.className.split(/\s+/g).map(c => c.trim())).map(c => `.${c}`).join('');
                    chain.unshift(`${tagName}${id}${classes}`);
                    el = el.parentElement;
                }
                throw new Error(`Active element not found. Current active element is '${chain.join(' > ')}'. Looking for ${selector}`);
            }
            return true;
        }
        async getElements(selector, recursive) {
            const query = document.querySelectorAll(selector);
            const result = [];
            for (let i = 0; i < query.length; i++) {
                const element = query.item(i);
                result.push(this.d(element, recursive));
            }
            return result;
        }
        d(element, recursive) {
            const attributes = Object.create(null);
            for (let j = 0; j < element.attributes.length; j++) {
                const attr = element.attributes.item(j);
                if (attr) {
                    attributes[attr.name] = attr.value;
                }
            }
            const children = [];
            if (recursive) {
                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children.item(i);
                    if (child) {
                        children.push(this.d(child, true));
                    }
                }
            }
            const { left, top } = (0, dom_1.$CO)(element);
            return {
                tagName: element.tagName,
                className: element.className,
                textContent: element.textContent || '',
                attributes,
                children,
                left,
                top
            };
        }
        async getElementXY(selector, xoffset, yoffset) {
            const offset = typeof xoffset === 'number' && typeof yoffset === 'number' ? { x: xoffset, y: yoffset } : undefined;
            return this.e(selector, offset);
        }
        async typeInEditor(selector, text) {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Editor not found: ${selector}`);
            }
            const textarea = element;
            const start = textarea.selectionStart;
            const newStart = start + text.length;
            const value = textarea.value;
            const newValue = value.substr(0, start) + text + value.substr(start);
            textarea.value = newValue;
            textarea.setSelectionRange(newStart, newStart);
            const event = new Event('input', { 'bubbles': true, 'cancelable': true });
            textarea.dispatchEvent(event);
        }
        async getTerminalBuffer(selector) {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Terminal not found: ${selector}`);
            }
            const xterm = element.xterm;
            if (!xterm) {
                throw new Error(`Xterm not found: ${selector}`);
            }
            const lines = [];
            for (let i = 0; i < xterm.buffer.active.length; i++) {
                lines.push(xterm.buffer.active.getLine(i).translateToString(true));
            }
            return lines;
        }
        async writeInTerminal(selector, text) {
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`Element not found: ${selector}`);
            }
            const xterm = element.xterm;
            if (!xterm) {
                throw new Error(`Xterm not found: ${selector}`);
            }
            xterm._core.coreService.triggerDataEvent(text);
        }
        getLocaleInfo() {
            return Promise.resolve({
                language: platform_1.$v,
                locale: platform_1.$w
            });
        }
        getLocalizedStrings() {
            return Promise.resolve({
                open: localizedStrings_1.default.open,
                close: localizedStrings_1.default.close,
                find: localizedStrings_1.default.find
            });
        }
        async e(selector, offset) {
            const element = document.querySelector(selector);
            if (!element) {
                return Promise.reject(new Error(`Element not found: ${selector}`));
            }
            const { left, top } = (0, dom_1.$CO)(element);
            const { width, height } = (0, dom_1.$AO)(element);
            let x, y;
            if (offset) {
                x = left + offset.x;
                y = top + offset.y;
            }
            else {
                x = left + (width / 2);
                y = top + (height / 2);
            }
            x = Math.round(x);
            y = Math.round(y);
            return { x, y };
        }
        async exitApplication() {
            // No-op in web
        }
    };
    exports.$E2b = $E2b;
    exports.$E2b = $E2b = __decorate([
        __param(0, files_1.$6j),
        __param(1, environment_1.$Ih)
    ], $E2b);
    function $F2b(instantiationService) {
        Object.assign(window, { driver: instantiationService.createInstance($E2b) });
    }
    exports.$F2b = $F2b;
});
//# sourceMappingURL=driver.js.map