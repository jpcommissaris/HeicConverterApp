module.exports = {
  useDropzone: () => ({
    getRootProps: () => ({ "data-testid": "dropzone" }),
    getInputProps: () => ({ type: "file", "data-testid": "file-input" }),
    isDragActive: false,
    isDragReject: false,
  }),
};
