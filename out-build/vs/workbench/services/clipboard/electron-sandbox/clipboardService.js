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
define(["require", "exports", "vs/platform/clipboard/common/clipboardService", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/platform/native/common/native", "vs/base/common/buffer"], function (require, exports, clipboardService_1, uri_1, platform_1, extensions_1, native_1, buffer_1) {
    "use strict";
    var $H_b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H_b = void 0;
    let $H_b = class $H_b {
        static { $H_b_1 = this; }
        static { this.a = 'code/file-list'; } // Clipboard format for files
        constructor(b) {
            this.b = b;
        }
        async writeText(text, type) {
            return this.b.writeClipboardText(text, type);
        }
        async readText(type) {
            return this.b.readClipboardText(type);
        }
        async readFindText() {
            if (platform_1.$j) {
                return this.b.readClipboardFindText();
            }
            return '';
        }
        async writeFindText(text) {
            if (platform_1.$j) {
                return this.b.writeClipboardFindText(text);
            }
        }
        async writeResources(resources) {
            if (resources.length) {
                return this.b.writeClipboardBuffer($H_b_1.a, this.c(resources));
            }
        }
        async readResources() {
            return this.d(await this.b.readClipboardBuffer($H_b_1.a));
        }
        async hasResources() {
            return this.b.hasClipboard($H_b_1.a);
        }
        c(resources) {
            return buffer_1.$Fd.fromString(resources.map(r => r.toString()).join('\n'));
        }
        d(buffer) {
            if (!buffer) {
                return [];
            }
            const bufferValue = buffer.toString();
            if (!bufferValue) {
                return [];
            }
            try {
                return bufferValue.split('\n').map(f => uri_1.URI.parse(f));
            }
            catch (error) {
                return []; // do not trust clipboard data
            }
        }
    };
    exports.$H_b = $H_b;
    exports.$H_b = $H_b = $H_b_1 = __decorate([
        __param(0, native_1.$05b)
    ], $H_b);
    (0, extensions_1.$mr)(clipboardService_1.$UZ, $H_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=clipboardService.js.map