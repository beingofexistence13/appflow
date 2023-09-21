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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/contrib/gotoError/browser/markerNavigationService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/markers/common/markers", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/base/common/decorators", "vs/platform/theme/common/colorRegistry", "vs/base/common/resources"], function (require, exports, platform_1, contributions_1, markerNavigationService_1, notebookCommon_1, markers_1, configuration_1, lifecycle_1, notebookBrowser_1, notebookEditorExtensions_1, decorators_1, colorRegistry_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let MarkerListProvider = class MarkerListProvider {
        constructor(b, markerNavigation, c) {
            this.b = b;
            this.c = c;
            this.a = markerNavigation.registerProvider(this);
        }
        dispose() {
            this.a.dispose();
        }
        getMarkerList(resource) {
            if (!resource) {
                return undefined;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            if (!data) {
                return undefined;
            }
            return new markerNavigationService_1.$a5(uri => {
                const otherData = notebookCommon_1.CellUri.parse(uri);
                return otherData?.notebook.toString() === data.notebook.toString();
            }, this.b, this.c);
        }
    };
    MarkerListProvider = __decorate([
        __param(0, markers_1.$3s),
        __param(1, markerNavigationService_1.$b5),
        __param(2, configuration_1.$8h)
    ], MarkerListProvider);
    let NotebookMarkerDecorationContribution = class NotebookMarkerDecorationContribution extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.markerDecoration'; }
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = [];
            this.f();
            this.B(this.b.onDidChangeModel(() => this.f()));
            this.B(this.c.onMarkerChanged(e => {
                if (e.some(uri => this.b.getCellsInRange().some(cell => (0, resources_1.$bg)(cell.uri, uri)))) {
                    this.f();
                }
            }));
        }
        f() {
            if (!this.b.hasModel()) {
                return;
            }
            const cellDecorations = [];
            this.b.getCellsInRange().forEach(cell => {
                const marker = this.c.read({ resource: cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                marker.forEach(m => {
                    const color = m.severity === markers_1.MarkerSeverity.Error ? colorRegistry_1.$lw : colorRegistry_1.$ow;
                    const range = { startLineNumber: m.startLineNumber, startColumn: m.startColumn, endLineNumber: m.endLineNumber, endColumn: m.endColumn };
                    cellDecorations.push({
                        handle: cell.handle,
                        options: {
                            overviewRuler: {
                                color: color,
                                modelRanges: [range],
                                includeOutput: false,
                                position: notebookBrowser_1.NotebookOverviewRulerLane.Right
                            }
                        }
                    });
                });
            });
            this.a = this.b.deltaCellDecorations(this.a, cellDecorations);
        }
    };
    __decorate([
        (0, decorators_1.$8g)(100)
    ], NotebookMarkerDecorationContribution.prototype, "f", null);
    NotebookMarkerDecorationContribution = __decorate([
        __param(1, markers_1.$3s)
    ], NotebookMarkerDecorationContribution);
    platform_1.$8m
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(MarkerListProvider, 2 /* LifecyclePhase.Ready */);
    (0, notebookEditorExtensions_1.$Fnb)(NotebookMarkerDecorationContribution.id, NotebookMarkerDecorationContribution);
});
//# sourceMappingURL=markerProvider.js.map