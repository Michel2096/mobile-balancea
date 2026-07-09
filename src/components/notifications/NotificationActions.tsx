import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  isDark: boolean;
  hasUnread: boolean;
  hasRead: boolean;
  markingAll: boolean;
  deletingRead: boolean;
  onMarkAllRead: () => void;
  onDeleteRead: () => void;
  markAllReadLabel: string;
  deleteReadLabel: string;
};

export function NotificationActions({
  isDark,
  hasUnread,
  hasRead,
  markingAll,
  deletingRead,
  onMarkAllRead,
  onDeleteRead,
  markAllReadLabel,
  deleteReadLabel,
}: Props) {
  if (!hasUnread && !hasRead) return null;

  return (
    <View style={styles.row}>
      {hasUnread && (
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
          onPress={onMarkAllRead}
          disabled={markingAll}>
          {markingAll ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.btnPrimaryText}>{markAllReadLabel}</Text>
          )}
        </Pressable>
      )}

      {hasRead && (
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnGhost, isDark && darkStyles.btnGhost, pressed && styles.pressed]}
          onPress={onDeleteRead}
          disabled={deletingRead}>
          {deletingRead ? (
            <ActivityIndicator color="#e05050" size="small" />
          ) : (
            <Text style={styles.btnGhostText}>{deleteReadLabel}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  btn: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  btnPrimary: {
    backgroundColor: '#2E7D32',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  btnGhost: {
    backgroundColor: '#fdecec',
    borderWidth: 1,
    borderColor: '#f5c6c6',
  },
  btnGhostText: {
    color: '#e05050',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

const darkStyles = StyleSheet.create({
  btnGhost: {
    backgroundColor: '#2a1c1c',
    borderColor: '#4a2a2a',
  },
});
