export const categoryIcons: Record<string, string> = {
  Médicaments: '💊',
  'Premiers soins': '🩹',
  Hygiène: '🧴',
  Bébé: '👶',
  Vitamines: '💪',
  Parapharmacie: '🧴',
};

export const clientTimeline = [
  { status: 'paid', label: 'Commande passée' },
  { status: 'preparing', label: 'Pharmacie confirmée' },
  { status: 'ready', label: 'Commande préparée' },
  { status: 'picked_up', label: 'Livreur en route' },
  { status: 'delivered', label: 'Livrée' },
] as const;

export const pickupTimeline = [
  { status: 'paid', label: 'Commande passée' },
  { status: 'preparing', label: 'Pharmacie confirmée' },
  { status: 'ready', label: 'Prête au retrait' },
  { status: 'delivered', label: 'Retirée' },
] as const;
