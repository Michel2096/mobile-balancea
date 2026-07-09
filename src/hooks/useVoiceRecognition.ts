import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  ExpoWebSpeechRecognition,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const IS_WEB = Platform.OS === 'web';

export type VoiceRecognitionError =
  | 'permission_denied'
  | 'not_supported'
  | 'start_failed'
  | string;

export function useVoiceRecognition(lang: 'es-MX' | 'en-US' = 'es-MX') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<VoiceRecognitionError | null>(null);
  const webRecognitionRef = useRef<InstanceType<typeof ExpoWebSpeechRecognition> | null>(null);

  // Los listeners nativos son estables por instalación (Platform.OS no cambia en runtime),
  // por lo que registrarlos condicionados a IS_WEB no rompe las reglas de hooks.
  if (!IS_WEB) {
    useSpeechRecognitionEvent('start', () => {
      setIsListening(true);
      setError(null);
    });
    useSpeechRecognitionEvent('end', () => setIsListening(false));
    useSpeechRecognitionEvent('result', (event) => {
      const text = event.results?.[0]?.transcript ?? '';
      setTranscript(text);
    });
    useSpeechRecognitionEvent('error', (event) => {
      setError(event.error ?? 'start_failed');
      setIsListening(false);
    });
  }

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    if (IS_WEB) {
      try {
        const recognition = new ExpoWebSpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const text = event.results?.[0]?.[0]?.transcript ?? '';
          setTranscript(text);
        };
        recognition.onerror = (event: any) => {
          setError(event.error ?? 'start_failed');
          setIsListening(false);
        };
        webRecognitionRef.current = recognition;
        recognition.start();
      } catch {
        setError('not_supported');
      }
      return;
    }

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('permission_denied');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: false,
      });
    } catch {
      setError('not_supported');
    }
  }, [lang]);

  const stop = useCallback(() => {
    if (IS_WEB) {
      webRecognitionRef.current?.stop();
      return;
    }
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Módulo nativo no disponible (p. ej. Expo Go sin dev client): no hay nada que detener.
    }
  }, []);

  return { isListening, transcript, error, start, stop };
}
