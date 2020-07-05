// @flow
import { Location } from "./location";
import { isEqual } from "lodash";

export class Wall {
    from: Location;
    to: Location;

    constructor(from: Location, to: Location) {
        this.from = from;
        this.to = to;
    }

    isBetween(initialLocation: Location, newLocation: Location) {
        return (isEqual(initialLocation, this.from) && isEqual(newLocation, this.to)) 
            || (isEqual(initialLocation, this.to) && isEqual(newLocation, this.from));
    }
      
}