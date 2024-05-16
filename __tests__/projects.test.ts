import { getFortyTwoProjects } from '@/lib/forty-two-projects';

jest.mock('@vercel/blob', () => ({
  list: jest.fn(() => Promise.resolve({ blobs: [{ url: 'url' }] })),
}));

describe('FortyTwo Experience', () => {
  beforeEach(() => {
    const rawProjects = {
      projects: [
        { id: 1, name: 'Test Project 1', experience: 100 },
        { id: 2, name: 'Test Project 2', experience: 200 },
      ]
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(rawProjects),
      } as Response)
    );
  });

  it('should load projects correctly', async () => {
    const expectedProjects = {
      1: { id: 1, name: 'Test Project 1', experience: 100 },
      2: { id: 2, name: 'Test Project 2', experience: 200 },
    };

    const projects = await getFortyTwoProjects();
    expect(projects).toEqual(expectedProjects);
  });


});
