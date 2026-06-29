// forms.tsx
import React from 'react';
import stylesContas from '@/styles/contas.module.css';

// Adiciona classe para validação de campos obrigatórios
const highlightField = (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>) => {
    const input = ref.current;
    if (!input) return;

    input.focus();
    input.classList.add('errorHighlight');

    // Remove a classe quando o usuário começar a digitar
    const handleInput = () => {
        input.classList.remove('errorHighlight');
        input.removeEventListener('input', handleInput); // remove o listener depois
    };

    input.addEventListener('input', handleInput);

    // Remove a classe após um tempo
    // setTimeout(() => {
    //     input.classList.remove('errorHighlight');
    // }, 400);
};

// Adiciona classe hidden com base no ref e classe
const hideField = (ref: React.RefObject<HTMLElement | null>, hide: boolean) => {
    const element = ref.current;
    if (!element) return;

    if (hide) {
        element.classList.add('hidden');
    } else {
        element.classList.remove('hidden');
    }
};

// Remove a classe hidden com base no ref e classe
const showField = (ref: React.RefObject<HTMLElement | null>, show: boolean) => {
    const element = ref.current;
    if (!element) return;

    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
};

export { highlightField, hideField, showField };