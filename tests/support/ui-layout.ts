import { expect, type Locator, type Page } from "@playwright/test";

const tabs = ["Dzisiaj", "Trening", "Mecz", "Postęp", "Więcej"];

export async function geometry(navigation: Locator) {
  return navigation.evaluate((nav) => {
    const box = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const style = getComputedStyle(nav);
    return {
      box: box(nav),
      paddingLeft: parseFloat(style.paddingLeft),
      paddingRight: parseFloat(style.paddingRight),
      items: [...nav.querySelectorAll("a")].map((link) => {
        const icon = link.querySelector("svg")!;
        const iconBox = link.querySelector(".bottom-nav-icon");
        const label = link.querySelector(".bottom-nav-label");
        const linkStyle = getComputedStyle(link);
        return {
          label: link.textContent!.trim(),
          box: box(link),
          icon: box(icon),
          iconBox: iconBox ? box(iconBox) : null,
          labelBox: label ? box(label) : null,
          viewBox: icon.getAttribute("viewBox"),
          strokeWidth: getComputedStyle(icon).strokeWidth,
          fontWeight: linkStyle.fontWeight,
        };
      }),
    };
  });
}

type Geometry = Awaited<ReturnType<typeof geometry>>;

function expectStableGeometry(actual: Geometry, initial: Geometry) {
  for (const coordinate of ["x", "y", "width", "height"] as const) {
    expect(actual.box[coordinate], `navigation ${coordinate}`).toBeCloseTo(
      initial.box[coordinate],
      2,
    );
  }
  actual.items.forEach((item, index) => {
    const original = initial.items[index];
    for (const part of ["box", "icon", "iconBox", "labelBox"] as const) {
      const currentBox = item[part];
      const originalBox = original[part];
      expect(!!currentBox, `${item.label}: ${part} exists`).toBe(!!originalBox);
      if (!currentBox || !originalBox) continue;
      for (const coordinate of ["x", "y", "width", "height"] as const) {
        expect(
          currentBox[coordinate],
          `${item.label}: ${part} ${coordinate}`,
        ).toBeCloseTo(originalBox[coordinate], 2);
      }
    }
    expect(item.fontWeight, `${item.label}: stable font weight`).toBe(
      original.fontWeight,
    );
  });
}

export function expectEqualBottomNavigation(measurements: Geometry) {
  // Five columns may differ by one browser layout unit (1/64 px).
  const first = measurements.items[0];
  expect(measurements.paddingLeft).toBe(measurements.paddingRight);
  const gaps: number[] = [];
  measurements.items.forEach((item, index) => {
    expect(item.box.width, `${item.label}: equal column width`).toBeCloseTo(
      first.box.width,
      1,
    );
    expect(item.box.height, `${item.label}: equal height`).toBeCloseTo(
      first.box.height,
      1,
    );
    expect(item.box.width).toBeGreaterThanOrEqual(44);
    expect(item.box.height).toBeGreaterThanOrEqual(44);
    expect(item.iconBox, `${item.label}: fixed icon wrapper`).not.toBeNull();
    expect(item.labelBox, `${item.label}: label wrapper`).not.toBeNull();
    for (const part of ["icon", "iconBox", "labelBox"] as const) {
      const element = item[part]!;
      const reference = first[part]!;
      expect(element.y, `${item.label}: ${part} baseline`).toBeCloseTo(
        reference.y,
        1,
      );
      if (part !== "labelBox") {
        expect(element.width, `${item.label}: ${part} width`).toBeCloseTo(
          reference.width,
          1,
        );
      }
      expect(element.height, `${item.label}: ${part} height`).toBeCloseTo(
        reference.height,
        1,
      );
      expect(element.x + element.width / 2).toBeCloseTo(
        item.box.x + item.box.width / 2,
        1,
      );
    }
    expect(item.viewBox).toBe("0 0 24 24");
    expect(item.strokeWidth).toBe(first.strokeWidth);
    if (index > 0) {
      const previous = measurements.items[index - 1].box;
      gaps.push(item.box.x - previous.x - previous.width);
    }
  });
  gaps.forEach((gap) => expect(gap).toBeCloseTo(gaps[0], 1));
  const last = measurements.items.at(-1)!.box;
  expect(first.box.x - measurements.box.x).toBeCloseTo(
    measurements.box.x + measurements.box.width - last.x - last.width,
    1,
  );
}

export async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  // Mobile Chromium can expand innerWidth when content overflows. Compare with
  // the requested viewport, so automatic expansion cannot hide overflow.
  const viewport = page.viewportSize()!.width;
  expect(sizes.document, "document fits viewport").toBeLessThanOrEqual(
    viewport,
  );
  expect(sizes.body, "body fits viewport").toBeLessThanOrEqual(viewport);
}

export async function checkNavigation(page: Page, mobile: boolean) {
  const navigation = page.locator(mobile ? ".bottom-nav" : ".sidebar nav");
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link")).toHaveCount(tabs.length);
  await expect(page.locator(mobile ? ".sidebar" : ".bottom-nav")).toBeHidden();
  const initial = await geometry(navigation);
  if (mobile) expectEqualBottomNavigation(initial);
  for (const tab of [...tabs.slice(1), tabs[0]]) {
    await navigation.getByRole("link", { name: tab, exact: true }).click();
    await expect(
      navigation.getByRole("link", { name: tab, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const current = await geometry(navigation);
    expectStableGeometry(current, initial);
    if (mobile) {
      expectEqualBottomNavigation(current);
      const padding = await page
        .locator("main")
        .evaluate((main) => parseFloat(getComputedStyle(main).paddingBottom));
      expect(padding, "content clears the fixed navigation").toBeGreaterThan(
        current.box.height,
      );
    }
  }
}
