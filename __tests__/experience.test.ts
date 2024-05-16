import { getFortyTwoLevels } from '@/lib/forty-two-experience';

jest.mock('@vercel/blob', () => ({
  list: jest.fn(() => Promise.resolve({ blobs: [{ url: 'url' }] })),
}));

describe('FortyTwo Experience', () => {
  beforeEach(() => {
    const rawLevels = {
      levels: [
        { level: 1, experience: 100 },
        { level: 2, experience: 200 },
      ]
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(rawLevels),
      } as Response)
    );
  });

  it('should load experience correctly', async () => {
    const expectedLevels = {
      1: { level: 1, experience: 100 },
      2: { level: 2, experience: 200 },
    };

    const levels = await getFortyTwoLevels();
    expect(levels).toEqual(expectedLevels);
  });
});
