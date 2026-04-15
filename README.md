# Animex

## Executive Summary

Animex is a mobile application which turns zoo visits and wildlife encounters into short, interactive learning experiences by combining camera-based animal identification, conversational voice or text interaction, and an immersive habitat overlay.

The app is built as a client-centric mobile experience using Ionic, Vue, and Capacitor, with no dedicated backend. External AI services are consumed directly from the client, while device capabilities such as camera, microphone, and speech are accessed through the mobile runtime. The project is intended to be optimized for noisy, outdoor environments where interactions must be clear, fast, and engaging.

## Development

### Prerequisites

- Node.js
- npm
- Ionic CLI
- Android Studio for Android builds
- Xcode for iOS builds on macOS

Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

### Install dependencies

```bash
npm install
```

### Run in the browser

```bash
ionic serve
```

### Run on a device with Capacitor live reload

Android:

```bash
npx cap run android
```

iOS:

```bash
npx cap run ios
```

If native dependencies or web assets change, sync the project first:

```bash
npx cap sync
```

## Build, Serve, and Deploy

### Production web build

```bash
vite build
```

This generates the optimized web bundle for the app.

### Sync web assets to native projects

```bash
npx cap sync
```

### Android build

Build the native Android project with Gradle after syncing assets. The output is an APK that can be sideloaded onto a device.

### iOS build

Open the synced iOS project in Xcode and build the app for a simulator or physical device. The output can be packaged as an IPA for sideloading.

### Browser fallback / PWA serving

The web build can be served as a Progressive Web App for presentation or browser-based demo fallback. Static hosting such as GitHub Pages can be used for this deployment target.

### CI / delivery flow

The intended delivery flow is:

1. Lint and type-check the codebase
2. Run unit and integration tests
3. Build the production web bundle
4. Sync assets into Capacitor native projects
5. Produce Android and iOS demo builds
6. Optionally publish the web build for browser-based fallback