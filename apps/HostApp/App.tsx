/**
 * HostApp — Module Federation host.
 *
 * It lazily loads the `./example` component exposed by MiniApp. In local dev
 * the remote is served from MiniApp's Metro server (localhost:8082); in
 * production Zephyr Cloud resolves it to the deployed remote over-the-air.
 *
 * @format
 */
import React, { Suspense } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

const RemoteExample = React.lazy(() => import('MiniApp/example'));

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <Text style={styles.heading}>Host App</Text>
        <Text style={styles.caption}>
          React Native · Metro · Zephyr Cloud · Module Federation
        </Text>

        <View style={styles.remoteSlot}>
          <Suspense
            fallback={
              <View style={styles.loading}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading remote…</Text>
              </View>
            }>
            <RemoteExample />
          </Suspense>
        </View>

        <Text style={styles.footer}>
          ↑ The card above is a federated remote loaded at runtime.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  heading: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  caption: { fontSize: 13, color: '#8FA3BF', marginBottom: 12 },
  remoteSlot: { minHeight: 96, justifyContent: 'center' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#8FA3BF' },
  footer: { fontSize: 12, color: '#5C7093', marginTop: 12 },
});

export default App;
