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
    exports.registerWindowDriver = exports.BrowserWindowDriver = void 0;
    let BrowserWindowDriver = class BrowserWindowDriver {
        constructor(fileService, environmentService) {
            this.fileService = fileService;
            this.environmentService = environmentService;
        }
        async getLogs() {
            return (0, log_1.getLogs)(this.fileService, this.environmentService);
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
                    const classes = (0, arrays_1.coalesce)(el.className.split(/\s+/g).map(c => c.trim())).map(c => `.${c}`).join('');
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
                result.push(this.serializeElement(element, recursive));
            }
            return result;
        }
        serializeElement(element, recursive) {
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
                        children.push(this.serializeElement(child, true));
                    }
                }
            }
            const { left, top } = (0, dom_1.getTopLeftOffset)(element);
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
            return this._getElementXY(selector, offset);
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
                language: platform_1.language,
                locale: platform_1.locale
            });
        }
        getLocalizedStrings() {
            return Promise.resolve({
                open: localizedStrings_1.default.open,
                close: localizedStrings_1.default.close,
                find: localizedStrings_1.default.find
            });
        }
        async _getElementXY(selector, offset) {
            const element = document.querySelector(selector);
            if (!element) {
                return Promise.reject(new Error(`Element not found: ${selector}`));
            }
            const { left, top } = (0, dom_1.getTopLeftOffset)(element);
            const { width, height } = (0, dom_1.getClientArea)(element);
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
    exports.BrowserWindowDriver = BrowserWindowDriver;
    exports.BrowserWindowDriver = BrowserWindowDriver = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService)
    ], BrowserWindowDriver);
    function registerWindowDriver(instantiationService) {
        Object.assign(window, { driver: instantiationService.createInstance(BrowserWindowDriver) });
    }
    exports.registerWindowDriver = registerWindowDriver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZHJpdmVyL2Jyb3dzZXIvZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQUUvQixZQUNnQyxXQUF5QixFQUNsQixrQkFBdUM7WUFEOUMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtRQUU5RSxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU87WUFDWixPQUFPLElBQUEsYUFBTyxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1lBQzVDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsc0JBQXNCLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNuRTtZQUVELE1BQU0sWUFBWSxHQUFHLE9BQTJCLENBQUM7WUFDakQsWUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFFMUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0RSxZQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLFFBQWdCO1lBQ3JDLE1BQU0sT0FBTyxHQUFHLFFB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