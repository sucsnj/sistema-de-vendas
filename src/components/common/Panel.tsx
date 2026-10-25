import React from 'react';
import styles from '../../styles/layout.module.css';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({ children, className }) => (
  <section className={className ? `${styles.panel} ${className}` : styles.panel}>{children}</section>
);

export default Panel;
