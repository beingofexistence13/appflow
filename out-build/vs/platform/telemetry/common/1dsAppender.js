/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/common/errors", "vs/base/common/objects", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, amdX_1, errors_1, objects_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_M = void 0;
    const endpointUrl = 'https://mobile.events.data.microsoft.com/OneCollector/1.0';
    const endpointHealthUrl = 'https://mobile.events.data.microsoft.com/ping';
    async function getClient(instrumentationKey, addInternalFlag, xhrOverride) {
        const oneDs = await (0, amdX_1.$aD)('@microsoft/1ds-core-js', 'dist/ms.core.js');
        const postPlugin = await (0, amdX_1.$aD)('@microsoft/1ds-post-js', 'dist/ms.post.js');
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
    class $_M {
        constructor(e, f, g, iKeyOrClientFactory, // allow factory function for testing
        h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.c = endpointUrl;
            this.d = endpointHealthUrl;
            if (!this.g) {
                this.g = {};
            }
            if (typeof iKeyOrClientFactory === 'function') {
                this.a = iKeyOrClientFactory();
            }
            else {
                this.a = iKeyOrClientFactory;
            }
            this.b = null;
        }
        i(callback) {
            if (!this.a) {
                return;
            }
            if (typeof this.a !== 'string') {
                callback(this.a);
                return;
            }
            if (!this.b) {
                this.b = getClient(this.a, this.e, this.h);
            }
            this.b.then((aiClient) => {
                callback(aiClient);
            }, (err) => {
                (0, errors_1.$Y)(err);
                console.error(err);
            });
        }
        log(eventName, data) {
            if (!this.a) {
                return;
            }
            data = (0, objects_1.$Ym)(data, this.g);
            data = (0, telemetryUtils_1.$ko)(data);
            const name = this.f + '/' + eventName;
            try {
                this.i((aiClient) => {
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
            if (this.a) {
                return new Promise(resolve => {
                    this.i((aiClient) => {
                        aiClient.unload(true, () => {
                            this.a = undefined;
                            resolve(undefined);
                        });
                    });
                });
            }
            return Promise.resolve(undefined);
        }
    }
    exports.$_M = $_M;
});
//# sourceMappingURL=1dsAppender.js.map