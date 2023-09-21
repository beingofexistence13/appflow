/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OS = exports.$NS = void 0;
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
    class $NS {
        constructor() {
            /**
             * Total number of chunks
             */
            this.e = 0;
            this.f = new Map();
            this.g = new Map();
        }
        calculateScores(query, token) {
            const embedding = this.i(query);
            const idfCache = new Map();
            const scores = [];
            // For each document, generate one score
            for (const [key, doc] of this.g) {
                if (token.isCancellationRequested) {
                    return [];
                }
                for (const chunk of doc.chunks) {
                    const score = this.h(chunk, embedding, idfCache);
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
        static c(input) {
            return countMapFrom($NS.d(input));
        }
        /**
         * Break a string into terms (words).
         */
        static *d(input) {
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
                    const tf = $NS.c(text);
                    // Update occurrences list
                    for (const term of tf.keys()) {
                        this.f.set(term, (this.f.get(term) ?? 0) + 1);
                    }
                    chunks.push({ text, tf });
                }
                this.e += chunks.length;
                this.g.set(doc.key, { chunks });
            }
            return this;
        }
        deleteDocument(key) {
            const doc = this.g.get(key);
            if (!doc) {
                return;
            }
            this.g.delete(key);
            this.e -= doc.chunks.length;
            // Update term occurrences for the document
            for (const chunk of doc.chunks) {
                for (const term of chunk.tf.keys()) {
                    const currentOccurrences = this.f.get(term);
                    if (typeof currentOccurrences === 'number') {
                        const newOccurrences = currentOccurrences - 1;
                        if (newOccurrences <= 0) {
                            this.f.delete(term);
                        }
                        else {
                            this.f.set(term, newOccurrences);
                        }
                    }
                }
            }
        }
        h(chunk, queryEmbedding, idfCache) {
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
                    chunkIdf = this.j(term);
                    idfCache.set(term, chunkIdf);
                }
                const chunkTfidf = chunkTf * chunkIdf;
                sum += chunkTfidf * termTfidf;
            }
            return sum;
        }
        i(input) {
            const tf = $NS.c(input);
            return this.k(tf);
        }
        j(term) {
            const chunkOccurrences = this.f.get(term) ?? 0;
            return chunkOccurrences > 0
                ? Math.log((this.e + 1) / chunkOccurrences)
                : 0;
        }
        k(termFrequencies) {
            const embedding = Object.create(null);
            for (const [word, occurrences] of termFrequencies) {
                const idf = this.j(word);
                if (idf > 0) {
                    embedding[word] = occurrences * idf;
                }
            }
            return embedding;
        }
    }
    exports.$NS = $NS;
    /**
     * Normalize the scores to be between 0 and 1 and sort them decending.
     * @param scores array of scores from {@link $NS.calculateScores}
     * @returns normalized scores
     */
    function $OS(scores) {
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
    exports.$OS = $OS;
});
//# sourceMappingURL=tfIdf.js.map