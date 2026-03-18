import { DeliveryEnvironment } from './environment';
import { DQNAgent } from './dqn';
import { Location, DeliveryRequest, State } from '../types';

export class RouteOptimizer {
  private env: DeliveryEnvironment;
  private agent: DQNAgent;
  private locations: Location[];

  constructor(locations: Location[], requests: DeliveryRequest[]) {
    this.locations = locations;
    this.env = new DeliveryEnvironment(locations, requests);
    // State size: x, y, time, traffic, and binary flags for each request
    const stateSize = 4 + requests.length;
    this.agent = new DQNAgent(stateSize, locations.length);
  }

  private stateToVector(state: State): number[] {
    const loc = this.locations.find(l => l.id === state.currentLocationId)!;
    const deliveryFlags = this.locations.map(l => {
      const req = this.env.getState().remainingDeliveries.includes(l.id) ? 1 : 0;
      return req;
    });
    // Simplified state vector
    return [loc.x / 100, loc.y / 100, state.timeElapsed / 1000, state.trafficFactor, ...deliveryFlags.slice(0, this.stateSize - 4)];
  }

  private get stateSize(): number {
    return 4 + this.locations.length;
  }

  async train(episodes: number = 100) {
    for (let e = 0; e < episodes; e++) {
      let state = this.env.reset();
      let totalReward = 0;
      let done = false;

      while (!done) {
        const stateVec = this.stateToVector(state);
        const actionIdx = this.agent.act(stateVec);
        const actionLocId = this.locations[actionIdx].id;

        const { state: nextState, reward, done: isDone } = this.env.step(actionLocId);
        const nextStateVec = this.stateToVector(nextState);

        this.agent.remember(stateVec, actionIdx, reward, nextStateVec, isDone);
        state = nextState;
        totalReward += reward;
        done = isDone;

        await this.agent.train(32);
      }

      if (e % 10 === 0) {
        this.agent.updateTargetModel();
        console.log(`Episode ${e}: Total Reward = ${totalReward.toFixed(2)}`);
      }
    }
  }

  optimizeRoute(state: State): string {
    const stateVec = this.stateToVector(state);
    const actionIdx = this.agent.act(stateVec); // In inference, epsilon should be 0
    return this.locations[actionIdx].id;
  }
}
