/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation"], function (require, exports, arrays_1, configuration_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IgnoredExtensionsManagementService = exports.IIgnoredExtensionsManagementService = void 0;
    exports.IIgnoredExtensionsManagementService = (0, instantiation_1.createDecorator)('IIgnoredExtensionsManagementService');
    let IgnoredExtensionsManagementService = class IgnoredExtensionsManagementService {
        constructor(configurationService) {
            this.configurationService = configurationService;
        }
        hasToNeverSyncExtension(extensionId) {
            const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
            return configuredIgnoredExtensions.includes(extensionId.toLowerCase());
        }
        hasToAlwaysSyncExtension(extensionId) {
            const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
            return configuredIgnoredExtensions.includes(`-${extensionId.toLowerCase()}`);
        }
        updateIgnoredExtensions(ignoredExtensionId, ignore) {
            // first remove the extension completely from ignored extensions
            let currentValue = [...this.configurationService.getValue('settingsSync.ignoredExtensions')].map(id => id.toLowerCase());
            currentValue = currentValue.filter(v => v !== ignoredExtensionId && v !== `-${ignoredExtensionId}`);
            // Add only if ignored
            if (ignore) {
                currentValue.push(ignoredExtensionId.toLowerCase());
            }
            return this.configurationService.updateValue('settingsSync.ignoredExtensions', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
        }
        updateSynchronizedExtensions(extensionId, sync) {
            // first remove the extension completely from ignored extensions
            let currentValue = [...this.configurationService.getValue('settingsSync.ignoredExtensions')].map(id => id.toLowerCase());
            currentValue = currentValue.filter(v => v !== extensionId && v !== `-${extensionId}`);
            // Add only if synced
            if (sync) {
                currentValue.push(`-${extensionId.toLowerCase()}`);
            }
            return this.configurationService.updateValue('settingsSync.ignoredExtensions', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
        }
        getIgnoredExtensions(installed) {
            const defaultIgnoredExtensions = installed.filter(i => i.isMachineScoped).map(i => i.identifier.id.toLowerCase());
            const value = this.getConfiguredIgnoredExtensions().map(id => id.toLowerCase());
            const added = [], removed = [];
            if (Array.isArray(value)) {
                for (const key of value) {
                    if (key.startsWith('-')) {
                        removed.push(key.substring(1));
                    }
                    else {
                        added.push(key);
                    }
                }
            }
            return (0, arrays_1.distinct)([...defaultIgnoredExtensions, ...added,].filter(setting => !removed.includes(setting)));
        }
        getConfiguredIgnoredExtensions() {
            let userValue = this.configurationService.inspect('settingsSync.ignoredExtensions').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            userValue = this.configurationService.inspect('sync.ignoredExtensions').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            return (this.configurationService.getValue('settingsSync.ignoredExtensions') || []).map(id => id.toLowerCase());
        }
    };
    exports.IgnoredExtensionsManagementService = IgnoredExtensionsManagementService;
    exports.IgnoredExtensionsManagementService = IgnoredExtensionsManagementService = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], IgnoredExtensionsManagementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWdub3JlZEV4dGVuc2lvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL2lnbm9yZWRFeHRlbnNpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU9uRixRQUFBLG1DQUFtQyxHQUFHLElBQUEsK0JBQWUsRUFBc0MscUNBQXFDLENBQUMsQ0FBQztJQVl4SSxJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFrQztRQUk5QyxZQUN5QyxvQkFBMkM7WUFBM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtRQUVwRixDQUFDO1FBRUQsdUJBQXVCLENBQUMsV0FBbUI7WUFDMUMsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztZQUMxRSxPQUFPLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsd0JBQXdCLENBQUMsV0FBbUI7WUFDM0MsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztZQUMxRSxPQUFPLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELHVCQUF1QixDQUFDLGtCQUEwQixFQUFFLE1BQWU7WUFDbEUsZ0VBQWdFO1lBQ2hFLElBQUksWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFXLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNuSSxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENB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