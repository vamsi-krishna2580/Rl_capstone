import * as tf from '@tensorflow/tfjs';

export class ReplayBuffer {
  private buffer: any[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  add(experience: any) {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(experience);
  }

  sample(batchSize: number) {
    const indices = Array.from({ length: batchSize }, () => Math.floor(Math.random() * this.buffer.length));
    return indices.map(i => this.buffer[i]);
  }

  get length() {
    return this.buffer.length;
  }
}

export class DQNAgent {
  private model: tf.LayersModel;
  private targetModel: tf.LayersModel;
  private buffer: ReplayBuffer;
  private epsilon: number = 1.0;
  private epsilonMin: number = 0.01;
  private epsilonDecay: number = 0.995;
  private gamma: number = 0.95;
  private learningRate: number = 0.001;
  private stateSize: number;
  private actionSize: number;

  constructor(stateSize: number, actionSize: number) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.model = this.createModel();
    this.targetModel = this.createModel();
    this.updateTargetModel();
    this.buffer = new ReplayBuffer(2000);
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [this.stateSize] }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: this.actionSize, activation: 'linear' }));
    model.compile({ optimizer: tf.train.adam(this.learningRate), loss: 'meanSquaredError' });
    return model;
  }

  updateTargetModel() {
    this.targetModel.setWeights(this.model.getWeights());
  }

  remember(state: number[], action: number, reward: number, nextState: number[], done: boolean) {
    this.buffer.add({ state, action, reward, nextState, done });
  }

  act(state: number[]): number {
    if (Math.random() <= this.epsilon) {
      return Math.floor(Math.random() * this.actionSize);
    }
    return tf.tidy(() => {
      const qValues = this.model.predict(tf.tensor2d([state])) as tf.Tensor;
      return qValues.argMax(1).dataSync()[0];
    });
  }

  async train(batchSize: number) {
    if (this.buffer.length < batchSize) return;

    const batch = this.buffer.sample(batchSize);
    const states = tf.tensor2d(batch.map(e => e.state));
    const nextStates = tf.tensor2d(batch.map(e => e.nextState));

    const currentQ = this.model.predict(states) as tf.Tensor;
    const nextQ = this.targetModel.predict(nextStates) as tf.Tensor;

    const updatedQ = currentQ.arraySync() as number[][];
    const nextQValues = nextQ.arraySync() as number[][];

    batch.forEach((e, i) => {
      const target = e.done ? e.reward : e.reward + this.gamma * Math.max(...nextQValues[i]);
      updatedQ[i][e.action] = target;
    });

    await this.model.fit(states, tf.tensor2d(updatedQ), { epochs: 1, verbose: 0 });

    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }

    states.dispose();
    nextStates.dispose();
    currentQ.dispose();
    nextQ.dispose();
  }
}
