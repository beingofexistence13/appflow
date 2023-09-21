/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/errors", "vs/base/common/objects", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, amdX_1, errors_1, objects_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractOneDataSystemAppender = void 0;
    const endpointUrl = 'https://mobile.events.data.microsoft.com/OneCollector/1.0';
    const endpointHealthUrl = 'https://mobile.events.data.microsoft.com/ping';
    async function getClient(instrumentationKey, addInternalFlag, xhrOverride) {
        const oneDs = await (0, amdX_1.importAMDNodeModule)('@microsoft/1ds-core-js', 'dist/ms.core.js');
        const postPlugin = await (0, amdX_1.importAMDNodeModule)('@microsoft/1ds-post-js', 'dist/ms.post.js');
        const appInsightsCore = new oneDs.AppInsightsCore();
        const collectorChannelPlugin = new postPlugin.PostChannel();
        // Configure the app insights core to send to collector++ and disable logging of debug info
        const coreConfig = {
            instrumentationKey,
            endpointUrl,
            loggingLevelTelemetry: 0,
            loggingLevelConsole: 0,
            disableCookiesUsage: true,
            disableDbgExt: true,
            disableInstrumentationKeyValidation: true,
            channels: [[
                    collectorChannelPlugin
                ]]
        };
        if (xhrOverride) {
            coreConfig.extensionConfig = {};
            // Configure the channel to use a XHR Request override since it's not available in node
            const channelConfig = {
                alwaysUseXhrOverride: true,
                httpXHROverride: xhrOverride
            };
            coreConfig.extensionConfig[collectorChannelPlugin.identifier] = channelConfig;
        }
        appInsightsCore.initialize(coreConfig, []);
        appInsightsCore.addTelemetryInitializer((envelope) => {
            if (addInternalFlag) {
                envelope['ext'] = envelope['ext'] ?? {};
                envelope['ext']['utc'] = envelope['ext']['utc'] ?? {};
                // Sets it to be internal only based on Windows UTC flagging
                envelope['ext']['utc']['flags'] = 0x0000811ECD;
            }
        });
        return appInsightsCore;
    }
    // TODO @lramos15 maybe make more in line with src/vs/platform/telemetry/browser/appInsightsAppender.ts with caching support
    class AbstractOneDataSystemAppender {
        constructor(_isInternalTelemetry, _eventPrefix, _defaultData, iKeyOrClientFactory, // allow factory function for testing
        _xhrOverride) {
            this._isInternalTelemetry = _isInternalTelemetry;
            this._eventPrefix = _eventPrefix;
            this._defaultData = _defaultData;
            this._xhrOverride = _xhrOverride;
            this.endPointUrl = endpointUrl;
            this.endPointHealthUrl = endpointHealthUrl;
            if (!this._defaultData) {
                this._defaultData = {};
            }
            if (typeof iKeyOrClientFactory === 'function') {
                this._aiCoreOrKey = iKeyOrClientFactory();
            }
            else {
                this._aiCoreOrKey = iKeyOrClientFactory;
            }
            this._asyncAiCore = null;
        }
        _withAIClient(callback) {
            if (!this._aiCoreOrKey) {
                return;
            }
            if (typeof this._aiCoreOrKey !== 'string') {
                callback(this._aiCoreOrKey);
                return;
            }
            if (!this._asyncAiCore) {
                this._asyncAiCore = getClient(this._aiCoreOrKey, this._isInternalTelemetry, this._xhrOverride);
            }
            this._asyncAiCore.then((aiClient) => {
                callback(aiClient);
            }, (err) => {
                (0, errors_1.onUnexpectedError)(err);
                console.error(err);
            });
        }
        log(eventName, data) {
            if (!this._aiCoreOrKey) {
                return;
            }
            data = (0, objects_1.mixin)(data, this._defaultData);
            data = (0, telemetryUtils_1.validateTelemetryData)(data);
            const name = this._eventPrefix + '/' + eventName;
            try {
                this._withAIClient((aiClient) => {
                    aiClient.pluginVersionString = data?.properties.version ?? 'Unknown';
                    aiClient.track({
                        name,
                        baseData: { name, properties: data?.properties, measurements: data?.measurements }
                    });
                });
            }
            catch { }
        }
        flush() {
            if (this._aiCoreOrKey) {
                return new Promise(resolve => {
                    this._withAIClient((aiClient) => {
                        aiClient.unload(true, () => {
                            this._aiCoreOrKey = undefined;
                            resolve(undefined);
                        });
                    });
                });
            }
            return Promise.resolve(undefined);
        }
    }
    exports.AbstractOneDataSystemAppender = AbstractOneDataSystemAppender;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRzQXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvY29tbW9uLzFkc0FwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBTSxXQUFXLEdBQUcsMkRBQTJELENBQUM7SUFDaEYsTUFBTSxpQkFBaUIsR0FBRywrQ0FBK0MsQ0FBQztJQUUxRSxLQUFLLFVBQVUsU0FBUyxDQUFDLGtCQUEwQixFQUFFLGVBQXlCLEVBQUUsV0FBMEI7UUFDekcsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLDBCQUFtQixFQUEwQyx3QkFBd0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSwwQkFBbUIsRUFBMEMsd0JBQXdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNuSSxNQUFNLGVBQWUsR0FBRyxJQUFJLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwRCxNQUFNLHNCQUFzQixHQUFnQixJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6RSwyRkFBMkY7UUFDM0YsTUFBTSxVQUFVLEdBQTJCO1lBQzFDLGtCQUFrQjtZQUNsQixXQUFXO1lBQ1gscUJBQXFCLEVBQUUsQ0FBQztZQUN4QixtQkFBbUIsRUFBRSxDQUFDO1lBQ3RCLG1CQUFtQixFQUFFLElBQUk7WUFDekIsYUFBYSxFQUFFLElBQUk7WUFDbkIsbUNBQW1DLEVBQUUsSUFBSTtZQUN6QyxRQUFRLEVBQUUsQ0FBQztvQkFDVixzQkFBc0I7aUJBQ3RCLENBQUM7U0FDRixDQUFDO1FBRUYsSUFBSSxXQUFXLEVBQUU7WUFDaEIsVUFBVSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDaEMsdUZBQXVGO1lBQ3ZGLE1BQU0sYUFBYSxHQUEwQjtnQkFDNUMsb0JBQW9CLEVBQUUsSUFBSTtn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