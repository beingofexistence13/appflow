/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/nls"], function (require, exports, contextScopedHistoryWidget_1, notebookFindReplaceWidget_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchFindInput = void 0;
    class SearchFindInput extends contextScopedHistoryWidget_1.ContextScopedFindInput {
        constructor(container, contextViewProvider, options, contextKeyService, contextMenuService, instantiationService, filters, filterStartVisiblitity) {
            super(container, contextViewProvider, options, contextKeyService);
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.filters = filters;
            this._filterChecked = false;
            this._visible = false;
            this._findFilter = this._register(new notebookFindReplaceWidget_1.NotebookFindInputFilterButton(filters, contextMenuService, instantiationService, options, nls.localize('searchFindInputNotebookFilter.label', "Notebook Find Filters")));
            this.inputBox.paddingRight = (this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0) + this._findFilter.width;
            this.controls.appendChild(this._findFilter.container);
            this._findFilter.container.classList.add('monaco-custom-toggle');
            this.filterVisible = filterStartVisiblitity;
        }
        set filterVisible(show) {
            this._findFilter.container.style.display = show ? '' : 'none';
            this._visible = show;
            this.updateStyles();
        }
        setEnabled(enabled) {
            super.setEnabled(enabled);
            if (enabled && (!this._filterChecked || !this._visible)) {
                this.regex?.enable();
            }
            else {
                this.regex?.disable();
            }
        }
        updateStyles() {
            // filter is checked if it's in a non-default state
            this._filterChecked =
                !this.filters.markupInput ||
                    !this.filters.markupPreview ||
                    !this.filters.codeInput ||
                    !this.filters.codeOutput;
            // TODO: find a way to express that searching notebook output and markdown preview don't support regex.
            this._findFilter.applyStyles(this._filterChecked);
        }
    }
    exports.SearchFindInput = SearchFindInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRmluZElucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoRmluZElucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGVBQWdCLFNBQVEsbURBQXNCO1FBSzFELFlBQ0MsU0FBNkIsRUFDN0IsbUJBQXlDLEVBQ3pDLE9BQTBCLEVBQzFCLGlCQUFxQyxFQUM1QixrQkFBdUMsRUFDdkMsb0JBQTJDLEVBQzNDLE9BQTRCLEVBQ3JDLHNCQUErQjtZQUUvQixLQUFLLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBTHpELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDdkMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyxZQUFPLEdBQVAsT0FBTyxDQUFxQjtZQVY5QixtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUNoQyxhQUFRLEdBQVksS0FBSyxDQUFDO1lBYWpDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDaEMsSUFBSSx5REFBNkIsQ0FDaEMsT0FBTyxFQUNQLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsT0FBTyxFQUNQLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUsdUJBQXVCLENBQUMsQ0FDNUUsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDeEosSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFakUsSUFBSSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztRQUM3QyxDQUFDO1FBRUQsSUFBSSxhQUFhLENBQUMsSUFBYTtZQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDOUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFUSxVQUFVLENBQUMsT0FBZ0I7WUFDbkMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUNyQjtpQkFBTTtnQkFDTixJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztRQUVELFlBQVk7WUFDWCxtREFBbUQ7WUFDbkQsSUFBSSxDQUFDLGNBQWM7Z0JBQ2xCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXO29CQUN6QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYTtvQkFDM0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVM7b0JBQ3ZCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFFMUIsdUdBQXVHO1lBRXZHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQ0Q7SUExREQsMENBMERDIn0=