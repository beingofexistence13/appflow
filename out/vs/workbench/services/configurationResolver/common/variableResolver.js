/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/process", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/labels", "vs/nls", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/base/common/strings"], function (require, exports, paths, process, types, objects, platform_1, labels_1, nls_1, configurationResolver_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractVariableResolverService = void 0;
    class AbstractVariableResolverService {
        static { this.VARIABLE_LHS = '${'; }
        static { this.VARIABLE_REGEXP = /\$\{(.*?)\}/g; }
        constructor(_context, _labelService, _userHomePromise, _envVariablesPromise) {
            this._contributedVariables = new Map();
            this._context = _context;
            this._labelService = _labelService;
            this._userHomePromise = _userHomePromise;
            if (_envVariablesPromise) {
                this._envVariablesPromise = _envVariablesPromise.then(envVariables => {
                    return this.prepareEnv(envVariables);
                });
            }
        }
        prepareEnv(envVariables) {
            // windows env variables are case insensitive
            if (platform_1.isWindows) {
                const ev = Object.create(null);
                Object.keys(envVariables).forEach(key => {
                    ev[key.toLowerCase()] = envVariables[key];
                });
                return ev;
            }
            return envVariables;
        }
        resolveWithEnvironment(environment, root, value) {
            return this.recursiveResolve({ env: this.prepareEnv(environment), userHome: undefined }, root ? root.uri : undefined, value);
        }
        async resolveAsync(root, value) {
            const environment = {
                env: await this._envVariablesPromise,
                userHome: await this._userHomePromise
            };
            return this.recursiveResolve(environment, root ? root.uri : undefined, value);
        }
        async resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables) {
            const result = objects.deepClone(config);
            // hoist platform specific attributes to top level
            if (platform_1.isWindows && result.windows) {
                Object.keys(result.windows).forEach(key => result[key] = result.windows[key]);
            }
            else if (platform_1.isMacintosh && result.osx) {
                Object.keys(result.osx).forEach(key => result[key] = result.osx[key]);
            }
            else if (platform_1.isLinux && result.linux) {
                Object.keys(result.linux).forEach(key => result[key] = result.linux[key]);
            }
            // delete all platform specific sections
            delete result.windows;
            delete result.osx;
            delete result.linux;
            // substitute all variables recursively in string values
            const environmentPromises = {
                env: await this._envVariablesPromise,
                userHome: await this._userHomePromise
            };
            return this.recursiveResolve(environmentPromises, workspaceFolder ? workspaceFolder.uri : undefined, result, commandValueMapping, resolvedVariables);
        }
        async resolveAnyAsync(workspaceFolder, config, commandValueMapping) {
            return this.resolveAnyBase(workspaceFolder, config, commandValueMapping);
        }
        async resolveAnyMap(workspaceFolder, config, commandValueMapping) {
            const resolvedVariables = new Map();
            const newConfig = await this.resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables);
            return { newConfig, resolvedVariables };
        }
        resolveWithInteractionReplace(folder, config, section, variables) {
            throw new Error('resolveWithInteractionReplace not implemented.');
        }
        resolveWithInteraction(folder, config, section, variables) {
            throw new Error('resolveWithInteraction not implemented.');
        }
        contributeVariable(variable, resolution) {
            if (this._contributedVariables.has(variable)) {
                throw new Error('Variable ' + variable + ' is contributed twice.');
            }
            else {
                this._contributedVariables.set(variable, resolution);
            }
        }
        async recursiveResolve(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            if (types.isString(value)) {
                return this.resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables);
            }
            else if (Array.isArray(value)) {
                return Promise.all(value.map(s => this.recursiveResolve(environment, folderUri, s, commandValueMapping, resolvedVariables)));
            }
            else if (types.isObject(value)) {
                const result = Object.create(null);
                const replaced = await Promise.all(Object.keys(value).map(async (key) => {
                    const replaced = await this.resolveString(environment, folderUri, key, commandValueMapping, resolvedVariables);
                    return [replaced, await this.recursiveResolve(environment, folderUri, value[key], commandValueMapping, resolvedVariables)];
                }));
                // two step process to preserve object key order
                for (const [key, value] of replaced) {
                    result[key] = value;
                }
                return result;
            }
            return value;
        }
        resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            // loop through all variables occurrences in 'value'
            return (0, strings_1.replaceAsync)(value, AbstractVariableResolverService.VARIABLE_REGEXP, async (match, variable) => {
                // disallow attempted nesting, see #77289. This doesn't exclude variables that resolve to other variables.
                if (variable.includes(AbstractVariableResolverService.VARIABLE_LHS)) {
                    return match;
                }
                let resolvedValue = await this.evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping);
                resolvedVariables?.set(variable, resolvedValue);
                if ((resolvedValue !== match) && types.isString(resolvedValue) && resolvedValue.match(AbstractVariableResolverService.VARIABLE_REGEXP)) {
                    resolvedValue = await this.resolveString(environment, folderUri, resolvedValue, commandValueMapping, resolvedVariables);
                }
                return resolvedValue;
            });
        }
        fsPath(displayUri) {
            return this._labelService ? this._labelService.getUriLabel(displayUri, { noPrefix: true }) : displayUri.fsPath;
        }
        async evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping) {
            // try to separate variable arguments from variable name
            let argument;
            const parts = variable.split(':');
            if (parts.length > 1) {
                variable = parts[0];
                argument = parts[1];
            }
            // common error handling for all variables that require an open editor
            const getFilePath = (variableKind) => {
                const filePath = this._context.getFilePath();
                if (filePath) {
                    return (0, labels_1.normalizeDriveLetter)(filePath);
                }
                throw new configurationResolver_1.VariableError(variableKind, ((0, nls_1.localize)('canNotResolveFile', "Variable {0} can not be resolved. Please open an editor.", match)));
            };
            // common error handling for all variables that require an open editor
            const getFolderPathForFile = (variableKind) => {
                const filePath = getFilePath(variableKind); // throws error if no editor open
                if (this._context.getWorkspaceFolderPathForFile) {
                    const folderPath = this._context.getWorkspaceFolderPathForFile();
                    if (folderPath) {
                        return (0, labels_1.normalizeDriveLetter)(folderPath);
                    }
                }
                throw new configurationResolver_1.VariableError(variableKind, (0, nls_1.localize)('canNotResolveFolderForFile', "Variable {0}: can not find workspace folder of '{1}'.", match, paths.basename(filePath)));
            };
            // common error handling for all variables that require an open folder and accept a folder name argument
            const getFolderUri = (variableKind) => {
                if (argument) {
                    const folder = this._context.getFolderUri(argument);
                    if (folder) {
                        return folder;
                    }
                    throw new configurationResolver_1.VariableError(variableKind, (0, nls_1.localize)('canNotFindFolder', "Variable {0} can not be resolved. No such folder '{1}'.", match, argument));
                }
                if (folderUri) {
                    return folderUri;
                }
                if (this._context.getWorkspaceFolderCount() > 1) {
                    throw new configurationResolver_1.VariableError(variableKind, (0, nls_1.localize)('canNotResolveWorkspaceFolderMultiRoot', "Variable {0} can not be resolved in a multi folder workspace. Scope this variable using ':' and a workspace folder name.", match));
                }
                throw new configurationResolver_1.VariableError(variableKind, (0, nls_1.localize)('canNotResolveWorkspaceFolder', "Variable {0} can not be resolved. Please open a folder.", match));
            };
            switch (variable) {
                case 'env':
                    if (argument) {
                        if (environment.env) {
                            // Depending on the source of the environment, on Windows, the values may all be lowercase.
                            const env = environment.env[platform_1.isWindows ? argument.toLowerCase() : argument];
                            if (types.isString(env)) {
                                return env;
                            }
                        }
                        // For `env` we should do the same as a normal shell does - evaluates undefined envs to an empty string #46436
                        return '';
                    }
                    throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.Env, (0, nls_1.localize)('missingEnvVarName', "Variable {0} can not be resolved because no environment variable name is given.", match));
                case 'config':
                    if (argument) {
                        const config = this._context.getConfigurationValue(folderUri, argument);
                        if (types.isUndefinedOrNull(config)) {
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)('configNotFound', "Variable {0} can not be resolved because setting '{1}' not found.", match, argument));
                        }
                        if (types.isObject(config)) {
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)('configNoString', "Variable {0} can not be resolved because '{1}' is a structured value.", match, argument));
                        }
                        return config;
                    }
                    throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)('missingConfigName', "Variable {0} can not be resolved because no settings name is given.", match));
                case 'command':
                    return this.resolveFromMap(configurationResolver_1.VariableKind.Command, match, argument, commandValueMapping, 'command');
                case 'input':
                    return this.resolveFromMap(configurationResolver_1.VariableKind.Input, match, argument, commandValueMapping, 'input');
                case 'extensionInstallFolder':
                    if (argument) {
                        const ext = await this._context.getExtension(argument);
                        if (!ext) {
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.ExtensionInstallFolder, (0, nls_1.localize)('extensionNotInstalled', "Variable {0} can not be resolved because the extension {1} is not installed.", match, argument));
                        }
                        return this.fsPath(ext.extensionLocation);
                    }
                    throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.ExtensionInstallFolder, (0, nls_1.localize)('missingExtensionName', "Variable {0} can not be resolved because no extension name is given.", match));
                default: {
                    switch (variable) {
                        case 'workspaceRoot':
                        case 'workspaceFolder':
                            return (0, labels_1.normalizeDriveLetter)(this.fsPath(getFolderUri(configurationResolver_1.VariableKind.WorkspaceFolder)));
                        case 'cwd':
                            return ((folderUri || argument) ? (0, labels_1.normalizeDriveLetter)(this.fsPath(getFolderUri(configurationResolver_1.VariableKind.Cwd))) : process.cwd());
                        case 'workspaceRootFolderName':
                        case 'workspaceFolderBasename':
                            return (0, labels_1.normalizeDriveLetter)(paths.basename(this.fsPath(getFolderUri(configurationResolver_1.VariableKind.WorkspaceFolderBasename))));
                        case 'userHome': {
                            if (environment.userHome) {
                                return environment.userHome;
                            }
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.UserHome, (0, nls_1.localize)('canNotResolveUserHome', "Variable {0} can not be resolved. UserHome path is not defined", match));
                        }
                        case 'lineNumber': {
                            const lineNumber = this._context.getLineNumber();
                            if (lineNumber) {
                                return lineNumber;
                            }
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.LineNumber, (0, nls_1.localize)('canNotResolveLineNumber', "Variable {0} can not be resolved. Make sure to have a line selected in the active editor.", match));
                        }
                        case 'selectedText': {
                            const selectedText = this._context.getSelectedText();
                            if (selectedText) {
                                return selectedText;
                            }
                            throw new configurationResolver_1.VariableError(configurationResolver_1.VariableKind.SelectedText, (0, nls_1.localize)('canNotResolveSelectedText', "Variable {0} can not be resolved. Make sure to have some text selected in the active editor.", match));
                        }
                        case 'file':
                            return getFilePath(configurationResolver_1.VariableKind.File);
                        case 'fileWorkspaceFolder':
                            return getFolderPathForFile(configurationResolver_1.VariableKind.FileWorkspaceFolder);
                        case 'relativeFile':
                            if (folderUri || argument) {
                                return paths.relative(this.fsPath(getFolderUri(configurationResolver_1.VariableKind.RelativeFile)), getFilePath(configurationResolver_1.VariableKind.RelativeFile));
                            }
                            return getFilePath(configurationResolver_1.VariableKind.RelativeFile);
                        case 'relativeFileDirname': {
                            const dirname = paths.dirname(getFilePath(configurationResolver_1.VariableKind.RelativeFileDirname));
                            if (folderUri || argument) {
                                const relative = paths.relative(this.fsPath(getFolderUri(configurationResolver_1.VariableKind.RelativeFileDirname)), dirname);
                                return relative.length === 0 ? '.' : relative;
                            }
                            return dirname;
                        }
                        case 'fileDirname':
                            return paths.dirname(getFilePath(configurationResolver_1.VariableKind.FileDirname));
                        case 'fileExtname':
                            return paths.extname(getFilePath(configurationResolver_1.VariableKind.FileExtname));
                        case 'fileBasename':
                            return paths.basename(getFilePath(configurationResolver_1.VariableKind.FileBasename));
                        case 'fileBasenameNoExtension': {
                            const basename = paths.basename(getFilePath(configurationResolver_1.VariableKind.FileBasenameNoExtension));
                            return (basename.slice(0, basename.length - paths.extname(basename).length));
                        }
                        case 'fileDirnameBasename':
                            return paths.basename(paths.dirname(getFilePath(configurationResolver_1.VariableKind.FileDirnameBasename)));
                        case 'execPath': {
                            const ep = this._context.getExecPath();
                            if (ep) {
                                return ep;
                            }
                            return match;
                        }
                        case 'execInstallFolder': {
                            const ar = this._context.getAppRoot();
                            if (ar) {
                                return ar;
                            }
                            return match;
                        }
                        case 'pathSeparator':
                            return paths.sep;
                        default:
                            try {
                                const key = argument ? `${variable}:${argument}` : variable;
                                return this.resolveFromMap(configurationResolver_1.VariableKind.Unknown, match, key, commandValueMapping, undefined);
                            }
                            catch (error) {
                                return match;
                            }
                    }
                }
            }
        }
        resolveFromMap(variableKind, match, argument, commandValueMapping, prefix) {
            if (argument && commandValueMapping) {
                const v = (prefix === undefined) ? commandValueMapping[argument] : commandValueMapping[prefix + ':' + argument];
                if (typeof v === 'string') {
                    return v;
                }
                throw new configurationResolver_1.VariableError(variableKind, (0, nls_1.localize)('noValueForCommand', "Variable {0} can not be resolved because the command has no value.", match));
            }
            return match;
        }
    }
    exports.AbstractVariableResolverService = AbstractVariableResolverService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFyaWFibGVSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uUmVzb2x2ZXIvY29tbW9uL3ZhcmlhYmxlUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0JoRyxNQUFhLCtCQUErQjtpQkFFM0IsaUJBQVksR0FBRyxJQUFJLEFBQVAsQ0FBUTtpQkFDcEIsb0JBQWUsR0FBRyxjQUFjLEFBQWpCLENBQWtCO1FBVWpELFlBQVksUUFBaUMsRUFBRSxhQUE2QixFQUFFLGdCQUFrQyxFQUFFLG9CQUFtRDtZQUYzSiwwQkFBcUIsR0FBbUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUczRixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDekMsSUFBSSxvQkFBb0IsRUFBRTtnQkFDekIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDcEUsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQztRQUVPLFVBQVUsQ0FBQyxZQUFpQztZQUNuRCw2Q0FBNkM7WUFDN0MsSUFBSSxvQkFBUyxFQUFFO2dCQUNkLE1BQU0sRUFBRSxHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxH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