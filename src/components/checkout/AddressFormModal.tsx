import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddDireccionPayload } from '@/services/api';
import { ADDRESS_TYPE_OPTIONS } from './AddressCard';

type Props = {
  visible: boolean;
  saving: boolean;
  isDark: boolean;
  t: (key: string) => string;
  onClose: () => void;
  onSave: (values: AddDireccionPayload) => void;
};

export function AddressFormModal({ visible, saving, isDark, t, onClose, onSave }: Props) {
  const [calle, setCalle] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [tipoDireccion, setTipoDireccion] = useState('casa');
  const [referencias, setReferencias] = useState('');

  useEffect(() => {
    if (!visible) {
      setCalle('');
      setNumeroExterior('');
      setNumeroInterior('');
      setColonia('');
      setCiudad('');
      setEstado('');
      setCodigoPostal('');
      setTipoDireccion('casa');
      setReferencias('');
    }
  }, [visible]);

  function handleSave() {
    if (!calle.trim() || !numeroExterior.trim() || !colonia.trim() || !ciudad.trim() || !estado.trim() || !codigoPostal.trim()) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    onSave({
      calle: calle.trim(),
      numero_exterior: numeroExterior.trim(),
      numero_interior: numeroInterior.trim() || undefined,
      colonia: colonia.trim(),
      ciudad: ciudad.trim(),
      estado: estado.trim(),
      codigo_postal: codigoPostal.trim(),
      referencias: referencias.trim() || undefined,
      tipo: tipoDireccion,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrap}>
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.header}>
              <Text style={[styles.title, isDark && darkStyles.title]}>{t('nuevaDireccionTitle')}</Text>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={isDark ? '#f2f2f2' : '#555'} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('profileStreet')} *</Text>
                <TextInput
                  style={[styles.input, isDark && darkStyles.input]}
                  value={calle}
                  onChangeText={setCalle}
                  placeholder={t('campoCallePlaceholder')}
                  placeholderTextColor="#b0c8a0"
                />
              </View>

              <View style={styles.fieldRow}>
                <View style={[styles.fieldGroup, styles.fieldFlex]}>
                  <Text style={styles.label}>{t('profileExtNumber')} *</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={numeroExterior}
                    onChangeText={setNumeroExterior}
                    placeholder="123"
                    placeholderTextColor="#b0c8a0"
                  />
                </View>
                <View style={[styles.fieldGroup, styles.fieldFlex]}>
                  <Text style={styles.label}>{t('profileIntNumber')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={numeroInterior}
                    onChangeText={setNumeroInterior}
                    placeholder="A"
                    placeholderTextColor="#b0c8a0"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('profileNeighborhood')} *</Text>
                <TextInput
                  style={[styles.input, isDark && darkStyles.input]}
                  value={colonia}
                  onChangeText={setColonia}
                  placeholder={t('campoColoniaPlaceholder')}
                  placeholderTextColor="#b0c8a0"
                />
              </View>

              <View style={styles.fieldRow}>
                <View style={[styles.fieldGroup, styles.fieldFlex]}>
                  <Text style={styles.label}>{t('profileCity')} *</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={ciudad}
                    onChangeText={setCiudad}
                    placeholder={t('campoCiudadPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                  />
                </View>
                <View style={[styles.fieldGroup, styles.fieldFlex]}>
                  <Text style={styles.label}>{t('profileState')} *</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={estado}
                    onChangeText={setEstado}
                    placeholder={t('campoEstadoPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('profileZip')} *</Text>
                <TextInput
                  style={[styles.input, isDark && darkStyles.input]}
                  value={codigoPostal}
                  onChangeText={setCodigoPostal}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="12345"
                  placeholderTextColor="#b0c8a0"
                />
                <Text style={styles.helperText}>{t('campoCPHelper')}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('tipoDireccionLabel')}</Text>
                <View style={styles.chipsRow}>
                  {ADDRESS_TYPE_OPTIONS.map((opt) => {
                    const active = tipoDireccion === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setTipoDireccion(opt.value)}>
                        <Ionicons
                          name={opt.icon}
                          size={13}
                          color={active ? '#ffffff' : '#666'}
                          style={styles.chipIcon}
                        />
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(opt.labelKey)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('referenciasOpcional')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && darkStyles.input]}
                  value={referencias}
                  onChangeText={setReferencias}
                  placeholder={t('referenciasPlaceholder')}
                  placeholderTextColor="#b0c8a0"
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                onPress={onClose}>
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveBtn, (pressed || saving) && styles.pressed]}
                disabled={saving}
                onPress={handleSave}>
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('guardarDireccionBtn')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '88%',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#1a2e1a',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 4,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldFlex: {
    flex: 1,
  },
  label: {
    color: '#4EC920',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f7f9f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  helperText: {
    color: '#999',
    fontSize: 11,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  chipIcon: {
    marginTop: -1,
  },
  chipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  chipText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    color: '#f2f2f2',
  },
  input: {
    backgroundColor: '#262626',
    borderColor: '#3a4a33',
    color: '#f2f2f2',
  },
});
