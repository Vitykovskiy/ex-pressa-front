import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    primary: "#46250dff",
    secondary: "#FFB300",
    error: "#D32F2F",
    info: "#1976D2",
    success: "#388E3C",
    warning: "#FBC02D",
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
