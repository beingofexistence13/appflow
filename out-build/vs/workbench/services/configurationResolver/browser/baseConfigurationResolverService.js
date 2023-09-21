define(["require", "exports", "vs/base/common/async", "vs/base/common/network", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/nls!vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService", "vs/workbench/common/editor", "vs/workbench/services/configurationResolver/common/variableResolver"], function (require, exports, async_1, network_1, Types, editorBrowser_1, nls, editor_1, variableResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y4b = void 0;
    class $y4b extends variableResolver_1.$3M {
        static { this.INPUT_OR_COMMAND_VARIABLES_PATTERN = /\${((input|command):(.*?))}/g; }
        constructor(context, envVariablesPromise, editorService, e, k, q, r, t, u, extensionService) {
            super({
                getFolderUri: (folderName) => {
                    const folder = q.getWorkspace().folders.filter(f => f.name === folderName).pop();
                    return folder ? folder.uri : undefined;
                },
                getWorkspaceFolderCount: () => {
                    return q.getWorkspace().folders.length;
                },
                getConfigurationValue: (folderUri, suffix) => {
                    return e.getValue(suffix, folderUri ? { resource: folderUri } : {});
                },
                getAppRoot: () => {
                    return context.getAppRoot();
                },
                getExecPath: () => {
                    return context.getExecPath();
                },
                getFilePath: () => {
                    const fileResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, {
                        supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                        filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, this.u.defaultUriScheme]
                    });
                    if (!fileResource) {
                        return undefined;
                    }
                    return this.t.getUriLabel(fileResource, { noPrefix: true });
                },
                getWorkspaceFolderPathForFile: () => {
                    const fileResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, {
                        supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                        filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, this.u.defaultUriScheme]
                    });
                    if (!fileResource) {
                        return undefined;
                    }
                    const wsFolder = q.getWorkspaceFolder(fileResource);
                    if (!wsFolder) {
                        return undefined;
                    }
                    return this.t.getUriLabel(wsFolder.uri, { noPrefix: true });
                },
                getSelectedText: () => {
                    const activeTextEditorControl = editorService.activeTextEditorControl;
                    let activeControl = null;
                    if ((0, editorBrowser_1.$iV)(activeTextEditorControl)) {
                        activeControl = activeTextEditorControl;
                    }
                    else if ((0, editorBrowser_1.$jV)(activeTextEditorControl)) {
                        const original = activeTextEditorControl.getOriginalEditor();
                        const modified = activeTextEditorControl.getModifiedEditor();
                        activeControl = original.hasWidgetFocus() ? original : modified;
                    }
                    const activeModel = activeControl?.getModel();
                    const activeSelection = activeControl?.getSelection();
                    if (activeModel && activeSelection) {
                        return activeModel.getValueInRange(activeSelection);
                    }
                    return undefined;
                },
                getLineNumber: () => {
                    const activeTextEditorControl = editorService.activeTextEditorControl;
                    if ((0, editorBrowser_1.$iV)(activeTextEditorControl)) {
                        const selection = activeTextEditorControl.getSelection();
                        if (selection) {
                            const lineNumber = selection.positionLineNumber;
                            return String(lineNumber);
                        }
                    }
                    return undefined;
                },
                getExtension: id => {
                    return extensionService.getExtension(id);
                },
            }, t, u.userHome().then(home => home.path), envVariablesPromise);
            this.e = e;
            this.k = k;
            this.q = q;
            this.r = r;
            this.t = t;
            this.u = u;
            this.d = new async_1.$Ng();
        }
        async resolveWithInteractionReplace(folder, config, section, variables, target) {
            // resolve any non-interactive variables and any contributed variables
            config = await this.resolveAnyAsync(folder, config);
            // resolve input variables in the order in which they are encountered
            return this.resolveWithInteraction(folder, config, section, variables, target).then(mapping => {
                // finally substitute evaluated command variables (if there are any)
                if (!mapping) {
                    return null;
                }
                else if (mapping.size > 0) {
                    return this.resolveAnyAsync(folder, config, Object.fromEntries(mapping));
                }
                else {
                    return config;
                }
            });
        }
        async resolveWithInteraction(folder, config, section, variables, target) {
            // resolve any non-interactive variables and any contributed variables
            const resolved = await this.resolveAnyMap(folder, config);
            config = resolved.newConfig;
            const allVariableMapping = resolved.resolvedVariables;
            // resolve input and command variables in the order in which they are encountered
            return this.x(folder, config, variables, section, target).then(inputOrCommandMapping => {
                if (this.w(inputOrCommandMapping, allVariableMapping)) {
                    return allVariableMapping;
                }
                return undefined;
            });
        }
        /**
         * Add all items from newMapping to fullMapping. Returns false if newMapping is undefined.
         */
        w(newMapping, fullMapping) {
            if (!newMapping) {
                return false;
            }
            for (const [key, value] of Object.entries(newMapping)) {
                fullMapping.set(key, value);
            }
            return true;
        }
        /**
         * Finds and executes all input and command variables in the given configuration and returns their values as a dictionary.
         * Please note: this method does not substitute the input or command variables (so the configuration is not modified).
         * The returned dictionary can be passed to "resolvePlatform" for the actual substitution.
         * See #6569.
         *
         * @param variableToCommandMap Aliases for commands
         */
        async x(folder, configuration, variableToCommandMap, section, target) {
            if (!configuration) {
                return Promise.resolve(undefined);
            }
            // get all "inputs"
            let inputs = [];
            if (this.q.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && section) {
                const overrides = folder ? { resource: folder.uri } : {};
                const result = this.e.inspect(section, overrides);
                if (result && (result.userValue || result.workspaceValue || result.workspaceFolderValue)) {
                    switch (target) {
                        case 2 /* ConfigurationTarget.USER */:
                            inputs = result.userValue?.inputs;
                            break;
                        case 5 /* ConfigurationTarget.WORKSPACE */:
                            inputs = result.workspaceValue?.inputs;
                            break;
                        default: inputs = result.workspaceFolderValue?.inputs;
                    }
                }
                else {
                    const valueResult = this.e.getValue(section, overrides);
                    if (valueResult) {
                        inputs = valueResult.inputs;
                    }
                }
            }
            // extract and dedupe all "input" and "command" variables and preserve their order in an array
            const variables = [];
            this.y(configuration, variables);
            const variableValues = Object.create(null);
            for (const variable of variables) {
                const [type, name] = variable.split(':', 2);
                let result;
                switch (type) {
                    case 'input':
                        result = await this.z(name, inputs);
                        break;
                    case 'command': {
                        // use the name as a command ID #12735
                        const commandId = (variableToCommandMap ? variableToCommandMap[name] : undefined) || name;
                        result = await this.k.executeCommand(commandId, configuration);
                        if (typeof result !== 'string' && !Types.$sf(result)) {
                            throw new Error(nls.localize(0, null, commandId));
                        }
                        break;
                    }
                    default:
                        // Try to resolve it as a contributed variable
                        if (this.h.has(variable)) {
                            result = await this.h.get(variable)();
                        }
                }
                if (typeof result === 'string') {
                    variableValues[variable] = result;
                }
                else {
                    return undefined;
                }
            }
            return variableValues;
        }
        /**
         * Recursively finds all command or input variables in object and pushes them into variables.
         * @param object object is searched for variables.
         * @param variables All found variables are returned in variables.
         */
        y(object, variables) {
            if (typeof object === 'string') {
                let matches;
                while ((matches = $y4b.INPUT_OR_COMMAND_VARIABLES_PATTERN.exec(object)) !== null) {
                    if (matches.length === 4) {
                        const command = matches[1];
                        if (variables.indexOf(command) < 0) {
                            variables.push(command);
                        }
                    }
                }
                for (const contributed of this.h.keys()) {
                    if ((variables.indexOf(contributed) < 0) && (object.indexOf('${' + contributed + '}') >= 0)) {
                        variables.push(contributed);
                    }
                }
            }
            else if (Array.isArray(object)) {
                for (const value of object) {
                    this.y(value, variables);
                }
            }
            else if (object) {
                for (const value of Object.values(object)) {
                    this.y(value, variables);
                }
            }
        }
        /**
         * Takes the provided input info and shows the quick pick so the user can provide the value for the input
         * @param variable Name of the input variable.
         * @param inputInfos Information about each possible input variable.
         */
        z(variable, inputInfos) {
            if (!inputInfos) {
                return Promise.reject(new Error(nls.localize(1, null, variable, 'input')));
            }
            // find info for the given input variable
            const info = inputInfos.filter(item => item.id === variable).pop();
            if (info) {
                const missingAttribute = (attrName) => {
                    throw new Error(nls.localize(2, null, variable, info.type, attrName));
                };
                switch (info.type) {
                    case 'promptString': {
                        if (!Types.$jf(info.description)) {
                            missingAttribute('description');
                        }
                        const inputOptions = { prompt: info.description, ignoreFocusLost: true };
                        if (info.default) {
                            inputOptions.value = info.default;
                        }
                        if (info.password) {
                            inputOptions.password = info.password;
                        }
                        return this.d.queue(() => this.r.input(inputOptions)).then(resolvedInput => {
                            return resolvedInput;
                        });
                    }
                    case 'pickString': {
                        if (!Types.$jf(info.description)) {
                            missingAttribute('description');
                        }
                        if (Array.isArray(info.options)) {
                            for (const pickOption of info.options) {
                                if (!Types.$jf(pickOption) && !Types.$jf(pickOption.value)) {
                                    missingAttribute('value');
                                }
                            }
                        }
                        else {
                            missingAttribute('options');
                        }
                        const picks = new Array();
                        for (const pickOption of info.options) {
                            const value = Types.$jf(pickOption) ? pickOption : pickOption.value;
                            const label = Types.$jf(pickOption) ? undefined : pickOption.label;
                            // If there is no label defined, use value as label
                            const item = {
                                label: label ? `${label}: ${value}` : value,
                                value: value
                            };
                            if (value === info.default) {
                                item.description = nls.localize(3, null);
                                picks.unshift(item);
                            }
                            else {
                                picks.push(item);
                            }
                        }
                        const pickOptions = { placeHolder: info.description, matchOnDetail: true, ignoreFocusLost: true };
                        return this.d.queue(() => this.r.pick(picks, pickOptions, undefined)).then(resolvedInput => {
                            if (resolvedInput) {
                                return resolvedInput.value;
                            }
                            return undefined;
                        });
                    }
                    case 'command': {
                        if (!Types.$jf(info.command)) {
                            missingAttribute('command');
                        }
                        return this.d.queue(() => this.k.executeCommand(info.command, info.args)).then(result => {
                            if (typeof result === 'string' || Types.$sf(result)) {
                                return result;
                            }
                            throw new Error(nls.localize(4, null, variable, info.command));
                        });
                    }
                    default:
                        throw new Error(nls.localize(5, null, variable));
                }
            }
            return Promise.reject(new Error(nls.localize(6, null, variable)));
        }
    }
    exports.$y4b = $y4b;
});
//# sourceMappingURL=baseConfigurationResolverService.js.map