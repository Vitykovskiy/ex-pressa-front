import vuetify from "./vuetify";

import type { App } from "vue";
import type { Router } from "vue-router";

export function registerPlugins(app: App, router: Router) {
  app.use(vuetify).use(router);
}
