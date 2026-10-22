
// Tipos para categoria de produtos
export interface CategoryFormData {
    name: string;
    description: string;
}

export interface CategoryOptions {
    openCategoryModal: () => void;
    saveCategory: React.FormEventHandler<HTMLFormElement>;
}