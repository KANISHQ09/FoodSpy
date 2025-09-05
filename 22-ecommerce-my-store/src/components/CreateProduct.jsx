import axios from '../utils/AxiosCofiger';
import React, { useState } from 'react'

const CreateProduct = () => {

    const [product, setProduct] = useState({
        "title": "New Product",
        "price": 10,
        "description": "A description",
        "categoryId": 1,
        "images": ["https://placehold.co/600x400"]
    })

    const createProducts = async () => {
        try {
            const response = await axios.post("/", product);
            console.log(response)
        } catch (error) {
            console.log(error)

        }
    }

    return (
        <div>
            <h1>Create Product</h1>
            <button onClick={createProducts}>Create it</button>
        </div>
    )
}

export default CreateProduct
