import { create } from 'zustand';

export const useReportStore = create((set) => ({
  selectedCrime: [],
  additionalInfo: '',
  date: new Date(),
  selectedAddress: '',
  selectedLatLng: { lat: null, lng: null },
  image: null,

  // setters
  setSelectedCrime: (crimes) => set({ selectedCrime: crimes }),
  setAdditionalInfo: (info) => set({ additionalInfo: info }),
  setDate: (date) => set({ date }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  setSelectedLatLng: (latLng) => set({ selectedLatLng: latLng }),
  setImage: (image) => set({ image }),

  resetForm: () =>
    set({
      selectedCrime: [],
      additionalInfo: '',
      date: new Date(),
      selectedAddress: '',
      selectedLatLng: { lat: null, lng: null },
      image: null,
    }),
}));
