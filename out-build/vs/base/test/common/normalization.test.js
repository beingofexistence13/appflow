/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/normalization"], function (require, exports, assert, normalization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Normalization', () => {
        test('removeAccents', function () {
            assert.strictEqual((0, normalization_1.$jl)('joào'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joáo'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joâo'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joäo'), 'joao');
            // assert.strictEqual(strings.removeAccents('joæo'), 'joao'); // not an accent
            assert.strictEqual((0, normalization_1.$jl)('joão'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joåo'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joåo'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('joāo'), 'joao');
            assert.strictEqual((0, normalization_1.$jl)('fôo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('föo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('fòo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('fóo'), 'foo');
            // assert.strictEqual(strings.removeAccents('fœo'), 'foo');
            // assert.strictEqual(strings.removeAccents('føo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('fōo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('fõo'), 'foo');
            assert.strictEqual((0, normalization_1.$jl)('andrè'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andré'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andrê'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andrë'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andrē'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andrė'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('andrę'), 'andre');
            assert.strictEqual((0, normalization_1.$jl)('hvîc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('hvïc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('hvíc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('hvīc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('hvįc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('hvìc'), 'hvic');
            assert.strictEqual((0, normalization_1.$jl)('ûdo'), 'udo');
            assert.strictEqual((0, normalization_1.$jl)('üdo'), 'udo');
            assert.strictEqual((0, normalization_1.$jl)('ùdo'), 'udo');
            assert.strictEqual((0, normalization_1.$jl)('údo'), 'udo');
            assert.strictEqual((0, normalization_1.$jl)('ūdo'), 'udo');
            assert.strictEqual((0, normalization_1.$jl)('heÿ'), 'hey');
            // assert.strictEqual(strings.removeAccents('gruß'), 'grus');
            assert.strictEqual((0, normalization_1.$jl)('gruś'), 'grus');
            assert.strictEqual((0, normalization_1.$jl)('gruš'), 'grus');
            assert.strictEqual((0, normalization_1.$jl)('çool'), 'cool');
            assert.strictEqual((0, normalization_1.$jl)('ćool'), 'cool');
            assert.strictEqual((0, normalization_1.$jl)('čool'), 'cool');
            assert.strictEqual((0, normalization_1.$jl)('ñice'), 'nice');
            assert.strictEqual((0, normalization_1.$jl)('ńice'), 'nice');
        });
    });
});
//# sourceMappingURL=normalization.test.js.map