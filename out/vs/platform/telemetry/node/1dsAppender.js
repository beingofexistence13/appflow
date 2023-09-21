/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/cancellation", "https", "vs/platform/telemetry/common/1dsAppender"], function (require, exports, buffer_1, cancellation_1, https, _1dsAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OneDataSystemAppender = void 0;
    /**
     * Completes a request to submit telemetry to the server utilizing the request service
     * @param options The options which will be used to make the request
     * @param requestService The request service
     * @returns An object containing the headers, statusCode, and responseData
     */
    async function makeTelemetryRequest(options, requestService) {
        const response = await requestService.request(options, cancellation_1.CancellationToken.None);
        const responseData = (await (0, buffer_1.streamToBuffer)(response.stream)).toString();
        const statusCode = response.res.statusCode ?? 200;
        const headers = response.res.headers;
        return {
            headers,
            statusCode,
            responseData
        };
    }
    /**
     * Complete a request to submit telemetry to the server utilizing the https module. Only used when the request service is not available
     * @param options The options which will be used to make the request
     * @returns An object containing the headers, statusCode, and responseData
     */
    async function makeLegacyTelemetryRequest(options) {
        const httpsOptions = {
            method: options.type,
            headers: options.headers
        };
        const responsePromise = new Promise((resolve, reject) => {
            const req = https.request(options.url ?? '', httpsOptions, res => {
                res.on('data', function (responseData) {
                    resolve({
                        headers: res.headers,
                        statusCode: res.statusCode ?? 200,
                        responseData: responseData.toString()
                    });
                });
                // On response with error send status of 0 and a blank response to oncomplete so we can retry events
                res.on('error', function (err) {
                    reject(err);
                });
            });
            req.write(options.data, (err) => {
                if (err) {
                    reject(err);
                }
            });
            req.end();
        });
        return responsePromise;
    }
    async function sendPostAsync(requestService, payload, oncomplete) {
        const telemetryRequestData = typeof payload.data === 'string' ? payload.data : new TextDecoder().decode(payload.data);
        const requestOptions = {
            type: 'POST',
            headers: {
                ...payload.headers,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload.data).toString()
            },
            url: payload.urlString,
            data: telemetryRequestData
        };
        try {
            const responseData = requestService ? await makeTelemetryRequest(requestOptions, requestService) : await makeLegacyTelemetryRequest(requestOptions);
            oncomplete(responseData.statusCode, responseData.headers, responseData.responseData);
        }
        catch {
            // If it errors out, send status of 0 and a blank response to oncomplete so we can retry events
            oncomplete(0, {});
        }
    }
    class OneDataSystemAppender extends _1dsAppender_1.AbstractOneDataSystemAppender {
        constructor(requestService, isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
            // Override the way events get sent since node doesn't have XHTMLRequest
            const customHttpXHROverride = {
                sendPOST: (payload, oncomplete) => {
                    // Fire off the async request without awaiting it
                    sendPostAsync(requestService, payload, oncomplete);
                }
            };
            super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory, customHttpXHROverride);
        }
    }
    exports.OneDataSystemAppender = OneDataSystemAppender;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRzQXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvbm9kZS8xZHNBcHBlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHOzs7OztPQUtHO0lBQ0gsS0FBSyxVQUFVLG9CQUFvQixDQUFDLE9BQXdCLEVBQUUsY0FBK0I7UUFDNUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvRSxNQUFNLFlBQVksR0FBRyxDQUFDLE1BQU0sSUFBQSx1QkFBYyxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQztRQUNsRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQThCLENBQUM7UUFDNUQsT0FBTztZQUNOLE9BQU87WUFDUCxVQUFVO1lBQ1YsWUFBWTtTQUNaLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssVUFBVSwwQkFBMEIsQ0FBQyxPQUF3QjtRQUNqRSxNQUFNLFlBQVksR0FBRztZQUNwQixNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDcEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1NBQ3hCLENBQUM7UUFDRixNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEUsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hFLEdB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