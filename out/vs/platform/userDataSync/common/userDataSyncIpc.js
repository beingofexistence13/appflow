/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri"], function (require, exports, lifecycle_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncStoreManagementServiceChannelClient = exports.UserDataSyncStoreManagementServiceChannel = exports.UserDataSyncAccountServiceChannel = exports.UserDataSyncMachinesServiceChannel = exports.UserDataSyncUtilServiceClient = exports.UserDataSycnUtilServiceChannel = exports.UserDataAutoSyncChannel = void 0;
    class UserDataAutoSyncChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            switch (event) {
                case 'onError': return this.service.onError;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'triggerSync': return this.service.triggerSync(args[0], args[1], args[2]);
                case 'turnOn': return this.service.turnOn();
                case 'turnOff': return this.service.turnOff(args[0]);
            }
            throw new Error('Invalid call');
        }
    }
    exports.UserDataAutoSyncChannel = UserDataAutoSyncChannel;
    class UserDataSycnUtilServiceChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'resolveDefaultIgnoredSettings': return this.service.resolveDefaultIgnoredSettings();
                case 'resolveUserKeybindings': return this.service.resolveUserBindings(args[0]);
                case 'resolveFormattingOptions': return this.service.resolveFormattingOptions(uri_1.URI.revive(args[0]));
            }
            throw new Error('Invalid call');
        }
    }
    exports.UserDataSycnUtilServiceChannel = UserDataSycnUtilServiceChannel;
    class UserDataSyncUtilServiceClient {
        constructor(channel) {
            this.channel = channel;
        }
        async resolveDefaultIgnoredSettings() {
            return this.channel.call('resolveDefaultIgnoredSettings');
        }
        async resolveUserBindings(userbindings) {
            return this.channel.call('resolveUserKeybindings', [userbindings]);
        }
        async resolveFormattingOptions(file) {
            return this.channel.call('resolveFormattingOptions', [file]);
        }
    }
    exports.UserDataSyncUtilServiceClient = UserDataSyncUtilServiceClient;
    class UserDataSyncMachinesServiceChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChange': return this.service.onDidChange;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, args) {
            switch (command) {
                case 'getMachines': return this.service.getMachines();
                case 'addCurrentMachine': return this.service.addCurrentMachine();
                case 'removeCurrentMachine': return this.service.removeCurrentMachine();
                case 'renameMachine': return this.service.renameMachine(args[0], args[1]);
                case 'setEnablements': return this.service.setEnablements(args);
            }
            throw new Error('Invalid call');
        }
    }
    exports.UserDataSyncMachinesServiceChannel = UserDataSyncMachinesServiceChannel;
    class UserDataSyncAccountServiceChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChangeAccount': return this.service.onDidChangeAccount;
                case 'onTokenFailed': return this.service.onTokenFailed;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case '_getInitialData': return Promise.resolve(this.service.account);
                case 'updateAccount': return this.service.updateAccount(args);
            }
            throw new Error('Invalid call');
        }
    }
    exports.UserDataSyncAccountServiceChannel = UserDataSyncAccountServiceChannel;
    class UserDataSyncStoreManagementServiceChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChangeUserDataSyncStore': return this.service.onDidChangeUserDataSyncStore;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'switch': return this.service.switch(args[0]);
                case 'getPreviousUserDataSyncStore': return this.service.getPreviousUserDataSyncStore();
            }
            throw new Error('Invalid call');
        }
    }
    exports.UserDataSyncStoreManagementServiceChannel = UserDataSyncStoreManagementServiceChannel;
    class UserDataSyncStoreManagementServiceChannelClient extends lifecycle_1.Disposable {
        constructor(channel) {
            super();
            this.channel = channel;
            this.onDidChangeUserDataSyncStore = this.channel.listen('onDidChangeUserDataSyncStore');
        }
        async switch(type) {
            return this.channel.call('switch', [type]);
        }
        async getPreviousUserDataSyncStore() {
            const userDataSyncStore = await this.channel.call('getPreviousUserDataSyncStore');
            return this.revive(userDataSyncStore);
        }
        revive(userDataSyncStore) {
            return {
                url: uri_1.URI.revive(userDataSyncStore.url),
                type: userDataSyncStore.type,
                defaultUrl: uri_1.URI.revive(userDataSyncStore.defaultUrl),
                insidersUrl: uri_1.URI.revive(userDataSyncStore.insidersUrl),
                stableUrl: uri_1.URI.revive(userDataSyncStore.stableUrl),
                canSwitch: userDataSyncStore.canSwitch,
                authenticationProviders: userDataSyncStore.authenticationProviders,
            };
        }
    }
    exports.UserDataSyncStoreManagementServiceChannelClient = UserDataSyncStoreManagementServiceChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi91c2VyRGF0YVN5bmNJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsdUJBQXVCO1FBRW5DLFlBQTZCLE9BQWlDO1lBQWpDLFlBQU8sR0FBUCxPQUFPLENBQTBCO1FBQUksQ0FBQztRQUVuRSxNQUFNLENBQUMsQ0FBVSxFQUFFLEtBQWE7WUFDL0IsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsS0FBSyxTQUFTLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQzVDO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQVksRUFBRSxPQUFlLEVBQUUsSUFBVTtZQUM3QyxRQUFRLE9BQU8sRUFBRTtnQkFDaEIsS0FBSyxhQUFhLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLEtBQUssUUFBUSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM1QyxLQUFLLFNBQVMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckQ7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7S0FDRDtJQW5CRCwwREFtQkM7SUFFRCxNQUFhLDhCQUE4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