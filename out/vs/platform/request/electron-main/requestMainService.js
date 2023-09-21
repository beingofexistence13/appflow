/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/platform/request/node/requestService"], function (require, exports, electron_1, requestService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RequestMainService = void 0;
    function getRawRequest(options) {
        return electron_1.net.request;
    }
    class RequestMainService extends requestService_1.RequestService {
        request(options, token) {
            return super.request({ ...(options || {}), getRawRequest, isChromiumNetwork: true }, token);
        }
    }
    exports.RequestMainService = RequestMainService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdE1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVxdWVzdC9lbGVjdHJvbi1tYWluL3JlcXVlc3RNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBUyxhQUFhLENBQUMsT0FBd0I7UUFDOUMsT0FBTyxjQUFHLENBQUMsT0FBcUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsTUFBYSxrQkFBbUIsU0FBUSwrQkFBa0I7UUFFaEQsT0FBTyxDQUFDLE9BQXdCLEVBQUUsS0FBd0I7WUFDbEUsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0YsQ0FBQztLQUNEO0lBTEQsZ0RBS0MifQ==