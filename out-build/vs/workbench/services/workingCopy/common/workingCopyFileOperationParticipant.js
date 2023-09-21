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
define(["require", "exports", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/linkedList"], function (require, exports, log_1, lifecycle_1, configuration_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vD = void 0;
    let $vD = class $vD extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = new linkedList_1.$tc();
        }
        addFileOperationParticipant(participant) {
            const remove = this.a.push(participant);
            return (0, lifecycle_1.$ic)(() => remove());
        }
        async participate(files, operation, undoInfo, token) {
            const timeout = this.c.getValue('files.participants.timeout');
            if (typeof timeout !== 'number' || timeout <= 0) {
                return; // disabled
            }
            // For each participant
            for (const participant of this.a) {
                try {
                    await participant.participate(files, operation, undoInfo, timeout, token);
                }
                catch (err) {
                    this.b.warn(err);
                }
            }
        }
        dispose() {
            this.a.clear();
            super.dispose();
        }
    };
    exports.$vD = $vD;
    exports.$vD = $vD = __decorate([
        __param(0, log_1.$5i),
        __param(1, configuration_1.$8h)
    ], $vD);
});
//# sourceMappingURL=workingCopyFileOperationParticipant.js.map