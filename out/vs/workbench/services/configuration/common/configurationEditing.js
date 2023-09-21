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
define(["require", "exports", "vs/nls", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/configuration/common/configuration", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/editor/common/editorService", "vs/platform/notification/common/notification", "vs/workbench/services/preferences/common/preferences", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/editor/common/core/selection", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/errors"], function (require, exports, nls, json, jsonEdit_1, async_1, platform_1, workspace_1, textfiles_1, configuration_1, files_1, resolverService_1, configurationRegistry_1, editorService_1, notification_1, preferences_1, uriIdentity_1, range_1, editOperation_1, selection_1, userDataProfile_1, userDataProfile_2, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationEditing = exports.EditableConfigurationTarget = exports.ConfigurationEditingError = exports.ConfigurationEditingErrorCode = void 0;
    var ConfigurationEditingErrorCode;
    (function (ConfigurationEditingErrorCode) {
        /**
         * Error when trying to write a configuration key that is not registered.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_UNKNOWN_KEY"] = 0] = "ERROR_UNKNOWN_KEY";
        /**
         * Error when trying to write an application setting into workspace settings.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION"] = 1] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION";
        /**
         * Error when trying to write a machne setting into workspace settings.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE"] = 2] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE";
        /**
         * Error when trying to write an invalid folder configuration key to folder settings.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_CONFIGURATION"] = 3] = "ERROR_INVALID_FOLDER_CONFIGURATION";
        /**
         * Error when trying to write to user target but not supported for provided key.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_USER_TARGET"] = 4] = "ERROR_INVALID_USER_TARGET";
        /**
         * Error when trying to write to user target but not supported for provided key.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_TARGET"] = 5] = "ERROR_INVALID_WORKSPACE_TARGET";
        /**
         * Error when trying to write a configuration key to folder target
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_TARGET"] = 6] = "ERROR_INVALID_FOLDER_TARGET";
        /**
         * Error when trying to write to language specific setting but not supported for preovided key
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION"] = 7] = "ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION";
        /**
         * Error when trying to write to the workspace configuration without having a workspace opened.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_NO_WORKSPACE_OPENED"] = 8] = "ERROR_NO_WORKSPACE_OPENED";
        /**
         * Error when trying to write and save to the configuration file while it is dirty in the editor.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_CONFIGURATION_FILE_DIRTY"] = 9] = "ERROR_CONFIGURATION_FILE_DIRTY";
        /**
         * Error when trying to write and save to the configuration file while it is not the latest in the disk.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_CONFIGURATION_FILE_MODIFIED_SINCE"] = 10] = "ERROR_CONFIGURATION_FILE_MODIFIED_SINCE";
        /**
         * Error when trying to write to a configuration file that contains JSON errors.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_CONFIGURATION"] = 11] = "ERROR_INVALID_CONFIGURATION";
        /**
         * Error when trying to write a policy configuration
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_POLICY_CONFIGURATION"] = 12] = "ERROR_POLICY_CONFIGURATION";
        /**
         * Internal Error.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INTERNAL"] = 13] = "ERROR_INTERNAL";
    })(ConfigurationEditingErrorCode || (exports.ConfigurationEditingErrorCode = ConfigurationEditingErrorCode = {}));
    class ConfigurationEditingError extends errors_1.ErrorNoTelemetry {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.ConfigurationEditingError = ConfigurationEditingError;
    var EditableConfigurationTarget;
    (function (EditableConfigurationTarget) {
        EditableConfigurationTarget[EditableConfigurationTarget["USER_LOCAL"] = 1] = "USER_LOCAL";
        EditableConfigurationTarget[EditableConfigurationTarget["USER_REMOTE"] = 2] = "USER_REMOTE";
        EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE"] = 3] = "WORKSPACE";
        EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE_FOLDER"] = 4] = "WORKSPACE_FOLDER";
    })(EditableConfigurationTarget || (exports.EditableConfigurationTarget = EditableConfigurationTarget = {}));
    let ConfigurationEditing = class ConfigurationEditing {
        constructor(remoteSettingsResource, configurationService, contextService, userDataProfileService, userDataProfilesService, fileService, textModelResolverService, textFileService, notificationService, preferencesService, editorService, uriIdentityService) {
            this.remoteSettingsResource = remoteSettingsResource;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.fileService = fileService;
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.notificationService = notificationService;
            this.preferencesService = preferencesService;
            this.editorService = editorService;
            this.uriIdentityService = uriIdentityService;
            this.queue = new async_1.Queue();
        }
        async writeConfiguration(target, value, options = {}) {
            const operation = this.getConfigurationEditOperation(target, value, options.scopes || {});
            // queue up writes to prevent race conditions
            return this.queue.queue(async () => {
                try {
                    await this.doWriteConfiguration(operation, options);
                }
                catch (error) {
                    if (options.donotNotifyError) {
                        throw error;
                    }
                    await this.onError(error, operation, options.scopes);
                }
            });
        }
        async doWriteConfiguration(operation, options) {
            await this.validate(operation.target, operation, !options.handleDirtyFile, options.scopes || {});
            const resource = operation.resource;
            const reference = await this.resolveModelReference(resource);
            try {
                const formattingOptions = this.getFormattingOptions(reference.object.textEditorModel);
                await this.updateConfiguration(operation, reference.object.textEditorModel, formattingOptions, options);
            }
            finally {
                reference.dispose();
            }
        }
        async updateConfiguration(operation, model, formattingOptions, options) {
            if (this.hasParseErrors(model.getValue(), operation)) {
                throw this.toConfigurationEditingError(11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */, operation.target, operation);
            }
            if (this.textFileService.isDirty(model.uri) && options.handleDirtyFile) {
                switch (options.handleDirtyFile) {
                    case 'save':
                        await this.save(model, operation);
                        break;
                    case 'revert':
                        await this.textFileService.revert(model.uri);
                        break;
                }
            }
            const edit = this.getEdits(operation, model.getValue(), formattingOptions)[0];
            if (edit && this.applyEditsToBuffer(edit, model)) {
                await this.save(model, operation);
            }
        }
        async save(model, operation) {
            try {
                await this.textFileService.save(model.uri, { ignoreErrorHandler: true });
            }
            catch (error) {
                if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                    throw this.toConfigurationEditingError(10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */, operation.target, operation);
                }
                throw new ConfigurationEditingError(nls.localize('fsError', "Error while writing to {0}. {1}", this.stringifyTarget(operation.target), error.message), 13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */);
            }
        }
        applyEditsToBuffer(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                const editOperation = currentText ? editOperation_1.EditOperation.replace(range, edit.content) : editOperation_1.EditOperation.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
                return true;
            }
            return false;
        }
        getEdits({ value, jsonPath }, modelContent, formattingOptions) {
            if (jsonPath.length) {
                return (0, jsonEdit_1.setProperty)(modelContent, jsonPath, value, formattingOptions);
            }
            // Without jsonPath, the entire configuration file is being replaced, so we just use JSON.stringify
            const content = JSON.stringify(value, null, formattingOptions.insertSpaces && formattingOptions.tabSize ? ' '.repeat(formattingOptions.tabSize) : '\t');
            return [{
                    content,
                    length: modelContent.length,
                    offset: 0
                }];
        }
        getFormattingOptions(model) {
            const { insertSpaces, tabSize } = model.getOptions();
            const eol = model.getEOL();
            return { insertSpaces, tabSize, eol };
        }
        async onError(error, operation, scopes) {
            switch (error.code) {
                case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */:
                    this.onInvalidConfigurationError(error, operation);
                    break;
                case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */:
                    this.onConfigurationFileDirtyError(error, operation, scopes);
                    break;
                case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                    return this.doWriteConfiguration(operation, { scopes, handleDirtyFile: 'revert' });
                default:
                    this.notificationService.error(error.message);
            }
        }
        onInvalidConfigurationError(error, operation) {
            const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_1.TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
                : operation.workspaceStandAloneConfigurationKey === configuration_1.LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.notificationService.prompt(notification_1.Severity.Error, error.message, [{
                        label: openStandAloneConfigurationActionLabel,
                        run: () => this.openFile(operation.resource)
                    }]);
            }
            else {
                this.notificationService.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize('open', "Open Settings"),
                        run: () => this.openSettings(operation)
                    }]);
            }
        }
        onConfigurationFileDirtyError(error, operation, scopes) {
            const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_1.TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
                : operation.workspaceStandAloneConfigurationKey === configuration_1.LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.notificationService.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize('saveAndRetry', "Save and Retry"),
                        run: () => {
                            const key = operation.key ? `${operation.workspaceStandAloneConfigurationKey}.${operation.key}` : operation.workspaceStandAloneConfigurationKey;
                            this.writeConfiguration(operation.target, { key, value: operation.value }, { handleDirtyFile: 'save', scopes });
                        }
                    },
                    {
                        label: openStandAloneConfigurationActionLabel,
                        run: () => this.openFile(operation.resource)
                    }]);
            }
            else {
                this.notificationService.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize('saveAndRetry', "Save and Retry"),
                        run: () => this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { handleDirtyFile: 'save', scopes })
                    },
                    {
                        label: nls.localize('open', "Open Settings"),
                        run: () => this.openSettings(operation)
                    }]);
            }
        }
        openSettings(operation) {
            const options = { jsonEditor: true };
            switch (operation.target) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    this.preferencesService.openUserSettings(options);
                    break;
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    this.preferencesService.openRemoteSettings(options);
                    break;
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    this.preferencesService.openWorkspaceSettings(options);
                    break;
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                    if (operation.resource) {
                        const workspaceFolder = this.contextService.getWorkspaceFolder(operation.resource);
                        if (workspaceFolder) {
                            this.preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true });
                        }
                    }
                    break;
            }
        }
        openFile(resource) {
            this.editorService.openEditor({ resource, options: { pinned: true } });
        }
        toConfigurationEditingError(code, target, operation) {
            const message = this.toErrorMessage(code, target, operation);
            return new ConfigurationEditingError(message, code);
        }
        toErrorMessage(error, target, operation) {
            switch (error) {
                // API constraints
                case 12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */: return nls.localize('errorPolicyConfiguration', "Unable to write {0} because it is configured in system policy.", operation.key);
                case 0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */: return nls.localize('errorUnknownKey', "Unable to write to {0} because {1} is not a registered configuration.", this.stringifyTarget(target), operation.key);
                case 1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */: return nls.localize('errorInvalidWorkspaceConfigurationApplication', "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
                case 2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */: return nls.localize('errorInvalidWorkspaceConfigurationMachine', "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
                case 3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */: return nls.localize('errorInvalidFolderConfiguration', "Unable to write to Folder Settings because {0} does not support the folder resource scope.", operation.key);
                case 4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */: return nls.localize('errorInvalidUserTarget', "Unable to write to User Settings because {0} does not support for global scope.", operation.key);
                case 5 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET */: return nls.localize('errorInvalidWorkspaceTarget', "Unable to write to Workspace Settings because {0} does not support for workspace scope in a multi folder workspace.", operation.key);
                case 6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */: return nls.localize('errorInvalidFolderTarget', "Unable to write to Folder Settings because no resource is provided.");
                case 7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */: return nls.localize('errorInvalidResourceLanguageConfiguration', "Unable to write to Language Settings because {0} is not a resource language setting.", operation.key);
                case 8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */: return nls.localize('errorNoWorkspaceOpened', "Unable to write to {0} because no workspace is opened. Please open a workspace first and try again.", this.stringifyTarget(target));
                // User issues
                case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.TASKS_CONFIGURATION_KEY) {
                        return nls.localize('errorInvalidTaskConfiguration', "Unable to write into the tasks configuration file. Please open it to correct errors/warnings in it and try again.");
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.LAUNCH_CONFIGURATION_KEY) {
                        return nls.localize('errorInvalidLaunchConfiguration', "Unable to write into the launch configuration file. Please open it to correct errors/warnings in it and try again.");
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize('errorInvalidConfiguration', "Unable to write into user settings. Please open the user settings to correct errors/warnings in it and try again.");
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize('errorInvalidRemoteConfiguration', "Unable to write into remote user settings. Please open the remote user settings to correct errors/warnings in it and try again.");
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize('errorInvalidConfigurationWorkspace', "Unable to write into workspace settings. Please open the workspace settings to correct errors/warnings in the file and try again.");
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                            let workspaceFolderName = '<<unknown>>';
                            if (operation.resource) {
                                const folder = this.contextService.getWorkspaceFolder(operation.resource);
                                if (folder) {
                                    workspaceFolderName = folder.name;
                                }
                            }
                            return nls.localize('errorInvalidConfigurationFolder', "Unable to write into folder settings. Please open the '{0}' folder settings to correct errors/warnings in it and try again.", workspaceFolderName);
                        }
                        default:
                            return '';
                    }
                }
                case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.TASKS_CONFIGURATION_KEY) {
                        return nls.localize('errorTasksConfigurationFileDirty', "Unable to write into tasks configuration file because the file has unsaved changes. Please save it first and then try again.");
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.LAUNCH_CONFIGURATION_KEY) {
                        return nls.localize('errorLaunchConfigurationFileDirty', "Unable to write into launch configuration file because the file has unsaved changes. Please save it first and then try again.");
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize('errorConfigurationFileDirty', "Unable to write into user settings because the file has unsaved changes. Please save the user settings file first and then try again.");
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize('errorRemoteConfigurationFileDirty', "Unable to write into remote user settings because the file has unsaved changes. Please save the remote user settings file first and then try again.");
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize('errorConfigurationFileDirtyWorkspace', "Unable to write into workspace settings because the file has unsaved changes. Please save the workspace settings file first and then try again.");
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                            let workspaceFolderName = '<<unknown>>';
                            if (operation.resource) {
                                const folder = this.contextService.getWorkspaceFolder(operation.resource);
                                if (folder) {
                                    workspaceFolderName = folder.name;
                                }
                            }
                            return nls.localize('errorConfigurationFileDirtyFolder', "Unable to write into folder settings because the file has unsaved changes. Please save the '{0}' folder settings file first and then try again.", workspaceFolderName);
                        }
                        default:
                            return '';
                    }
                }
                case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.TASKS_CONFIGURATION_KEY) {
                        return nls.localize('errorTasksConfigurationFileModifiedSince', "Unable to write into tasks configuration file because the content of the file is newer.");
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.LAUNCH_CONFIGURATION_KEY) {
                        return nls.localize('errorLaunchConfigurationFileModifiedSince', "Unable to write into launch configuration file because the content of the file is newer.");
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize('errorConfigurationFileModifiedSince', "Unable to write into user settings because the content of the file is newer.");
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize('errorRemoteConfigurationFileModifiedSince', "Unable to write into remote user settings because the content of the file is newer.");
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize('errorConfigurationFileModifiedSinceWorkspace', "Unable to write into workspace settings because the content of the file is newer.");
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                            return nls.localize('errorConfigurationFileModifiedSinceFolder', "Unable to write into folder settings because the content of the file is newer.");
                    }
                case 13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */: return nls.localize('errorUnknown', "Unable to write to {0} because of an internal error.", this.stringifyTarget(target));
            }
        }
        stringifyTarget(target) {
            switch (target) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    return nls.localize('userTarget', "User Settings");
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    return nls.localize('remoteUserTarget', "Remote User Settings");
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    return nls.localize('workspaceTarget', "Workspace Settings");
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                    return nls.localize('folderTarget', "Folder Settings");
                default:
                    return '';
            }
        }
        defaultResourceValue(resource) {
            const basename = this.uriIdentityService.extUri.basename(resource);
            const configurationValue = basename.substr(0, basename.length - this.uriIdentityService.extUri.extname(resource).length);
            switch (configurationValue) {
                case configuration_1.TASKS_CONFIGURATION_KEY: return configuration_1.TASKS_DEFAULT;
                default: return '{}';
            }
        }
        async resolveModelReference(resource) {
            const exists = await this.fileService.exists(resource);
            if (!exists) {
                await this.textFileService.write(resource, this.defaultResourceValue(resource), { encoding: 'utf8' });
            }
            return this.textModelResolverService.createModelReference(resource);
        }
        hasParseErrors(content, operation) {
            // If we write to a workspace standalone file and replace the entire contents (no key provided)
            // we can return here because any parse errors can safely be ignored since all contents are replaced
            if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
                return false;
            }
            const parseErrors = [];
            json.parse(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return parseErrors.length > 0;
        }
        async validate(target, operation, checkDirty, overrides) {
            if (this.configurationService.inspect(operation.key).policyValue !== undefined) {
                throw this.toConfigurationEditingError(12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */, target, operation);
            }
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const configurationScope = configurationProperties[operation.key]?.scope;
            /**
             * Key to update must be a known setting from the registry unless
             * 	- the key is standalone configuration (eg: tasks, debug)
             * 	- the key is an override identifier
             * 	- the operation is to delete the key
             */
            if (!operation.workspaceStandAloneConfigurationKey) {
                const validKeys = this.configurationService.keys().default;
                if (validKeys.indexOf(operation.key) < 0 && !configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(operation.key) && operation.value !== undefined) {
                    throw this.toConfigurationEditingError(0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */, target, operation);
                }
            }
            if (operation.workspaceStandAloneConfigurationKey) {
                // Global launches are not supported
                if ((operation.workspaceStandAloneConfigurationKey !== configuration_1.TASKS_CONFIGURATION_KEY) && (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */)) {
                    throw this.toConfigurationEditingError(4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */, target, operation);
                }
            }
            // Target cannot be workspace or folder if no workspace opened
            if ((target === 3 /* EditableConfigurationTarget.WORKSPACE */ || target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) && this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                throw this.toConfigurationEditingError(8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */, target, operation);
            }
            if (target === 3 /* EditableConfigurationTarget.WORKSPACE */) {
                if (!operation.workspaceStandAloneConfigurationKey && !configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
                    if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                        throw this.toConfigurationEditingError(1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */, target, operation);
                    }
                    if (configurationScope === 2 /* ConfigurationScope.MACHINE */) {
                        throw this.toConfigurationEditingError(2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */, target, operation);
                    }
                }
            }
            if (target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) {
                if (!operation.resource) {
                    throw this.toConfigurationEditingError(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
                }
                if (!operation.workspaceStandAloneConfigurationKey && !configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
                    if (configurationScope !== undefined && !configuration_1.FOLDER_SCOPES.includes(configurationScope)) {
                        throw this.toConfigurationEditingError(3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */, target, operation);
                    }
                }
            }
            if (overrides.overrideIdentifiers?.length) {
                if (configurationScope !== 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                    throw this.toConfigurationEditingError(7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */, target, operation);
                }
            }
            if (!operation.resource) {
                throw this.toConfigurationEditingError(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
            }
            if (checkDirty && this.textFileService.isDirty(operation.resource)) {
                throw this.toConfigurationEditingError(9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */, target, operation);
            }
        }
        getConfigurationEditOperation(target, config, overrides) {
            // Check for standalone workspace configurations
            if (config.key) {
                const standaloneConfigurationMap = target === 1 /* EditableConfigurationTarget.USER_LOCAL */ ? configuration_1.USER_STANDALONE_CONFIGURATIONS : configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS;
                const standaloneConfigurationKeys = Object.keys(standaloneConfigurationMap);
                for (const key of standaloneConfigurationKeys) {
                    const resource = this.getConfigurationFileResource(target, key, standaloneConfigurationMap[key], overrides.resource, undefined);
                    // Check for prefix
                    if (config.key === key) {
                        const jsonPath = this.isWorkspaceConfigurationResource(resource) ? [key] : [];
                        return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: resource ?? undefined, workspaceStandAloneConfigurationKey: key, target };
                    }
                    // Check for prefix.<setting>
                    const keyPrefix = `${key}.`;
                    if (config.key.indexOf(keyPrefix) === 0) {
                        const jsonPath = this.isWorkspaceConfigurationResource(resource) ? [key, config.key.substr(keyPrefix.length)] : [config.key.substr(keyPrefix.length)];
                        return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: resource ?? undefined, workspaceStandAloneConfigurationKey: key, target };
                    }
                }
            }
            const key = config.key;
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const configurationScope = configurationProperties[key]?.scope;
            let jsonPath = overrides.overrideIdentifiers?.length ? [(0, configurationRegistry_1.keyFromOverrideIdentifiers)(overrides.overrideIdentifiers), key] : [key];
            if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
                return { key, jsonPath, value: config.value, resource: this.getConfigurationFileResource(target, key, '', null, configurationScope) ?? undefined, target };
            }
            const resource = this.getConfigurationFileResource(target, key, configuration_1.FOLDER_SETTINGS_PATH, overrides.resource, configurationScope);
            if (this.isWorkspaceConfigurationResource(resource)) {
                jsonPath = ['settings', ...jsonPath];
            }
            return { key, jsonPath, value: config.value, resource: resource ?? undefined, target };
        }
        isWorkspaceConfigurationResource(resource) {
            const workspace = this.contextService.getWorkspace();
            return !!(workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath);
        }
        getConfigurationFileResource(target, key, relativePath, resource, scope) {
            if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */) {
                if (key === configuration_1.TASKS_CONFIGURATION_KEY) {
                    return this.userDataProfileService.currentProfile.tasksResource;
                }
                else {
                    if (!this.userDataProfileService.currentProfile.isDefault && this.configurationService.isSettingAppliedForAllProfiles(key)) {
                        return this.userDataProfilesService.defaultProfile.settingsResource;
                    }
                    return this.userDataProfileService.currentProfile.settingsResource;
                }
            }
            if (target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
                return this.remoteSettingsResource;
            }
            const workbenchState = this.contextService.getWorkbenchState();
            if (workbenchState !== 1 /* WorkbenchState.EMPTY */) {
                const workspace = this.contextService.getWorkspace();
                if (target === 3 /* EditableConfigurationTarget.WORKSPACE */) {
                    if (workbenchState === 3 /* WorkbenchState.WORKSPACE */) {
                        return workspace.configuration ?? null;
                    }
                    if (workbenchState === 2 /* WorkbenchState.FOLDER */) {
                        return workspace.folders[0].toResource(relativePath);
                    }
                }
                if (target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) {
                    if (resource) {
                        const folder = this.contextService.getWorkspaceFolder(resource);
                        if (folder) {
                            return folder.toResource(relativePath);
                        }
                    }
                }
            }
            return null;
        }
    };
    exports.ConfigurationEditing = ConfigurationEditing;
    exports.ConfigurationEditing = ConfigurationEditing = __decorate([
        __param(1, configuration_1.IWorkbenchConfigurationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, userDataProfile_1.IUserDataProfileService),
        __param(4, userDataProfile_2.IUserDataProfilesService),
        __param(5, files_1.IFileService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, textfiles_1.ITextFileService),
        __param(8, notification_1.INotificationService),
        __param(9, preferences_1.IPreferencesService),
        __param(10, editorService_1.IEditorService),
        __param(11, uriIdentity_1.IUriIdentityService)
    ], ConfigurationEditing);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkVkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvY29uZmlndXJhdGlvbi9jb21tb24vY29uZmlndXJhdGlvbkVkaXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJoRyxJQUFrQiw2QkF1RWpCO0lBdkVELFdBQWtCLDZCQUE2QjtRQUU5Qzs7V0FFRztRQUNILDJHQUFpQixDQUFBO1FBRWpCOztXQUVHO1FBQ0gsMktBQWlELENBQUE7UUFFakQ7O1dBRUc7UUFDSCxtS0FBNkMsQ0FBQTtRQUU3Qzs7V0FFRztRQUNILDZJQUFrQyxDQUFBO1FBRWxDOztXQUVHO1FBQ0gsMkhBQXlCLENBQUE7UUFFekI7O1dBRUc7UUFDSCxxSUFBOEIsQ0FBQTtRQUU5Qjs7V0FFRztRQUNILCtIQUEyQixDQUFBO1FBRTNCOztXQUVHO1FBQ0gsbUtBQTZDLENBQUE7UUFFN0M7O1dBRUc7UUFDSCwySEFBeUIsQ0FBQTtRQUV6Qjs7V0FFRztRQUNILHFJQUE4QixDQUFBO1FBRTlCOztXQUVHO1FBQ0gsd0pBQXVDLENBQUE7UUFFdkM7O1dBRUc7UUFDSCxnSUFBMkIsQ0FBQTtRQUUzQjs7V0FFRztRQUNILDhIQUEwQixDQUFBO1FBRTFCOztXQUVHO1FBQ0gsc0dBQWMsQ0FBQTtJQUNmLENBQUMsRUF2RWlCLDZCQUE2Qiw2Q0FBN0IsNkJBQTZCLFFBdUU5QztJQUVELE1BQWEseUJBQTBCLFNBQVEseUJBQWdCO1FBQzlELFlBQVksT0FBZSxFQUFTLElBQW1DO1lBQ3RFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUErQjtRQUV2RSxDQUFDO0tBQ0Q7SUFKRCw4REFJQztJQWNELElBQWtCLDJCQUtqQjtJQUxELFdBQWtCLDJCQUEyQjtRQUM1Qyx5RkFB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