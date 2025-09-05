import { createSlice } from '@reduxjs/toolkit';

const CardSlice = createSlice({
    name: 'card',
    initialState: [],
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += 1; // Increment quantity
            } else {
                state.push({ ...action.payload, quantity: 1 }); // Add new item
            }
        },
        incrementQuantity: (state, action) => {
            const item = state.find(item => item.id === action.payload);
            if (item) item.quantity += 1;
        },
        decrementQuantity: (state, action) => {
            const item = state.find(item => item.id === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
            }
        },
        removeItem: (state, action) => {
            return state.filter(item => item.id !== action.payload);
        },
    },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeItem } = CardSlice.actions;
export default CardSlice.reducer;
