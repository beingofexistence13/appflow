/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/assignment/common/assignment", "vs/amdX"], function (require, exports, telemetryUtils_1, assignment_1, amdX_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$crb = void 0;
    class $crb {
        get d() {
            return true;
        }
        constructor(e, f, g, h, i) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.b = false;
            if (g.tasConfig && this.d && (0, telemetryUtils_1.$jo)(this.f) === 3 /* TelemetryLevel.USAGE */) {
                this.a = this.j();
            }
            // For development purposes, configure the delay until tas local tas treatment ovverrides are available
            const overrideDelaySetting = this.f.getValue('experiments.overrideDelay');
            const overrideDelay = typeof overrideDelaySetting === 'number' ? overrideDelaySetting : 0;
            this.c = new Promise(resolve => setTimeout(resolve, overrideDelay));
        }
        async getTreatment(name) {
            // For development purposes, allow overriding tas assignments to test variants locally.
            await this.c;
            const override = this.f.getValue('experiments.override.' + name);
            if (override !== undefined) {
                return override;
            }
            if (!this.a) {
                return undefined;
            }
            if (!this.d) {
                return undefined;
            }
            let result;
            const client = await this.a;
            // The TAS client is initialized but we need to check if the initial fetch has completed yet
            // If it is complete, return a cached value for the treatment
            // If not, use the async call with `checkCache: true`. This will allow the module to return a cached value if it is present.
            // Otherwise it will await the initial fetch to return the most up to date value.
            if (this.b) {
                result = client.getTreatmentVariable('vscode', name);
            }
            else {
                result = await client.getTreatmentVariableAsync('vscode', name, true);
            }
            result = client.getTreatmentVariable('vscode', name);
            return result;
        }
        async j() {
            const targetPopulation = this.g.quality === 'stable' ?
                assignment_1.TargetPopulation.Public : (this.g.quality === 'exploration' ?
                assignment_1.TargetPopulation.Exploration : assignment_1.TargetPopulation.Insiders);
            const filterProvider = new assignment_1.$brb(this.g.version, this.g.nameLong, this.e, targetPopulation);
            const tasConfig = this.g.tasConfig;
            const tasClient = new (await (0, amdX_1.$aD)('tas-client-umd', 'lib/tas-client-umd.js')).ExperimentationService({
                filterProviders: [filterProvider],
                telemetry: this.h,
                storageKey: assignment_1.$_qb,
                keyValueStorage: this.i,
                assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
                telemetryEventName: tasConfig.telemetryEventName,
                endpoint: tasConfig.endpoint,
                refetchInterval: assignment_1.$arb,
            });
            await tasClient.initializePromise;
            tasClient.initialFetch.then(() => this.b = true);
            return tasClient;
        }
    }
    exports.$crb = $crb;
});
//# sourceMappingURL=assignmentService.js.map