/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/tfIdf"], function (require, exports, assert, cancellation_1, tfIdf_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Generates all permutations of an array.
     *
     * This is useful for testing to make sure order does not effect the result.
     */
    function permutate(arr) {
        if (arr.length === 0) {
            return [[]];
        }
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const permutationsRest = permutate(rest);
            for (let j = 0; j < permutationsRest.length; j++) {
                result.push([arr[i], ...permutationsRest[j]]);
            }
        }
        return result;
    }
    function assertScoreOrdersEqual(actualScores, expectedScoreKeys) {
        actualScores.sort((a, b) => (b.score - a.score) || a.key.localeCompare(b.key));
        assert.strictEqual(actualScores.length, expectedScoreKeys.length);
        for (let i = 0; i < expectedScoreKeys.length; i++) {
            assert.strictEqual(actualScores[i].key, expectedScoreKeys[i]);
        }
    }
    suite('TF-IDF Calculator', function () {
        test('Should return no scores when no documents are given', () => {
            const tfidf = new tfIdf_1.$NS();
            const scores = tfidf.calculateScores('something', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, []);
        });
        test('Should return no scores for term not in document', () => {
            const tfidf = new tfIdf_1.$NS().updateDocuments([
                makeDocument('A', 'cat dog fish'),
            ]);
            const scores = tfidf.calculateScores('elepant', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, []);
        });
        test('Should return scores for document with exact match', () => {
            for (const docs of permutate([
                makeDocument('A', 'cat dog cat'),
                makeDocument('B', 'cat fish'),
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['A']);
            }
        });
        test('Should return document with more matches first', () => {
            for (const docs of permutate([
                makeDocument('/A', 'cat dog cat'),
                makeDocument('/B', 'cat fish'),
                makeDocument('/C', 'frog'),
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B']);
            }
        });
        test('Should return document with more matches first when term appears in all documents', () => {
            for (const docs of permutate([
                makeDocument('/A', 'cat dog cat cat'),
                makeDocument('/B', 'cat fish'),
                makeDocument('/C', 'frog cat cat'),
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/C', '/B']);
            }
        });
        test('Should weigh less common term higher', () => {
            for (const docs of permutate([
                makeDocument('/A', 'cat dog cat'),
                makeDocument('/B', 'fish'),
                makeDocument('/C', 'cat cat cat cat'),
                makeDocument('/D', 'cat fish')
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat the dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/C', '/D']);
            }
        });
        test('Should weigh chunks with less common terms higher', () => {
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/B', '/A']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B', '/B']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat the dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/B', '/A', '/B']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('lake fish', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A']);
            }
        });
        test('Should ignore case and punctuation', () => {
            for (const docs of permutate([
                makeDocument('/A', 'Cat doG.cat'),
                makeDocument('/B', 'cAt fiSH'),
                makeDocument('/C', 'frOg'),
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('. ,CaT!  ', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B']);
            }
        });
        test('Should match on camelCase words', () => {
            for (const docs of permutate([
                makeDocument('/A', 'catDog cat'),
                makeDocument('/B', 'fishCatFish'),
                makeDocument('/C', 'frogcat'),
            ])) {
                const tfidf = new tfIdf_1.$NS().updateDocuments(docs);
                const scores = tfidf.calculateScores('catDOG', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B']);
            }
        });
        test('Should not match document after delete', () => {
            const docA = makeDocument('/A', 'cat dog cat');
            const docB = makeDocument('/B', 'cat fish');
            const docC = makeDocument('/C', 'frog');
            const tfidf = new tfIdf_1.$NS().updateDocuments([docA, docB, docC]);
            let scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, ['/A', '/B']);
            tfidf.deleteDocument(docA.key);
            scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, ['/B']);
            tfidf.deleteDocument(docC.key);
            scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, ['/B']);
            tfidf.deleteDocument(docB.key);
            scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, []);
        });
    });
    function makeDocument(key, content) {
        return {
            key,
            textChunks: Array.isArray(content) ? content : [content],
        };
    }
});
//# sourceMappingURL=tfIdf.test.js.map