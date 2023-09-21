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
            const tfidf = new tfIdf_1.TfIdfCalculator();
            const scores = tfidf.calculateScores('something', cancellation_1.CancellationToken.None);
            assertScoreOrdersEqual(scores, []);
        });
        test('Should return no scores for term not in document', () => {
            const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments([
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat the dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/C', '/D']);
            }
        });
        test('Should weigh chunks with less common terms higher', () => {
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/B', '/A']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
                const scores = tfidf.calculateScores('dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B', '/B']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
                const scores = tfidf.calculateScores('cat the dog', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/B', '/A', '/B']);
            }
            for (const docs of permutate([
                makeDocument('/A', ['cat dog cat', 'fish']),
                makeDocument('/B', ['cat cat cat cat dog', 'dog'])
            ])) {
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
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
                const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments(docs);
                const scores = tfidf.calculateScores('catDOG', cancellation_1.CancellationToken.None);
                assertScoreOrdersEqual(scores, ['/A', '/B']);
            }
        });
        test('Should not match document after delete', () => {
            const docA = makeDocument('/A', 'cat dog cat');
            const docB = makeDocument('/B', 'cat fish');
            const docC = makeDocument('/C', 'frog');
            const tfidf = new tfIdf_1.TfIdfCalculator().updateDocuments([docA, docB, docC]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGZJZGYudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vdGZJZGYudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRzs7OztPQUlHO0lBQ0gsU0FBUyxTQUFTLENBQUksR0FBUTtRQUM3QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNaO1FBRUQsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO1FBRXpCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM5QztTQUNEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxZQUEwQixFQUFFLGlCQUEyQjtRQUN0RixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM5RDtJQUNGLENBQUM7SUFFRCxLQUFLLENBQUMsbUJBQW1CLEVBQUU7UUFDMUIsSUFBSSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtZQUNoRSxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQztZQUNwQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO1lBQzdELE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQztnQkFDbkQsWUFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUM7YUFDakMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEUsc0JBQXNCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQztnQkFDNUIsWUFBWSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUM7Z0JBQ2hDLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDO2FBQzdCLENBQUMsRUFBRTtnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1lBQzNELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDO2dCQUM1QixZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQztnQkFDakMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7Z0JBQzlCLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO2FBQzFCLENBQUMsRUFBRTtnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3QztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1GQUFtRixFQUFFLEdBQUcsRUFBRTtZQUM5RixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQztnQkFDNUIsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQztnQkFDckMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7Z0JBQzlCLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDO2FBQ2xDLENBQUMsRUFBRTtnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbkQ7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDakQsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUM7Z0JBQzVCLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDO2dCQUNqQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztnQkFDMUIsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQztnQkFDckMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7YUFDOUIsQ0FBQyxFQUFFO2dCQUNILE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtZQUM5RCxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQztnQkFDNUIsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDM0MsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2xELENBQUMsRUFBRTtnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3QztZQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDO2dCQUM1QixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbEQsQ0FBQyxFQUFFO2dCQUNILE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BFLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuRDtZQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDO2dCQUM1QixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbEQsQ0FBQyxFQUFFO2dCQUNILE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVFLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuRDtZQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDO2dCQUM1QixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbEQsQ0FBQyxFQUFFO2dCQUNILE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFFLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDdkM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDL0MsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUM7Z0JBQzVCLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDO2dCQUNqQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztnQkFDOUIsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7YUFDMUIsQ0FBQyxFQUFFO2dCQUNILE1BQU0sS0FBSyxHQUFHLElBQUksdUJBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFFLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzdDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1lBQzVDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDO2dCQUM1QixZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztnQkFDaEMsWUFBWSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUM7Z0JBQ2pDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO2FBQzdCLENBQUMsRUFBRTtnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3QztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtZQUNuRCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV4QyxNQUFNLEtBQUssR0FBRyxJQUFJLHVCQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEUsc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFN0MsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFdkMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELHNCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFdkMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELHNCQUFzQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxZQUFZLENBQUMsR0FBVyxFQUFFLE9BQTBCO1FBQzVELE9BQU87WUFDTixHQUFHO1lBQ0gsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDeEQsQ0FBQztJQUNILENBQUMifQ==