/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensions", "./extHost.protocol"], function (require, exports, lifecycle_1, types_1, uri_1, extensions_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostProfileContentHandlers = void 0;
    class ExtHostProfileContentHandlers {
        constructor(mainContext) {
            this.handlers = new Map();
            this.proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadProfileContentHandlers);
        }
        registrProfileContentHandler(extension, id, handler) {
            (0, extensions_1.checkProposedApiEnabled)(extension, 'profileContentHandlers');
            if (this.handlers.has(id)) {
                throw new Error(`Handler with id '${id}' already registered`);
            }
            this.handlers.set(id, handler);
            this.proxy.$registerProfileContentHandler(id, handler.name, handler.description, extension.identifier.value);
            return (0, lifecycle_1.toDisposable)(() => {
                this.handlers.delete(id);
                this.proxy.$unregisterProfileContentHandler(id);
            });
        }
        async $saveProfile(id, name, content, token) {
            const handler = this.handlers.get(id);
            if (!handler) {
                throw new Error(`Unknown handler with id: ${id}`);
            }
            return handler.saveProfile(name, content, token);
        }
        async $readProfile(id, idOrUri, token) {
            const handler = this.handlers.get(id);
            if (!handler) {
                throw new Error(`Unknown handler with id: ${id}`);
            }
            return handler.readProfile((0, types_1.isString)(idOrUri) ? idOrUri : uri_1.URI.revive(idOrUri), token);
        }
    }
    exports.ExtHostProfileContentHandlers = ExtHostProfileContentHandlers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFByb2ZpbGVDb250ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RQcm9maWxlQ29udGVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsNkJBQTZCO1FBTXpDLFlBQ0MsV0FBeUI7WUFIVCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXdDLENBQUM7WUFLM0UsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsNEJBQTRCLENBQzNCLFNBQWdDLEVBQ2hDLEVBQVUsRUFDVixPQUFxQztZQUVyQyxJQUFBLG9DQUF1QixFQUFDLFNBQVMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBQzdELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzthQUM5RDtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU3RyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBVSxFQUFFLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBd0I7WUFDckYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBVSxFQUFFLE9BQStCLEVBQUUsS0FBd0I7WUFDdkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUEsZ0JBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RGLENBQUM7S0FDRDtJQWhERCxzRUFnREMifQ==