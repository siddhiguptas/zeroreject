'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowRight,
  Database,
  Hash,
  Scale
} from 'lucide-react';
import {
  DigitalTwinGraphNode,
  DigitalTwinGraphEdge,
  DigitalTwinGraphResponse,
  DigitalTwinNodeCategory,
} from '@/types';
import { fetchDigitalTwinGraph } from '@/lib/api-client';

interface EvidenceGraphViewerProps {
  graphData?: DigitalTwinGraphResponse | null;
  sessionId?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export const EvidenceGraphViewer: React.FC<EvidenceGraphViewerProps> = ({
  graphData: propGraphData,
  sessionId,
  loading: propLoading = false,
  onRefresh,
}) => {
  const [internalGraphData, setInternalGraphData] = useState<DigitalTwinGraphResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (sessionId && !propGraphData) {
      loadGraph();
    }
  }, [sessionId, propGraphData]);

  const loadGraph = async () => {
    if (!sessionId) return;
    setInternalLoading(true);
    try {
      const data = await fetchDigitalTwinGraph(sessionId);
      setInternalGraphData(data);
    } catch (e) {
      console.error('Failed to load evidence graph', e);
    } finally {
      setInternalLoading(false);
    }
  };

  const graphData = propGraphData || internalGraphData;
  const loading = propLoading || internalLoading;
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const nodes = useMemo(() => graphData?.nodes || [], [graphData]);
  const edges = useMemo(() => graphData?.edges || [], [graphData]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesCategory =
        categoryFilter === 'ALL' || node.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.value && node.value.toLowerCase().includes(searchQuery.toLowerCase())) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [nodes, categoryFilter, searchQuery]);

  // Selected node details
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Connected edges for selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
  }, [edges, selectedNodeId]);

  // Assign deterministic layout coordinates in 5 logical columns
  const layoutNodes = useMemo(() => {
    // Columns:
    // 0: document
    // 1: field
    // 2: entity
    // 3: requirement
    // 4: portal_field / validation / remediation
    const columnMap: Record<string, number> = {
      document: 0,
      field: 1,
      entity: 2,
      requirement: 3,
      portal_field: 4,
      validation: 4,
      remediation: 4,
    };

    const columnBuckets: Record<number, DigitalTwinGraphNode[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    filteredNodes.forEach((n) => {
      const col = columnMap[n.category] ?? 2;
      columnBuckets[col].push(n);
    });

    const nodePositions: Record<string, { x: number; y: number; node: DigitalTwinGraphNode }> = {};
    const colSpacing = 280;
    const rowSpacing = 110;
    const startX = 60;
    const startY = 60;

    Object.entries(columnBuckets).forEach(([colStr, colNodes]) => {
      const colIndex = parseInt(colStr, 10);
      colNodes.forEach((node, rowIndex) => {
        nodePositions[node.id] = {
          x: startX + colIndex * colSpacing,
          y: startY + rowIndex * rowSpacing,
          node,
        };
      });
    });

    return nodePositions;
  }, [filteredNodes]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.0, Math.max(0.5, prev + delta)));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getCategoryColor = (cat: DigitalTwinNodeCategory) => {
    switch (cat) {
      case 'document':
        return { border: 'border-[#162A45]', bg: 'bg-[#162A45]/5', text: 'text-[#162A45]', badge: 'bg-[#162A45] text-white' };
      case 'field':
        return { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-600 text-white' };
      case 'entity':
        return { border: 'border-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-900', badge: 'bg-indigo-600 text-white' };
      case 'requirement':
        return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', badge: 'bg-amber-600 text-white' };
      case 'portal_field':
        return { border: 'border-teal-400', bg: 'bg-teal-50', text: 'text-teal-900', badge: 'bg-teal-700 text-white' };
      case 'validation':
        return { border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-900', badge: 'bg-rose-600 text-white' };
      case 'remediation':
        return { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-900', badge: 'bg-emerald-700 text-white' };
      default:
        return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-800', badge: 'bg-gray-600 text-white' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'SATISFIED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ VERIFIED</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⚠ WARNING</span>;
      case 'CONFLICT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">✕ CONFLICT</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">PENDING</span>;
    }
  };

  return (
    <div className="relative bg-[#FAF9F5] border border-[#DFDBD2] rounded-xl overflow-hidden shadow-sm flex flex-col h-[700px]">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-[#DFDBD2] z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#162A45] text-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#111625] flex items-center gap-2">
              Application Evidence Graph
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded">
                Live Data-Backed
              </span>
            </h4>
            <p className="text-[11px] text-[#525866]">
              Visual provenance linking raw OCR tokens, normalized entities, statutory requirements &amp; portal schema.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search nodes or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#DFDBD2] rounded-lg focus:outline-none focus:border-[#162A45] w-48 font-sans"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#DFDBD2] rounded-lg px-2.5 py-1.5 font-mono text-[#111625] focus:outline-none focus:border-[#162A45]"
          >
            <option value="ALL">All Categories ({nodes.length})</option>
            <option value="document">Documents</option>
            <option value="field">Extracted Fields</option>
            <option value="entity">Normalized Entities</option>
            <option value="requirement">Statutory Requirements</option>
            <option value="portal_field">Portal Fields</option>
            <option value="validation">Validations &amp; Remediations</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#FAF9F5] border border-[#DFDBD2] rounded-lg p-0.5">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-black transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-black transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-white rounded text-gray-600 hover:text-black transition"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport & Canvas */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, #DFDBD2 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
            <div className="text-center font-mono text-xs text-[#525866] space-y-2">
              <div className="w-6 h-6 border-2 border-[#162A45] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Reconstructing Application Evidence Graph...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="max-w-md space-y-3 font-mono text-xs text-[#525866]">
              <Database className="w-10 h-10 mx-auto text-gray-400 stroke-1" />
              <h5 className="font-serif text-base text-[#111625] font-bold">No Evidence Graph Synthesized Yet</h5>
              <p className="font-sans text-xs">
                Upload custom identity documents in Step 1 or load the 1-Click Evaluation Packet to compile the live evidence graph.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              width: '2400px',
              height: '1600px',
            }}
          >
            {/* SVG Connecting Edges */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                </marker>
                <marker
                  id="arrow-conflict"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#DC2626" />
                </marker>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const srcPos = layoutNodes[edge.source];
                const tgtPos = layoutNodes[edge.target];
                if (!srcPos || !tgtPos) return null;

                const isConnected =
                  selectedNodeId === edge.source || selectedNodeId === edge.target;
                const isConflict = edge.status === 'CONFLICT';
                const strokeColor = isConflict
                  ? '#DC2626'
                  : isConnected
                  ? '#059669'
                  : '#CBD5E1';
                const strokeWidth = isConnected ? 2.5 : 1.5;
                const strokeDasharray = isConflict ? '4,4' : undefined;
                const markerEnd = isConflict
                  ? 'url(#arrow-conflict)'
                  : isConnected
                  ? 'url(#arrow-active)'
                  : 'url(#arrow-default)';

                const startX = srcPos.x + 220;
                const startY = srcPos.y + 35;
                const endX = tgtPos.x;
                const endY = tgtPos.y + 35;
                const midX = (startX + endX) / 2;

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      markerEnd={markerEnd}
                      className="transition-all duration-150"
                    />
                    {edge.details && (
                      <text
                        x={midX}
                        y={(startY + endY) / 2 - 8}
                        textAnchor="middle"
                        fill={isConflict ? '#DC2626' : '#64748B'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="bg-white px-1"
                      >
                        {edge.relation}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render Graph Nodes */}
            {Object.values(layoutNodes).map(({ x, y, node }) => {
              const isSelected = selectedNodeId === node.id;
              const colorInfo = getCategoryColor(node.category);

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  className={`graph-node-card absolute w-[220px] rounded-lg border p-3 bg-white shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md ${
                    colorInfo.border
                  } ${
                    isSelected
                      ? 'ring-2 ring-[#162A45] ring-offset-2 scale-[1.03] z-20 shadow-lg'
                      : 'hover:scale-[1.01]'
                  }`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold tracking-tight ${colorInfo.badge}`}
                    >
                      {node.category.replace('_', ' ')}
                    </span>
                    {getStatusBadge(node.status)}
                  </div>

                  <h5 className="font-semibold text-xs text-[#111625] truncate" title={node.label}>
                    {node.label}
                  </h5>

                  {node.value && (
                    <p className="text-[11px] font-mono text-[#525866] truncate mt-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      {node.value}
                    </p>
                  )}

                  {node.confidence !== null && node.confidence !== undefined && (
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 font-mono">
                      <span>OCR Conf</span>
                      <strong className="text-emerald-700">
                        {Math.round(node.confidence * 100)}%
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contextual Inspector Drawer (Right Panel) */}
      {selectedNode && (
        <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-white border-l border-[#DFDBD2] shadow-2xl p-5 overflow-y-auto z-30 transition-all">
          <div className="flex items-start justify-between pb-3 border-b border-[#DFDBD2]">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#162A45] uppercase tracking-wider block">
                Node Evidence Inspector
              </span>
              <h4 className="font-serif text-base font-bold text-[#111625] mt-0.5">
                {selectedNode.label}
              </h4>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-gray-400 hover:text-black p-1 rounded-md hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 py-4 text-xs font-mono">
            {/* Status & Category */}
            <div className="flex justify-between items-center bg-[#FAF9F5] p-2.5 rounded-lg border border-[#DFDBD2]">
              <span className="text-gray-500 uppercase text-[10px]">Category / Status</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-[#162A45] uppercase">
                  {selectedNode.category}
                </span>
                {getStatusBadge(selectedNode.status)}
              </div>
            </div>

            {/* Value */}
            {selectedNode.value && (
              <div>
                <label className="text-[10px] uppercase text-gray-500 block mb-1">
                  Extracted / Normalized Value
                </label>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-bold break-all">
                  {selectedNode.value}
                </div>
              </div>
            )}

            {/* Confidence */}
            {selectedNode.confidence !== null && selectedNode.confidence !== undefined && (
              <div>
                <label className="text-[10px] uppercase text-gray-500 block mb-1">
                  Engine Confidence
                </label>
                <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-600">Model Precision:</span>
                  <strong className="text-emerald-700">
                    {Math.round(selectedNode.confidence * 100)}%
                  </strong>
                </div>
              </div>
            )}

            {/* Provenance Metadata */}
            {selectedNode.provenance && Object.keys(selectedNode.provenance).length > 0 && (
              <div>
                <label className="text-[10px] uppercase text-gray-500 block mb-1">
                  Provenance &amp; Cryptographic Audit
                </label>
                <div className="p-2.5 bg-[#FAF9F5] border border-[#DFDBD2] rounded-lg space-y-1.5 text-[11px]">
                  {selectedNode.provenance.sha256 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> SHA-256:
                      </span>
                      <span className="text-gray-800 font-bold">
                        {selectedNode.provenance.sha256.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                  {selectedNode.provenance.statute && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Statutory Clause:</span>
                      <strong className="text-[#162A45] block font-sans">
                        {selectedNode.provenance.statute}
                      </strong>
                    </div>
                  )}
                  {selectedNode.provenance.url && (
                    <a
                      href={selectedNode.provenance.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 pt-1 text-[10px]"
                    >
                      <ExternalLink className="w-3 h-3" /> View Official Circular / PDF
                    </a>
                  )}
                  {selectedNode.provenance.raw_text && (
                    <div>
                      <span className="text-gray-500 block text-[10px] mb-0.5">Raw Text Snippet:</span>
                      <pre className="text-[10px] bg-white p-1.5 rounded border border-gray-200 text-gray-700 whitespace-pre-wrap break-all">
                        {selectedNode.provenance.raw_text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connected Relationships */}
            <div>
              <label className="text-[10px] uppercase text-gray-500 block mb-1">
                Connected Directed Relationships ({connectedEdges.length})
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {connectedEdges.map((e) => {
                  const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                  const otherNode = nodes.find((n) => n.id === otherNodeId);
                  const isOutgoing = e.source === selectedNode.id;

                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedNodeId(otherNodeId)}
                      className="flex items-center justify-between p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer text-[11px]"
                    >
                      <span className="text-gray-600 truncate max-w-[140px]">
                        {isOutgoing ? '→' : '←'} {otherNode?.label || otherNodeId}
                      </span>
                      <span className="font-bold text-[10px] text-[#162A45]">
                        {e.relation}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Summary Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-[#DFDBD2] flex flex-wrap items-center justify-between text-xs font-mono text-[#525866]">
        <div className="flex items-center space-x-4">
          <span>Total Nodes: <strong className="text-[#111625]">{nodes.length}</strong></span>
          <span>Relationships: <strong className="text-[#111625]">{edges.length}</strong></span>
          <span>Verified: <strong className="text-emerald-700">{graphData?.summary?.verified_nodes ?? 0}</strong></span>
          <span>Conflicts: <strong className="text-rose-700">{graphData?.summary?.conflict_nodes ?? 0}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-gray-400">Click any node to inspect evidence provenance</span>
        </div>
      </div>
    </div>
  );
};
