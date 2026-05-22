'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Leaflet from 'leaflet';

/** A single ride track as an ordered list of [lng, lat] pairs. */
export type Track = { points: [number, number][] };

export interface TrackHeatLayerOptions {
    /** Base hue of the additive glow. */
    color?: string;
    /** Width (px) of the soft halo pass. */
    haloWidth?: number;
    /** Width (px) of the bright core pass. */
    coreWidth?: number;
    /** Alpha of the halo pass (additive accumulation). */
    haloAlpha?: number;
    /** Alpha of the core pass (additive accumulation). */
    coreAlpha?: number;
}

/** Public shape of the layer returned by the factory. */
export interface TrackHeatLayer extends Leaflet.Layer {
    setTracks(tracks: Track[]): void;
}

/**
 * Build a Strava-style additive track-heat layer bound to the runtime Leaflet
 * instance `L`. Leaflet is import()-ed lazily on the client (it touches `window`
 * at import), so the layer class is created here rather than at module load.
 *
 * All tracks are stroked onto a single 2D canvas in the map's overlayPane using
 * `globalCompositeOperation = 'lighter'`, so overlapping rides accumulate toward
 * white-hot. No WebGL is used. The canvas redraws only on zoom/move/resize end;
 * during a pan the overlayPane transform keeps it aligned. The canvas is hidden
 * during the zoom animation and redrawn (at the new scale) on zoomend.
 */
export function createTrackHeatLayer(
    L: typeof Leaflet,
    tracks: Track[],
    options: TrackHeatLayerOptions = {}
): TrackHeatLayer {
    const opts = {
        color: options.color ?? '#22c55e',
        haloWidth: options.haloWidth ?? 6,
        coreWidth: options.coreWidth ?? 1.5,
        haloAlpha: options.haloAlpha ?? 0.06,
        coreAlpha: options.coreAlpha ?? 0.18,
    };

    const Impl = L.Layer.extend({
        initialize(this: any, initial: Track[]) {
            this._tracks = initial;
        },

        onAdd(this: any, map: Leaflet.Map) {
            this._leafletMap = map;
            const size = map.getSize();
            const canvas = L.DomUtil.create('canvas', 'parksafe-track-heat') as HTMLCanvasElement;
            canvas.width = size.x;
            canvas.height = size.y;
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.pointerEvents = 'none';
            this._canvas = canvas;
            map.getPane('overlayPane')!.appendChild(canvas);

            this._boundReset = () => this._reset();
            this._boundHide = () => { if (this._canvas) this._canvas.style.visibility = 'hidden'; };
            this._boundResize = () => this._onResize();

            map.on('moveend', this._boundReset);
            map.on('zoomstart', this._boundHide);
            map.on('zoomend', this._boundReset);
            map.on('resize', this._boundResize);
            this._reset();
            return this;
        },

        onRemove(this: any, map: Leaflet.Map) {
            map.off('moveend', this._boundReset);
            map.off('zoomstart', this._boundHide);
            map.off('zoomend', this._boundReset);
            map.off('resize', this._boundResize);
            if (this._canvas) { this._canvas.remove(); this._canvas = null; }
            this._leafletMap = null;
            return this;
        },

        setTracks(this: any, next: Track[]) {
            this._tracks = next;
            if (this._leafletMap) this._reset();
        },

        _onResize(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            this._reset();
        },

        _reset(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
            canvas.style.visibility = 'visible';
            this._redraw();
        },

        _redraw(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const origin = map.containerPointToLayerPoint([0, 0]);
            const tracksList = this._tracks as Track[];

            const pass = (width: number, alpha: number) => {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = opts.color;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (const track of tracksList) {
                    const pts = track.points;
                    if (pts.length < 2) continue;
                    ctx.beginPath();
                    for (let i = 0; i < pts.length; i++) {
                        const p = map.latLngToLayerPoint([pts[i][1], pts[i][0]]).subtract(origin);
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                    ctx.stroke();
                }
            };

            pass(opts.haloWidth, opts.haloAlpha);
            pass(opts.coreWidth, opts.coreAlpha);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        },
    });

    return new (Impl as new (...args: any[]) => any)(tracks) as unknown as TrackHeatLayer;
}
