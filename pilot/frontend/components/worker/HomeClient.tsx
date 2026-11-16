'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { patchWorkflow } from '@/lib/workflow';

export default function HomeClient() {
  const router = useRouter();

  function startNew() {
    // start a fresh worker flow but keep in same workflow key
    patchWorkflow({
      transcript: '',
      originalTranscript: '',
      transcriptMeta: undefined,
      extractions: [],
      gaps: [],
      ambiguities: [],
      answers: {},
      corrections: {},
      report: null,
      validation: null,
      scenarioId: undefined,
      draftId: undefined,
    });
    router.push('/speak');
  }

  return (
    <div className="stack-lg">
      <section className="card card-soft stack center" style={{ padding: '28px 20px' }}>
        <h1>నమస్కారం</h1>
        <p className="small" style={{ fontSize: '1.15rem' }}>
          మీ మాటలను టైప్ చేయకుండా చెప్పండి. మేము విని, నమూనా నివేదిక తయారు చేయడానికి సహాయం చేస్తాము.
        </p>
        <p className="muted small">Welcome. Tap the button and speak. We will help prepare a sample report.</p>
        <div style={{ marginTop: 8 }}>
          <button type="button" className="mic-cta" onClick={startNew} aria-label="మాట్లాడండి - ప్రారంభించండి">
            <span className="mic-icon" aria-hidden="true">🎤</span>
            <span>మాట్లాడండి</span>
          </button>
        </div>
        <p className="muted small">ఒకసారి నొక్కి మాట్లాడటం ప్రారంభించండి</p>
      </section>

      <section className="stack" aria-label="Simple steps">
        <div className="card">
          <h2>ఎలా ఉపయోగించాలి</h2>
          <ol style={{ margin: '8px 0 0 20px', padding: 0, display: 'grid', gap: 8 }}>
            <li><strong>మాట్లాడండి</strong> — బటన్ నొక్కి మీ వివరాలు చెప్పండి.</li>
            <li><strong>చూడండి</strong> — వచ్చిన మాటలను సరిచూడండి.</li>
            <li><strong>సమాధానం</strong> — అవసరమైన ప్రశ్నలకు సమాధానం ఇవ్వండి.</li>
            <li><strong>నమూనా నివేదిక</strong> — నిర్ధారించి నమూనా నివేదిక తీసుకోండి.</li>
          </ol>
        </div>
      </section>

      <section className="stack">
        <Link href="/history" className="btn btn-secondary">నా చరిత్ర చూడండి / View history</Link>
        <Link href="/review" className="btn btn-secondary">కొనసాగించండి (ముందు సేవ్ చేసినది) / Continue saved</Link>
      </section>
    </div>
  );
}