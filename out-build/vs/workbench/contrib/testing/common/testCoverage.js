/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/uri"], function (require, exports, cancellation_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ksb = exports.$Jsb = void 0;
    /**
     * Class that exposese coverage information for a run.
     */
    class $Jsb {
        constructor(b) {
            this.b = b;
        }
        /**
         * Gets coverage information for all files.
         */
        async getAllFiles(token = cancellation_1.CancellationToken.None) {
            if (!this.a) {
                this.a = this.b.provideFileCoverage(token);
            }
            try {
                return await this.a;
            }
            catch (e) {
                this.a = undefined;
                throw e;
            }
        }
        /**
         * Gets coverage information for a specific file.
         */
        async getUri(uri, token = cancellation_1.CancellationToken.None) {
            const files = await this.getAllFiles(token);
            return files.find(f => f.uri.toString() === uri.toString());
        }
    }
    exports.$Jsb = $Jsb;
    class $Ksb {
        /** Gets the total coverage percent based on information provided. */
        get tpc() {
            let numerator = this.statement.covered;
            let denominator = this.statement.total;
            if (this.branch) {
                numerator += this.branch.covered;
                denominator += this.branch.total;
            }
            if (this.function) {
                numerator += this.function.covered;
                denominator += this.function.total;
            }
            return denominator === 0 ? 1 : numerator / denominator;
        }
        constructor(coverage, b, c) {
            this.b = b;
            this.c = c;
            this.uri = uri_1.URI.revive(coverage.uri);
            this.statement = coverage.statement;
            this.branch = coverage.branch;
            this.function = coverage.branch;
            this.a = coverage.details;
        }
        /**
         * Gets per-line coverage details.
         */
        async details(token = cancellation_1.CancellationToken.None) {
            if (!this.a) {
                this.a = this.c.resolveFileCoverage(this.b, token);
            }
            try {
                return await this.a;
            }
            catch (e) {
                this.a = undefined;
                throw e;
            }
        }
    }
    exports.$Ksb = $Ksb;
});
//# sourceMappingURL=testCoverage.js.map