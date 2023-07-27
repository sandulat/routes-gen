import { route } from "./route";

it("supports optional params (issue 31)", () => {
  expect(route("/reports/:type?/:id/", { id: "123" })).toEqual("/reports/123/");

  expect(route("/reports/:type?/:id/", { id: "123", type: "annual" })).toEqual(
    "/reports/annual/123/"
  );

  expect(route("/reports/:id/:type?/", { id: "123" })).toEqual("/reports/123/");

  expect(route("/reports/:id/:type?/", { id: "123", type: "annual" })).toEqual(
    "/reports/123/annual/"
  );
});

it("only replaces the first occurrence when param names share the same prefix", () => {
  expect(
    route("/podcasts/:topic/:topicId", { topic: "sports", topicId: "123" })
  ).toEqual("/podcasts/sports/123");

  expect(
    route("/podcasts/:topicId/:topic", { topic: "sports", topicId: "123" })
  ).toEqual("/podcasts/123/sports");
});
