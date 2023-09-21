/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry"], function (require, exports, objects_1, types_1, event_1, configuration_1, remoteHosts_1, commonProperties_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanData = exports.getPiiPathsFromEnvironment = exports.isInternalTelemetry = exports.cleanRemoteAuthority = exports.validateTelemetryData = exports.getTelemetryLevel = exports.isLoggingOnly = exports.supportsTelemetry = exports.configurationTelemetry = exports.NullAppender = exports.extensionTelemetryLogChannelId = exports.telemetryLogId = exports.NullEndpointTelemetryService = exports.NullTelemetryService = exports.NullTelemetryServiceShape = exports.TelemetryTrustedValue = void 0;
    /**
     * A special class used to denoting a telemetry value which should not be clean.
     * This is because that value is "Trusted" not to contain identifiable information such as paths.
     * NOTE: This is used as an API type as well, and should not be changed.
     */
    class TelemetryTrustedValue {
        constructor(value) {
            this.value = value;
            // This is merely used as an identifier as the instance will be lost during serialization over the exthost
            this.isTrustedTelemetryValue = true;
        }
    }
    exports.TelemetryTrustedValue = TelemetryTrustedValue;
    class NullTelemetryServiceShape {
        constructor() {
            this.telemetryLevel = 0 /* TelemetryLevel.NONE */;
            this.sessionId = 'someValue.sessionId';
            this.machineId = 'someValue.machineId';
            this.firstSessionDate = 'someValue.firstSessionDate';
            this.sendErrorTelemetry = false;
        }
        publicLog() { }
        publicLog2() { }
        publicLogError() { }
        publicLogError2() { }
        setExperimentProperty() { }
    }
    exports.NullTelemetryServiceShape = NullTelemetryServiceShape;
    exports.NullTelemetryService = new NullTelemetryServiceShape();
    class NullEndpointTelemetryService {
        async publicLog(_endpoint, _eventName, _data) {
            // noop
        }
        async publicLogError(_endpoint, _errorEventName, _data) {
            // noop
        }
    }
    exports.NullEndpointTelemetryService = NullEndpointTelemetryService;
    exports.telemetryLogId = 'telemetry';
    exports.extensionTelemetryLogChannelId = 'extensionTelemetryLog';
    exports.NullAppender = { log: () => null, flush: () => Promise.resolve(null) };
    function configurationTelemetry(telemetryService, configurationService) {
        // Debounce the event by 1000 ms and merge all affected keys into one event
        const debouncedConfigService = event_1.Event.debounce(configurationService.onDidChangeConfiguration, (last, cur) => {
            const newAffectedKeys = last ? new Set([...last.affectedKeys, ...cur.affectedKeys]) : cur.affectedKeys;
            return { ...cur, affectedKeys: newAffectedKeys };
        }, 1000, true);
        return debouncedConfigService(event => {
            if (event.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                telemetryService.publicLog2('updateConfiguration', {
                    configurationSource: (0, configuration_1.ConfigurationTargetToString)(event.source),
                    configurationKeys: Array.from(event.affectedKeys)
                });
            }
        });
    }
    exports.configurationTelemetry = configurationTelemetry;
    /**
     * Determines whether or not we support logging telemetry.
     * This checks if the product is capable of collecting telemetry but not whether or not it can send it
     * For checking the user setting and what telemetry you can send please check `getTelemetryLevel`.
     * This returns true if `--disable-telemetry` wasn't used, the product.json allows for telemetry, and we're not testing an extension
     * If false telemetry is disabled throughout the product
     * @param productService
     * @param environmentService
     * @returns false - telemetry is completely disabled, true - telemetry is logged locally, but may not be sent
     */
    function supportsTelemetry(productService, environmentService) {
        // If it's OSS and telemetry isn't disabled via the CLI we will allow it for logging only purposes
        if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
            return true;
        }
        return !(environmentService.disableTelemetry || !productService.enableTelemetry || environmentService.extensionTestsLocationURI);
    }
    exports.supportsTelemetry = supportsTelemetry;
    /**
     * Checks to see if we're in logging only mode to debug telemetry.
     * This is if telemetry is enabled and we're in OSS, but no telemetry key is provided so it's not being sent just logged.
     * @param productService
     * @param environmentService
     * @returns True if telemetry is actually disabled and we're only logging for debug purposes
     */
    function isLoggingOnly(productService, environmentService) {
        // Logging only mode is only for OSS
        if (environmentService.isBuilt) {
            return false;
        }
        if (environmentService.disableTelemetry) {
            return false;
        }
        if (productService.enableTelemetry && productService.aiConfig?.ariaKey) {
            return false;
        }
        return true;
    }
    exports.isLoggingOnly = isLoggingOnly;
    /**
     * Determines how telemetry is handled based on the user's configuration.
     *
     * @param configurationService
     * @returns OFF, ERROR, ON
     */
    function getTelemetryLevel(configurationService) {
        const newConfig = configurationService.getValue(telemetry_1.TELEMETRY_SETTING_ID);
        const crashReporterConfig = configurationService.getValue(telemetry_1.TELEMETRY_CRASH_REPORTER_SETTING_ID);
        const oldConfig = configurationService.getValue(telemetry_1.TELEMETRY_OLD_SETTING_ID);
        // If `telemetry.enableCrashReporter` is false or `telemetry.enableTelemetry' is false, disable telemetry
        if (oldConfig === false || crashReporterConfig === false) {
            return 0 /* TelemetryLevel.NONE */;
        }
        // Maps new telemetry setting to a telemetry level
        switch (newConfig ?? "all" /* TelemetryConfiguration.ON */) {
            case "all" /* TelemetryConfiguration.ON */:
                return 3 /* TelemetryLevel.USAGE */;
            case "error" /* TelemetryConfiguration.ERROR */:
                return 2 /* TelemetryLevel.ERROR */;
            case "crash" /* TelemetryConfiguration.CRASH */:
                return 1 /* TelemetryLevel.CRASH */;
            case "off" /* TelemetryConfiguration.OFF */:
                return 0 /* TelemetryLevel.NONE */;
        }
    }
    exports.getTelemetryLevel = getTelemetryLevel;
    function validateTelemetryData(data) {
        const properties = {};
        const measurements = {};
        const flat = {};
        flatten(data, flat);
        for (let prop in flat) {
            // enforce property names less than 150 char, take the last 150 char
            prop = prop.length > 150 ? prop.substr(prop.length - 149) : prop;
            const value = flat[prop];
            if (typeof value === 'number') {
                measurements[prop] = value;
            }
            else if (typeof value === 'boolean') {
                measurements[prop] = value ? 1 : 0;
            }
            else if (typeof value === 'string') {
                if (value.length > 8192) {
                    console.warn(`Telemetry property: ${prop} has been trimmed to 8192, the original length is ${value.length}`);
                }
                //enforce property value to be less than 8192 char, take the first 8192 char
                // https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#limits
                properties[prop] = value.substring(0, 8191);
            }
            else if (typeof value !== 'undefined' && value !== null) {
                properties[prop] = value;
            }
        }
        return {
            properties,
            measurements
        };
    }
    exports.validateTelemetryData = validateTelemetryData;
    const telemetryAllowedAuthorities = new Set(['ssh-remote', 'dev-container', 'attached-container', 'wsl', 'tunnel', 'codespaces', 'amlext']);
    function cleanRemoteAuthority(remoteAuthority) {
        if (!remoteAuthority) {
            return 'none';
        }
        const remoteName = (0, remoteHosts_1.getRemoteName)(remoteAuthority);
        return telemetryAllowedAuthorities.has(remoteName) ? remoteName : 'other';
    }
    exports.cleanRemoteAuthority = cleanRemoteAuthority;
    function flatten(obj, result, order = 0, prefix) {
        if (!obj) {
            return;
        }
        for (const item of Object.getOwnPropertyNames(obj)) {
            const value = obj[item];
            const index = prefix ? prefix + item : item;
            if (Array.isArray(value)) {
                result[index] = (0, objects_1.safeStringify)(value);
            }
            else if (value instanceof Date) {
                // TODO unsure why this is here and not in _getData
                result[index] = value.toISOString();
            }
            else if ((0, types_1.isObject)(value)) {
                if (order < 2) {
                    flatten(value, result, order + 1, index + '.');
                }
                else {
                    result[index] = (0, objects_1.safeStringify)(value);
                }
            }
            else {
                result[index] = value;
            }
        }
    }
    /**
     * Whether or not this is an internal user
     * @param productService The product service
     * @param configService The config servivce
     * @returns true if internal, false otherwise
     */
    function isInternalTelemetry(productService, configService) {
        const msftInternalDomains = productService.msftInternalDomains || [];
        const internalTesting = configService.getValue('telemetry.internalTesting');
        return (0, commonProperties_1.verifyMicrosoftInternalDomain)(msftInternalDomains) || internalTesting;
    }
    exports.isInternalTelemetry = isInternalTelemetry;
    function getPiiPathsFromEnvironment(paths) {
        return [paths.appRoot, paths.extensionsPath, paths.userHome.fsPath, paths.tmpDir.fsPath, paths.userDataPath];
    }
    exports.getPiiPathsFromEnvironment = getPiiPathsFromEnvironment;
    //#region Telemetry Cleaning
    /**
     * Cleans a given stack of possible paths
     * @param stack The stack to sanitize
     * @param cleanupPatterns Cleanup patterns to remove from the stack
     * @returns The cleaned stack
     */
    function anonymizeFilePaths(stack, cleanupPatterns) {
        // Fast check to see if it is a file path to avoid doing unnecessary heavy regex work
        if (!stack || (!stack.includes('/') && !stack.includes('\\'))) {
            return stack;
        }
        let updatedStack = stack;
        const cleanUpIndexes = [];
        for (const regexp of cleanupPatterns) {
            while (true) {
                const result = regexp.exec(stack);
                if (!result) {
                    break;
                }
                cleanUpIndexes.push([result.index, regexp.lastIndex]);
            }
        }
        const nodeModulesRegex = /^[\\\/]?(node_modules|node_modules\.asar)[\\\/]/;
        const fileRegex = /(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._]+(\\\\|\\|\/))+[\w-\._]*/g;
        let lastIndex = 0;
        updatedStack = '';
        while (true) {
            const result = fileRegex.exec(stack);
            if (!result) {
                break;
            }
            // Check to see if the any cleanupIndexes partially overlap with this match
            const overlappingRange = cleanUpIndexes.some(([start, end]) => result.index < end && start < fileRegex.lastIndex);
            // anoynimize user file paths that do not need to be retained or cleaned up.
            if (!nodeModulesRegex.test(result[0]) && !overlappingRange) {
                updatedStack += stack.substring(lastIndex, result.index) + '<REDACTED: user-file-path>';
                lastIndex = fileRegex.lastIndex;
            }
        }
        if (lastIndex < stack.length) {
            updatedStack += stack.substr(lastIndex);
        }
        return updatedStack;
    }
    /**
     * Attempts to remove commonly leaked PII
     * @param property The property which will be removed if it contains user data
     * @returns The new value for the property
     */
    function removePropertiesWithPossibleUserInfo(property) {
        // If for some reason it is undefined we skip it (this shouldn't be possible);
        if (!property) {
            return property;
        }
        const userDataRegexes = [
            { label: 'Google API Key', regex: /AIza[A-Za-z0-9_\\\-]{35}/ },
            { label: 'Slack Token', regex: /xox[pbar]\-[A-Za-z0-9]/ },
            { label: 'Generic Secret', regex: /(key|token|sig|secret|signature|password|passwd|pwd|android:value)[^a-zA-Z0-9]/i },
            { label: 'Email', regex: /@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/ } // Regex which matches @*.site
        ];
        // Check for common user data in the telemetry events
        for (const secretRegex of userDataRegexes) {
            if (secretRegex.regex.test(property)) {
                return `<REDACTED: ${secretRegex.label}>`;
            }
        }
        return property;
    }
    /**
     * Does a best possible effort to clean a data object from any possible PII.
     * @param data The data object to clean
     * @param paths Any additional patterns that should be removed from the data set
     * @returns A new object with the PII removed
     */
    function cleanData(data, cleanUpPatterns) {
        return (0, objects_1.cloneAndChange)(data, value => {
            // If it's a trusted value it means it's okay to skip cleaning so we don't clean it
            if (value instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value, 'isTrustedTelemetryValue')) {
                return value.value;
            }
            // We only know how to clean strings
            if (typeof value === 'string') {
                let updatedProperty = value.replaceAll('%20', ' ');
                // First we anonymize any possible file paths
                updatedProperty = anonymizeFilePaths(updatedProperty, cleanUpPatterns);
                // Then we do a simple regex replace with the defined patterns
                for (const regexp of cleanUpPatterns) {
                    updatedProperty = updatedProperty.replace(regexp, '');
                }
                // Lastly, remove commonly leaked PII
                updatedProperty = removePropertiesWithPossibleUserInfo(updatedProperty);
                return updatedProperty;
            }
            return undefined;
        });
    }
    exports.cleanData = cleanData;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvY29tbW9uL3RlbGVtZXRyeVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRzs7OztPQUlHO0lBQ0gsTUFBYSxxQkFBcUI7UUFHakMsWUFBNEIsS0FBUTtZQUFSLFVBQUssR0FBTCxLQUFLLENBQUc7WUFGcEMsMEdBQTBHO1lBQzFGLDRCQUF1QixHQUFHLElBQUksQ0FBQztRQUNQLENBQUM7S0FDekM7SUFKRCxzREFJQztJQUVELE1BQWEseUJBQXlCO1FBQXRDO1lBRVUsbUJBQWMsK0JBQXVCO1lBQ3JDLGNBQVMsR0FBRyxxQkFBcUIsQ0FBQztZQUNsQyxjQUFTLEdBQUcscUJBQXFCLENBQUM7WUFDbEMscUJBQWdCLEdBQUcsNEJBQTRCLENBQUM7WUFDaEQsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBTXJDLENBQUM7UUFMQSxTQUFTLEtBQUssQ0FBQztRQUNmLFVBQVUsS0FBSyxDQUFDO1FBQ2hCLGNBQWMsS0FBSyxDQUFDO1FBQ3BCLGVBQWUsS0FBSyxDQUFDO1FBQ3JCLHFCQUFxQixLQUFLLENBQUM7S0FDM0I7SUFaRCw4REFZQztJQUVZLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO0lBRXBFLE1BQWEsNEJBQTRCO1FBR3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBNkIsRUFBRSxVQUFrQixFQUFFLEtBQXNCO1lBQ3hGLE9BQU87UUFDUixDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUE2QixFQUFFLGVBQXVCLEVBQUUsS0FBc0I7WUFDbEcsT0FBTztRQUNSLENBQUM7S0FDRDtJQVZELG9FQVVDO0lBRVksUUFBQSxjQUFjLEdBQUcsV0FBVyxDQUFDO0lBQzdCLFFBQUEsOEJBQThCLEdBQUcsdUJB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