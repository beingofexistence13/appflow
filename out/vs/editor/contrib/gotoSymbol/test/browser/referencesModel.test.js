/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/gotoSymbol/browser/referencesModel"], function (require, exports, assert, uri_1, position_1, range_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('references', function () {
        test('nearestReference', () => {
            const model = new referencesModel_1.ReferencesModel([{
                    uri: uri_1.URI.file('/out/obj/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/out/obj/can2'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/src/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }], 'FOO');
            let ref = model.nearestReference(uri_1.URI.file('/src/can'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/src/someOtherFileInSrc'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/out/someOtherFile'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can');
            ref = model.nearestReference(uri_1.URI.file('/out/obj/can2222'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can2');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc01vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9nb3RvU3ltYm9sL3Rlc3QvYnJvd3Nlci9yZWZlcmVuY2VzTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMsWUFBWSxFQUFFO1FBRW5CLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLENBQUM7b0JBQ2xDLEdBQUcsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDN0IsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDNUIsRUFBRTtvQkFDRixHQUFHLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7b0JBQzlCLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzVCLEVBQUU7b0JBQ0YsR0FBRyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUN6QixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFWCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5QyxHQUFHLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5QyxHQUFHLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVsRCxHQUFHLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztJQUVKLENBQUMsQ0FBQyxDQUFDIn0=