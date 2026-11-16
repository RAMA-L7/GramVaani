import { describe, expect, it } from 'vitest';
import { buildHighlightedSegments, coerceByType, coerceLike, getSpanText, normalizeSpan, stringifyValue } from './utils';

describe('utils coercion', () => {
  it('stringifyValue handles arrays, booleans and nulls', () => {
    expect(stringifyValue(null)).toBe('');
    expect(stringifyValue(['a', 'b'])).toBe('a, b');
    expect(stringifyValue(true)).toBe('true');
    expect(stringifyValue(12)).toBe('12');
  });

  it('coerceLike preserves sample types', () => {
    expect(coerceLike('42', 1)).toBe(42);
    expect(coerceLike('true', false)).toBe(true);
    expect(coerceLike('a, b, c', ['x'])).toEqual(['a', 'b', 'c']);
    expect(coerceLike('hello', 'x')).toBe('hello');
  });

  it('coerceByType coerces common clarification types', () => {
    expect(coerceByType('7', 'integer')).toBe(7);
    expect(coerceByType('అవును', 'boolean')).toBe(true);
    expect(coerceByType('no', 'boolean')).toBe(false);
    expect(coerceByType('x, y', 'enum_list')).toEqual(['x', 'y']);
  });
});

describe('utils span highlighting', () => {
  const text = 'నేడు 24 మంది పిల్లలు హాజరయ్యారు';

  it('normalizes and extracts span text', () => {
    expect(normalizeSpan([5, 7], text.length)).toEqual([5, 7]);
    expect(getSpanText(text, [5, 7])).toBe(text.slice(5, 7));
    expect(normalizeSpan([7, 5], text.length)).toEqual([5, 7]);
    expect(normalizeSpan(null, text.length)).toBeNull();
  });

  it('builds highlighted segments for spans', () => {
    const segs = buildHighlightedSegments('abcdefgh', [
      { field_id: 'a', value: 'bc', raw_text: 'bc', source_span: [1, 3] },
      { field_id: 'b', value: 'fg', raw_text: 'fg', source_span: [5, 7] },
    ] as any);
    expect(segs.map(s => s.text).join('')).toBe('abcdefgh');
    expect(segs.some(s => s.highlight && s.text === 'bc')).toBe(true);
    expect(segs.some(s => s.highlight && s.text === 'fg')).toBe(true);
  });
});
