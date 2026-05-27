import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizeRichText } from "@/lib/rate-limit";

describe("sanitizeHtml", () => {
  it("escapes HTML tags", () => {
    expect(sanitizeHtml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
  });

  it("removes javascript: protocol", () => {
    expect(sanitizeHtml("javascript:alert(1)")).toBe("alert(1)");
  });

  it("removes event handlers", () => {
    expect(sanitizeHtml("onclick=alert(1)")).toBe("alert(1)");
  });

  it("keeps normal text", () => {
    expect(sanitizeHtml("Hello World")).toBe("Hello World");
  });
});

describe("sanitizeRichText", () => {
  it("removes script tags", () => {
    expect(sanitizeRichText("<p>Hello</p><script>alert('xss')</script>")).toBe("<p>Hello</p>");
  });

  it("removes event handlers from HTML", () => {
    expect(sanitizeRichText('<p onclick="alert(1)">Hello</p>')).toBe("<p>Hello</p>");
  });

  it("removes iframes", () => {
    expect(sanitizeRichText('<iframe src="https://evil.com"></iframe><p>Hello</p>')).toBe("<p>Hello</p>");
  });

  it("keeps safe HTML", () => {
    const input = "<p><strong>Bold</strong> and <em>italic</em></p>";
    expect(sanitizeRichText(input)).toBe(input);
  });
});
