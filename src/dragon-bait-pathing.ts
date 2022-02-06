import {Location} from "./location";
import * as _ from 'lodash';
import {Wall} from "./wall";

type Path = {
    locations: Location[],
    cost: number
};

type FirstSteps = {
    locations: Location[],
    cost: number
}

type Edge = {
    from: string,
    to: string
}

function reconstruct_path(cameFrom: Map<string, string>, end: string, totalCost: number): Path {
    let current = end;
    let total_path = [current];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        total_path.unshift(current);
    }
    return {
        locations: total_path.map(s => locationFromString(s)),
        cost: totalCost
    };
}

export function possibleMoves(start: Location, goals: Location[], walls: Wall[]): Location[] {
    const firstSteps = goals.map(goal => possibleMovesForSingleGoal(start, goal, walls));
    const optimalCost = _.min(firstSteps.map(f => f.cost));
    return firstSteps.filter(f => f.cost === optimalCost).flatMap(f => f.locations);
}

function possibleMovesForSingleGoal(start: Location, goal: Location, walls: Wall[]): FirstSteps {
    const blockedEdges: Edge[] = [];
    const possibleMoves: Location[] = [];
    let optimalPath = aStar(start, goal, walls, blockedEdges);
    let optimalPathCost = null;
    while (optimalPath) {
        if (optimalPathCost === null) {
            optimalPathCost = optimalPath.cost;
        } else if (optimalPath.cost > optimalPathCost) {
            return {
                locations: _.uniqWith(possibleMoves, _.isEqual),
                cost: optimalPathCost
            };
        }

        possibleMoves.push(optimalPath.locations[1]);
        blockedEdges.push(
            {
                from: stringFromLocation(optimalPath.locations[optimalPath.locations.length - 2]),
                to: stringFromLocation(optimalPath.locations[optimalPath.locations.length - 1])
            }
        );

        optimalPath = aStar(start, goal, walls, blockedEdges);
    }

    return {
        locations: _.uniqWith(possibleMoves, _.isEqual),
        cost: optimalPathCost || Infinity
    };
}

// A* finds a path from start to goal.
// h is the heuristic function. h(n) estimates the cost to reach goal from node n.
function aStar(start: Location, goal: Location, walls: Wall[], excludedEdges: Edge[]): Path | null {
    const startAsString = stringFromLocation(start);
    const goalAsString = stringFromLocation(goal);

    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = [startAsString];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
    // to n currently known.
    let cameFrom = new Map<string, string>()

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    let gScore = new Map<string, number>()
    gScore.set(startAsString, 0)

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    let fScore = new Map<string, number>();
    fScore.set(startAsString, h(startAsString, goalAsString))

    while (!_.isEmpty(openSet)) {
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        let current = _.minBy(openSet, location => getOrDefault(fScore, location))!;

        if (current === goalAsString) {
            return reconstruct_path(cameFrom, current, gScore.get(current)!);
        }

        _.pull(openSet, current);
        for (let neighbor of neighbors(current, excludedEdges)) {
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            let tentative_gScore = getOrDefault(gScore, current) + d(locationFromString(current), locationFromString(neighbor), walls)
            if (tentative_gScore < getOrDefault(gScore, neighbor)) {
                // This path to neighbor is better than any previous one. Record it!
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentative_gScore)
                fScore.set(neighbor, tentative_gScore + h(neighbor, goalAsString))
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // Open set is empty but goal was never reached
    return null;
}

function neighbors(locationAsString: string, excludedEdges: Edge[]): string[] {
    const location = locationFromString(locationAsString);
    const possibleNeighbors = [
        {row: location.row, column: location.column + 1},
        {row: location.row, column: location.column - 1},
        {row: location.row + 1, column: location.column},
        {row: location.row - 1, column: location.column},
    ];

    const neighborStrings = possibleNeighbors.filter(l => l.row >= 0 && l.row <= 4 && l.column >= 0 && l.column <= 4)
        .map(l => stringFromLocation(l));

    let excludedNeighbors = excludedEdges.filter(e => e.from === locationAsString).map(e => e.to);

    return _.without(neighborStrings, ...excludedNeighbors);
}

function getOrDefault(map: Map<string, number>, key: string): number {
    const value = map.get(key);
    if (value !== undefined) {
        return value;
    } else {
        return Infinity;
    }
}

function d(current: Location, neighbor: Location, walls: Wall[]) {
    if (findBlockingWall(walls, current, neighbor)) {
        return 2
    } else {
        return 1;
    }
}

function h(currentString: string, goalString: string) {
    const current = locationFromString(currentString);
    const goal = locationFromString(goalString);
    return Math.abs(current.row - goal.row) + Math.abs(current.column - goal.column);
}

function findBlockingWall(walls: Wall[], initialLocation: Location, newLocation: Location): Wall | undefined {
    return _.find(walls, wall => isBetween(wall, initialLocation, newLocation));
}

function isBetween(wall: Wall, initialLocation: Location, newLocation: Location): boolean {
    return (_.isEqual(initialLocation, wall.from) && _.isEqual(newLocation, wall.to))
        || (_.isEqual(initialLocation, wall.to) && _.isEqual(newLocation, wall.from));
}

function stringFromLocation(location: Location): string {
    return location.row + ',' + location.column;
}

function locationFromString(s: string): Location {
    const split = s.split(',');
    return {row: +split[0], column: +split[1]};
}