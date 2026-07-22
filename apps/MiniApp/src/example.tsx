import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * This component is exposed as a Module Federation remote and is bundled +
 * uploaded to Zephyr Cloud via `react-native bundle-mf-remote`.
 * The HostApp loads it over-the-air from Zephyr at runtime.
 */
export default function Example() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from Mini App 👋</Text>
      <Text style={styles.subtitle}>
        Served over-the-air by Zephyr Cloud via Module Federation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B9D4FF',
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B4FA0',
  },
  subtitle: {
    fontSize: 13,
    color: '#33557A',
  },
});
