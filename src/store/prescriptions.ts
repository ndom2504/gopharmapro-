import { create } from 'zustand';

export type RxStatus = 'sent' | 'review' | 'approved' | 'rejected';

export type PrescriptionItem = {
  id: string;
  fileName: string;
  pharmacyName: string;
  createdAt: string;
  status: RxStatus;
  products: string[];
};

type RxStore = {
  items: PrescriptionItem[];
  add: (item: Omit<PrescriptionItem, 'id' | 'createdAt' | 'status'> & { status?: RxStatus }) => void;
};

export const rxStatusLabel: Record<RxStatus, string> = {
  sent: 'En attente',
  review: 'En vérification',
  approved: 'Validée',
  rejected: 'Refusée',
};

export const rxStatusTone: Record<RxStatus, 'orange' | 'gray' | 'green' | 'red'> = {
  sent: 'orange',
  review: 'gray',
  approved: 'green',
  rejected: 'red',
};

export const usePrescriptions = create<RxStore>((set, get) => ({
  items: [
    {
      id: 'rx-1',
      fileName: 'ordonnance-amoxicilline.jpg',
      pharmacyName: 'Pharmacie du Centre',
      createdAt: new Date().toISOString(),
      status: 'review',
      products: ['Amoxicilline 500 mg'],
    },
  ],
  add: (item) =>
    set({
      items: [
        {
          ...item,
          id: 'rx-' + Date.now(),
          createdAt: new Date().toISOString(),
          status: item.status || 'sent',
        },
        ...get().items,
      ],
    }),
}));
