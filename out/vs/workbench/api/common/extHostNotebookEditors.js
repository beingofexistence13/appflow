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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, errors_1, event_1, log_1, typeConverters) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookEditors = void 0;
    let ExtHostNotebookEditors = class ExtHostNotebookEditors {
        constructor(_logService, _notebooksAndEditors) {
            this._logService = _logService;
            this._notebooksAndEditors = _notebooksAndEditors;
            this._onDidChangeNotebookEditorSelection = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this._onDidChangeNotebookEditorVisibleRanges = new event_1.Emitter({ onListenerError: errors_1.onUnexpectedExternalError });
            this.onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
            this.onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
        }
        $acceptEditorPropertiesChanged(id, data) {
            this._logService.debug('ExtHostNotebook#$acceptEditorPropertiesChanged', id, data);
            const editor = this._notebooksAndEditors.getEditorById(id);
            // ONE: make all state updates
            if (data.visibleRanges) {
                editor._acceptVisibleRanges(data.visibleRanges.ranges.map(typeConverters.NotebookRange.to));
            }
            if (data.selections) {
                editor._acceptSelections(data.selections.selections.map(typeConverters.NotebookRange.to));
            }
            // TWO: send all events after states have been updated
            if (data.visibleRanges) {
                this._onDidChangeNotebookEditorVisibleRanges.fire({
                    notebookEditor: editor.apiEditor,
                    visibleRanges: editor.apiEditor.visibleRanges
                });
            }
            if (data.selections) {
                this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
                    notebookEditor: editor.apiEditor,
                    selections: editor.apiEditor.selections
                }));
            }
        }
        $acceptEditorViewColumns(data) {
            for (const id in data) {
                const editor = this._notebooksAndEditors.getEditorById(id);
                editor._acceptViewColumn(typeConverters.ViewColumn.to(data[id]));
            }
        }
    };
    exports.ExtHostNotebookEditors = ExtHostNotebookEditors;
    exports.ExtHostNotebookEditors = ExtHostNotebookEditors = __decorate([
        __param(0, log_1.ILogService)
    ], ExtHostNotebookEditors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRWRpdG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3ROb3RlYm9va0VkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO1FBUWxDLFlBQ2MsV0FBeUMsRUFDckMsb0JBQStDO1lBRGxDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3JDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFSaEQsd0NBQW1DLEdBQUcsSUFBSSxlQUFPLENBQTRDLEVBQUUsZUFBZSxFQUFFLGtDQUF5QixFQUFFLENBQUMsQ0FBQztZQUM3SSw0Q0FBdUMsR0FBRyxJQUFJLGVBQU8sQ0FBZ0QsRUFBRSxlQUFlLEVBQUUsa0NBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBRTdKLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxLQUFLLENBQUM7WUFDcEYsMkNBQXNDLEdBQUcsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLEtBQUssQ0FBQztRQUtqRyxDQUFDO1FBRUwsOEJBQThCLENBQUMsRUFBVSxFQUFFLElBQXlDO1lBQ25GLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNELDhCQUE4QjtZQUM5QixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVGO1lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMxRjtZQUVELHNEQUFzRDtZQUN0RCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxJQUFJLENBQUM7b0JBQ2pELGNBQWMsRUFBRSxNQUFNLENBQUMsU0FBUztvQkFDaEMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYTtpQkFDN0MsQ0FBQyxDQUFDO2FBQ0g7WUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztvQkFDM0QsY0FBYyxFQUFFLE1BQU0sQ0FBQyxTQUFTO29CQUNoQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVO2lCQUN2QyxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0YsQ0FBQztRQUVELHdCQUF3QixDQUFDLElBQW1DO1lBQzNELEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxFQUFFO2dCQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqRTtRQUNGLENBQUM7S0FDRCxDQUFBO0lBN0NZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBU2hDLFdBQUEsaUJBQVcsQ0FBQTtPQVRELHNCQUFzQixDQTZDbEMifQ==