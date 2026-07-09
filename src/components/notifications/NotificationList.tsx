import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notificacion } from '@/services/api';
import { NotificationItem } from './NotificationItem';

type Props = {
  notificaciones: Notificacion[];
  isDark: boolean;
  onItemPress: (notificacion: Notificacion) => void;
  onDelete: (notificacion: Notificacion) => void;
  hasAnyNotifications: boolean;
  emptyAllTitle: string;
  emptyAllDesc: string;
  emptyFilteredTitle: string;
  emptyFilteredDesc: string;
  clearFiltersLabel: string;
  onClearFilters: () => void;
  canLoadMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  loadMoreLabel: string;
};

export function NotificationList({
  notificaciones,
  isDark,
  onItemPress,
  onDelete,
  hasAnyNotifications,
  emptyAllTitle,
  emptyAllDesc,
  emptyFilteredTitle,
  emptyFilteredDesc,
  clearFiltersLabel,
  onClearFilters,
  canLoadMore,
  loadingMore,
  onLoadMore,
  loadMoreLabel,
}: Props) {
  if (notificaciones.length === 0) {
    const filtered = hasAnyNotifications;
    return (
      <View style={[styles.emptyCard, isDark && darkStyles.card]}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name={filtered ? 'search-outline' : 'notifications-outline'} size={32} color="#4EC920" />
        </View>
        <Text style={[styles.emptyTitle, isDark && darkStyles.title]}>
          {filtered ? emptyFilteredTitle : emptyAllTitle}
        </Text>
        <Text style={styles.emptyDesc}>{filtered ? emptyFilteredDesc : emptyAllDesc}</Text>
        {filtered && (
          <Pressable style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]} onPress={onClearFilters}>
            <Text style={styles.clearBtnText}>{clearFiltersLabel}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.list}>
        {notificaciones.map((n) => (
          <NotificationItem
            key={n.id}
            notificacion={n}
            isDark={isDark}
            onPress={onItemPress}
            onDelete={onDelete}
          />
        ))}
      </View>

      {canLoadMore && (
        <Pressable
          style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.pressed]}
          onPress={onLoadMore}
          disabled={loadingMore}>
          {loadingMore ? (
            <ActivityIndicator color="#2E7D32" />
          ) : (
            <Text style={styles.loadMoreText}>{loadMoreLabel}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  list: {
    gap: 10,
  },
  pressed: {
    opacity: 0.8,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 44,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1FAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#1a2e1a',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDesc: {
    color: '#888',
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 260,
  },
  clearBtn: {
    marginTop: 16,
    backgroundColor: '#f0f9e8',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  clearBtnText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },

  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9e8',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  loadMoreText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    color: '#f2f2f2',
  },
});
