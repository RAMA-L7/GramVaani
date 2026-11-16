"""WER/CER computation using edit distance (Levenshtein), stdlib-only.

WER = (S + D + I) / N_words_ref, where N_words_ref > 0.
CER = (S + D + I) / N_chars_ref, where N_chars_ref > 0.

Edge cases:
- Empty reference and empty hypothesis => 0.0 error, exact match.
- Empty reference and non-empty hypothesis => 1.0 (100%) by convention here,
  reported with ref_length=0 to avoid hiding the case.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from normalize import NormConfig, tokenize_chars, tokenize_words


@dataclass(frozen=True)
class EditStats:
    substitutions: int
    deletions: int
    insertions: int
    ref_length: int

    @property
    def distance(self) -> int:
        return self.substitutions + self.deletions + self.insertions

    @property
    def rate(self) -> float:
        if self.ref_length == 0:
            return 0.0 if self.distance == 0 else 1.0
        return self.distance / self.ref_length


def levenshtein_stats(ref: Sequence[str], hyp: Sequence[str]) -> EditStats:
    n, m = len(ref), len(hyp)
    # dp[i][j] = (cost, S, D, I)
    dp = [[(0, 0, 0, 0) for _ in range(m + 1)] for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0] = (i, 0, i, 0)
    for j in range(1, m + 1):
        dp[0][j] = (j, 0, 0, j)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref[i - 1] == hyp[j - 1]:
                c, s, d, ins = dp[i - 1][j - 1]
                dp[i][j] = (c, s, d, ins)
                continue
            sub = dp[i - 1][j - 1]
            dele = dp[i - 1][j]
            insr = dp[i][j - 1]
            sub_c = (sub[0] + 1, sub[1] + 1, sub[2], sub[3])
            del_c = (dele[0] + 1, dele[1], dele[2] + 1, dele[3])
            ins_c = (insr[0] + 1, insr[1], insr[2], insr[3] + 1)
            dp[i][j] = min(sub_c, del_c, ins_c, key=lambda x: (x[0], x[1], x[2], x[3]))
    cost, s, d, ins = dp[n][m]
    return EditStats(substitutions=s, deletions=d, insertions=ins, ref_length=n)


def wer(reference: str, hypothesis: str, cfg: NormConfig | None = None) -> dict:
    ref_t = tokenize_words(reference, cfg)
    hyp_t = tokenize_words(hypothesis, cfg)
    stats = levenshtein_stats(ref_t, hyp_t)
    return {
        "metric": "WER",
        "wer": stats.rate,
        "distance": stats.distance,
        "substitutions": stats.substitutions,
        "deletions": stats.deletions,
        "insertions": stats.insertions,
        "ref_words": stats.ref_length,
        "hyp_words": len(hyp_t),
        "ref_normalized": " ".join(ref_t),
        "hyp_normalized": " ".join(hyp_t),
    }


def cer(reference: str, hypothesis: str, cfg: NormConfig | None = None, include_spaces: bool = False) -> dict:
    # For CER, keep edge punctuation only if explicitly desired; default strips via normalize.
    char_cfg = cfg or NormConfig(strip_edge_punctuation=False)
    ref_c = tokenize_chars(reference, char_cfg, include_spaces=include_spaces)
    hyp_c = tokenize_chars(hypothesis, char_cfg, include_spaces=include_spaces)
    stats = levenshtein_stats(ref_c, hyp_c)
    return {
        "metric": "CER",
        "cer": stats.rate,
        "distance": stats.distance,
        "substitutions": stats.substitutions,
        "deletions": stats.deletions,
        "insertions": stats.insertions,
        "ref_chars": stats.ref_length,
        "hyp_chars": len(hyp_c),
    }
