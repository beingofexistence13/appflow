/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/platform/extensions/common/extensions"], function (require, exports, arrays_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Query = void 0;
    class Query {
        constructor(value, sortBy, groupBy) {
            this.value = value;
            this.sortBy = sortBy;
            this.groupBy = groupBy;
            this.value = value.trim();
        }
        static suggestions(query) {
            const commands = ['installed', 'updates', 'enabled', 'disabled', 'builtin', 'featured', 'popular', 'recommended', 'recentlyPublished', 'workspaceUnsupported', 'deprecated', 'sort', 'category', 'tag', 'ext', 'id'];
            const subcommands = {
                'sort': ['installs', 'rating', 'name', 'publishedDate', 'updateDate'],
                'category': extensions_1.EXTENSION_CATEGORIES.map(c => `"${c.toLowerCase()}"`),
                'tag': [''],
                'ext': [''],
                'id': ['']
            };
            const queryContains = (substr) => query.indexOf(substr) > -1;
            const hasSort = subcommands.sort.some(subcommand => queryContains(`@sort:${subcommand}`));
            const hasCategory = subcommands.category.some(subcommand => queryContains(`@category:${subcommand}`));
            return (0, arrays_1.flatten)(commands.map(command => {
                if (hasSort && command === 'sort' || hasCategory && command === 'category') {
                    return [];
                }
                if (command in subcommands) {
                    return subcommands[command]
                        .map(subcommand => `@${command}:${subcommand}${subcommand === '' ? '' : ' '}`);
                }
                else {
                    return queryContains(`@${command}`) ? [] : [`@${command} `];
                }
            }));
        }
        static parse(value) {
            let sortBy = '';
            value = value.replace(/@sort:(\w+)(-\w*)?/g, (match, by, order) => {
                sortBy = by;
                return '';
            });
            let groupBy = '';
            value = value.replace(/@group:(\w+)(-\w*)?/g, (match, by, order) => {
                groupBy = by;
                return '';
            });
            return new Query(value, sortBy, groupBy);
        }
        toString() {
            let result = this.value;
            if (this.sortBy) {
                result = `${result}${result ? ' ' : ''}@sort:${this.sortBy}`;
            }
            if (this.groupBy) {
                result = `${result}${result ? ' ' : ''}@group:${this.groupBy}`;
            }
            return result;
        }
        isValid() {
            return !/@outdated/.test(this.value);
        }
        equals(other) {
            return this.value === other.value && this.sortBy === other.sortBy;
        }
    }
    exports.Query = Query;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUXVlcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25RdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSxLQUFLO1FBRWpCLFlBQW1CLEtBQWEsRUFBUyxNQUFjLEVBQVMsT0FBZTtZQUE1RCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUFTLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDOUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBYTtZQUMvQixNQUFNLFFBQVEsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQVUsQ0FBQztZQUM5TixNQUFNLFdBQVcsR0FBRztnQkFDbkIsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQztnQkFDckUsVUFBVSxFQUFFLGlDQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUM7Z0JBQ2pFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDWCxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ0QsQ0FBQztZQUVYLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLGFBQWEsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRHLE9BQU8sSUFBQSxnQkFBTyxFQUNiLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksT0FBTyxJQUFJLE9BQU8sS0FBSyxNQUFNLElBQUksV0FBVyxJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUU7b0JBQzNFLE9BQU8sRUFBRSxDQUFDO2lCQUNWO2dCQUNELElBQUksT0FBTyxJQUFJLFdBQVcsRUFBRTtvQkFDM0IsT0FBUSxXQUFpRCxDQUFDLE9BQU8sQ0FBQzt5QkFDaEUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLElBQUksVUFBVSxHQUFHLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztpQkFDaEY7cUJBQ0k7b0JBQ0osT0FBTyxhQUFhLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO2lCQUM1RDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFhO1lBQ3pCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFVLEVBQUUsS0FBYSxFQUFFLEVBQUU7Z0JBQ2pGLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFVLEVBQUUsS0FBYSxFQUFFLEVBQUU7Z0JBQ2xGLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBRWIsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsUUFBUTtZQUNQLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixNQUFNLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDN0Q7WUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUMvRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELE9BQU87WUFDTixPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFZO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNuRSxDQUFDO0tBQ0Q7SUF6RUQsc0JBeUVDIn0=