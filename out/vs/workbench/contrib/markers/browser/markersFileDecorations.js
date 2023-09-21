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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/markers/common/markers", "vs/workbench/services/decorations/common/decorations", "vs/base/common/lifecycle", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, contributions_1, markers_1, decorations_1, lifecycle_1, nls_1, platform_1, colorRegistry_1, configuration_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MarkersDecorationsProvider {
        constructor(_markerService) {
            this._markerService = _markerService;
            this.label = (0, nls_1.localize)('label', "Problems");
            this.onDidChange = _markerService.onMarkerChanged;
        }
        provideDecorations(resource) {
            const markers = this._markerService.read({
                resource,
                severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning
            });
            let first;
            for (const marker of markers) {
                if (!first || marker.severity > first.severity) {
                    first = marker;
                }
            }
            if (!first) {
                return undefined;
            }
            return {
                weight: 100 * first.severity,
                bubble: true,
                tooltip: markers.length === 1 ? (0, nls_1.localize)('tooltip.1', "1 problem in this file") : (0, nls_1.localize)('tooltip.N', "{0} problems in this file", markers.length),
                letter: markers.length < 10 ? markers.length.toString() : '9+',
                color: first.severity === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground,
            };
        }
    }
    let MarkersFileDecorations = class MarkersFileDecorations {
        constructor(_markerService, _decorationsService, _configurationService) {
            this._markerService = _markerService;
            this._decorationsService = _decorationsService;
            this._configurationService = _configurationService;
            //
            this._disposables = [
                this._configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('problems')) {
                        this._updateEnablement();
                    }
                }),
            ];
            this._updateEnablement();
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._provider);
            (0, lifecycle_1.dispose)(this._disposables);
        }
        _updateEnablement() {
            const value = this._configurationService.getValue('problems');
            if (value.decorations.enabled === this._enabled) {
                return;
            }
            this._enabled = value.decorations.enabled;
            if (this._enabled) {
                const provider = new MarkersDecorationsProvider(this._markerService);
                this._provider = this._decorationsService.registerDecorationsProvider(provider);
            }
            else if (this._provider) {
                this._enabled = value.decorations.enabled;
                this._provider.dispose();
            }
        }
    };
    MarkersFileDecorations = __decorate([
        __param(0, markers_1.IMarkerService),
        __param(1, decorations_1.IDecorationsService),
        __param(2, configuration_1.IConfigurationService)
    ], MarkersFileDecorations);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': 'problems',
        'order': 101,
        'type': 'object',
        'properties': {
            'problems.decorations.enabled': {
                'description': (0, nls_1.localize)('markers.showOnFile', "Show Errors & Warnings on files and folder."),
                'type': 'boolean',
                'default': true
            }
        }
    });
    // register file decorations
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(MarkersFileDecorations, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc0ZpbGVEZWNvcmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21hcmtlcnMvYnJvd3Nlci9tYXJrZXJzRmlsZURlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBZWhHLE1BQU0sMEJBQTBCO1FBSy9CLFlBQ2tCLGNBQThCO1lBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUp2QyxVQUFLLEdBQVcsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBTXRELElBQUksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQztRQUNuRCxDQUFDO1FBRUQsa0JBQWtCLENBQUMsUUFBYTtZQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztnQkFDeEMsUUFBUTtnQkFDUixVQUFVLEVBQUUsd0JBQWMsQ0FBQyxLQUFLLEdBQUcsd0JBQWMsQ0FBQyxPQUFPO2FBQ3pELENBQUMsQ0FBQztZQUNILElBQUksS0FBMEIsQ0FBQztZQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQy9DLEtBQUssR0FBRyxNQUFNLENBQUM7aUJBQ2Y7YUFDRDtZQUVELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxPQUFPO2dCQUNOLE1BQU0sRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVE7Z0JBQzVCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxj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