// shortcuts.tsx
import { useEffect } from 'react';

// Função para adicionar atalhos de teclado
const useShortcuts = (shortcuts: string[], callback: (shortcut: string) => void) => {
    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const shortcut = event.code;
            if (shortcuts.includes(shortcut)) {
                event.preventDefault();
                callback(shortcut);
            }
        };

        document.addEventListener('keydown', handleShortcut);

        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, [shortcuts, callback]);
};

export { useShortcuts };