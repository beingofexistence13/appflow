/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R0b = void 0;
    class $R0b {
        constructor() {
            this.a = undefined;
            this.b = undefined;
            this.c = undefined;
        }
        async writeText(text, type) {
            this.a = text;
        }
        async readText(type) {
            return this.a ?? '';
        }
        async readFindText() {
            return this.b ?? '';
        }
        async writeFindText(text) {
            this.b = text;
        }
        async writeResources(resources) {
            this.c = resources;
        }
        async readResources() {
            return this.c ?? [];
        }
        async hasResources() {
            return Array.isArray(this.c) && this.c.length > 0;
        }
    }
    exports.$R0b = $R0b;
});
//# sourceMappingURL=testClipboardService.js.map