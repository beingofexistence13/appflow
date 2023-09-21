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
        constructor(_markerService, markerNavigation, _configService) {
            this._markerService = _markerService;
            this._configService = _configService;
            this._dispoables = markerNavigation.registerProvider(this);
        }
        dispose() {
            this._dispoables.dispose();
        }
        getMarkerList(resource) {
            if (!resource) {
                return undefined;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            if (!data) {
                return undefined;
            }
            return new markerNavigationService_1.MarkerList(uri => {
                const otherData = notebookCommon_1.CellUri.parse(uri);
                return otherData?.notebook.toString() === data.notebook.toString();
            }, this._markerService, this._configService);
        }
    };
    MarkerListProvider = __decorate([
        __param(0, markers_1.IMarkerService),
        __param(1, markerNavigationService_1.IMarkerNavigationService),
        __param(2, configuration_1.IConfigurationService)
    ], MarkerListProvider);
    let NotebookMarkerDecorationContribution = class NotebookMarkerDecorationContribution extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.markerDecoration'; }
        constructor(_notebookEditor, _markerService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._markerService = _markerService;
            this._markersOverviewRulerDecorations = [];
            this._update();
            this._register(this._notebookEditor.onDidChangeModel(() => this._update()));
            this._register(this._markerService.onMarkerChanged(e => {
                if (e.some(uri => this._notebookEditor.getCellsInRange().some(cell => (0, resources_1.isEqual)(cell.uri, uri)))) {
                    this._update();
                }
            }));
        }
        _update() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const cellDecorations = [];
            this._notebookEditor.getCellsInRange().forEach(cell => {
                const marker = this._markerService.read({ resource: cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                marker.forEach(m => {
                    const color = m.severity === markers_1.MarkerSeverity.Error ? colorRegistry_1.editorErrorForeground : colorRegistry_1.editorWarningForeground;
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
            this._markersOverviewRulerDecorations = this._notebookEditor.deltaCellDecorations(this._markersOverviewRulerDecorations, cellDecorations);
        }
    };
    __decorate([
        (0, decorators_1.throttle)(100)
    ], NotebookMarkerDecorationContribution.prototype, "_update", null);
    NotebookMarkerDecorationContribution = __decorate([
        __param(1, markers_1.IMarkerService)
    ], NotebookMarkerDecorationContribution);
    platform_1.Registry
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(MarkerListProvider, 2 /* LifecyclePhase.Ready */);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookMarkerDecorationContribution.id, NotebookMarkerDecorationContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvbWFya2VyL21hcmtlclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBaUJoRyxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtRQUl2QixZQUNrQyxjQUE4QixFQUNyQyxnQkFBMEMsRUFDNUIsY0FBcUM7WUFGNUMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBRXZCLG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtZQUU3RSxJQUFJLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsYUFBYSxDQUFDLFFBQXlCO1lBQ3RDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxNQUFNLElBQUksR0FBRyx3QkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxJQUFJLG9DQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sU0FBUyxHQUFHLHdCQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENB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