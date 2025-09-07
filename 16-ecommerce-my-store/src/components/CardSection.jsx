import React, { useEffect, useState } from 'react'
import NavbarFirst from './NavbarFirst'
import CreateProduct from './CreateProduct'
import { useDispatch, useSelector } from 'react-redux';
import 'remixicon/fonts/remixicon.css'
import { removeItem } from '../store/features/CardSlice'
import { ServerStyleSheet } from 'styled-components';

const CardSection = () => {
    const cardItems = useSelector(state => state.card);
    const dispatch = useDispatch()

    const [total, setTotal] = useState(0)

    useEffect(() => {
        return () => {

            let sum = 0;
            cardItems.forEach((elem) => {
                sum += elem.price
            })
            setTotal(sum)
        }
    }, [cardItems])

    return (
        <>
            <NavbarFirst />
            <CreateProduct />

            <div className='card-section'>

                <div className="card-left">
                    <h1>Your Shopping Cart</h1>

                    <div className="card-products">
                        {cardItems.map((elem, idx) => {
                            return <div className="product" key={idx}>
                                <div className="one">
                                    <img src={elem.images} alt="" />
                                    <h3>{elem.title}</h3>
                                </div>
                                <div className="two">
                                    <h3>$ {elem.price}</h3>
                                    <button onClick={() => dispatch(removeItem(elem.id))}><i class="ri-delete-bin-5-line"></i></button>
                                </div>

                            </div>

                        })}

                    </div>
                </div>

                <div className="card-right">
                    <div className="summary">
                        <h2>Order Summary</h2>
                        <div className="toPay">
                            <div className='first'>
                                <h4>Subtotal</h4>
                                <p>$ {total}</p>
                            </div>
                            <div className='sec'>
                                <h4>Shipping</h4>
                                <p>Free</p>
                            </div>
                        </div>

                        <hr />

                        <div className='total'>
                            <h3>Total</h3>
                            <h3>$ {total}</h3>
                        </div>

                        <button>Proceed to Checkout</button>
                    </div>
                </div>

            </div>

        </>
    )
}

export default CardSection
