"""Telugu/English token normalisation with exact character span tracking.

No text is ever rewritten in-place: every token keeps its exact ``[start, end)``
offsets into the original transcript so downstream extractions can be verified
as verbatim substrings.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

# Telugu cardinal words, including the common "people" forms (ముగ్గురు etc.).
NUMBER_WORDS: dict[str, int] = {
    "ఒకటి": 1,
    "ఒక": 1,
    "ఒకరు": 1,
    "రెండు": 2,
    "ఇద్దరు": 2,
    "మూడు": 3,
    "ముగ్గురు": 3,
    "నాలుగు": 4,
    "నలుగురు": 4,
    "ఐదు": 5,
    "ఐదుగురు": 5,
    "ఆరు": 6,
    "ఆరుగురు": 6,
    "ఏడు": 7,
    "ఏడుగురు": 7,
    "ఎనిమిది": 8,
    "తొమ్మిది": 9,
    "పది": 10,
    "ఇరవై": 20,
    "ముప్పై": 30,
    "నలభై": 40,
    "యాభై": 50,
    "అరవై": 60,
    "డెబ్బయి": 70,
    "ఎనభై": 80,
    "తొంభై": 90,
    "వంద": 100,
}

_PUNCT = ".,!?;:।，。()[]{}\"'“”‘’#"


@dataclass(frozen=True)
class Token:
    raw: str  # exact substring from the transcript
    text: str  # lowercased, punctuation-stripped (for matching)
    start: int
    end: int


@dataclass(frozen=True)
class NumberChunk:
    value: int
    start: int
    end: int
    first_index: int
    last_index: int


def normalise_whitespace(text: str) -> str:
    """Collapse runs of whitespace to a single space and strip the edges."""
    return re.sub(r"\s+", " ", text).strip()


def normalise_transcript(text: str) -> list[Token]:
    """Tokenise ``text`` while preserving exact ``[start, end)`` offsets."""
    tokens: list[Token] = []
    for match in re.finditer(r"\S+", text):
        raw = match.group(0)
        cleaned = raw.strip(_PUNCT).lower()
        tokens.append(Token(raw=raw, text=cleaned, start=match.start(), end=match.end()))
    return tokens


def number_chunks(tokens: list[Token]) -> list[NumberChunk]:
    """Find numeric values, combining adjacent Telugu number words.

    ``ఇరవై నాలుగు`` becomes one chunk with value 24 spanning both tokens;
    ASCII digits and English tokens are left as-is (English number words are
    deliberately not translated).
    """
    chunks: list[NumberChunk] = []
    i = 0
    while i < len(tokens):
        word = tokens[i].text
        if word.isdigit():
            chunks.append(NumberChunk(int(word), tokens[i].start, tokens[i].end, i, i))
            i += 1
            continue
        if word in NUMBER_WORDS:
            total = NUMBER_WORDS[word]
            j = i + 1
            while j < len(tokens) and tokens[j].text in NUMBER_WORDS:
                total += NUMBER_WORDS[tokens[j].text]
                j += 1
            chunks.append(
                NumberChunk(total, tokens[i].start, tokens[j - 1].end, i, j - 1)
            )
            i = j
            continue
        i += 1
    return chunks


def normalise_number_words(text: str) -> str:
    """Replace Telugu number words with ASCII digits (display utility only).

    Longer/composite sequences are collapsed first so ``ఇరవై నాలుగు`` becomes
    ``24`` rather than ``20 4``.  English tokens are preserved unchanged.
    """
    tokens = normalise_transcript(text)
    chunks = number_chunks(tokens)
    chunk_at = {c.first_index: c for c in chunks}
    covered: set[int] = set()
    for chunk in chunks:
        covered.update(range(chunk.first_index, chunk.last_index + 1))

    result: list[str] = []
    for idx, token in enumerate(tokens):
        if idx in chunk_at:
            result.append(str(chunk_at[idx].value))
        elif idx not in covered:
            result.append(token.raw)
    return normalise_whitespace(" ".join(result))
