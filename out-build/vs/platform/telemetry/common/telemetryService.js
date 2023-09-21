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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/strings", "vs/nls!vs/platform/telemetry/common/telemetryService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, lifecycle_1, objects_1, platform_1, strings_1, nls_1, configuration_1, configurationRegistry_1, product_1, productService_1, platform_2, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qq = void 0;
    let $Qq = class $Qq {
        static { this.IDLE_START_EVENT_NAME = 'UserIdleStart'; }
        static { this.IDLE_STOP_EVENT_NAME = 'UserIdleStop'; }
        constructor(config, k, l) {
            this.k = k;
            this.l = l;
            this.d = {};
            this.i = new lifecycle_1.$jc();
            this.j = [];
            this.b = config.appenders;
            this.c = config.commonProperties ?? Object.create(null);
            this.sessionId = this.c['sessionID'];
            this.machineId = this.c['common.machineId'];
            this.firstSessionDate = this.c['common.firstSessionDate'];
            this.msftInternal = this.c['common.msftInternal'];
            this.f = config.piiPaths || [];
            this.g = 3 /* TelemetryLevel.USAGE */;
            this.h = !!config.sendErrorTelemetry;
            // static cleanup pattern for: `vscode-file:///DANGEROUS/PATH/resources/app/Useful/Information`
            this.j = [/(vscode-)?file:\/\/\/.*?\/resources\/app\//gi];
            for (const piiPath of this.f) {
                this.j.push(new RegExp((0, strings_1.$qe)(piiPath), 'gi'));
                if (piiPath.indexOf('\\') >= 0) {
                    this.j.push(new RegExp((0, strings_1.$qe)(piiPath.replace(/\\/g, '/')), 'gi'));
                }
            }
            this.m();
            this.i.add(this.k.onDidChangeConfiguration(e => {
                // Check on the telemetry settings and update the state if changed
                const affectsTelemetryConfig = e.affectsConfiguration(telemetry_1.$dl)
                    || e.affectsConfiguration(telemetry_1.$fl)
                    || e.affectsConfiguration(telemetry_1.$el);
                if (affectsTelemetryConfig) {
                    this.m();
                }
            }));
        }
        setExperimentProperty(name, value) {
            this.d[name] = value;
        }
        m() {
            let level = (0, telemetryUtils_1.$jo)(this.k);
            const collectableTelemetry = this.l.enabledTelemetryLevels;
            // Also ensure that error telemetry is respecting the product configuration for collectable telemetry
            if (collectableTelemetry) {
                this.h = this.sendErrorTelemetry ? collectableTelemetry.error : false;
                // Make sure the telemetry level from the service is the minimum of the config and product
                const maxCollectableTelemetryLevel = collectableTelemetry.usage ? 3 /* TelemetryLevel.USAGE */ : collectableTelemetry.error ? 2 /* TelemetryLevel.ERROR */ : 0 /* TelemetryLevel.NONE */;
                level = Math.min(level, maxCollectableTelemetryLevel);
            }
            this.g = level;
        }
        get sendErrorTelemetry() {
            return this.h;
        }
        get telemetryLevel() {
            return this.g;
        }
        dispose() {
            this.i.dispose();
        }
        n(eventName, eventLevel, data) {
            // don't send events when the user is optout
            if (this.g < eventLevel) {
                return;
            }
            // add experiment properties
            data = (0, objects_1.$Ym)(data, this.d);
            // remove all PII from data
            data = (0, telemetryUtils_1.$oo)(data, this.j);
            // add common properties
            data = (0, objects_1.$Ym)(data, this.c);
            // Log to the appenders of sufficient level
            this.b.forEach(a => a.log(eventName, data));
        }
        publicLog(eventName, data) {
            this.n(eventName, 3 /* TelemetryLevel.USAGE */, data);
        }
        publicLog2(eventName, data) {
            this.publicLog(eventName, data);
        }
        publicLogError(errorEventName, data) {
            if (!this.h) {
                return;
            }
            // Send error event and anonymize paths
            this.n(errorEventName, 2 /* TelemetryLevel.ERROR */, data);
        }
        publicLogError2(eventName, data) {
            this.publicLogError(eventName, data);
        }
    };
    exports.$Qq = $Qq;
    exports.$Qq = $Qq = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, productService_1.$kj)
    ], $Qq);
    function getTelemetryLevelSettingDescription() {
        const telemetryText = (0, nls_1.localize)(0, null, product_1.default.nameLong);
        const externalLinksStatement = !product_1.default.privacyStatementUrl ?
            (0, nls_1.localize)(1, null, 'https://aka.ms/vscode-telemetry') :
            (0, nls_1.localize)(2, null, 'https://aka.ms/vscode-telemetry', product_1.default.privacyStatementUrl);
        const restartString = !platform_1.$o ? (0, nls_1.localize)(3, null) : '';
        const crashReportsHeader = (0, nls_1.localize)(4, null);
        const errorsHeader = (0, nls_1.localize)(5, null);
        const usageHeader = (0, nls_1.localize)(6, null);
        const telemetryTableDescription = (0, nls_1.localize)(7, null);
        const telemetryTable = `
|       | ${crashReportsHeader} | ${errorsHeader} | ${usageHeader} |
|:------|:---------------------:|:---------------:|:--------------:|
| all   |            ✓          |        ✓        |        ✓       |
| error |            ✓          |        ✓        |        -       |
| crash |            ✓          |        -        |        -       |
| off   |            -          |        -        |        -       |
`;
        const deprecatedSettingNote = (0, nls_1.localize)(8, null);
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
    platform_2.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'id': telemetry_1.$cl,
        'order': 1,
        'type': 'object',
        'title': (0, nls_1.localize)(9, null),
        'properties': {
            [telemetry_1.$dl]: {
                'type': 'string',
                'enum': ["all" /* TelemetryConfiguration.ON */, "error" /* TelemetryConfiguration.ERROR */, "crash" /* TelemetryConfiguration.CRASH */, "off" /* TelemetryConfiguration.OFF */],
                'enumDescriptions': [
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null)
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
    platform_2.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'id': telemetry_1.$cl,
        'order': 110,
        'type': 'object',
        'title': (0, nls_1.localize)(14, null),
        'properties': {
            [telemetry_1.$fl]: {
                'type': 'boolean',
                'markdownDescription': !product_1.default.privacyStatementUrl ?
                    (0, nls_1.localize)(15, null, product_1.default.nameLong) :
                    (0, nls_1.localize)(16, null, product_1.default.nameLong, product_1.default.privacyStatementUrl),
                'default': true,
                'restricted': true,
                'markdownDeprecationMessage': (0, nls_1.localize)(17, null, `\`#${telemetry_1.$dl}#\``),
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'tags': ['usesOnlineServices', 'telemetry']
            }
        }
    });
});
//# sourceMappingURL=telemetryService.js.map