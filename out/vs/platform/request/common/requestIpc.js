/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/cancellation"], function (require, exports, buffer_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RequestChannelClient = exports.RequestChannel = void 0;
    class RequestChannel {
        constructor(service) {
            this.service = service;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        call(context, command, args, token = cancellation_1.CancellationToken.None) {
            switch (command) {
                case 'request': return this.service.request(args[0], token)
                    .then(async ({ res, stream }) => {
                    const buffer = await (0, buffer_1.streamToBuffer)(stream);
                    return [{ statusCode: res.statusCode, headers: res.headers }, buffer];
                });
                case 'resolveProxy': return this.service.resolveProxy(args[0]);
            }
            throw new Error('Invalid call');
        }
    }
    exports.RequestChannel = RequestChannel;
    class RequestChannelClient {
        constructor(channel) {
            this.channel = channel;
        }
        async request(options, token) {
            const [res, buffer] = await this.channel.call('request', [options], token);
            return { res, stream: (0, buffer_1.bufferToStream)(buffer) };
        }
        async resolveProxy(url) {
            return this.channel.call('resolveProxy', [url]);
        }
    }
    exports.RequestChannelClient = RequestChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdElwYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlcXVlc3QvY29tbW9uL3JlcXVlc3RJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLGNBQWM7UUFFMUIsWUFBNkIsT0FBd0I7WUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFBSSxDQUFDO1FBRTFELE1BQU0sQ0FBQyxPQUFZLEVBQUUsS0FBYTtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFZLEVBQUUsT0FBZSxFQUFFLElBQVUsRUFBRSxRQUEyQixnQ0FBaUIsQ0FBQyxJQUFJO1lBQ2hHLFFBQVEsT0FBTyxFQUFFO2dCQUNoQixLQUFLLFNBQVMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztxQkFDekQsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO29CQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsdUJBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUMsT0FBd0IsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hGLENBQUMsQ0FBQyxDQUFDO2dCQUNKLEtBQUssY0FBYyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvRDtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDakMsQ0FBQztLQUNEO0lBbkJELHdDQW1CQztJQUVELE1BQWEsb0JBQW9CO1FBSWhDLFlBQTZCLE9BQWlCO1lBQWpCLFlBQU8sR0FBUCxPQUFPLENBQVU7UUFBSSxDQUFDO1FBRW5ELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBd0IsRUFBRSxLQUF3QjtZQUMvRCxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWtCLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUEsdUJBQWMsRUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVc7WUFDN0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBcUIsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBRUQ7SUFmRCxvREFlQyJ9