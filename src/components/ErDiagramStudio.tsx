import React, { useState } from 'react';
import { ORACLE_ENTITIES, ORACLE_RELATIONSHIPS, ORACLE_DDL_SQL, EntityDefinition } from '../data/oracleSchema';
import { Layers, Database, Copy, Check, Download, ZoomIn, ZoomOut, Maximize2, Shield, ArrowUpRight } from 'lucide-react';

export const ErDiagramStudio: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('TRIPS');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showEerHierarchy, setShowEerHierarchy] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedEntity = ORACLE_ENTITIES.find((e) => e.id === selectedEntityId) || ORACLE_ENTITIES[0];

  const filteredEntities = activeCategory === 'ALL'
    ? ORACLE_ENTITIES
    : ORACLE_ENTITIES.filter((e) => e.category === activeCategory);

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(ORACLE_DDL_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDdl = () => {
    const blob = new Blob([ORACLE_DDL_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartmove_oracle_schema_ddl.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Enhanced Entity-Relationship (EER) Architecture Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relational and hierarchical model for SmartMove Transport Solutions Oracle Database 19c/21c.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEerHierarchy(!showEerHierarchy)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showEerHierarchy
                ? 'bg-teal-950/60 border-teal-500/70 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showEerHierarchy ? '✓ EER Generalization Active' : 'Enable EER Generalization'}
          </button>

          <button
            onClick={handleCopyDdl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied DDL!' : 'Copy Oracle DDL'}</span>
          </button>

          <button
            onClick={handleDownloadDdl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .SQL</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {[
            { id: 'ALL', label: 'All 10 Entities' },
            { id: 'CORE_ASSETS', label: 'Fleet & Captains' },
            { id: 'OPERATIONS', label: 'Routes & Dispatch' },
            { id: 'COMMERCE', label: 'Tickets & Revenue' },
            { id: 'ASSURANCE', label: 'Maintenance & QA' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cardinality Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span>1:N (One-to-Many)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>1:1 (One-to-One)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>EER Inheritance</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Visual ER Canvas (8 cols) + Data Dictionary Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Entity Grid Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 text-xs text-slate-400">
              <span>Interactive Entity Relational Matrix (Select entity to view Data Dictionary)</span>
              <span className="font-mono text-slate-500">{filteredEntities.length} Entities Visible</span>
            </div>

            {/* Entity Relational Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntities.map((entity) => {
                const isSelected = entity.id === selectedEntityId;
                const relations = ORACLE_RELATIONSHIPS.filter(
                  (r) => r.sourceEntity === entity.id || r.targetEntity === entity.id
                );

                return (
                  <div
                    key={entity.id}
                    onClick={() => setSelectedEntityId(entity.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-teal-400 shadow-lg ring-1 ring-teal-400/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                        <h4 className="text-sm font-bold font-mono text-white tracking-wide">{entity.name}</h4>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {entity.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{entity.description}</p>

                    {/* Quick Columns Preview */}
                    <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                      {entity.columns.slice(0, 4).map((col) => (
                        <div key={col.name} className="flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-1.5 truncate">
                            {col.isPk && <span className="text-amber-400 font-bold">PK</span>}
                            {col.isFk && <span className="text-teal-400 font-bold">FK</span>}
                            {!col.isPk && !col.isFk && <span className="text-slate-600">·</span>}
                            <span className={col.isPk ? 'text-amber-200' : col.isFk ? 'text-teal-200' : 'text-slate-300'}>
                              {col.name}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[10px]">{col.type}</span>
                        </div>
                      ))}
                      {entity.columns.length > 4 && (
                        <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/60">
                          + {entity.columns.length - 4} more columns
                        </div>
                      )}
                    </div>

                    {/* EER Specialization Badges if applicable */}
                    {showEerHierarchy && entity.eerSubtypes && (
                      <div className="border-t border-slate-800/80 pt-2 mb-2">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                          EER Subclasses (Specialization)
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {entity.eerSubtypes.map((sub, i) => (
                            <span key={i} className="text-[10px] bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 px-2 py-0.5 rounded">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cardinality Connectors Summary */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{relations.length} Relationships</span>
                      <span className="text-teal-400 flex items-center gap-0.5 text-[10px] font-medium">
                        Inspect Schema <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relational Links Matrix */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Foreign Key Relationship Mappings & Cardinalities
            </h3>
            <div className="space-y-2">
              {ORACLE_RELATIONSHIPS.map((rel) => (
                <div
                  key={rel.id}
                  className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{rel.sourceEntity}</span>
                    <span className="text-slate-500 text-[10px] font-mono">({rel.sourceCardinality})</span>
                    <span className="text-teal-400 font-bold">──[{rel.relationshipName}]──▶</span>
                    <span className="font-mono font-bold text-white">{rel.targetEntity}</span>
                    <span className="text-slate-500 text-[10px] font-mono">({rel.targetCardinality})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-sm truncate">
                    {rel.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Data Dictionary Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 sticky top-20">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Data Dictionary</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {selectedEntity.columns.length} Fields
                </span>
              </div>
              <h3 className="text-lg font-bold font-mono text-white mt-1">{selectedEntity.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedEntity.description}</p>
            </div>

            {/* Columns Detailed Table */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {selectedEntity.columns.map((col) => (
                <div
                  key={col.name}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      {col.isPk && (
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-1 py-0.2 rounded text-[9px]">
                          PK
                        </span>
                      )}
                      {col.isFk && (
                        <span className="bg-teal-950/80 text-teal-300 border border-teal-800 px-1 py-0.2 rounded text-[9px]">
                          FK
                        </span>
                      )}
                      <span className="text-white">{col.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{col.type}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">{col.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                    <span>{col.nullable ? 'NULLABLE' : 'NOT NULL'}</span>
                    {col.fkTarget && <span className="text-teal-400 font-mono">Ref: {col.fkTarget}</span>}
                    {col.defaultValue && <span className="text-slate-400 font-mono">Def: {col.defaultValue}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
