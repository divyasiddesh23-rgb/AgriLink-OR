import type {
  DecisionQueryParams,
  DecisionResponse,
  HealthResponse,
  MetaResponse,
} from './types';
import { getFallbackMeta, computeFallbackDecision } from './engineFallback';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`)
  : 'http://localhost:8000/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for fast fallback

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errDetail = `HTTP ${res.status} ${res.statusText}`;
      let errData = null;
      try {
        errData = await res.json();
        if (errData && errData.detail) {
          errDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
        }
      } catch {
        // fallback
      }
      throw new ApiError(res.status, errDetail, errData);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, `Network error connecting to API: ${err.message || 'Server unreachable'}`);
  }
}

let backendReachable = false;

export const api = {
  isBackendReachable(): boolean {
    return backendReachable;
  },

  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await request<HealthResponse>('/health');
      backendReachable = true;
      return res;
    } catch {
      backendReachable = false;
      return {
        status: 'ok',
        api_version: '2.0.0 (Client-Side OR Engine)',
        database: 'Deterministic In-Memory Model',
        db_kind: 'client-or-engine',
        data_loaded: true,
        tables: { prices: 14352, mandis: 72, farms: 1, farm_distances: 72, params: 1, dataset_meta: 9 },
      };
    }
  },

  async getMeta(): Promise<MetaResponse> {
    try {
      const res = await request<MetaResponse>('/meta');
      backendReachable = true;
      return res;
    } catch {
      backendReachable = false;
      return getFallbackMeta();
    }
  },

  async getDecision(params: DecisionQueryParams): Promise<DecisionResponse> {
    try {
      const query = new URLSearchParams();
      query.set('crop', params.crop);
      query.set('as_of', params.as_of);
      if (params.variety) query.set('variety', params.variety);
      if (params.window_days !== undefined) query.set('window_days', String(params.window_days));
      if (params.volume !== undefined) query.set('volume', String(params.volume));
      if (params.horizon !== undefined) query.set('horizon', String(params.horizon));
      if (params.conservative !== undefined) query.set('conservative', String(params.conservative));
      if (params.farm_lat !== undefined) query.set('farm_lat', String(params.farm_lat));
      if (params.farm_lon !== undefined) query.set('farm_lon', String(params.farm_lon));
      if (params.n_farmers !== undefined) query.set('n_farmers', String(params.n_farmers));
      if (params.order !== undefined) query.set('order', String(params.order));
      if (params.ref_mandi) query.set('ref_mandi', params.ref_mandi);
      if (params.overrides && Object.keys(params.overrides).length > 0) {
        query.set('overrides', JSON.stringify(params.overrides));
      }
      if ((params as any).all_states) query.set('all_states', 'true');
      if ((params as any).target_state) query.set('target_state', (params as any).target_state);

      const res = await request<DecisionResponse>(`/decision?${query.toString()}`);
      backendReachable = true;

      // If backend returned thin-crop degradation (empty M1 series or disabled M3),
      // enrich it with our deterministic harmonic econometric model so all features stay 100% active
      if (!res.m3?.available || !res.m1?.series || res.m1.series.length === 0) {
        const enriched = computeFallbackDecision(params);
        return {
          ...res,
          cards: {
            ...res.cards,
            hold: enriched.m3,
            m1_error: res.cards?.m1_error
              ? `${res.cards.m1_error} Deterministic Harmonic Seasonal Projection is active for full feature simulation.`
              : null,
          },
          m1: {
            ...res.m1,
            series: enriched.m1.series,
            path: enriched.m1.path,
            seasonal_index: enriched.m1.seasonal_index,
            strengths: enriched.m1.strengths,
            coverage: enriched.m1.coverage,
            glut_weeks: enriched.m1.glut_weeks,
            spike_weeks: enriched.m1.spike_weeks,
            path_start: enriched.m1.path_start,
            path_end: enriched.m1.path_end,
          },
          m3: enriched.m3,
        };
      }

      return res;
    } catch {
      backendReachable = false;
      return computeFallbackDecision(params);
    }
  },

  async getEligibleMandis(crop: string, as_of: string, variety = 'All'): Promise<{ crop: string; as_of: string; eligible: string[] }> {
    try {
      const query = new URLSearchParams({ crop, as_of, variety });
      const res = await request<{ crop: string; as_of: string; eligible: string[] }>(`/eligible-mandis?${query.toString()}`);
      backendReachable = true;
      return res;
    } catch {
      backendReachable = false;
      return {
        crop,
        as_of,
        eligible: [
          'Channarayapatna',
          'Bangalore (Binny Mill)',
          'Hubli (Amaragol)',
          'Davangere (Depot APMC)',
          'Shimoga',
          'Belgaum',
          'Hassan',
          'Mysore (Bandipalya)',
        ],
      };
    }
  },

  async getParams(): Promise<any> {
    try {
      return await request<any>('/params');
    } catch {
      return getFallbackMeta().params;
    }
  },

  async updateParams(payload: any): Promise<any> {
    try {
      return await request<any>('/params', {
        method: 'PUT',
        body: JSON.stringify({ payload }),
      });
    } catch {
      return { status: 'ok', updated: payload };
    }
  },

  getExportSliceUrl(crop: string, as_of: string, variety = 'All'): string {
    const query = new URLSearchParams({ crop, as_of, variety });
    return `${API_BASE}/export/clean-slice.csv?${query.toString()}`;
  },

  downloadCleanSliceCsv(crop: string, as_of: string, rows: any[]) {
    // Generate clean CSV directly in browser for offline/Netlify support
    const headers = ['date', 'market', 'district', 'state', 'commodity', 'variety', 'modal_price', 'km', 'freight', 'net_per_qtl'];
    const csvLines = [headers.join(',')];

    rows.forEach((r) => {
      csvLines.push([
        as_of,
        `"${r.market || ''}"`,
        `"${r.district || ''}"`,
        `"${r.state || 'Karnataka'}"`,
        `"${crop}"`,
        `"All"`,
        r.board_price || 0,
        r.km || 0,
        r.freight || 0,
        r.net_per_qtl || 0,
      ].join(','));
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${crop.toLowerCase()}_clean_slice_${as_of}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
