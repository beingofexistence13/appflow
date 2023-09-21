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
    let NotebookKernelDetection = class NotebookKernelDetection extends lifecycle_1.Disposable {
        constructor(_notebookKernelService, _extensionService, _notebookLoggingService) {
            super();
            this._notebookKernelService = _notebookKernelService;
            this._extensionService = _extensionService;
            this._notebookLoggingService = _notebookLoggingService;
            this._detectionMap = new Map();
            this._localDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._registerListeners();
        }
        _registerListeners() {
            this._localDisposableStore.clear();
            this._localDisposableStore.add(this._extensionService.onWillActivateByEvent(e => {
                if (e.event.startsWith('onNotebook:')) {
                    if (this._extensionService.activationEventIsDone(e.event)) {
                        return;
                    }
                    // parse the event to get the notebook type
                    const notebookType = e.event.substring('onNotebook:'.length);
                    if (notebookType === '*') {
                        // ignore
                        return;
                    }
                    let shouldStartDetection = false;
                    const extensionStatus = this._extensionService.getExtensionsStatus();
                    this._extensionService.extensions.forEach(extension => {
                        if (extensionStatus[extension.identifier.value].activationTimes) {
                            // already activated
                            return;
                        }
                        if (extension.activationEvents?.includes(e.event)) {
                            shouldStartDetection = true;
                        }
                    });
                    if (shouldStartDetection && !this._detectionMap.has(notebookType)) {
                        this._notebookLoggingService.debug('KernelDetection', `start extension activation for ${notebookType}`);
                        const task = this._notebookKernelService.registerNotebookKernelDetectionTask({
                            notebookType: notebookType
                        });
                        this._detectionMap.set(notebookType, task);
                    }
                }
            }));
            let timer = null;
            this._localDisposableStore.add(this._extensionService.onDidChangeExtensionsStatus(() => {
                if (timer) {
                    clearTimeout(timer);
                }
                // activation state might not be updated yet, postpone to next frame
                timer = setTimeout(() => {
                    const taskToDelete = [];
                    for (const [notebookType, task] of this._detectionMap) {
                        if (this._extensionService.activationEventIsDone(`onNotebook:${notebookType}`)) {
                            this._notebookLoggingService.debug('KernelDetection', `finish extension activation for ${notebookType}`);
                            taskToDelete.push(notebookType);
                            task.dispose();
                        }
                    }
                    taskToDelete.forEach(notebookType => {
                        this._detectionMap.delete(notebookType);
                    });
                });
            }));
            this._localDisposableStore.add({
                dispose: () => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                }
            });
        }
    };
    NotebookKernelDetection = __decorate([
        __param(0, notebookKernelService_1.INotebookKernelService),
        __param(1, extensions_1.IExtensionService),
        __param(2, notebookLoggingService_1.INotebookLoggingService)
    ], NotebookKernelDetection);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookKernelDetection, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxEZXRlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIva2VybmVsRGV0ZWN0aW9uL25vdGVib29rS2VybmVsRGV0ZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBV2hHLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsc0JBQVU7UUFJL0MsWUFDeUIsc0JBQStELEVBQ3BFLGlCQUFxRCxFQUMvQyx1QkFBaUU7WUFFMUYsS0FBSyxFQUFFLENBQUM7WUFKaUMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUNuRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzlCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFObkYsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQUMvQywwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFTckUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFbkMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9FLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ3RDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDMUQsT0FBTztxQkFDUDtvQkFFRCwyQ0FB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