import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Activity,
  Clock,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { performanceMonitor, useAnimationFrame } from '../utils/performance.js';

const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    memoryLimit: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    domNodes: 0,
    renderCount: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef([]);
  const renderCountRef = useRef(0);

  // FPS and frame time calculation
  useAnimationFrame((deltaTime) => {
    frameCountRef.current++;
    const now = performance.now();

    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));

      // Keep FPS history for trend analysis
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 30) {
        fpsHistoryRef.current.shift();
      }

      setMetrics(prev => ({
        ...prev,
        fps,
        frameTime: deltaTime
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  // Performance metrics collection
  useEffect(() => {
    if (!enabled || !isVisible) return;

    const updateMetrics = () => {
      // Memory usage
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          memoryLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        }));
      }

      // DOM nodes count
      const domNodes = document.querySelectorAll('*').length;

      // Core web vitals from performance monitor
      const webVitals = performanceMonitor.getAllMetrics();

      setMetrics(prev => ({
        ...prev,
        domNodes,
        lcp: webVitals.lcp || 0,
        fid: webVitals.fid || 0,
        cls: webVitals.cls || 0,
        renderCount: renderCountRef.current
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, [enabled, isVisible]);

  // Component render tracking
  useEffect(() => {
    renderCountRef.current++;
  });

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.shiftKey && e.ctrlKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  // Performance status indicators
  const getPerformanceStatus = (metric, value) => {
    const thresholds = {
      fps: { good: 55, poor: 30 },
      frameTime: { good: 16.67, poor: 33.33 },
      memoryUsage: { good: 50, poor: 100 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      domNodes: { good: 1000, poor: 3000 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (metric === 'frameTime') {
      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'fair';
      return 'poor';
    } else {
      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'fair';
      return 'poor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle size={12} className="text-green-400" />;
      case 'fair': return <AlertTriangle size={12} className="text-yellow-400" />;
      case 'poor': return <XCircle size={12} className="text-red-400" />;
      default: return <Minus size={12} className="text-gray-400" />;
    }
  };

  const getFPSTrend = () => {
    if (fpsHistoryRef.current.length < 2) return 'stable';

    const recent = fpsHistoryRef.current.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = fpsHistoryRef.current.slice(-10, -5);
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (avg > olderAvg + 5) return 'up';
    if (avg < olderAvg - 5) return 'down';
    return 'stable';
  };

  const formatBytes = (bytes) => {
    return `${bytes} MB`;
  };

  const formatTime = (ms) => {
    return `${ms.toFixed(1)}ms`;
  };

  if (!enabled) return null;

  return (
    <>
      {/* Toggle Button */}
      {!isVisible && (
        <motion.button
          className="fixed bottom-4 right-4 z-50 p-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          onClick={() => setIsVisible(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Performance Monitor (Ctrl+Shift+P)"
        >
          <Activity size={16} />
        </motion.button>
      )}

      {/* Performance Monitor Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl text-white text-xs font-mono shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Monitor size={14} className="text-blue-400" />
                <span className="font-semibold">Performance</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minus size={12} /> : <TrendingUp size={12} />}
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Hide"
                >
                  <EyeOff size={12} />
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-3 space-y-2">
              {/* Frame Rate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>FPS</span>
                  {getStatusIcon(getPerformanceStatus('fps', metrics.fps))}
                  {getFPSTrend() === 'up' && <TrendingUp size={10} className="text-green-400" />}
                  {getFPSTrend() === 'down' && <TrendingDown size={10} className="text-red-400" />}
                </div>
                <span className={`font-semibold ${
                  getPerformanceStatus('fps', metrics.fps) === 'good' ? 'text-green-400' :
                  getPerformanceStatus('fps', metrics.fps) === 'fair' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.fps}
                </span>
              </div>

              {/* Frame Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={12} />
                  <span>Frame</span>
                  {getStatusIcon(getPerformanceStatus('frameTime', metrics.frameTime))}
                </div>
                <span>{formatTime(metrics.frameTime)}</span>
              </div>

              {/* Memory Usage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap size={12} />
                  <span>Memory</span>
                  {getStatusIcon(getPerformanceStatus('memoryUsage', metrics.memoryUsage))}
                </div>
                <span>
                  {formatBytes(metrics.memoryUsage)} / {formatBytes(metrics.memoryLimit)}
                </span>
              </div>

              {/* Expanded Metrics */}
              {isExpanded && (
                <motion.div
                  className="space-y-2 pt-2 mt-2 border-t border-white/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Core Web Vitals */}
                  <div className="text-blue-300 font-semibold mb-1">Core Web Vitals</div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>LCP</span>
                      {getStatusIcon(getPerformanceStatus('lcp', metrics.lcp))}
                    </div>
                    <span>{formatTime(metrics.lcp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>FID</span>
                      {getStatusIcon(getPerformanceStatus('fid', metrics.fid))}
                    </div>
                    <span>{formatTime(metrics.fid)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>CLS</span>
                      {getStatusIcon(getPerformanceStatus('cls', metrics.cls))}
                    </div>
                    <span>{metrics.cls.toFixed(3)}</span>
                  </div>

                  {/* DOM & Renders */}
                  <div className="text-purple-300 font-semibold mb-1 pt-2">Resources</div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>DOM Nodes</span>
                      {getStatusIcon(getPerformanceStatus('domNodes', metrics.domNodes))}
                    </div>
                    <span>{metrics.domNodes.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Renders</span>
                    <span>{metrics.renderCount}</span>
                  </div>

                  {/* Memory Usage Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Memory Usage</span>
                      <span>{Math.round((metrics.memoryUsage / metrics.memoryLimit) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          metrics.memoryUsage / metrics.memoryLimit > 0.8 ? 'bg-red-400' :
                          metrics.memoryUsage / metrics.memoryLimit > 0.6 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min(100, (metrics.memoryUsage / metrics.memoryLimit) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* FPS History Graph */}
                  <div className="mt-2">
                    <div className="text-xs mb-1">FPS History</div>
                    <div className="flex items-end space-x-0.5 h-8">
                      {fpsHistoryRef.current.slice(-20).map((fps, index) => (
                        <div
                          key={index}
                          className={`w-1 transition-all duration-200 ${
                            fps >= 55 ? 'bg-green-400' :
                            fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ height: `${(fps / 60) * 100}%` }}
                          title={`${fps} FPS`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-white/10 text-center text-white/60">
              <span>Ctrl+Shift+P to toggle</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PerformanceMonitor;
