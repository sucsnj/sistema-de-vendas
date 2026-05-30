  export const canEdit = (data: string) => {
    const saleDate = new Date(`${data}T00:00:00`);
    const today = new Date();
    const todayMidnight = new Date(today.toISOString().split('T')[0] + 'T00:00:00');
    const diffMs = todayMidnight.getTime() - saleDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 2;
  };