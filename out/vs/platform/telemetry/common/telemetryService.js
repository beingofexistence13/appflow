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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, lifecycle_1, objects_1, platform_1, strings_1, nls_1, configuration_1, configurationRegistry_1, product_1, productService_1, platform_2, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryService = void 0;
    let TelemetryService = class TelemetryService {
        static { this.IDLE_START_EVENT_NAME = 'UserIdleStart'; }
        static { this.IDLE_STOP_EVENT_NAME = 'UserIdleStop'; }
        constructor(config, _configurationService, _productService) {
            this._configurationService = _configurationService;
            this._productService = _productService;
            this._experimentProperties = {};
            this._disposables = new lifecycle_1.DisposableStore();
            this._cleanupPatterns = [];
            this._appenders = config.appenders;
            this._commonProperties = config.commonProperties ?? Object.create(null);
            this.sessionId = this._commonProperties['sessionID'];
            this.machineId = this._commonProperties['common.machineId'];
            this.firstSessionDate = this._commonProperties['common.firstSessionDate'];
            this.msftInternal = this._commonProperties['common.msftInternal'];
            this._piiPaths = config.piiPaths || [];
            this._telemetryLevel = 3 /* TelemetryLevel.USAGE */;
            this._sendErrorTelemetry = !!config.sendErrorTelemetry;
            // static cleanup pattern for: `vscode-file:///DANGEROUS/PATH/resources/app/Useful/Information`
            this._cleanupPatterns = [/(vscode-)?file:\/\/\/.*?\/resources\/app\//gi];
            for (const piiPath of this._piiPaths) {
                this._cleanupPatterns.push(new RegExp((0, strings_1.escapeRegExpCharacters)(piiPath), 'gi'));
                if (piiPath.indexOf('\\') >= 0) {
                    this._cleanupPatterns.push(new RegExp((0, strings_1.escapeRegExpCharacters)(piiPath.replace(/\\/g, '/')), 'gi'));
                }
            }
            this._updateTelemetryLevel();
            this._disposables.add(this._configurationService.onDidChangeConfiguration(e => {
                // Check on the telemetry settings and update the state if changed
                const affectsTelemetryConfig = e.affectsConfiguration(telemetry_1.TELEMETRY_SETTING_ID)
                    || e.affectsConfiguration(telemetry_1.TELEMETRY_OLD_SETTING_ID)
                    || e.affectsConfiguration(telemetry_1.TELEMETRY_CRASH_REPORTER_SETTING_ID);
                if (affectsTelemetryConfig) {
                    this._updateTelemetryLevel();
                }
            }));
        }
        setExperimentProperty(name, value) {
            this._experimentProperties[name] = value;
        }
        _updateTelemetryLevel() {
            let level = (0, telemetryUtils_1.getTelemetryLevel)(this._configurationService);
            const collectableTelemetry = this._productService.enabledTelemetryLevels;
            // Also ensure that error telemetry is respecting the product configuration for collectable telemetry
            if (collectableTelemetry) {
                this._sendErrorTelemetry = this.sendErrorTelemetry ? collectableTelemetry.error : false;
                // Make sure the telemetry level from the service is the minimum of the config and product
                const maxCollectableTelemetryLevel = collectableTelemetry.usage ? 3 /* TelemetryLevel.USAGE */ : collectableTelemetry.error ? 2 /* TelemetryLevel.ERROR */ : 0 /* TelemetryLevel.NONE */;
                level = Math.min(level, maxCollectableTelemetryLevel);
            }
            this._telemetryLevel = level;
        }
        get sendErrorTelemetry() {
            return this._sendErrorTelemetry;
        }
        get telemetryLevel() {
            return this._telemetryLevel;
        }
        dispose() {
            this._disposables.dispose();
        }
        _log(eventName, eventLevel, data) {
            // don't send events when the user is optout
            if (this._telemetryLevel < eventLevel) {
                return;
            }
            // add experiment properties
            data = (0, objects_1.mixin)(data, this._experimentProperties);
            // remove all PII from data
            data = (0, telemetryUtils_1.cleanData)(data, this._cleanupPatterns);
            // add common properties
            data = (0, objects_1.mixin)(data, this._commonProperties);
            // Log to the appenders of sufficient level
            this._appenders.forEach(a => a.log(eventName, data));
        }
        publicLog(eventName, data) {
            this._log(eventName, 3 /* TelemetryLevel.USAGE */, data);
        }
        publicLog2(eventName, data) {
            this.publicLog(eventName, data);
        }
        publicLogError(errorEventName, data) {
            if (!this._sendErrorTelemetry) {
                return;
            }
            // Send error event and anonymize paths
            this._log(errorEventName, 2 /* TelemetryLevel.ERROR */, data);
        }
        publicLogError2(eventName, data) {
            this.publicLogError(eventName, data);
        }
    };
    exports.TelemetryService = TelemetryService;
    exports.TelemetryService = TelemetryService = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, productService_1.IProductService)
    ], TelemetryService);
    function getTelemetryLevelSettingDescription() {
        const telemetryText = (0, nls_1.localize)('telemetry.telemetryLevelMd', "Controls {0} telemetry, first-party extension telemetry, and participating third-party extension telemetry. Some third party extensions might not respect this setting. Consult the specific extension's documentation to be sure. Telemetry helps us better understand how {0} is performing, where improvements need to be made, and how features are being used.", product_1.default.nameLong);
        const externalLinksStatement = !product_1.default.privacyStatementUrl ?
            (0, nls_1.localize)("telemetry.docsStatement", "Read more about the [data we collect]({0}).", 'https://aka.ms/vscode-telemetry') :
            (0, nls_1.localize)("telemetry.docsAndPrivacyStatement", "Read more about the [data we collect]({0}) and our [privacy statement]({1}).", 'https://aka.ms/vscode-telemetry', product_1.default.privacyStatementUrl);
        const restartString = !platform_1.isWeb ? (0, nls_1.localize)('telemetry.restart', 'A full restart of the application is necessary for crash reporting changes to take effect.') : '';
        const crashReportsHeader = (0, nls_1.localize)('telemetry.crashReports', "Crash Reports");
        const errorsHeader = (0, nls_1.localize)('telemetry.errors', "Error Telemetry");
        const usageHeader = (0, nls_1.localize)('telemetry.usage', "Usage Data");
        const telemetryTableDescription = (0, nls_1.localize)('telemetry.telemetryLevel.tableDescription', "The following table outlines the data sent with each setting:");
        const telemetryTable = `
|       | ${crashReportsHeader} | ${errorsHeader} | ${usageHeader} |
|:------|:---------------------:|:---------------:|:--------------:|
| all   |            ✓          |        ✓        |        ✓       |
| error |            ✓          |        ✓        |        -       |
| crash |            ✓          |        -        |        -       |
| off   |            -          |        -        |        -       |
`;
        const deprecatedSettingNote = (0, nls_1.localize)('telemetry.telemetryLevel.deprecated', "****Note:*** If this setting is 'off', no telemetry will be sent regardless of other telemetry settings. If this setting is set to anything except 'off' and telemetry is disabled with deprecated settings, no telemetry will be sent.*");
        const telemetryDescription = `
${telemetryText} ${externalLinksStatement} ${restartString}

&nbsp;

${telemetryTableDescription}
${telemetryTable}

&nbsp;

${deprecatedSettingNote}
`;
        return telemetryDescription;
    }
    platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': telemetry_1.TELEMETRY_SECTION_ID,
        'order': 1,
        'type': 'object',
        'title': (0, nls_1.localize)('telemetryConfigurationTitle', "Telemetry"),
        'properties': {
            [telemetry_1.TELEMETRY_SETTING_ID]: {
                'type': 'string',
                'enum': ["all" /* TelemetryConfiguration.ON */, "error" /* TelemetryConfiguration.ERROR */, "crash" /* TelemetryConfiguration.CRASH */, "off" /* TelemetryConfiguration.OFF */],
                'enumDescriptions': [
                    (0, nls_1.localize)('telemetry.telemetryLevel.default', "Sends usage data, errors, and crash reports."),
                    (0, nls_1.localize)('telemetry.telemetryLevel.error', "Sends general error telemetry and crash reports."),
                    (0, nls_1.localize)('telemetry.telemetryLevel.crash', "Sends OS level crash reports."),
                    (0, nls_1.localize)('telemetry.telemetryLevel.off', "Disables all product telemetry.")
                ],
                'markdownDescription': getTelemetryLevelSettingDescription(),
                'default': "all" /* TelemetryConfiguration.ON */,
                'restricted': true,
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'tags': ['usesOnlineServices', 'telemetry']
            }
        }
    });
    // Deprecated telemetry setting
    platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': telemetry_1.TELEMETRY_SECTION_ID,
        'order': 110,
        'type': 'object',
        'title': (0, nls_1.localize)('telemetryConfigurationTitle', "Telemetry"),
        'properties': {
            [telemetry_1.TELEMETRY_OLD_SETTING_ID]: {
                'type': 'boolean',
                'markdownDescription': !product_1.default.privacyStatementUrl ?
                    (0, nls_1.localize)('telemetry.enableTelemetry', "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made.", product_1.default.nameLong) :
                    (0, nls_1.localize)('telemetry.enableTelemetryMd', "Enable diagnostic data to be collected. This helps us to better understand how {0} is performing and where improvements need to be made. [Read more]({1}) about what we collect and our privacy statement.", product_1.default.nameLong, product_1.default.privacyStatementUrl),
                'default': true,
                'restricted': true,
                'markdownDeprecationMessage': (0, nls_1.localize)('enableTelemetryDeprecated', "If this setting is false, no telemetry will be sent regardless of the new setting's value. Deprecated in favor of the {0} setting.", `\`#${telemetry_1.TELEMETRY_SETTING_ID}#\``),
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'tags': ['usesOnlineServices', 'telemetry']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9jb21tb24vdGVsZW1ldHJ5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QnpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO2lCQUVaLDBCQUFxQixHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7aUJBQ3hDLHlCQUFvQixHQUFHLGNBQWMsQUFBakIsQ0FBa0I7UUFtQnRELFlBQ0MsTUFBK0IsRUFDUixxQkFBb0QsRUFDMUQsZUFBd0M7WUFEMUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNsRCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFYbEQsMEJBQXFCLEdBQStCLEVBQUUsQ0FBQztZQUs5QyxpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzlDLHFCQUFnQixHQUFhLEVBQUUsQ0FBQztZQU92QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDbkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBVyxDQUFDO1lBQy9ELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFXLENBQUM7WUFDdEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBVyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUF3QixDQUFDO1lB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