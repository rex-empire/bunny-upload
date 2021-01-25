var constraints = {
  key: {
    presence: true,
    type: "string"
  },
  localDir: {
    presence: true,
    type: "string"
  },
  cdnDir: {
    presence: true,
    type: "string"
  },
  concurrency: {
    type: "integer",
  },
  overwrite: {
    type: "boolean",
  },
  storageZoneName: {
    type: "string",
  }
}

export default constraints;
