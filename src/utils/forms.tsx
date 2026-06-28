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

export { highlightField };