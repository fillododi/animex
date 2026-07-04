import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'animex',
  webDir: 'dist',
  server: {
    androidScheme: "http",
    iosScheme: "http"
  },
  plugins: {
    Keyboard: {
      resize: 'none', 
      //resizeOnFullScreen: true,
    },
  }
};

export default config;
