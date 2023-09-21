/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inputsSchema = void 0;
    const idDescription = nls.localize('JsonSchema.input.id', "The input's id is used to associate an input with a variable of the form ${input:id}.");
    const typeDescription = nls.localize('JsonSchema.input.type', "The type of user input prompt to use.");
    const descriptionDescription = nls.localize('JsonSchema.input.description', "The description is shown when the user is prompted for input.");
    const defaultDescription = nls.localize('JsonSchema.input.default', "The default value for the input.");
    exports.inputsSchema = {
        definitions: {
            inputs: {
                type: 'array',
                description: nls.localize('JsonSchema.inputs', 'User inputs. Used for defining user input prompts, such as free string input or a choice from several options.'),
                items: {
                    oneOf: [
                        {
                            type: 'object',
                            required: ['id', 'type', 'description'],
                            additionalProperties: false,
                            properties: {
                                id: {
                                    type: 'string',
                                    description: idDescription
                                },
                                type: {
                                    type: 'string',
                                    description: typeDescription,
                                    enum: ['promptString'],
                                    enumDescriptions: [
                                        nls.localize('JsonSchema.input.type.promptString', "The 'promptString' type opens an input box to ask the user for input."),
                                    ]
                                },
                                description: {
                                    type: 'string',
                                    description: descriptionDescription
                                },
                                default: {
                                    type: 'string',
                                    description: defaultDescription
                                },
                                password: {
                                    type: 'boolean',
                                    description: nls.localize('JsonSchema.input.password', "Controls if a password input is shown. Password input hides the typed text."),
                                },
                            }
                        },
                        {
                            type: 'object',
                            required: ['id', 'type', 'description', 'options'],
                            additionalProperties: false,
                            properties: {
                                id: {
                                    type: 'string',
                                    description: idDescription
                                },
                                type: {
                                    type: 'string',
                                    description: typeDescription,
                                    enum: ['pickString'],
                                    enumDescriptions: [
                                        nls.localize('JsonSchema.input.type.pickString', "The 'pickString' type shows a selection list."),
                                    ]
                                },
                                description: {
                                    type: 'string',
                                    description: descriptionDescription
                                },
                                default: {
                                    type: 'string',
                                    description: defaultDescription
                                },
                                options: {
                                    type: 'array',
                                    description: nls.localize('JsonSchema.input.options', "An array of strings that defines the options for a quick pick."),
                                    items: {
                                        oneOf: [
                                            {
                                                type: 'string'
                                            },
                                            {
                                                type: 'object',
                                                required: ['value'],
                                                additionalProperties: false,
                                                properties: {
                                                    label: {
                                                        type: 'string',
                                                        description: nls.localize('JsonSchema.input.pickString.optionLabel', "Label for the option.")
                                                    },
                                                    value: {
                                                        type: 'string',
                                                        description: nls.localize('JsonSchema.input.pickString.optionValue', "Value for the option.")
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            type: 'object',
                            required: ['id', 'type', 'command'],
                            additionalProperties: false,
                            properties: {
                                id: {
                                    type: 'string',
                                    description: idDescription
                                },
                                type: {
                                    type: 'string',
                                    description: typeDescription,
                                    enum: ['command'],
                                    enumDescriptions: [
                                        nls.localize('JsonSchema.input.type.command', "The 'command' type executes a command."),
                                    ]
                                },
                                command: {
                                    type: 'string',
                                    description: nls.localize('JsonSchema.input.command.command', "The command to execute for this input variable.")
                                },
                                args: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            description: nls.localize('JsonSchema.input.command.args', "Optional arguments passed to the command.")
                                        },
                                        {
                                            type: 'array',
                                            description: nls.localize('JsonSchema.input.command.args', "Optional arguments passed to the command.")
                                        },
                                        {
                                            type: 'string',
                                            description: nls.localize('JsonSchema.input.command.args', "Optional arguments passed to the command.")
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyU2NoZW1hLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb25SZXNvbHZlci9jb21tb24vY29uZmlndXJhdGlvblJlc29sdmVyU2NoZW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHVGQUF1RixDQUFDLENBQUM7SUFDbkosTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3ZHLE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSwrREFBK0QsQ0FBQyxDQUFDO0lBQzdJLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO0lBRzNGLFFBQUEsWUFBWSxHQUFnQjtRQUN4QyxXQUFXLEVBQUU7WUFDWixNQUFNLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsZ0hBQWdILENBQUM7Z0JBQ2hLLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUU7d0JBQ047NEJBQ0MsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUM7NEJBQ3ZDLG9CQUFvQixFQUFFLEtBQUs7NEJBQzNCLFVBQVUsRUFBRTtnQ0FDWCxFQUFFLEVBQUU7b0NBQ0gsSUFBSSxFQUFFLFFBQVE7b0NBQ2QsV0FBVyxFQUFFLGFBQWE7aUNBQzFCO2dDQUNELElBQUksRUFBRTtvQ0FDTCxJQUFJLEVB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