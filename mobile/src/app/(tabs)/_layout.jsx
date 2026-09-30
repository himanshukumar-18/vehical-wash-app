import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, User } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius, Shadows } from '@/theme';
import AppText from '@/components/ui/AppText';

/**
 * Tab definitions for The Black Wash
 */
const TABS_CONFIG = [
  {
    name: 'index',
    label: 'Home',
    icon: Home,
  },
  {
    name: 'me',
    label: 'Profile',
    icon: User,
  },
];

function DockItem({ config, isFocused, onPress, onLongPress }) {
  const IconComponent = config.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1 : 0.95, { damping: 14, stiffness: 300 }) }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[
        styles.dockItem,
        isFocused && styles.dockItemActive,
      ]}
    >
      <Animated.View style={[styles.dockItemInner, animatedStyle]}>
        <View style={[styles.iconCircle, isFocused && styles.iconCircleActive]}>
          <IconComponent
            size={18}
            color={isFocused ? Colors.cyanBlue : Colors.textMuted}
            strokeWidth={isFocused ? 2.4 : 1.8}
          />
        </View>
        {isFocused && (
          <AppText
            variant="caption"
            weight="bold"
            color={Colors.cyanBlue}
            style={styles.dockLabel}
          >
            {config.label}
          </AppText>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function FloatingDockTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 16;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.dockWrapper, { bottom: bottomOffset }]}
    >
      <View style={styles.dockContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TABS_CONFIG.find((t) => t.name === route.name) || {
            name: route.name,
            label: route.name,
            icon: Home,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <DockItem
              key={route.key}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingDockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.primaryBlack },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dockBg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.dockBorder,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    ...Shadows.lg,
  },
  dockItem: {
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dockItemActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
  },
  dockItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.18)',
  },
  dockLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginRight: 4,
  },
});
