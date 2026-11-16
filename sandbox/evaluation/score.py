#!/usr/bin/env python3
"""Compute WER and CER from reference/hypothesis JSONL files.

Standard library only. This is an evaluation tool, NOT part of the sandbox
application. It has not been run on any ASR output: the sandbox uses scripted
transcripts and has no consented audio corpus yet.

Usage:
    uv run python score.py reference.jsonl hypothesis.jsonl

Each JSONL line must be an object with "id" and "text" keys.
"""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass
class Counts:
    substitutions: int = 0
    deletions: int = 0
    insertions: int = 0
    reference_length: int = 0

    @property
    def errors(self) -> int:
        return self.substitutions + self.deletions + self.insertions

    @property
    def rate(self) -> float:
        return self.errors / self.reference_length if self.reference_length else 0.0


def edit_counts(reference: list[str], hypothesis: list[str]) -> Counts:
    """Levenshtein alignment with substitution/deletion/insertion classification."""
    n, m = len(reference), len(hypothesis)
    # dp[i][j] = (cost, s, d, i)
    dp: list[list[tuple[int, int, int, int]]] = [
        [(0, 0, 0, 0) for _ in range(m + 1)] for _ in range(n + 1)
    ]
    for i in range(1, n + 1):
        dp[i][0] = (i, 0, i, 0)
    for j in range(1, m + 1):
        dp[0][j] = (j, 0, 0, j)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if reference[i - 1] == hypothesis[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
                continue
            options = [
                (dp[i - 1][j - 1][0] + 1, dp[i - 1][j - 1][1] + 1,
                 dp[i - 1][j - 1][2], dp[i - 1][j - 1][3]),
                (dp[i - 1][j][0] + 1, dp[i - 1][j][1],
                 dp[i - 1][j][2] + 1, dp[i - 1][j][3]),
                (dp[i][j - 1][0] + 1, dp[i][j - 1][1],
                 dp[i][j - 1][2], dp[i][j - 1][3] + 1),
            ]
            dp[i][j] = min(options, key=lambda x: x[0])
    _, s, d, ins = dp[n][m]
    return Counts(s, d, ins, n)


def load(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    with path.open(encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, 1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
                out[str(item["id"])] = str(item["text"])
            except (json.JSONDecodeError, KeyError) as exc:
                raise SystemExit(f"{path}:{line_no}: invalid record: {exc}") from exc
    return out


def aggregate(items: Iterable[Counts]) -> Counts:
    total = Counts()
    for c in items:
        total.substitutions += c.substitutions
        total.deletions += c.deletions
        total.insertions += c.insertions
        total.reference_length += c.reference_length
    return total


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    reference = load(Path(sys.argv[1]))
    hypothesis = load(Path(sys.argv[2]))
    ids = sorted(set(reference) & set(hypothesis))
    if not ids:
        print("No matching ids found; check the two files.", file=sys.stderr)
        return 1
    missing = set(reference) ^ set(hypothesis)
    if missing:
        print(f"Unmatched ids (ignored): {', '.join(sorted(missing))}", file=sys.stderr)

    print(f"{'id':<28} {'WER':>8} {'CER':>8} {'S':>5} {'D':>5} {'I':>5} {'N':>6}")
    wer_items, cer_items = [], []
    for clip_id in ids:
        ref, hyp = reference[clip_id], hypothesis[clip_id]
        wer = edit_counts(ref.split(), hyp.split())
        cer = edit_counts(list(ref), list(hyp))
        wer_items.append(wer)
        cer_items.append(cer)
        print(f"{clip_id:<28} {wer.rate:>8.3f} {cer.rate:>8.3f} "
              f"{wer.substitutions:>5} {wer.deletions:>5} {wer.insertions:>5} "
              f"{wer.reference_length:>6}")
    wer, cer = aggregate(wer_items), aggregate(cer_items)
    print("-" * 66)
    print(f"{'TOTAL (' + str(len(ids)) + ' clips)':<28} {wer.rate:>8.3f} {cer.rate:>8.3f} "
          f"{wer.substitutions:>5} {wer.deletions:>5} {wer.insertions:>5} "
          f"{wer.reference_length:>6}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
