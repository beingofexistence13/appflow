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
define(["require", "exports", "vs/workbench/api/common/extHostConsoleForwarder", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, extHostConsoleForwarder_1, extHostInitDataService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostConsoleForwarder = void 0;
    const MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;
    let ExtHostConsoleForwarder = class ExtHostConsoleForwarder extends extHostConsoleForwarder_1.AbstractExtHostConsoleForwarder {
        constructor(extHostRpc, initData) {
            super(extHostRpc, initData);
            this._isMakingConsoleCall = false;
            this._wrapStream('stderr', 'error');
            this._wrapStream('stdout', 'log');
        }
        _nativeConsoleLogMessage(method, original, args) {
            const stream = method === 'error' || method === 'warn' ? process.stderr : process.stdout;
            this._isMakingConsoleCall = true;
            stream.write(`\n${"START_NATIVE_LOG" /* NativeLogMarkers.Start */}\n`);
            original.apply(console, args);
            stream.write(`\n${"END_NATIVE_LOG" /* NativeLogMarkers.End */}\n`);
            this._isMakingConsoleCall = false;
        }
        /**
         * Wraps process.stderr/stdout.write() so that it is transmitted to the
         * renderer or CLI. It both calls through to the original method as well
         * as to console.log with complete lines so that they're made available
         * to the debugger/CLI.
         */
        _wrapStream(streamName, severity) {
            const stream = process[streamName];
            const original = stream.write;
            let buf = '';
            Object.defineProperty(stream, 'write', {
                set: () => { },
                get: () => (chunk, encoding, callback) => {
                    if (!this._isMakingConsoleCall) {
                        buf += chunk.toString(encoding);
                        const eol = buf.length > MAX_STREAM_BUFFER_LENGTH ? buf.length : buf.lastIndexOf('\n');
                        if (eol !== -1) {
                            console[severity](buf.slice(0, eol));
                            buf = buf.slice(eol + 1);
                        }
                    }
                    original.call(stream, chunk, encoding, callback);
                },
            });
        }
    };
    exports.ExtHostConsoleForwarder = ExtHostConsoleForwarder;
    exports.ExtHostConsoleForwarder = ExtHostConsoleForwarder = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService)
    ], ExtHostConsoleForwarder);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbnNvbGVGb3J3YXJkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL25vZGUvZXh0SG9zdENvbnNvbGVGb3J3YXJkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBT2hHLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztJQUV0QyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHlEQUErQjtRQUkzRSxZQUNxQixVQUE4QixFQUN6QixRQUFpQztZQUUxRCxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBTnJCLHlCQUFvQixHQUFZLEtBQUssQ0FBQztZQVE3QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRWtCLHdCQUF3QixDQUFDLE1BQXlDLEVBQUUsUUFBa0MsRUFBRSxJQUFnQjtZQUMxSSxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDekYsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssK0NBQXNCLElBQUksQ0FBQyxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQVcsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSywyQ0FBb0IsSUFBSSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztRQUNuQyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxXQUFXLENBQUMsVUFBK0IsRUFBRSxRQUFrQztZQUN0RixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUU5QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFFYixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7Z0JBQ3RDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNkLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQTBCLEVBQUUsUUFBeUIsRUFBRSxRQUFnQyxFQUFFLEVBQUU7b0JBQ3RHLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7d0JBQy9CLEdBQUcsSUFBSyxLQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN6QyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN2RixJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFDZixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDckMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUN6QjtxQkFDRDtvQkFFRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUFuRFksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFLakMsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLGdEQUF1QixDQUFBO09BTmIsdUJBQXVCLENBbURuQyJ9