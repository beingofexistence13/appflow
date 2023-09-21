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
define(["require", "exports", "vs/nls!vs/workbench/services/configuration/common/configurationEditing", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/configuration/common/configuration", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/editor/common/editorService", "vs/platform/notification/common/notification", "vs/workbench/services/preferences/common/preferences", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/core/range", "vs/editor/common/core/editOperation", "vs/editor/common/core/selection", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/errors"], function (require, exports, nls, json, jsonEdit_1, async_1, platform_1, workspace_1, textfiles_1, configuration_1, files_1, resolverService_1, configurationRegistry_1, editorService_1, notification_1, preferences_1, uriIdentity_1, range_1, editOperation_1, selection_1, userDataProfile_1, userDataProfile_2, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o2b = exports.EditableConfigurationTarget = exports.$n2b = exports.ConfigurationEditingErrorCode = void 0;
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
    class $n2b extends errors_1.$_ {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.$n2b = $n2b;
    var EditableConfigurationTarget;
    (function (EditableConfigurationTarget) {
        EditableConfigurationTarget[EditableConfigurationTarget["USER_LOCAL"] = 1] = "USER_LOCAL";
        EditableConfigurationTarget[EditableConfigurationTarget["USER_REMOTE"] = 2] = "USER_REMOTE";
        EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE"] = 3] = "WORKSPACE";
        EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE_FOLDER"] = 4] = "WORKSPACE_FOLDER";
    })(EditableConfigurationTarget || (exports.EditableConfigurationTarget = EditableConfigurationTarget = {}));
    let $o2b = class $o2b {
        constructor(b, c, d, e, f, g, h, i, j, k, l, m) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.a = new async_1.$Ng();
        }
        async writeConfiguration(target, value, options = {}) {
            const operation = this.F(target, value, options.scopes || {});
            // queue up writes to prevent race conditions
            return this.a.queue(async () => {
                try {
                    await this.n(operation, options);
                }
                catch (error) {
                    if (options.donotNotifyError) {
                        throw error;
                    }
                    await this.t(error, operation, options.scopes);
                }
            });
        }
        async n(operation, options) {
            await this.E(operation.target, operation, !options.handleDirtyFile, options.scopes || {});
            const resource = operation.resource;
            const reference = await this.C(resource);
            try {
                const formattingOptions = this.s(reference.object.textEditorModel);
                await this.o(operation, reference.object.textEditorModel, formattingOptions, options);
            }
            finally {
                reference.dispose();
            }
        }
        async o(operation, model, formattingOptions, options) {
            if (this.D(model.getValue(), operation)) {
                throw this.y(11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */, operation.target, operation);
            }
            if (this.i.isDirty(model.uri) && options.handleDirtyFile) {
                switch (options.handleDirtyFile) {
                    case 'save':
                        await this.p(model, operation);
                        break;
                    case 'revert':
                        await this.i.revert(model.uri);
                        break;
                }
            }
            const edit = this.r(operation, model.getValue(), formattingOptions)[0];
            if (edit && this.q(edit, model)) {
                await this.p(model, operation);
            }
        }
        async p(model, operation) {
            try {
                await this.i.save(model.uri, { ignoreErrorHandler: true });
            }
            catch (error) {
                if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                    throw this.y(10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */, operation.target, operation);
                }
                throw new $n2b(nls.localize(0, null, this.A(operation.target), error.message), 13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */);
            }
        }
        q(edit, model) {
            const startPosition = model.getPositionAt(edit.offset);
            const endPosition = model.getPositionAt(edit.offset + edit.length);
            const range = new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            const currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                const editOperation = currentText ? editOperation_1.$ls.replace(range, edit.content) : editOperation_1.$ls.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.$ms(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
                return true;
            }
            return false;
        }
        r({ value, jsonPath }, modelContent, formattingOptions) {
            if (jsonPath.length) {
                return (0, jsonEdit_1.$CS)(modelContent, jsonPath, value, formattingOptions);
            }
            // Without jsonPath, the entire configuration file is being replaced, so we just use JSON.stringify
            const content = JSON.stringify(value, null, formattingOptions.insertSpaces && formattingOptions.tabSize ? ' '.repeat(formattingOptions.tabSize) : '\t');
            return [{
                    content,
                    length: modelContent.length,
                    offset: 0
                }];
        }
        s(model) {
            const { insertSpaces, tabSize } = model.getOptions();
            const eol = model.getEOL();
            return { insertSpaces, tabSize, eol };
        }
        async t(error, operation, scopes) {
            switch (error.code) {
                case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */:
                    this.u(error, operation);
                    break;
                case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */:
                    this.v(error, operation, scopes);
                    break;
                case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                    return this.n(operation, { scopes, handleDirtyFile: 'revert' });
                default:
                    this.j.error(error.message);
            }
        }
        u(error, operation) {
            const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_1.$iE ? nls.localize(1, null)
                : operation.workspaceStandAloneConfigurationKey === configuration_1.$jE ? nls.localize(2, null)
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.j.prompt(notification_1.Severity.Error, error.message, [{
                        label: openStandAloneConfigurationActionLabel,
                        run: () => this.x(operation.resource)
                    }]);
            }
            else {
                this.j.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize(3, null),
                        run: () => this.w(operation)
                    }]);
            }
        }
        v(error, operation, scopes) {
            const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_1.$iE ? nls.localize(4, null)
                : operation.workspaceStandAloneConfigurationKey === configuration_1.$jE ? nls.localize(5, null)
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.j.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize(6, null),
                        run: () => {
                            const key = operation.key ? `${operation.workspaceStandAloneConfigurationKey}.${operation.key}` : operation.workspaceStandAloneConfigurationKey;
                            this.writeConfiguration(operation.target, { key, value: operation.value }, { handleDirtyFile: 'save', scopes });
                        }
                    },
                    {
                        label: openStandAloneConfigurationActionLabel,
                        run: () => this.x(operation.resource)
                    }]);
            }
            else {
                this.j.prompt(notification_1.Severity.Error, error.message, [{
                        label: nls.localize(7, null),
                        run: () => this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { handleDirtyFile: 'save', scopes })
                    },
                    {
                        label: nls.localize(8, null),
                        run: () => this.w(operation)
                    }]);
            }
        }
        w(operation) {
            const options = { jsonEditor: true };
            switch (operation.target) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    this.k.openUserSettings(options);
                    break;
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    this.k.openRemoteSettings(options);
                    break;
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    this.k.openWorkspaceSettings(options);
                    break;
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                    if (operation.resource) {
                        const workspaceFolder = this.d.getWorkspaceFolder(operation.resource);
                        if (workspaceFolder) {
                            this.k.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true });
                        }
                    }
                    break;
            }
        }
        x(resource) {
            this.l.openEditor({ resource, options: { pinned: true } });
        }
        y(code, target, operation) {
            const message = this.z(code, target, operation);
            return new $n2b(message, code);
        }
        z(error, target, operation) {
            switch (error) {
                // API constraints
                case 12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */: return nls.localize(9, null, operation.key);
                case 0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */: return nls.localize(10, null, this.A(target), operation.key);
                case 1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */: return nls.localize(11, null, operation.key);
                case 2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */: return nls.localize(12, null, operation.key);
                case 3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */: return nls.localize(13, null, operation.key);
                case 4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */: return nls.localize(14, null, operation.key);
                case 5 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET */: return nls.localize(15, null, operation.key);
                case 6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */: return nls.localize(16, null);
                case 7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */: return nls.localize(17, null, operation.key);
                case 8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */: return nls.localize(18, null, this.A(target));
                // User issues
                case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$iE) {
                        return nls.localize(19, null);
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$jE) {
                        return nls.localize(20, null);
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize(21, null);
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize(22, null);
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize(23, null);
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                            let workspaceFolderName = '<<unknown>>';
                            if (operation.resource) {
                                const folder = this.d.getWorkspaceFolder(operation.resource);
                                if (folder) {
                                    workspaceFolderName = folder.name;
                                }
                            }
                            return nls.localize(24, null, workspaceFolderName);
                        }
                        default:
                            return '';
                    }
                }
                case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$iE) {
                        return nls.localize(25, null);
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$jE) {
                        return nls.localize(26, null);
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize(27, null);
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize(28, null);
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize(29, null);
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                            let workspaceFolderName = '<<unknown>>';
                            if (operation.resource) {
                                const folder = this.d.getWorkspaceFolder(operation.resource);
                                if (folder) {
                                    workspaceFolderName = folder.name;
                                }
                            }
                            return nls.localize(30, null, workspaceFolderName);
                        }
                        default:
                            return '';
                    }
                }
                case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$iE) {
                        return nls.localize(31, null);
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_1.$jE) {
                        return nls.localize(32, null);
                    }
                    switch (target) {
                        case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                            return nls.localize(33, null);
                        case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                            return nls.localize(34, null);
                        case 3 /* EditableConfigurationTarget.WORKSPACE */:
                            return nls.localize(35, null);
                        case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                            return nls.localize(36, null);
                    }
                case 13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */: return nls.localize(37, null, this.A(target));
            }
        }
        A(target) {
            switch (target) {
                case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                    return nls.localize(38, null);
                case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                    return nls.localize(39, null);
                case 3 /* EditableConfigurationTarget.WORKSPACE */:
                    return nls.localize(40, null);
                case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                    return nls.localize(41, null);
                default:
                    return '';
            }
        }
        B(resource) {
            const basename = this.m.extUri.basename(resource);
            const configurationValue = basename.substr(0, basename.length - this.m.extUri.extname(resource).length);
            switch (configurationValue) {
                case configuration_1.$iE: return configuration_1.$nE;
                default: return '{}';
            }
        }
        async C(resource) {
            const exists = await this.g.exists(resource);
            if (!exists) {
                await this.i.write(resource, this.B(resource), { encoding: 'utf8' });
            }
            return this.h.createModelReference(resource);
        }
        D(content, operation) {
            // If we write to a workspace standalone file and replace the entire contents (no key provided)
            // we can return here because any parse errors can safely be ignored since all contents are replaced
            if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
                return false;
            }
            const parseErrors = [];
            json.$Lm(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
            return parseErrors.length > 0;
        }
        async E(target, operation, checkDirty, overrides) {
            if (this.c.inspect(operation.key).policyValue !== undefined) {
                throw this.y(12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */, target, operation);
            }
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const configurationScope = configurationProperties[operation.key]?.scope;
            /**
             * Key to update must be a known setting from the registry unless
             * 	- the key is standalone configuration (eg: tasks, debug)
             * 	- the key is an override identifier
             * 	- the operation is to delete the key
             */
            if (!operation.workspaceStandAloneConfigurationKey) {
                const validKeys = this.c.keys().default;
                if (validKeys.indexOf(operation.key) < 0 && !configurationRegistry_1.$kn.test(operation.key) && operation.value !== undefined) {
                    throw this.y(0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */, target, operation);
                }
            }
            if (operation.workspaceStandAloneConfigurationKey) {
                // Global launches are not supported
                if ((operation.workspaceStandAloneConfigurationKey !== configuration_1.$iE) && (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */)) {
                    throw this.y(4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */, target, operation);
                }
            }
            // Target cannot be workspace or folder if no workspace opened
            if ((target === 3 /* EditableConfigurationTarget.WORKSPACE */ || target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) && this.d.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                throw this.y(8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */, target, operation);
            }
            if (target === 3 /* EditableConfigurationTarget.WORKSPACE */) {
                if (!operation.workspaceStandAloneConfigurationKey && !configurationRegistry_1.$kn.test(operation.key)) {
                    if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                        throw this.y(1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */, target, operation);
                    }
                    if (configurationScope === 2 /* ConfigurationScope.MACHINE */) {
                        throw this.y(2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */, target, operation);
                    }
                }
            }
            if (target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) {
                if (!operation.resource) {
                    throw this.y(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
                }
                if (!operation.workspaceStandAloneConfigurationKey && !configurationRegistry_1.$kn.test(operation.key)) {
                    if (configurationScope !== undefined && !configuration_1.$hE.includes(configurationScope)) {
                        throw this.y(3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */, target, operation);
                    }
                }
            }
            if (overrides.overrideIdentifiers?.length) {
                if (configurationScope !== 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                    throw this.y(7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */, target, operation);
                }
            }
            if (!operation.resource) {
                throw this.y(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
            }
            if (checkDirty && this.i.isDirty(operation.resource)) {
                throw this.y(9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */, target, operation);
            }
        }
        F(target, config, overrides) {
            // Check for standalone workspace configurations
            if (config.key) {
                const standaloneConfigurationMap = target === 1 /* EditableConfigurationTarget.USER_LOCAL */ ? configuration_1.$lE : configuration_1.$kE;
                const standaloneConfigurationKeys = Object.keys(standaloneConfigurationMap);
                for (const key of standaloneConfigurationKeys) {
                    const resource = this.H(target, key, standaloneConfigurationMap[key], overrides.resource, undefined);
                    // Check for prefix
                    if (config.key === key) {
                        const jsonPath = this.G(resource) ? [key] : [];
                        return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: resource ?? undefined, workspaceStandAloneConfigurationKey: key, target };
                    }
                    // Check for prefix.<setting>
                    const keyPrefix = `${key}.`;
                    if (config.key.indexOf(keyPrefix) === 0) {
                        const jsonPath = this.G(resource) ? [key, config.key.substr(keyPrefix.length)] : [config.key.substr(keyPrefix.length)];
                        return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: resource ?? undefined, workspaceStandAloneConfigurationKey: key, target };
                    }
                }
            }
            const key = config.key;
            const configurationProperties = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
            const configurationScope = configurationProperties[key]?.scope;
            let jsonPath = overrides.overrideIdentifiers?.length ? [(0, configurationRegistry_1.$mn)(overrides.overrideIdentifiers), key] : [key];
            if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
                return { key, jsonPath, value: config.value, resource: this.H(target, key, '', null, configurationScope) ?? undefined, target };
            }
            const resource = this.H(target, key, configuration_1.$5D, overrides.resource, configurationScope);
            if (this.G(resource)) {
                jsonPath = ['settings', ...jsonPath];
            }
            return { key, jsonPath, value: config.value, resource: resource ?? undefined, target };
        }
        G(resource) {
            const workspace = this.d.getWorkspace();
            return !!(workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath);
        }
        H(target, key, relativePath, resource, scope) {
            if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */) {
                if (key === configuration_1.$iE) {
                    return this.e.currentProfile.tasksResource;
                }
                else {
                    if (!this.e.currentProfile.isDefault && this.c.isSettingAppliedForAllProfiles(key)) {
                        return this.f.defaultProfile.settingsResource;
                    }
                    return this.e.currentProfile.settingsResource;
                }
            }
            if (target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
                return this.b;
            }
            const workbenchState = this.d.getWorkbenchState();
            if (workbenchState !== 1 /* WorkbenchState.EMPTY */) {
                const workspace = this.d.getWorkspace();
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
                        const folder = this.d.getWorkspaceFolder(resource);
                        if (folder) {
                            return folder.toResource(relativePath);
                        }
                    }
                }
            }
            return null;
        }
    };
    exports.$o2b = $o2b;
    exports.$o2b = $o2b = __decorate([
        __param(1, configuration_1.$mE),
        __param(2, workspace_1.$Kh),
        __param(3, userDataProfile_1.$CJ),
        __param(4, userDataProfile_2.$Ek),
        __param(5, files_1.$6j),
        __param(6, resolverService_1.$uA),
        __param(7, textfiles_1.$JD),
        __param(8, notification_1.$Yu),
        __param(9, preferences_1.$BE),
        __param(10, editorService_1.$9C),
        __param(11, uriIdentity_1.$Ck)
    ], $o2b);
});
//# sourceMappingURL=configurationEditing.js.map