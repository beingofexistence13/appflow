/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.processNode = exports.BottomUpNode = exports.buildModel = void 0;
    /**
     * Recursive function that computes and caches the aggregate time for the
     * children of the computed now.
     */
    const computeAggregateTime = (index, nodes) => {
        const row = nodes[index];
        if (row.aggregateTime) {
            return row.aggregateTime;
        }
        let total = row.selfTime;
        for (const child of row.children) {
            total += computeAggregateTime(child, nodes);
        }
        return (row.aggregateTime = total);
    };
    const ensureSourceLocations = (profile) => {
        let locationIdCounter = 0;
        const locationsByRef = new Map();
        const getLocationIdFor = (callFrame) => {
            const ref = [
                callFrame.functionName,
                callFrame.url,
                callFrame.scriptId,
                callFrame.lineNumber,
                callFrame.columnNumber,
            ].join(':');
            const existing = locationsByRef.get(ref);
            if (existing) {
                return existing.id;
            }
            const id = locationIdCounter++;
            locationsByRef.set(ref, {
                id,
                callFrame,
                location: {
                    lineNumber: callFrame.lineNumber + 1,
                    columnNumber: callFrame.columnNumber + 1,
                    // source: {
                    // 	name: maybeFileUrlToPath(callFrame.url),
                    // 	path: maybeFileUrlToPath(callFrame.url),
                    // 	sourceReference: 0,
                    // },
                },
            });
            return id;
        };
        for (const node of profile.nodes) {
            node.locationId = getLocationIdFor(node.callFrame);
            node.positionTicks = node.positionTicks?.map(tick => ({
                ...tick,
                // weirdly, line numbers here are 1-based, not 0-based. The position tick
                // only gives line-level granularity, so 'mark' the entire range of source
                // code the tick refers to
                startLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line - 1,
                    columnNumber: 0,
                }),
                endLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line,
                    columnNumber: 0,
                }),
            }));
        }
        return [...locationsByRef.values()]
            .sort((a, b) => a.id - b.id)
            .map(l => ({ locations: [l.location], callFrame: l.callFrame }));
    };
    /**
     * Computes the model for the given profile.
     */
    const buildModel = (profile) => {
        if (!profile.timeDeltas || !profile.samples) {
            return {
                nodes: [],
                locations: [],
                samples: profile.samples || [],
                timeDeltas: profile.timeDeltas || [],
                // rootPath: profile.$vscode?.rootPath,
                duration: profile.endTime - profile.startTime,
            };
        }
        const { samples, timeDeltas } = profile;
        const sourceLocations = ensureSourceLocations(profile);
        const locations = sourceLocations.map((l, id) => {
            const src = l.locations[0]; //getBestLocation(profile, l.locations);
            return {
                id,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                // category: categorize(l.callFrame, src),
                callFrame: l.callFrame,
                src,
            };
        });
        const idMap = new Map();
        const mapId = (nodeId) => {
            let id = idMap.get(nodeId);
            if (id === undefined) {
                id = idMap.size;
                idMap.set(nodeId, id);
            }
            return id;
        };
        // 1. Created a sorted list of nodes. It seems that the profile always has
        // incrementing IDs, although they are just not initially sorted.
        const nodes = new Array(profile.nodes.length);
        for (let i = 0; i < profile.nodes.length; i++) {
            const node = profile.nodes[i];
            // make them 0-based:
            const id = mapId(node.id);
            nodes[id] = {
                id,
                selfTime: 0,
                aggregateTime: 0,
                locationId: node.locationId,
                children: node.children?.map(mapId) || [],
            };
            for (const child of node.positionTicks || []) {
                if (child.startLocationId) {
                    locations[child.startLocationId].ticks += child.ticks;
                }
            }
        }
        for (const node of nodes) {
            for (const child of node.children) {
                nodes[child].parent = node.id;
            }
        }
        // 2. The profile samples are the 'bottom-most' node, the currently running
        // code. Sum of these in the self time.
        const duration = profile.endTime - profile.startTime;
        let lastNodeTime = duration - timeDeltas[0];
        for (let i = 0; i < timeDeltas.length - 1; i++) {
            const d = timeDeltas[i + 1];
            nodes[mapId(samples[i])].selfTime += d;
            lastNodeTime -= d;
        }
        // Add in an extra time delta for the last sample. `timeDeltas[0]` is the
        // time before the first sample, and the time of the last sample is only
        // derived (approximately) by the missing time in the sum of deltas. Save
        // some work by calculating it here.
        if (nodes.length) {
            nodes[mapId(samples[timeDeltas.length - 1])].selfTime += lastNodeTime;
            timeDeltas.push(lastNodeTime);
        }
        // 3. Add the aggregate times for all node children and locations
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const location = locations[node.locationId];
            location.aggregateTime += computeAggregateTime(i, nodes);
            location.selfTime += node.selfTime;
        }
        return {
            nodes,
            locations,
            samples: samples.map(mapId),
            timeDeltas,
            // rootPath: profile.$vscode?.rootPath,
            duration,
        };
    };
    exports.buildModel = buildModel;
    class BottomUpNode {
        static root() {
            return new BottomUpNode({
                id: -1,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                callFrame: {
                    functionName: '(root)',
                    lineNumber: -1,
                    columnNumber: -1,
                    scriptId: '0',
                    url: '',
                },
            });
        }
        get id() {
            return this.location.id;
        }
        get callFrame() {
            return this.location.callFrame;
        }
        get src() {
            return this.location.src;
        }
        constructor(location, parent) {
            this.location = location;
            this.parent = parent;
            this.children = {};
            this.aggregateTime = 0;
            this.selfTime = 0;
            this.ticks = 0;
            this.childrenSize = 0;
        }
        addNode(node) {
            this.selfTime += node.selfTime;
            this.aggregateTime += node.aggregateTime;
        }
    }
    exports.BottomUpNode = BottomUpNode;
    const processNode = (aggregate, node, model, initialNode = node) => {
        let child = aggregate.children[node.locationId];
        if (!child) {
            child = new BottomUpNode(model.locations[node.locationId], aggregate);
            aggregate.childrenSize++;
            aggregate.children[node.locationId] = child;
        }
        child.addNode(initialNode);
        if (node.parent) {
            (0, exports.processNode)(child, model.nodes[node.parent], model, initialNode);
        }
    };
    exports.processNode = processNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9wcm9maWxpbmcvY29tbW9uL3Byb2ZpbGluZ01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZFaEc7OztPQUdHO0lBQ0gsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLEtBQWEsRUFBRSxLQUFzQixFQUFVLEVBQUU7UUFDOUUsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLElBQUksR0FBRyxDQUFDLGFBQWEsRUFBRTtZQUN0QixPQUFPLEdBQUcsQ0FBQyxhQUFhLENBQUM7U0FDekI7UUFFRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3pCLEtBQUssTUFBTSxLQUFLLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUNqQyxLQUFLLElBQUksb0JBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0lBRUYsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLE9BQXVCLEVBQXNDLEVBQUU7UUFFN0YsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQThFLENBQUM7UUFFN0csTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFNBQXVCLEVBQUUsRUFBRTtZQUNwRCxNQUFNLEdBQUcsR0FBRztnQkFDWCxTQUFTLENBQUMsWUFBWTtnQkFDdEIsU0FBUyxDQUFDLEdBQUc7Z0JBQ2IsU0FBUyxDQUFDLFFBQVE7Z0JBQ2xCLFNBQVMsQ0FBQyxVQUFVO2dCQUNwQixTQUFTLENBQUMsWUFBWTthQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLENB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