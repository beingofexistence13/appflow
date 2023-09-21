/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/errorMessage"], function (require, exports, assert, errorMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Errors', () => {
        test('Get Error Message', function () {
            assert.strictEqual((0, errorMessage_1.toErrorMessage)('Foo Bar'), 'Foo Bar');
            assert.strictEqual((0, errorMessage_1.toErrorMessage)(new Error('Foo Bar')), 'Foo Bar');
            let error = new Error();
            error = new Error();
            error.detail = {};
            error.detail.exception = {};
            error.detail.exception.message = 'Foo Bar';
            assert.strictEqual((0, errorMessage_1.toErrorMessage)(error), 'Foo Bar');
            assert.strictEqual((0, errorMessage_1.toErrorMessage)(error, true), 'Foo Bar');
            assert((0, errorMessage_1.toErrorMessage)());
            assert((0, errorMessage_1.toErrorMessage)(null));
            assert((0, errorMessage_1.toErrorMessage)({}));
            try {
                throw new Error();
            }
            catch (error) {
                assert.strictEqual((0, errorMessage_1.toErrorMessage)(error), 'An unknown error occurred. Please consult the log for more details.');
                assert.ok((0, errorMessage_1.toErrorMessage)(error, true).length > 'An unknown error occurred. Please consult the log for more details.'.length);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL2Vycm9ycy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ3BCLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWMsRUFBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWMsRUFBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXBFLElBQUksS0FBSyxHQUFRLElBQUksS0FBSyxFQUFFLENBQUM7WUFDN0IsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDbEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFjLEVBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFjLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sQ0FBQyxJQUFBLDZCQUFjLEdBQUUsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxJQUFBLDZCQUFjLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsSUFBQSw2QkFBYyxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0IsSUFBSTtnQkFDSCxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7YUFDbEI7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWMsRUFBQyxLQUFLLENBQUMsRUFBRSxxRUFBcUUsQ0FBQyxDQUFDO2dCQUNqSCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsNkJBQWMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLHFFQUFxRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzdIO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9