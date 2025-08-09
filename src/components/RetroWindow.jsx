import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

const RetroWindow = ({
  title = 'Untitled Window',
  children,
  width = '400px',
  height = '300px',
  x = 50,
  y = 50,
  resizable = true,
  minimizable = true,
  maximizable = true,
  closeable = true,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
  active = true,
  icon,
  ...props
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);

  // Window control handlers
  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.(!isMaximized);
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setIsMaximized(false);
  };

  // Classic XP window styles
  const windowStyles = {
    position: 'fixed',
    left: isMaximized ? 0 : position.x,
    top: isMaximized ? 0 : position.y,
    width: isMaximized ? '100vw' : size.width,
    height: isMaximized ? '100vh' : size.height,
    background: '#ece9d8',
    border: '2px outset #aca899',
    borderRadius: '0',
    boxShadow: `
      2px 2px 8px rgba(0, 0, 0, 0.3),
      inset 1px 1px 0 rgba(255, 255, 255, 0.8),
      inset -1px -1px 0 rgba(128, 128, 128, 0.5)
    `,
    fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '11px',
    zIndex: active ? 1000 : 999,
    overflow: 'hidden',
  };

  const titleBarStyles = {
    height: '25px',
    background: active
      ? 'linear-gradient(90deg, #0054e3 0%, #4d90fe 50%, #0054e3 100%)'
      : 'linear-gradient(90deg, #7a7a7a 0%, #a0a0a0 50%, #7a7a7a 100%)',
    border: '1px solid ' + (active ? '#316ac5' : '#808080'),
    borderBottom: '1px solid ' + (active ? '#0040d0' : '#606060'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2px 4px 2px 6px',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    color: '#ffffff',
    textShadow: '1px 1px 0 rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontSize: '11px',
  };

  const controlButtonStyles = {
    width: '21px',
    height: '21px',
    background: 'linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)',
    border: '1px outset #aca899',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '9px',
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: '2px',
  };

  const controlButtonHover = {
    background: 'linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)',
  };

  const controlButtonActive = {
    border: '1px inset #aca899',
    background: 'linear-gradient(180deg, #d4d0c8 0%, #ece9d8 55%, #ffffff 100%)',
  };

  const contentStyles = {
    height: 'calc(100% - 25px)',
    background: '#ffffff',
    border: '1px inset #dfdfdf',
    margin: '2px',
    overflow: 'auto',
    padding: '8px',
  };

  if (isMinimized) {
    return (
      <motion.div
        className="retro-taskbar-item"
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '4px',
          width: '160px',
          height: '28px',
          background: 'linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)',
          border: '2px outset #aca899',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
        }}
        onClick={handleRestore}
        whileHover={{
          background: 'linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)',
        }}
      >
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={windowStyles}
      className={clsx('retro-window', className)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Title Bar */}
      <div style={titleBarStyles}>
        {/* Window Icon and Title */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {icon && (
            <span style={{ marginRight: '4px', fontSize: '12px' }}>
              {icon}
            </span>
          )}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px',
            }}
          >
            {title}
          </span>
        </div>

        {/* Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {minimizable && (
            <motion.button
              style={controlButtonStyles}
              whileHover={controlButtonHover}
              whileTap={controlButtonActive}
              onClick={handleMinimize}
              title="Minimize"
            >
              <Minus size={10} />
            </motion.button>
          )}

          {maximizable && (
            <motion.button
              style={controlButtonStyles}
              whileHover={controlButtonHover}
              whileTap={controlButtonActive}
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <RotateCcw size={9} /> : <Square size={9} />}
            </motion.button>
          )}

          {closeable && (
            <motion.button
              style={{
                ...controlButtonStyles,
                background: 'linear-gradient(180deg, #ff6b6b 0%, #ff5252 45%, #f44336 50%, #e53935 100%)',
                color: '#ffffff',
              }}
              whileHover={{
                background: 'linear-gradient(180deg, #ff8a80 0%, #ff7043 45%, #ff5722 50%, #f4511e 100%)',
              }}
              whileTap={controlButtonActive}
              onClick={handleClose}
              title="Close"
            >
              <X size={10} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div style={contentStyles}>
        {children}
      </div>

      {/* Resize Handles - if resizable */}
      {resizable && !isMaximized && (
        <>
          {/* Corner resize handle */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '12px',
              height: '12px',
              background: 'linear-gradient(135deg, #ece9d8 0%, #d4d0c8 100%)',
              cursor: 'nw-resize',
              borderLeft: '1px solid #999999',
              borderTop: '1px solid #999999',
            }}
          />

          {/* Edge resize handles */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: '12px',
              height: '3px',
              cursor: 'ns-resize',
              background: 'transparent',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '25px',
              bottom: '12px',
              width: '3px',
              cursor: 'ew-resize',
              background: 'transparent',
            }}
          />
        </>
      )}
    </motion.div>
  );
};

// Classic Windows XP Dialog Box
export const RetroDialog = ({
  title,
  children,
  onOK,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  showCancel = true,
  icon = '⚠️',
  ...props
}) => (
  <RetroWindow
    title={title}
    width="320px"
    height="auto"
    resizable={false}
    minimizable={false}
    maximizable={false}
    icon={icon}
    {...props}
  >
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <div style={{ marginBottom: '16px', fontSize: '11px', lineHeight: '1.4' }}>
        {children}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <motion.button
          onClick={onOK}
          style={{
            padding: '4px 16px',
            background: 'linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)',
            border: '2px outset #aca899',
            borderRadius: '0',
            fontSize: '11px',
            fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
            cursor: 'pointer',
            minWidth: '75px',
          }}
          whileHover={{
            background: 'linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)',
          }}
          whileTap={{
            border: '2px inset #aca899',
          }}
        >
          {okText}
        </motion.button>
        {showCancel && (
          <motion.button
            onClick={onCancel}
            style={{
              padding: '4px 16px',
              background: 'linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)',
              border: '2px outset #aca899',
              borderRadius: '0',
              fontSize: '11px',
              fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
              cursor: 'pointer',
              minWidth: '75px',
            }}
            whileHover={{
              background: 'linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)',
            }}
            whileTap={{
              border: '2px inset #aca899',
            }}
          >
            {cancelText}
          </motion.button>
        )}
      </div>
    </div>
  </RetroWindow>
);

export default RetroWindow;
