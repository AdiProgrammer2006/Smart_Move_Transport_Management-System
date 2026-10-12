import React, { useState } from 'react';
import { Database, Layers, FileCode2, Sparkles } from 'lucide-react';
import { ErDiagramStudio } from '../../components/ErDiagramStudio';
import { MongoDbHubView } from '../../components/MongoDbHubView';
import { OracleSqlWorkbench } from '../../components/OracleSqlWorkbench';

export const DatabaseDesignPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eer' | 'mongodb' | 'sql'>('eer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-7 h-7 text-teal-400" />
            <span>Database Architecture & Data Models</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Oracle 21c Relational Schema, EER Diagram Modeling, and MongoDB NoSQL Unstructured Integration
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('eer')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'eer'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Oracle ER / EER Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('mongodb')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mongodb'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongoDB NoSQL Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>SQL Workbench</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div>
        {activeTab === 'eer' && <ErDiagramStudio />}
        {activeTab === 'mongodb' && <MongoDbHubView />}
        {activeTab === 'sql' && <OracleSqlWorkbench />}
      </div>
    </div>
  );
};
