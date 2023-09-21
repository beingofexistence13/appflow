/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/workbench/contrib/tasks/common/problemMatcher", "./jsonSchemaCommon"], function (require, exports, nls, Objects, problemMatcher_1, jsonSchemaCommon_1) {
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
                                deprecationMessage: nls.localize('JsonSchema.version.deprecated', 'Task version 0.1.0 is deprecated. Please use 2.0.0'),
                                description: nls.localize('JsonSchema.version', 'The config\'s version number')
                            },
                            _runner: {
                                deprecationMessage: nls.localize('JsonSchema._runner', 'The runner has graduated. Use the official runner property')
                            },
                            runner: {
                                type: 'string',
                                enum: ['process', 'terminal'],
                                default: 'process',
                                description: nls.localize('JsonSchema.runner', 'Defines whether the task is executed as a process and the output is shown in the output window or inside the terminal.')
                            },
                            windows: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize('JsonSchema.windows', 'Windows specific command configuration')
                            },
                            osx: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize('JsonSchema.mac', 'Mac specific command configuration')
                            },
                            linux: {
                                $ref: '#/definitions/taskRunnerConfiguration',
                                description: nls.localize('JsonSchema.linux', 'Linux specific command configuration')
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
        description: nls.localize('JsonSchema.shell', 'Specifies whether the command is a shell command or an external program. Defaults to false if omitted.')
    };
    schema.definitions = Objects.deepClone(jsonSchemaCommon_1.default.definitions);
    const definitions = schema.definitions;
    definitions['commandConfiguration']['properties']['isShellCommand'] = Objects.deepClone(shellCommand);
    definitions['taskDescription']['properties']['isShellCommand'] = Objects.deepClone(shellCommand);
    definitions['taskRunnerConfiguration']['properties']['isShellCommand'] = Objects.deepClone(shellCommand);
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
    problemMatcher_1.ProblemMatcherRegistry.onReady().then(() => {
        try {
            const matcherIds = problemMatcher_1.ProblemMatcherRegistry.keys().map(key => '$' + key);
            definitions.problemMatcherType1.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType1.oneOf[2].items.anyOf[1].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    });
    exports.default = schema;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvblNjaGVtYV92MS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2NvbW1vbi9qc29uU2NoZW1hX3YxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLE1BQU0sTUFBTSxHQUFnQjtRQUMzQixLQUFLLEVBQUU7WUFDTjtnQkFDQyxLQUFLLEVBQUU7b0JBQ047d0JBQ0MsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDO3dCQUNyQixVQUFVLEVBQUU7NEJBQ1gsT0FBTyxFQUFFO2dDQUNSLElBQUksRUFBRSxRQUFRO2dDQUNkLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztnQ0FDZixrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLG9EQUFvRCxDQUFDO2dDQUN2SCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSw4QkFBOEIsQ0FBQzs2QkFDL0U7NEJBQ0QsT0FBTyxFQUFFO2dDQUNSLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsNERBQTRELENBQUM7NkJBQ3BIOzRCQUNELE1BQU0sRUFBRTtnQ0FDUCxJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO2dDQUM3QixPQUFPLEVBQUUsU0FBUztnQ0FDbEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsd0hBQXdILENBQUM7NkJBQ3hLOzRCQUNELE9BQU8sRUFBRTtnQ0FDUixJQUFJLEVBQUUsdUNBQXVDO2dDQUM3QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx3Q0FBd0MsQ0FBQzs2QkFDekY7NEJBQ0QsR0FBRyxFQUFFO2dDQUNKLElBQUksRUFBRSx1Q0FBdUM7Z0NBQzdDLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG9DQUFvQyxDQUFDOzZCQUNqRjs0QkFDRCxLQUFLLEVBQUU7Z0NBQ04sSUFBSSxFQUFFLHVDQUF1QztnQ0FDN0MsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsc0NBQXNDLENBQUM7NkJBQ3JGO3lCQUNEO3FCQUNEO29CQUNEO3dCQUNDLElBQUksRUFBRSx1Q0FBdUM7cUJBQzdDO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUM7SUFFRixNQUFNLFlBQVksR0FBZ0I7UUFDakMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLHdHQUF3RyxDQUFDO0tBQ3ZKLENBQUM7SUFFRixNQUFNLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsMEJBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBWSxDQUFDO0lBQ3hDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFlBQVksQ0FBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2RyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxZQUFZLENBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLENBQUMsWUFBWSxDQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDckQsTUFBTSxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUN6QixXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxhQUFhLENBQUMsT0FBWTtRQUNsQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUMvQjthQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQ3ZDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUN4QztZQUNELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDdEQsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjtZQUNGLENBQUMsQ0FBQyxDQUFDO1NBQ0g7SUFDRixDQUFDO0lBQ0QsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXRCLHVDQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDMUMsSUFBSTtZQUNILE1BQU0sVUFBVSxHQUFHLHVDQUFzQixDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN2RSxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDM0QsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFxQixDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1NBQzdGO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7U0FDckQ7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILGtCQUFlLE1BQU0sQ0FBQyJ9