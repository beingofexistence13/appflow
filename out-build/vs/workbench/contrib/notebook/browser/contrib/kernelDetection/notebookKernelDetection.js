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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, lifecycle_1, platform_1, contributions_1, notebookKernelService_1, notebookLoggingService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookKernelDetection = class NotebookKernelDetection extends lifecycle_1.$kc {
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = new Map();
            this.b = this.B(new lifecycle_1.$jc());
            this.h();
        }
        h() {
            this.b.clear();
            this.b.add(this.f.onWillActivateByEvent(e => {
                if (e.event.startsWith('onNotebook:')) {
                    if (this.f.activationEventIsDone(e.event)) {
                        return;
                    }
                    // parse the event to get the notebook type
                    const notebookType = e.event.substring('onNotebook:'.length);
                    if (notebookType === '*') {
                        // ignore
                        return;
                    }
                    let shouldStartDetection = false;
                    const extensionStatus = this.f.getExtensionsStatus();
                    this.f.extensions.forEach(extension => {
                        if (extensionStatus[extension.identifier.value].activationTimes) {
                            // already activated
                            return;
                        }
                        if (extension.activationEvents?.includes(e.event)) {
                            shouldStartDetection = true;
                        }
                    });
                    if (shouldStartDetection && !this.a.has(notebookType)) {
                        this.g.debug('KernelDetection', `start extension activation for ${notebookType}`);
                        const task = this.c.registerNotebookKernelDetectionTask({
                            notebookType: notebookType
                        });
                        this.a.set(notebookType, task);
                    }
                }
            }));
            let timer = null;
            this.b.add(this.f.onDidChangeExtensionsStatus(() => {
                if (timer) {
                    clearTimeout(timer);
                }
                // activation state might not be updated yet, postpone to next frame
                timer = setTimeout(() => {
                    const taskToDelete = [];
                    for (const [notebookType, task] of this.a) {
                        if (this.f.activationEventIsDone(`onNotebook:${notebookType}`)) {
                            this.g.debug('KernelDetection', `finish extension activation for ${notebookType}`);
                            taskToDelete.push(notebookType);
                            task.dispose();
                        }
                    }
                    taskToDelete.forEach(notebookType => {
                        this.a.delete(notebookType);
                    });
                });
            }));
            this.b.add({
                dispose: () => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                }
            });
        }
    };
    NotebookKernelDetection = __decorate([
        __param(0, notebookKernelService_1.$Bbb),
        __param(1, extensions_1.$MF),
        __param(2, notebookLoggingService_1.$1ob)
    ], NotebookKernelDetection);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookKernelDetection, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=notebookKernelDetection.js.map