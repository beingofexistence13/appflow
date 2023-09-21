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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/userActivity/common/userActivityRegistry"], function (require, exports, async_1, event_1, lifecycle_1, extensions_1, instantiation_1, userActivityRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$klb = exports.$jlb = void 0;
    exports.$jlb = (0, instantiation_1.$Bh)('IUserActivityService');
    let $klb = class $klb extends lifecycle_1.$kc {
        constructor(instantiationService) {
            super();
            this.a = this.B(new async_1.$Sg(() => {
                this.isActive = false;
                this.b.fire(false);
            }, 10000));
            this.b = this.B(new event_1.$fd);
            this.c = 0;
            /**
             * @inheritdoc
             *
             * Note: initialized to true, since the user just did something to open the
             * window. The bundled DomActivityTracker will initially assume activity
             * as well in order to unset this if the window gets abandoned.
             */
            this.isActive = true;
            /** @inheritdoc */
            this.onDidChangeIsActive = this.b.event;
            this.B((0, async_1.$Wg)(() => userActivityRegistry_1.$ilb.take(this, instantiationService)));
        }
        /** @inheritdoc */
        markActive() {
            if (++this.c === 1) {
                this.isActive = true;
                this.b.fire(true);
                this.a.cancel();
            }
            return (0, lifecycle_1.$ic)(() => {
                if (--this.c === 0) {
                    this.a.schedule();
                }
            });
        }
    };
    exports.$klb = $klb;
    exports.$klb = $klb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $klb);
    (0, extensions_1.$mr)(exports.$jlb, $klb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userActivityService.js.map