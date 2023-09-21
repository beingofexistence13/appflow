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
define(["require", "exports", "vs/base/common/actions", "vs/nls", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/base/browser/mouseEvent"], function (require, exports, actions_1, nls_1, layoutService_1, contextView_1, lifecycle_1, dom_1, contributions_1, platform_1, platform_2, clipboardService_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextInputActionsProvider = void 0;
    let TextInputActionsProvider = class TextInputActionsProvider extends lifecycle_1.Disposable {
        constructor(layoutService, contextMenuService, clipboardService) {
            super();
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.clipboardService = clipboardService;
            this.textInputActions = [];
            this.createActions();
            this.registerListeners();
        }
        createActions() {
            this.textInputActions.push(
            // Undo/Redo
            new actions_1.Action('undo', (0, nls_1.localize)('undo', "Undo"), undefined, true, async () => document.execCommand('undo')), new actions_1.Action('redo', (0, nls_1.localize)('redo', "Redo"), undefined, true, async () => document.execCommand('redo')), new actions_1.Separator(), 
            // Cut / Copy / Paste
            new actions_1.Action('editor.action.clipboardCutAction', (0, nls_1.localize)('cut', "Cut"), undefined, true, async () => document.execCommand('cut')), new actions_1.Action('editor.action.clipboardCopyAction', (0, nls_1.localize)('copy', "Copy"), undefined, true, async () => document.execCommand('copy')), new actions_1.Action('editor.action.clipboardPasteAction', (0, nls_1.localize)('paste', "Paste"), undefined, true, async (element) => {
                // Native: paste is supported
                if (platform_2.isNative) {
                    document.execCommand('paste');
                }
                // Web: paste is not supported due to security reasons
                else {
                    const clipboardText = await this.clipboardService.readText();
                    if (element instanceof HTMLTextAreaElement ||
                        element instanceof HTMLInputElement) {
                        const selectionStart = element.selectionStart || 0;
                        const selectionEnd = element.selectionEnd || 0;
                        element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                        element.selectionStart = selectionStart + clipboardText.length;
                        element.selectionEnd = element.selectionStart;
                    }
                }
            }), new actions_1.Separator(), 
            // Select All
            new actions_1.Action('editor.action.selectAll', (0, nls_1.localize)('selectAll', "Select All"), undefined, true, async () => document.execCommand('selectAll')));
        }
        registerListeners() {
            // Context menu support in input/textarea
            this.layoutService.container.addEventListener('contextmenu', e => this.onContextMenu(e));
        }
        onContextMenu(e) {
            if (e.defaultPrevented) {
                return; // make sure to not show these actions by accident if component indicated to prevent
            }
            const target = e.target;
            if (!(target instanceof HTMLElement) || (target.nodeName.toLowerCase() !== 'input' && target.nodeName.toLowerCase() !== 'textarea')) {
                return; // only for inputs or textareas
            }
            dom_1.EventHelper.stop(e, true);
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.textInputActions,
                getActionsContext: () => target,
            });
        }
    };
    exports.TextInputActionsProvider = TextInputActionsProvider;
    exports.TextInputActionsProvider = TextInputActionsProvider = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, clipboardService_1.IClipboardService)
    ], TextInputActionsProvider);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(TextInputActionsProvider, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dElucHV0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvdGV4dElucHV0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTtRQUl2RCxZQUMwQixhQUF1RCxFQUMzRCxrQkFBd0QsRUFDMUQsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBSmtDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3pDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFMaEUscUJBQWdCLEdBQWMsRUFBRSxDQUFDO1lBU3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8sYUFBYTtZQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSTtZQUV6QixZQUFZO1lBQ1osSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDdkcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDdkcsSUFBSSxtQkFBUyxFQUFFO1lBRWYscUJBQXFCO1lBQ3JCLElBQUks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