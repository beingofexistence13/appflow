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
define(["require", "exports", "vs/nls!vs/workbench/services/assignment/common/assignmentService", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/memento", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/assignment/common/assignmentService", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls_1, instantiation_1, memento_1, telemetry_1, storage_1, extensions_1, configuration_1, productService_1, platform_1, assignmentService_1, configuration_2, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$erb = exports.$drb = void 0;
    exports.$drb = (0, instantiation_1.$Bh)('WorkbenchAssignmentService');
    class MementoKeyValueStorage {
        constructor(b) {
            this.b = b;
            this.a = b.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        async getValue(key, defaultValue) {
            const value = await this.a[key];
            return value || defaultValue;
        }
        setValue(key, value) {
            this.a[key] = value;
            this.b.saveMemento();
        }
    }
    class WorkbenchAssignmentServiceTelemetry {
        constructor(b, c) {
            this.b = b;
            this.c = c;
        }
        get assignmentContext() {
            return this.a?.split(';');
        }
        // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        setSharedProperty(name, value) {
            if (name === this.c.tasConfig?.assignmentContextTelemetryPropertyName) {
                this.a = value;
            }
            this.b.setExperimentProperty(name, value);
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
            this.b.publicLog(eventName, data);
        }
    }
    let $erb = class $erb extends assignmentService_1.$crb {
        constructor(k, storageService, configurationService, productService) {
            super(k.machineId, configurationService, productService, new WorkbenchAssignmentServiceTelemetry(k, productService), new MementoKeyValueStorage(new memento_1.$YT('experiment.service.memento', storageService)));
            this.k = k;
        }
        get d() {
            return this.f.getValue('workbench.enableExperiments') === true;
        }
        async getTreatment(name) {
            const result = await super.getTreatment(name);
            this.k.publicLog2('tasClientReadTreatmentComplete', { treatmentName: name, treatmentValue: JSON.stringify(result) });
            return result;
        }
        async getCurrentExperiments() {
            if (!this.a) {
                return undefined;
            }
            if (!this.d) {
                return undefined;
            }
            await this.a;
            return this.h?.assignmentContext;
        }
    };
    exports.$erb = $erb;
    exports.$erb = $erb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, storage_1.$Vo),
        __param(2, configuration_1.$8h),
        __param(3, productService_1.$kj)
    ], $erb);
    (0, extensions_1.$mr)(exports.$drb, $erb, 1 /* InstantiationType.Delayed */);
    const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    registry.registerConfiguration({
        ...configuration_2.$$y,
        'properties': {
            'workbench.enableExperiments': {
                'type': 'boolean',
                'description': (0, nls_1.localize)(0, null),
                'default': true,
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'restricted': true,
                'tags': ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=assignmentService.js.map