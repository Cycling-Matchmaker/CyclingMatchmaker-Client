import React from 'react';
import "../styles/components/button.css"

interface ButtonProps {
    type: 'primary' | 'secondary';
    disabled?: boolean;
    width?: number;
    children: React.ReactNode;
    onClick?: () => void;
    marginTop?: number;
}

const Button: React.FC<ButtonProps> = ({ type, width, disabled, children, onClick, marginTop }) => {

    let disabledStyle = (disabled ? " button-disabled" : "");

    return (
        <button disabled={disabled} onClick={onClick} className={"button button-" + type + disabledStyle} style={{width: `${width ?? 100}%`, marginTop: `${marginTop ?? 0}px`}} >
            {children}
        </button>
    );
};

export default Button;
