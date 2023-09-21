/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/process", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/labels", "vs/nls!vs/workbench/services/configurationResolver/common/variableResolver", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/base/common/strings"], function (require, exports, paths, process, types, objects, platform_1, labels_1, nls_1, configurationResolver_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3M = void 0;
    class $3M {
        static { this.VARIABLE_LHS = '${'; }
        static { this.VARIABLE_REGEXP = /\$\{(.*?)\}/g; }
        constructor(_context, _labelService, _userHomePromise, _envVariablesPromise) {
            this.h = new Map();
            this.a = _context;
            this.b = _labelService;
            this.g = _userHomePromise;
            if (_envVariablesPromise) {
                this.c = _envVariablesPromise.then(envVariables => {
                    return this.i(envVariables);
                });
            }
        }
        i(envVariables) {
            // windows env variables are case insensitive
            if (platform_1.$i) {
                const ev = Object.create(null);
                Object.keys(envVariables).forEach(key => {
                    ev[key.toLowerCase()] = envVariables[key];
                });
                return ev;
            }
            return envVariables;
        }
        resolveWithEnvironment(environment, root, value) {
            return this.l({ env: this.i(environment), userHome: undefined }, root ? root.uri : undefined, value);
        }
        async resolveAsync(root, value) {
            const environment = {
                env: await this.c,
                userHome: await this.g
            };
            return this.l(environment, root ? root.uri : undefined, value);
        }
        async j(workspaceFolder, config, commandValueMapping, resolvedVariables) {
            const result = objects.$Vm(config);
            // hoist platform specific attributes to top level
            if (platform_1.$i && result.windows) {
                Object.keys(result.windows).forEach(key => result[key] = result.windows[key]);
            }
            else if (platform_1.$j && result.osx) {
                Object.keys(result.osx).forEach(key => result[key] = result.osx[key]);
            }
            else if (platform_1.$k && result.linux) {
                Object.keys(result.linux).forEach(key => result[key] = result.linux[key]);
            }
            // delete all platform specific sections
            delete result.windows;
            delete result.osx;
            delete result.linux;
            // substitute all variables recursively in string values
            const environmentPromises = {
                env: await this.c,
                userHome: await this.g
            };
            return this.l(environmentPromises, workspaceFolder ? workspaceFolder.uri : undefined, result, commandValueMapping, resolvedVariables);
        }
        async resolveAnyAsync(workspaceFolder, config, commandValueMapping) {
            return this.j(workspaceFolder, config, commandValueMapping);
        }
        async resolveAnyMap(workspaceFolder, config, commandValueMapping) {
            const resolvedVariables = new Map();
            const newConfig = await this.j(workspaceFolder, config, commandValueMapping, resolvedVariables);
            return { newConfig, resolvedVariables };
        }
        resolveWithInteractionReplace(folder, config, section, variables) {
            throw new Error('resolveWithInteractionReplace not implemented.');
        }
        resolveWithInteraction(folder, config, section, variables) {
            throw new Error('resolveWithInteraction not implemented.');
        }
        contributeVariable(variable, resolution) {
            if (this.h.has(variable)) {
                throw new Error('Variable ' + variable + ' is contributed twice.');
            }
            else {
                this.h.set(variable, resolution);
            }
        }
        async l(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            if (types.$jf(value)) {
                return this.m(environment, folderUri, value, commandValueMapping, resolvedVariables);
            }
            else if (Array.isArray(value)) {
                return Promise.all(value.map(s => this.l(environment, folderUri, s, commandValueMapping, resolvedVariables)));
            }
            else if (types.$lf(value)) {
                const result = Object.create(null);
                const replaced = await Promise.all(Object.keys(value).map(async (key) => {
                    const replaced = await this.m(environment, folderUri, key, commandValueMapping, resolvedVariables);
                    return [replaced, await this.l(environment, folderUri, value[key], commandValueMapping, resolvedVariables)];
                }));
                // two step process to preserve object key order
                for (const [key, value] of replaced) {
                    result[key] = value;
                }
                return result;
            }
            return value;
        }
        m(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            // loop through all variables occurrences in 'value'
            return (0, strings_1.$Ee)(value, $3M.VARIABLE_REGEXP, async (match, variable) => {
                // disallow attempted nesting, see #77289. This doesn't exclude variables that resolve to other variables.
                if (variable.includes($3M.VARIABLE_LHS)) {
                    return match;
                }
                let resolvedValue = await this.o(environment, match, variable, folderUri, commandValueMapping);
                resolvedVariables?.set(variable, resolvedValue);
                if ((resolvedValue !== match) && types.$jf(resolvedValue) && resolvedValue.match($3M.VARIABLE_REGEXP)) {
                    resolvedValue = await this.m(environment, folderUri, resolvedValue, commandValueMapping, resolvedVariables);
                }
                return resolvedValue;
            });
        }
        n(displayUri) {
            return this.b ? this.b.getUriLabel(displayUri, { noPrefix: true }) : displayUri.fsPath;
        }
        async o(environment, match, variable, folderUri, commandValueMapping) {
            // try to separate variable arguments from variable name
            let argument;
            const parts = variable.split(':');
            if (parts.length > 1) {
                variable = parts[0];
                argument = parts[1];
            }
            // common error handling for all variables that require an open editor
            const getFilePath = (variableKind) => {
                const filePath = this.a.getFilePath();
                if (filePath) {
                    return (0, labels_1.$fA)(filePath);
                }
                throw new configurationResolver_1.$OM(variableKind, ((0, nls_1.localize)(0, null, match)));
            };
            // common error handling for all variables that require an open editor
            const getFolderPathForFile = (variableKind) => {
                const filePath = getFilePath(variableKind); // throws error if no editor open
                if (this.a.getWorkspaceFolderPathForFile) {
                    const folderPath = this.a.getWorkspaceFolderPathForFile();
                    if (folderPath) {
                        return (0, labels_1.$fA)(folderPath);
                    }
                }
                throw new configurationResolver_1.$OM(variableKind, (0, nls_1.localize)(1, null, match, paths.$ae(filePath)));
            };
            // common error handling for all variables that require an open folder and accept a folder name argument
            const getFolderUri = (variableKind) => {
                if (argument) {
                    const folder = this.a.getFolderUri(argument);
                    if (folder) {
                        return folder;
                    }
                    throw new configurationResolver_1.$OM(variableKind, (0, nls_1.localize)(2, null, match, argument));
                }
                if (folderUri) {
                    return folderUri;
                }
                if (this.a.getWorkspaceFolderCount() > 1) {
                    throw new configurationResolver_1.$OM(variableKind, (0, nls_1.localize)(3, null, match));
                }
                throw new configurationResolver_1.$OM(variableKind, (0, nls_1.localize)(4, null, match));
            };
            switch (variable) {
                case 'env':
                    if (argument) {
                        if (environment.env) {
                            // Depending on the source of the environment, on Windows, the values may all be lowercase.
                            const env = environment.env[platform_1.$i ? argument.toLowerCase() : argument];
                            if (types.$jf(env)) {
                                return env;
                            }
                        }
                        // For `env` we should do the same as a normal shell does - evaluates undefined envs to an empty string #46436
                        return '';
                    }
                    throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.Env, (0, nls_1.localize)(5, null, match));
                case 'config':
                    if (argument) {
                        const config = this.a.getConfigurationValue(folderUri, argument);
                        if (types.$sf(config)) {
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)(6, null, match, argument));
                        }
                        if (types.$lf(config)) {
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)(7, null, match, argument));
                        }
                        return config;
                    }
                    throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.Config, (0, nls_1.localize)(8, null, match));
                case 'command':
                    return this.p(configurationResolver_1.VariableKind.Command, match, argument, commandValueMapping, 'command');
                case 'input':
                    return this.p(configurationResolver_1.VariableKind.Input, match, argument, commandValueMapping, 'input');
                case 'extensionInstallFolder':
                    if (argument) {
                        const ext = await this.a.getExtension(argument);
                        if (!ext) {
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.ExtensionInstallFolder, (0, nls_1.localize)(9, null, match, argument));
                        }
                        return this.n(ext.extensionLocation);
                    }
                    throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.ExtensionInstallFolder, (0, nls_1.localize)(10, null, match));
                default: {
                    switch (variable) {
                        case 'workspaceRoot':
                        case 'workspaceFolder':
                            return (0, labels_1.$fA)(this.n(getFolderUri(configurationResolver_1.VariableKind.WorkspaceFolder)));
                        case 'cwd':
                            return ((folderUri || argument) ? (0, labels_1.$fA)(this.n(getFolderUri(configurationResolver_1.VariableKind.Cwd))) : process.cwd());
                        case 'workspaceRootFolderName':
                        case 'workspaceFolderBasename':
                            return (0, labels_1.$fA)(paths.$ae(this.n(getFolderUri(configurationResolver_1.VariableKind.WorkspaceFolderBasename))));
                        case 'userHome': {
                            if (environment.userHome) {
                                return environment.userHome;
                            }
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.UserHome, (0, nls_1.localize)(11, null, match));
                        }
                        case 'lineNumber': {
                            const lineNumber = this.a.getLineNumber();
                            if (lineNumber) {
                                return lineNumber;
                            }
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.LineNumber, (0, nls_1.localize)(12, null, match));
                        }
                        case 'selectedText': {
                            const selectedText = this.a.getSelectedText();
                            if (selectedText) {
                                return selectedText;
                            }
                            throw new configurationResolver_1.$OM(configurationResolver_1.VariableKind.SelectedText, (0, nls_1.localize)(13, null, match));
                        }
                        case 'file':
                            return getFilePath(configurationResolver_1.VariableKind.File);
                        case 'fileWorkspaceFolder':
                            return getFolderPathForFile(configurationResolver_1.VariableKind.FileWorkspaceFolder);
                        case 'relativeFile':
                            if (folderUri || argument) {
                                return paths.$$d(this.n(getFolderUri(configurationResolver_1.VariableKind.RelativeFile)), getFilePath(configurationResolver_1.VariableKind.RelativeFile));
                            }
                            return getFilePath(configurationResolver_1.VariableKind.RelativeFile);
                        case 'relativeFileDirname': {
                            const dirname = paths.$_d(getFilePath(configurationResolver_1.VariableKind.RelativeFileDirname));
                            if (folderUri || argument) {
                                const relative = paths.$$d(this.n(getFolderUri(configurationResolver_1.VariableKind.RelativeFileDirname)), dirname);
                                return relative.length === 0 ? '.' : relative;
                            }
                            return dirname;
                        }
                        case 'fileDirname':
                            return paths.$_d(getFilePath(configurationResolver_1.VariableKind.FileDirname));
                        case 'fileExtname':
                            return paths.$be(getFilePath(configurationResolver_1.VariableKind.FileExtname));
                        case 'fileBasename':
                            return paths.$ae(getFilePath(configurationResolver_1.VariableKind.FileBasename));
                        case 'fileBasenameNoExtension': {
                            const basename = paths.$ae(getFilePath(configurationResolver_1.VariableKind.FileBasenameNoExtension));
                            return (basename.slice(0, basename.length - paths.$be(basename).length));
                        }
                        case 'fileDirnameBasename':
                            return paths.$ae(paths.$_d(getFilePath(configurationResolver_1.VariableKind.FileDirnameBasename)));
                        case 'execPath': {
                            const ep = this.a.getExecPath();
                            if (ep) {
                                return ep;
                            }
                            return match;
                        }
                        case 'execInstallFolder': {
                            const ar = this.a.getAppRoot();
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
                                return this.p(configurationResolver_1.VariableKind.Unknown, match, key, commandValueMapping, undefined);
                            }
                            catch (error) {
                                return match;
                            }
                    }
                }
            }
        }
        p(variableKind, match, argument, commandValueMapping, prefix) {
            if (argument && commandValueMapping) {
                const v = (prefix === undefined) ? commandValueMapping[argument] : commandValueMapping[prefix + ':' + argument];
                if (typeof v === 'string') {
                    return v;
                }
                throw new configurationResolver_1.$OM(variableKind, (0, nls_1.localize)(14, null, match));
            }
            return match;
        }
    }
    exports.$3M = $3M;
});
//# sourceMappingURL=variableResolver.js.map