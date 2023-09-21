/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/errors", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, lifecycle_1, extHost_protocol_1, errors_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatVariables = void 0;
    class ExtHostChatVariables {
        static { this._idPool = 0; }
        constructor(mainContext) {
            this._resolver = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatVariables);
        }
        async $resolveVariable(handle, messageText, token) {
            const item = this._resolver.get(handle);
            if (!item) {
                return undefined;
            }
            try {
                const value = await item.resolver.resolve(item.data.name, { message: messageText }, token);
                if (value) {
                    return value.map(extHostTypeConverters_1.ChatVariable.from);
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
            return undefined;
        }
        registerVariableResolver(extension, name, description, resolver) {
            const handle = ExtHostChatVariables._idPool++;
            this._resolver.set(handle, { extension: extension.identifier, data: { name, description }, resolver: resolver });
            this._proxy.$registerVariable(handle, { name, description });
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolver.delete(handle);
                this._proxy.$unregisterVariable(handle);
            });
        }
    }
    exports.ExtHostChatVariables = ExtHostChatVariables;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q2hhdFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxvQkFBb0I7aUJBRWpCLFlBQU8sR0FBRyxDQUFDLEFBQUosQ0FBSztRQUszQixZQUFZLFdBQXlCO1lBSHBCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBOEcsQ0FBQztZQUlsSixJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLFdBQW1CLEVBQUUsS0FBd0I7WUFDbkYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELElBQUk7Z0JBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxLQUFLLEVBQUU7b0JBQ1YsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLG9DQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0Q7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFBLGtDQUF5QixFQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELHdCQUF3QixDQUFDLFNBQWdDLEVBQUUsSUFBWSxFQUFFLFdBQW1CLEVBQUUsUUFBcUM7WUFDbEksTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pILElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFN0QsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBcENGLG9EQXFDQyJ9