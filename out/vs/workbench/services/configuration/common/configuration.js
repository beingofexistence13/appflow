/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation"], function (require, exports, configuration_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APPLY_ALL_PROFILES_SETTING = exports.TASKS_DEFAULT = exports.IWorkbenchConfigurationService = exports.USER_STANDALONE_CONFIGURATIONS = exports.WORKSPACE_STANDALONE_CONFIGURATIONS = exports.LAUNCH_CONFIGURATION_KEY = exports.TASKS_CONFIGURATION_KEY = exports.FOLDER_SCOPES = exports.WORKSPACE_SCOPES = exports.REMOTE_MACHINE_SCOPES = exports.LOCAL_MACHINE_SCOPES = exports.LOCAL_MACHINE_PROFILE_SCOPES = exports.PROFILE_SCOPES = exports.APPLICATION_SCOPES = exports.tasksSchemaId = exports.launchSchemaId = exports.folderSettingsSchemaId = exports.workspaceSettingsSchemaId = exports.machineSettingsSchemaId = exports.profileSettingsSchemaId = exports.userSettingsSchemaId = exports.defaultSettingsSchemaId = exports.FOLDER_SETTINGS_PATH = exports.FOLDER_SETTINGS_NAME = exports.FOLDER_CONFIG_FOLDER_NAME = void 0;
    exports.FOLDER_CONFIG_FOLDER_NAME = '.vscode';
    exports.FOLDER_SETTINGS_NAME = 'settings';
    exports.FOLDER_SETTINGS_PATH = `${exports.FOLDER_CONFIG_FOLDER_NAME}/${exports.FOLDER_SETTINGS_NAME}.json`;
    exports.defaultSettingsSchemaId = 'vscode://schemas/settings/default';
    exports.userSettingsSchemaId = 'vscode://schemas/settings/user';
    exports.profileSettingsSchemaId = 'vscode://schemas/settings/profile';
    exports.machineSettingsSchemaId = 'vscode://schemas/settings/machine';
    exports.workspaceSettingsSchemaId = 'vscode://schemas/settings/workspace';
    exports.folderSettingsSchemaId = 'vscode://schemas/settings/folder';
    exports.launchSchemaId = 'vscode://schemas/launch';
    exports.tasksSchemaId = 'vscode://schemas/tasks';
    exports.APPLICATION_SCOPES = [1 /* ConfigurationScope.APPLICATION */];
    exports.PROFILE_SCOPES = [2 /* ConfigurationScope.MACHINE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.LOCAL_MACHINE_PROFILE_SCOPES = [3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */];
    exports.LOCAL_MACHINE_SCOPES = [1 /* ConfigurationScope.APPLICATION */, ...exports.LOCAL_MACHINE_PROFILE_SCOPES];
    exports.REMOTE_MACHINE_SCOPES = [2 /* ConfigurationScope.MACHINE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.WORKSPACE_SCOPES = [3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.FOLDER_SCOPES = [4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.TASKS_CONFIGURATION_KEY = 'tasks';
    exports.LAUNCH_CONFIGURATION_KEY = 'launch';
    exports.WORKSPACE_STANDALONE_CONFIGURATIONS = Object.create(null);
    exports.WORKSPACE_STANDALONE_CONFIGURATIONS[exports.TASKS_CONFIGURATION_KEY] = `${exports.FOLDER_CONFIG_FOLDER_NAME}/${exports.TASKS_CONFIGURATION_KEY}.json`;
    exports.WORKSPACE_STANDALONE_CONFIGURATIONS[exports.LAUNCH_CONFIGURATION_KEY] = `${exports.FOLDER_CONFIG_FOLDER_NAME}/${exports.LAUNCH_CONFIGURATION_KEY}.json`;
    exports.USER_STANDALONE_CONFIGURATIONS = Object.create(null);
    exports.USER_STANDALONE_CONFIGURATIONS[exports.TASKS_CONFIGURATION_KEY] = `${exports.TASKS_CONFIGURATION_KEY}.json`;
    exports.IWorkbenchConfigurationService = (0, instantiation_1.refineServiceDecorator)(configuration_1.IConfigurationService);
    exports.TASKS_DEFAULT = '{\n\t\"version\": \"2.0.0\",\n\t\"tasks\": []\n}';
    exports.APPLY_ALL_PROFILES_SETTING = 'workbench.settings.applyToAllProfiles';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uL2NvbW1vbi9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVuRixRQUFBLHlCQUF5QixHQUFHLFNBQVMsQ0FBQztJQUN0QyxRQUFBLG9CQUFvQixHQUFHLFVBQVUsQ0FBQztJQUNsQyxRQUFBLG9CQUFvQixHQUFHLEdBQUcsaUNBQXlCLElBQUksNEJBQW9CLE9BQU8sQ0FBQztJQUVuRixRQUFBLHVCQUF1QixHQUFHLG1DQUFtQyxDQUFDO0lBQzlELFFBQUEsb0JBQW9CLEdBQUcsZ0NBQWdDLENBQUM7SUFDeEQsUUFBQSx1QkFBdUIsR0FBRyxtQ0FBbUMsQ0FBQztJQUM5RCxRQUFBLHVCQUF1QixHQUFHLG1DQUFtQyxDQUFDO0lBQzlELFFBQUEseUJBQXlCLEdBQUcscUNBQXFDLENBQUM7SUFDbEUsUUFBQSxzQkFBc0IsR0FBRyxrQ0FBa0MsQ0FBQztJQUM1RCxRQUFBLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQztJQUMzQyxRQUFBLGFBQWEsR0FBRyx3QkFBd0IsQ0FBQztJQUV6QyxRQUFBLGtCQUFrQixHQUFHLHdDQUFnQyxDQUFDO0lBQ3RELFFBQUEsY0FBYyxHQUFHLDZNQUFxSyxDQUFDO0lBQ3ZMLFFBQUEsNEJBQTRCLEdBQUcseUhBQWlHLENBQUM7SUFDakksUUFBQSxvQkFBb0IsR0FBRyx5Q0FBaUMsR0FBRyxvQ0FBNEIsQ0FBQyxDQUFDO0lBQ3pGLFFBQUEscUJBQXFCLEdBQUcsNk1BQXFLLENBQUM7SUFDOUwsUUFBQSxnQkFBZ0IsR0FBRyx5S0FBeUksQ0FBQztJQUM3SixRQUFBLGFBQWEsR0FBRyxzSUFBOEcsQ0FBQztJQUUvSCxRQUFBLHVCQUF1QixHQUFHLE9BQU8sQ0FBQztJQUNsQyxRQUFBLHdCQUF3QixHQUFHLFFBQVEsQ0FBQztJQUVwQyxRQUFBLG1DQUFtQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkUsMkNBQW1DLENBQUMsK0JBQXVCLENBQUMsR0FBRyxHQUFHLGlDQUF5QixJQUFJLCtCQUF1QixPQUFPLENBQUM7SUFDOUgsMkNBQW1DLENBQUMsZ0NBQXdCLENBQUMsR0FBRyxHQUFHLGlDQUF5QixJQUFJLGdDQUF3QixPQUFPLENBQUM7SUFDbkgsUUFBQSw4QkFBOEIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xFLHNDQUE4QixDQUFDLCtCQUF1QixDQUFDLEdBQUcsR0FBRywrQkFBdUIsT0FBTyxDQUFDO0lBc0IvRSxRQUFBLDhCQUE4QixHQUFHLElBQUEsc0NBQXNCLEVBQXdELHFDQUFxQixDQUFDLENBQUM7SUErQnRJLFFBQUEsYUFBYSxHQUFHLGtEQUFrRCxDQUFDO0lBRW5FLFFBQUEsMEJBQTBCLEdBQUcsdUNBQXVDLENBQUMifQ==