import { parseCursus, parseProjects } from "@/lib/forty-two/forty-two-user";
import type { FortyTwoProfile, ProjectUser } from "next-auth/providers/42-school";

function attempt(overrides: Partial<ProjectUser> = {}): ProjectUser {
  return { id: 1, occurrence: 0, final_mark: 100, status: "finished", "validated?": true,
    current_team_id: 1, project: { id: 1337, name: "ft_transcendence", slug: "ft_transcendence", parent_id: null },
    cursus_ids: [1,21], marked_at: "2026-01-01T00:00:00Z", marked: true, retriable_at: null,
    created_at: "2025-01-01T00:00:00Z", updated_at: null, ...overrides };
}
it("keeps completion dates and finds 42cursus anywhere in cursus_ids", () => {
  expect(parseProjects([attempt()])[1337]).toMatchObject({ is_validated: true, markedAt: Date.UTC(2026,0,1) });
});
it("never loses a validation because a failed repeat appears later", () => {
  const good=attempt(), bad=attempt({ "validated?": false, final_mark: 0, marked_at:"2026-02-01T00:00:00Z" });
  expect(parseProjects([good,bad])[1337].is_validated).toBe(true);
  expect(parseProjects([bad,good])[1337].is_validated).toBe(true);
});
it("counts pedagogical events across all pages, excluding extern and association", async () => {
  jest.useFakeTimers();
  const original = global.fetch;
  global.fetch = jest.fn().mockResolvedValueOnce({ok:true,json:async()=>Array.from({length:100},(_,i)=>({kind:i%2?'extern':'association'}))})
    .mockResolvedValueOnce({ok:true,json:async()=>Array.from({length:15},()=>({kind:'event'}))});
  const profile = { id: 1, projects_users: [], cursus_users: [{ cursus_id:21,level:21,cursus:{name:'42cursus',slug:'42cursus'} }] } as unknown as FortyTwoProfile;
  try {
    const result = parseCursus(profile,'synthetic-token');
    await jest.runAllTimersAsync();
    expect((await result)?.events).toBe(15);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  } finally { global.fetch=original; jest.useRealTimers(); }
});
