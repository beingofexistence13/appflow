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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, event_1, lifecycle_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f8b = exports.$e8b = void 0;
    exports.$e8b = (0, instantiation_1.$Bh)('sharedProcessLifecycleService');
    let $f8b = class $f8b extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onWillShutdown = this.a.event;
        }
        fireOnWillShutdown() {
            this.b.trace('Lifecycle#onWillShutdown.fire()');
            this.a.fire();
        }
    };
    exports.$f8b = $f8b;
    exports.$f8b = $f8b = __decorate([
        __param(0, log_1.$5i)
    ], $f8b);
});
//# sourceMappingURL=sharedProcessLifecycleService.js.map