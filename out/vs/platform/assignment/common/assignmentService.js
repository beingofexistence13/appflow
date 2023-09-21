/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/assignment/common/assignment", "vs/amdX"], function (require, exports, telemetryUtils_1, assignment_1, amdX_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseAssignmentService = void 0;
    class BaseAssignmentService {
        get experimentsEnabled() {
            return true;
        }
        constructor(machineId, configurationService, productService, telemetry, keyValueStorage) {
            this.machineId = machineId;
            this.configurationService = configurationService;
            this.productService = productService;
            this.telemetry = telemetry;
            this.keyValueStorage = keyValueStorage;
            this.networkInitialized = false;
            if (productService.tasConfig && this.experimentsEnabled && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) === 3 /* TelemetryLevel.USAGE */) {
                this.tasClient = this.setupTASClient();
            }
            // For development purposes, configure the delay until tas local tas treatment ovverrides are available
            const overrideDelaySetting = this.configurationService.getValue('experiments.overrideDelay');
            const overrideDelay = typeof overrideDelaySetting === 'number' ? overrideDelaySetting : 0;
            this.overrideInitDelay = new Promise(resolve => setTimeout(resolve, overrideDelay));
        }
        async getTreatment(name) {
            // For development purposes, allow overriding tas assignments to test variants locally.
            await this.overrideInitDelay;
            const override = this.configurationService.getValue('experiments.override.' + name);
            if (override !== undefined) {
                return override;
            }
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            let result;
            const client = await this.tasClient;
            // The TAS client is initialized but we need to check if the initial fetch has completed yet
            // If it is complete, return a cached value for the treatment
            // If not, use the async call with `checkCache: true`. This will allow the module to return a cached value if it is present.
            // Otherwise it will await the initial fetch to return the most up to date value.
            if (this.networkInitialized) {
                result = client.getTreatmentVariable('vscode', name);
            }
            else {
                result = await client.getTreatmentVariableAsync('vscode', name, true);
            }
            result = client.getTreatmentVariable('vscode', name);
            return result;
        }
        async setupTASClient() {
            const targetPopulation = this.productService.quality === 'stable' ?
                assignment_1.TargetPopulation.Public : (this.productService.quality === 'exploration' ?
                assignment_1.TargetPopulation.Exploration : assignment_1.TargetPopulation.Insiders);
            const filterProvider = new assignment_1.AssignmentFilterProvider(this.productService.version, this.productService.nameLong, this.machineId, targetPopulation);
            const tasConfig = this.productService.tasConfig;
            const tasClient = new (await (0, amdX_1.importAMDNodeModule)('tas-client-umd', 'lib/tas-client-umd.js')).ExperimentationService({
                filterProviders: [filterProvider],
                telemetry: this.telemetry,
                storageKey: assignment_1.ASSIGNMENT_STORAGE_KEY,
                keyValueStorage: this.keyValueStorage,
                assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
                telemetryEventName: tasConfig.telemetryEventName,
                endpoint: tasConfig.endpoint,
                refetchInterval: assignment_1.ASSIGNMENT_REFETCH_INTERVAL,
            });
            await tasClient.initializePromise;
            tasClient.initialFetch.then(() => this.networkInitialized = true);
            return tasClient;
        }
    }
    exports.BaseAssignmentService = BaseAssignmentService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWdubWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hc3NpZ25tZW50L2NvbW1vbi9hc3NpZ25tZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBc0IscUJBQXFCO1FBTTFDLElBQWMsa0JBQWtCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELFlBQ2tCLFNBQWlCLEVBQ2Ysb0JBQTJDLEVBQzNDLGNBQStCLEVBQ3hDLFNBQW9DLEVBQ3RDLGVBQWtDO1lBSnpCLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDZix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN4QyxjQUFTLEdBQVQsU0FBUyxDQUEyQjtZQUN0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBbUI7WUFabkMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1lBZWxDLElBQUksY0FBYyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBQSxrQ0FBaUIsRUFBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsaUNBQXlCLEVBQUU7Z0JBQ2pJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ3ZDO1lBRUQsdUdBQXVHO1lBQ3ZHLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sYUFBYSxHQUFHLE9BQU8sb0JBQW9CLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUs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