import {StandardIndicator, Endpoint} from '@qiwi/health-indicator';

export default class Health {
  constructor(components) {
    this.indicator = new StandardIndicator()
    this.endpoint = new Endpoint(this.indicator)
    this.configure(components);
  }

  configure(components) {
    this.indicator.deps = components;

    return this;
  }

  handler(req, res) {
    this.endpoint.middleware(req, res)
  }
}
