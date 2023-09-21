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
            const model = (0, profilingModel_1.$C$b)(profile);
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
            const searchTree = ternarySearchTree_1.$Hh.forUris();
            searchTree.fill(categories);
            // cost by categories
            const model = (0, profilingModel_1.$C$b)(profile);
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
            result += (0, path_1.$ae)(frame.url);
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
        const root = profilingModel_1.$D$b.root();
        const locationIds = getHeaviestLocationIds(model, topN);
        for (const node of model.nodes) {
            if (locationIds.has(node.locationId)) {
                (0, profilingModel_1.$E$b)(root, node, model);
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
//# sourceMappingURL=profileAnalysisWorker.js.map