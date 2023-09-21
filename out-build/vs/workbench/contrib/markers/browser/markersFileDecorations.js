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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/markers/common/markers", "vs/workbench/services/decorations/common/decorations", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/markers/browser/markersFileDecorations", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, contributions_1, markers_1, decorations_1, lifecycle_1, nls_1, platform_1, colorRegistry_1, configuration_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MarkersDecorationsProvider {
        constructor(a) {
            this.a = a;
            this.label = (0, nls_1.localize)(0, null);
            this.onDidChange = a.onMarkerChanged;
        }
        provideDecorations(resource) {
            const markers = this.a.read({
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
                tooltip: markers.length === 1 ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null, markers.length),
                letter: markers.length < 10 ? markers.length.toString() : '9+',
                color: first.severity === markers_1.MarkerSeverity.Error ? colorRegistry_1.$Mx : colorRegistry_1.$Nx,
            };
        }
    }
    let MarkersFileDecorations = class MarkersFileDecorations {
        constructor(d, f, g) {
            this.d = d;
            this.f = f;
            this.g = g;
            //
            this.a = [
                this.g.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('problems')) {
                        this.h();
                    }
                }),
            ];
            this.h();
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.b);
            (0, lifecycle_1.$fc)(this.a);
        }
        h() {
            const value = this.g.getValue('problems');
            if (value.decorations.enabled === this.c) {
                return;
            }
            this.c = value.decorations.enabled;
            if (this.c) {
                const provider = new MarkersDecorationsProvider(this.d);
                this.b = this.f.registerDecorationsProvider(provider);
            }
            else if (this.b) {
                this.c = value.decorations.enabled;
                this.b.dispose();
            }
        }
    };
    MarkersFileDecorations = __decorate([
        __param(0, markers_1.$3s),
        __param(1, decorations_1.$Gcb),
        __param(2, configuration_1.$8h)
    ], MarkersFileDecorations);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'id': 'problems',
        'order': 101,
        'type': 'object',
        'properties': {
            'problems.decorations.enabled': {
                'description': (0, nls_1.localize)(3, null),
                'type': 'boolean',
                'default': true
            }
        }
    });
    // register file decorations
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(MarkersFileDecorations, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=markersFileDecorations.js.map