import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";

const progress = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

const Wrapper = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 20000;
  pointer-events: none;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  width: 100%;
  animation: ${progress} linear forwards;
`;

const Container = styled.div`
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  background: #1e1e1e;
  color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  ${(props) =>
    props.visible
      ? css`
          opacity: 1;
          transform: translateX(0);
        `
      : css`
          opacity: 0;
          transform: translateX(100px);
        `}

  ${(props) =>
    props.type === "error" &&
    css`
      border-left: 4px solid #ff4d4f;
      ${ProgressBar} {
        background: #ff4d4f;
      }
    `}

  ${(props) =>
    props.type === "info" &&
    css`
      border-left: 4px solid #1890ff;
      ${ProgressBar} {
        background: #1890ff;
      }
    `}

  ${(props) =>
    props.type === "success" &&
    css`
      border-left: 4px solid #52c41a;
      ${ProgressBar} {
        background: #52c41a;
      }
    `}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Icon = styled.span`
  font-size: 1.2rem;
`;

const Message = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
`;

const Toast = ({ message, type = "error", duration = 3000, onExited }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const exitTimer = setTimeout(() => {
        if (onExited) onExited();
      }, 300); // Wait for fade-out animation
      return () => clearTimeout(exitTimer);
    }
  }, [visible, onExited]);

  return (
    <Container visible={visible} type={type}>
      <Content>
        <Icon>
          {type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"}
        </Icon>
        <Message>{message}</Message>
      </Content>
      <ProgressBar style={{ animationDuration: `${duration}ms` }} />
    </Container>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = React.useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Wrapper>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onExited={() => removeToast(toast.id)}
          />
        ))}
      </Wrapper>
    </ToastContext.Provider>
  );
};

export const ToastContext = React.createContext({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export default Toast;
