const React = require("react");

const mockComponent = (displayName) =>
  React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement("div", { ref, "data-testid": displayName, ...props }, children);
  });

module.exports = {
  Root: mockComponent("Root"),
  Trigger: mockComponent("Trigger"),
  Content: mockComponent("Content"),
  Item: mockComponent("Item"),
  Value: mockComponent("Value"),
  Viewport: mockComponent("Viewport"),
  Thumb: mockComponent("Thumb"),
  Track: mockComponent("Track"),
  Range: mockComponent("Range"),
};
