'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  panelName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in [${this.props.panelName || 'Studio Panel'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#FAF8F5] border border-[#C93B2B]/40 rounded-xl p-8 text-center space-y-4 my-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-[#C93B2B] flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#111625]">
              {this.props.panelName || 'Studio Panel'} Encountered a Display Interruption
            </h3>
            <p className="text-xs font-mono text-[#525866] mt-1 max-w-md mx-auto">
              The isolated panel caught an unhandled rendering condition. Other studio panels remain fully active and unaffected.
            </p>
            {this.state.error && (
              <div className="mt-3 p-2.5 bg-white border border-[#DFDBD2] rounded text-[11px] font-mono text-red-700 max-w-lg mx-auto overflow-x-auto text-left">
                {this.state.error.message}
              </div>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 bg-[#162A45] hover:bg-[#0E1A2B] text-white text-xs font-mono font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {this.props.panelName || 'Panel'}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
