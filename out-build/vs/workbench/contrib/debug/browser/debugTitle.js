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
define(["require", "exports", "vs/workbench/contrib/debug/common/debug", "vs/base/common/lifecycle", "vs/workbench/services/host/browser/host", "vs/workbench/services/title/common/titleService"], function (require, exports, debug_1, lifecycle_1, host_1, titleService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Rb = void 0;
    let $1Rb = class $1Rb {
        constructor(debugService, hostService, titleService) {
            this.a = [];
            const updateTitle = () => {
                if (debugService.state === 2 /* State.Stopped */ && !hostService.hasFocus) {
                    titleService.updateProperties({ prefix: '🔴' });
                }
                else {
                    titleService.updateProperties({ prefix: '' });
                }
            };
            this.a.push(debugService.onDidChangeState(updateTitle));
            this.a.push(hostService.onDidChangeFocus(updateTitle));
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.a);
        }
    };
    exports.$1Rb = $1Rb;
    exports.$1Rb = $1Rb = __decorate([
        __param(0, debug_1.$nH),
        __param(1, host_1.$VT),
        __param(2, titleService_1.$ZRb)
    ], $1Rb);
});
//# sourceMappingURL=debugTitle.js.map