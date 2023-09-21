/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/1dsAppender"], function (require, exports, _1dsAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OneDataSystemWebAppender = void 0;
    class OneDataSystemWebAppender extends _1dsAppender_1.AbstractOneDataSystemAppender {
        constructor(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
            super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory);
            // If we cannot fetch the endpoint it means it is down and we should not send any telemetry.
            // This is most likely due to ad blockers
            fetch(this.endPointHealthUrl, { method: 'GET' }).catch(err => {
                this._aiCoreOrKey = undefined;
            });
        }
    }
    exports.OneDataSystemWebAppender = OneDataSystemWebAppender;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMWRzQXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvYnJvd3Nlci8xZHNBcHBlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSx3QkFBeUIsU0FBUSw0Q0FBNkI7UUFDMUUsWUFDQyxtQkFBNEIsRUFDNUIsV0FBbUIsRUFDbkIsV0FBMEMsRUFDMUMsbUJBQXNEO1lBRXRELEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFFMUUsNEZBQTRGO1lBQzVGLHlDQUF5QztZQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQWZELDREQWVDIn0=