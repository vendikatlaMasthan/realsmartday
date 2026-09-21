// Unified Icon Font Injector for SmartDay on Web & Native
// Ensures Ionicons TTF is loaded synchronously with zero network/CORS failure

import { Platform } from 'react-native';
import { IONICONS_FONT_BASE64 } from './ioniconsBase64';

export function injectIconFonts(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const STYLE_ID = 'smartday-ionicons-font';
  const EXPO_ID = 'expo-generated-fonts';

  const fontFaceCss = `
@font-face {
  font-family: "ionicons";
  src: url("${IONICONS_FONT_BASE64}") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Ionicons";
  src: url("${IONICONS_FONT_BASE64}") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;

  // 1. Inject into expo-generated-fonts so expo-font's isLoaded() returns true synchronously
  let expoStyle = document.getElementById(EXPO_ID) as HTMLStyleElement | null;
  if (!expoStyle) {
    expoStyle = document.createElement('style');
    expoStyle.id = EXPO_ID;
    document.head.appendChild(expoStyle);
  }
  if (!expoStyle.textContent?.includes('ionicons')) {
    expoStyle.appendChild(document.createTextNode(fontFaceCss));
  }

  // 2. Inject dedicated stylesheet
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(fontFaceCss));
    document.head.appendChild(style);
  }

  // 3. Register with modern FontFace API if available
  if (typeof (window as any).FontFace !== 'undefined' && document.fonts) {
    try {
      const fontLower = new (window as any).FontFace('ionicons', `url("${IONICONS_FONT_BASE64}")`, {
        weight: 'normal',
        style: 'normal',
      });
      fontLower.load().then((loaded: any) => {
        document.fonts.add(loaded);
      }).catch(() => {});

      const fontUpper = new (window as any).FontFace('Ionicons', `url("${IONICONS_FONT_BASE64}")`, {
        weight: 'normal',
        style: 'normal',
      });
      fontUpper.load().then((loaded: any) => {
        document.fonts.add(loaded);
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }
}

// Immediately attempt injection on module load for web
injectIconFonts();
