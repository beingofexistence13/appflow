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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/storedFileWorkingCopySaveParticipant", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/base/common/lifecycle", "vs/base/common/arrays"], function (require, exports, nls_1, async_1, cancellation_1, log_1, progress_1, lifecycle_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GD = void 0;
    let $GD = class $GD extends lifecycle_1.$kc {
        get length() { return this.a.length; }
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = [];
        }
        addSaveParticipant(participant) {
            const remove = (0, arrays_1.$Sb)(this.a, participant);
            return (0, lifecycle_1.$ic)(() => remove());
        }
        participate(workingCopy, context, token) {
            const cts = new cancellation_1.$pd(token);
            return this.b.withProgress({
                title: (0, nls_1.localize)(0, null, workingCopy.name),
                location: 15 /* ProgressLocation.Notification */,
                cancellable: true,
                delay: workingCopy.isDirty() ? 3000 : 5000
            }, async (progress) => {
                // undoStop before participation
                workingCopy.model?.pushStackElement();
                for (const saveParticipant of this.a) {
                    if (cts.token.isCancellationRequested || workingCopy.isDisposed()) {
                        break;
                    }
                    try {
                        const promise = saveParticipant.participate(workingCopy, context, progress, cts.token);
                        await (0, async_1.$vg)(promise, cts.token);
                    }
                    catch (err) {
                        this.c.warn(err);
                    }
                }
                // undoStop after participation
                workingCopy.model?.pushStackElement();
                // Cleanup
                cts.dispose();
            }, () => {
                // user cancel
                cts.dispose(true);
            });
        }
        dispose() {
            this.a.splice(0, this.a.length);
            super.dispose();
        }
    };
    exports.$GD = $GD;
    exports.$GD = $GD = __decorate([
        __param(0, progress_1.$2u),
        __param(1, log_1.$5i)
    ], $GD);
});
//# sourceMappingURL=storedFileWorkingCopySaveParticipant.js.map