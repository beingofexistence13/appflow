/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer"], function (require, exports, arrays_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataTransferFileCache = void 0;
    class DataTransferFileCache {
        constructor() {
            this.requestIdPool = 0;
            this.dataTransferFiles = new Map();
        }
        add(dataTransfer) {
            const requestId = this.requestIdPool++;
            this.dataTransferFiles.set(requestId, (0, arrays_1.coalesce)(Array.from(dataTransfer, ([, item]) => item.asFile())));
            return {
                id: requestId,
                dispose: () => {
                    this.dataTransferFiles.delete(requestId);
                }
            };
        }
        async resolveFileData(requestId, dataItemId) {
            const files = this.dataTransferFiles.get(requestId);
            if (!files) {
                throw new Error('No data transfer found');
            }
            const file = files.find(file => file.id === dataItemId);
            if (!file) {
                throw new Error('No matching file found in data transfer');
            }
            return buffer_1.VSBuffer.wrap(await file.data());
        }
        dispose() {
            this.dataTransferFiles.clear();
        }
    }
    exports.DataTransferFileCache = DataTransferFileCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRyYW5zZmVyQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9zaGFyZWQvZGF0YVRyYW5zZmVyQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEscUJBQXFCO1FBQWxDO1lBRVMsa0JBQWEsR0FBRyxDQUFDLENBQUM7WUFDVCxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBNEQsQ0FBQztRQThCMUcsQ0FBQztRQTVCTyxHQUFHLENBQUMsWUFBcUM7WUFDL0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUEsaUJBQVEsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLE9BQU87Z0JBQ04sRUFBRSxFQUFFLFNBQVM7Z0JBQ2IsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQWlCLEVBQUUsVUFBa0I7WUFDMUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMxQztZQUVELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsT0FBTyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLENBQUM7S0FDRDtJQWpDRCxzREFpQ0MifQ==