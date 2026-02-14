import React from "react";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  min-height: calc(100vh - 70px);

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    padding: 20px 15px;
  }
`;

function Layout({ children, className }) {
  return <PageContainer className={className}>{children}</PageContainer>;
}

export default Layout;
