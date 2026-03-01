import { registerPlugins } from "@/plugins";
import { createApp } from "vue";
import "unfonts.css";

async function bootstrap(): Promise<void> {
  const appTarget = String(import.meta.env.VITE_APP_TARGET ?? "customer")
    .trim()
    .toLowerCase();

  if (appTarget === "admin") {
    const [{ default: App }, { default: router }] = await Promise.all([
      import("@/admin/App.vue"),
      import("@/admin/router"),
    ]);
    const app = createApp(App);
    registerPlugins(app, router);
    app.mount("#app");
    return;
  }

  if (appTarget === "barista") {
    const [{ default: App }, { default: router }] = await Promise.all([
      import("@/barista/App.vue"),
      import("@/barista/router"),
    ]);
    const app = createApp(App);
    registerPlugins(app, router);
    app.mount("#app");
    return;
  }

  const [{ default: App }, { default: router }] = await Promise.all([
    import("./App.vue"),
    import("./router"),
  ]);
  const app = createApp(App);
  registerPlugins(app, router);
  app.mount("#app");
}

void bootstrap();
