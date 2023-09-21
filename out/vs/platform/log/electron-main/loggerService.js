/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/log/node/loggerService"], function (require, exports, map_1, event_1, instantiation_1, log_1, loggerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggerMainService = exports.ILoggerMainService = void 0;
    exports.ILoggerMainService = (0, instantiation_1.refineServiceDecorator)(log_1.ILoggerService);
    class LoggerMainService extends loggerService_1.LoggerService {
        constructor() {
            super(...arguments);
            this.loggerResourcesByWindow = new map_1.ResourceMap();
        }
        createLogger(idOrResource, options, windowId) {
            if (windowId !== undefined) {
                this.loggerResourcesByWindow.set(this.toResource(idOrResource), windowId);
            }
            try {
                return super.createLogger(idOrResource, options);
            }
            catch (error) {
                this.loggerResourcesByWindow.delete(this.toResource(idOrResource));
                throw error;
            }
        }
        registerLogger(resource, windowId) {
            if (windowId !== undefined) {
                this.loggerResourcesByWindow.set(resource.resource, windowId);
            }
            super.registerLogger(resource);
        }
        deregisterLogger(resource) {
            this.loggerResourcesByWindow.delete(resource);
            super.deregisterLogger(resource);
        }
        getRegisteredLoggers(windowId) {
            const resources = [];
            for (const resource of super.getRegisteredLoggers()) {
                if (windowId === this.loggerResourcesByWindow.get(resource.resource)) {
                    resources.push(resource);
                }
            }
            return resources;
        }
        getOnDidChangeLogLevelEvent(windowId) {
            return event_1.Event.filter(this.onDidChangeLogLevel, arg => (0, log_1.isLogLevel)(arg) || this.isInterestedLoggerResource(arg[0], windowId));
        }
        getOnDidChangeVisibilityEvent(windowId) {
            return event_1.Event.filter(this.onDidChangeVisibility, ([resource]) => this.isInterestedLoggerResource(resource, windowId));
        }
        getOnDidChangeLoggersEvent(windowId) {
            return event_1.Event.filter(event_1.Event.map(this.onDidChangeLoggers, e => {
                const r = {
                    added: [...e.added].filter(loggerResource => this.isInterestedLoggerResource(loggerResource.resource, windowId)),
                    removed: [...e.removed].filter(loggerResource => this.isInterestedLoggerResource(loggerResource.resource, windowId)),
                };
                return r;
            }), e => e.added.length > 0 || e.removed.length > 0);
        }
        deregisterLoggers(windowId) {
            for (const [resource, resourceWindow] of this.loggerResourcesByWindow) {
                if (resourceWindow === windowId) {
                    this.deregisterLogger(resource);
                }
            }
        }
        isInterestedLoggerResource(resource, windowId) {
            const loggerWindowId = this.loggerResourcesByWindow.get(resource);
            return loggerWindowId === undefined || loggerWindowId === windowId;
        }
        dispose() {
            super.dispose();
            this.loggerResourcesByWindow.clear();
        }
    }
    exports.LoggerMainService = LoggerMainService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xvZy9lbGVjdHJvbi1tYWluL2xvZ2dlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSxzQ0FBc0IsRUFBcUMsb0JBQWMsQ0FBQyxDQUFDO0lBc0I3RyxNQUFhLGlCQUFrQixTQUFRLDZCQUFhO1FBQXBEOztZQUVrQiw0QkFBdUIsR0FBRyxJQUFJLGlCQUFXLEVBQVUsQ0FBQztRQXdFdEUsQ0FBQztRQXRFUyxZQUFZLENBQUMsWUFBMEIsRUFBRSxPQUF3QixFQUFFLFFBQWlCO1lBQzVGLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzFFO1lBQ0QsSUFBSTtnQkFDSCxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2pEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sS0FBSyxDQUFDO2FBQ1o7UUFDRixDQUFDO1FBRVEsY0FBYyxDQUFDLFFBQXlCLEVBQUUsUUFBaUI7WUFDbkUsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUMzQixJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDOUQ7WUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hDLENB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