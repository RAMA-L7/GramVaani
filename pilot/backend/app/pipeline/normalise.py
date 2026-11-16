"""Token normalisation and grounding helpers with exact character spans."""
from __future__ import annotations

import re
from dataclasses import dataclass

NUMBER_WORDS: dict[str, int] = {
    "ఒక": 1, "ఒకటి": 1, "ఒక్క": 1,
    "రెండు": 2, "ఇద్దరు": 2,
    "మూడు": 3, "ముగ్గురు": 3,
    "నాలుగు": 4, "నలుగురు": 4,
    "ఐదు": 5, "ఐదుగురు": 5,
    "ఆరు": 6, "ఆరుగురు": 6,
    "ఏడు": 7, "ఏడుగురు": 7,
    "ఎనిమిది": 8,
    "తొమ్మిది": 9,
    "పది": 10,
    "ఇరవై": 20,
    "ముప్పై": 30,
    "నలభై": 40,
    "యాభై": 50,
    "అరవై": 60,
    "డెబ్బై": 70,
    "ఎనభై": 80,
    "తొంభై": 90,
    "వంద": 100,
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}

_PUNCT = ".,!?;:()[]{}\"'“”‘’|-_/\\\n\t"


@dataclass(frozen=True)
class Token:
    raw: str
    text: str
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
    return re.sub(r"\s+", " ", text or "").strip()


def normalise_transcript(text: str) -> list[Token]:
    tokens: list[Token] = []
    for match in re.finditer(r"\S+", text or ""):
        raw = match.group(0)
        cleaned = raw.strip(_PUNCT).lower()
        tokens.append(Token(raw=raw, text=cleaned, start=match.start(), end=match.end()))
    return tokens


def number_chunks(tokens: list[Token]) -> list[NumberChunk]:
    chunks: list[NumberChunk] = []
    i = 0
    while i < len(tokens):
        word = tokens[i].text
        if word.lstrip("-").isdigit():
            try:
                chunks.append(NumberChunk(int(word), tokens[i].start, tokens[i].end, i, i))
            except ValueError:
                pass
            i += 1
            continue
        if word in NUMBER_WORDS:
            total = NUMBER_WORDS[word]
            j = i + 1
            while j < len(tokens) and tokens[j].text in NUMBER_WORDS and not tokens[j].text.lstrip("-").isdigit():
                total += NUMBER_WORDS[tokens[j].text]
                j += 1
            chunks.append(NumberChunk(total, tokens[i].start, tokens[j - 1].end, i, j - 1))
            i = j
            continue
        i += 1
    return chunks


def normalise_number_words(text: str) -> str:
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
