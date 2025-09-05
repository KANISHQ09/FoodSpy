import { configureStore } from '@reduxjs/toolkit';
import ProductSlice from './features/ProductSlice';
import CardSlice from './features/CardSlice'

const Store = configureStore({
    reducer: {
        products: ProductSlice,
        card: CardSlice,
    },
});

export default Store;
