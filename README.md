# RL Delivery Route Optimization System

A production-ready system that uses Deep Q-Networks (DQN) to optimize delivery routes in real-time.

## Architecture

- **Environment**: Custom simulation of a delivery city with dynamic traffic and time constraints.
- **Agent**: DQN implementation using TensorFlow.js with Experience Replay and Target Networks.
- **Backend**: Express.js API serving as the fleet management and optimization engine.
- **Frontend**: React-based dashboard for real-time visualization and analytics.

## Features

- **Dynamic Routing**: Adapts to traffic changes and new delivery requests.
- **RL Training**: On-the-fly training and inference.
- **Visualization**: Live map view of the delivery progress.
- **Analytics**: Performance tracking (delivery time, efficiency).

## Setup

1. `npm install`
2. `npm run dev`
