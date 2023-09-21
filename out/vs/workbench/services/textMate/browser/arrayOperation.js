/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays"], function (require, exports, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CombinedIndexTransformer = exports.MonotonousIndexTransformer = exports.SingleArrayEdit = exports.ArrayEdit = void 0;
    class ArrayEdit {
        constructor(
        /**
         * Disjoint edits that are applied in parallel
         */
        edits) {
            this.edits = edits.slice().sort((0, arrays_1.compareBy)(c => c.offset, arrays_1.numberComparator));
        }
        applyToArray(array) {
            for (let i = this.edits.length - 1; i >= 0; i--) {
                const c = this.edits[i];
                array.splice(c.offset, c.length, ...new Array(c.newLength));
            }
        }
    }
    exports.ArrayEdit = ArrayEdit;
    class SingleArrayEdit {
        constructor(offset, length, newLength) {
            this.offset = offset;
            this.length = length;
            this.newLength = newLength;
        }
        toString() {
            return `[${this.offset}, +${this.length}) -> +${this.newLength}}`;
        }
    }
    exports.SingleArrayEdit = SingleArrayEdit;
    /**
     * Can only be called with increasing values of `index`.
    */
    class MonotonousIndexTransformer {
        static fromMany(transformations) {
            // TODO improve performance by combining transformations first
            const transformers = transformations.map(t => new MonotonousIndexTransformer(t));
            return new CombinedIndexTransformer(transformers);
        }
        constructor(transformation) {
            this.transformation = transformation;
            this.idx = 0;
            this.offset = 0;
        }
        /**
         * Precondition: index >= previous-value-of(index).
         */
        transform(index) {
            let nextChange = this.transformation.edits[this.idx];
            while (nextChange && nextChange.offset + nextChange.length <= index) {
                this.offset += nextChange.newLength - nextChange.length;
                this.idx++;
                nextChange = this.transformation.edits[this.idx];
            }
            // assert nextChange === undefined || index < nextChange.offset + nextChange.length
            if (nextChange && nextChange.offset <= index) {
                // Offset is touched by the change
                return undefined;
            }
            return index + this.offset;
        }
    }
    exports.MonotonousIndexTransformer = MonotonousIndexTransformer;
    class CombinedIndexTransformer {
        constructor(transformers) {
            this.transformers = transformers;
        }
        transform(index) {
            for (const transformer of this.transformers) {
                const result = transformer.transform(index);
                if (result === undefined) {
                    return undefined;
                }
                index = result;
            }
            return index;
        }
    }
    exports.CombinedIndexTransformer = CombinedIndexTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlPcGVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dE1hdGUvYnJvd3Nlci9hcnJheU9wZXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBYSxTQUFTO1FBR3JCO1FBQ0M7O1dBRUc7UUFDSCxLQUFpQztZQUVqQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBQSxrQkFBUyxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSx5QkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELFlBQVksQ0FBQyxLQUFZO1lBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDNUQ7UUFDRixDQUFDO0tBQ0Q7SUFsQkQsOEJBa0JDO0lBRUQsTUFBYSxlQUFlO1FBQzNCLFlBQ2lCLE1BQWMsRUFDZCxNQUFjLEVBQ2QsU0FBaUI7WUFGakIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQzlCLENBQUM7UUFFTCxRQUFRO1lBQ1AsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLE1BQU0sSUFBSSxDQUFDLE1BQU0sU0FBUyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7UUFDbkUsQ0FBQztLQUNEO0lBVkQsMENBVUM7SUFNRDs7TUFFRTtJQUNGLE1BQWEsMEJBQTBCO1FBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBNEI7WUFDbEQsOERBQThEO1lBQzlELE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsT0FBTyxJQUFJLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFLRCxZQUE2QixjQUF5QjtZQUF6QixtQkFBYyxHQUFkLGNBQWMsQ0FBVztZQUg5QyxRQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1IsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUduQixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxTQUFTLENBQUMsS0FBYTtZQUN0QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFnQyxDQUFDO1lBQ3BGLE9BQU8sVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUU7Z0JBQ3BFLElBQUksQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1gsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNqRDtZQUNELG1GQUFtRjtZQUVuRixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRTtnQkFDN0Msa0NBQWtDO2dCQUNsQyxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDNUIsQ0FBQztLQUNEO0lBaENELGdFQWdDQztJQUVELE1BQWEsd0JBQXdCO1FBQ3BDLFlBQ2tCLFlBQWlDO1lBQWpDLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUMvQyxDQUFDO1FBRUwsU0FBUyxDQUFDLEtBQWE7WUFDdEIsS0FBSyxNQUFNLFdBQVcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3pCLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtnQkFDRCxLQUFLLEdBQUcsTUFBTSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRDtJQWZELDREQWVDIn0=