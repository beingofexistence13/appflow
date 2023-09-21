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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/memento", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/assignment/common/assignmentService", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls_1, instantiation_1, memento_1, telemetry_1, storage_1, extensions_1, configuration_1, productService_1, platform_1, assignmentService_1, configuration_2, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchAssignmentService = exports.IWorkbenchAssignmentService = void 0;
    exports.IWorkbenchAssignmentService = (0, instantiation_1.createDecorator)('WorkbenchAssignmentService');
    class MementoKeyValueStorage {
        constructor(memento) {
            this.memento = memento;
            this.mementoObj = memento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        async getValue(key, defaultValue) {
            const value = await this.mementoObj[key];
            return value || defaultValue;
        }
        setValue(key, value) {
            this.mementoObj[key] = value;
            this.memento.saveMemento();
        }
    }
    class WorkbenchAssignmentServiceTelemetry {
        constructor(telemetryService, productService) {
            this.telemetryService = telemetryService;
            this.productService = productService;
        }
        get assignmentContext() {
            return this._lastAssignmentContext?.split(';');
        }
        // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        setSharedProperty(name, value) {
            if (name === this.productService.tasConfig?.assignmentContextTelemetryPropertyName) {
                this._lastAssignmentContext = value;
            }
            this.telemetryService.setExperimentProperty(name, value);
        }
        postEvent(eventName, props) {
            const data = {};
            for (const [key, value] of props.entries()) {
                data[key] = value;
            }
            /* __GDPR__
                "query-expfeature" : {
                    "owner": "sbatten",
                    "comment": "Logs queries to the experiment service by feature for metric calculations",
                    "ABExp.queriedFeature": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The experimental feature being queried" }
                }
            */
            this.telemetryService.publicLog(eventName, data);
        }
    }
    let WorkbenchAssignmentService = class WorkbenchAssignmentService extends assignmentService_1.BaseAssignmentService {
        constructor(telemetryService, storageService, configurationService, productService) {
            super(telemetryService.machineId, configurationService, productService, new WorkbenchAssignmentServiceTelemetry(telemetryService, productService), new MementoKeyValueStorage(new memento_1.Memento('experiment.service.memento', storageService)));
            this.telemetryService = telemetryService;
        }
        get experimentsEnabled() {
            return this.configurationService.getValue('workbench.enableExperiments') === true;
        }
        async getTreatment(name) {
            const result = await super.getTreatment(name);
            this.telemetryService.publicLog2('tasClientReadTreatmentComplete', { treatmentName: name, treatmentValue: JSON.stringify(result) });
            return result;
        }
        async getCurrentExperiments() {
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            await this.tasClient;
            return this.telemetry?.assignmentContext;
        }
    };
    exports.WorkbenchAssignmentService = WorkbenchAssignmentService;
    exports.WorkbenchAssignmentService = WorkbenchAssignmentService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService)
    ], WorkbenchAssignmentService);
    (0, extensions_1.registerSingleton)(exports.IWorkbenchAssignmentService, WorkbenchAssignmentService, 1 /* InstantiationType.Delayed */);
    const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    registry.registerConfiguration({
        ...configuration_2.workbenchConfigurationNodeBase,
        'properties': {
            'workbench.enableExperiments': {
                'type': 'boolean',
                'description': (0, nls_1.localize)('workbench.enableExperiments', "Fetches experiments to run from a Microsoft online service."),
                'default': true,
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'restricted': true,
                'tags': ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWdubWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvYXNzaWdubWVudC9jb21tb24vYXNzaWdubWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JuRixRQUFBLDJCQUEyQixHQUFHLElBQUEsK0JBQWUsRUFBOEIsNEJBQTRCLENBQUMsQ0FBQztJQU10SCxNQUFNLHNCQUFzQjtRQUUzQixZQUFvQixPQUFnQjtZQUFoQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsa0VBQWlELENBQUM7UUFDdkYsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUksR0FBVyxFQUFFLFlBQTRCO1lBQzFELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxPQUFPLEtBQUssSUFBSSxZQUFZLENBQUM7UUFDOUIsQ0FBQztRQUVELFFBQVEsQ0FBSSxHQUFXLEVBQUUsS0FBUTtZQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQUVELE1BQU0sbUNBQW1DO1FBRXhDLFlBQ1MsZ0JBQW1DLEVBQ25DLGNBQStCO1lBRC9CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDbkMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBQ3BDLENBQUM7UUFFTCxJQUFJLGlCQUFpQjtZQUNwQixPQUFPLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELG1IQUFtSDtRQUNu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