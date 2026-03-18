import { Location, DeliveryRequest, State, StepResult } from '../types';

export class DeliveryEnvironment {
  private locations: Location[];
  private requests: DeliveryRequest[];
  private currentLocationId: string;
  private timeElapsed: number;
  private trafficFactor: number;
  private maxTime: number = 1000;

  constructor(locations: Location[], requests: DeliveryRequest[]) {
    this.locations = locations;
    this.requests = requests;
    this.currentLocationId = locations.find(l => l.isDepot)?.id || locations[0].id;
    this.timeElapsed = 0;
    this.trafficFactor = 1.0;
  }

  reset(): State {
    this.timeElapsed = 0;
    this.trafficFactor = 1.0;
    this.requests.forEach(r => r.completed = false);
    this.currentLocationId = this.locations.find(l => l.isDepot)?.id || this.locations[0].id;
    return this.getState();
  }

  getState(): State {
    return {
      currentLocationId: this.currentLocationId,
      remainingDeliveries: this.requests.filter(r => !r.completed).map(r => r.id),
      timeElapsed: this.timeElapsed,
      trafficFactor: this.trafficFactor
    };
  }

  step(actionLocationId: string): StepResult {
    const prevLoc = this.locations.find(l => l.id === this.currentLocationId)!;
    const nextLoc = this.locations.find(l => l.id === actionLocationId)!;

    // Calculate distance
    const distance = Math.sqrt(
      Math.pow(nextLoc.x - prevLoc.x, 2) + Math.pow(nextLoc.y - prevLoc.y, 2)
    );

    // Dynamic traffic update
    this.trafficFactor = 0.5 + Math.random() * 1.5; // Random traffic fluctuation
    const travelTime = distance * this.trafficFactor;
    this.timeElapsed += travelTime;

    // Update state
    this.currentLocationId = actionLocationId;

    // Check for completed delivery
    const request = this.requests.find(r => r.locationId === actionLocationId && !r.completed);
    let reward = -travelTime * 0.1; // Small penalty for travel time

    if (request) {
      request.completed = true;
      reward += 10; // Large bonus for completion

      // Deadline penalty
      if (this.timeElapsed > request.deadline) {
        reward -= (this.timeElapsed - request.deadline) * 0.5;
      }
    }

    const done = this.requests.every(r => r.completed) || this.timeElapsed >= this.maxTime;

    return {
      state: this.getState(),
      reward,
      done,
      info: { travelTime, distance }
    };
  }
}
