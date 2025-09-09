const React = require("react");

const mockIcon = (name) =>
  React.forwardRef((props, ref) => {
    return React.createElement("svg", {
      ref,
      "data-testid": `${name}-icon`,
      "aria-hidden": "true",
      ...props,
    });
  });

module.exports = {
  AlertCircle: mockIcon("AlertCircle"),
  CheckCircle: mockIcon("CheckCircle"),
  Clock: mockIcon("Clock"),
  Download: mockIcon("Download"),
  FileImage: mockIcon("FileImage"),
  Upload: mockIcon("Upload"),
  X: mockIcon("X"),
};
