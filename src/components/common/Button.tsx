import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, className, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const [hideIcon, setHideIcon] = useState(false);
    const iconWidthRef = useRef(0);

    const setRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      const evaluate = () => {
        if (!hideIcon) {
          if (button.scrollWidth > button.clientWidth + 1) {
            iconWidthRef.current = iconRef.current?.offsetWidth ?? 0;
            setHideIcon(true);
          }
        } else if (iconWidthRef.current > 0 && button.clientWidth >= button.scrollWidth + iconWidthRef.current + 8) {
          setHideIcon(false);
        }
      };

      const observer = new ResizeObserver(evaluate);
      observer.observe(button);
      evaluate();

      return () => observer.disconnect();
    }, [icon, children, hideIcon]);

    const classes = [styles.button];
    if (className) classes.push(className);

    return (
      <button ref={setRef} className={classes.join(' ')} {...props}>
        {icon && !hideIcon ? <span ref={iconRef} className={styles.icon}>{icon}</span> : null}
        {children ? <span className={styles.label}>{children}</span> : null}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
