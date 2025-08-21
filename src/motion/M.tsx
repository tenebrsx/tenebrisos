import React, { forwardRef } from 'react';

// Platform detection
const isWeb = typeof window !== 'undefined';
const isNative = !isWeb;

// Type definitions
interface BaseMotionProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
  animate?: any;
  initial?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  whileFocus?: any;
  layout?: boolean;
  layoutId?: string;
}

interface MViewProps extends BaseMotionProps {
  as?: keyof JSX.IntrinsicElements;
}

interface MPressableProps extends BaseMotionProps {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// Web implementations using Framer Motion
let motion: any = null;
let AnimatePresence: any = null;

if (isWeb) {
  try {
    const framerMotion = require('framer-motion');
    motion = framerMotion.motion;
    AnimatePresence = framerMotion.AnimatePresence;
  } catch (error) {
    // Framer Motion not available, will use fallback
    console.warn('Framer Motion not available, using fallback components');
  }
}

// Native implementations using Reanimated
let Animated: any = null;
let useSharedValue: any = null;
let useAnimatedStyle: any = null;
let withSpring: any = null;
let withTiming: any = null;

if (isNative) {
  try {
    const reanimated = require('react-native-reanimated');
    Animated = reanimated.default;
    useSharedValue = reanimated.useSharedValue;
    useAnimatedStyle = reanimated.useAnimatedStyle;
    withSpring = reanimated.withSpring;
    withTiming = reanimated.withTiming;
  } catch (error) {
    // Reanimated not available, will use fallback
    console.warn('React Native Reanimated not available, using fallback components');
  }
}

// Fallback components for when motion libraries aren't available
const FallbackView = forwardRef<any, any>(({ children, style, className, ...props }, ref) => {
  if (isWeb) {
    return (
      <div ref={ref} style={style} className={className} {...props}>
        {children}
      </div>
    );
  } else {
    const { View } = require('react-native');
    return (
      <View ref={ref} style={style} {...props}>
        {children}
      </View>
    );
  }
});

const FallbackPressable = forwardRef<any, any>(({ children, style, className, onPress, disabled, ...props }, ref) => {
  if (isWeb) {
    return (
      <button
        ref={ref}
        style={style}
        className={className}
        onClick={onPress}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  } else {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity
        ref={ref}
        style={style}
        onPress={onPress}
        disabled={disabled}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
});

// Web Motion Components
const WebMView = forwardRef<any, MViewProps>(({ as = 'div', children, ...props }, ref) => {
  if (motion) {
    const MotionComponent = motion[as];
    return (
      <MotionComponent ref={ref} {...props}>
        {children}
      </MotionComponent>
    );
  }
  return <FallbackView ref={ref} {...props}>{children}</FallbackView>;
});

const WebMPressable = forwardRef<any, MPressableProps>(({ children, onPress, ...props }, ref) => {
  if (motion) {
    return (
      <motion.button
        ref={ref}
        onClick={onPress}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12 }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: onPress ? 'pointer' : 'default',
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
  return <FallbackPressable ref={ref} onPress={onPress} {...props}>{children}</FallbackPressable>;
});

// Native Motion Components
const NativeMView = forwardRef<any, MViewProps>(({ children, animate, initial, style, ...props }, ref) => {
  if (Animated && useSharedValue && useAnimatedStyle) {
    const opacity = useSharedValue(initial?.opacity ?? 1);
    const scale = useSharedValue(initial?.scale ?? 1);
    const translateY = useSharedValue(initial?.y ?? 0);

    // Apply animations if animate prop is provided
    React.useEffect(() => {
      if (animate) {
        if (animate.opacity !== undefined) {
          opacity.value = withTiming(animate.opacity, { duration: 220 });
        }
        if (animate.scale !== undefined) {
          scale.value = withSpring(animate.scale);
        }
        if (animate.y !== undefined) {
          translateY.value = withTiming(animate.y, { duration: 220 });
        }
      }
    }, [animate]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    }));

    return (
      <Animated.View ref={ref} style={[style, animatedStyle]} {...props}>
        {children}
      </Animated.View>
    );
  }

  return <FallbackView ref={ref} style={style} {...props}>{children}</FallbackView>;
});

const NativeMPressable = forwardRef<any, MPressableProps>(({ children, onPress, style, ...props }, ref) => {
  if (Animated && useSharedValue && useAnimatedStyle) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      props.onPressIn?.();
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      props.onPressOut?.();
    };

    const { Pressable } = require('react-native');
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <Animated.View style={[style, animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <FallbackPressable ref={ref} onPress={onPress} style={style} {...props}>{children}</FallbackPressable>;
});

// Export unified components
export const MView = forwardRef<any, MViewProps>((props, ref) => {
  if (isWeb) {
    return <WebMView ref={ref} {...props} />;
  }
  return <NativeMView ref={ref} {...props} />;
});

export const MPressable = forwardRef<any, MPressableProps>((props, ref) => {
  if (isWeb) {
    return <WebMPressable ref={ref} {...props} />;
  }
  return <NativeMPressable ref={ref} {...props} />;
});

// AnimatePresence wrapper
export const MAnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isWeb && AnimatePresence) {
    return <AnimatePresence>{children}</AnimatePresence>;
  }
  return <>{children}</>;
};

// Common animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  press: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.12 },
  },
};

// Utility function to check if motion is available
export const hasMotionSupport = (): boolean => {
  if (isWeb) {
    return motion !== null;
  }
  return Animated !== null;
};

// Default export
export default {
  MView,
  MPressable,
  MAnimatePresence,
  animations,
  hasMotionSupport,
};
