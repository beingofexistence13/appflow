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
define(["require", "exports", "vs/platform/log/common/log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H2b = void 0;
    let $H2b = class $H2b {
        constructor(id, name, b, c) {
            this.b = b;
            this.c = c;
            this.a = c.createLogger(b, { name, id, hidden: true });
        }
        log(level, message) {
            this.c.setVisibility(this.b, true);
            (0, log_1.log)(this.a, level, message);
        }
    };
    exports.$H2b = $H2b;
    exports.$H2b = $H2b = __decorate([
        __param(3, log_1.$6i)
    ], $H2b);
});
//# sourceMappingURL=delayedLogChannel.js.map