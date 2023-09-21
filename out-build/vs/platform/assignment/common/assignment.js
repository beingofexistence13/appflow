/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$brb = exports.Filters = exports.TargetPopulation = exports.$arb = exports.$_qb = void 0;
    exports.$_qb = 'VSCode.ABExp.FeatureData';
    exports.$arb = 0; // no polling
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
    class $brb {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        getFilterValue(filter) {
            switch (filter) {
                case Filters.ApplicationVersion:
                    return this.a; // productService.version
                case Filters.Build:
                    return this.b; // productService.nameLong
                case Filters.ClientId:
                    return this.c;
                case Filters.Language:
                    return platform.$v;
                case Filters.ExtensionName:
                    return 'vscode-core'; // always return vscode-core for exp service
                case Filters.ExtensionVersion:
                    return '999999.0'; // always return a very large number for cross-extension experimentation
                case Filters.TargetPopulation:
                    return this.d;
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
    exports.$brb = $brb;
});
//# sourceMappingURL=assignment.js.map