/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event"], function (require, exports, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestServiceClient = exports.TestChannel = exports.TestService = void 0;
    class TestService {
        constructor() {
            this._onMarco = new event_1.Emitter();
            this.onMarco = this._onMarco.event;
        }
        marco() {
            this._onMarco.fire({ answer: 'polo' });
            return Promise.resolve('polo');
        }
        pong(ping) {
            return Promise.resolve({ incoming: ping, outgoing: 'pong' });
        }
        cancelMe() {
            return Promise.resolve((0, async_1.timeout)(100)).then(() => true);
        }
    }
    exports.TestService = TestService;
    class TestChannel {
        constructor(testService) {
            this.testService = testService;
        }
        listen(_, event) {
            switch (event) {
                case 'marco': return this.testService.onMarco;
            }
            throw new Error('Event not found');
        }
        call(_, command, ...args) {
            switch (command) {
                case 'pong': return this.testService.pong(args[0]);
                case 'cancelMe': return this.testService.cancelMe();
                case 'marco': return this.testService.marco();
                default: return Promise.reject(new Error(`command not found: ${command}`));
            }
        }
    }
    exports.TestChannel = TestChannel;
    class TestServiceClient {
        get onMarco() { return this.channel.listen('marco'); }
        constructor(channel) {
            this.channel = channel;
        }
        marco() {
            return this.channel.call('marco');
        }
        pong(ping) {
            return this.channel.call('pong', ping);
        }
        cancelMe() {
            return this.channel.call('cancelMe');
        }
    }
    exports.TestServiceClient = TestServiceClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy90ZXN0L25vZGUvdGVzdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLFdBQVc7UUFBeEI7WUFFa0IsYUFBUSxHQUFHLElBQUksZUFBTyxFQUFtQixDQUFDO1lBQzNELFlBQU8sR0FBMkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFjdkQsQ0FBQztRQVpBLEtBQUs7WUFDSixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQVk7WUFDaEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLGVBQU8sRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxDQUFDO0tBQ0Q7SUFqQkQsa0NBaUJDO0lBRUQsTUFBYSxXQUFXO1FBRXZCLFlBQW9CLFdBQXlCO1lBQXpCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBQUksQ0FBQztRQUVsRCxNQUFNLENBQUMsQ0FBVSxFQUFFLEtBQWE7WUFDL0IsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsS0FBSyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO2FBQzlDO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBVSxFQUFFLE9BQWUsRUFBRSxHQUFHLElBQVc7WUFDL0MsUUFBUSxPQUFPLEVBQUU7Z0JBQ2hCLEtBQUssTUFBTSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsS0FBSyxVQUFVLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BELEtBQUssT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5QyxPQUFPLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsc0JBQXNCLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMzRTtRQUNGLENBQUM7S0FDRDtJQXBCRCxrQ0FvQkM7SUFFRCxNQUFhLGlCQUFpQjtRQUU3QixJQUFJLE9BQU8sS0FBNkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUUsWUFBb0IsT0FBaUI7WUFBakIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUFJLENBQUM7UUFFMUMsS0FBSztZQUNKLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFZO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO0tBQ0Q7SUFqQkQsOENBaUJDIn0=