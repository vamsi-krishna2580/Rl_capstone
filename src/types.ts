/**
 * Types for the Delivery RL System
 */

export interface Location {
  id: string;
  x: number;
  y: number;
  isDepot: boolean;
}

export interface DeliveryRequest {
  id: string;
  locationId: string;
  deadline: number;
  completed: boolean;
  assignedAt?: number;
}

export interface State {
  currentLocationId: string;
  remainingDeliveries: string[];
  timeElapsed: number;
  trafficFactor: number;
}

export interface StepResult {
  state: State;
  reward: number;
  done: boolean;
  info: any;
}

export interface Metrics {
  totalDeliveries: number;
  completedDeliveries: number;
  totalTime: number;
  totalDistance: number;
  avgEfficiency: number;
}
