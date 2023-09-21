/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeTfIdfScores = exports.TfIdfCalculator = void 0;
    function countMapFrom(values) {
        const map = new Map();
        for (const value of values) {
            map.set(value, (map.get(value) ?? 0) + 1);
        }
        return map;
    }
    /**
     * Implementation of tf-idf (term frequency-inverse document frequency) for a set of
     * documents where each document contains one or more chunks of text.
     * Each document is identified by a key, and the score for each document is computed
     * by taking the max score over all the chunks in the document.
     */
    class TfIdfCalculator {
        constructor() {
            /**
             * Total number of chunks
             */
            this.chunkCount = 0;
            this.chunkOccurrences = new Map();
            this.documents = new Map();
        }
        calculateScores(query, token) {
            const embedding = this.computeEmbedding(query);
            const idfCache = new Map();
            const scores = [];
            // For each document, generate one score
            for (const [key, doc] of this.documents) {
                if (token.isCancellationRequested) {
                    return [];
                }
                for (const chunk of doc.chunks) {
                    const score = this.computeSimilarityScore(chunk, embedding, idfCache);
                    if (score > 0) {
                        scores.push({ key, score });
                    }
                }
            }
            return scores;
        }
        /**
         * Count how many times each term (word) appears in a string.
         */
        static termFrequencies(input) {
            return countMapFrom(TfIdfCalculator.splitTerms(input));
        }
        /**
         * Break a string into terms (words).
         */
        static *splitTerms(input) {
            const normalize = (word) => word.toLowerCase();
            // Only match on words that are at least 3 characters long and start with a letter
            for (const [word] of input.matchAll(/\b\p{Letter}[\p{Letter}\d]{2,}\b/gu)) {
                yield normalize(word);
                // eslint-disable-next-line local/code-no-look-behind-regex
                const camelParts = word.split(/(?<=[a-z])(?=[A-Z])/g);
                if (camelParts.length > 1) {
                    for (const part of camelParts) {
                        // Require at least 3 letters in the parts of a camel case word
                        if (part.length > 2 && /\p{Letter}{3,}/gu.test(part)) {
                            yield normalize(part);
                        }
                    }
                }
            }
        }
        updateDocuments(documents) {
            for (const { key } of documents) {
                this.deleteDocument(key);
            }
            for (const doc of documents) {
                const chunks = [];
                for (const text of doc.textChunks) {
                    // TODO: See if we can compute the tf lazily
                    // The challenge is that we need to also update the `chunkOccurrences`
                    // and all of those updates need to get flushed before the real TF-IDF of
                    // anything is computed.
                    const tf = TfIdfCalculator.termFrequencies(text);
                    // Update occurrences list
                    for (const term of tf.keys()) {
                        this.chunkOccurrences.set(term, (this.chunkOccurrences.get(term) ?? 0) + 1);
                    }
                    chunks.push({ text, tf });
                }
                this.chunkCount += chunks.length;
                this.documents.set(doc.key, { chunks });
            }
            return this;
        }
        deleteDocument(key) {
            const doc = this.documents.get(key);
            if (!doc) {
                return;
            }
            this.documents.delete(key);
            this.chunkCount -= doc.chunks.length;
            // Update term occurrences for the document
            for (const chunk of doc.chunks) {
                for (const term of chunk.tf.keys()) {
                    const currentOccurrences = this.chunkOccurrences.get(term);
                    if (typeof currentOccurrences === 'number') {
                        const newOccurrences = currentOccurrences - 1;
                        if (newOccurrences <= 0) {
                            this.chunkOccurrences.delete(term);
                        }
                        else {
                            this.chunkOccurrences.set(term, newOccurrences);
                        }
                    }
                }
            }
        }
        computeSimilarityScore(chunk, queryEmbedding, idfCache) {
            // Compute the dot product between the chunk's embedding and the query embedding
            // Note that the chunk embedding is computed lazily on a per-term basis.
            // This lets us skip a large number of calculations because the majority
            // of chunks do not share any terms with the query.
            let sum = 0;
            for (const [term, termTfidf] of Object.entries(queryEmbedding)) {
                const chunkTf = chunk.tf.get(term);
                if (!chunkTf) {
                    // Term does not appear in chunk so it has no contribution
                    continue;
                }
                let chunkIdf = idfCache.get(term);
                if (typeof chunkIdf !== 'number') {
                    chunkIdf = this.computeIdf(term);
                    idfCache.set(term, chunkIdf);
                }
                const chunkTfidf = chunkTf * chunkIdf;
                sum += chunkTfidf * termTfidf;
            }
            return sum;
        }
        computeEmbedding(input) {
            const tf = TfIdfCalculator.termFrequencies(input);
            return this.computeTfidf(tf);
        }
        computeIdf(term) {
            const chunkOccurrences = this.chunkOccurrences.get(term) ?? 0;
            return chunkOccurrences > 0
                ? Math.log((this.chunkCount + 1) / chunkOccurrences)
                : 0;
        }
        computeTfidf(termFrequencies) {
            const embedding = Object.create(null);
            for (const [word, occurrences] of termFrequencies) {
                const idf = this.computeIdf(word);
                if (idf > 0) {
                    embedding[word] = occurrences * idf;
                }
            }
            return embedding;
        }
    }
    exports.TfIdfCalculator = TfIdfCalculator;
    /**
     * Normalize the scores to be between 0 and 1 and sort them decending.
     * @param scores array of scores from {@link TfIdfCalculator.calculateScores}
     * @returns normalized scores
     */
    function normalizeTfIdfScores(scores) {
        // copy of scores
        const result = scores.slice(0);
        // sort descending
        result.sort((a, b) => b.score - a.score);
        // normalize
        const max = result[0]?.score ?? 0;
        if (max > 0) {
            for (const score of result) {
                score.score /= max;
            }
        }
        return result;
    }
    exports.normalizeTfIdfScores = normalizeTfIdfScores;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGZJZGYuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi90ZklkZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsU0FBUyxZQUFZLENBQUksTUFBbUI7UUFDM0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQWEsQ0FBQztRQUNqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUMzQixHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUE0QkQ7Ozs7O09BS0c7SUFDSCxNQUFhLGVBQWU7UUFBNUI7WUFvREM7O2VBRUc7WUFDSyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1lBRU4scUJBQWdCLEdBQXdCLElBQUksR0FBRyxFQUFxRCxDQUFDO1lBRXJHLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFFaEMsQ0FBQztRQXdHTixDQUFDO1FBcEtBLGVBQWUsQ0FBQyxLQUFhLEVBQUUsS0FBd0I7WUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQzNDLE1BQU0sTUFBTSxHQUFpQixFQUFFLENBQUM7WUFDaEMsd0NBQXdDO1lBQ3hDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUN4QyxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtvQkFDbEMsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7Z0JBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxHQUFHLENB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