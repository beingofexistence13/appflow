/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DownloadServiceChannelClient = exports.DownloadServiceChannel = void 0;
    class DownloadServiceChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event, arg) {
            throw new Error('Invalid listen');
        }
        call(context, command, args) {
            switch (command) {
                case 'download': return this.service.download(uri_1.URI.revive(args[0]), uri_1.URI.revive(args[1]));
            }
            throw new Error('Invalid call');
        }
    }
    exports.DownloadServiceChannel = DownloadServiceChannel;
    class DownloadServiceChannelClient {
        constructor(channel, getUriTransformer) {
            this.channel = channel;
            this.getUriTransformer = getUriTransformer;
        }
        async download(from, to) {
            const uriTransfomer = this.getUriTransformer();
            if (uriTransfomer) {
                from = uriTransfomer.transformOutgoingURI(from);
                to = uriTransfomer.transformOutgoingURI(to);
            }
            await this.channel.call('download', [from, to]);
        }
    }
    exports.DownloadServiceChannelClient = DownloadServiceChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRJcGMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9kb3dubG9hZC9jb21tb24vZG93bmxvYWRJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsc0JBQXNCO1FBRWxDLFlBQTZCLE9BQXlCO1lBQXpCLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQUksQ0FBQztRQUUzRCxNQUFNLENBQUMsQ0FBVSxFQUFFLEtBQWEsRUFBRSxHQUFTO1lBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQVksRUFBRSxPQUFlLEVBQUUsSUFBVTtZQUM3QyxRQUFRLE9BQU8sRUFBRTtnQkFDaEIsS0FBSyxVQUFVLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFkRCx3REFjQztJQUVELE1BQWEsNEJBQTRCO1FBSXhDLFlBQW9CLE9BQWlCLEVBQVUsaUJBQStDO1lBQTFFLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFBVSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1FBQUksQ0FBQztRQUVuRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQVMsRUFBRSxFQUFPO1lBQ2hDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9DLElBQUksYUFBYSxFQUFFO2dCQUNsQixJQUFJLEdBQUcsYUFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoRCxFQUFFLEdBQUcsYUFBYSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQ0Q7SUFkRCxvRUFjQyJ9