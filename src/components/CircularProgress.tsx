import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type ColorValue,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useMoyaiTheme } from '../providers/MoyaiProvider';

export type CircularProgressProps = {
  variant?: 'indeterminate' | 'determinate';
  value?: number;
  size?: number;
  color?: ColorValue;
  trackColor?: ColorValue;
  thickness?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CircularProgress({
  variant = 'indeterminate',
  value = 0,
  size = 24,
  color,
  trackColor,
  thickness,
  durationMs = 900,
  style,
  testID,
  accessibilityLabel = 'Loading',
}: CircularProgressProps) {
  const theme = useMoyaiTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.track;

  const rotation = useRef(new Animated.Value(0)).current;

  const snappedSize = Math.max(1, Math.round(size));
  const strokeWidth = Math.max(
    1,
    Math.round(thickness ?? Math.max(2, Math.round(snappedSize / 10))),
  );
  const radius = (snappedSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = clamp(value, 0, 100);
  const dashOffset = circumference * (1 - normalizedValue / 100);

  useEffect(() => {
    if (variant !== 'indeterminate') return;

    rotation.setValue(0);

    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [durationMs, rotation, variant]);

  const animatedStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    }),
    [rotation],
  );

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={variant === 'determinate' ? { min: 0, max: 100, now: Math.round(normalizedValue) } : undefined}
      style={[styles.container, { width: snappedSize, height: snappedSize }, style]}
    >
      {variant === 'determinate' ? (
        <Svg width={snappedSize} height={snappedSize}>
          <Circle
            cx={snappedSize / 2}
            cy={snappedSize / 2}
            r={radius}
            stroke={resolvedTrackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={snappedSize / 2}
            cy={snappedSize / 2}
            r={radius}
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${snappedSize / 2} ${snappedSize / 2})`}
          />
        </Svg>
      ) : (
        <Animated.View style={[styles.indeterminateContainer, animatedStyle]}>
          <Svg width={snappedSize} height={snappedSize}>
            <Circle
              cx={snappedSize / 2}
              cy={snappedSize / 2}
              r={radius}
              stroke={resolvedTrackColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={snappedSize / 2}
              cy={snappedSize / 2}
              r={radius}
              stroke={resolvedColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.25} ${circumference}`}
              transform={`rotate(-90 ${snappedSize / 2} ${snappedSize / 2})`}
            />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indeterminateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
