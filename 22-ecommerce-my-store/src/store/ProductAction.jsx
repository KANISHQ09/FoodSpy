import axios from "../utils/AxiosCofiger";
import { setProducts } from "./features/ProductSlice";

export const asyncGetProducts = () => async (dispatch, getState) => {
    try {
        const { data } = await axios.get("/");
        dispatch(setProducts(data))
    } catch (error) {
        console.log(error)
    }
}