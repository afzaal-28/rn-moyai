import React, { useEffect, useMemo, useRef } from 'react';
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
import { useMoyaiTheme } from '../providers/MoyaiProvider';

export type LinearProgressProps = {
  variant?: 'indeterminate' | 'determinate' | 'buffer' | 'query';
  value?: number;
  valueBuffer?: number;
  color?: ColorValue;
  trackColor?: ColorValue;
  bufferColor?: ColorValue;
  height?: number;
  borderRadius?: number;
  width?: number | '100%';
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function LinearProgress({
  variant = 'indeterminate',
  value,
  valueBuffer,
  color,
  trackColor,
  bufferColor,
  height = 6,
  borderRadius,
  width = '100%',
  style,
  testID,
  accessibilityLabel = 'Progress',
}: LinearProgressProps) {
  const theme = useMoyaiTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.track;
  const resolvedBufferColor = bufferColor ?? theme.colors.buffer;

  const primaryTranslate = useRef(new Animated.Value(0)).current;
  const secondaryTranslate = useRef(new Animated.Value(0)).current;
  const measuredWidth = useRef(0);

  const normalized = useMemo(() => {
    if (value == null) return null;
    return clamp01(value);
  }, [value]);

  const normalizedBuffer = useMemo(() => {
    if (valueBuffer == null) return null;
    return clamp01(valueBuffer);
  }, [valueBuffer]);

  const snappedHeight = Math.max(1, Math.round(height));
  const radius = Math.max(
    0,
    Math.round(borderRadius ?? snappedHeight / 2),
  );

  const onLayout = (e: LayoutChangeEvent) => {
    measuredWidth.current = e.nativeEvent.layout.width;
  };

  useEffect(() => {
    const isIndeterminate = variant === 'indeterminate' || variant === 'query';
    if (!isIndeterminate) return;

    primaryTranslate.setValue(0);
    secondaryTranslate.setValue(0);

    const primary = Animated.loop(
      Animated.timing(primaryTranslate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    const secondary = Animated.loop(
      Animated.timing(secondaryTranslate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    primary.start();
    secondary.start();

    return () => {
      primary.stop();
      secondary.stop();
    };
  }, [primaryTranslate, secondaryTranslate, variant]);

  const now = useMemo(() => {
    if (variant === 'determinate') return normalized;
    if (variant === 'buffer') return normalized;
    return null;
  }, [normalized, variant]);

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={
        now == null
          ? undefined
          : { min: 0, max: 1, now: Math.round(now * 100) }
      }
      style={[
        styles.track,
        {
          height: snappedHeight,
          width,
          borderRadius: radius,
          backgroundColor: resolvedTrackColor,
        },
        style,
      ]}
      onLayout={width === '100%' ? onLayout : undefined}
    >
      {variant === 'determinate' ? (
        <View
          style={[
            styles.bar,
            {
              width: `${(normalized ?? 0) * 100}%`,
              backgroundColor: resolvedColor,
              borderRadius: radius,
            },
          ]}
        />
      ) : variant === 'buffer' ? (
        <>
          <View
            style={[
              styles.bufferBar,
              {
                width: `${(normalizedBuffer ?? 0) * 100}%`,
                backgroundColor: resolvedBufferColor,
                borderRadius: radius,
              },
            ]}
          />
          <View
            style={[
              styles.bar,
              {
                width: `${(normalized ?? 0) * 100}%`,
                backgroundColor: resolvedColor,
                borderRadius: radius,
              },
            ]}
          />
        </>
      ) : (
        <>
          <Animated.View
            style={[
              styles.indeterminateBar,
              {
                backgroundColor: resolvedColor,
                borderRadius: radius,
                width:
                  typeof width === 'number'
                    ? width * 0.35
                    : Math.max(24, measuredWidth.current * 0.35),
                transform: [
                  {
                    translateX: primaryTranslate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        typeof width === 'number'
                          ? -width
                          : -Math.max(1, measuredWidth.current),
                        typeof width === 'number'
                          ? width * 2
                          : Math.max(1, measuredWidth.current) * 2,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.indeterminateBar,
              {
                backgroundColor: resolvedColor,
                borderRadius: radius,
                opacity: 0.35,
                width:
                  typeof width === 'number'
                    ? width * 0.2
                    : Math.max(18, measuredWidth.current * 0.2),
                transform: [
                  {
                    translateX: secondaryTranslate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        typeof width === 'number'
                          ? -width * 0.6
                          : -Math.max(1, measuredWidth.current) * 0.6,
                        typeof width === 'number'
                          ? width * 1.6
                          : Math.max(1, measuredWidth.current) * 1.6,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
  bufferBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  indeterminateBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
