import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge.jsx';
import { Button } from '../../components/Button.jsx';
import {
  loadAiLogboekEntries,
  saveAiLogboekEntries,
} from '../../utils/aiLogboekStorage.js';
import './Logboek.css';

const PROMPT_PREVIEW_LEN = 140;

const AI_MODELS = [
  'Claude Sonnet',
  'Claude Opus',
  'ChatGPT-4o',
  'Gemini 1.5',
  'GitHub Copilot',
  'Cursor Agent',
  'Other',
];

/** @param {Date} [d] */
function toDatetimeLocalValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** @param {string} iso */
function formatNlTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = new Intl.DateTimeFormat('nl-NL', { weekday: 'short' }).format(d);
  const dmy = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
  const time = new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return `${weekday} ${dmy} om ${time}`;
}

/** @param {string} field */
function csvEscape(field) {
  const s = String(field);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function LogboekPage() {
  const [entries, setEntries] = useState(() => loadAiLogboekEntries());
  const [model, setModel] = useState(AI_MODELS[0]);
  const [tool, setTool] = useState('');
  const [prompt, setPrompt] = useState('');
  const [atLocal, setAtLocal] = useState(() => toDatetimeLocalValue());
  const [expanded, setExpanded] = useState({});

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [entries],
  );

  const persist = useCallback((next) => {
    setEntries(next);
    saveAiLogboekEntries(next);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const atDate = new Date(atLocal);
      if (Number.isNaN(atDate.getTime())) return;
      const entry = {
        id: newId(),
        at: atDate.toISOString(),
        model,
        tool: tool.trim(),
        prompt,
      };
      persist([...entries, entry]);
      setTool('');
      setPrompt('');
      setAtLocal(toDatetimeLocalValue());
    },
    [atLocal, entries, model, persist, prompt, tool],
  );

  const onDelete = useCallback(
    (id) => {
      persist(entries.filter((x) => x.id !== id));
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [entries, persist],
  );

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onExportCsv = useCallback(() => {
    const header = 'timestamp,model,tool,prompt';
    const body = sorted
      .map((r) => [r.at, r.model, r.tool, r.prompt].map(csvEscape).join(','))
      .join('\n');
    const csv = `\uFEFF${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = toDatetimeLocalValue().slice(0, 10);
    a.href = url;
    a.download = `u-festival-ai-logboek-${stamp}.csv`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const count = entries.length;

  return (
    <div className="page-logboek">
      <Link className="logboek-back tap-scale" to="/info">
        Terug naar info
      </Link>
      <h1 className="page-title">AI-logboek</h1>
      <p className="logboek-count">
        {count} {count === 1 ? 'prompt gelogd' : 'prompts gelogd'}
      </p>

      <form className="logboek-form" onSubmit={onSubmit} noValidate>
        <div className="logboek-field">
          <label className="logboek-field__label" htmlFor="logboek-model">
            AI-model
          </label>
          <select
            id="logboek-model"
            className="logboek-field__select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {AI_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="logboek-field">
          <label className="logboek-field__label" htmlFor="logboek-tool">
            Tool / plug-in / IDE
          </label>
          <input
            id="logboek-tool"
            className="logboek-field__input"
            type="text"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            autoComplete="off"
            placeholder="bijv. Cursor, VS Code, …"
          />
        </div>

        <div className="logboek-field">
          <label className="logboek-field__label" htmlFor="logboek-prompt">
            Prompt
          </label>
          <textarea
            id="logboek-prompt"
            className="logboek-field__textarea"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="logboek-field">
          <label className="logboek-field__label" htmlFor="logboek-at">
            Datum en tijd
          </label>
          <input
            id="logboek-at"
            className="logboek-field__input"
            type="datetime-local"
            value={atLocal}
            onChange={(e) => setAtLocal(e.target.value)}
          />
        </div>

        <div className="logboek-actions">
          <Button type="submit" variant="primary">
            Toevoegen
          </Button>
        </div>
      </form>

      <h2 className="logboek-section-title">Log</h2>
      {sorted.length === 0 ? (
        <p className="logboek-empty">Nog geen prompts gelogd.</p>
      ) : (
        sorted.map((entry) => {
          const isOpen = !!expanded[entry.id];
          const needsTruncate = entry.prompt.length > PROMPT_PREVIEW_LEN;
          const shown =
            isOpen || !needsTruncate
              ? entry.prompt
              : `${entry.prompt.slice(0, PROMPT_PREVIEW_LEN).trimEnd()}…`;

          return (
            <article key={entry.id} className="logboek-entry">
              <p className="logboek-entry__time">{formatNlTimestamp(entry.at)}</p>
              <div className="logboek-entry__badges">
                <Badge variant="accent">{entry.model}</Badge>
                {entry.tool ? <Badge variant="secondary">{entry.tool}</Badge> : null}
              </div>
              {needsTruncate ? (
                <button
                  type="button"
                  className="logboek-entry__prompt logboek-entry__prompt--truncated tap-scale"
                  aria-expanded={isOpen}
                  onClick={() => toggleExpand(entry.id)}
                >
                  {shown}
                </button>
              ) : (
                <p className="logboek-entry__prompt">{shown}</p>
              )}
              <div className="logboek-entry__footer">
                <Button
                  type="button"
                  variant="ghost"
                  className="logboek-entry__delete tap-scale"
                  onClick={() => onDelete(entry.id)}
                >
                  Verwijderen
                </Button>
              </div>
            </article>
          );
        })
      )}

      <div className="logboek-export-wrap">
        <Button type="button" variant="ghost" className="btn--segment" onClick={onExportCsv}>
          Exporteren als CSV
        </Button>
      </div>
    </div>
  );
}
