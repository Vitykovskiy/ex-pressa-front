import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#46250dff",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light,
    },
  },
});
