/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/assert"], function (require, exports, assert, assert_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Assert', () => {
        test('ok', () => {
            assert.throws(function () {
                (0, assert_1.ok)(false);
            });
            assert.throws(function () {
                (0, assert_1.ok)(null);
            });
            assert.throws(function () {
                (0, assert_1.ok)();
            });
            assert.throws(function () {
                (0, assert_1.ok)(null, 'Foo Bar');
            }, function (e) {
                return e.message.indexOf('Foo Bar') >= 0;
            });
            (0, assert_1.ok)(true);
            (0, assert_1.ok)('foo');
            (0, assert_1.ok)({});
            (0, assert_1.ok)(5);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL2Fzc2VydC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ2YsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixJQUFBLFdBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixJQUFBLFdBQUUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixJQUFBLFdBQUUsR0FBRSxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNiLElBQUEsV0FBRSxFQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyQixDQUFDLEVBQUUsVUFBVSxDQUFRO2dCQUNwQixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUEsV0FBRSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1QsSUFBQSxXQUFFLEVBQUMsS0FBSyxDQUFDLENBQUM7WUFDVixJQUFBLFdBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztZQUNQLElBQUEsV0FBRSxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9