/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/objects", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/event"], function (require, exports, nls, Types, Objects, extensionsRegistry_1, contextkey_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskDefinitionRegistry = void 0;
    const taskDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            type: {
                type: 'string',
                description: nls.localize('TaskDefinition.description', 'The actual task type. Please note that types starting with a \'$\' are reserved for internal usage.')
            },
            required: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            properties: {
                type: 'object',
                description: nls.localize('TaskDefinition.properties', 'Additional properties of the task type'),
                additionalProperties: {
                    $ref: 'http://json-schema.org/draft-07/schema#'
                }
            },
            when: {
                type: 'string',
                markdownDescription: nls.localize('TaskDefinition.when', 'Condition which must be true to enable this type of task. Consider using `shellExecutionSupported`, `processExecutionSupported`, and `customExecutionSupported` as appropriate for this task definition. See the [API documentation](https://code.visualstudio.com/api/extension-guides/task-provider#when-clause) for more information.'),
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
            const taskType = Types.isString(value.type) ? value.type : undefined;
            if (!taskType || taskType.length === 0) {
                messageCollector.error(nls.localize('TaskTypeConfiguration.noType', 'The task type configuration is missing the required \'taskType\' property'));
                return undefined;
            }
            const required = [];
            if (Array.isArray(value.required)) {
                for (const element of value.required) {
                    if (Types.isString(element)) {
                        required.push(element);
                    }
                }
            }
            return {
                extensionId: extensionId.value,
                taskType, required: required,
                properties: value.properties ? Objects.deepClone(value.properties) : {},
                when: value.when ? contextkey_1.ContextKeyExpr.deserialize(value.when) : undefined
            };
        }
        Configuration.from = from;
    })(Configuration || (Configuration = {}));
    const taskDefinitionsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'taskDefinitions',
        activationEventsGenerator: (contributions, result) => {
            for (const task of contributions) {
                if (task.type) {
                    result.push(`onTaskType:${task.type}`);
                }
            }
        },
        jsonSchema: {
            description: nls.localize('TaskDefinitionExtPoint', 'Contributes task kinds'),
            type: 'array',
            items: taskDefinitionSchema
        }
    });
    class TaskDefinitionRegistryImpl {
        constructor() {
            this._onDefinitionsChanged = new event_1.Emitter();
            this.onDefinitionsChanged = this._onDefinitionsChanged.event;
            this.taskTypes = Object.create(null);
            this.readyPromise = new Promise((resolve, reject) => {
                taskDefinitionsExtPoint.setHandler((extensions, delta) => {
                    this._schema = undefined;
                    try {
                        for (const extension of delta.removed) {
                            const taskTypes = extension.value;
                            for (const taskType of taskTypes) {
                                if (this.taskTypes && taskType.type && this.taskTypes[taskType.type]) {
                                    delete this.taskTypes[taskType.type];
                                }
                            }
                        }
                        for (const extension of delta.added) {
                            const taskTypes = extension.value;
                            for (const taskType of taskTypes) {
                                const type = Configuration.from(taskType, extension.description.identifier, extension.collector);
                                if (type) {
                                    this.taskTypes[type.taskType] = type;
                                }
                            }
                        }
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this._onDefinitionsChanged.fire();
                        }
                    }
                    catch (error) {
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            return this.readyPromise;
        }
        get(key) {
            return this.taskTypes[key];
        }
        all() {
            return Object.keys(this.taskTypes).map(key => this.taskTypes[key]);
        }
        getJsonSchema() {
            if (this._schema === undefined) {
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
                        schema.properties = Objects.deepClone(definition.properties);
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
                this._schema = { oneOf: schemas };
            }
            return this._schema;
        }
    }
    exports.TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0RlZmluaXRpb25SZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2NvbW1vbi90YXNrRGVmaW5pdGlvblJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsTUFBTSxvQkFBb0IsR0FBZ0I7UUFDekMsSUFBSSxFQUFFLFFBQVE7UUFDZCxvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLFVBQVUsRUFBRTtZQUNYLElBQUksRUFBRTtnQkFDTCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxxR0FBcUcsQ0FBQzthQUM5SjtZQUNELFFBQVEsRUFBRTtnQkFDVCxJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7aUJBQ2Q7YUFDRDtZQUNELFVBQVUsRUFBRTtnQkFDWCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSx3Q0FBd0MsQ0FBQztnQkFDaEcsb0JBQW9CLEVBQUU7b0JBQ3JCLElBQUksRUFBRSx5Q0FBeUM7aUJBQy9DO2FBQ0Q7WUFDRCxJQUFJLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSwwVUFBMFUsQ0FBQztnQkFDcFksT0FBTyxFQUFFLEVBQUU7YUFDWDtTQUNEO0tBQ0QsQ0FBQztJQUVGLElBQVUsYUFBYSxDQWdDdEI7SUFoQ0QsV0FBVSxhQUFhO1FBUXRCLFNBQWdCLElBQUksQ0FBQyxLQUFzQixFQUFFLFdBQWdDLEVBQUUsZ0JBQTJDO1lBQ3pILElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFT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