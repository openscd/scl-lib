import { expect } from "vitest";
import { updatedConfRev } from "./updateConfRev.js";

describe("updatedConfRev", () => {
  const rptControl = new DOMParser()
    .parseFromString(`<ReportControl confRev="1"/> `, "application/xml")
    .querySelector("ReportControl");

  const gseControl = new DOMParser()
    .parseFromString(`<GSEControl /> `, "application/xml")
    .querySelector("GSEControl");

  it("increments missing confRev", () =>
    expect(updatedConfRev(gseControl!)).equals("1"));

  it("increments existing confRev", () =>
    expect(updatedConfRev(rptControl!)).equals("10001"));
});
