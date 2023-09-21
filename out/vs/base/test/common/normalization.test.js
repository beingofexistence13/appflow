/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/normalization"], function (require, exports, assert, normalization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Normalization', () => {
        test('removeAccents', function () {
            assert.strictEqual((0, normalization_1.removeAccents)('joào'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joáo'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joâo'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joäo'), 'joao');
            // assert.strictEqual(strings.removeAccents('joæo'), 'joao'); // not an accent
            assert.strictEqual((0, normalization_1.removeAccents)('joão'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joåo'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joåo'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('joāo'), 'joao');
            assert.strictEqual((0, normalization_1.removeAccents)('fôo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('föo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('fòo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('fóo'), 'foo');
            // assert.strictEqual(strings.removeAccents('fœo'), 'foo');
            // assert.strictEqual(strings.removeAccents('føo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('fōo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('fõo'), 'foo');
            assert.strictEqual((0, normalization_1.removeAccents)('andrè'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andré'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andrê'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andrë'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andrē'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andrė'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('andrę'), 'andre');
            assert.strictEqual((0, normalization_1.removeAccents)('hvîc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('hvïc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('hvíc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('hvīc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('hvįc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('hvìc'), 'hvic');
            assert.strictEqual((0, normalization_1.removeAccents)('ûdo'), 'udo');
            assert.strictEqual((0, normalization_1.removeAccents)('üdo'), 'udo');
            assert.strictEqual((0, normalization_1.removeAccents)('ùdo'), 'udo');
            assert.strictEqual((0, normalization_1.removeAccents)('údo'), 'udo');
            assert.strictEqual((0, normalization_1.removeAccents)('ūdo'), 'udo');
            assert.strictEqual((0, normalization_1.removeAccents)('heÿ'), 'hey');
            // assert.strictEqual(strings.removeAccents('gruß'), 'grus');
            assert.strictEqual((0, normalization_1.removeAccents)('gruś'), 'grus');
            assert.strictEqual((0, normalization_1.removeAccents)('gruš'), 'grus');
            assert.strictEqual((0, normalization_1.removeAccents)('çool'), 'cool');
            assert.strictEqual((0, normalization_1.removeAccents)('ćool'), 'cool');
            assert.strictEqual((0, normalization_1.removeAccents)('čool'), 'cool');
            assert.strictEqual((0, normalization_1.removeAccents)('ñice'), 'nice');
            assert.strictEqual((0, normalization_1.removeAccents)('ńice'), 'nice');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXphdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9ub3JtYWxpemF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFFM0IsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCw4RUFBOEU7WUFDOUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsMkRBQTJEO1lBQzNELDJEQUEyRDtZQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVsRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsNkJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRCw2REFBNkQ7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFhLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9