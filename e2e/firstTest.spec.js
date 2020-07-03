describe("Example", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should show main screen", async () => {
    await expect(element(by.id("root"))).toBeVisible();
  });
});
