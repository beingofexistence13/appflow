/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/configurationResolver/common/configurationResolverSchema"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JRb = void 0;
    const idDescription = nls.localize(0, null);
    const typeDescription = nls.localize(1, null);
    const descriptionDescription = nls.localize(2, null);
    const defaultDescription = nls.localize(3, null);
    exports.$JRb = {
        definitions: {
            inputs: {
                type: 'array',
                description: nls.localize(4, null),
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
                                        nls.localize(5, null),
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
                                    description: nls.localize(6, null),
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
                                        nls.localize(7, null),
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
                                    description: nls.localize(8, null),
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
                                                        description: nls.localize(9, null)
                                                    },
                                                    value: {
                                                        type: 'string',
                                                        description: nls.localize(10, null)
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
                                        nls.localize(11, null),
                                    ]
                                },
                                command: {
                                    type: 'string',
                                    description: nls.localize(12, null)
                                },
                                args: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            description: nls.localize(13, null)
                                        },
                                        {
                                            type: 'array',
                                            description: nls.localize(14, null)
                                        },
                                        {
                                            type: 'string',
                                            description: nls.localize(15, null)
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
//# sourceMappingURL=configurationResolverSchema.js.map