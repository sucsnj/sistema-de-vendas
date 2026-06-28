// focus.tsx
import { useEffect } from 'react';

// Focus trap
const useFocusTrap = (dialogRef: React.RefObject<HTMLElement | null>, open: boolean) => {
    useEffect(() => {
        if (!open) return;

        const focusableSelectors = [
            'a[href]',
            'button',
            'textarea',
            'input',
            'select',
            '[tabindex]:not([tabindex="-1"])',
        ];
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
            focusableSelectors.join(',')
        );

        // Adiciona a classe 'modal-open' ao body quando o modal estiver aberto
        if (open) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && focusableElements && focusableElements.length > 0) {
                const first = focusableElements[0];
                const last = focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        focusableElements?.[0]?.focus(); // foca o primeiro elemento ao abrir

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove("modal-open");
        };
    }, [open, dialogRef]);
};

export { useFocusTrap };
