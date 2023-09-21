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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, instantiation_1, extensions_1, lifecycle_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyEditorService = exports.IWorkingCopyEditorService = void 0;
    exports.IWorkingCopyEditorService = (0, instantiation_1.createDecorator)('workingCopyEditorService');
    let WorkingCopyEditorService = class WorkingCopyEditorService extends lifecycle_1.Disposable {
        constructor(editorService) {
            super();
            this.editorService = editorService;
            this._onDidRegisterHandler = this._register(new event_1.Emitter());
            this.onDidRegisterHandler = this._onDidRegisterHandler.event;
            this.handlers = new Set();
        }
        registerHandler(handler) {
            // Add to registry and emit as event
            this.handlers.add(handler);
            this._onDidRegisterHandler.fire(handler);
            return (0, lifecycle_1.toDisposable)(() => this.handlers.delete(handler));
        }
        findEditor(workingCopy) {
            for (const editorIdentifier of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (this.isOpen(workingCopy, editorIdentifier.editor)) {
                    return editorIdentifier;
                }
            }
            return undefined;
        }
        isOpen(workingCopy, editor) {
            for (const handler of this.handlers) {
                if (handler.isOpen(workingCopy, editor)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.WorkingCopyEditorService = WorkingCopyEditorService;
    exports.WorkingCopyEditorService = WorkingCopyEditorService = __decorate([
        __param(0, editorService_1.IEditorService)
    ], WorkingCopyEditorService);
    // Register Service
    (0, extensions_1.registerSingleton)(exports.IWorkingCopyEditorService, WorkingCopyEditorService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlFZGl0b3JTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi93b3JraW5nQ29weUVkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV25GLFFBQUEseUJBQXlCLEdBQUcsSUFBQSwrQkFBZSxFQUE0QiwwQkFBMEIsQ0FBQyxDQUFDO0lBeUN6RyxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBU3ZELFlBQTRCLGFBQThDO1lBQ3pFLEtBQUssRUFBRSxDQUFDO1lBRG9DLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUx6RCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE2QixDQUFDLENBQUM7WUFDekYseUJBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUVoRCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7UUFJakUsQ0FBQztRQUVELGVBQWUsQ0FBQyxPQUFrQztZQUVqRCxvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6QyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxVQUFVLENBQUMsV0FBeUI7WUFDbkMsS0FBSyxNQUFNLGdCQUFnQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSwyQ0FBbUMsRUFBRTtnQkFDaEcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDdEQsT0FBTyxnQkFBZ0IsQ0FBQztpQkFDeEI7YUFDRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxNQUFNLENBQUMsV0FBeUIsRUFBRSxNQUFtQjtZQUM1RCxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRCxDQUFBO0lBekNZLDREQUF3Qjt1Q0FBeEIsd0JBQXdCO1FBU3ZCLFdBQUEsOEJBQWMsQ0FBQTtPQVRmLHdCQUF3QixDQXlDcEM7SUFFRCxtQkFBbUI7SUFDbkIsSUFBQSw4QkFBaUIsRUFBQyxpQ0FBeUIsRUFBRSx3QkFBd0Isb0NBQTRCLENBQUMifQ==