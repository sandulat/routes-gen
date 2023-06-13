import { route } from "./route";

it("only replaces the first occurrence", () => {
  expect(
    route("/podcasts/:topic/:topicId", { topic: "sports", topicId: "123" })
  ).toEqual("/podcasts/sports/123");
});
