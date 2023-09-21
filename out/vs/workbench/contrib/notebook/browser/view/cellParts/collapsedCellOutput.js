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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, codicons_1, themables_1, nls_1, keybinding_1, notebookBrowser_1, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollapsedCellOutput = void 0;
    const $ = DOM.$;
    let CollapsedCellOutput = class CollapsedCellOutput extends cellPart_1.CellContentPart {
        constructor(notebookEditor, cellOutputCollapseContainer, keybindingService) {
            super();
            this.notebookEditor = notebookEditor;
            const placeholder = DOM.append(cellOutputCollapseContainer, $('span.expandOutputPlaceholder'));
            placeholder.textContent = (0, nls_1.localize)('cellOutputsCollapsedMsg', "Outputs are collapsed");
            const expandIcon = DOM.append(cellOutputCollapseContainer, $('span.expandOutputIcon'));
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            const keybinding = keybindingService.lookupKeybinding(notebookBrowser_1.EXPAND_CELL_OUTPUT_COMMAND_ID);
            if (keybinding) {
                placeholder.title = (0, nls_1.localize)('cellExpandOutputButtonLabelWithDoubleClick', "Double-click to expand cell output ({0})", keybinding.getLabel());
                cellOutputCollapseContainer.title = (0, nls_1.localize)('cellExpandOutputButtonLabel', "Expand Cell Output (${0})", keybinding.getLabel());
            }
            DOM.hide(cellOutputCollapseContainer);
            this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => this.expand()));
            this._register(DOM.addDisposableListener(cellOutputCollapseContainer, DOM.EventType.DBLCLICK, () => this.expand()));
        }
        expand() {
            if (!this.currentCell) {
                return;
            }
            if (!this.currentCell) {
                return;
            }
            const textModel = this.notebookEditor.textModel;
            const index = textModel.cells.indexOf(this.currentCell.model);
            if (index < 0) {
                return;
            }
            this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
        }
    };
    exports.CollapsedCellOutput = CollapsedCellOutput;
    exports.CollapsedCellOutput = CollapsedCellOutput = __decorate([
        __param(2, keybinding_1.IKeybindingService)
    ], CollapsedCellOutput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2VkQ2VsbE91dHB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY29sbGFwc2VkQ2VsbE91dHB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVULElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsMEJBQWU7UUFDdkQsWUFDa0IsY0FBK0IsRUFDaEQsMkJBQXdDLEVBQ3BCLGlCQUFxQztZQUV6RCxLQUFLLEVBQUUsQ0FBQztZQUpTLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQU1oRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFnQixDQUFDO1lBQzlHLFdBQVcsQ0FBQyxXQUFXLEdBQUcsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUN2RixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDdkYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLGtCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV0RSxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQywrQ0FBNkIsQ0FBQyxDQUFDO1lBQ3JGLElBQUksVUFBVSxFQUFFO2dCQUNmLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsNENBQTRDLEVBQUUsMENBQTBDLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQzlJLDJCQUEyQixDQUFDLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSwyQkFBMkIsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNoSTtZQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUV0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFTyxNQUFNO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUN0QixPQUFPO2FBQ1A7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVUsQ0FBQztZQUNqRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlELElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtnQkFDZCxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxRSxDQUFDO0tBQ0QsQ0FBQTtJQTNDWSxrREFBbUI7a0NBQW5CLG1CQUFtQjtRQUk3QixXQUFBLCtCQUFrQixDQUFBO09BSlIsbUJBQW1CLENBMkMvQiJ9