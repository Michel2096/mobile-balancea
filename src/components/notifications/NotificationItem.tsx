import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notificacion } from '@/services/api';

const TIPO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  nuevo_pedido: 'cart-outline',
  pedido_confirmado: 'checkmark-circle-outline',
  pedido_en_preparacion: 'construct-outline',
  pedido_enviado: 'send-outline',
  pedido_entregado: 'checkmark-done-outline',
  cambio_estado: 'cube-outline',
  pedido_cancelado: 'close-circle-outline',
  suplemento_no_disponible: 'warning-outline',
  mensaje: 'chatbubble-outline',
};

// Cuando el backend agrupa los cambios de estado bajo un tipo genérico
// (p. ej. "cambio_estado") y envía el estado real en metadata.estado.
const ESTADO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pendiente: 'time-outline',
  confirmada: 'checkmark-circle-outline',
  pagada: 'card-outline',
  en_preparacion: 'construct-outline',
  enviada: 'send-outline',
  entregada: 'checkmark-done-outline',
  cancelada: 'close-circle-outline',
  reembolsada: 'return-up-back-outline',
};

function resolveIcon(notificacion: Notificacion): keyof typeof Ionicons.glyphMap {
  const estado = notificacion.metadata?.estado;
  if (typeof estado === 'string' && ESTADO_ICONS[estado]) return ESTADO_ICONS[estado];
  return TIPO_ICONS[notificacion.tipo] ?? 'notifications-outline';
}

type Props = {
  notificacion: Notificacion;
  isDark: boolean;
  onPress: (notificacion: Notificacion) => void;
  onDelete: (notificacion: Notificacion) => void;
};

export function NotificationItem({ notificacion, isDark, onPress, onDelete }: Props) {
  const iconName = resolveIcon(notificacion);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isDark && darkStyles.row,
        !notificacion.leida && styles.rowUnread,
        !notificacion.leida && isDark && darkStyles.rowUnread,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(notificacion)}>
      <View style={styles.iconBadge}>
        <Ionicons name={iconName} size={19} color="#2E7D32" />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && darkStyles.title]} numberOfLines={1}>
            {notificacion.titulo}
          </Text>
          {!notificacion.leida && <View style={styles.unreadDot} />}
        </View>
        <Text style={[styles.message, isDark && darkStyles.message]} numberOfLines={2}>
          {notificacion.mensaje}
        </Text>
        {(notificacion.orden_id != null || !!notificacion.hace_cuanto) && (
          <View style={styles.metaRow}>
            {notificacion.orden_id != null && (
              <Text style={[styles.orderTag, isDark && darkStyles.orderTag]}>
                #{notificacion.orden_id}
              </Text>
            )}
            {!!notificacion.hace_cuanto && <Text style={styles.time}>{notificacion.hace_cuanto}</Text>}
          </View>
        )}
      </View>

      <Pressable onPress={() => onDelete(notificacion)} hitSlop={8} style={styles.deleteBtn}>
        <Ionicons name="close" size={16} color="#c9c9c9" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  rowUnread: {
    backgroundColor: '#f7fbf3',
    borderColor: '#d4edbc',
  },
  pressed: {
    opacity: 0.8,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4EC920',
  },
  message: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: '#aaa',
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  orderTag: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const darkStyles = StyleSheet.create({
  row: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  rowUnread: {
    backgroundColor: '#1c2a19',
    borderColor: '#2f4a26',
  },
  title: {
    color: '#f2f2f2',
  },
  message: {
    color: '#aaa',
  },
  orderTag: {
    color: '#8fcb6c',
    backgroundColor: '#1c2a19',
  },
});
