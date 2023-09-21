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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/markers/browser/messages", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/markers/common/markers", "vs/css!./markersViewActions"], function (require, exports, DOM, actions_1, contextView_1, messages_1, lifecycle_1, event_1, codicons_1, themables_1, actionViewItems_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickFixActionViewItem = exports.QuickFixAction = exports.MarkersFilters = void 0;
    class MarkersFilters extends lifecycle_1.Disposable {
        constructor(options, contextKeyService) {
            super();
            this.contextKeyService = contextKeyService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._excludedFiles = markers_1.MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(this.contextKeyService);
            this._activeFile = markers_1.MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(this.contextKeyService);
            this._showWarnings = markers_1.MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(this.contextKeyService);
            this._showErrors = markers_1.MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(this.contextKeyService);
            this._showInfos = markers_1.MarkersContextKeys.ShowInfoFilterContextKey.bindTo(this.contextKeyService);
            this._showErrors.set(options.showErrors);
            this._showWarnings.set(options.showWarnings);
            this._showInfos.set(options.showInfos);
            this._excludedFiles.set(options.excludedFiles);
            this._activeFile.set(options.activeFile);
            this.filterHistory = options.filterHistory;
        }
        get excludedFiles() {
            return !!this._excludedFiles.get();
        }
        set excludedFiles(filesExclude) {
            if (this._excludedFiles.get() !== filesExclude) {
                this._excludedFiles.set(filesExclude);
                this._onDidChange.fire({ excludedFiles: true });
            }
        }
        get activeFile() {
            return !!this._activeFile.get();
        }
        set activeFile(activeFile) {
            if (this._activeFile.get() !== activeFile) {
                this._activeFile.set(activeFile);
                this._onDidChange.fire({ activeFile: true });
            }
        }
        get showWarnings() {
            return !!this._showWarnings.get();
        }
        set showWarnings(showWarnings) {
            if (this._showWarnings.get() !== showWarnings) {
                this._showWarnings.set(showWarnings);
                this._onDidChange.fire({ showWarnings: true });
            }
        }
        get showErrors() {
            return !!this._showErrors.get();
        }
        set showErrors(showErrors) {
            if (this._showErrors.get() !== showErrors) {
                this._showErrors.set(showErrors);
                this._onDidChange.fire({ showErrors: true });
            }
        }
        get showInfos() {
            return !!this._showInfos.get();
        }
        set showInfos(showInfos) {
            if (this._showInfos.get() !== showInfos) {
                this._showInfos.set(showInfos);
                this._onDidChange.fire({ showInfos: true });
            }
        }
    }
    exports.MarkersFilters = MarkersFilters;
    class QuickFixAction extends actions_1.Action {
        static { this.ID = 'workbench.actions.problems.quickfix'; }
        static { this.CLASS = 'markers-panel-action-quickfix ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.lightBulb); }
        static { this.AUTO_FIX_CLASS = QuickFixAction.CLASS + ' autofixable'; }
        get quickFixes() {
            return this._quickFixes;
        }
        set quickFixes(quickFixes) {
            this._quickFixes = quickFixes;
            this.enabled = this._quickFixes.length > 0;
        }
        autoFixable(autofixable) {
            this.class = autofixable ? QuickFixAction.AUTO_FIX_CLASS : QuickFixAction.CLASS;
        }
        constructor(marker) {
            super(QuickFixAction.ID, messages_1.default.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, QuickFixAction.CLASS, false);
            this.marker = marker;
            this._onShowQuickFixes = this._register(new event_1.Emitter());
            this.onShowQuickFixes = this._onShowQuickFixes.event;
            this._quickFixes = [];
        }
        run() {
            this._onShowQuickFixes.fire();
            return Promise.resolve();
        }
    }
    exports.QuickFixAction = QuickFixAction;
    let QuickFixActionViewItem = class QuickFixActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, contextMenuService) {
            super(null, action, { icon: true, label: false });
            this.contextMenuService = contextMenuService;
        }
        onClick(event) {
            DOM.EventHelper.stop(event, true);
            this.showQuickFixes();
        }
        showQuickFixes() {
            if (!this.element) {
                return;
            }
            if (!this.isEnabled()) {
                return;
            }
            const elementPosition = DOM.getDomNodePagePosition(this.element);
            const quickFixes = this.action.quickFixes;
            if (quickFixes.length) {
                this.contextMenuService.showContextMenu({
                    getAnchor: () => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }),
                    getActions: () => quickFixes
                });
            }
        }
    };
    exports.QuickFixActionViewItem = QuickFixActionViewItem;
    exports.QuickFixActionViewItem = QuickFixActionViewItem = __decorate([
        __param(1, contextView_1.IContextMenuService)
    ], QuickFixActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1ZpZXdBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWFya2Vycy9icm93c2VyL21hcmtlcnNWaWV3QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ2hHLE1BQWEsY0FBZSxTQUFRLHNCQUFVO1FBSzdDLFlBQVksT0FBK0IsRUFBbUIsaUJBQXFDO1lBQ2xHLEtBQUssRUFBRSxDQUFDO1lBRHFELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFIbEYsaUJBQVksR0FBd0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBOEIsQ0FBQyxDQUFDO1lBQ3RILGdCQUFXLEdBQXNDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBZWpFLG1CQUFjLEdBQUcsNEJBQWtCLENBQUMsaUNBQWlDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBV3JHLGdCQUFXLEdBQUcsNEJBQWtCLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBVy9GLGtCQUFhLEdBQUcsNEJBQWtCLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBVy9GLGdCQUFXLEdBQUcsNEJBQWtCLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBVzNGLGVBQVUsR0FBRyw0QkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUF0RHhHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxJQUFJLENB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