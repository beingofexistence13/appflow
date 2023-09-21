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
    exports.$CSb = exports.$BSb = exports.$ASb = void 0;
    class $ASb extends lifecycle_1.$kc {
        constructor(options, b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.c = markers_1.MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(this.b);
            this.f = markers_1.MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(this.b);
            this.g = markers_1.MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(this.b);
            this.h = markers_1.MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(this.b);
            this.j = markers_1.MarkersContextKeys.ShowInfoFilterContextKey.bindTo(this.b);
            this.h.set(options.showErrors);
            this.g.set(options.showWarnings);
            this.j.set(options.showInfos);
            this.c.set(options.excludedFiles);
            this.f.set(options.activeFile);
            this.filterHistory = options.filterHistory;
        }
        get excludedFiles() {
            return !!this.c.get();
        }
        set excludedFiles(filesExclude) {
            if (this.c.get() !== filesExclude) {
                this.c.set(filesExclude);
                this.a.fire({ excludedFiles: true });
            }
        }
        get activeFile() {
            return !!this.f.get();
        }
        set activeFile(activeFile) {
            if (this.f.get() !== activeFile) {
                this.f.set(activeFile);
                this.a.fire({ activeFile: true });
            }
        }
        get showWarnings() {
            return !!this.g.get();
        }
        set showWarnings(showWarnings) {
            if (this.g.get() !== showWarnings) {
                this.g.set(showWarnings);
                this.a.fire({ showWarnings: true });
            }
        }
        get showErrors() {
            return !!this.h.get();
        }
        set showErrors(showErrors) {
            if (this.h.get() !== showErrors) {
                this.h.set(showErrors);
                this.a.fire({ showErrors: true });
            }
        }
        get showInfos() {
            return !!this.j.get();
        }
        set showInfos(showInfos) {
            if (this.j.get() !== showInfos) {
                this.j.set(showInfos);
                this.a.fire({ showInfos: true });
            }
        }
    }
    exports.$ASb = $ASb;
    class $BSb extends actions_1.$gi {
        static { this.ID = 'workbench.actions.problems.quickfix'; }
        static { this.a = 'markers-panel-action-quickfix ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.lightBulb); }
        static { this.b = $BSb.a + ' autofixable'; }
        get quickFixes() {
            return this.f;
        }
        set quickFixes(quickFixes) {
            this.f = quickFixes;
            this.enabled = this.f.length > 0;
        }
        autoFixable(autofixable) {
            this.class = autofixable ? $BSb.b : $BSb.a;
        }
        constructor(marker) {
            super($BSb.ID, messages_1.default.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, $BSb.a, false);
            this.marker = marker;
            this.c = this.B(new event_1.$fd());
            this.onShowQuickFixes = this.c.event;
            this.f = [];
        }
        run() {
            this.c.fire();
            return Promise.resolve();
        }
    }
    exports.$BSb = $BSb;
    let $CSb = class $CSb extends actionViewItems_1.$NQ {
        constructor(action, a) {
            super(null, action, { icon: true, label: false });
            this.a = a;
        }
        onClick(event) {
            DOM.$5O.stop(event, true);
            this.showQuickFixes();
        }
        showQuickFixes() {
            if (!this.element) {
                return;
            }
            if (!this.isEnabled()) {
                return;
            }
            const elementPosition = DOM.$FO(this.element);
            const quickFixes = this.action.quickFixes;
            if (quickFixes.length) {
                this.a.showContextMenu({
                    getAnchor: () => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }),
                    getActions: () => quickFixes
                });
            }
        }
    };
    exports.$CSb = $CSb;
    exports.$CSb = $CSb = __decorate([
        __param(1, contextView_1.$WZ)
    ], $CSb);
});
//# sourceMappingURL=markersViewActions.js.map