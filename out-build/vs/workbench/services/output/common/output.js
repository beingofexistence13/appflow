/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, platform_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gJ = exports.$fJ = exports.OutputChannelUpdateMode = exports.$eJ = exports.$dJ = exports.$cJ = exports.$bJ = exports.$aJ = exports.$_I = exports.$$I = exports.$0I = exports.$9I = exports.$8I = exports.$7I = void 0;
    /**
     * Mime type used by the output editor.
     */
    exports.$7I = 'text/x-code-output';
    /**
     * Output resource scheme.
     */
    exports.$8I = 'output';
    /**
     * Id used by the output editor.
     */
    exports.$9I = 'Log';
    /**
     * Mime type used by the log output editor.
     */
    exports.$0I = 'text/x-code-log-output';
    /**
     * Log resource scheme.
     */
    exports.$$I = 'log';
    /**
     * Id used by the log output editor.
     */
    exports.$_I = 'log';
    /**
     * Output view id
     */
    exports.$aJ = 'workbench.panel.output';
    exports.$bJ = new contextkey_1.$2i('inOutput', false);
    exports.$cJ = new contextkey_1.$2i('activeLogOutput', false);
    exports.$dJ = new contextkey_1.$2i(`outputView.scrollLock`, false);
    exports.$eJ = (0, instantiation_1.$Bh)('outputService');
    var OutputChannelUpdateMode;
    (function (OutputChannelUpdateMode) {
        OutputChannelUpdateMode[OutputChannelUpdateMode["Append"] = 1] = "Append";
        OutputChannelUpdateMode[OutputChannelUpdateMode["Replace"] = 2] = "Replace";
        OutputChannelUpdateMode[OutputChannelUpdateMode["Clear"] = 3] = "Clear";
    })(OutputChannelUpdateMode || (exports.OutputChannelUpdateMode = OutputChannelUpdateMode = {}));
    exports.$fJ = {
        OutputChannels: 'workbench.contributions.outputChannels'
    };
    class OutputChannelRegistry {
        constructor() {
            this.a = new Map();
            this.b = new event_1.$fd();
            this.onDidRegisterChannel = this.b.event;
            this.c = new event_1.$fd();
            this.onDidRemoveChannel = this.c.event;
        }
        registerChannel(descriptor) {
            if (!this.a.has(descriptor.id)) {
                this.a.set(descriptor.id, descriptor);
                this.b.fire(descriptor.id);
            }
        }
        getChannels() {
            const result = [];
            this.a.forEach(value => result.push(value));
            return result;
        }
        getChannel(id) {
            return this.a.get(id);
        }
        removeChannel(id) {
            this.a.delete(id);
            this.c.fire(id);
        }
    }
    platform_1.$8m.add(exports.$fJ.OutputChannels, new OutputChannelRegistry());
    exports.$gJ = new contextkey_1.$2i('activeOutputChannel', '');
});
//# sourceMappingURL=output.js.map