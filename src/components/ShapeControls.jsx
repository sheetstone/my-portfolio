import { useState, useRef, useCallback } from 'react';
import { DEFAULT_CONFIG } from '../three/shapes.js';
import { CARD_BACK_STYLES } from '../three/cardBacks.js';
import './ShapeControls.css';

const LAYER_LABELS = { far: 'Far (background)', mid: 'Mid', near: 'Near (foreground)' };

function deepClone(cfg) {
  return {
    ...cfg,
    far:  { ...cfg.far },
    mid:  { ...cfg.mid },
    near: { ...cfg.near },
  };
}

function Row({ label, value, min, max, step, onChange }) {
  return (
    <div className="sc-row">
      <span className="sc-label">{label}</span>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="sc-val">{value}</span>
    </div>
  );
}

export default function ShapeControls({ onConfigChange, onCardBackChange }) {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState(() => deepClone(DEFAULT_CONFIG));
  const [cardBack, setCardBack] = useState(CARD_BACK_STYLES[0].id);
  const debounceRef = useRef(null);

  const commit = useCallback((next) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onConfigChange(next), 120);
  }, [onConfigChange]);

  function setLayer(layer, key, val) {
    setCfg(prev => {
      const next = deepClone(prev);
      next[layer][key] = val;
      commit(next);
      return next;
    });
  }

  function setGlobal(key, val) {
    setCfg(prev => {
      const next = deepClone(prev);
      next[key] = val;
      commit(next);
      return next;
    });
  }

  function selectBack(id) {
    setCardBack(id);
    onCardBackChange?.(id);
  }

  return (
    <div className={`sc-panel ${open ? 'sc-open' : ''}`}>
      <button className="sc-toggle" onClick={() => setOpen(o => !o)}>
        Controls {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="sc-body">

          {/* ── Card Back Design ── */}
          <section>
            <div className="sc-section-label">Card Back Design</div>
            <div className="sc-backs">
              {CARD_BACK_STYLES.map(s => (
                <button
                  key={s.id}
                  className={`sc-back-btn${cardBack === s.id ? ' sc-back-active' : ''}`}
                  style={{ background: s.color }}
                  onClick={() => selectBack(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Shape layers ── */}
          {['far', 'mid', 'near'].map(layer => (
            <section key={layer}>
              <div className="sc-section-label">{LAYER_LABELS[layer]}</div>
              <Row label="count"    value={cfg[layer].n}    min={0}   max={20}  step={1}   onChange={v => setLayer(layer, 'n',    v)} />
              <Row label="size min" value={cfg[layer].rMin} min={0.2} max={5}   step={0.1} onChange={v => setLayer(layer, 'rMin', v)} />
              <Row label="size max" value={cfg[layer].rMax} min={0.2} max={7}   step={0.1} onChange={v => setLayer(layer, 'rMax', v)} />
              <Row label="x min"   value={cfg[layer].minX} min={0}   max={18}  step={0.5} onChange={v => setLayer(layer, 'minX', v)} />
              <Row label="z near"  value={cfg[layer].zMax} min={-30} max={25}  step={0.5} onChange={v => setLayer(layer, 'zMax', v)} />
              <Row label="z far"   value={cfg[layer].zMin} min={-30} max={25}  step={0.5} onChange={v => setLayer(layer, 'zMin', v)} />
            </section>
          ))}

          {/* ── Mouse repel ── */}
          <section>
            <div className="sc-section-label">Mouse Repel</div>
            <Row label="radius" value={cfg.repR}      min={0}   max={15}   step={0.1}  onChange={v => setGlobal('repR',     v)} />
            <Row label="force"  value={cfg.repForce}  min={0}   max={1}    step={0.01} onChange={v => setGlobal('repForce', v)} />
            <Row label="decay"  value={cfg.repDecay}  min={0.5} max={0.99} step={0.01} onChange={v => setGlobal('repDecay', v)} />
            <Row label="clamp"  value={cfg.repClamp}  min={0}   max={20}   step={0.5}  onChange={v => setGlobal('repClamp', v)} />
          </section>

          <button
            className="sc-reset"
            onClick={() => {
              const next = deepClone(DEFAULT_CONFIG);
              setCfg(next);
              onConfigChange(next);
            }}
          >
            Reset shapes to defaults
          </button>
        </div>
      )}
    </div>
  );
}
