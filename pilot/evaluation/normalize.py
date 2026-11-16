"""Text normalisation helpers for ASR evaluation.

Design goals:
- Stdlib-only, deterministic, and explicitly documented.
- Conservative: do not invent linguistic transforms; apply reversible/basic cleanup.
- Used by WER/CER, number recognition checks, and field extraction scoring.

Normalisation policy (v1):
1. Unicode NFC.
2. Trim and collapse whitespace.
3. Optional lowercasing for Latin script tokens only (Telugu has no case).
4. Strip configurable punctuation classes at token edges for word-level scoring,
   while CER can opt to keep punctuation if needed.
5. Normalise common digit forms (ASCII digits kept). Indic/other digit mapping can
   be added later; fixtures should state expected forms.

This module never fabricates reference or hypothesis content.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

PUNCT_EDGE_RE = re.compile(r"^[^\w\u0C00-\u0C7F]+|[^\w\u0C00-\u0C7F]+$", re.UNICODE)
MULTISPACE_RE = re.compile(r"\s+")
ASCII_DIGITS = str.maketrans("౦౧౨౩౪౫౬౭౮౯", "0123456789")  # Telugu -> ASCII for numeric comparison


@dataclass(frozen=True)
class NormConfig:
    lowercase_latin: bool = True
    strip_edge_punctuation: bool = True
    normalize_telugu_digits: bool = True
    keep_whitespace_tokens: bool = False


def normalize_text(text: str, cfg: NormConfig | None = None) -> str:
    cfg = cfg or NormConfig()
    if text is None:
        return ""
    s = unicodedata.normalize("NFC", str(text)).strip()
    if cfg.normalize_telugu_digits:
        s = s.translate(ASCII_DIGITS)
    if cfg.lowercase_latin:
        s = "".join(ch.lower() if "LATIN" in unicodedata.name(ch, "") else ch for ch in s)
    tokens = MULTISPACE_RE.split(s)
    out = []
    for tok in tokens:
        if not tok:
            continue
        if cfg.strip_edge_punctuation:
            tok = PUNCT_EDGE_RE.sub("", tok)
        if tok or cfg.keep_whitespace_tokens:
            out.append(tok)
    return " ".join(out)


def tokenize_words(text: str, cfg: NormConfig | None = None) -> list[str]:
    n = normalize_text(text, cfg)
    return n.split() if n else []


def tokenize_chars(text: str, cfg: NormConfig | None = None, include_spaces: bool = False) -> list[str]:
    cfg = cfg or NormConfig(strip_edge_punctuation=False)
    n = normalize_text(text, cfg)
    if not include_spaces:
        n = n.replace(" ", "")
    return list(n)


def normalize_number_token(value: str) -> str:
    """Normalise a number-bearing string for recognition comparison.

    Extracts/normalizes ASCII digits and decimal point/minus; maps Telugu digits.
    Returns empty string if no numeric content is found.
    """
    if value is None:
        return ""
    s = unicodedata.normalize("NFC", str(value)).translate(ASCII_DIGITS)
    # Keep sign, digits, decimal separators; treat common separators as decimal point.
    s = s.replace(",", "")
    m = re.findall(r"-?\d+(?:[./]\d+)?", s)
    if not m:
        return ""
    # Use first numeric token for simple comparison; callers can override for lists.
    tok = m[0].replace("/", ".")
    # normalize leading zeros except decimals <1? keep simple canonical form
    try:
        if "." in tok:
            num = float(tok)
            # avoid long float repr; strip trailing zeros
            return ("%f" % num).rstrip("0").rstrip(".") or "0"
        return str(int(tok))
    except Exception:
        return tok
