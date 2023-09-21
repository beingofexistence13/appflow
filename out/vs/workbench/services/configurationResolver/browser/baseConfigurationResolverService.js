define(["require", "exports", "vs/base/common/async", "vs/base/common/network", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/nls", "vs/workbench/common/editor", "vs/workbench/services/configurationResolver/common/variableResolver"], function (require, exports, async_1, network_1, Types, editorBrowser_1, nls, editor_1, variableResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseConfigurationResolverService = void 0;
    class BaseConfigurationResolverService extends variableResolver_1.AbstractVariableResolverService {
        static { this.INPUT_OR_COMMAND_VARIABLES_PATTERN = /\${((input|command):(.*?))}/g; }
        constructor(context, envVariablesPromise, editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService) {
            super({
                getFolderUri: (folderName) => {
                    const folder = workspaceContextService.getWorkspace().folders.filter(f => f.name === folderName).pop();
                    return folder ? folder.uri : undefined;
                },
                getWorkspaceFolderCount: () => {
                    return workspaceContextService.getWorkspace().folders.length;
                },
                getConfigurationValue: (folderUri, suffix) => {
                    return configurationService.getValue(suffix, folderUri ? { resource: folderUri } : {});
                },
                getAppRoot: () => {
                    return context.getAppRoot();
                },
                getExecPath: () => {
                    return context.getExecPath();
                },
                getFilePath: () => {
                    const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
                        supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                        filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, this.pathService.defaultUriScheme]
                    });
                    if (!fileResource) {
                        return undefined;
                    }
                    return this.labelService.getUriLabel(fileResource, { noPrefix: true });
                },
                getWorkspaceFolderPathForFile: () => {
                    const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
                        supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                        filterByScheme: [network_1.Schemas.file, network_1.Schemas.vscodeUserData, this.pathService.defaultUriScheme]
                    });
                    if (!fileResource) {
                        return undefined;
                    }
                    const wsFolder = workspaceContextService.getWorkspaceFolder(fileResource);
                    if (!wsFolder) {
                        return undefined;
                    }
                    return this.labelService.getUriLabel(wsFolder.uri, { noPrefix: true });
                },
                getSelectedText: () => {
                    const activeTextEditorControl = editorService.activeTextEditorControl;
                    let activeControl = null;
                    if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                        activeControl = activeTextEditorControl;
                    }
                    else if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
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
                    if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
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
            }, labelService, pathService.userHome().then(home => home.path), envVariablesPromise);
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.workspaceContextService = workspaceContextService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.pathService = pathService;
            this.userInputAccessQueue = new async_1.Queue();
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
            return this.resolveWithInputAndCommands(folder, config, variables, section, target).then(inputOrCommandMapping => {
                if (this.updateMapping(inputOrCommandMapping, allVariableMapping)) {
                    return allVariableMapping;
                }
                return undefined;
            });
        }
        /**
         * Add all items from newMapping to fullMapping. Returns false if newMapping is undefined.
         */
        updateMapping(newMapping, fullMapping) {
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
        async resolveWithInputAndCommands(folder, configuration, variableToCommandMap, section, target) {
            if (!configuration) {
                return Promise.resolve(undefined);
            }
            // get all "inputs"
            let inputs = [];
            if (this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && section) {
                const overrides = folder ? { resource: folder.uri } : {};
                const result = this.configurationService.inspect(section, overrides);
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
                    const valueResult = this.configurationService.getValue(section, overrides);
                    if (valueResult) {
                        inputs = valueResult.inputs;
                    }
                }
            }
            // extract and dedupe all "input" and "command" variables and preserve their order in an array
            const variables = [];
            this.findVariables(configuration, variables);
            const variableValues = Object.create(null);
            for (const variable of variables) {
                const [type, name] = variable.split(':', 2);
                let result;
                switch (type) {
                    case 'input':
                        result = await this.showUserInput(name, inputs);
                        break;
                    case 'command': {
                        // use the name as a command ID #12735
                        const commandId = (variableToCommandMap ? variableToCommandMap[name] : undefined) || name;
                        result = await this.commandService.executeCommand(commandId, configuration);
                        if (typeof result !== 'string' && !Types.isUndefinedOrNull(result)) {
                            throw new Error(nls.localize('commandVariable.noStringType', "Cannot substitute command variable '{0}' because command did not return a result of type string.", commandId));
                        }
                        break;
                    }
                    default:
                        // Try to resolve it as a contributed variable
                        if (this._contributedVariables.has(variable)) {
                            result = await this._contributedVariables.get(variable)();
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
        findVariables(object, variables) {
            if (typeof object === 'string') {
                let matches;
                while ((matches = BaseConfigurationResolverService.INPUT_OR_COMMAND_VARIABLES_PATTERN.exec(object)) !== null) {
                    if (matches.length === 4) {
                        const command = matches[1];
                        if (variables.indexOf(command) < 0) {
                            variables.push(command);
                        }
                    }
                }
                for (const contributed of this._contributedVariables.keys()) {
                    if ((variables.indexOf(contributed) < 0) && (object.indexOf('${' + contributed + '}') >= 0)) {
                        variables.push(contributed);
                    }
                }
            }
            else if (Array.isArray(object)) {
                for (const value of object) {
                    this.findVariables(value, variables);
                }
            }
            else if (object) {
                for (const value of Object.values(object)) {
                    this.findVariables(value, variables);
                }
            }
        }
        /**
         * Takes the provided input info and shows the quick pick so the user can provide the value for the input
         * @param variable Name of the input variable.
         * @param inputInfos Information about each possible input variable.
         */
        showUserInput(variable, inputInfos) {
            if (!inputInfos) {
                return Promise.reject(new Error(nls.localize('inputVariable.noInputSection', "Variable '{0}' must be defined in an '{1}' section of the debug or task configuration.", variable, 'input')));
            }
            // find info for the given input variable
            const info = inputInfos.filter(item => item.id === variable).pop();
            if (info) {
                const missingAttribute = (attrName) => {
                    throw new Error(nls.localize('inputVariable.missingAttribute', "Input variable '{0}' is of type '{1}' and must include '{2}'.", variable, info.type, attrName));
                };
                switch (info.type) {
                    case 'promptString': {
                        if (!Types.isString(info.description)) {
                            missingAttribute('description');
                        }
                        const inputOptions = { prompt: info.description, ignoreFocusLost: true };
                        if (info.default) {
                            inputOptions.value = info.default;
                        }
                        if (info.password) {
                            inputOptions.password = info.password;
                        }
                        return this.userInputAccessQueue.queue(() => this.quickInputService.input(inputOptions)).then(resolvedInput => {
                            return resolvedInput;
                        });
                    }
                    case 'pickString': {
                        if (!Types.isString(info.description)) {
                            missingAttribute('description');
                        }
                        if (Array.isArray(info.options)) {
                            for (const pickOption of info.options) {
                                if (!Types.isString(pickOption) && !Types.isString(pickOption.value)) {
                                    missingAttribute('value');
                                }
                            }
                        }
                        else {
                            missingAttribute('options');
                        }
                        const picks = new Array();
                        for (const pickOption of info.options) {
                            const value = Types.isString(pickOption) ? pickOption : pickOption.value;
                            const label = Types.isString(pickOption) ? undefined : pickOption.label;
                            // If there is no label defined, use value as label
                            const item = {
                                label: label ? `${label}: ${value}` : value,
                                value: value
                            };
                            if (value === info.default) {
                                item.description = nls.localize('inputVariable.defaultInputValue', "(Default)");
                                picks.unshift(item);
                            }
                            else {
                                picks.push(item);
                            }
                        }
                        const pickOptions = { placeHolder: info.description, matchOnDetail: true, ignoreFocusLost: true };
                        return this.userInputAccessQueue.queue(() => this.quickInputService.pick(picks, pickOptions, undefined)).then(resolvedInput => {
                            if (resolvedInput) {
                                return resolvedInput.value;
                            }
                            return undefined;
                        });
                    }
                    case 'command': {
                        if (!Types.isString(info.command)) {
                            missingAttribute('command');
                        }
                        return this.userInputAccessQueue.queue(() => this.commandService.executeCommand(info.command, info.args)).then(result => {
                            if (typeof result === 'string' || Types.isUndefinedOrNull(result)) {
                                return result;
                            }
                            throw new Error(nls.localize('inputVariable.command.noStringType', "Cannot substitute input variable '{0}' because command '{1}' did not return a result of type string.", variable, info.command));
                        });
                    }
                    default:
                        throw new Error(nls.localize('inputVariable.unknownType', "Input variable '{0}' can only be of type 'promptString', 'pickString', or 'command'.", variable));
                }
            }
            return Promise.reject(new Error(nls.localize('inputVariable.undefinedVariable', "Undefined input variable '{0}' encountered. Remove or define '{0}' to continue.", variable)));
        }
    }
    exports.BaseConfigurationResolverService = BaseConfigurationResolverService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNvbmZpZ3VyYXRpb25SZXNvbHZlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvY29uZmlndXJhdGlvblJlc29sdmVyL2Jyb3dzZXIvYmFzZUNvbmZpZ3VyYXRpb25SZXNvbHZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXdCQSxNQUFzQixnQ0FBaUMsU0FBUSxrREFBK0I7aUJBRTdFLHVDQUFrQyxHQUFHLDhCQUE4QixBQUFqQyxDQUFrQztRQUlwRixZQUNDLE9BR0MsRUFDRCxtQkFBaUQsRUFDakQsYUFBNkIsRUFDWixvQkFBMkMsRUFDM0MsY0FBK0IsRUFDL0IsdUJBQWlELEVBQ2pELGlCQUFxQyxFQUNyQyxZQUEyQixFQUMzQixXQUF5QixFQUMxQyxnQkFBbUM7WUFFbkMsS0FBSyxDQUFDO2dCQUNMLFlBQVksRUFBRSxDQUFDLFVBQWtCLEVBQW1CLEVBQUU7b0JBQ3JELE1BQU0sTUFBTSxHQUFHLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUN2RyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUN4QyxDQUFDO2dCQUNELHVCQUF1QixFQUFFLEdBQVcsRUFBRTtvQkFDckMsT0FBTyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUM5RCxDQUFDO2dCQUNELHFCQUFxQixFQUFFLENBQUMsU0FBMEIsRUFBRSxNQUFjLEVBQXNCLEVBQUU7b0JBQ3pGLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFTLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEcsQ0FBQztnQkFDRCxVQUFVLEVBQUUsR0FBdUIsRUFBRTtvQkFDcEMsT0FBTyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ0QsV0FBVyxFQUFFLEdBQXVCLEVBQUU7b0JBQ3JDLE9BQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QixDQUFDO2dCQUNELFdBQVcsRUFBRSxHQUF1QixFQUFFO29CQUNyQyxNQUFNLFlBQVksR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRTt3QkFDdEYsaUJBQWlCLEVBQUUseUJBQWdCLENBQUMsT0FBTzt3QkFDM0MsY0FBYyxFQUFFLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDekYsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxZQUFZLEVBQUU7d0JBQ2xCLE9BQU8sU0FBUyxDQUFDO3FCQUNqQjtvQkFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RSxDQUFDO2dCQUNELDZCQUE2QixFQUFFLEdBQXVCLEVBQUU7b0JBQ3ZELE1BQU0sWUFBWSxHQUFHLCtCQUFzQixDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFO3dCQUN0RixpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPO3dCQUMzQyxjQUFjLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxpQkFBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDO3FCQUN6RixDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDbEIsT0FBTyxTQUFTLENBQUM7cUJBQ2pCO29CQUNELE1BQU0sUUFBUSxHQUFHLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMxRSxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNkLE9BQU8sU0FBUyxDQUFDO3FCQUNqQjtvQkFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDeEUsQ0FBQztnQkFDRCxlQUFlLEVBQUUsR0FBdUIsRUFBRTtvQkFDekMsTUFBTSx1QkFBdUIsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUM7b0JBRXRFLElBQUksYUFBYSxHQUF1QixJQUFJLENBQUM7b0JBRTdDLElBQUksSUFBQSw0QkFBWSxFQUFDLHVCQUF1QixDQUFDLEVBQUU7d0JBQzFDLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQztxQkFDeEM7eUJBQU0sSUFBSSxJQUFBLDRCQUFZLEVBQUMsdUJBQXVCLENBQUMsRUFBRTt3QkFDakQsTUFBTSxRQUFRLEdBQUcsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDN0QsTUFBTSxRQUFRLEdBQUcsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDN0QsYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7cUJBQ2hFO29CQUVELE1BQU0sV0FBVyxHQUFHLGFBQWEsRUFBRSxRQUFRLEVBQUUsQ0FBQztvQkFDOUMsTUFBTSxlQUFlLEdBQUcsYUFBYSxFQUFFLFlBQVksRUFBRSxDQUFDO29CQUN0RCxJQUFJLFdBQVcsSUFBSSxlQUFlLEVBQUU7d0JBQ25DLE9BQU8sV0FBVyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztxQkFDcEQ7b0JBQ0QsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsYUFBYSxFQUFFLEdBQXVCLEVBQUU7b0JBQ3ZDLE1BQU0sdUJBQXVCLEdBQUcsYUFBYSxDQUFDLHVCQUF1QixDQUFDO29CQUN0RSxJQUFJLElBQUEsNEJBQVksRUFBQyx1QkFBdUIsQ0FBQyxFQUFFO3dCQUMxQyxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDekQsSUFBSSxTQUFTLEVBQUU7NEJBQ2QsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDOzRCQUNoRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDMUI7cUJBQ0Q7b0JBQ0QsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFO29CQUNsQixPQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUMsQ0FBQzthQUNELEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQW5GckUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNqRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3JDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzNCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBZG5DLHlCQUFvQixHQUFHLElBQUksYUFBSyxFQUF1QyxDQUFDO1FBNkZoRixDQUFDO1FBRWUsS0FBSyxDQUFDLDZCQUE2QixDQUFDLE1BQW9DLEVBQUUsTUFBVyxFQUFFLE9BQWdCLEVBQUUsU0FBcUMsRUFBRSxNQUE0QjtZQUMzTCxzRUFBc0U7WUFDdEUsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFcEQscUVBQXFFO1lBQ3JFLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzdGLG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQztpQkFDWjtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO29CQUM1QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ3pFO3FCQUFNO29CQUNOLE9BQU8sTUFBTSxDQUFDO2lCQUNkO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE1BQW9DLEVBQUUsTUFBVyxFQUFFLE9BQWdCLEVBQUUsU0FBcUMsRUFBRSxNQUE0QjtZQUNwTCxzRUFBc0U7WUFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRCxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUM1QixNQUFNLGtCQUFrQixHQUF3QixRQUFRLENBQUMsaUJBQWlCLENBQUM7WUFFM0UsaUZBQWlGO1lBQ2pGLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDaEgsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLGtCQUFrQixDQUFDLEVBQUU7b0JBQ2xFLE9BQU8sa0JBQWtCLENBQUM7aUJBQzFCO2dCQUNELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOztXQUVHO1FBQ0ssYUFBYSxDQUFDLFVBQWlELEVBQUUsV0FBZ0M7WUFDeEcsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN0RCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSyxLQUFLLENBQUMsMkJBQTJCLENBQUMsTUFBb0MsRUFBRSxhQUFrQixFQUFFLG9CQUFnRCxFQUFFLE9BQWdCLEVBQUUsTUFBNEI7WUFFbk0sSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsbUJBQW1CO1lBQ25CLElBQUksTUFBTSxHQUFzQixFQUFFLENBQUM7WUFDbkMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsaUNBQXlCLElBQUksT0FBTyxFQUFFO2dCQUN6RixNQUFNLFNBQVMsR0FBNEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3JFLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO29CQUN6RixRQUFRLE1BQU0sRUFBRTt3QkFDZjs0QkFBK0IsTUFBTSxHQUFTLE1BQU0sQ0FBQyxTQUFVLEVBQUUsTUFBTSxDQUFDOzRCQUFDLE1BQU07d0JBQy9FOzRCQUFvQyxNQUFNLEdBQVMsTUFBTSxDQUFDLGNBQWUsRUFBRSxNQUFNLENBQUM7NEJBQUMsTUFBTTt3QkFDekYsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFTLE1BQU0sQ0FBQyxvQkFBcUIsRUFBRSxNQUFNLENBQUM7cUJBQzdEO2lCQUNEO3FCQUFNO29CQUNOLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQU0sT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNoRixJQUFJLFdBQVcsRUFBRTt3QkFDaEIsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7cUJBQzVCO2lCQUNEO2FBQ0Q7WUFFRCw4RkFBOEY7WUFDOUYsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sY0FBYyxHQUE4QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRFLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUVqQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLE1BQTBCLENBQUM7Z0JBRS9CLFFBQVEsSUFBSSxFQUFFO29CQUViLEtBQUssT0FBTzt3QkFDWCxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDaEQsTUFBTTtvQkFFUCxLQUFLLFNBQVMsQ0FBQyxDQUFDO3dCQUNmLHNDQUFzQzt3QkFDdEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQzt3QkFDMUYsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUM1RSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDbkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLGtHQUFrRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7eUJBQzdLO3dCQUNELE1BQU07cUJBQ047b0JBQ0Q7d0JBQ0MsOENBQThDO3dCQUM5QyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7NEJBQzdDLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLEVBQUUsQ0FBQzt5QkFDM0Q7aUJBQ0Y7Z0JBRUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7b0JBQy9CLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7aUJBQ2xDO3FCQUFNO29CQUNOLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjthQUNEO1lBRUQsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSyxhQUFhLENBQUMsTUFBVyxFQUFFLFNBQW1CO1lBQ3JELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUMvQixJQUFJLE9BQU8sQ0FBQztnQkFDWixPQUFPLENBQUMsT0FBTyxHQUFHLGdDQUFnQyxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDN0csSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDekIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzQixJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFOzRCQUNuQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3lCQUN4QjtxQkFDRDtpQkFDRDtnQkFDRCxLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7d0JBQzVGLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7cUJBQzVCO2lCQUNEO2FBQ0Q7aUJBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtvQkFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBRXJDO2FBQ0Q7aUJBQU0sSUFBSSxNQUFNLEVBQUU7Z0JBQ2xCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBRXJDO2FBQ0Q7UUFDRixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNLLGFBQWEsQ0FBQyxRQUFnQixFQUFFLFVBQTZCO1lBRXBFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHdGQUF3RixFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUw7WUFFRCx5Q0FBeUM7WUFDekMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbkUsSUFBSSxJQUFJLEVBQUU7Z0JBRVQsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFFBQWdCLEVBQUUsRUFBRTtvQkFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLCtEQUErRCxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pLLENBQUMsQ0FBQztnQkFFRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBRWxCLEtBQUssY0FBYyxDQUFDLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTs0QkFDdEMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7eUJBQ2hDO3dCQUNELE1BQU0sWUFBWSxHQUFrQixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQzt3QkFDeEYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOzRCQUNqQixZQUFZLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7eUJBQ2xDO3dCQUNELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDbEIsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO3lCQUN0Qzt3QkFDRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTs0QkFDN0csT0FBTyxhQUF1QixDQUFDO3dCQUNoQyxDQUFDLENBQUMsQ0FBQztxQkFDSDtvQkFFRCxLQUFLLFlBQVksQ0FBQyxDQUFDO3dCQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7NEJBQ3RDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO3lCQUNoQzt3QkFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNoQyxLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0NBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7b0NBQ3JFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2lDQUMxQjs2QkFDRDt5QkFDRDs2QkFBTTs0QkFDTixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt5QkFDNUI7d0JBSUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQWtCLENBQUM7d0JBQzFDLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDdEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDOzRCQUN6RSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7NEJBRXhFLG1EQUFtRDs0QkFDbkQsTUFBTSxJQUFJLEdBQW1CO2dDQUM1QixLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSztnQ0FDM0MsS0FBSyxFQUFFLEtBQUs7NkJBQ1osQ0FBQzs0QkFFRixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO2dDQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0NBQ2hGLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NkJBQ3BCO2lDQUFNO2dDQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7NkJBQ2pCO3lCQUNEO3dCQUNELE1BQU0sV0FBVyxHQUFpQyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDO3dCQUNoSSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFOzRCQUM3SCxJQUFJLGFBQWEsRUFBRTtnQ0FDbEIsT0FBUSxhQUFnQyxDQUFDLEtBQUssQ0FBQzs2QkFDL0M7NEJBQ0QsT0FBTyxTQUFTLENBQUM7d0JBQ2xCLENBQUMsQ0FBQyxDQUFDO3FCQUNIO29CQUVELEtBQUssU0FBUyxDQUFDLENBQUM7d0JBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNsQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt5QkFDNUI7d0JBQ0QsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUMvSCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0NBQ2xFLE9BQU8sTUFBTSxDQUFDOzZCQUNkOzRCQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxzR0FBc0csRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ3JNLENBQUMsQ0FBQyxDQUFDO3FCQUNIO29CQUVEO3dCQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxzRkFBc0YsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUM5SjthQUNEO1lBQ0QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsaUZBQWlGLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hMLENBQUM7O0lBaFdGLDRFQWlXQyJ9