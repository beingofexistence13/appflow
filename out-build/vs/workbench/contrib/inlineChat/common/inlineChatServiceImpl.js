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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/linkedList", "vs/platform/contextkey/common/contextkey", "./inlineChat"], function (require, exports, lifecycle_1, event_1, linkedList_1, contextkey_1, inlineChat_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GJb = void 0;
    let $GJb = class $GJb {
        get onDidChangeProviders() {
            return this.c.event;
        }
        constructor(contextKeyService) {
            this.a = new linkedList_1.$tc();
            this.c = new event_1.$fd();
            this.b = inlineChat_1.$gz.bindTo(contextKeyService);
        }
        addProvider(provider) {
            const rm = this.a.push(provider);
            this.b.set(true);
            this.c.fire();
            return (0, lifecycle_1.$ic)(() => {
                rm();
                this.b.set(this.a.size > 0);
                this.c.fire();
            });
        }
        getAllProvider() {
            return [...this.a].reverse();
        }
    };
    exports.$GJb = $GJb;
    exports.$GJb = $GJb = __decorate([
        __param(0, contextkey_1.$3i)
    ], $GJb);
});
//# sourceMappingURL=inlineChatServiceImpl.js.map