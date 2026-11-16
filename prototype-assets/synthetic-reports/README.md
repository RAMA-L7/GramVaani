# Synthetic reports and transcripts

**All content here is invented by the team.** No real worker, child, family, or centre is represented. Any
resemblance to a real centre is accidental.

Use these for:

- golden fixtures for extraction tests (`tests/`);
- prompt development without touching any real data;
- UI mocks and demo recordings.

## Naming

`example-<nnn>-<short-name>.md` for transcripts, `example-<nnn>.expected.json` for the expected extraction.

## Content rules

- Names, if any, are clearly fictional and used only as *speech samples* ("W1", "Lakshmi garu" is fine, a real
  person's details are not).
- Counts stay within plausible bounds and are marked as invented.
- No Aadhaar-like numbers, no phone numbers, no addresses, no school names.
- Include the messy parts: false starts, repetitions, English loanwords, spoken numerals, background noise in
  descriptions. Clean samples make bad tests.
