'use client';

import React, { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_KPIS } from '@/lib/data/mockIncidents';
import { SuspectedSpillIncident } from '@/lib/types/peykgoz';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Wind, 
  Ship, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers,
  MapPin,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const formatUtcTime = (isoString: string) => isoString ? new Date(isoString).toISOString().substring(11, 19) : '';

export default function CommandCenterDashboard() {
  const [incidents, setIncidents] = useState<SuspectedSpillIncident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<SuspectedSpillIncident>(MOCK_INCIDENTS[0]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_VISION' | 'CONTEXT' | 'TIMELINE'>('OVERVIEW');

  // Status Rəng Generatoru
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return <span className="bg-red-950/80 text-red-400 border border-red-800/60 text-xs px-2.5 py-1 rounded font-mono font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> YÜKSƏK RİSK</span>;
      case 'MEDIUM':
        return <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 text-xs px-2.5 py-1 rounded font-mono font-semibold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> ORTA RİSK</span>;
      default:
        return <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs px-2.5 py-1 rounded font-mono font-semibold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> AŞAĞI RİSK</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans p-4 md:p-6 space-y-6">
      
      {/* HEADER BAR */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-bold tracking-wider font-mono text-cyan-400">PEYKGÖZ // ƏMƏLİYYAT KOMANDA MƏRKƏZİ</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Xəzər Akvatoriyası üzrə Süni İntellekt Dəstəkli Dəniz Neft Çirklənmələri Qiymətləndirmə Platforması
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span> AKTİV NƏZARƏT
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PEYK: SENTINEL-1B</span>
        </div>
      </header>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">AKTİV İNSİDENTLƏR</span>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{MOCK_KPIS.activeIncidentsCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">YÜKSƏK RİSK</span>
          <div className="text-2xl font-mono font-bold text-red-400 mt-1">{MOCK_KPIS.highRiskCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">TƏSİRLƏNMİŞ SAHƏ</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{MOCK_KPIS.totalAffectedAreaSqm} m²</div>
        </div>
        <div className="bg-[#0f172a]/80 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">ORTA REAKSİYA</span>
          <div className="text-2xl font-mono font-bold text-slate-200 mt-1">{MOCK_KPIS.avgResponseTimeMinutes} dəq</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">AI MODEL DƏQİQLİYİ</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{MOCK_KPIS.avgAIConfidencePercentage}%</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-[#0f172a] rounded-lg">
          <span className="text-xs text-slate-400 font-mono">HƏLL OLUNMUŞ</span>
          <div className="text-2xl font-mono font-bold text-slate-400 mt-1">{MOCK_KPIS.resolvedCount}</div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MAP & INCIDENT LIST (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* MAP CONTAINER STUB */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl h-[420px] overflow-hidden flex flex-col justify-between p-4">
            {/* Background Grid Pattern simulating Radar View */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            
            {/* Map Top Overlay Controls */}
            <div className="relative z-10 flex justify-between items-center bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400">
                <Layers className="w-4 h-4" />
                <span>LOKASİYA: Bakı Limanı Akvatoriyası</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> AIS Aktiv</span>
                <span className="text-amber-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Külək Təzyiqi: Normal</span>
              </div>
            </div>

            {/* Simulated Tactical Map Center Visualization */}
            <div className="relative z-10 my-auto text-center space-y-3">
              <div className="inline-flex items-center justify-center p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-full animate-pulse">
                <MapPin className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-mono text-slate-300 font-semibold">{selectedIncident.locationName}</p>
                <p className="text-xs font-mono text-cyan-500">{selectedIncident.coordinates.lat}° N, {selectedIncident.coordinates.lng}° E</p>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                (İnteraktiv Leaflet Xəritə Mühiti: SAR Poliqonu, Gəmi AIS Vektorları və Külək Istiqaməti Vizualizasiyası)
              </p>
            </div>

            {/* Map Footer Layer Toggle */}
            <div className="relative z-10 flex gap-2 text-xs font-mono">
              <button className="bg-cyan-900/50 border border-cyan-700 text-cyan-300 px-2.5 py-1 rounded">SAR Təsvir Layı</button>
              <button className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded hover:text-slate-200">AIS Gəmi Layı</button>
              <button className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded hover:text-slate-200">Külək Vektoru</button>
            </div>
          </div>

          {/* INCIDENT LIST OVERVIEW */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Aşkarlanmış Şübhəli Ləkələr Siyahısı
            </h2>
            <div className="space-y-2">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    selectedIncident.id === inc.id
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">{inc.code}</span>
                      {getRiskBadge(inc.riskLevel)}
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{inc.title}</p>
                    <p className="text-xs text-slate-400">{inc.locationName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-mono text-amber-400">{inc.affectedAreaSqm} m²</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Model Conf: {(inc.aiAnalysis.modelConfidence * 100).toFixed(0)}%
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-600 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SELECTED INCIDENT TRIAGE DRAWER (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header / ID */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-cyan-400 font-bold">{selectedIncident.code}</span>
                  {getRiskBadge(selectedIncident.riskLevel)}
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">{selectedIncident.title}</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                {selectedIncident.status}
              </span>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex border-b border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  activeTab === 'OVERVIEW' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                İCMAL
              </button>
              <button
                onClick={() => setActiveTab('AI_VISION')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  activeTab === 'AI_VISION' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                AI SEGMENTASİYA
              </button>
              <button
                onClick={() => setActiveTab('CONTEXT')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  activeTab === 'CONTEXT' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                KONTEKST (AIS/KÜLƏK)
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500">Təxmini Sahə:</span>
                    <p className="text-slate-200 font-semibold">{selectedIncident.affectedAreaSqm} m²</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Aşkarlanma Tarixi:</span>
                    <p className="text-slate-200 font-semibold">{formatUtcTime(selectedIncident.detectedAt)} (UTC)</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Peyk Təsviri:</span>
                    <p className="text-cyan-400 font-semibold">Sentinel-1 SAR</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Model Etibarlılığı:</span>
                    <p className="text-emerald-400 font-semibold">{(selectedIncident.aiAnalysis.modelConfidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Human Review Status Box */}
                {selectedIncident.humanReview ? (
                  <div className="bg-slate-950/80 border border-cyan-800/40 p-3 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold">
                      <UserCheck className="w-4 h-4" />
                      <span>Analitik Qiymətləndirməsi Təsdiqlənib</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      "{selectedIncident.humanReview.rationale}"
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      — {selectedIncident.humanReview.reviewerName} | {formatUtcTime(selectedIncident.humanReview.decisionTimestamp)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg text-amber-300">
                    <p className="font-semibold flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4" /> Analitik Təsdiqi Gözlənilir
                    </p>
                    <p className="text-[11px] text-amber-400/80 mt-1">
                      AI təyinatı avtonom yekun qərar deyil. Insident insan mütəxəssis tərəfindən nəzərdən keçirilməlidir.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI SEGMENTATION */}
            {activeTab === 'AI_VISION' && (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Model Arch:</span>
                    <span className="text-cyan-400">{selectedIncident.aiAnalysis.modelName}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Model Version:</span>
                    <span className="text-slate-300">{selectedIncident.aiAnalysis.modelVersion}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Piksel Ehtimalı:</span>
                    <span className="text-emerald-400">{(selectedIncident.aiAnalysis.pixelProbabilityAvg * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-2">
                  <p className="text-[11px] font-mono text-slate-400">Orijinal SAR vs. AI Segmentasiya Overlay</p>
                  <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded flex items-center justify-center text-slate-500 font-mono text-[11px]">
                    [ Orijinal Sentinel-1 SAR + AI Mask Poliqonu ]
                  </div>
                  <blockquote className="text-[10px] text-slate-500 italic">
                    Qeyd: AI ehtimal xəritəsi zəmanətli çirklənmə deyil, yalnız potensial ləkə indikasiyasıdır.
                  </blockquote>
                </div>
              </div>
            )}

            {/* TAB 3: CONTEXT */}
            {activeTab === 'CONTEXT' && (
              <div className="space-y-3 text-xs">
                {/* Weather */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                    <Wind className="w-4 h-4" /> Külək və Dəniz Şəraiti
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Küləyin Sürəti:</span>
                    <span className="text-slate-200">{selectedIncident.weather.windSpeedKmH} km/saat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">İstiqamət:</span>
                    <span className="text-slate-200">{selectedIncident.weather.windDirectionDeg}° (SE)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Look-alike Risk:</span>
                    <span className={selectedIncident.weather.isLookAlikeRiskHigh ? 'text-amber-400' : 'text-emerald-400'}>
                      {selectedIncident.weather.isLookAlikeRiskHigh ? 'YÜKSƏK (Zəif külək aldanması)' : 'AŞAĞI'}
                    </span>
                  </div>
                </div>

                {/* Nearby Vessels */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                    <Ship className="w-4 h-4" /> Ərazidəki Gəmilər (AIS Context)
                  </div>
                  {selectedIncident.nearbyVessels.length > 0 ? (
                    selectedIncident.nearbyVessels.map((vsl) => (
                      <div key={vsl.id} className="border-t border-slate-800 pt-2 text-[11px] font-mono flex justify-between items-center">
                        <div>
                          <p className="text-slate-200 font-bold">{vsl.name}</p>
                          <p className="text-[10px] text-slate-500">MMSI: {vsl.mmsi} | Məsafə: {vsl.distanceKm} km</p>
                        </div>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                          {vsl.relevanceLabel}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">Ərazidə aktiv AIS gəmisi qeydə alınmayıb.</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* HUMAN IN THE LOOP ACTIONS */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Human-In-The-Loop // Təhlilçi Qərarı
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> TƏSDİQ ET (ACCEPT)
              </button>
              <button className="bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5">
                <XCircle className="w-4 h-4" /> RƏDD ET (REJECT)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}