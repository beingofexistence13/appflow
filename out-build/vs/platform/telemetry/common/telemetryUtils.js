/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry"], function (require, exports, objects_1, types_1, event_1, configuration_1, remoteHosts_1, commonProperties_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oo = exports.$no = exports.$mo = exports.$lo = exports.$ko = exports.$jo = exports.$io = exports.$ho = exports.$go = exports.$fo = exports.$eo = exports.$do = exports.$co = exports.$bo = exports.$ao = exports.$_n = void 0;
    /**
     * A special class used to denoting a telemetry value which should not be clean.
     * This is because that value is "Trusted" not to contain identifiable information such as paths.
     * NOTE: This is used as an API type as well, and should not be changed.
     */
    class $_n {
        constructor(value) {
            this.value = value;
            // This is merely used as an identifier as the instance will be lost during serialization over the exthost
            this.isTrustedTelemetryValue = true;
        }
    }
    exports.$_n = $_n;
    class $ao {
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
    exports.$ao = $ao;
    exports.$bo = new $ao();
    class $co {
        async publicLog(_endpoint, _eventName, _data) {
            // noop
        }
        async publicLogError(_endpoint, _errorEventName, _data) {
            // noop
        }
    }
    exports.$co = $co;
    exports.$do = 'telemetry';
    exports.$eo = 'extensionTelemetryLog';
    exports.$fo = { log: () => null, flush: () => Promise.resolve(null) };
    function $go(telemetryService, configurationService) {
        // Debounce the event by 1000 ms and merge all affected keys into one event
        const debouncedConfigService = event_1.Event.debounce(configurationService.onDidChangeConfiguration, (last, cur) => {
            const newAffectedKeys = last ? new Set([...last.affectedKeys, ...cur.affectedKeys]) : cur.affectedKeys;
            return { ...cur, affectedKeys: newAffectedKeys };
        }, 1000, true);
        return debouncedConfigService(event => {
            if (event.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                telemetryService.publicLog2('updateConfiguration', {
                    configurationSource: (0, configuration_1.$$h)(event.source),
                    configurationKeys: Array.from(event.affectedKeys)
                });
            }
        });
    }
    exports.$go = $go;
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
    function $ho(productService, environmentService) {
        // If it's OSS and telemetry isn't disabled via the CLI we will allow it for logging only purposes
        if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
            return true;
        }
        return !(environmentService.disableTelemetry || !productService.enableTelemetry || environmentService.extensionTestsLocationURI);
    }
    exports.$ho = $ho;
    /**
     * Checks to see if we're in logging only mode to debug telemetry.
     * This is if telemetry is enabled and we're in OSS, but no telemetry key is provided so it's not being sent just logged.
     * @param productService
     * @param environmentService
     * @returns True if telemetry is actually disabled and we're only logging for debug purposes
     */
    function $io(productService, environmentService) {
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
    exports.$io = $io;
    /**
     * Determines how telemetry is handled based on the user's configuration.
     *
     * @param configurationService
     * @returns OFF, ERROR, ON
     */
    function $jo(configurationService) {
        const newConfig = configurationService.getValue(telemetry_1.$dl);
        const crashReporterConfig = configurationService.getValue(telemetry_1.$el);
        const oldConfig = configurationService.getValue(telemetry_1.$fl);
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
    exports.$jo = $jo;
    function $ko(data) {
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
    exports.$ko = $ko;
    const telemetryAllowedAuthorities = new Set(['ssh-remote', 'dev-container', 'attached-container', 'wsl', 'tunnel', 'codespaces', 'amlext']);
    function $lo(remoteAuthority) {
        if (!remoteAuthority) {
            return 'none';
        }
        const remoteName = (0, remoteHosts_1.$Pk)(remoteAuthority);
        return telemetryAllowedAuthorities.has(remoteName) ? remoteName : 'other';
    }
    exports.$lo = $lo;
    function flatten(obj, result, order = 0, prefix) {
        if (!obj) {
            return;
        }
        for (const item of Object.getOwnPropertyNames(obj)) {
            const value = obj[item];
            const index = prefix ? prefix + item : item;
            if (Array.isArray(value)) {
                result[index] = (0, objects_1.$1m)(value);
            }
            else if (value instanceof Date) {
                // TODO unsure why this is here and not in _getData
                result[index] = value.toISOString();
            }
            else if ((0, types_1.$lf)(value)) {
                if (order < 2) {
                    flatten(value, result, order + 1, index + '.');
                }
                else {
                    result[index] = (0, objects_1.$1m)(value);
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
    function $mo(productService, configService) {
        const msftInternalDomains = productService.msftInternalDomains || [];
        const internalTesting = configService.getValue('telemetry.internalTesting');
        return (0, commonProperties_1.$$n)(msftInternalDomains) || internalTesting;
    }
    exports.$mo = $mo;
    function $no(paths) {
        return [paths.appRoot, paths.extensionsPath, paths.userHome.fsPath, paths.tmpDir.fsPath, paths.userDataPath];
    }
    exports.$no = $no;
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
    function $oo(data, cleanUpPatterns) {
        return (0, objects_1.$Xm)(data, value => {
            // If it's a trusted value it means it's okay to skip cleaning so we don't clean it
            if (value instanceof $_n || Object.hasOwnProperty.call(value, 'isTrustedTelemetryValue')) {
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
    exports.$oo = $oo;
});
//#endregion
//# sourceMappingURL=telemetryUtils.js.map