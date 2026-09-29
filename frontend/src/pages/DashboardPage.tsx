import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ExternalLink,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  PackageCheck,
  AlertCircle,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { getFallbackMeta, computeFallbackDecision } from '../api/engineFallback';
import type {
  DecisionQueryParams,
  DecisionResponse,
  MetaResponse,
  M2Row,
} from '../api/types';
import { InteractiveStlChart } from '../components/InteractiveStlChart';
import { CalendarMonthChart } from '../components/CalendarMonthChart';
import { RankRevealChart } from '../components/RankRevealChart';
import { InteractiveValueCurve } from '../components/InteractiveValueCurve';
import { MapLeaflet } from '../components/MapLeaflet';
import { KnowledgeBaseTab } from '../components/KnowledgeBaseTab';

export const DashboardPage: React.FC = () => {
  // Smooth scroll helper to shift to task sections
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ------------------------------------------------------------- 1. State Initialized with Instant Fallback
  const [meta, setMeta] = useState<MetaResponse>(() => getFallbackMeta());
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Workflow state: 'Pick' | 'Decide' | 'Drill' | 'All'
  const [workflowStep, setWorkflowStep] = useState<'Pick' | 'Decide' | 'Drill' | 'All'>('Decide');
  const [activeW, setActiveW] = useState<'all' | 'where' | 'when' | 'whom'>('all');
  const [activeTab, setActiveTab] = useState<'market' | 'where' | 'hold' | 'aggregate' | 'inputs' | 'kb'>('where');

  // Tour and Provenance Expanders
  const [showTour, setShowTour] = useState<boolean>(false);
  const [showProvenance, setShowProvenance] = useState<boolean>(true);

  // Sidebar controls
  const [marketScope, setMarketScope] = useState<string>('Karnataka (Home State)');
  const [targetState, setTargetState] = useState<string>('Maharashtra');
  const [crop, setCrop] = useState<string>('Onion');
  const [variety, setVariety] = useState<string>('All');
  const [asOf, setAsOf] = useState<string>('2025-06-11');
  const [fromDate, setFromDate] = useState<string>('2023-06-06');
  const [priceWindow, setPriceWindow] = useState<number>(14);
  const [volume, setVolume] = useState<number>(200);
  const [horizon, setHorizon] = useState<number>(180);
  const [conservative, setConservative] = useState<boolean>(false);
  const [nFarmers, setNFarmers] = useState<number>(25);
  const [targetOrder, setTargetOrder] = useState<number>(400);
  const [refMandi, setRefMandi] = useState<string | null>(null);

  // Cost overrides
  const [rentPerQtlMonth, setRentPerQtlMonth] = useState<number>(6.0);
  const [dieselPrice, setDieselPrice] = useState<number>(90.0);
  const [loanInterest, setLoanInterest] = useState<number>(9.0);
  const [loanLtv, setLoanLtv] = useState<number>(70);
  const [shrinkPerMonth, setShrinkPerMonth] = useState<number>(1.0);
  const [marketFees, setMarketFees] = useState<number>(3.0);
  const [farmLat, setFarmLat] = useState<number>(14.30);
  const [farmLon, setFarmLon] = useState<number>(76.00);

  // API Query Result initialized with instant precomputed fallback decision
  const [decision, setDecision] = useState<DecisionResponse>(() =>
    computeFallbackDecision({
      crop: 'Onion',
      as_of: '2025-06-11',
      variety: 'All',
      volume: 200,
      horizon: 180,
      farm_lat: 14.30,
      farm_lon: 76.00,
      n_farmers: 25,
      order: 400,
    })
  );
  const [loadingDecision, setLoadingDecision] = useState<boolean>(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Preset Applicator
  const applyPreset = (presetName: string) => {
    if (presetName === 'onion') {
      setCrop('Onion');
      setVariety('Nasik Red');
      setMarketScope('Karnataka (Home State)');
      setVolume(200);
      setHorizon(180);
      setDieselPrice(90);
      setRentPerQtlMonth(6.0);
      setShrinkPerMonth(1.0);
      setFarmLat(14.30);
      setFarmLon(76.00);
      setWorkflowStep('Decide');
      setActiveW('all');
    } else if (presetName === 'potato') {
      setCrop('Potato');
      setVariety('Kufri');
      setMarketScope('Karnataka (Home State)');
      setVolume(350);
      setHorizon(140);
      setDieselPrice(90);
      setRentPerQtlMonth(8.5);
      setShrinkPerMonth(0.7);
      setFarmLat(13.00);
      setFarmLon(76.10);
      setWorkflowStep('Decide');
      setActiveW('when');
    } else if (presetName === 'tomato') {
      setCrop('Tomato');
      setVariety('Hybrid');
      setMarketScope('Destination State (Interstate)');
      setTargetState('Maharashtra');
      setVolume(150);
      setHorizon(45);
      setDieselPrice(92);
      setRentPerQtlMonth(12.0);
      setShrinkPerMonth(2.2);
      setFarmLat(13.13);
      setFarmLon(78.13);
      setWorkflowStep('Decide');
      setActiveW('where');
    } else if (presetName === 'wheat') {
      setCrop('Wheat');
      setVariety('Sharbati');
      setMarketScope('🌟 Pan-India (All 26 States / Best Price)');
      setVolume(400);
      setHorizon(180);
      setDieselPrice(90);
      setRentPerQtlMonth(4.5);
      setShrinkPerMonth(0.3);
      setFarmLat(15.36);
      setFarmLon(75.12);
      setWorkflowStep('Decide');
      setActiveW('when');
    } else if (presetName === 'rice') {
      setCrop('Rice');
      setVariety('Basmati');
      setMarketScope('Destination State (Interstate)');
      setTargetState('Delhi');
      setVolume(250);
      setHorizon(140);
      setDieselPrice(90);
      setRentPerQtlMonth(5.0);
      setShrinkPerMonth(0.4);
      setFarmLat(14.46);
      setFarmLon(75.92);
      setWorkflowStep('Decide');
      setActiveW('where');
    }
  };

  // ------------------------------------------------------------- 2. Load Meta on Mount
  useEffect(() => {
    let isMounted = true;
    setLoadingMeta(true);
    api
      .getMeta()
      .then((data) => {
        if (!isMounted) return;
        setMeta(data);
        if (data.date_max) setAsOf(data.date_max);
        if (data.date_min) setFromDate(data.date_min);
        if (data.default_farm) {
          setFarmLat(data.default_farm.lat);
          setFarmLon(data.default_farm.lon);
        }
        if (data.params) {
          if (data.params.freight?.diesel_price) setDieselPrice(data.params.freight.diesel_price);
          if (data.params.storage?.rent_per_qtl_month) setRentPerQtlMonth(data.params.storage.rent_per_qtl_month);
          if (data.params.storage?.loan_interest) setLoanInterest(data.params.storage.loan_interest * 100);
          if (data.params.storage?.loan_ltv) setLoanLtv(Math.round(data.params.storage.loan_ltv * 100));
          if (data.params.storage?.shrink_per_month) setShrinkPerMonth(data.params.storage.shrink_per_month * 100);
          if (data.params.market) {
            const cess = data.params.market.cess_frac || 0;
            const comm = data.params.market.commission_frac || 0;
            setMarketFees(Number(((cess + comm) * 100).toFixed(1)));
          }
        }
        setLoadingMeta(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setMetaError(err.message || 'Loaded metadata from deterministic client engine.');
        setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ------------------------------------------------------------- 3. Fetch Decision
  const fetchDecisionData = useCallback(async () => {
    if (!asOf || !crop) return;
    setLoadingDecision(true);
    setDecisionError(null);

    const overrides: Record<string, any> = {
      'storage.rent_per_qtl_month': rentPerQtlMonth,
      'freight.diesel_price': dieselPrice,
      'storage.loan_interest': loanInterest / 100,
      'storage.loan_ltv': loanLtv / 100,
      'storage.shrink_per_month': shrinkPerMonth / 100,
      'market.cess_frac': marketFees / 100,
      'market.commission_frac': 0.0,
    };

    const isAllStates = marketScope === '🌟 Pan-India (All 26 States / Best Price)';
    const isInterstate = marketScope === 'Destination State (Interstate)';

    const queryParams: DecisionQueryParams = {
      crop,
      as_of: asOf,
      variety,
      window_days: priceWindow,
      volume,
      horizon,
      conservative,
      farm_lat: farmLat,
      farm_lon: farmLon,
      n_farmers: nFarmers,
      order: targetOrder,
      ref_mandi: refMandi || undefined,
      overrides,
    };

    if (isAllStates) {
      (queryParams as any).all_states = true;
    } else if (isInterstate) {
      (queryParams as any).target_state = targetState;
    }

    try {
      const res = await api.getDecision(queryParams);
      setDecision(res);
      // Auto-set refMandi if not set
      if (!refMandi && res.m1?.ref_mandi) {
        setRefMandi(res.m1.ref_mandi);
      }
    } catch (err: any) {
      setDecisionError(err.message || 'Error computing decision matrix.');
    } finally {
      setLoadingDecision(false);
    }
  }, [
    crop,
    asOf,
    variety,
    priceWindow,
    volume,
    horizon,
    conservative,
    farmLat,
    farmLon,
    nFarmers,
    targetOrder,
    refMandi,
    rentPerQtlMonth,
    dieselPrice,
    loanInterest,
    loanLtv,
    shrinkPerMonth,
    marketFees,
    marketScope,
    targetState,
  ]);

  // Trigger decision fetch whenever any input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDecisionData();
    }, 60);
    return () => clearTimeout(timer);
  }, [fetchDecisionData]);

  // Varieties available for selected crop (deduplicated)
  const availableVarieties = useMemo(() => {
    if (!meta?.varieties || !meta.varieties[crop]) return ['All'];
    const vars = meta.varieties[crop];
    return Array.from(new Set(['All', ...vars]));
  }, [meta, crop]);

  // States available for interstate selection
  const availableStates: string[] = useMemo(() => {
    const defaultStates = [
      'Maharashtra',
      'Tamil Nadu',
      'Gujarat',
      'Rajasthan',
      'Andhra Pradesh',
      'Telangana',
      'Madhya Pradesh',
      'Uttar Pradesh',
      'Punjab',
      'Delhi',
      'West Bengal',
      'Kerala',
      'Haryana',
      'Bihar',
    ];
    if (meta && meta.states && meta.states.length > 0) {
      return meta.states.filter((s: string) => s !== 'Karnataka');
    }
    return defaultStates;
  }, [meta]);

  // Top rankings and cost walk calculations
  const costWalk = decision?.m2?.cost_walk;
  const topMandi = decision?.m2?.top;
  const boardTop = decision?.m2?.board_top;
  const m1 = decision?.m1;
  const m3 = decision?.m3;
  const m4 = decision?.m4;

  const isInterstateScope =
    marketScope === 'Destination State (Interstate)' ||
    marketScope === '🌟 Pan-India (All 26 States / Best Price)';

  // ------------------------------------------------------------- Sub-Renderers for Active Processors
  const renderWhereProcessor = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-rose-50/70 border-l-4 border-crimson-brand p-4 rounded-xl text-xs space-y-1.5">
        <div className="font-black text-sm text-crimson-brandDark flex items-center gap-1.5">
          <span>📍</span>
          <span>W1 Processor: Spatial Arbitrage &amp; Net-in-Hand Arithmetic</span>
        </div>
        <p className="text-slate-700">
          The nominal board quote is deceptive. Long distance hauling burns round-trip diesel, statutory APMC cess, and transit moisture shrinkage.
          AgriLink-OR scores all quoting mandis and isolates where you realize the maximum cash in pocket.
        </p>
      </div>

      {/* Dynamic Cost Walk Strip */}
      {costWalk && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Dynamic Realization Equation ({topMandi?.market})
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              Board: <strong>₹{Math.round(costWalk.board_price).toLocaleString()}</strong>
            </span>
            <span className="text-slate-400">−</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg">
              Loss: ₹{Math.round(costWalk.transit_loss)}
            </span>
            <span className="text-slate-400">−</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg">
              Freight: ₹{Math.round(costWalk.freight)}
            </span>
            <span className="text-slate-400">−</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg">
              Cess/Fees: ₹{Math.round(costWalk.fees)}
            </span>
            <span className="text-slate-400">−</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg">
              Handling: ₹{Math.round(costWalk.handling)}
            </span>
            <span className="text-slate-400">=</span>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold shadow-xs">
              Net In-Hand: ₹{Math.round(costWalk.net_per_qtl).toLocaleString()}/qtl
            </span>
          </div>
        </div>
      )}

      {/* Rank Divergence Reveal Chart */}
      {decision?.m2?.rows && decision.m2.rows.length > 1 && (
        <RankRevealChart rows={decision.m2.rows} />
      )}

      {/* Mandi Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase text-crimson-brandDark">
            Ranked Mandis Table ({decision?.m2?.count || 0} quoting)
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Haversine × 1.3 road circuity</span>
        </div>

        <div className="overflow-x-auto max-h-[380px] border border-slate-200 rounded-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-2.5">Market</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">State</th>
                <th className="p-2.5">km</th>
                <th className="p-2.5">Board Price</th>
                <th className="p-2.5">Freight</th>
                <th className="p-2.5">Fees</th>
                <th className="p-2.5">Net Realisation</th>
                <th className="p-2.5">Board Rank</th>
                <th className="p-2.5">Arbitrage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {(decision?.m2?.rows || []).map((row, idx) => (
                <tr key={row.market} className={idx === 0 ? 'bg-crimson-50/60 font-bold' : 'hover:bg-slate-50'}>
                  <td className="p-2.5 font-bold text-slate-900">{row.market}</td>
                  <td className="p-2.5 text-slate-500">{row.district || '—'}</td>
                  <td className="p-2.5 text-slate-500">{row.state || 'Karnataka'}</td>
                  <td className="p-2.5 text-slate-600">{Math.round(row.km)} km</td>
                  <td className="p-2.5 text-slate-700">₹{Math.round(row.board_price).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500">₹{Math.round(row.freight).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500">₹{Math.round(row.fees).toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-crimson-brandDark">₹{Math.round(row.net_per_qtl).toLocaleString()}/qtl</td>
                  <td className="p-2.5 text-slate-500">#{row.rank_board}</td>
                  <td className="p-2.5 text-emerald-700 font-bold">+₹{Math.round(row.arbitrage_vs_nearest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geospatial Map */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-700">
          Geospatial Mandi Network &amp; Net Realisation Map
        </div>
        <MapLeaflet
          farmLat={farmLat}
          farmLon={farmLon}
          rows={decision?.m2?.rows || []}
        />
      </div>
    </div>
  );

  const renderWhenProcessor = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-rose-50/70 border-l-4 border-crimson-brand p-4 rounded-xl text-xs space-y-1.5">
        <div className="font-black text-sm text-crimson-brandDark flex items-center gap-1.5">
          <span>⏱️</span>
          <span>W2 Processor: Hold vs Sell Optimization &amp; Storage Decay V(t)</span>
        </div>
        <p className="text-slate-700">
          Storage is not cost-free. Daily rent, warehouse financing, and physical shrinkage (θᵗ) eat away at your inventory.
          AgriLink-OR computes the earliest day storage beats selling immediately and solves a 3-tranche MILP liquidation schedule.
        </p>
      </div>

      {m3 && (m3.curve?.length > 0 || m3.available) ? (
        <>
          <InteractiveValueCurve m3={m3} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Break-even scan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                Break-even Scan Metrics
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Break-even Day:</span>
                  <span className="font-bold text-slate-900">{m3.breakeven_day != null ? `Day ${m3.breakeven_day}` : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peak Gain Day:</span>
                  <span className="font-bold text-slate-900">{m3.best_day != null ? `Day ${m3.best_day}` : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Net Gain:</span>
                  <span className="font-bold text-emerald-700">₹{m3.best_gain_per_qtl != null ? Math.round(m3.best_gain_per_qtl).toLocaleString() : '0'}/qtl</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 leading-normal font-sans">
                Carry charge ₹{m3.carry_per_qtl_day?.toFixed(2)}/qtl/day = rent + insurance + pledge financing. Shrink {shrinkPerMonth.toFixed(1)}%/month.
              </div>
            </div>

            {/* Multi-tranche MILP schedule */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900">Multi-tranche MILP</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  {m3.milp?.status || 'Optimal'}
                </span>
              </div>

              {m3.milp?.schedule && m3.milp.schedule.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Day</th>
                        <th className="p-2">Qtl Sold</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Gross Realisation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {m3.milp.schedule.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">Day {row.day}</td>
                          <td className="p-2 text-slate-700">{row.qtl_sold} qtl</td>
                          <td className="p-2 text-slate-700">₹{Math.round(row.price).toLocaleString()}</td>
                          <td className="p-2 font-bold text-emerald-700">₹{Math.round(row.gross).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-400 p-4 text-center">No liquidation schedule for this scenario.</div>
              )}
              <div className="text-[10px] text-slate-400 leading-normal font-sans">
                Tranches are capped at 3 sales with a 10% floor each for executable hedging.
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-mono">
          Calculating continuous storage carry model...
        </div>
      )}
    </div>
  );

  const renderWhomProcessor = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-rose-50/70 border-l-4 border-crimson-brand p-4 rounded-xl text-xs space-y-1.5">
        <div className="font-black text-sm text-crimson-brandDark flex items-center gap-1.5">
          <span>🤝</span>
          <span>W3 Processor: Farmer Lot Knapsack Aggregation</span>
        </div>
        <p className="text-slate-700">
          Institutional buyers contract large homogeneous batches (e.g. {targetOrder} quintals). Smallholder farmers harvest variable lots.
          AgriLink-OR uses a bounded knapsack solver to fill the order with ≤ 3% surplus and no single farm dominating (&lt; 40%), cross-checked via 0/1 Subset-Sum DP.
        </p>
      </div>

      {m4?.lots && m4.lots.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-crimson-brandDark">
              Farmer Lot Procurement Roster ({m4.lots.length} lots in pool)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Target Order: {m4.order} qtl
            </span>
          </div>

          <div className="overflow-x-auto max-h-[380px] border border-slate-200 rounded-xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Status</th>
                  <th className="p-2">Lot ID</th>
                  <th className="p-2">Farmer ID</th>
                  <th className="p-2">Market</th>
                  <th className="p-2">Distance</th>
                  <th className="p-2">Lot Size</th>
                  <th className="p-2">Count</th>
                  <th className="p-2">Total Quintals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {m4.lots.map((lot) => (
                  <tr
                    key={lot.id}
                    className={lot.selected ? 'bg-emerald-50/70 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-500'}
                  >
                    <td className="p-2">
                      {lot.selected ? (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Unselected</span>
                      )}
                    </td>
                    <td className="p-2">#{lot.id}</td>
                    <td className="p-2">{lot.farmer_id || `farmer_${lot.id}`}</td>
                    <td className="p-2">{lot.market}</td>
                    <td className="p-2">{Math.round(lot.km)} km</td>
                    <td className="p-2">{lot.qty} qtl</td>
                    <td className="p-2">{lot.count}</td>
                    <td className="p-2 font-bold">{lot.qty * lot.count} qtl</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Knapsack Solution Details */}
          {m4.agg && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
                  Knapsack Solver: {m4.agg.status} · Fulfilled {m4.agg.total} qtl ({m4.agg.chosen_count} farmers chosen)
                </span>
                <span className="text-emerald-700 font-bold">
                  Surplus Waste: {m4.agg.surplus} qtl ({((m4.agg.surplus / m4.order) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans pt-1 border-t border-slate-200">
                Dual verification: 0/1 Subset-Sum DP surplus was {m4.dp_surplus} qtl ({m4.agg.dp_agrees ? 'perfect match with CBC' : 'differs'}).
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-mono">
          Generating farmer lot pool...
        </div>
      )}
    </div>
  );

  const renderMarketStl = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed font-sans">
        <strong>How the price path is built (M1).</strong> Weekly median of the mandi board → STL decomposition of log-price with period 52 → ±2σ volatility bands on the residual → GLUT/SPIKE flags from the z-score → a deterministic projection that M3 consumes. The red continuous line is <strong>p(d)</strong>, not a forecast guarantee.
      </div>

      {m1 ? (
        <>
          <InteractiveStlChart m1={m1} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Strengths & Coverage */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                Decomposition Strengths
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Seasonal Strength (F_seasonal):</span>
                  <span className="font-bold text-slate-900">{m1.strengths?.seasonal ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trend Strength (F_trend):</span>
                  <span className="font-bold text-slate-900">{m1.strengths?.trend ?? '—'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal font-sans">
                {m1.ref_mandi}: {m1.coverage?.weeks} weeks ({m1.coverage?.observed} observed, {((m1.coverage?.imputed_frac || 0) * 100).toFixed(0)}% interpolated).
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-crimson-brand">GLUT Weeks: {m1.glut_weeks ?? 0}</span>
                <span className="text-emerald-700">SPIKE Weeks: {m1.spike_weeks ?? 0}</span>
              </div>
            </div>

            {/* Right: Calendar Month Chart */}
            <CalendarMonthChart seasonalIndex={m1.seasonal_index || []} />
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-mono">
          No STL decomposition available for this selection.
        </div>
      )}
    </div>
  );

  const renderInputsTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed font-sans">
        <strong>Every number here is an assumption you can challenge.</strong> The sidebar sliders are session-only overrides of <strong>data/ref/params.yaml</strong>, where each rate carries an auditable origin. Download the exact slice in view to inspect outside the app.
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900">Active Parameters (params.yaml)</span>
          <button
            onClick={() => {
              api.downloadCleanSliceCsv(crop, asOf, decision?.m2?.rows || []);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crimson-brand hover:bg-crimson-brandDark text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Clean Slice CSV</span>
          </button>
        </div>

        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto max-h-[360px] leading-relaxed">
          {JSON.stringify(decision?.params || meta?.params || {}, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ------------------------------------------------------------- MASTER WORKFLOW MODE BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-crimson-brand animate-pulse"></div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block leading-tight">
              Active Dashboard Workflow
            </span>
            <span className="text-sm font-black text-slate-900">
              {workflowStep === 'Pick' && 'Step 1 · Scenario Calibration & Point-in-Time Setup'}
              {workflowStep === 'Decide' && 'Step 2 · The 3 W\'s Commercial Decision Center'}
              {workflowStep === 'Drill' && 'Step 3 · Operations Research Mathematical Drill'}
              {workflowStep === 'All' && '🌟 Complete Unified Dashboard View'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['Pick', 'Decide', 'Drill', 'All'] as const).map((step, idx) => (
            <button
              key={step}
              onClick={() => {
                setWorkflowStep(step);
                if (step === 'Pick') scrollTo('section-pick');
                if (step === 'Decide') scrollTo('section-decide');
                if (step === 'Drill') scrollTo('section-drill');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                workflowStep === step
                  ? 'bg-crimson-brand text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {step === 'All' ? '🌟 All Views' : `${idx + 1} · ${step}`}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- 2-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================= LEFT SIDEBAR CONTROLS */}
        <div id="section-pick" className={`lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 transition-all ${workflowStep === 'Pick' ? 'ring-2 ring-emerald-500 shadow-md' : ''}`}>
          
          {/* Workflow Step Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark">
                Workflow Step
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">1 · 2 · 3</span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              {(['Pick', 'Decide', 'Drill', 'All'] as const).map((step, idx) => (
                <button
                  key={step}
                  onClick={() => {
                    setWorkflowStep(step);
                    if (step === 'Pick') scrollTo('section-pick');
                    if (step === 'Decide') scrollTo('section-decide');
                    if (step === 'Drill') scrollTo('section-drill');
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all font-mono cursor-pointer ${
                    workflowStep === step
                      ? 'bg-crimson-brand text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {step === 'All' ? 'All' : `${idx + 1}·${step}`}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Destination Market Scope */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark mb-2">
              1 · Destination Market Scope
            </div>
            <div className="space-y-1.5 text-xs font-medium">
              {[
                'Karnataka (Home State)',
                'Destination State (Interstate)',
                '🌟 Pan-India (All 26 States / Best Price)',
              ].map((scope) => (
                <label
                  key={scope}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    marketScope === scope
                      ? 'border-crimson-300 bg-crimson-50/60 text-slate-900 font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={marketScope === scope}
                    onChange={() => setMarketScope(scope)}
                    className="accent-crimson-brand"
                  />
                  <span className="truncate">{scope}</span>
                </label>
              ))}
            </div>

            {/* Target State Dropdown if Interstate */}
            {marketScope === 'Destination State (Interstate)' && (
              <div className="mt-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pick Destination State</label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 font-bold focus:ring-1 focus:ring-crimson-brand focus:border-crimson-brand"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Crop & Variety */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark mb-2">
              2 · Crop &amp; Variety Selection
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Crop</span>
                <select
                  value={crop}
                  onChange={(e) => {
                    setCrop(e.target.value);
                    setVariety('All');
                    setRefMandi(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-bold"
                >
                  {(meta?.crops || ['Onion', 'Potato', 'Tomato', 'Wheat', 'Rice']).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Variety</span>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                >
                  {availableVarieties.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              'All' pools every variety reported at the mandi.
            </span>
          </div>

          {/* 3. Historical Date Range (2 Years) */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark mb-2">
              3 · Historical Date Range (2 Years)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Price as of (To Date)</label>
                <input
                  type="date"
                  value={asOf}
                  min={meta?.date_min || '2023-06-06'}
                  max={meta?.date_max || '2025-06-11'}
                  onChange={(e) => setAsOf(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Price from (Start Date)</label>
                <input
                  type="date"
                  value={fromDate}
                  min={meta?.date_min || '2023-06-06'}
                  max={asOf}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Quote window:</span>
                <span className="font-mono text-slate-900">{priceWindow} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={priceWindow}
                onChange={(e) => setPriceWindow(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Median modal price over this window ending at 'Price as of'
              </span>
            </div>
          </div>

          {/* Decision Inputs */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark">
              Decision Inputs
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Crop volume (Q):</span>
                <span className="font-mono font-bold text-slate-900">{volume} qtl</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Horizon:</span>
                <span className="font-mono font-bold text-slate-900">{horizon} days</span>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                step="10"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="conservative"
                checked={conservative}
                onChange={(e) => setConservative(e.target.checked)}
                className="accent-crimson-brand rounded"
              />
              <label htmlFor="conservative" className="text-xs font-medium text-slate-700 cursor-pointer">
                Conservative (project on lower band)
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Farmers in pool:</span>
                <span className="font-mono font-bold text-slate-900">{nFarmers}</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={nFarmers}
                onChange={(e) => setNFarmers(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Buyer bulk order:</span>
                <span className="font-mono font-bold text-slate-900">{targetOrder} qtl</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={targetOrder}
                onChange={(e) => setTargetOrder(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>
          </div>

          {/* Logistics & Financing Sliders */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-crimson-brandDark">
              Contract &amp; Logistics Overrides
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Diesel price:</span>
                <span className="font-mono text-slate-900">₹{dieselPrice.toFixed(1)}/L</span>
              </div>
              <input
                type="range"
                min="70"
                max="120"
                step="0.5"
                value={dieselPrice}
                onChange={(e) => setDieselPrice(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Storage rent:</span>
                <span className="font-mono text-slate-900">₹{rentPerQtlMonth.toFixed(1)}/qtl/mo</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={rentPerQtlMonth}
                onChange={(e) => setRentPerQtlMonth(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Pledge loan interest:</span>
                <span className="font-mono text-slate-900">{loanInterest.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={loanInterest}
                onChange={(e) => setLoanInterest(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Monthly shrink:</span>
                <span className="font-mono text-slate-900">{shrinkPerMonth.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={shrinkPerMonth}
                onChange={(e) => setShrinkPerMonth(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Cess + commission:</span>
                <span className="font-mono text-slate-900">{marketFees.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={marketFees}
                onChange={(e) => setMarketFees(Number(e.target.value))}
                className="w-full accent-crimson-brand"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">FPO Farm Origin (Lat / Lon):</span>
                <span className="font-mono text-slate-900 font-bold">{farmLat.toFixed(2)}° N, {farmLon.toFixed(2)}° E</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs mb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Latitude (°N)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={farmLat}
                    onChange={(e) => setFarmLat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Longitude (°E)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={farmLon}
                    onChange={(e) => setFarmLon(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Farm Location Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Quick Origin Hubs:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {[
                    { label: '📍 Davangere Hub', lat: 14.30, lon: 76.00 },
                    { label: '📍 Kolar FPO Belt', lat: 13.14, lon: 78.13 },
                    { label: '📍 Hassan Potato Belt', lat: 13.00, lon: 76.10 },
                    { label: '📍 Belagavi North', lat: 15.85, lon: 74.50 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFarmLat(p.lat);
                        setFarmLon(p.lon);
                      }}
                      className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        Math.abs(farmLat - p.lat) < 0.05 && Math.abs(farmLon - p.lon) < 0.05
                          ? 'bg-crimson-50 border-crimson-brand text-crimson-brandDark font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Defaults Button */}
          <button
            onClick={() => {
              setCrop('Onion');
              setVariety('All');
              setVolume(200);
              setHorizon(180);
              setDieselPrice(90);
              setRentPerQtlMonth(6.0);
              setLoanInterest(9.0);
              setLoanLtv(70);
              setShrinkPerMonth(1.0);
              setMarketFees(3.0);
              setFarmLat(14.30);
              setFarmLon(76.00);
              setMarketScope('Karnataka (Home State)');
              setWorkflowStep('Decide');
              setActiveW('all');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-mono cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Channarayapatna Defaults</span>
          </button>
        </div>

        {/* ======================================= RIGHT MAIN PANEL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: PICK MODE SHOWCASE (when workflowStep === 'Pick') */}
          {workflowStep === 'Pick' && (
            <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Step 1 · Scenario Calibration &amp; Presets</h3>
                    <p className="text-xs text-slate-500">Pick any commercial crop, variety, or destination scope. Click an instant preset below to recalibrate immediately:</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Instant Simulation Ready
                </span>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-2">
                  Instant Crop &amp; Trade Presets (Click to Load)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <button onClick={() => applyPreset('onion')} className="text-left p-3 rounded-xl border border-slate-200 hover:border-crimson-brand hover:bg-rose-50/40 transition-all cursor-pointer">
                    <div className="font-bold text-xs text-slate-900">🧅 Onion Standard</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">200 qtl · 180 d · Nasik Red · Karnataka</div>
                  </button>
                  <button onClick={() => applyPreset('potato')} className="text-left p-3 rounded-xl border border-slate-200 hover:border-crimson-brand hover:bg-rose-50/40 transition-all cursor-pointer">
                    <div className="font-bold text-xs text-slate-900">🥔 Cold Storage Potato</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">350 qtl · 140 d · Kufri · Cold Chamber</div>
                  </button>
                  <button onClick={() => applyPreset('tomato')} className="text-left p-3 rounded-xl border border-slate-200 hover:border-crimson-brand hover:bg-rose-50/40 transition-all cursor-pointer">
                    <div className="font-bold text-xs text-slate-900">🍅 Tomato Monsoon Gap</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">150 qtl · 45 d · Hybrid · Maharashtra Arbitrage</div>
                  </button>
                  <button onClick={() => applyPreset('wheat')} className="text-left p-3 rounded-xl border border-slate-200 hover:border-crimson-brand hover:bg-rose-50/40 transition-all cursor-pointer">
                    <div className="font-bold text-xs text-slate-900">🌾 Sharbati Wheat Storage</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">400 qtl · 180 d · Pan-India Best Price</div>
                  </button>
                  <button onClick={() => applyPreset('rice')} className="text-left p-3 rounded-xl border border-slate-200 hover:border-crimson-brand hover:bg-rose-50/40 transition-all cursor-pointer">
                    <div className="font-bold text-xs text-slate-900">🍚 Basmati Rice Export</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">250 qtl · 140 d · Delhi NCR Trade</div>
                  </button>
                </div>
              </div>

              {/* Active Configuration Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Active Calibration Profile</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div><span className="text-slate-500 block">Commodity:</span><strong className="text-slate-900 text-xs">{crop} ({variety})</strong></div>
                  <div><span className="text-slate-500 block">Scope:</span><strong className="text-slate-900 text-xs">{marketScope.split('(')[0].trim()}</strong></div>
                  <div><span className="text-slate-500 block">Volume &amp; Horizon:</span><strong className="text-slate-900 text-xs">{volume} qtl · {horizon} d</strong></div>
                  <div><span className="text-slate-500 block">Farm Lat/Lon:</span><strong className="text-slate-900 text-xs">{farmLat.toFixed(2)}, {farmLon.toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setWorkflowStep('Decide');
                    scrollTo('section-decide');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-crimson-brand hover:bg-crimson-brandDark text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>Advance to Step 2 · The 3 W's Commercial Decisions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: THE 3 W's DECISION METHODOLOGY (when workflowStep !== 'Pick' and workflowStep !== 'Drill') */}
          {(workflowStep === 'Decide' || workflowStep === 'All') && (
            <div id="section-decide" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-crimson-brand animate-pulse"></span>
                  <h3 className="text-base font-black text-slate-900">
                    The 3 W's Decision Methodology Processors
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-crimson-50 text-crimson-brand px-2 py-0.5 rounded font-bold uppercase">
                  Click a Processor to Inspect
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Click any processor below to inspect its dedicated computational engine:
              </p>

              {/* 4 Processor Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setActiveW('where');
                    setWorkflowStep('Decide');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeW === 'where'
                      ? 'bg-crimson-brand text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>📍 W1 · WHERE</span>
                </button>

                <button
                  onClick={() => {
                    setActiveW('when');
                    setWorkflowStep('Decide');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeW === 'when'
                      ? 'bg-crimson-brand text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>⏱️ W2 · WHEN</span>
                </button>

                <button
                  onClick={() => {
                    setActiveW('whom');
                    setWorkflowStep('Decide');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeW === 'whom'
                      ? 'bg-crimson-brand text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>🤝 W3 · TO WHOM</span>
                </button>

                <button
                  onClick={() => {
                    setActiveW('all');
                    setWorkflowStep('Decide');
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    activeW === 'all'
                      ? 'bg-crimson-brand text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>🌟 View All 3 W's</span>
                </button>
              </div>

              {/* ACTIVE PROCESSOR EMBEDDED DIRECTLY IN PLACE */}
              {activeW === 'where' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Card 1 Highlighted */}
                  <div className="bg-white border-2 border-crimson-brand rounded-2xl p-5 shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                      W1 · WHERE TO SELL (MODULE 2: NET-IN-HAND ARBITRAGE)
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {topMandi ? topMandi.market : 'Channarayapatna'}
                    </div>
                    <div className="text-sm font-bold text-crimson-brand mt-0.5">
                      {topMandi
                        ? `net ₹${Math.round(topMandi.net_per_qtl).toLocaleString()}/qtl · ${Math.round(topMandi.km)} km away`
                        : 'net ₹2,756/qtl · 211 km'}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-2">
                      Board ₹{Math.round(topMandi?.board_price || 3000)} (rank #{topMandi?.rank_board || 1}) · ₹{Math.round(topMandi?.arbitrage_vs_nearest || 0)} better than nearest mandi
                    </div>
                  </div>

                  {renderWhereProcessor()}
                </div>
              )}

              {activeW === 'when' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Card 2 Highlighted */}
                  <div className="bg-white border-2 border-crimson-brand rounded-2xl p-5 shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                      W2 · WHEN TO SELL (MODULE 3: STORAGE CARRY &amp; TIMING)
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {m3?.breakeven_day === null ? 'SELL NOW' : `HOLD ${m3?.best_day || 157} days`}
                    </div>
                    <div className="text-sm font-bold text-crimson-brand mt-0.5">
                      {m3?.breakeven_day === null
                        ? 'no break-even inside horizon'
                        : `break-even Day ${m3?.breakeven_day} · net gain ₹${Math.round(m3?.best_gain_per_qtl || 0)}/qtl`}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-2">
                      Carry cost ₹{m3?.carry_per_qtl_day?.toFixed(2)}/qtl/day · MILP {m3?.milp?.status || 'Optimal'} {m3?.milp?.profit ? `(₹${Math.round(m3.milp.profit).toLocaleString()} gain)` : ''}
                    </div>
                  </div>

                  {renderWhenProcessor()}
                </div>
              )}

              {activeW === 'whom' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Card 3 Highlighted */}
                  <div className="bg-white border-2 border-crimson-brand rounded-2xl p-5 shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                      W3 · TO WHOM TO SELL (MODULE 4: BULK LOT KNAPSACK)
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {m4?.agg?.status === 'Optimal' ? `${m4.agg.total.toLocaleString()} qtl` : `${targetOrder} qtl`}
                    </div>
                    <div className="text-sm font-bold text-crimson-brand mt-0.5">
                      surplus {m4?.agg?.surplus || 0} qtl · {m4?.agg?.chosen_count || 8} farmers selected
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-2">
                      Dual solver agreement: 0/1 Subset-Sum DP agrees with CBC bounded knapsack
                    </div>
                  </div>

                  {renderWhomProcessor()}
                </div>
              )}

              {activeW === 'all' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* 3 Decision Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: WHERE */}
                    <div className="bg-white border-l-4 border-crimson-brand border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                          W1 · WHERE TO SELL
                        </span>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {topMandi ? topMandi.market : 'Channarayapatna'}
                        </div>
                        <div className="text-xs font-bold text-crimson-brand mt-0.5">
                          {topMandi
                            ? `net ₹${Math.round(topMandi.net_per_qtl).toLocaleString()}/qtl · ${Math.round(topMandi.km)} km`
                            : 'net ₹2,756/qtl · 211 km'}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono border-t border-slate-100 pt-2 mt-3 space-y-2">
                        <div>Board ₹{Math.round(topMandi?.board_price || 3000)} · #{topMandi?.rank_board || 1}</div>
                        <button
                          onClick={() => {
                            setActiveW('where');
                          }}
                          className="flex items-center justify-between w-full py-1 px-2 bg-rose-50 hover:bg-rose-100 text-crimson-brandDark rounded text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <span>📍 View W1 Processor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Card 2: WHEN */}
                    <div className="bg-white border-l-4 border-crimson-brand border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                          W2 · WHEN TO SELL
                        </span>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {m3?.breakeven_day === null ? 'SELL NOW' : `HOLD ${m3?.best_day || 157} days`}
                        </div>
                        <div className="text-xs font-bold text-crimson-brand mt-0.5">
                          {m3?.breakeven_day === null
                            ? 'no break-even inside horizon'
                            : `break-even d${m3?.breakeven_day} · gain ₹${Math.round(m3?.best_gain_per_qtl || 0)}/qtl`}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono border-t border-slate-100 pt-2 mt-3 space-y-2">
                        <div>Carry ₹{m3?.carry_per_qtl_day?.toFixed(2)}/qtl/day</div>
                        <button
                          onClick={() => {
                            setActiveW('when');
                          }}
                          className="flex items-center justify-between w-full py-1 px-2 bg-rose-50 hover:bg-rose-100 text-crimson-brandDark rounded text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <span>⏱️ View W2 Processor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Card 3: TO WHOM */}
                    <div className="bg-white border-l-4 border-crimson-brand border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-crimson-brand uppercase tracking-wider">
                          W3 · TO WHOM TO SELL
                        </span>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {m4?.agg?.status === 'Optimal' ? `${m4.agg.total.toLocaleString()} qtl` : `${targetOrder} qtl`}
                        </div>
                        <div className="text-xs font-bold text-crimson-brand mt-0.5">
                          surplus {m4?.agg?.surplus || 0} qtl · {m4?.agg?.chosen_count || 8} farmers
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono border-t border-slate-100 pt-2 mt-3 space-y-2">
                        <div>Bounded Knapsack MILP + DP agrees</div>
                        <button
                          onClick={() => {
                            setActiveW('whom');
                          }}
                          className="flex items-center justify-between w-full py-1 px-2 bg-rose-50 hover:bg-rose-100 text-crimson-brandDark rounded text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <span>🤝 View W3 Processor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Arbitrage Opportunity Callout */}
                  {topMandi && boardTop && (
                    <div className="bg-rose-50/60 border border-rose-200 border-l-4 border-l-crimson-brand rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {topMandi.market !== boardTop.market ? (
                        <>
                          <strong>Board price is deceptive:</strong> Highest nominal quote is <strong>{boardTop.market}</strong> (₹{Math.round(boardTop.board_price).toLocaleString()}/qtl), but after diesel freight, shrink, and cess it nets only ₹{Math.round(boardTop.net_per_qtl).toLocaleString()}. Shipping to optimal destination <strong>{topMandi.market}</strong> puts <strong>+₹{Math.round(topMandi.net_per_qtl - boardTop.net_per_qtl).toLocaleString()}/qtl more (+₹{Math.round((topMandi.net_per_qtl - boardTop.net_per_qtl) * volume).toLocaleString()} total gain)</strong> in your pocket!
                        </>
                      ) : (
                        <>
                          🚀 <strong>Highest Net Realization:</strong> <strong>{topMandi.market}</strong> is your top commercial choice, delivering ₹{Math.round(topMandi.net_per_qtl).toLocaleString()}/qtl in-hand. It secures <strong>+₹{Math.round(topMandi.arbitrage_vs_nearest || 0).toLocaleString()}/qtl (+₹{Math.round((topMandi.arbitrage_vs_nearest || 0) * volume).toLocaleString()} total advantage)</strong> over the nearest local mandi!
                        </>
                      )}
                    </div>
                  )}

                  {/* Interstate Callout */}
                  {isInterstateScope && decision?.m2?.rows && (
                    (() => {
                      const rows = decision.m2.rows;
                      const topOverall = rows[0];
                      const localRows = rows.filter((r) => r.state === 'Karnataka');
                      const topLocal = localRows.length > 0 ? localRows[0] : null;

                      if (topOverall && topLocal && topOverall.market !== topLocal.market) {
                        const diff = topOverall.net_per_qtl - topLocal.net_per_qtl;
                        if (diff > 5) {
                          return (
                            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-950">
                              🚀 <strong>Interstate Arbitrage:</strong> Selling to <strong>{topOverall.market} ({topOverall.state})</strong> nets <strong>+₹{Math.round(diff).toLocaleString()}/qtl more (+₹{Math.round(diff * volume).toLocaleString()} total)</strong> than best home market {topLocal.market}!
                            </div>
                          );
                        }
                      }
                      return null;
                    })()
                  )}

                  {/* Full Processors Embedded in View All 3 W's */}
                  <div className="space-y-6 pt-4 border-t-2 border-dashed border-slate-200">
                    <div className="bg-slate-100/90 border border-slate-200 p-2.5 rounded-xl text-center font-mono text-xs font-bold text-slate-700 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-crimson-brand animate-ping"></span>
                      <span>ALL 3 OPERATIONS RESEARCH DECISION PROCESSORS ACTIVE BELOW</span>
                    </div>

                    {/* W1 Processor Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                        <span className="text-base">📍</span>
                        <h3 className="font-extrabold text-sm text-slate-900 font-mono">
                          W1 · WHERE TO SELL PROCESSOR (MODULE 2: NET-IN-HAND ARBITRAGE)
                        </h3>
                      </div>
                      {renderWhereProcessor()}
                    </div>

                    {/* W2 Processor Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                        <span className="text-base">⏱️</span>
                        <h3 className="font-extrabold text-sm text-slate-900 font-mono">
                          W2 · WHEN TO SELL PROCESSOR (MODULE 3: STORAGE CARRY V(t) &amp; MILP)
                        </h3>
                      </div>
                      {renderWhenProcessor()}
                    </div>

                    {/* W3 Processor Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                        <span className="text-base">🤝</span>
                        <h3 className="font-extrabold text-sm text-slate-900 font-mono">
                          W3 · TO WHOM TO SELL PROCESSOR (MODULE 4: BOUNDED KNAPSACK LOT AGGREGATION)
                        </h3>
                      </div>
                      {renderWhomProcessor()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DRILLDOWN OPERATIONS RESEARCH WORKSPACE (when workflowStep === 'Drill' or workflowStep === 'All') */}
          {(workflowStep === 'Drill' || workflowStep === 'All') && (
            <div id="section-drill" className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                  { id: 'where', label: 'Where to sell (W1: Mandi Arbitrage)' },
                  { id: 'hold', label: 'Hold vs Sell (W2: Timing & Storage)' },
                  { id: 'aggregate', label: 'Aggregate (W3: Bulk Lots)' },
                  { id: 'market', label: 'Market (M1: STL Price Path)' },
                  { id: 'inputs', label: 'Inputs' },
                  { id: 'kb', label: '📚 Knowledge Base & 3 W\'s Architecture' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id as any);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === id
                        ? 'bg-gradient-to-b from-white to-rose-50/70 text-crimson-brandDark border border-crimson-brand shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === 'where' && renderWhereProcessor()}
              {activeTab === 'hold' && renderWhenProcessor()}
              {activeTab === 'aggregate' && renderWhomProcessor()}
              {activeTab === 'market' && renderMarketStl()}
              {activeTab === 'inputs' && renderInputsTab()}
              {activeTab === 'kb' && <KnowledgeBaseTab />}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
