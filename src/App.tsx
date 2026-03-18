import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Activity, 
  BarChart3, 
  Navigation, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const LOCATIONS = [
  { id: 'depot', x: 50, y: 50, isDepot: true, name: 'Main Depot' },
  { id: 'l1', x: 20, y: 30, isDepot: false, name: 'Downtown Hub' },
  { id: 'l2', x: 80, y: 20, isDepot: false, name: 'North Station' },
  { id: 'l3', x: 70, y: 80, isDepot: false, name: 'East Side' },
  { id: 'l4', x: 30, y: 70, isDepot: false, name: 'West End' },
];

const INITIAL_REQUESTS = [
  { id: 'r1', locationId: 'l1', deadline: 500, completed: false },
  { id: 'r2', locationId: 'l2', deadline: 700, completed: false },
  { id: 'r3', locationId: 'l3', deadline: 300, completed: false },
  { id: 'r4', locationId: 'l4', deadline: 900, completed: false },
];

export default function App() {
  const [currentLoc, setCurrentLoc] = useState('depot');
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [time, setTime] = useState(0);
  const [traffic, setTraffic] = useState(1.0);
  const [history, setHistory] = useState<{time: number, efficiency: number}[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic(0.5 + Math.random() * 1.5);
      setTime(t => t + 1);
      
      setHistory(h => {
        const newH = [...h, { time: h.length, efficiency: 0.7 + Math.random() * 0.3 }];
        return newH.slice(-20);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate RL decision making
    setTimeout(() => {
      const remaining = requests.filter(r => !r.completed);
      if (remaining.length > 0) {
        const next = remaining[0];
        setCurrentLoc(next.locationId);
        setRequests(prev => prev.map(r => r.id === next.id ? { ...r, completed: true } : r));
      } else {
        setCurrentLoc('depot');
      }
      setIsOptimizing(false);
    }, 1000);
  };

  const resetSim = () => {
    setCurrentLoc('depot');
    setRequests(INITIAL_REQUESTS);
    setTime(0);
    setHistory([]);
  };

  const activeLoc = LOCATIONS.find(l => l.id === currentLoc)!;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Navigation className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">RouteOpt DQN</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Dynamic Fleet Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-white/70">System Live</span>
            </div>
            <button 
              onClick={resetSim}
              className="text-xs font-medium text-white/40 hover:text-white transition-colors"
            >
              Reset Simulation
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Status Card */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Real-time Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold tabular-nums">{time}s</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Elapsed Time</p>
              </div>
              <div className="space-y-1">
                <p className={cn(
                  "text-2xl font-bold tabular-nums",
                  traffic > 1.2 ? "text-orange-400" : "text-emerald-400"
                )}>
                  x{traffic.toFixed(1)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Traffic Factor</p>
              </div>
            </div>
            
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full mt-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-white/5"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Compute Next Step
                </>
              )}
            </button>
          </section>

          {/* Delivery Queue */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Delivery Queue
            </h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <div 
                  key={req.id}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between transition-all",
                    req.completed 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-white/5 border-white/10 text-white/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {req.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <div>
                      <p className="text-xs font-bold">{LOCATIONS.find(l => l.id === req.locationId)?.name}</p>
                      <p className="text-[10px] opacity-60">Deadline: {req.deadline}s</p>
                    </div>
                  </div>
                  {req.completed && <span className="text-[10px] font-bold uppercase">Done</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Efficiency Chart */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[240px]">
             <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              DQN Efficiency Trend
            </h2>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181B', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEff)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right Column: Map Visualization */}
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full min-h-[600px] relative overflow-hidden">
            <div className="absolute top-8 left-8 z-10">
              <h2 className="text-xl font-bold tracking-tight">Live Fleet Map</h2>
              <p className="text-sm text-white/40">Visualizing DQN agent navigation</p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              {/* Map Grid */}
              <div className="w-[80%] aspect-square relative border border-white/5 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]">
                
                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {requests.map(req => {
                    const loc = LOCATIONS.find(l => l.id === req.locationId)!;
                    const depot = LOCATIONS.find(l => l.isDepot)!;
                    return (
                      <line 
                        key={req.id}
                        x1={`${depot.x}%`} y1={`${depot.y}%`}
                        x2={`${loc.x}%`} y2={`${loc.y}%`}
                        stroke={req.completed ? "#10b98140" : "#ffffff10"}
                        strokeWidth="1"
                        strokeDasharray="4"
                      />
                    );
                  })}
                </svg>

                {/* Locations */}
                {LOCATIONS.map((loc) => (
                  <motion.div
                    key={loc.id}
                    initial={false}
                    animate={{ scale: currentLoc === loc.id ? 1.2 : 1 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-500",
                      loc.isDepot ? "bg-white border-black" : "bg-black border-white/20 group-hover:border-white",
                      currentLoc === loc.id && "ring-4 ring-emerald-500/30 scale-125"
                    )} />
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] border border-white/10">
                      {loc.name}
                    </div>
                  </motion.div>
                ))}

                {/* Driver/Truck */}
                <motion.div
                  animate={{ left: `${activeLoc.x}%`, top: `${activeLoc.y}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <Truck className="w-6 h-6 text-black" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Driver Alpha
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-8 right-8 flex gap-6 text-[10px] uppercase tracking-widest font-bold text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                Depot
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-white/20" />
                Delivery Point
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Driver
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
