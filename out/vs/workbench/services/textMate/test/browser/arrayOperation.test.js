/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/textMate/browser/arrayOperation"], function (require, exports, assert, arrayOperation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('array operation', () => {
        function seq(start, end) {
            const result = [];
            for (let i = start; i < end; i++) {
                result.push(i);
            }
            return result;
        }
        test('simple', () => {
            const edit = new arrayOperation_1.ArrayEdit([
                new arrayOperation_1.SingleArrayEdit(4, 3, 2),
                new arrayOperation_1.SingleArrayEdit(8, 0, 2),
                new arrayOperation_1.SingleArrayEdit(9, 2, 0),
            ]);
            const arr = seq(0, 15).map(x => `item${x}`);
            const newArr = arr.slice();
            edit.applyToArray(newArr);
            assert.deepStrictEqual(newArr, [
                'item0',
                'item1',
                'item2',
                'item3',
                undefined,
                undefined,
                'item7',
                undefined,
                undefined,
                'item8',
                'item11',
                'item12',
                'item13',
                'item14',
            ]);
            const transformer = new arrayOperation_1.MonotonousIndexTransformer(edit);
            assert.deepStrictEqual(seq(0, 15).map((x) => {
                const t = transformer.transform(x);
                let r = `arr[${x}]: ${arr[x]} -> `;
                if (t !== undefined) {
                    r += `newArr[${t}]: ${newArr[t]}`;
                }
                else {
                    r += 'undefined';
                }
                return r;
            }), [
                'arr[0]: item0 -> newArr[0]: item0',
                'arr[1]: item1 -> newArr[1]: item1',
                'arr[2]: item2 -> newArr[2]: item2',
                'arr[3]: item3 -> newArr[3]: item3',
                'arr[4]: item4 -> undefined',
                'arr[5]: item5 -> undefined',
                'arr[6]: item6 -> undefined',
                'arr[7]: item7 -> newArr[6]: item7',
                'arr[8]: item8 -> newArr[9]: item8',
                'arr[9]: item9 -> undefined',
                'arr[10]: item10 -> undefined',
                'arr[11]: item11 -> newArr[10]: item11',
                'arr[12]: item12 -> newArr[11]: item12',
                'arr[13]: item13 -> newArr[12]: item13',
                'arr[14]: item14 -> newArr[13]: item14',
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlPcGVyYXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0TWF0ZS90ZXN0L2Jyb3dzZXIvYXJyYXlPcGVyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1FBQzdCLFNBQVMsR0FBRyxDQUFDLEtBQWEsRUFBRSxHQUFXO1lBQ3RDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2Y7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLDBCQUFTLENBQUM7Z0JBQzFCLElBQUksZ0NBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxnQ0FBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLGdDQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDNUIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTNCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLE9BQU87Z0JBQ1AsT0FBTztnQkFDUCxPQUFPO2dCQUNQLE9BQU87Z0JBQ1AsU0FBUztnQkFDVCxTQUFTO2dCQUNULE9BQU87Z0JBQ1AsU0FBUztnQkFDVCxTQUFTO2dCQUNULE9BQU87Z0JBQ1AsUUFBUTtnQkFDUixRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsUUFBUTthQUNSLENBQUMsQ0FBQztZQUVILE1BQU0sV0FBVyxHQUFHLElBQUksMkNBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLGVBQWUsQ0FDckIsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEIsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDcEIsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2lCQUNsQztxQkFBTTtvQkFDTixDQUFDLElBQUksV0FBVyxDQUFDO2lCQUNqQjtnQkFDRCxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxFQUNGO2dCQUNDLG1DQUFtQztnQkFDbkMsbUNBQW1DO2dCQUNuQyxtQ0FBbUM7Z0JBQ25DLG1DQUFtQztnQkFDbkMsNEJBQTRCO2dCQUM1Qiw0QkFBNEI7Z0JBQzVCLDRCQUE0QjtnQkFDNUIsbUNBQW1DO2dCQUNuQyxtQ0FBbUM7Z0JBQ25DLDRCQUE0QjtnQkFDNUIsOEJBQThCO2dCQUM5Qix1Q0FBdUM7Z0JBQ3ZDLHVDQUF1QztnQkFDdkMsdUNBQXVDO2dCQUN2Qyx1Q0FBdUM7YUFDdkMsQ0FDRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9