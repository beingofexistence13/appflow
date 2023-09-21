/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AssignmentFilterProvider = exports.Filters = exports.TargetPopulation = exports.ASSIGNMENT_REFETCH_INTERVAL = exports.ASSIGNMENT_STORAGE_KEY = void 0;
    exports.ASSIGNMENT_STORAGE_KEY = 'VSCode.ABExp.FeatureData';
    exports.ASSIGNMENT_REFETCH_INTERVAL = 0; // no polling
    var TargetPopulation;
    (function (TargetPopulation) {
        TargetPopulation["Insiders"] = "insider";
        TargetPopulation["Public"] = "public";
        TargetPopulation["Exploration"] = "exploration";
    })(TargetPopulation || (exports.TargetPopulation = TargetPopulation = {}));
    /*
    Based upon the official VSCode currently existing filters in the
    ExP backend for the VSCode cluster.
    https://experimentation.visualstudio.com/Analysis%20and%20Experimentation/_git/AnE.ExP.TAS.TachyonHost.Configuration?path=%2FConfigurations%2Fvscode%2Fvscode.json&version=GBmaster
    "X-MSEdge-Market": "detection.market",
    "X-FD-Corpnet": "detection.corpnet",
    "X-VSCode-AppVersion": "appversion",
    "X-VSCode-Build": "build",
    "X-MSEdge-ClientId": "clientid",
    "X-VSCode-ExtensionName": "extensionname",
    "X-VSCode-ExtensionVersion": "extensionversion",
    "X-VSCode-TargetPopulation": "targetpopulation",
    "X-VSCode-Language": "language"
    */
    var Filters;
    (function (Filters) {
        /**
         * The market in which the extension is distributed.
         */
        Filters["Market"] = "X-MSEdge-Market";
        /**
         * The corporation network.
         */
        Filters["CorpNet"] = "X-FD-Corpnet";
        /**
         * Version of the application which uses experimentation service.
         */
        Filters["ApplicationVersion"] = "X-VSCode-AppVersion";
        /**
         * Insiders vs Stable.
         */
        Filters["Build"] = "X-VSCode-Build";
        /**
         * Client Id which is used as primary unit for the experimentation.
         */
        Filters["ClientId"] = "X-MSEdge-ClientId";
        /**
         * Extension header.
         */
        Filters["ExtensionName"] = "X-VSCode-ExtensionName";
        /**
         * The version of the extension.
         */
        Filters["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
        /**
         * The language in use by VS Code
         */
        Filters["Language"] = "X-VSCode-Language";
        /**
         * The target population.
         * This is used to separate internal, early preview, GA, etc.
         */
        Filters["TargetPopulation"] = "X-VSCode-TargetPopulation";
    })(Filters || (exports.Filters = Filters = {}));
    class AssignmentFilterProvider {
        constructor(version, appName, machineId, targetPopulation) {
            this.version = version;
            this.appName = appName;
            this.machineId = machineId;
            this.targetPopulation = targetPopulation;
        }
        getFilterValue(filter) {
            switch (filter) {
                case Filters.ApplicationVersion:
                    return this.version; // productService.version
                case Filters.Build:
                    return this.appName; // productService.nameLong
                case Filters.ClientId:
                    return this.machineId;
                case Filters.Language:
                    return platform.language;
                case Filters.ExtensionName:
                    return 'vscode-core'; // always return vscode-core for exp service
                case Filters.ExtensionVersion:
                    return '999999.0'; // always return a very large number for cross-extension experimentation
                case Filters.TargetPopulation:
                    return this.targetPopulation;
                default:
                    return '';
            }
        }
        getFilters() {
            const filters = new Map();
            const filterValues = Object.values(Filters);
            for (const value of filterValues) {
                filters.set(value, this.getFilterValue(value));
            }
            return filters;
        }
    }
    exports.AssignmentFilterProvider = AssignmentFilterProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWdubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Fzc2lnbm1lbnQvY29tbW9uL2Fzc2lnbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS25GLFFBQUEsc0JBQXNCLEdBQUcsMEJBQTBCLENBQUM7SUFDcEQsUUFBQSwyQkFBMkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhO0lBTzNELElBQVksZ0JBSVg7SUFKRCxXQUFZLGdCQUFnQjtRQUMzQix3Q0FBb0IsQ0FBQTtRQUNwQixxQ0FBaUIsQ0FBQTtRQUNqQiwrQ0FBMkIsQ0FBQTtJQUM1QixDQUFDLEVBSlcsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFJM0I7SUFFRDs7Ozs7Ozs7Ozs7OztNQWFFO0lBQ0YsSUFBWSxPQThDWDtJQTlDRCxXQUFZLE9BQU87UUFDbEI7O1dBRUc7UUFDSCxxQ0FBMEIsQ0FBQTtRQUUxQjs7V0FFRztRQUNILG1DQUF3QixDQUFBO1FBRXhCOztXQUVHO1FBQ0gscURBQTBDLENBQUE7UUFFMUM7O1dBRUc7UUFDSCxtQ0FBd0IsQ0FBQTtRQUV4Qjs7V0FFRztRQUNILHlDQUE4QixDQUFBO1FBRTlCOztXQUVHO1FBQ0gsbURBQXdDLENBQUE7UUFFeEM7O1dBRUc7UUFDSCx5REFBOEMsQ0FBQTtRQUU5Qzs7V0FFRztRQUNILHlDQUE4QixDQUFBO1FBRTlCOzs7V0FHRztRQUNILHlEQUE4QyxDQUFBO0lBQy9DLENBQUMsRUE5Q1csT0FBTyx1QkFBUCxPQUFPLFFBOENsQjtJQUVELE1BQWEsd0JBQXdCO1FBQ3BDLFlBQ1MsT0FBZSxFQUNmLE9BQWUsRUFDZixTQUFpQixFQUNqQixnQkFBa0M7WUFIbEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDZixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDdkMsQ0FBQztRQUVMLGNBQWMsQ0FBQyxNQUFjO1lBQzVCLFFBQVEsTUFBTSxFQUFFO2dCQUNmLEtBQUssT0FBTyxDQUFDLGtCQUFrQjtvQkFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMseUJBQXlCO2dCQUMvQyxLQUFLLE9BQU8sQ0FBQyxLQUFLO29CQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQywwQkFBMEI7Z0JBQ2hELEtBQUssT0FBTyxDQUFDLFFBQVE7b0JBQ3BCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDdkIsS0FBSyxPQUFPLENBQUMsUUFBUTtvQkFDcEIsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDO2dCQUMxQixLQUFLLE9BQU8sQ0FBQyxhQUFhO29CQUN6QixPQUFPLGFBQWEsQ0FBQyxDQUFDLDRDQUE0QztnQkFDbkUsS0FBSyxPQUFPLENBQUMsZ0JBQWdCO29CQUM1QixPQUFPLFVBQVUsQ0FBQyxDQUFDLHdFQUF3RTtnQkFDNUYsS0FBSyxPQUFPLENBQUMsZ0JBQWdCO29CQUM1QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDOUI7b0JBQ0MsT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNGLENBQUM7UUFFRCxVQUFVO1lBQ1QsTUFBTSxPQUFPLEdBQXFCLElBQUksR0FBRyxFQUFlLENBQUM7WUFDekQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxLQUFLLE1BQU0sS0FBSyxJQUFJLFlBQVksRUFBRTtnQkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztLQUNEO0lBdENELDREQXNDQyJ9