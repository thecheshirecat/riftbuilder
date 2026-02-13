import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    bgDark: '#121212',
    bgCard: '#1e1e1e',
    bgAccent: '#252525',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textMain: '#e0e0e0',
    textDim: '#888',
    primary: '#4dabf7',
    primaryGlow: 'rgba(77, 171, 247, 0.4)',
    accent: '#ffd700',
    danger: '#ff6b6b',
    success: '#51cf66',
  },
  shadows: {
    main: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
  effects: {
    backdropBlur: 'blur(12px)',
    transition: 'all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1)',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  }
};

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background-color: ${props => props.theme.colors.bgDark};
    color: ${props => props.theme.colors.textMain};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
      "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
  }

  /* Global scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.bgDark};
  }
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.bgAccent};
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.borderColor};
  }
`;
