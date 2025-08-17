import { vi } from 'vitest';

vi.mock('obsidian', async () => {
  return await import('./__mocks__/obsidian');
});
