/** The request never reached the API: offline, DNS, or the API's CORS turning this origin away. */
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super("Network request failed", options);
    this.name = "NetworkError";
  }
}
