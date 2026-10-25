import React from 'react';
import styles from '../../styles/button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  ghost: styles.ghost,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => {
    const classes = [styles.button, variantClasses[variant]];
    if (size === 'sm') classes.push(styles.small);
    if (className) classes.push(className);
    return (
      <button ref={ref} className={classes.join(' ')} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
