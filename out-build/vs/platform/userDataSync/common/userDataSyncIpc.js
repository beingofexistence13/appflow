/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri"], function (require, exports, lifecycle_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z7b = exports.$Y7b = exports.$X7b = exports.$W7b = exports.$V7b = exports.$U7b = exports.$T7b = void 0;
    class $T7b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'onError': return this.a.onError;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'triggerSync': return this.a.triggerSync(args[0], args[1], args[2]);
                case 'turnOn': return this.a.turnOn();
                case 'turnOff': return this.a.turnOff(args[0]);
            }
            throw new Error('Invalid call');
        }
    }
    exports.$T7b = $T7b;
    class $U7b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'resolveDefaultIgnoredSettings': return this.a.resolveDefaultIgnoredSettings();
                case 'resolveUserKeybindings': return this.a.resolveUserBindings(args[0]);
                case 'resolveFormattingOptions': return this.a.resolveFormattingOptions(uri_1.URI.revive(args[0]));
            }
            throw new Error('Invalid call');
        }
    }
    exports.$U7b = $U7b;
    class $V7b {
        constructor(a) {
            this.a = a;
        }
        async resolveDefaultIgnoredSettings() {
            return this.a.call('resolveDefaultIgnoredSettings');
        }
        async resolveUserBindings(userbindings) {
            return this.a.call('resolveUserKeybindings', [userbindings]);
        }
        async resolveFormattingOptions(file) {
            return this.a.call('resolveFormattingOptions', [file]);
        }
    }
    exports.$V7b = $V7b;
    class $W7b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChange': return this.a.onDidChange;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, args) {
            switch (command) {
                case 'getMachines': return this.a.getMachines();
                case 'addCurrentMachine': return this.a.addCurrentMachine();
                case 'removeCurrentMachine': return this.a.removeCurrentMachine();
                case 'renameMachine': return this.a.renameMachine(args[0], args[1]);
                case 'setEnablements': return this.a.setEnablements(args);
            }
            throw new Error('Invalid call');
        }
    }
    exports.$W7b = $W7b;
    class $X7b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChangeAccount': return this.a.onDidChangeAccount;
                case 'onTokenFailed': return this.a.onTokenFailed;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case '_getInitialData': return Promise.resolve(this.a.account);
                case 'updateAccount': return this.a.updateAccount(args);
            }
            throw new Error('Invalid call');
        }
    }
    exports.$X7b = $X7b;
    class $Y7b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChangeUserDataSyncStore': return this.a.onDidChangeUserDataSyncStore;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(context, command, args) {
            switch (command) {
                case 'switch': return this.a.switch(args[0]);
                case 'getPreviousUserDataSyncStore': return this.a.getPreviousUserDataSyncStore();
            }
            throw new Error('Invalid call');
        }
    }
    exports.$Y7b = $Y7b;
    class $Z7b extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            this.onDidChangeUserDataSyncStore = this.a.listen('onDidChangeUserDataSyncStore');
        }
        async switch(type) {
            return this.a.call('switch', [type]);
        }
        async getPreviousUserDataSyncStore() {
            const userDataSyncStore = await this.a.call('getPreviousUserDataSyncStore');
            return this.b(userDataSyncStore);
        }
        b(userDataSyncStore) {
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
    exports.$Z7b = $Z7b;
});
//# sourceMappingURL=userDataSyncIpc.js.map