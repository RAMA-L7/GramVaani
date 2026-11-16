"""Local server-side ASR via faster-whisper (optional dependency)."""
from __future__ import annotations

import importlib.util
import os
from pathlib import Path
from typing import Any

from .base import ASRError, ASRProvider, ASRResult


def _installed() -> bool:
    return importlib.util.find_spec("faster_whisper") is not None


class FasterWhisperASRProvider(ASRProvider):
    id = "faster_whisper"
    label = "Local faster-whisper (server-side)"
    mode = "server"

    def _model_name(self) -> str:
        return os.getenv("FASTER_WHISPER_MODEL", "small")

    def capability(self) -> dict[str, Any]:
        installed = _installed()
        model = self._model_name()
        notes = [
            "Runs locally on the server when faster-whisper and model files are available.",
            "May download model files on first use depending on cache/configuration; this can take time and network access.",
            "Accent/noise robustness for Telugu is not guaranteed (no provider chosen from advertised accuracy).",
        ]
        if not installed:
            notes.append("faster-whisper Python package is not installed in this environment.")
        return {
            "id": self.id,
            "label": self.label,
            "available": installed,
            "mode": self.mode,
            "requires": ["pip/uv optional dependency: faster-whisper", f"Model availability/download for '{model}'", "Sufficient CPU/GPU resources"],
            "notes": notes,
            "configured": installed,
            "model": model,
        }

    async def transcribe_audio(self, audio_path: Path, language: str | None = None, content_type: str | None = None, filename: str | None = None) -> ASRResult:
        if not _installed():
            raise ASRError(
                "faster-whisper is not installed. Install optional dependencies and ensure model access, or choose another provider.",
                status_code=503,
                details={"provider": self.id, "missing_dependency": "faster-whisper"},
            )
        try:
            from faster_whisper import WhisperModel  # type: ignore
        except Exception as exc:  # pragma: no cover - depends on environment
            raise ASRError(f"Failed to import faster-whisper: {exc}", status_code=503, details={"provider": self.id}) from exc

        model_name = self._model_name()
        device = os.getenv("FASTER_WHISPER_DEVICE", "cpu")
        compute_type = os.getenv("FASTER_WHISPER_COMPUTE_TYPE", "int8")
        download_root = os.getenv("FASTER_WHISPER_DOWNLOAD_ROOT") or None
        lang = (language or os.getenv("FASTER_WHISPER_LANGUAGE") or "te").split("-")[0]
        warnings: list[str] = [
            "Local faster-whisper transcription attempted; Telugu accent/noise robustness is not guaranteed.",
        ]
        try:
            model = WhisperModel(model_name, device=device, compute_type=compute_type, download_root=download_root)
            segments_iter, info = model.transcribe(str(audio_path), language=lang, beam_size=5)
            segments = []
            texts = []
            for seg in segments_iter:
                seg_text = (getattr(seg, "text", "") or "").strip()
                if seg_text:
                    texts.append(seg_text)
                segments.append({
                    "start": getattr(seg, "start", None),
                    "end": getattr(seg, "end", None),
                    "text": seg_text,
                    "avg_logprob": getattr(seg, "avg_logprob", None),
                    "no_speech_prob": getattr(seg, "no_speech_prob", None),
                })
            transcript = " ".join(texts).strip()
            if not transcript:
                raise ASRError(
                    "faster-whisper produced no transcript. Audio may be silent/unclear or model/language settings may need adjustment.",
                    status_code=422,
                    details={"provider": self.id, "model": model_name},
                )
            duration_ms = None
            if getattr(info, "duration", None) is not None:
                try:
                    duration_ms = int(float(info.duration) * 1000)
                except Exception:
                    duration_ms = None
            detected_lang = getattr(info, "language", None) or lang
            confidence = None
            if getattr(info, "language_probability", None) is not None:
                try:
                    confidence = float(info.language_probability)
                except Exception:
                    confidence = None
            return ASRResult(
                transcript=transcript,
                original_transcript=transcript,
                provider=self.id,
                language=detected_lang,
                duration_ms=duration_ms,
                segments=segments,
                confidence=confidence,
                warnings=warnings,
                simulated=False,
                meta={"model": model_name, "device": device, "compute_type": compute_type},
            )
        except ASRError:
            raise
        except Exception as exc:  # pragma: no cover - environment/model dependent
            msg = str(exc)
            hint = " Check model name/download access and audio format dependencies (ffmpeg may be required)."
            raise ASRError(
                f"faster-whisper transcription failed: {msg}.{hint}",
                status_code=503,
                details={"provider": self.id, "model": model_name},
            ) from exc
