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
define(["require", "exports", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/platform/undoRedo/common/undoRedo", "vs/editor/common/model/editStack"], function (require, exports, model_1, resolverService_1, lifecycle_1, undoRedo_1, editStack_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModelUndoRedoParticipant = void 0;
    let ModelUndoRedoParticipant = class ModelUndoRedoParticipant extends lifecycle_1.Disposable {
        constructor(_modelService, _textModelService, _undoRedoService) {
            super();
            this._modelService = _modelService;
            this._textModelService = _textModelService;
            this._undoRedoService = _undoRedoService;
            this._register(this._modelService.onModelRemoved((model) => {
                // a model will get disposed, so let's check if the undo redo stack is maintained
                const elements = this._undoRedoService.getElements(model.uri);
                if (elements.past.length === 0 && elements.future.length === 0) {
                    return;
                }
                for (const element of elements.past) {
                    if (element instanceof editStack_1.MultiModelEditStackElement) {
                        element.setDelegate(this);
                    }
                }
                for (const element of elements.future) {
                    if (element instanceof editStack_1.MultiModelEditStackElement) {
                        element.setDelegate(this);
                    }
                }
            }));
        }
        prepareUndoRedo(element) {
            // Load all the needed text models
            const missingModels = element.getMissingModels();
            if (missingModels.length === 0) {
                // All models are available!
                return lifecycle_1.Disposable.None;
            }
            const disposablesPromises = missingModels.map(async (uri) => {
                try {
                    const reference = await this._textModelService.createModelReference(uri);
                    return reference;
                }
                catch (err) {
                    // This model could not be loaded, maybe it was deleted in the meantime?
                    return lifecycle_1.Disposable.None;
                }
            });
            return Promise.all(disposablesPromises).then(disposables => {
                return {
                    dispose: () => (0, lifecycle_1.dispose)(disposables)
                };
            });
        }
    };
    exports.ModelUndoRedoParticipant = ModelUndoRedoParticipant;
    exports.ModelUndoRedoParticipant = ModelUndoRedoParticipant = __decorate([
        __param(0, model_1.IModelService),
        __param(1, resolverService_1.ITextModelService),
        __param(2, undoRedo_1.IUndoRedoService)
    ], ModelUndoRedoParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxVbmRvUmVkb1BhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9tb2RlbFVuZG9SZWRvUGFydGljaXBhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFDdkQsWUFDaUMsYUFBNEIsRUFDeEIsaUJBQW9DLEVBQ3JDLGdCQUFrQztZQUVyRSxLQUFLLEVBQUUsQ0FBQztZQUp3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUN4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3JDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFHckUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUMxRCxpRkFBaUY7Z0JBQ2pGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQy9ELE9BQU87aUJBQ1A7Z0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO29CQUNwQyxJQUFJLE9BQU8sWUFBWSxzQ0FBMEIsRUFBRTt3QkFDbEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0Q7Z0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO29CQUN0QyxJQUFJLE9BQU8sWUFBWSxzQ0FBMEIsRUFBRTt3QkFDbEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLGVBQWUsQ0FBQyxPQUFtQztZQUN6RCxrQ0FBa0M7WUFDbEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDakQsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0IsNEJBQTRCO2dCQUM1QixPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDO2FBQ3ZCO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDM0QsSUFBSTtvQkFDSCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekUsT0FBb0IsU0FBUyxDQUFDO2lCQUM5QjtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYix3RUFBd0U7b0JBQ3hFLE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7aUJBQ3ZCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzFELE9BQU87b0JBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUEsbUJBQU8sRUFBQyxXQUFXLENBQUM7aUJBQ25DLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBbERZLDREQUF3Qjt1Q0FBeEIsd0JBQXdCO1FBRWxDLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsbUNBQWlCLENBQUE7UUFDakIsV0FBQSwyQkFBZ0IsQ0FBQTtPQUpOLHdCQUF3QixDQWtEcEMifQ==