/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/jsonSchema_v1", "vs/base/common/objects", "vs/workbench/contrib/tasks/common/problemMatcher", "./jsonSchemaCommon"], function (require, exports, nls, Objects, problemMatcher_1, jsonSchemaCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const schema = {
        oneOf: [
            {
                allOf: [
                    {
                        type: 'object',
                        required: ['version'],
                        properties: {
                            version: {
                                type: 'string',
                                enum: ['0.1.0'],
                                deprecationMessage: nls.localize(0, null),
                                description: nls.localize(1, null)
                            },
                            _runner: {
                                deprecationMessage: nls.localize(2, null)
                            },
                            runner: {
                                type: 'string',
                                enum: ['process', 'terminal'],
                                default: 'process',
                                description: nls.localize(3, null)
                            },
                            windows: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize(4, null)
                            },
                            osx: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize(5, null)
                            },
                            linux: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize(6, null)
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
    const shellCommand = {
        type: 'boolean',
        default: true,
        description: nls.localize(7, null)
    };
    schema.definitions = Objects.$Vm(jsonSchemaCommon_1.default.definitions);
    const definitions = schema.definitions;
    definitions['commandConfiguration']['properties']['isShellCommand'] = Objects.$Vm(shellCommand);
    definitions['taskDescription']['properties']['isShellCommand'] = Objects.$Vm(shellCommand);
    definitions['taskRunnerConfiguration']['properties']['isShellCommand'] = Objects.$Vm(shellCommand);
    Object.getOwnPropertyNames(definitions).forEach(key => {
        const newKey = key + '1';
        definitions[newKey] = definitions[key];
        delete definitions[key];
    });
    function fixReferences(literal) {
        if (Array.isArray(literal)) {
            literal.forEach(fixReferences);
        }
        else if (typeof literal === 'object') {
            if (literal['$ref']) {
                literal['$ref'] = literal['$ref'] + '1';
            }
            Object.getOwnPropertyNames(literal).forEach(property => {
                const value = literal[property];
                if (Array.isArray(value) || typeof value === 'object') {
                    fixReferences(value);
                }
            });
        }
    }
    fixReferences(schema);
    problemMatcher_1.$0F.onReady().then(() => {
        try {
            const matcherIds = problemMatcher_1.$0F.keys().map(key => '$' + key);
            definitions.problemMatcherType1.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType1.oneOf[2].items.anyOf[1].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    });
    exports.default = schema;
});
//# sourceMappingURL=jsonSchema_v1.js.map