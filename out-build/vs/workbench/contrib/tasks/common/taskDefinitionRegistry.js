/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/types", "vs/base/common/objects", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/event"], function (require, exports, nls, Types, Objects, extensionsRegistry_1, contextkey_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$F = void 0;
    const taskDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            type: {
                type: 'string',
                description: nls.localize(0, null)
            },
            required: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            properties: {
                type: 'object',
                description: nls.localize(1, null),
                additionalProperties: {
                    $ref: 'http://json-schema.org/draft-07/schema#'
                }
            },
            when: {
                type: 'string',
                markdownDescription: nls.localize(2, null),
                default: ''
            }
        }
    };
    var Configuration;
    (function (Configuration) {
        function from(value, extensionId, messageCollector) {
            if (!value) {
                return undefined;
            }
            const taskType = Types.$jf(value.type) ? value.type : undefined;
            if (!taskType || taskType.length === 0) {
                messageCollector.error(nls.localize(3, null));
                return undefined;
            }
            const required = [];
            if (Array.isArray(value.required)) {
                for (const element of value.required) {
                    if (Types.$jf(element)) {
                        required.push(element);
                    }
                }
            }
            return {
                extensionId: extensionId.value,
                taskType, required: required,
                properties: value.properties ? Objects.$Vm(value.properties) : {},
                when: value.when ? contextkey_1.$Ii.deserialize(value.when) : undefined
            };
        }
        Configuration.from = from;
    })(Configuration || (Configuration = {}));
    const taskDefinitionsExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'taskDefinitions',
        activationEventsGenerator: (contributions, result) => {
            for (const task of contributions) {
                if (task.type) {
                    result.push(`onTaskType:${task.type}`);
                }
            }
        },
        jsonSchema: {
            description: nls.localize(4, null),
            type: 'array',
            items: taskDefinitionSchema
        }
    });
    class TaskDefinitionRegistryImpl {
        constructor() {
            this.d = new event_1.$fd();
            this.onDefinitionsChanged = this.d.event;
            this.a = Object.create(null);
            this.b = new Promise((resolve, reject) => {
                taskDefinitionsExtPoint.setHandler((extensions, delta) => {
                    this.c = undefined;
                    try {
                        for (const extension of delta.removed) {
                            const taskTypes = extension.value;
                            for (const taskType of taskTypes) {
                                if (this.a && taskType.type && this.a[taskType.type]) {
                                    delete this.a[taskType.type];
                                }
                            }
                        }
                        for (const extension of delta.added) {
                            const taskTypes = extension.value;
                            for (const taskType of taskTypes) {
                                const type = Configuration.from(taskType, extension.description.identifier, extension.collector);
                                if (type) {
                                    this.a[type.taskType] = type;
                                }
                            }
                        }
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this.d.fire();
                        }
                    }
                    catch (error) {
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            return this.b;
        }
        get(key) {
            return this.a[key];
        }
        all() {
            return Object.keys(this.a).map(key => this.a[key]);
        }
        getJsonSchema() {
            if (this.c === undefined) {
                const schemas = [];
                for (const definition of this.all()) {
                    const schema = {
                        type: 'object',
                        additionalProperties: false
                    };
                    if (definition.required.length > 0) {
                        schema.required = definition.required.slice(0);
                    }
                    if (definition.properties !== undefined) {
                        schema.properties = Objects.$Vm(definition.properties);
                    }
                    else {
                        schema.properties = Object.create(null);
                    }
                    schema.properties.type = {
                        type: 'string',
                        enum: [definition.taskType]
                    };
                    schemas.push(schema);
                }
                this.c = { oneOf: schemas };
            }
            return this.c;
        }
    }
    exports.$$F = new TaskDefinitionRegistryImpl();
});
//# sourceMappingURL=taskDefinitionRegistry.js.map