/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/jsonSchema_v2", "vs/base/common/objects", "./jsonSchemaCommon", "vs/workbench/contrib/tasks/common/problemMatcher", "./taskDefinitionRegistry", "vs/workbench/services/configurationResolver/common/configurationResolverUtils", "vs/workbench/services/configurationResolver/common/configurationResolverSchema", "vs/base/common/codicons"], function (require, exports, nls, Objects, jsonSchemaCommon_1, problemMatcher_1, taskDefinitionRegistry_1, ConfigurationResolverUtils, configurationResolverSchema_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rXb = exports.$qXb = void 0;
    function fixReferences(literal) {
        if (Array.isArray(literal)) {
            literal.forEach(fixReferences);
        }
        else if (typeof literal === 'object') {
            if (literal['$ref']) {
                literal['$ref'] = literal['$ref'] + '2';
            }
            Object.getOwnPropertyNames(literal).forEach(property => {
                const value = literal[property];
                if (Array.isArray(value) || typeof value === 'object') {
                    fixReferences(value);
                }
            });
        }
    }
    const shellCommand = {
        anyOf: [
            {
                type: 'boolean',
                default: true,
                description: nls.localize(0, null)
            },
            {
                $ref: '#/definitions/shellConfiguration'
            }
        ],
        deprecationMessage: nls.localize(1, null)
    };
    const hide = {
        type: 'boolean',
        description: nls.localize(2, null),
        default: true
    };
    const taskIdentifier = {
        type: 'object',
        additionalProperties: true,
        properties: {
            type: {
                type: 'string',
                description: nls.localize(3, null)
            }
        }
    };
    const dependsOn = {
        anyOf: [
            {
                type: 'string',
                description: nls.localize(4, null)
            },
            taskIdentifier,
            {
                type: 'array',
                description: nls.localize(5, null),
                items: {
                    anyOf: [
                        {
                            type: 'string',
                        },
                        taskIdentifier
                    ]
                }
            }
        ],
        description: nls.localize(6, null)
    };
    const dependsOrder = {
        type: 'string',
        enum: ['parallel', 'sequence'],
        enumDescriptions: [
            nls.localize(7, null),
            nls.localize(8, null),
        ],
        default: 'parallel',
        description: nls.localize(9, null)
    };
    const detail = {
        type: 'string',
        description: nls.localize(10, null)
    };
    const icon = {
        type: 'object',
        description: nls.localize(11, null),
        properties: {
            id: {
                description: nls.localize(12, null),
                type: ['string', 'null'],
                enum: Array.from((0, codicons_1.$Oj)(), icon => icon.id),
                markdownEnumDescriptions: Array.from((0, codicons_1.$Oj)(), icon => `$(${icon.id})`),
            },
            color: {
                description: nls.localize(13, null),
                type: ['string', 'null'],
                enum: [
                    'terminal.ansiBlack',
                    'terminal.ansiRed',
                    'terminal.ansiGreen',
                    'terminal.ansiYellow',
                    'terminal.ansiBlue',
                    'terminal.ansiMagenta',
                    'terminal.ansiCyan',
                    'terminal.ansiWhite'
                ],
            },
        }
    };
    const presentation = {
        type: 'object',
        default: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
            showReuseMessage: true,
            clear: false,
        },
        description: nls.localize(14, null),
        additionalProperties: false,
        properties: {
            echo: {
                type: 'boolean',
                default: true,
                description: nls.localize(15, null)
            },
            focus: {
                type: 'boolean',
                default: false,
                description: nls.localize(16, null)
            },
            revealProblems: {
                type: 'string',
                enum: ['always', 'onProblem', 'never'],
                enumDescriptions: [
                    nls.localize(17, null),
                    nls.localize(18, null),
                    nls.localize(19, null),
                ],
                default: 'never',
                description: nls.localize(20, null)
            },
            reveal: {
                type: 'string',
                enum: ['always', 'silent', 'never'],
                enumDescriptions: [
                    nls.localize(21, null),
                    nls.localize(22, null),
                    nls.localize(23, null),
                ],
                default: 'always',
                description: nls.localize(24, null)
            },
            panel: {
                type: 'string',
                enum: ['shared', 'dedicated', 'new'],
                default: 'shared',
                description: nls.localize(25, null)
            },
            showReuseMessage: {
                type: 'boolean',
                default: true,
                description: nls.localize(26, null)
            },
            clear: {
                type: 'boolean',
                default: false,
                description: nls.localize(27, null)
            },
            group: {
                type: 'string',
                description: nls.localize(28, null)
            },
            close: {
                type: 'boolean',
                description: nls.localize(29, null)
            }
        }
    };
    const terminal = Objects.$Vm(presentation);
    terminal.deprecationMessage = nls.localize(30, null);
    const groupStrings = {
        type: 'string',
        enum: [
            'build',
            'test',
            'none'
        ],
        enumDescriptions: [
            nls.localize(31, null),
            nls.localize(32, null),
            nls.localize(33, null)
        ],
        description: nls.localize(34, null)
    };
    const group = {
        oneOf: [
            groupStrings,
            {
                type: 'object',
                properties: {
                    kind: groupStrings,
                    isDefault: {
                        type: ['boolean', 'string'],
                        default: false,
                        description: nls.localize(35, null)
                    }
                }
            },
        ],
        defaultSnippets: [
            {
                body: { kind: 'build', isDefault: true },
                description: nls.localize(36, null)
            },
            {
                body: { kind: 'test', isDefault: true },
                description: nls.localize(37, null)
            }
        ],
        description: nls.localize(38, null)
    };
    const taskType = {
        type: 'string',
        enum: ['shell'],
        default: 'process',
        description: nls.localize(39, null)
    };
    const command = {
        oneOf: [
            {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: nls.localize(40, null)
                    }
                ]
            },
            {
                type: 'object',
                required: ['value', 'quoting'],
                properties: {
                    value: {
                        oneOf: [
                            {
                                type: 'string'
                            },
                            {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: nls.localize(41, null)
                            }
                        ],
                        description: nls.localize(42, null)
                    },
                    quoting: {
                        type: 'string',
                        enum: ['escape', 'strong', 'weak'],
                        enumDescriptions: [
                            nls.localize(43, null),
                            nls.localize(44, null),
                            nls.localize(45, null),
                        ],
                        default: 'strong',
                        description: nls.localize(46, null)
                    }
                }
            }
        ],
        description: nls.localize(47, null)
    };
    const args = {
        type: 'array',
        items: {
            oneOf: [
                {
                    type: 'string',
                },
                {
                    type: 'object',
                    required: ['value', 'quoting'],
                    properties: {
                        value: {
                            type: 'string',
                            description: nls.localize(48, null)
                        },
                        quoting: {
                            type: 'string',
                            enum: ['escape', 'strong', 'weak'],
                            enumDescriptions: [
                                nls.localize(49, null),
                                nls.localize(50, null),
                                nls.localize(51, null),
                            ],
                            default: 'strong',
                            description: nls.localize(52, null)
                        }
                    }
                }
            ]
        },
        description: nls.localize(53, null)
    };
    const label = {
        type: 'string',
        description: nls.localize(54, null)
    };
    const version = {
        type: 'string',
        enum: ['2.0.0'],
        description: nls.localize(55, null)
    };
    const identifier = {
        type: 'string',
        description: nls.localize(56, null),
        deprecationMessage: nls.localize(57, null)
    };
    const runOptions = {
        type: 'object',
        additionalProperties: false,
        properties: {
            reevaluateOnRerun: {
                type: 'boolean',
                description: nls.localize(58, null),
                default: true
            },
            runOn: {
                type: 'string',
                enum: ['default', 'folderOpen'],
                description: nls.localize(59, null),
                default: 'default'
            },
            instanceLimit: {
                type: 'number',
                description: nls.localize(60, null),
                default: 1
            },
        },
        description: nls.localize(61, null)
    };
    const commonSchemaDefinitions = jsonSchemaCommon_1.default.definitions;
    const options = Objects.$Vm(commonSchemaDefinitions.options);
    const optionsProperties = options.properties;
    optionsProperties.shell = Objects.$Vm(commonSchemaDefinitions.shellConfiguration);
    const taskConfiguration = {
        type: 'object',
        additionalProperties: false,
        properties: {
            label: {
                type: 'string',
                description: nls.localize(62, null)
            },
            taskName: {
                type: 'string',
                description: nls.localize(63, null),
                deprecationMessage: nls.localize(64, null)
            },
            identifier: Objects.$Vm(identifier),
            group: Objects.$Vm(group),
            isBackground: {
                type: 'boolean',
                description: nls.localize(65, null),
                default: true
            },
            promptOnClose: {
                type: 'boolean',
                description: nls.localize(66, null),
                default: false
            },
            presentation: Objects.$Vm(presentation),
            icon: Objects.$Vm(icon),
            hide: Objects.$Vm(hide),
            options: options,
            problemMatcher: {
                $ref: '#/definitions/problemMatcherType',
                description: nls.localize(67, null)
            },
            runOptions: Objects.$Vm(runOptions),
            dependsOn: Objects.$Vm(dependsOn),
            dependsOrder: Objects.$Vm(dependsOrder),
            detail: Objects.$Vm(detail),
        }
    };
    const taskDefinitions = [];
    taskDefinitionRegistry_1.$$F.onReady().then(() => {
        $qXb();
    });
    function $qXb() {
        for (const taskType of taskDefinitionRegistry_1.$$F.all()) {
            // Check that we haven't already added this task type
            if (taskDefinitions.find(schema => {
                return schema.properties?.type?.enum?.find ? schema.properties?.type.enum.find(element => element === taskType.taskType) : undefined;
            })) {
                continue;
            }
            const schema = Objects.$Vm(taskConfiguration);
            const schemaProperties = schema.properties;
            // Since we do this after the schema is assigned we need to patch the refs.
            schemaProperties.type = {
                type: 'string',
                description: nls.localize(68, null),
                enum: [taskType.taskType]
            };
            if (taskType.required) {
                schema.required = taskType.required.slice();
            }
            else {
                schema.required = [];
            }
            // Customized tasks require that the task type be set.
            schema.required.push('type');
            if (taskType.properties) {
                for (const key of Object.keys(taskType.properties)) {
                    const property = taskType.properties[key];
                    schemaProperties[key] = Objects.$Vm(property);
                }
            }
            fixReferences(schema);
            taskDefinitions.push(schema);
        }
    }
    exports.$qXb = $qXb;
    const customize = Objects.$Vm(taskConfiguration);
    customize.properties.customize = {
        type: 'string',
        deprecationMessage: nls.localize(69, null)
    };
    if (!customize.required) {
        customize.required = [];
    }
    customize.required.push('customize');
    taskDefinitions.push(customize);
    const definitions = Objects.$Vm(commonSchemaDefinitions);
    const taskDescription = definitions.taskDescription;
    taskDescription.required = ['label'];
    const taskDescriptionProperties = taskDescription.properties;
    taskDescriptionProperties.label = Objects.$Vm(label);
    taskDescriptionProperties.command = Objects.$Vm(command);
    taskDescriptionProperties.args = Objects.$Vm(args);
    taskDescriptionProperties.isShellCommand = Objects.$Vm(shellCommand);
    taskDescriptionProperties.dependsOn = dependsOn;
    taskDescriptionProperties.hide = Objects.$Vm(hide);
    taskDescriptionProperties.dependsOrder = dependsOrder;
    taskDescriptionProperties.identifier = Objects.$Vm(identifier);
    taskDescriptionProperties.type = Objects.$Vm(taskType);
    taskDescriptionProperties.presentation = Objects.$Vm(presentation);
    taskDescriptionProperties.terminal = terminal;
    taskDescriptionProperties.icon = Objects.$Vm(icon);
    taskDescriptionProperties.group = Objects.$Vm(group);
    taskDescriptionProperties.runOptions = Objects.$Vm(runOptions);
    taskDescriptionProperties.detail = detail;
    taskDescriptionProperties.taskName.deprecationMessage = nls.localize(70, null);
    // Clone the taskDescription for process task before setting a default to prevent two defaults #115281
    const processTask = Objects.$Vm(taskDescription);
    taskDescription.default = {
        label: 'My Task',
        type: 'shell',
        command: 'echo Hello',
        problemMatcher: []
    };
    definitions.showOutputType.deprecationMessage = nls.localize(71, null);
    taskDescriptionProperties.echoCommand.deprecationMessage = nls.localize(72, null);
    taskDescriptionProperties.suppressTaskName.deprecationMessage = nls.localize(73, null);
    taskDescriptionProperties.isBuildCommand.deprecationMessage = nls.localize(74, null);
    taskDescriptionProperties.isTestCommand.deprecationMessage = nls.localize(75, null);
    // Process tasks are almost identical schema-wise to shell tasks, but they are required to have a command
    processTask.properties.type = {
        type: 'string',
        enum: ['process'],
        default: 'process',
        description: nls.localize(76, null)
    };
    processTask.required.push('command');
    processTask.required.push('type');
    taskDefinitions.push(processTask);
    taskDefinitions.push({
        $ref: '#/definitions/taskDescription'
    });
    const definitionsTaskRunnerConfigurationProperties = definitions.taskRunnerConfiguration.properties;
    const tasks = definitionsTaskRunnerConfigurationProperties.tasks;
    tasks.items = {
        oneOf: taskDefinitions
    };
    definitionsTaskRunnerConfigurationProperties.inputs = configurationResolverSchema_1.$JRb.definitions.inputs;
    definitions.commandConfiguration.properties.isShellCommand = Objects.$Vm(shellCommand);
    definitions.commandConfiguration.properties.args = Objects.$Vm(args);
    definitions.options.properties.shell = {
        $ref: '#/definitions/shellConfiguration'
    };
    definitionsTaskRunnerConfigurationProperties.isShellCommand = Objects.$Vm(shellCommand);
    definitionsTaskRunnerConfigurationProperties.type = Objects.$Vm(taskType);
    definitionsTaskRunnerConfigurationProperties.group = Objects.$Vm(group);
    definitionsTaskRunnerConfigurationProperties.presentation = Objects.$Vm(presentation);
    definitionsTaskRunnerConfigurationProperties.suppressTaskName.deprecationMessage = nls.localize(77, null);
    definitionsTaskRunnerConfigurationProperties.taskSelector.deprecationMessage = nls.localize(78, null);
    const osSpecificTaskRunnerConfiguration = Objects.$Vm(definitions.taskRunnerConfiguration);
    delete osSpecificTaskRunnerConfiguration.properties.tasks;
    osSpecificTaskRunnerConfiguration.additionalProperties = false;
    definitions.osSpecificTaskRunnerConfiguration = osSpecificTaskRunnerConfiguration;
    definitionsTaskRunnerConfigurationProperties.version = Objects.$Vm(version);
    const schema = {
        oneOf: [
            {
                'allOf': [
                    {
                        type: 'object',
                        required: ['version'],
                        properties: {
                            version: Objects.$Vm(version),
                            windows: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(79, null)
                            },
                            osx: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(80, null)
                            },
                            linux: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(81, null)
                            }
                        }
                    },
                    {
                        $ref: '#/definitions/taskRunnerConfiguration'
                    }
                ]
            }
        ]
    };
    schema.definitions = definitions;
    function deprecatedVariableMessage(schemaMap, property) {
        const mapAtProperty = schemaMap[property].properties;
        if (mapAtProperty) {
            Object.keys(mapAtProperty).forEach(name => {
                deprecatedVariableMessage(mapAtProperty, name);
            });
        }
        else {
            ConfigurationResolverUtils.$HRb(schemaMap[property]);
        }
    }
    Object.getOwnPropertyNames(definitions).forEach(key => {
        const newKey = key + '2';
        definitions[newKey] = definitions[key];
        delete definitions[key];
        deprecatedVariableMessage(definitions, newKey);
    });
    fixReferences(schema);
    function $rXb() {
        try {
            const matcherIds = problemMatcher_1.$0F.keys().map(key => '$' + key);
            definitions.problemMatcherType2.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType2.oneOf[2].items.anyOf[0].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    }
    exports.$rXb = $rXb;
    problemMatcher_1.$0F.onReady().then(() => {
        $rXb();
    });
    exports.default = schema;
});
//# sourceMappingURL=jsonSchema_v2.js.map