import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    data: [],
}

const ProductSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.data = action.payload;
        }
    }
})

export default ProductSlice.reducer;
export const { setProducts } = ProductSlice.actions;
