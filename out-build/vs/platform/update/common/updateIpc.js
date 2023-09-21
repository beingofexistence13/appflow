/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/update/common/update"], function (require, exports, event_1, update_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E6b = exports.$D6b = void 0;
    class $D6b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'onStateChange': return this.a.onStateChange;
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'checkForUpdates': return this.a.checkForUpdates(arg);
                case 'downloadUpdate': return this.a.downloadUpdate();
                case 'applyUpdate': return this.a.applyUpdate();
                case 'quitAndInstall': return this.a.quitAndInstall();
                case '_getInitialState': return Promise.resolve(this.a.state);
                case 'isLatestVersion': return this.a.isLatestVersion();
                case '_applySpecificUpdate': return this.a._applySpecificUpdate(arg);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.$D6b = $D6b;
    class $E6b {
        get state() { return this.b; }
        set state(state) {
            this.b = state;
            this.a.fire(state);
        }
        constructor(c) {
            this.c = c;
            this.a = new event_1.$fd();
            this.onStateChange = this.a.event;
            this.b = update_1.$TT.Uninitialized;
            this.c.listen('onStateChange')(state => this.state = state);
            this.c.call('_getInitialState').then(state => this.state = state);
        }
        checkForUpdates(explicit) {
            return this.c.call('checkForUpdates', explicit);
        }
        downloadUpdate() {
            return this.c.call('downloadUpdate');
        }
        applyUpdate() {
            return this.c.call('applyUpdate');
        }
        quitAndInstall() {
            return this.c.call('quitAndInstall');
        }
        isLatestVersion() {
            return this.c.call('isLatestVersion');
        }
        _applySpecificUpdate(packagePath) {
            return this.c.call('_applySpecificUpdate', packagePath);
        }
    }
    exports.$E6b = $E6b;
});
//# sourceMappingURL=updateIpc.js.map