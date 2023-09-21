/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/base/common/event", "vs/platform/instantiation/common/instantiation"], function (require, exports, extHost_protocol_1, event_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostStorage = exports.ExtHostStorage = void 0;
    class ExtHostStorage {
        constructor(mainContext, _logService) {
            this._logService = _logService;
            this._onDidChangeStorage = new event_1.Emitter();
            this.onDidChangeStorage = this._onDidChangeStorage.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadStorage);
        }
        registerExtensionStorageKeysToSync(extension, keys) {
            this._proxy.$registerExtensionStorageKeysToSync(extension, keys);
        }
        async initializeExtensionStorage(shared, key, defaultValue) {
            const value = await this._proxy.$initializeExtensionStorage(shared, key);
            let parsedValue;
            if (value) {
                parsedValue = this.safeParseValue(shared, key, value);
            }
            return parsedValue || defaultValue;
        }
        setValue(shared, key, value) {
            return this._proxy.$setValue(shared, key, value);
        }
        $acceptValue(shared, key, value) {
            const parsedValue = this.safeParseValue(shared, key, value);
            if (parsedValue) {
                this._onDidChangeStorage.fire({ shared, key, value: parsedValue });
            }
        }
        safeParseValue(shared, key, value) {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                // Do not fail this call but log it for diagnostics
                // https://github.com/microsoft/vscode/issues/132777
                this._logService.error(`[extHostStorage] unexpected error parsing storage contents (extensionId: ${key}, global: ${shared}): ${error}`);
            }
            return undefined;
        }
    }
    exports.ExtHostStorage = ExtHostStorage;
    exports.IExtHostStorage = (0, instantiation_1.createDecorator)('IExtHostStorage');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0U3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSxjQUFjO1FBUzFCLFlBQ0MsV0FBK0IsRUFDZCxXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUx6Qix3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBdUIsQ0FBQztZQUNqRSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBTTVELElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELGtDQUFrQyxDQUFDLFNBQWtDLEVBQUUsSUFBYztZQUNwRixJQUFJLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsS0FBSyxDQUFDLDBCQUEwQixDQUFDLE1BQWUsRUFBRSxHQUFXLEVBQUUsWUFBcUI7WUFDbkYsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUV6RSxJQUFJLFdBQStCLENBQUM7WUFDcEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUN0RDtZQUVELE9BQU8sV0FBVyxJQUFJLFlBQVksQ0FBQztRQUNwQyxDQUFDO1FBRUQsUUFBUSxDQUFDLE1BQWUsRUFBRSxHQUFXLEVBQUUsS0FBYTtZQUNuRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELFlBQVksQ0FBQyxNQUFlLEVBQUUsR0FBVyxFQUFFLEtBQWE7WUFDdkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVELElBQUksV0FBVyxFQUFFO2dCQUNoQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFTyxjQUFjLENBQUMsTUFBZSxFQUFFLEdBQVcsRUFBRSxLQUFhO1lBQ2pFLElBQUk7Z0JBQ0gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3pCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsbURBQW1EO2dCQUNuRCxvREFBb0Q7Z0JBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLDRFQUE0RSxHQUFHLGFBQWEsTUFBTSxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDeEk7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBQ0Q7SUFyREQsd0NBcURDO0lBR1ksUUFBQSxlQUFlLEdBQUcsSUFBQSwrQkFBZSxFQUFrQixpQkFBaUIsQ0FBQyxDQUFDIn0=