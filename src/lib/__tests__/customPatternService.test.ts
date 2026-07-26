import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FabricPattern } from '../fabricPatterns';
import { CustomPatternService } from '../customPatternService';

const STORAGE_KEY = 'FABRIC_CUSTOM_PATTERNS';
const getItemMock = vi.mocked(localStorage.getItem);
const setItemMock = vi.mocked(localStorage.setItem);

function createPattern(
  id: string,
  overrides: Partial<FabricPattern> = {}
): FabricPattern {
  return {
    id,
    title: `Pattern ${id}`,
    description: `Description for ${id}`,
    systemPrompt: `System prompt for ${id}`,
    userPromptTemplate: `User prompt for ${id}`,
    type: 'custom',
    ...overrides,
  };
}

describe('CustomPatternService', () => {
  beforeEach(() => {
    getItemMock.mockReset();
    setItemMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPatterns', () => {
    it('returns an empty list when storage has no custom patterns', () => {
      getItemMock.mockReturnValue(null);

      expect(CustomPatternService.getPatterns()).toEqual([]);
      expect(getItemMock).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('returns parsed patterns from storage', () => {
      const patterns = [createPattern('one'), createPattern('two')];
      getItemMock.mockReturnValue(JSON.stringify(patterns));

      expect(CustomPatternService.getPatterns()).toEqual(patterns);
    });

    it('logs and returns an empty list for malformed stored JSON', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getItemMock.mockReturnValue('{not valid JSON');

      expect(CustomPatternService.getPatterns()).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to load custom patterns',
        expect.any(SyntaxError)
      );
    });

    it('logs and returns an empty list when storage cannot be read', () => {
      const storageError = new Error('storage unavailable');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getItemMock.mockImplementation(() => {
        throw storageError;
      });

      expect(CustomPatternService.getPatterns()).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to load custom patterns',
        storageError
      );
    });
  });

  describe('savePattern', () => {
    it('appends a pattern when its ID is not already stored', () => {
      const existingPattern = createPattern('existing');
      const newPattern = createPattern('new');
      getItemMock.mockReturnValue(JSON.stringify([existingPattern]));

      CustomPatternService.savePattern(newPattern);

      expect(setItemMock).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([existingPattern, newPattern])
      );
    });

    it('replaces an existing pattern with the same ID', () => {
      const original = createPattern('same');
      const replacement = createPattern('same', { title: 'Updated title' });
      const untouched = createPattern('untouched');
      getItemMock.mockReturnValue(JSON.stringify([original, untouched]));

      CustomPatternService.savePattern(replacement);

      expect(setItemMock).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([replacement, untouched])
      );
    });
  });

  describe('deletePattern', () => {
    it('removes the matching pattern and preserves the others', () => {
      const removed = createPattern('remove');
      const kept = createPattern('keep');
      getItemMock.mockReturnValue(JSON.stringify([removed, kept]));

      CustomPatternService.deletePattern('remove');

      expect(setItemMock).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([kept])
      );
    });

    it('persists the unchanged list when the ID does not exist', () => {
      const patterns = [createPattern('one'), createPattern('two')];
      getItemMock.mockReturnValue(JSON.stringify(patterns));

      CustomPatternService.deletePattern('missing');

      expect(setItemMock).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(patterns)
      );
    });
  });
});
