var constraints = {
  key: {
    presence: true,
    type: "string"
  },
  apiKey: {
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
  },
  storageZoneUrl: {
    type: "string",
  },
  purgeUrl: {
    type: "string",
  }
}

export default constraints;
