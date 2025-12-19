import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type ColorValue,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMoyaiTheme } from '../providers/MoyaiProvider';

export type LiquidProgressProps = {
  variant?: 'indeterminate' | 'determinate';
  value?: number;
  width?: number;
  height?: number;
  trackColor?: ColorValue;
  gradientColors?: readonly string[];
  borderRadius?: number;
  inset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function LiquidProgress({
  variant = 'indeterminate',
  value = 0,
  width = 180,
  height = 32,
  trackColor,
  gradientColors,
  borderRadius,
  inset = 2,
  style,
  testID,
  accessibilityLabel = 'Loading',
}: LiquidProgressProps) {
  const theme = useMoyaiTheme();
  const resolvedTrackColor = trackColor ?? theme.colors.track;
  const resolvedGradientColors =
    gradientColors ??
    ([
      String(theme.colors.primary),
      String(theme.colors.buffer),
      String(theme.colors.primary),
    ] as const);

  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  const snappedWidth = Math.max(1, Math.round(width));
  const snappedHeight = Math.max(1, Math.round(height));
  const snappedInset = Math.max(0, Math.round(inset));

  const fillAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const contentWidth = useMemo(() => {
    const base = measuredWidth ?? snappedWidth;
    return Math.max(0, base - snappedInset * 2);
  }, [measuredWidth, snappedInset, snappedWidth]);

  const contentHeight = Math.max(0, snappedHeight - snappedInset * 2);
  const radius = Math.max(0, Math.round(borderRadius ?? snappedHeight / 2));
  const fillRadius = Math.max(0, radius - snappedInset);

  useEffect(() => {
    if (variant === 'determinate') {
      Animated.timing(fillAnim, {
        toValue: clamp01(value),
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      return;
    }

    fillAnim.setValue(0);
    const fillLoop = Animated.loop(
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    );

    shimmerAnim.setValue(0);
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    fillLoop.start();
    shimmerLoop.start();

    return () => {
      fillLoop.stop();
      shimmerLoop.stop();
    };
  }, [fillAnim, shimmerAnim, value, variant]);

  const onLayout = (e: LayoutChangeEvent) => {
    setMeasuredWidth(e.nativeEvent.layout.width);
  };

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(0, snappedInset * 2), contentWidth],
  });

  const shimmerStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-contentWidth, contentWidth],
          }),
        },
      ],
    }),
    [contentWidth, shimmerAnim],
  );

  return (
    <View style={[styles.root, style]} testID={testID} onLayout={onLayout}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={
          variant === 'determinate'
            ? { min: 0, max: 100, now: Math.round(clamp01(value) * 100) }
            : undefined
        }
        style={[
          styles.track,
          {
            width: snappedWidth,
            height: snappedHeight,
            borderRadius: radius,
            backgroundColor: resolvedTrackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fillContainer,
            {
              left: snappedInset,
              top: snappedInset,
              height: contentHeight,
              borderRadius: fillRadius,
              width: fillWidth,
            },
          ]}
        >
          <LinearGradient
            colors={[...resolvedGradientColors]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.gradient, { borderRadius: fillRadius }]}
          />

          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0)',
                'rgba(255,255,255,0.25)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.gradient, { borderRadius: fillRadius }]}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 5,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  track: {
    overflow: 'hidden',
  },
  fillContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});
