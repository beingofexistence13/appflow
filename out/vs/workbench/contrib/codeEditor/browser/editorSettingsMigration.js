/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/editor/browser/config/migrateOptions", "vs/workbench/common/configuration"], function (require, exports, platform_1, migrateOptions_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(configuration_1.Extensions.ConfigurationMigration)
        .registerConfigurationMigrations(migrateOptions_1.EditorSettingMigration.items.map(item => ({
        key: `editor.${item.key}`,
        migrateFn: (value, accessor) => {
            const configurationKeyValuePairs = [];
            const writer = (key, value) => configurationKeyValuePairs.push([`editor.${key}`, { value }]);
            item.migrate(value, key => accessor(`editor.${key}`), writer);
            return configurationKeyValuePairs;
        }
    })));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2V0dGluZ3NNaWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvZWRpdG9yU2V0dGluZ3NNaWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFVLENBQUMsc0JBQXNCLENBQUM7U0FDN0UsK0JBQStCLENBQUMsdUNBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsR0FBRyxFQUFFLFVBQVUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUN6QixTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDOUIsTUFBTSwwQkFBMEIsR0FBK0IsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sTUFBTSxHQUFvQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlELE9BQU8sMEJBQTBCLENBQUM7UUFDbkMsQ0FBQztLQUNELENBQUMsQ0FBQyxDQUFDLENBQUMifQ==