import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="custom-loader" />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .custom-loader {
    width: 120px;
    height: 22px;
    border-radius: 20px;
    color: #f4bf00;
    border: 2px solid;
    position: relative;
  }

  .custom-loader::before {
    content: "";
    position: absolute;
    margin: 2px;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background: #f4bf00;
    animation: p6 2s infinite;
  }

  @keyframes p6 {
    100% {
      inset: 0;
    }
  }
`;

export default Loader;
