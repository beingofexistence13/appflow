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
define(["require", "exports", "vs/base/common/async", "vs/platform/log/common/log"], function (require, exports, async_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowProfiler = void 0;
    let WindowProfiler = class WindowProfiler {
        constructor(_window, _sessionId, _logService) {
            this._window = _window;
            this._sessionId = _sessionId;
            this._logService = _logService;
        }
        async inspect(duration) {
            await this._connect();
            const inspector = this._window.webContents.debugger;
            await inspector.sendCommand('Profiler.start');
            this._logService.warn('[perf] profiling STARTED', this._sessionId);
            await (0, async_1.timeout)(duration);
            const data = await inspector.sendCommand('Profiler.stop');
            this._logService.warn('[perf] profiling DONE', this._sessionId);
            await this._disconnect();
            return data.profile;
        }
        async _connect() {
            const inspector = this._window.webContents.debugger;
            inspector.attach();
            await inspector.sendCommand('Profiler.enable');
        }
        async _disconnect() {
            const inspector = this._window.webContents.debugger;
            await inspector.sendCommand('Profiler.disable');
            inspector.detach();
        }
    };
    exports.WindowProfiler = WindowProfiler;
    exports.WindowProfiler = WindowProfiler = __decorate([
        __param(2, log_1.ILogService)
    ], WindowProfiler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93UHJvZmlsaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcHJvZmlsaW5nL2VsZWN0cm9uLW1haW4vd2luZG93UHJvZmlsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjO1FBRTFCLFlBQ2tCLE9BQXNCLEVBQ3RCLFVBQWtCLEVBQ0wsV0FBd0I7WUFGckMsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUN0QixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQ0wsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDbkQsQ0FBQztRQUVMLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZ0I7WUFFN0IsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3BELE1BQU0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRSxNQUFNLElBQUEsZUFBTyxFQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxHQUFrQixNQUFNLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWhFLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRU8sS0FBSyxDQUFDLFFBQVE7WUFDckIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQixNQUFNLFNBQVMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRU8sS0FBSyxDQUFDLFdBQVc7WUFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3BELE1BQU0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hELFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQixDQUFDO0tBQ0QsQ0FBQTtJQWxDWSx3Q0FBYzs2QkFBZCxjQUFjO1FBS3hCLFdBQUEsaUJBQVcsQ0FBQTtPQUxELGNBQWMsQ0FrQzFCIn0=