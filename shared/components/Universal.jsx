/**
 * Universal Components for Cross-Platform Compatibility
 * Provides unified React components that work seamlessly on web and mobile
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { Platform, PlatformComponents, createPlatformStyles, HapticUtils, InputUtils } from '../utils/platform.js';

// Platform-specific imports (conditional)
let ReactNativeComponents = {};
let FramerMotion = {};

if (Platform.isMobile) {
  try {
    ReactNativeComponents = require('react-native');
  } catch (e) {
    console.warn('React Native components not available');
  }
} else {
  try {
    FramerMotion = require('framer-motion');
  } catch (e) {
    console.warn('Framer Motion not available');
  }
}

// Universal View Component
export const UniversalView = forwardRef(({
  children,
  style,
  className,
  animated = false,
  animationType = 'fadeIn',
  onPress,
  ...props
}, ref) => {
  const platformStyles = createPlatformStyles(
    { className }, // Web styles
    { style }      // Mobile styles
  );

  if (Platform.isMobile) {
    const Component = onPress ? ReactNativeComponents.TouchableOpacity : ReactNativeComponents.View;

    if (animated && ReactNativeComponents.Animated) {
      return (
        <ReactNativeComponents.Animated.View
          ref={ref}
          style={style}
          {...props}
        >
          {children}
        </ReactNativeComponents.Animated.View>
      );
    }

    return (
      <Component
        ref={ref}
        style={style}
        onPress={onPress}
        {...props}
      >
        {children}
      </Component>
    );
  }

  // Web implementation
  if (animated && FramerMotion.motion) {
    const animationProps = animationType === 'fadeIn'
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.4 } };

    return (
      <FramerMotion.motion.div
        ref={ref}
        className={className}
        onClick={onPress}
        {...animationProps}
        {...props}
      >
        {children}
      </FramerMotion.motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      onClick={onPress}
      {...props}
    >
      {children}
    </div>
  );
});

// Universal Text Component
export const UniversalText = forwardRef(({
  children,
  style,
  className,
  numberOfLines,
  selectable = true,
  ...props
}, ref) => {
  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.Text
        ref={ref}
        style={style}
        numberOfLines={numberOfLines}
        selectable={selectable}
        {...props}
      >
        {children}
      </ReactNativeComponents.Text>
    );
  }

  // Web implementation
  const webStyle = numberOfLines ? {
    display: '-webkit-box',
    WebkitLineClamp: numberOfLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  } : {};

  return (
    <span
      ref={ref}
      className={className}
      style={{
        userSelect: selectable ? 'text' : 'none',
        ...webStyle
      }}
      {...props}
    >
      {children}
    </span>
  );
});

// Universal Button Component
export const UniversalButton = forwardRef(({
  title,
  children,
  onPress,
  style,
  className,
  disabled = false,
  hapticFeedback = 'medium',
  variant = 'primary',
  ...props
}, ref) => {
  const handlePress = async (e) => {
    if (disabled) return;

    // Haptic feedback on mobile
    if (Platform.isMobile && hapticFeedback) {
      await HapticUtils.impact(hapticFeedback);
    }

    onPress?.(e);
  };

  const baseClasses = `
    px-4 py-2 rounded-lg font-medium transition-all duration-200
    ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
    ${variant === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
    ${variant === 'outline' ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.TouchableOpacity
        ref={ref}
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: variant === 'primary' ? '#2563eb' : '#f3f4f6',
            opacity: disabled ? 0.5 : 1
          },
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        <ReactNativeComponents.Text style={{
          color: variant === 'primary' ? '#ffffff' : '#1f2937',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {title || children}
        </ReactNativeComponents.Text>
      </ReactNativeComponents.TouchableOpacity>
    );
  }

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${className || ''}`}
      onClick={handlePress}
      disabled={disabled}
      {...props}
    >
      {title || children}
    </button>
  );
});

// Universal Input Component
export const UniversalInput = forwardRef(({
  value,
  onChangeText,
  placeholder,
  style,
  className,
  type = 'text',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  ...props
}, ref) => {
  const inputProps = InputUtils.getInputProps({
    value,
    onChangeText,
    placeholder,
    type: secureTextEntry ? 'password' : type,
    className,
    style
  });

  if (Platform.isMobile) {
    const InputComponent = multiline ? ReactNativeComponents.TextInput : ReactNativeComponents.TextInput;

    return (
      <InputComponent
        ref={ref}
        style={[
          {
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16,
            backgroundColor: '#ffffff'
          },
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        {...props}
      />
    );
  }

  // Web implementation
  const Component = multiline ? 'textarea' : 'input';
  const baseClasses = `
    border border-gray-300 rounded-lg px-3 py-2
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all duration-200
  `;

  return (
    <Component
      ref={ref}
      className={`${baseClasses} ${className || ''}`}
      rows={multiline ? numberOfLines : undefined}
      {...inputProps}
      {...props}
    />
  );
});

// Universal ScrollView Component
export const UniversalScrollView = forwardRef(({
  children,
  style,
  className,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  ...props
}, ref) => {
  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.ScrollView
        ref={ref}
        style={style}
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        {...props}
      >
        {children}
      </ReactNativeComponents.ScrollView>
    );
  }

  const scrollClass = horizontal ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden';
  const hideScrollbar = (!showsVerticalScrollIndicator || !showsHorizontalScrollIndicator)
    ? 'scrollbar-hide' : '';

  return (
    <div
      ref={ref}
      className={`${scrollClass} ${hideScrollbar} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// Universal Image Component
export const UniversalImage = forwardRef(({
  source,
  src,
  style,
  className,
  resizeMode = 'cover',
  alt,
  ...props
}, ref) => {
  const imageSrc = source?.uri || src;

  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.Image
        ref={ref}
        source={typeof imageSrc === 'string' ? { uri: imageSrc } : source}
        style={style}
        resizeMode={resizeMode}
        {...props}
      />
    );
  }

  const objectFitMap = {
    cover: 'object-cover',
    contain: 'object-contain',
    stretch: 'object-fill',
    center: 'object-center'
  };

  return (
    <img
      ref={ref}
      src={imageSrc}
      alt={alt}
      className={`${objectFitMap[resizeMode] || 'object-cover'} ${className || ''}`}
      {...props}
    />
  );
});

// Universal Modal Component
export const UniversalModal = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.Modal
        visible={isVisible}
        onRequestClose={onClose}
        animationType={animationType}
        transparent={transparent}
        {...props}
      >
        {children}
      </ReactNativeComponents.Modal>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        {children}
      </div>
    </div>
  );
};

// Universal SafeAreaView Component
export const UniversalSafeAreaView = forwardRef(({
  children,
  style,
  className,
  ...props
}, ref) => {
  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.SafeAreaView
        ref={ref}
        style={[{ flex: 1 }, style]}
        {...props}
      >
        {children}
      </ReactNativeComponents.SafeAreaView>
    );
  }

  return (
    <div
      ref={ref}
      className={`min-h-screen ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// Universal FlatList Component
export const UniversalFlatList = ({
  data,
  renderItem,
  keyExtractor,
  style,
  className,
  numColumns = 1,
  horizontal = false,
  ...props
}) => {
  if (Platform.isMobile) {
    return (
      <ReactNativeComponents.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={style}
        numColumns={numColumns}
        horizontal={horizontal}
        {...props}
      />
    );
  }

  const gridClass = numColumns > 1
    ? `grid grid-cols-${numColumns} gap-4`
    : horizontal
      ? 'flex flex-row space-x-4 overflow-x-auto'
      : 'space-y-2';

  return (
    <div className={`${gridClass} ${className || ''}`}>
      {data?.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : index;
        return (
          <div key={key}>
            {renderItem({ item, index })}
          </div>
        );
      })}
    </div>
  );
};

// Universal StatusBar Component
export const UniversalStatusBar = ({ style: statusBarStyle = 'auto', backgroundColor, ...props }) => {
  if (Platform.isMobile) {
    const { StatusBar } = ReactNativeComponents;
    return <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} {...props} />;
  }

  // Web doesn't need a status bar component
  return null;
};

// Export all components
export default {
  View: UniversalView,
  Text: UniversalText,
  Button: UniversalButton,
  Input: UniversalInput,
  ScrollView: UniversalScrollView,
  Image: UniversalImage,
  Modal: UniversalModal,
  SafeAreaView: UniversalSafeAreaView,
  FlatList: UniversalFlatList,
  StatusBar: UniversalStatusBar
};
