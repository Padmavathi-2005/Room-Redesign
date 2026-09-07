'use client';

import React from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface WorkflowProgressStepperProps {
  steps: WorkflowStep[];
  currentStepIndex?: number;
  error?: string | null;
  className?: string;
}

export default function WorkflowProgressStepper({
  steps,
  currentStepIndex = 0,
  error = null,
  className,
}: WorkflowProgressStepperProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.min(100, Math.round(((completedCount + (steps.some((s) => s.status === 'running') ? 0.5 : 0)) / (steps.length || 1)) * 100));

  return (
    <div className={cn("w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-all duration-300", className)}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
              AI Redesign Pipeline Progress
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              {error ? 'Generation Interrupted' : `Step ${Math.min(steps.length, currentStepIndex + 1)} of ${steps.length} • ${progressPercent}% Complete`}
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-mono shadow-inner">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden mb-5 p-0.5 border border-slate-200/40 dark:border-slate-700/40">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 break-words">{error}</div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id || idx}
              className={cn(
                "flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 border",
                isCompleted && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200",
                isRunning && "bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700/60 text-purple-950 dark:text-purple-100 shadow-md ring-2 ring-purple-500/20",
                isFailed && "bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-200",
                step.status === 'pending' && "bg-slate-50/40 dark:bg-slate-800/20 border-transparent text-slate-400 dark:text-slate-500 opacity-60"
              )}
            >
              {/* Step Icon */}
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                ) : isFailed ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className={cn("text-xs font-bold font-heading truncate", isRunning ? "text-purple-900 dark:text-white" : isCompleted ? "text-emerald-900 dark:text-emerald-300" : "text-slate-700 dark:text-slate-400")}>
                    Step {idx + 1}: {step.title}
                  </h5>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-75">
                    {isCompleted ? '✓ Done' : isRunning ? '⚡ Active' : isFailed ? '✕ Failed' : 'Waiting'}
                  </span>
                </div>
                {step.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
