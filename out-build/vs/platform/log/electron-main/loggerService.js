/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/log/node/loggerService"], function (require, exports, map_1, event_1, instantiation_1, log_1, loggerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v6b = exports.$u6b = void 0;
    exports.$u6b = (0, instantiation_1.$Ch)(log_1.$6i);
    class $v6b extends loggerService_1.$cN {
        constructor() {
            super(...arguments);
            this.u = new map_1.$zi();
        }
        createLogger(idOrResource, options, windowId) {
            if (windowId !== undefined) {
                this.u.set(this.n(idOrResource), windowId);
            }
            try {
                return super.createLogger(idOrResource, options);
            }
            catch (error) {
                this.u.delete(this.n(idOrResource));
                throw error;
            }
        }
        registerLogger(resource, windowId) {
            if (windowId !== undefined) {
                this.u.set(resource.resource, windowId);
            }
            super.registerLogger(resource);
        }
        deregisterLogger(resource) {
            this.u.delete(resource);
            super.deregisterLogger(resource);
        }
        getRegisteredLoggers(windowId) {
            const resources = [];
            for (const resource of super.getRegisteredLoggers()) {
                if (windowId === this.u.get(resource.resource)) {
                    resources.push(resource);
                }
            }
            return resources;
        }
        getOnDidChangeLogLevelEvent(windowId) {
            return event_1.Event.filter(this.onDidChangeLogLevel, arg => (0, log_1.$7i)(arg) || this.w(arg[0], windowId));
        }
        getOnDidChangeVisibilityEvent(windowId) {
            return event_1.Event.filter(this.onDidChangeVisibility, ([resource]) => this.w(resource, windowId));
        }
        getOnDidChangeLoggersEvent(windowId) {
            return event_1.Event.filter(event_1.Event.map(this.onDidChangeLoggers, e => {
                const r = {
                    added: [...e.added].filter(loggerResource => this.w(loggerResource.resource, windowId)),
                    removed: [...e.removed].filter(loggerResource => this.w(loggerResource.resource, windowId)),
                };
                return r;
            }), e => e.added.length > 0 || e.removed.length > 0);
        }
        deregisterLoggers(windowId) {
            for (const [resource, resourceWindow] of this.u) {
                if (resourceWindow === windowId) {
                    this.deregisterLogger(resource);
                }
            }
        }
        w(resource, windowId) {
            const loggerWindowId = this.u.get(resource);
            return loggerWindowId === undefined || loggerWindowId === windowId;
        }
        dispose() {
            super.dispose();
            this.u.clear();
        }
    }
    exports.$v6b = $v6b;
});
//# sourceMappingURL=loggerService.js.map