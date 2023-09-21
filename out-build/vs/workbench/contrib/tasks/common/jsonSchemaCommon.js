/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/jsonSchemaCommon", "vs/workbench/contrib/tasks/common/problemMatcher"], function (require, exports, nls, problemMatcher_1) {
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
                description: nls.localize(0, null),
                properties: {
                    cwd: {
                        type: 'string',
                        description: nls.localize(1, null)
                    },
                    env: {
                        type: 'object',
                        additionalProperties: {
                            type: 'string'
                        },
                        description: nls.localize(2, null)
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
                        errorMessage: nls.localize(3, null)
                    },
                    problemMatcher_1.Schemas.LegacyProblemMatcher,
                    {
                        type: 'array',
                        items: {
                            anyOf: [
                                {
                                    type: 'string',
                                    errorMessage: nls.localize(4, null)
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
                description: nls.localize(5, null),
                properties: {
                    executable: {
                        type: 'string',
                        description: nls.localize(6, null)
                    },
                    args: {
                        type: 'array',
                        description: nls.localize(7, null),
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
                        description: nls.localize(8, null)
                    },
                    args: {
                        type: 'array',
                        description: nls.localize(9, null),
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
                        description: nls.localize(10, null)
                    },
                    command: {
                        type: 'string',
                        description: nls.localize(11, null)
                    },
                    args: {
                        type: 'array',
                        description: nls.localize(12, null),
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
                                description: nls.localize(13, null),
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize(14, null)
                                    }
                                }
                            }
                        ]
                    },
                    osx: {
                        anyOf: [
                            {
                                $ref: '#/definitions/commandConfiguration',
                                description: nls.localize(15, null)
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize(16, null)
                                    }
                                }
                            }
                        ]
                    },
                    linux: {
                        anyOf: [
                            {
                                $ref: '#/definitions/commandConfiguration',
                                description: nls.localize(17, null)
                            },
                            {
                                properties: {
                                    problemMatcher: {
                                        $ref: '#/definitions/problemMatcherType',
                                        description: nls.localize(18, null)
                                    }
                                }
                            }
                        ]
                    },
                    suppressTaskName: {
                        type: 'boolean',
                        description: nls.localize(19, null),
                        default: true
                    },
                    showOutput: {
                        $ref: '#/definitions/showOutputType',
                        description: nls.localize(20, null)
                    },
                    echoCommand: {
                        type: 'boolean',
                        description: nls.localize(21, null),
                        default: true
                    },
                    isWatching: {
                        type: 'boolean',
                        deprecationMessage: nls.localize(22, null),
                        description: nls.localize(23, null),
                        default: true
                    },
                    isBackground: {
                        type: 'boolean',
                        description: nls.localize(24, null),
                        default: true
                    },
                    promptOnClose: {
                        type: 'boolean',
                        description: nls.localize(25, null),
                        default: false
                    },
                    isBuildCommand: {
                        type: 'boolean',
                        description: nls.localize(26, null),
                        default: true
                    },
                    isTestCommand: {
                        type: 'boolean',
                        description: nls.localize(27, null),
                        default: true
                    },
                    problemMatcher: {
                        $ref: '#/definitions/problemMatcherType',
                        description: nls.localize(28, null)
                    }
                }
            },
            taskRunnerConfiguration: {
                type: 'object',
                required: [],
                properties: {
                    command: {
                        type: 'string',
                        description: nls.localize(29, null)
                    },
                    args: {
                        type: 'array',
                        description: nls.localize(30, null),
                        items: {
                            type: 'string'
                        }
                    },
                    options: {
                        $ref: '#/definitions/options'
                    },
                    showOutput: {
                        $ref: '#/definitions/showOutputType',
                        description: nls.localize(31, null)
                    },
                    isWatching: {
                        type: 'boolean',
                        deprecationMessage: nls.localize(32, null),
                        description: nls.localize(33, null),
                        default: true
                    },
                    isBackground: {
                        type: 'boolean',
                        description: nls.localize(34, null),
                        default: true
                    },
                    promptOnClose: {
                        type: 'boolean',
                        description: nls.localize(35, null),
                        default: false
                    },
                    echoCommand: {
                        type: 'boolean',
                        description: nls.localize(36, null),
                        default: true
                    },
                    suppressTaskName: {
                        type: 'boolean',
                        description: nls.localize(37, null),
                        default: true
                    },
                    taskSelector: {
                        type: 'string',
                        description: nls.localize(38, null)
                    },
                    problemMatcher: {
                        $ref: '#/definitions/problemMatcherType',
                        description: nls.localize(39, null)
                    },
                    tasks: {
                        type: 'array',
                        description: nls.localize(40, null),
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
//# sourceMappingURL=jsonSchemaCommon.js.map