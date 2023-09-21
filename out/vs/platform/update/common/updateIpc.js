/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/update/common/update"], function (require, exports, event_1, update_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UpdateChannelClient = exports.UpdateChannel = void 0;
    class UpdateChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            switch (event) {
                case 'onStateChange': return this.service.onStateChange;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'checkForUpdates': return this.service.checkForUpdates(arg);
                case 'downloadUpdate': return this.service.downloadUpdate();
                case 'applyUpdate': return this.service.applyUpdate();
                case 'quitAndInstall': return this.service.quitAndInstall();
                case '_getInitialState': return Promise.resolve(this.service.state);
                case 'isLatestVersion': return this.service.isLatestVersion();
                case '_applySpecificUpdate': return this.service._applySpecificUpdate(arg);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.UpdateChannel = UpdateChannel;
    class UpdateChannelClient {
        get state() { return this._state; }
        set state(state) {
            this._state = state;
            this._onStateChange.fire(state);
        }
        constructor(channel) {
            this.channel = channel;
            this._onStateChange = new event_1.Emitter();
            this.onStateChange = this._onStateChange.event;
            this._state = update_1.State.Uninitialized;
            this.channel.listen('onStateChange')(state => this.state = state);
            this.channel.call('_getInitialState').then(state => this.state = state);
        }
        checkForUpdates(explicit) {
            return this.channel.call('checkForUpdates', explicit);
        }
        downloadUpdate() {
            return this.channel.call('downloadUpdate');
        }
        applyUpdate() {
            return this.channel.call('applyUpdate');
        }
        quitAndInstall() {
            return this.channel.call('quitAndInstall');
        }
        isLatestVersion() {
            return this.channel.call('isLatestVersion');
        }
        _applySpecificUpdate(packagePath) {
            return this.channel.call('_applySpecificUpdate', packagePath);
        }
    }
    exports.UpdateChannelClient = UpdateChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXBkYXRlL2NvbW1vbi91cGRhdGVJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsYUFBYTtRQUV6QixZQUFvQixPQUF1QjtZQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFJLENBQUM7UUFFaEQsTUFBTSxDQUFDLENBQVUsRUFBRSxLQUFhO1lBQy9CLFFBQVEsS0FBSyxFQUFFO2dCQUNkLEtBQUssZUFBZSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQzthQUN4RDtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksQ0FBQyxDQUFVLEVBQUUsT0FBZSxFQUFFLEdBQVM7WUFDMUMsUUFBUSxPQUFPLEVBQUU7Z0JBQ2hCLEtBQUssaUJBQWlCLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRSxLQUFLLGdCQUFnQixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUM1RCxLQUFLLGFBQWEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEQsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUQsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRSxLQUFLLGlCQUFpQixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5RCxLQUFLLHNCQUFzQixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzNFO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBQ0Q7SUF6QkQsc0NBeUJDO0lBRUQsTUFBYSxtQkFBbUI7UUFRL0IsSUFBSSxLQUFLLEtBQVksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLEtBQUssQ0FBQyxLQUFZO1lBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxZQUE2QixPQUFpQjtZQUFqQixZQUFPLEdBQVAsT0FBTyxDQUFVO1lBVjdCLG1CQUFjLEdBQUcsSUFBSSxlQUFPLEVBQVMsQ0FBQztZQUM5QyxrQkFBYSxHQUFpQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUV6RCxXQUFNLEdBQVUsY0FBSyxDQUFDLGFBQWEsQ0FBQztZQVEzQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBUSxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQVEsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxlQUFlLENBQUMsUUFBaUI7WUFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsY0FBYztZQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsV0FBVztZQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELGNBQWM7WUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELGVBQWU7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELG9CQUFvQixDQUFDLFdBQW1CO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDL0QsQ0FBQztLQUNEO0lBMUNELGtEQTBDQyJ9