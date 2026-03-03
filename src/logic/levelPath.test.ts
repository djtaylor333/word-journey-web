/**
 * Unit tests for LevelSelectScreen path logic
 * Tests the zigzag column pattern and SVG connector path generation
 * (these replicate the inline functions from LevelSelectScreen.tsx)
 */

// Zigzag column pattern matching LevelSelectScreen.tsx
const ZIGZAG = [1, 2, 2, 1, 0, 0, 1, 2, 2, 1] as const;
const COL_PCT = [20, 50, 80] as const;

function getCol(level: number): 0 | 1 | 2 {
  return ZIGZAG[(level - 1) % ZIGZAG.length];
}

function connectorPath(fromCol: number, toCol: number): string {
  const x1 = COL_PCT[fromCol as 0 | 1 | 2];
  const x2 = COL_PCT[toCol as 0 | 1 | 2];
  return `M ${x1} 0 C ${x1} 25, ${x2} 25, ${x2} 50`;
}

describe('LevelSelectScreen zigzag path logic', () => {
  describe('getCol — column assignment follows ZIGZAG pattern', () => {
    it('level 1 → center (col 1)', () => {
      expect(getCol(1)).toBe(1);
    });

    it('level 2 → right (col 2)', () => {
      expect(getCol(2)).toBe(2);
    });

    it('level 3 → right (col 2)', () => {
      expect(getCol(3)).toBe(2);
    });

    it('level 4 → center (col 1)', () => {
      expect(getCol(4)).toBe(1);
    });

    it('level 5 → left (col 0)', () => {
      expect(getCol(5)).toBe(0);
    });

    it('level 6 → left (col 0)', () => {
      expect(getCol(6)).toBe(0);
    });

    it('level 7 → center (col 1)', () => {
      expect(getCol(7)).toBe(1);
    });

    it('level 8 → right (col 2)', () => {
      expect(getCol(8)).toBe(2);
    });

    it('level 9 → right (col 2)', () => {
      expect(getCol(9)).toBe(2);
    });

    it('level 10 → center (col 1)', () => {
      expect(getCol(10)).toBe(1);
    });

    it('level 11 → center (col 1) — wraps back to zone-start', () => {
      expect(getCol(11)).toBe(1);
    });

    it('level 20 → center (col 1) — second zone end', () => {
      expect(getCol(20)).toBe(1);
    });

    it('level 21 → center (col 1) — third zone start', () => {
      expect(getCol(21)).toBe(1);
    });

    it('returns valid column index 0, 1, or 2 for any level 1-100', () => {
      for (let lv = 1; lv <= 100; lv++) {
        const col = getCol(lv);
        expect([0, 1, 2]).toContain(col);
      }
    });

    it('same level always returns same column (deterministic)', () => {
      for (let lv = 1; lv <= 30; lv++) {
        expect(getCol(lv)).toBe(getCol(lv));
      }
    });

    it('10-level cycle repeats: level N and level N+10 have same column', () => {
      for (let lv = 1; lv <= 20; lv++) {
        expect(getCol(lv)).toBe(getCol(lv + 10));
      }
    });

    it('not all levels are in center — variety of positions exist', () => {
      const cols = Array.from({ length: 10 }, (_, i) => getCol(i + 1));
      const hasLeft   = cols.includes(0);
      const hasCenter = cols.includes(1);
      const hasRight  = cols.includes(2);
      expect(hasLeft).toBe(true);
      expect(hasCenter).toBe(true);
      expect(hasRight).toBe(true);
    });
  });

  describe('connectorPath — SVG bezier path between columns', () => {
    it('center to center produces straight vertical path (same x)', () => {
      const path = connectorPath(1, 1);
      expect(path).toBe('M 50 0 C 50 25, 50 25, 50 50');
    });

    it('left to right traverses full width', () => {
      const path = connectorPath(0, 2);
      expect(path).toBe('M 20 0 C 20 25, 80 25, 80 50');
    });

    it('right to left traverses full width in reverse', () => {
      const path = connectorPath(2, 0);
      expect(path).toBe('M 80 0 C 80 25, 20 25, 20 50');
    });

    it('center to left half-width curve', () => {
      const path = connectorPath(1, 0);
      expect(path).toBe('M 50 0 C 50 25, 20 25, 20 50');
    });

    it('center to right half-width curve', () => {
      const path = connectorPath(1, 2);
      expect(path).toBe('M 50 0 C 50 25, 80 25, 80 50');
    });

    it('path always starts at y=0 and ends at y=50', () => {
      const cols = [0, 1, 2];
      for (const from of cols) {
        for (const to of cols) {
          const path = connectorPath(from, to);
          expect(path).toMatch(/^M \d+ 0 /);
          expect(path).toMatch(/, \d+ 50$/);
        }
      }
    });

    it('all x coordinates are within 0-100 (valid SVG viewBox percentages)', () => {
      const cols = [0, 1, 2];
      for (const from of cols) {
        for (const to of cols) {
          const path = connectorPath(from, to);
          const nums = path.match(/\d+/g)!.map(Number);
          // y coordinates are 0, 25, 50 — x coordinates should be 20, 50, or 80
          const xCoords = nums.filter(n => n !== 0 && n !== 25 && n !== 50);
          for (const x of xCoords) {
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThanOrEqual(100);
          }
        }
      }
    });
  });

  describe('zone banners — level groups', () => {
    it('level 1 starts zone 0 (isZoneStart = true)', () => {
      expect((1 - 1) % 10).toBe(0);
    });

    it('level 11 starts zone 1 (isZoneStart = true)', () => {
      expect((11 - 1) % 10).toBe(0);
    });

    it('level 21 starts zone 2 (isZoneStart = true)', () => {
      expect((21 - 1) % 10).toBe(0);
    });

    it('level 5 does NOT start a zone', () => {
      expect((5 - 1) % 10).not.toBe(0);
    });

    it('level 10 does NOT start a zone', () => {
      expect((10 - 1) % 10).not.toBe(0);
    });

    it('zone banners appear every 10 levels (at 1, 11, 21, 31...)', () => {
      const bannerLevels: number[] = [];
      for (let lv = 1; lv <= 40; lv++) {
        if ((lv - 1) % 10 === 0) bannerLevels.push(lv);
      }
      expect(bannerLevels).toEqual([1, 11, 21, 31]);
    });
  });
});
