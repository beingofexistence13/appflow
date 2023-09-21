/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/uri"], function (require, exports, cancellation_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileCoverage = exports.TestCoverage = void 0;
    /**
     * Class that exposese coverage information for a run.
     */
    class TestCoverage {
        constructor(accessor) {
            this.accessor = accessor;
        }
        /**
         * Gets coverage information for all files.
         */
        async getAllFiles(token = cancellation_1.CancellationToken.None) {
            if (!this.fileCoverage) {
                this.fileCoverage = this.accessor.provideFileCoverage(token);
            }
            try {
                return await this.fileCoverage;
            }
            catch (e) {
                this.fileCoverage = undefined;
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
    exports.TestCoverage = TestCoverage;
    class FileCoverage {
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
        constructor(coverage, index, accessor) {
            this.index = index;
            this.accessor = accessor;
            this.uri = uri_1.URI.revive(coverage.uri);
            this.statement = coverage.statement;
            this.branch = coverage.branch;
            this.function = coverage.branch;
            this._details = coverage.details;
        }
        /**
         * Gets per-line coverage details.
         */
        async details(token = cancellation_1.CancellationToken.None) {
            if (!this._details) {
                this._details = this.accessor.resolveFileCoverage(this.index, token);
            }
            try {
                return await this._details;
            }
            catch (e) {
                this._details = undefined;
                throw e;
            }
        }
    }
    exports.FileCoverage = FileCoverage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvdmVyYWdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdENvdmVyYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRzs7T0FFRztJQUNILE1BQWEsWUFBWTtRQUd4QixZQUE2QixRQUEyQjtZQUEzQixhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQUFJLENBQUM7UUFFN0Q7O1dBRUc7UUFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxnQ0FBaUIsQ0FBQyxJQUFJO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxJQUFJO2dCQUNILE9BQU8sTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQy9CO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxDQUFDO2FBQ1I7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQVEsRUFBRSxLQUFLLEdBQUcsZ0NBQWlCLENBQUMsSUFBSTtZQUMzRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQ0Q7SUE1QkQsb0NBNEJDO0lBRUQsTUFBYSxZQUFZO1FBT3hCLHFFQUFxRTtRQUNyRSxJQUFXLEdBQUc7WUFDYixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUN2QyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUV2QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDakMsV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ2pDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQixTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ25DLFdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQzthQUNuQztZQUVELE9BQU8sV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1FBQ3hELENBQUM7UUFFRCxZQUFZLFFBQXVCLEVBQW1CLEtBQWEsRUFBbUIsUUFBMkI7WUFBM0QsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUNoSCxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNsQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxnQ0FBaUIsQ0FBQyxJQUFJO1lBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUk7Z0JBQ0gsT0FBTyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDM0I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLENBQUM7YUFDUjtRQUNGLENBQUM7S0FDRDtJQWhERCxvQ0FnREMifQ==