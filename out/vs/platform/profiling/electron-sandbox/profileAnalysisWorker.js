/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/platform/profiling/common/profiling", "vs/platform/profiling/common/profilingModel"], function (require, exports, path_1, ternarySearchTree_1, uri_1, profiling_1, profilingModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    function create() {
        return new ProfileAnalysisWorker();
    }
    exports.create = create;
    class ProfileAnalysisWorker {
        analyseBottomUp(profile) {
            if (!profiling_1.Utils.isValidProfile(profile)) {
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            const model = (0, profilingModel_1.buildModel)(profile);
            const samples = bottomUp(model, 5)
                .filter(s => !s.isSpecial);
            if (samples.length === 0 || samples[0].percentage < 10) {
                // ignore this profile because 90% of the time is spent inside "special" frames
                // like idle, GC, or program
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            return { kind: 2 /* ProfilingOutput.Interesting */, samples };
        }
        analyseByUrlCategory(profile, categories) {
            // build search tree
            const searchTree = ternarySearchTree_1.TernarySearchTree.forUris();
            searchTree.fill(categories);
            // cost by categories
            const model = (0, profilingModel_1.buildModel)(profile);
            const aggegrateByCategory = new Map();
            for (const node of model.nodes) {
                const loc = model.locations[node.locationId];
                let category;
                try {
                    category = searchTree.findSubstr(uri_1.URI.parse(loc.callFrame.url));
                }
                catch {
                    // ignore
                }
                if (!category) {
                    category = printCallFrameShort(loc.callFrame);
                }
                const value = aggegrateByCategory.get(category) ?? 0;
                const newValue = value + node.selfTime;
                aggegrateByCategory.set(category, newValue);
            }
            const result = [];
            for (const [key, value] of aggegrateByCategory) {
                result.push([key, value]);
            }
            return result;
        }
    }
    function isSpecial(call) {
        return call.functionName.startsWith('(') && call.functionName.endsWith(')');
    }
    function printCallFrameShort(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += '#';
            result += (0, path_1.basename)(frame.url);
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
        }
        return result;
    }
    function printCallFrameStackLike(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += ' (';
            result += frame.url;
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
            result += ')';
        }
        return result;
    }
    function getHeaviestLocationIds(model, topN) {
        const stackSelfTime = {};
        for (const node of model.nodes) {
            stackSelfTime[node.locationId] = (stackSelfTime[node.locationId] || 0) + node.selfTime;
        }
        const locationIds = Object.entries(stackSelfTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topN)
            .map(([locationId]) => Number(locationId));
        return new Set(locationIds);
    }
    function bottomUp(model, topN) {
        const root = profilingModel_1.BottomUpNode.root();
        const locationIds = getHeaviestLocationIds(model, topN);
        for (const node of model.nodes) {
            if (locationIds.has(node.locationId)) {
                (0, profilingModel_1.processNode)(root, node, model);
                root.addNode(node);
            }
        }
        const result = Object.values(root.children)
            .sort((a, b) => b.selfTime - a.selfTime)
            .slice(0, topN);
        const samples = [];
        for (const node of result) {
            const sample = {
                selfTime: Math.round(node.selfTime / 1000),
                totalTime: Math.round(node.aggregateTime / 1000),
                location: printCallFrameShort(node.callFrame),
                absLocation: printCallFrameStackLike(node.callFrame),
                url: node.callFrame.url,
                caller: [],
                percentage: Math.round(node.selfTime / (model.duration / 100)),
                isSpecial: isSpecial(node.callFrame)
            };
            // follow the heaviest caller paths
            const stack = [node];
            while (stack.length) {
                const node = stack.pop();
                let top;
                for (const candidate of Object.values(node.children)) {
                    if (!top || top.selfTime < candidate.selfTime) {
                        top = candidate;
                    }
                }
                if (top) {
                    const percentage = Math.round(top.selfTime / (node.selfTime / 100));
                    sample.caller.push({
                        percentage,
                        location: printCallFrameShort(top.callFrame),
                        absLocation: printCallFrameStackLike(top.callFrame),
                    });
                    stack.push(top);
                }
            }
            samples.push(sample);
        }
        return samples;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZUFuYWx5c2lzV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcHJvZmlsaW5nL2VsZWN0cm9uLXNhbmRib3gvcHJvZmlsZUFuYWx5c2lzV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxTQUFnQixNQUFNO1FBQ3JCLE9BQU8sSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFGRCx3QkFFQztJQUVELE1BQU0scUJBQXFCO1FBSTFCLGVBQWUsQ0FBQyxPQUFtQjtZQUNsQyxJQUFJLENBQUMsaUJBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sRUFBRSxJQUFJLG9DQUE0QixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUN6RDtZQUVELE1BQU0sS0FBSyxHQUFHLElBQUEsMkJBQVUsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFNUIsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsRUFBRTtnQkFDdkQsK0VBQStFO2dCQUMvRSw0QkFBNEI7Z0JBQzVCLE9BQU8sRUFBRSxJQUFJLG9DQUE0QixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUN6RDtZQUVELE9BQU8sRUFBRSxJQUFJLHFDQUE2QixFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxPQUFtQixFQUFFLFVBQTBDO1lBRW5GLG9CQUFvQjtZQUNwQixNQUFNLFVBQVUsR0FBRyxxQ0FBaUIsQ0FBQyxPQUFPLEVBQVUsQ0FBQztZQUN2RCxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTVCLHFCQUFxQjtZQUNyQixNQUFNLEtBQUssR0FBRyxJQUFBLDJCQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUV0RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQy9CLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFFBQTRCLENBQUM7Z0JBQ2pDLElBQUk7b0JBQ0gsUUFBUSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQy9EO2dCQUFDLE1BQU07b0JBQ1AsU0FBUztpQkFDVDtnQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNkLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzlDO2dCQUNELE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sUUFBUSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN2QyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsTUFBTSxNQUFNLEdBQXVCLEVBQUUsQ0FBQztZQUN0QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksbUJBQW1CLEVBQUU7Z0JBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMxQjtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNEO0lBRUQsU0FBUyxTQUFTLENBQUMsSUFBa0I7UUFDcEMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxLQUFtQjtRQUMvQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsWUFBWSxJQUFJLGFBQWEsQ0FBQztRQUNqRCxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDZCxNQUFNLElBQUksR0FBRyxDQUFDO1lBQ2QsTUFBTSxJQUFJLElBQUEsZUFBUSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUMxQixNQUFNLElBQUksR0FBRyxDQUFDO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQzthQUMvQjtZQUNELElBQUksS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sSUFBSSxHQUFHLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2FBQ2pDO1NBQ0Q7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLEtBQW1CO1FBQ25ELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFZLElBQUksYUFBYSxDQUFDO1FBQ2pELElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNkLE1BQU0sSUFBSSxJQUFJLENBQUM7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUNwQixJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUMxQixNQUFNLElBQUksR0FBRyxDQUFDO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQzthQUMvQjtZQUNELElBQUksS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sSUFBSSxHQUFHLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsQ0FBQztTQUNkO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxLQUFvQixFQUFFLElBQVk7UUFDakUsTUFBTSxhQUFhLEdBQXFDLEVBQUUsQ0FBQztRQUMzRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDL0IsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUN2RjtRQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO2FBQy9DLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDN0IsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7YUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUU1QyxPQUFPLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxTQUFTLFFBQVEsQ0FBQyxLQUFvQixFQUFFLElBQVk7UUFDbkQsTUFBTSxJQUFJLEdBQUcsNkJBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFeEQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQy9CLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3JDLElBQUEsNEJBQVcsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO1NBQ0Q7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFakIsTUFBTSxPQUFPLEdBQXFCLEVBQUUsQ0FBQztRQUVyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sRUFBRTtZQUUxQixNQUFNLE1BQU0sR0FBbUI7Z0JBQzlCLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDaEQsUUFBUSxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQzdDLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNwRCxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHO2dCQUN2QixNQUFNLEVBQUUsRUFBRTtnQkFDVixVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDOUQsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQ3BDLENBQUM7WUFFRixtQ0FBbUM7WUFDbkMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUcsQ0FBQztnQkFDMUIsSUFBSSxHQUE2QixDQUFDO2dCQUNsQyxLQUFLLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNyRCxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRTt3QkFDOUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztxQkFDaEI7aUJBQ0Q7Z0JBQ0QsSUFBSSxHQUFHLEVBQUU7b0JBQ1IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzt3QkFDbEIsVUFBVTt3QkFDVixRQUFRLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzt3QkFDNUMsV0FBVyxFQUFFLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7cUJBQ25ELENBQUMsQ0FBQztvQkFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQjthQUNEO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUMifQ==