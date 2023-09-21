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
define(["require", "exports", "vs/nls!vs/workbench/services/textfile/common/textFileSaveParticipant", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/base/common/lifecycle", "vs/base/common/arrays"], function (require, exports, nls_1, async_1, cancellation_1, log_1, progress_1, lifecycle_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g3b = void 0;
    let $g3b = class $g3b extends lifecycle_1.$kc {
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
        participate(model, context, token) {
            const cts = new cancellation_1.$pd(token);
            return this.b.withProgress({
                title: (0, nls_1.localize)(0, null, model.name),
                location: 15 /* ProgressLocation.Notification */,
                cancellable: true,
                delay: model.isDirty() ? 3000 : 5000
            }, async (progress) => {
                // undoStop before participation
                model.textEditorModel?.pushStackElement();
                for (const saveParticipant of this.a) {
                    if (cts.token.isCancellationRequested || !model.textEditorModel /* disposed */) {
                        break;
                    }
                    try {
                        const promise = saveParticipant.participate(model, context, progress, cts.token);
                        await (0, async_1.$vg)(promise, cts.token);
                    }
                    catch (err) {
                        this.c.error(err);
                    }
                }
                // undoStop after participation
                model.textEditorModel?.pushStackElement();
            }, () => {
                // user cancel
                cts.cancel();
            }).finally(() => {
                cts.dispose();
            });
        }
        dispose() {
            this.a.splice(0, this.a.length);
            super.dispose();
        }
    };
    exports.$g3b = $g3b;
    exports.$g3b = $g3b = __decorate([
        __param(0, progress_1.$2u),
        __param(1, log_1.$5i)
    ], $g3b);
});
//# sourceMappingURL=textFileSaveParticipant.js.map