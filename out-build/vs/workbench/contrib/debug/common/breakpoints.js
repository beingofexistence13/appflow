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
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GRb = void 0;
    let $GRb = class $GRb {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = typeof b.when === 'string' ? contextkey_1.$Ii.deserialize(b.when) : undefined;
        }
        get language() {
            return this.b.language;
        }
        get enabled() {
            return !this.a || this.c.contextMatchesRules(this.a);
        }
    };
    exports.$GRb = $GRb;
    exports.$GRb = $GRb = __decorate([
        __param(1, contextkey_1.$3i)
    ], $GRb);
});
//# sourceMappingURL=breakpoints.js.map