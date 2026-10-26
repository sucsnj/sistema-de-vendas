import React from 'react';
import styles from '../../styles/button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, className, ...props }, ref) => {
    const classes = [styles.button];
    if (className) classes.push(className);
    return (
      <button ref={ref} className={classes.join(' ')} {...props}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        {children ? <span className={styles.label}>{children}</span> : null}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
