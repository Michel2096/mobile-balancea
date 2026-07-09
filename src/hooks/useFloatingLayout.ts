import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';

// expo-router no expone la altura real de la barra de pestañas nativa (NativeTabs),
// así que se reserva un margen fijo aproximado cuando la ruta activa vive dentro
// del grupo (tabs) para que los botones flotantes no queden tapados por ella.
const TAB_BAR_CLEARANCE = Platform.select({ ios: 58, android: 64, default: 0 }) ?? 0;

export function useFloatingLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { width } = useWindowDimensions();

  const inTabs = segments[0] === '(tabs)';

  return useMemo(
    () => ({
      bottom: insets.bottom + 20 + (inTabs ? TAB_BAR_CLEARANCE : 0),
      width,
    }),
    [insets.bottom, inTabs, width]
  );
}
