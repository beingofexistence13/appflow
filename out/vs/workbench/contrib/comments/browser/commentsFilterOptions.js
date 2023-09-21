/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/strings"], function (require, exports, filters_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterOptions = void 0;
    class FilterOptions {
        static { this._filter = filters_1.matchesFuzzy2; }
        static { this._messageFilter = filters_1.matchesFuzzy; }
        constructor(filter, showResolved, showUnresolved) {
            this.filter = filter;
            this.showResolved = true;
            this.showUnresolved = true;
            filter = filter.trim();
            this.showResolved = showResolved;
            this.showUnresolved = showUnresolved;
            const negate = filter.startsWith('!');
            this.textFilter = { text: (negate ? strings.ltrim(filter, '!') : filter).trim(), negate };
        }
    }
    exports.FilterOptions = FilterOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNGaWx0ZXJPcHRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50c0ZpbHRlck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsYUFBYTtpQkFFVCxZQUFPLEdBQVksdUJBQWEsQUFBekIsQ0FBMEI7aUJBQ2pDLG1CQUFjLEdBQVksc0JBQVksQUFBeEIsQ0FBeUI7UUFNdkQsWUFDVSxNQUFjLEVBQ3ZCLFlBQXFCLEVBQ3JCLGNBQXVCO1lBRmQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUxmLGlCQUFZLEdBQVksSUFBSSxDQUFDO1lBQzdCLG1CQUFjLEdBQVksSUFBSSxDQUFDO1lBUXZDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDakMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFFckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDM0YsQ0FBQzs7SUFwQkYsc0NBcUJDIn0=