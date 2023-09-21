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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/lifecycle", "vs/nls", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, DOM, iconLabels_1, lifecycle_1, nls_1, themables_1, notebookIcons_1, notebookCommon_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollapsedCodeCellExecutionIcon = void 0;
    let CollapsedCodeCellExecutionIcon = class CollapsedCodeCellExecutionIcon extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _cell, _element, _executionStateService) {
            super();
            this._cell = _cell;
            this._element = _element;
            this._executionStateService = _executionStateService;
            this._visible = false;
            this._update();
            this._register(this._executionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && e.affectsCell(this._cell.uri)) {
                    this._update();
                }
            }));
            this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
        }
        setVisibility(visible) {
            this._visible = visible;
            this._update();
        }
        _update() {
            if (!this._visible) {
                return;
            }
            const runState = this._executionStateService.getCellExecution(this._cell.uri);
            const item = this._getItemForState(runState, this._cell.model.internalMetadata);
            if (item) {
                this._element.style.display = '';
                DOM.reset(this._element, ...(0, iconLabels_1.renderLabelWithIcons)(item.text));
                this._element.title = item.tooltip ?? '';
            }
            else {
                this._element.style.display = 'none';
                DOM.reset(this._element);
            }
        }
        _getItemForState(runState, internalMetadata) {
            const state = runState?.state;
            const { lastRunSuccess } = internalMetadata;
            if (!state && lastRunSuccess) {
                return {
                    text: `$(${notebookIcons_1.successStateIcon.id})`,
                    tooltip: (0, nls_1.localize)('notebook.cell.status.success', "Success"),
                };
            }
            else if (!state && lastRunSuccess === false) {
                return {
                    text: `$(${notebookIcons_1.errorStateIcon.id})`,
                    tooltip: (0, nls_1.localize)('notebook.cell.status.failed', "Failed"),
                };
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Pending || state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                return {
                    text: `$(${notebookIcons_1.pendingStateIcon.id})`,
                    tooltip: (0, nls_1.localize)('notebook.cell.status.pending', "Pending"),
                };
            }
            else if (state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                const icon = themables_1.ThemeIcon.modify(notebookIcons_1.executingStateIcon, 'spin');
                return {
                    text: `$(${icon.id})`,
                    tooltip: (0, nls_1.localize)('notebook.cell.status.executing', "Executing"),
                };
            }
            return;
        }
    };
    exports.CollapsedCodeCellExecutionIcon = CollapsedCodeCellExecutionIcon;
    exports.CollapsedCodeCellExecutionIcon = CollapsedCodeCellExecutionIcon = __decorate([
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], CollapsedCodeCellExecutionIcon);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNlbGxFeGVjdXRpb25JY29uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jb2RlQ2VsbEV4ZWN1dGlvbkljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLHNCQUFVO1FBRzdELFlBQ0MsZUFBd0MsRUFDdkIsS0FBcUIsRUFDckIsUUFBcUIsRUFDTixzQkFBOEQ7WUFFOUYsS0FBSyxFQUFFLENBQUM7WUFKUyxVQUFLLEdBQUwsS0FBSyxDQUFnQjtZQUNyQixhQUFRLEdBQVIsUUFBUSxDQUFhO1lBQ0UsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFnQztZQU52RixhQUFRLEdBQUcsS0FBSyxDQUFDO1lBVXhCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUsscURBQXFCLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDM0UsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNmO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQWdCO1lBQzdCLElB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