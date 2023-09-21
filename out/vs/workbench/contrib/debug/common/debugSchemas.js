/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/nls", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/configurationResolver/common/configurationResolverSchema"], function (require, exports, extensionsRegistry, nls, configuration_1, configurationResolverSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.launchSchema = exports.presentationSchema = exports.breakpointsExtPoint = exports.debuggersExtPoint = void 0;
    // debuggers extension point
    exports.debuggersExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'debuggers',
        defaultExtensionKind: ['workspace'],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.debuggers', 'Contributes debug adapters.'),
            type: 'array',
            defaultSnippets: [{ body: [{ type: '' }] }],
            items: {
                additionalProperties: false,
                type: 'object',
                defaultSnippets: [{ body: { type: '', program: '', runtime: '' } }],
                properties: {
                    type: {
                        description: nls.localize('vscode.extension.contributes.debuggers.type', "Unique identifier for this debug adapter."),
                        type: 'string'
                    },
                    label: {
                        description: nls.localize('vscode.extension.contributes.debuggers.label', "Display name for this debug adapter."),
                        type: 'string'
                    },
                    program: {
                        description: nls.localize('vscode.extension.contributes.debuggers.program', "Path to the debug adapter program. Path is either absolute or relative to the extension folder."),
                        type: 'string'
                    },
                    args: {
                        description: nls.localize('vscode.extension.contributes.debuggers.args', "Optional arguments to pass to the adapter."),
                        type: 'array'
                    },
                    runtime: {
                        description: nls.localize('vscode.extension.contributes.debuggers.runtime', "Optional runtime in case the program attribute is not an executable but requires a runtime."),
                        type: 'string'
                    },
                    runtimeArgs: {
                        description: nls.localize('vscode.extension.contributes.debuggers.runtimeArgs', "Optional runtime arguments."),
                        type: 'array'
                    },
                    variables: {
                        description: nls.localize('vscode.extension.contributes.debuggers.variables', "Mapping from interactive variables (e.g. ${action.pickProcess}) in `launch.json` to a command."),
                        type: 'object'
                    },
                    initialConfigurations: {
                        description: nls.localize('vscode.extension.contributes.debuggers.initialConfigurations', "Configurations for generating the initial \'launch.json\'."),
                        type: ['array', 'string'],
                    },
                    languages: {
                        description: nls.localize('vscode.extension.contributes.debuggers.languages', "List of languages for which the debug extension could be considered the \"default debugger\"."),
                        type: 'array'
                    },
                    configurationSnippets: {
                        description: nls.localize('vscode.extension.contributes.debuggers.configurationSnippets', "Snippets for adding new configurations in \'launch.json\'."),
                        type: 'array'
                    },
                    configurationAttributes: {
                        description: nls.localize('vscode.extension.contributes.debuggers.configurationAttributes', "JSON schema configurations for validating \'launch.json\'."),
                        type: 'object'
                    },
                    when: {
                        description: nls.localize('vscode.extension.contributes.debuggers.when', "Condition which must be true to enable this type of debugger. Consider using 'shellExecutionSupported', 'virtualWorkspace', 'resourceScheme' or an extension-defined context key as appropriate for this."),
                        type: 'string',
                        default: ''
                    },
                    hiddenWhen: {
                        description: nls.localize('vscode.extension.contributes.debuggers.hiddenWhen', "When this condition is true, this debugger type is hidden from the debugger list, but is still enabled."),
                        type: 'string',
                        default: ''
                    },
                    deprecated: {
                        description: nls.localize('vscode.extension.contributes.debuggers.deprecated', "Optional message to mark this debug type as being deprecated."),
                        type: 'string',
                        default: ''
                    },
                    windows: {
                        description: nls.localize('vscode.extension.contributes.debuggers.windows', "Windows specific settings."),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize('vscode.extension.contributes.debuggers.windows.runtime', "Runtime used for Windows."),
                                type: 'string'
                            }
                        }
                    },
                    osx: {
                        description: nls.localize('vscode.extension.contributes.debuggers.osx', "macOS specific settings."),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize('vscode.extension.contributes.debuggers.osx.runtime', "Runtime used for macOS."),
                                type: 'string'
                            }
                        }
                    },
                    linux: {
                        description: nls.localize('vscode.extension.contributes.debuggers.linux', "Linux specific settings."),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize('vscode.extension.contributes.debuggers.linux.runtime', "Runtime used for Linux."),
                                type: 'string'
                            }
                        }
                    },
                    strings: {
                        description: nls.localize('vscode.extension.contributes.debuggers.strings', "UI strings contributed by this debug adapter."),
                        type: 'object',
                        properties: {
                            unverifiedBreakpoints: {
                                description: nls.localize('vscode.extension.contributes.debuggers.strings.unverifiedBreakpoints', "When there are unverified breakpoints in a language supported by this debug adapter, this message will appear on the breakpoint hover and in the breakpoints view. Markdown and command links are supported."),
                                type: 'string'
                            }
                        }
                    }
                }
            }
        }
    });
    // breakpoints extension point #9037
    exports.breakpointsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'breakpoints',
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.breakpoints', 'Contributes breakpoints.'),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '' }] }],
            items: {
                type: 'object',
                additionalProperties: false,
                defaultSnippets: [{ body: { language: '' } }],
                properties: {
                    language: {
                        description: nls.localize('vscode.extension.contributes.breakpoints.language', "Allow breakpoints for this language."),
                        type: 'string'
                    },
                    when: {
                        description: nls.localize('vscode.extension.contributes.breakpoints.when', "Condition which must be true to enable breakpoints in this language. Consider matching this to the debugger when clause as appropriate."),
                        type: 'string',
                        default: ''
                    }
                }
            }
        }
    });
    // debug general schema
    exports.presentationSchema = {
        type: 'object',
        description: nls.localize('presentation', "Presentation options on how to show this configuration in the debug configuration dropdown and the command palette."),
        properties: {
            hidden: {
                type: 'boolean',
                default: false,
                description: nls.localize('presentation.hidden', "Controls if this configuration should be shown in the configuration dropdown and the command palette.")
            },
            group: {
                type: 'string',
                default: '',
                description: nls.localize('presentation.group', "Group that this configuration belongs to. Used for grouping and sorting in the configuration dropdown and the command palette.")
            },
            order: {
                type: 'number',
                default: 1,
                description: nls.localize('presentation.order', "Order of this configuration within a group. Used for grouping and sorting in the configuration dropdown and the command palette.")
            }
        },
        default: {
            hidden: false,
            group: '',
            order: 1
        }
    };
    const defaultCompound = { name: 'Compound', configurations: [] };
    exports.launchSchema = {
        id: configuration_1.launchSchemaId,
        type: 'object',
        title: nls.localize('app.launch.json.title', "Launch"),
        allowTrailingCommas: true,
        allowComments: true,
        required: [],
        default: { version: '0.2.0', configurations: [], compounds: [] },
        properties: {
            version: {
                type: 'string',
                description: nls.localize('app.launch.json.version', "Version of this file format."),
                default: '0.2.0'
            },
            configurations: {
                type: 'array',
                description: nls.localize('app.launch.json.configurations', "List of configurations. Add new configurations or edit existing ones by using IntelliSense."),
                items: {
                    defaultSnippets: [],
                    'type': 'object',
                    oneOf: []
                }
            },
            compounds: {
                type: 'array',
                description: nls.localize('app.launch.json.compounds', "List of compounds. Each compound references multiple configurations which will get launched together."),
                items: {
                    type: 'object',
                    required: ['name', 'configurations'],
                    properties: {
                        name: {
                            type: 'string',
                            description: nls.localize('app.launch.json.compound.name', "Name of compound. Appears in the launch configuration drop down menu.")
                        },
                        presentation: exports.presentationSchema,
                        configurations: {
                            type: 'array',
                            default: [],
                            items: {
                                oneOf: [{
                                        enum: [],
                                        description: nls.localize('useUniqueNames', "Please use unique configuration names.")
                                    }, {
                                        type: 'object',
                                        required: ['name'],
                                        properties: {
                                            name: {
                                                enum: [],
                                                description: nls.localize('app.launch.json.compound.name', "Name of compound. Appears in the launch configuration drop down menu.")
                                            },
                                            folder: {
                                                enum: [],
                                                description: nls.localize('app.launch.json.compound.folder', "Name of folder in which the compound is located.")
                                            }
                                        }
                                    }]
                            },
                            description: nls.localize('app.launch.json.compounds.configurations', "Names of configurations that will be started as part of this compound.")
                        },
                        stopAll: {
                            type: 'boolean',
                            default: false,
                            description: nls.localize('app.launch.json.compound.stopAll', "Controls whether manually terminating one session will stop all of the compound sessions.")
                        },
                        preLaunchTask: {
                            type: 'string',
                            default: '',
                            description: nls.localize('compoundPrelaunchTask', "Task to run before any of the compound configurations start.")
                        }
                    },
                    default: defaultCompound
                },
                default: [
                    defaultCompound
                ]
            },
            inputs: configurationResolverSchema_1.inputsSchema.definitions.inputs
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTY2hlbWFzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2RlYnVnU2NoZW1hcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsNEJBQTRCO0lBQ2YsUUFBQSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBMEI7UUFDdEgsY0FBYyxFQUFFLFdBQVc7UUFDM0Isb0JBQW9CLEVBQUUsQ0FBQyxXQUFXLENBQUM7UUFDbkMsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0NBQXdDLEVBQUUsNkJBQTZCLENBQUM7WUFDbEcsSUFBSSxFQUFFLE9BQU87WUFDYixlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxLQUFLLEVBQUU7Z0JBQ04sb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ25FLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUU7d0JBQ0wsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUsMkNBQTJDLENBQUM7d0JBQ3JILElBQUksRUFBRSxRQUFRO3FCQUNkO29CQUNELEtBQUssRUFBRTt3QkFDTixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsRUFBRSxzQ0FBc0MsQ0FBQzt3QkFDakgsSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsT0FBTyxF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