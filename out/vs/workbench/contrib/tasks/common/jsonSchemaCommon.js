/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/tasks/common/problemMatcher"], function (require, exports, nls, problemMatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const schema = {
        definitions: {
            showOutputType: {
                type: 'string',
                enum: ['always', 'silent', 'never']
            },
            options: {
                type: 'object',
                description: nls.localize('JsonSchema.options', 'Additional command options'),
                properties: {
                    cwd: {
                        type: 'string',
                        description: nls.localize('JsonSchema.options.cwd', 'The current working directory of the executed program or script. If omitted Code\'s current workspace root is used.')
                    },
                    env: {
                        type: 'object',
                        additionalProperties: {
                            type: 'string'
                        },
                        description: nls.localize('JsonSchema.options.env', 'The environment of the executed program or shell. If omitted the parent process\' environment is used.')
                    }
                },
                additionalProperties: {
                    type: ['string', 'array', 'object']
                }
            },
            problemMatcherType: {
                oneOf: [
                    {
                        type: 'string',
                        errorMessage: nls.localize('JsonSchema.tasks.matcherError', 'Unrecognized problem matcher. Is the extension that contributes this problem matcher installed?')
                    },
                    problemMatcher_1.Schemas.LegacyProblemMatcher,
                    {
                        type: 'array',
                        items: {
                            anyOf: [
                                {
                                    type: 'string',
                                    errorMessage: nls.localize('JsonSchema.tasks.matcherError', 'Unrecognized problem matcher. Is the extension that contributes this problem matcher installed?')
                                },
                                problemMatcher_1.Schemas.LegacyProblemMatcher
                            ]
                        }
                    }
                ]
            },
            shellConfiguration: {
                type: 'object',
                additionalProperties: false,
                description: nls.localize('JsonSchema.shellConfiguration', 'Configures the shell to be used.'),
                properties: {
                    executable: {
                        type: 'string',
                        description: nls.localize('JsonSchema.shell.executable', 'The shell to be used.')
                    },
                    args: {
                        type: 'array',
                        description: nls.localize('JsonSchema.shell.args', 'The shell arguments.'),
                        items: {
                            type: 'string'
                        }
                    }
                }
            },
            commandConfiguration: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    command: {
                        type: 'string',
                        description: nls.localize('JsonSchema.command', 'The command to be executed. Can be an external program or a shell command.')
                    },
                    args: {
                        type: 'array',
                        description: nls.localize('JsonSchema.tasks.args', 'Arguments passed to the command when this task is invoked.'),
                        items: {
                            type: 'string'
                        }
                    },
                    options: {
                        $ref: '#/definitions/options'
                    }
                }
            },
            taskDescription: {
                type: 'object',
                required: ['taskName'],
                additionalProperties: false,
                properties: {
                    taskName: {
                        type: 'string',
                        description: nls.localize('JsonSchema.tasks.taskName', "The task's name")
                    },
                    command: {
                        type: 'string',
                        description: nls.localize('JsonSchema.command', 'The command to be executed. Can be an external program or a shell command.')
                    },
                    args: {
                        type: 'array',
                        description: nls.localize('JsonSchema.tasks.args', 'Arguments passed to the command when this task is invoked.'),
                        items: {
                            type: 'string'
                        }
                    },
                    options: {
                        $ref: '#/definitions/options'
                    },
                    windows: {
                        anyOf: [
                            {
                                $ref: '#/definitions/commandConfiguration',
                                description: nls.localize('JsonSchema.tasks.windows', 'Windows specific command configuration'),
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
                                    }
                                }
                            }
                        ]
                    },
                    osx: {
                        anyOf: [
                            {
                                $ref: '#/definitions/commandConfiguration',
                                description: nls.localize('JsonSchema.tasks.mac', 'Mac specific command configuration')
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
                                    }
                                }
                            }
                        ]
                    },
                    linux: {
                        anyOf: [
                            {
                                $ref: '#/definitions/commandConfiguration',
                                description: nls.localize('JsonSchema.tasks.linux', 'Linux specific command configuration')
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
                                    }
                                }
                            }
                        ]
                    },
                    suppressTaskName: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.tasks.suppressTaskName', 'Controls whether the task name is added as an argument to the command. If omitted the globally defined value is used.'),
                        default: true
                    },
                    showOutput: {
                        $ref: '#/definitions/showOutputType',
                        description: nls.localize('JsonSchema.tasks.showOutput', 'Controls whether the output of the running task is shown or not. If omitted the globally defined value is used.')
                    },
                    echoCommand: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.echoCommand', 'Controls whether the executed command is echoed to the output. Default is false.'),
                        default: true
                    },
                    isWatching: {
                        type: 'boolean',
                        deprecationMessage: nls.localize('JsonSchema.tasks.watching.deprecation', 'Deprecated. Use isBackground instead.'),
                        description: nls.localize('JsonSchema.tasks.watching', 'Whether the executed task is kept alive and is watching the file system.'),
                        default: true
                    },
                    isBackground: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.tasks.background', 'Whether the executed task is kept alive and is running in the background.'),
                        default: true
                    },
                    promptOnClose: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.tasks.promptOnClose', 'Whether the user is prompted when VS Code closes with a running task.'),
                        default: false
                    },
                    isBuildCommand: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.tasks.build', 'Maps this task to Code\'s default build command.'),
                        default: true
                    },
                    isTestCommand: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.tasks.test', 'Maps this task to Code\'s default test command.'),
                        default: true
                    },
                    problemMatcher: {
                        $ref: '#/definitions/problemMatcherType',
                        description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
                    }
                }
            },
            taskRunnerConfiguration: {
                type: 'object',
                required: [],
                properties: {
                    command: {
                        type: 'string',
                        description: nls.localize('JsonSchema.command', 'The command to be executed. Can be an external program or a shell command.')
                    },
                    args: {
                        type: 'array',
                        description: nls.localize('JsonSchema.args', 'Additional arguments passed to the command.'),
                        items: {
                            type: 'string'
                        }
                    },
                    options: {
                        $ref: '#/definitions/options'
                    },
                    showOutput: {
                        $ref: '#/definitions/showOutputType',
                        description: nls.localize('JsonSchema.showOutput', 'Controls whether the output of the running task is shown or not. If omitted \'always\' is used.')
                    },
                    isWatching: {
                        type: 'boolean',
                        deprecationMessage: nls.localize('JsonSchema.watching.deprecation', 'Deprecated. Use isBackground instead.'),
                        description: nls.localize('JsonSchema.watching', 'Whether the executed task is kept alive and is watching the file system.'),
                        default: true
                    },
                    isBackground: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.background', 'Whether the executed task is kept alive and is running in the background.'),
                        default: true
                    },
                    promptOnClose: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.promptOnClose', 'Whether the user is prompted when VS Code closes with a running background task.'),
                        default: false
                    },
                    echoCommand: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.echoCommand', 'Controls whether the executed command is echoed to the output. Default is false.'),
                        default: true
                    },
                    suppressTaskName: {
                        type: 'boolean',
                        description: nls.localize('JsonSchema.suppressTaskName', 'Controls whether the task name is added as an argument to the command. Default is false.'),
                        default: true
                    },
                    taskSelector: {
                        type: 'string',
                        description: nls.localize('JsonSchema.taskSelector', 'Prefix to indicate that an argument is task.')
                    },
                    problemMatcher: {
                        $ref: '#/definitions/problemMatcherType',
                        description: nls.localize('JsonSchema.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
                    },
                    tasks: {
                        type: 'array',
                        description: nls.localize('JsonSchema.tasks', 'The task configurations. Usually these are enrichments of task already defined in the external task runner.'),
                        items: {
                            type: 'object',
                            $ref: '#/definitions/taskDescription'
                        }
                    }
                }
            }
        }
    };
    exports.default = schema;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvblNjaGVtYUNvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2NvbW1vbi9qc29uU2NoZW1hQ29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLE1BQU0sTUFBTSxHQUFnQjtRQUMzQixXQUFXLEVBQUU7WUFDWixjQUFjLEVBQUU7Z0JBQ2YsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7YUFDbkM7WUFDRCxPQUFPLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsNEJBQTRCLENBQUM7Z0JBQzdFLFVBQVUsRUFBRTtvQkFDWCxHQUFHLEVBQUU7d0JBQ0osSUFBSSxFQUFFLFFBQVE7d0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUscUhBQXFILENBQUM7cUJBQzFLO29CQUNELEdBQUcsRUFBRTt3QkFDSixJQUFJLEVBQUUsUUFBUTt3QkFDZCxvQkFBb0IsRUFBRTs0QkFDckIsSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7d0JBQ0QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsd0dBQXdHLENBQUM7cUJBQzdKO2lCQUNEO2dCQUNELG9CQUFvQixFQUFFO29CQUNyQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztpQkFDbkM7YUFDRDtZQUNELGtCQUFrQixFQUFFO2dCQUNuQixLQUFLLEVBQUU7b0JBQ047d0JBQ0MsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsWUFBWSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsaUdBQWlHLENB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