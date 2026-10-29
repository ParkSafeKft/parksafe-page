import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../../src/components/admin/RideTrackingDiagnostics.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;
const module = { exports: {} };
new Function('require','module','exports',compiled)(name => name === '@/lib/supabaseClient'
    ? { supabase: { rpc: () => { throw Error('No production calls allowed in rendering tests'); } } }
    : require(name), module, module.exports);
const render = evidence => renderToStaticMarkup(React.createElement(module.exports.TrackingEvidence, { evidence }));
const base = { schema_version: 1, sample_gap_threshold_ms: 15000, sample_gaps: [], events: [],
    observed_sample_count: 20, observed_interval_count: 19,
    dropped_gaps: 0, dropped_events: 0, coverage: 'complete' };

test('missing and legacy telemetry are presented as unknown, never zero failures', () => {
    assert.match(render(null), /Nincs mért/);
    assert.match(render({ schema_version: 2 }), /Nincs mért/);
    assert.match(render({ ...base, sample_gaps: [null] }), /Nincs mért/);
    assert.doesNotMatch(render(null), /hibamentes túra<\/dd>/);
});
test('measured normal cadence is explicitly scoped to observed coverage', () => {
    assert.match(render(base), /Nincs a megfigyelt szakaszon/);
    assert.match(render({ ...base, coverage: 'partial' }), /Részleges/);
    assert.match(render({ ...base, observed_interval_count: 0, observed_sample_count: 1 }), /Nincs összehasonlítható mintapár/);
});
test('40-second gaps, permission transitions and truncation are visible without exposing coordinates', () => {
    const html = render({ ...base, dropped_gaps: 2, dropped_events: 1,
        sample_gaps: [{ start_ms: 1_700_000_000_000, end_ms: 1_700_000_040_000 }],
        events: [{ at_ms: 1_700_000_000_000, kind: 'foreground_permission', value: 'denied' }],
        latitude: 47.12345, longitude: 19.12345 });
    assert.match(html, /40\.0 mp/);
    assert.match(html, /Helyengedély: Tiltva/);
    assert.match(html, /korábbi mintaköz/);
    assert.doesNotMatch(html, /47\.12345|19\.12345/);
});
