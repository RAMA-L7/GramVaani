"""Configurable cloud/HTTP ASR adapter (generic, SDK/HTTP-ready).

Supports provider modes via environment configuration:
- google_stt: Google Cloud Speech-to-Text REST (API key or configured endpoint)
- azure_speech: Azure Speech to Text REST (key/region or endpoint)
- sarvam: Sarvam AI speech-to-text API (key/endpoint)
- generic: POST audio to CLOUD_ASR_ENDPOINT with bearer/API key headers

No credentials or provider-specific keys are hardcoded. If configuration or
credentials are missing, this adapter reports a clear configuration-required
state and never fabricates recognition results.
"""
from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import Any

import httpx

from .base import ASRError, ASRProvider, ASRResult

SUPPORTED = {"google_stt", "azure_speech", "sarvam", "generic"}


class CloudHTTPASRProvider(ASRProvider):
    id = "cloud_http"
    label = "Configurable cloud/HTTP ASR adapter"
    mode = "server"

    def _cfg(self) -> dict[str, Any]:
        provider = (os.getenv("CLOUD_ASR_PROVIDER") or "").strip().lower()
        return {
            "provider": provider,
            "endpoint": (os.getenv("CLOUD_ASR_ENDPOINT") or "").strip(),
            "api_key": (os.getenv("CLOUD_ASR_API_KEY") or "").strip(),
            "project_id": (os.getenv("CLOUD_ASR_PROJECT_ID") or "").strip(),
            "region": (os.getenv("CLOUD_ASR_REGION") or "").strip(),
            "language": (os.getenv("CLOUD_ASR_LANGUAGE") or "te-IN").strip(),
            "timeout": float(os.getenv("CLOUD_ASR_TIMEOUT_SECONDS", "30") or 30),
        }

    def _missing(self, cfg: dict[str, Any]) -> list[str]:
        p = cfg["provider"]
        if not p:
            return ["CLOUD_ASR_PROVIDER (google_stt|azure_speech|sarvam|generic)"]
        if p not in SUPPORTED:
            return [f"CLOUD_ASR_PROVIDER must be one of {sorted(SUPPORTED)}"]
        missing: list[str] = []
        if p == "google_stt":
            # API key path is simplest for generic HTTP stub; endpoint may override.
            if not cfg["endpoint"] and not cfg["api_key"] and not cfg["project_id"]:
                missing.append("CLOUD_ASR_API_KEY or CLOUD_ASR_ENDPOINT (and project/auth config as needed)")
        elif p == "azure_speech":
            if not cfg["endpoint"] and not (cfg["api_key"] and cfg["region"]):
                missing.append("CLOUD_ASR_ENDPOINT or (CLOUD_ASR_API_KEY and CLOUD_ASR_REGION)")
        elif p == "sarvam":
            if not cfg["api_key"]:
                missing.append("CLOUD_ASR_API_KEY")
            if not cfg["endpoint"]:
                # default endpoint can be used, but make config path explicit
                pass
        elif p == "generic":
            if not cfg["endpoint"]:
                missing.append("CLOUD_ASR_ENDPOINT")
        return missing

    def capability(self) -> dict[str, Any]:
        cfg = self._cfg()
        missing = self._missing(cfg)
        provider = cfg["provider"] or "unconfigured"
        configured = cfg["provider"] in SUPPORTED and len(missing) == 0
        notes = [
            "Generic HTTP/SDK-ready adapter for configured speech providers; no API keys are hardcoded.",
            "Set CLOUD_ASR_PROVIDER and required credentials/endpoint in .env (see .env.example).",
            "Accuracy/accent/noise robustness for Telugu depends on provider/model/config and is not guaranteed.",
        ]
        if cfg["provider"] and cfg["provider"] not in SUPPORTED:
            notes.append(f"Unsupported provider '{cfg['provider']}'.")
        if missing:
            notes.append("Configuration required: " + ", ".join(missing))
        return {
            "id": self.id,
            "label": self.label,
            "available": configured,
            "mode": self.mode,
            "requires": ["Valid provider credentials/config in environment", "Network access to configured endpoint"],
            "notes": notes,
            "configured": configured,
            "provider": provider,
            "missing": missing,
        }

    async def transcribe_audio(self, audio_path: Path, language: str | None = None, content_type: str | None = None, filename: str | None = None) -> ASRResult:
        cfg = self._cfg()
        missing = self._missing(cfg)
        if missing:
            raise ASRError(
                "Cloud ASR provider is not configured. " + "; ".join(missing),
                status_code=503,
                details={"provider": self.id, "cloud_provider": cfg["provider"] or None, "missing": missing},
            )
        provider = cfg["provider"]
        lang = language or cfg["language"] or "te-IN"
        audio_bytes = audio_path.read_bytes()
        timeout = cfg["timeout"]
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                if provider == "google_stt":
                    return await self._google(client, cfg, audio_bytes, lang, content_type)
                if provider == "azure_speech":
                    return await self._azure(client, cfg, audio_bytes, lang, content_type)
                if provider == "sarvam":
                    return await self._sarvam(client, cfg, audio_bytes, lang, content_type, filename)
                return await self._generic(client, cfg, audio_bytes, lang, content_type, filename)
        except ASRError:
            raise
        except httpx.HTTPError as exc:
            raise ASRError(
                f"Cloud ASR HTTP request failed: {exc}",
                status_code=502,
                details={"provider": self.id, "cloud_provider": provider},
            ) from exc

    async def _google(self, client: httpx.AsyncClient, cfg: dict[str, Any], audio: bytes, lang: str, content_type: str | None) -> ASRResult:
        endpoint = cfg["endpoint"] or "https://speech.googleapis.com/v1/speech:recognize"
        params = {}
        if cfg["api_key"] and "key=" not in endpoint:
            params["key"] = cfg["api_key"]
        b64 = base64.b64encode(audio).decode("ascii")
        # Best-effort generic config; users may need to adjust encoding/sample rate via endpoint/proxy.
        payload = {
            "config": {
                "languageCode": lang,
                "enableAutomaticPunctuation": True,
            },
            "audio": {"content": b64},
        }
        resp = await client.post(endpoint, params=params, json=payload)
        data = resp.json() if resp.content else {}
        if resp.status_code >= 400:
            raise ASRError(
                f"Google STT request failed ({resp.status_code}). Check credentials, endpoint, and audio encoding/sample rate config.",
                status_code=502,
                details={"provider": self.id, "cloud_provider": "google_stt", "response": data},
            )
        texts, segments = [], []
        confs = []
        for r in data.get("results", []) or []:
            alts = r.get("alternatives", []) or []
            if not alts:
                continue
            top = alts[0]
            t = (top.get("transcript") or "").strip()
            if t:
                texts.append(t)
            if top.get("confidence") is not None:
                confs.append(float(top["confidence"]))
            segments.append({"text": t, "confidence": top.get("confidence")})
        transcript = " ".join(texts).strip()
        if not transcript:
            raise ASRError("Google STT returned no transcript.", status_code=422, details={"provider": self.id, "response": data})
        return ASRResult(
            transcript=transcript,
            original_transcript=transcript,
            provider=f"cloud_http:google_stt",
            language=lang,
            segments=segments or None,
            confidence=sum(confs) / len(confs) if confs else None,
            warnings=["Cloud transcription via configured Google STT; accent/noise robustness not guaranteed."],
            simulated=False,
            meta={"cloud_provider": "google_stt"},
        )

    async def _azure(self, client: httpx.AsyncClient, cfg: dict[str, Any], audio: bytes, lang: str, content_type: str | None) -> ASRResult:
        if cfg["endpoint"]:
            url = cfg["endpoint"]
        else:
            region = cfg["region"]
            url = f"https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
        headers = {"Ocp-Apim-Subscription-Key": cfg["api_key"], "Content-Type": content_type or "audio/wav"}
        params = {"language": lang}
        resp = await client.post(url, params=params, headers=headers, content=audio)
        data = resp.json() if resp.content else {}
        if resp.status_code >= 400:
            raise ASRError(
                f"Azure Speech request failed ({resp.status_code}). Check key/region/endpoint and audio format.",
                status_code=502,
                details={"provider": self.id, "cloud_provider": "azure_speech", "response": data},
            )
        transcript = (data.get("DisplayText") or data.get("NBest", [{}])[0].get("Display") or "").strip()
        if not transcript:
            raise ASRError("Azure Speech returned no transcript.", status_code=422, details={"provider": self.id, "response": data})
        confidence = None
        try:
            nbest = data.get("NBest") or []
            if nbest and nbest[0].get("Confidence") is not None:
                confidence = float(nbest[0]["Confidence"])
        except Exception:
            confidence = None
        return ASRResult(
            transcript=transcript,
            original_transcript=transcript,
            provider="cloud_http:azure_speech",
            language=lang,
            confidence=confidence,
            warnings=["Cloud transcription via configured Azure Speech; accent/noise robustness not guaranteed."],
            simulated=False,
            meta={"cloud_provider": "azure_speech"},
        )

    async def _sarvam(self, client: httpx.AsyncClient, cfg: dict[str, Any], audio: bytes, lang: str, content_type: str | None, filename: str | None) -> ASRResult:
        endpoint = cfg["endpoint"] or "https://api.sarvam.ai/speech-to-text"
        headers = {"api-subscription-key": cfg["api_key"]}
        files = {"file": (filename or "audio.wav", audio, content_type or "audio/wav")}
        data = {"language_code": lang.replace("_", "-")}
        resp = await client.post(endpoint, headers=headers, files=files, data=data)
        body = resp.json() if resp.content else {}
        if resp.status_code >= 400:
            raise ASRError(
                f"Sarvam request failed ({resp.status_code}). Check API key, endpoint, model/language params.",
                status_code=502,
                details={"provider": self.id, "cloud_provider": "sarvam", "response": body},
            )
        transcript = (body.get("transcript") or body.get("text") or "").strip()
        if not transcript:
            raise ASRError("Sarvam returned no transcript.", status_code=422, details={"provider": self.id, "response": body})
        return ASRResult(
            transcript=transcript,
            original_transcript=transcript,
            provider="cloud_http:sarvam",
            language=body.get("language_code") or lang,
            warnings=["Cloud transcription via configured Sarvam API; accent/noise robustness not guaranteed."],
            simulated=False,
            meta={"cloud_provider": "sarvam"},
        )

    async def _generic(self, client: httpx.AsyncClient, cfg: dict[str, Any], audio: bytes, lang: str, content_type: str | None, filename: str | None) -> ASRResult:
        endpoint = cfg["endpoint"]
        headers: dict[str, str] = {}
        if cfg["api_key"]:
            headers["Authorization"] = f"Bearer {cfg['api_key']}"
        files = {"file": (filename or "audio.wav", audio, content_type or "application/octet-stream")}
        form = {"language": lang}
        resp = await client.post(endpoint, headers=headers, files=files, data=form)
        # Try JSON, else plain text
        transcript = ""
        body: Any = None
        try:
            body = resp.json()
        except Exception:
            body = None
        if resp.status_code >= 400:
            raise ASRError(
                f"Generic cloud ASR request failed ({resp.status_code}). Check endpoint contract and credentials.",
                status_code=502,
                details={"provider": self.id, "cloud_provider": "generic", "response": body or resp.text[:500]},
            )
        if isinstance(body, dict):
            transcript = (body.get("transcript") or body.get("text") or body.get("result") or "").strip()
            segments = body.get("segments")
            confidence = body.get("confidence")
        else:
            transcript = (resp.text or "").strip()
            segments = None
            confidence = None
        if not transcript:
            raise ASRError("Generic cloud ASR endpoint returned no transcript.", status_code=422, details={"provider": self.id, "response": body})
        return ASRResult(
            transcript=transcript,
            original_transcript=transcript,
            provider="cloud_http:generic",
            language=lang,
            segments=segments if isinstance(segments, list) else None,
            confidence=float(confidence) if isinstance(confidence, (int, float)) else None,
            warnings=["Cloud transcription via configured generic HTTP endpoint; contract/accent/noise behavior not guaranteed."],
            simulated=False,
            meta={"cloud_provider": "generic", "endpoint": endpoint},
        )
