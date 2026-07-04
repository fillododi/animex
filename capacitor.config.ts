import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';
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
      resize: KeyboardResize.Body, 
      resizeOnFullScreen: true,
    },
  }
};

export default config;
