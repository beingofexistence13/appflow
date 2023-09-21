/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellOutputViewModel = void 0;
    let handle = 0;
    class CellOutputViewModel extends lifecycle_1.Disposable {
        get model() {
            return this._outputRawData;
        }
        get pickedMimeType() {
            return this._pickedMimeType;
        }
        set pickedMimeType(value) {
            this._pickedMimeType = value;
        }
        constructor(cellViewModel, _outputRawData, _notebookService) {
            super();
            this.cellViewModel = cellViewModel;
            this._outputRawData = _outputRawData;
            this._notebookService = _notebookService;
            this._onDidResetRendererEmitter = this._register(new event_1.Emitter());
            this.onDidResetRenderer = this._onDidResetRendererEmitter.event;
            this.outputHandle = handle++;
        }
        hasMultiMimeType() {
            if (this._outputRawData.outputs.length < 2) {
                return false;
            }
            const firstMimeType = this._outputRawData.outputs[0].mime;
            return this._outputRawData.outputs.some(output => output.mime !== firstMimeType);
        }
        resolveMimeTypes(textModel, kernelProvides) {
            const mimeTypes = this._notebookService.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
            const index = mimeTypes.findIndex(mimeType => mimeType.rendererId !== notebookCommon_1.RENDERER_NOT_AVAILABLE && mimeType.isTrusted);
            return [mimeTypes, Math.max(index, 0)];
        }
        resetRenderer() {
            // reset the output renderer
            this._pickedMimeType = undefined;
            this.model.bumpVersion();
            this._onDidResetRendererEmitter.fire();
        }
        toRawJSON() {
            return {
                outputs: this._outputRawData.outputs,
                // TODO@rebronix, no id, right?
            };
        }
    }
    exports.CellOutputViewModel = CellOutputViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dFZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld01vZGVsL2NlbGxPdXRwdXRWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVU7UUFJbEQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFHRCxJQUFJLGNBQWM7WUFDakIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFRCxJQUFJLGNBQWMsQ0FBQyxLQUFtQztZQUNyRCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBRUQsWUFDVSxhQUFvQyxFQUM1QixjQUEyQixFQUMzQixnQkFBa0M7WUFFbkQsS0FBSyxFQUFFLENBQUM7WUFKQyxrQkFBYSxHQUFiLGFBQWEsQ0FBdUI7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWE7WUFDM0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQW5CNUMsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDaEUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQUNwRSxpQkFBWSxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBb0J4QixDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsZ0JBQWdCLENBQUMsU0FBNEIsRUFBRSxjQUE2QztZQUMzRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckcsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEtBQUssdUNBQXNCLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXBILE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsYUFBYTtZQUNaLDRCQUE0QjtZQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsU0FBUztZQUNSLE9BQU87Z0JBQ04sT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTztnQkFDcEMsK0JBQStCO2FBQy9CLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUF0REQsa0RBc0RDIn0=