/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation"], function (require, exports, arrays_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITestingDecorationsService = exports.TestDecorations = void 0;
    class TestDecorations {
        constructor() {
            this.value = [];
        }
        /**
         * Adds a new value to the decorations.
         */
        push(value) {
            const searchIndex = (0, arrays_1.binarySearch)(this.value, value, (a, b) => a.line - b.line);
            this.value.splice(searchIndex < 0 ? ~searchIndex : searchIndex, 0, value);
        }
        /**
         * Gets decorations on each line.
         */
        *lines() {
            if (!this.value.length) {
                return;
            }
            let startIndex = 0;
            let startLine = this.value[0].line;
            for (let i = 1; i < this.value.length; i++) {
                const v = this.value[i];
                if (v.line !== startLine) {
                    yield [startLine, this.value.slice(startIndex, i)];
                    startLine = v.line;
                    startIndex = i;
                }
            }
            yield [startLine, this.value.slice(startIndex)];
        }
    }
    exports.TestDecorations = TestDecorations;
    exports.ITestingDecorationsService = (0, instantiation_1.createDecorator)('testingDecorationService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0RlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdGluZ0RlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThEaEcsTUFBYSxlQUFlO1FBQTVCO1lBQ1EsVUFBSyxHQUFRLEVBQUUsQ0FBQztRQThCeEIsQ0FBQztRQTdCQTs7V0FFRztRQUNJLElBQUksQ0FBQyxLQUFRO1lBQ25CLE1BQU0sV0FBVyxHQUFHLElBQUEscUJBQVksRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRDs7V0FFRztRQUNJLENBQUMsS0FBSztZQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsT0FBTzthQUNQO1lBRUQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0MsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDekIsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkQsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLFVBQVUsR0FBRyxDQUFDLENBQUM7aUJBQ2Y7YUFDRDtZQUVELE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQ0Q7SUEvQkQsMENBK0JDO0lBRVksUUFBQSwwQkFBMEIsR0FBRyxJQUFBLCtCQUFlLEVBQTZCLDBCQUEwQixDQUFDLENBQUMifQ==