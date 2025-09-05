import React, { useEffect } from "react";
import NavbarFirst from "./NavbarFirst";
import NavbarSec from "./NavbarSec";
import { useDispatch, useSelector } from "react-redux";
import { asyncGetProducts } from "../store/ProductAction";
import Loader from "./Loader";
import { addToCart } from '../store/features/CardSlice'

const Home = () => {
  const { data: products } = useSelector((state) => state.products);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(asyncGetProducts());
  }, []);

  return products ? (
    <main>
      <NavbarFirst></NavbarFirst>
      <NavbarSec></NavbarSec>

      <section className="home-section">
        <section className="hero">
          <div className="box">
            <img
              src="https://public.readdy.ai/ai/img_res/45b95da80b971a494945db3a295e2094.jpg"
              alt="Tech Deals"
              loading="lazy"
            />
            <div className="box-text">
              <h2>Spring Tech Sale</h2>
              <p>Up to 40% off on Premium electronics</p>
              <button>Shop Now</button>
            </div>
          </div>
        </section>

        <section className="products-card">
          <h1>Featured Products</h1>

          <div className="card-wrap">
            {products.map((elem, idx) => {
              return (
                <div className="card" key={idx}>
                  <div className="img-box">
                    <img src={elem.images[0]} alt=""  loading="lazy" />
                  </div>
                  <div className="card-text">
                    <h3>{elem.title}</h3>
                    <h2>$ {elem.price}</h2>
                    <div className="stars">
                      <i class="ri-star-fill fill"></i>
                      <i class="ri-star-fill fill"></i>
                      <i class="ri-star-fill fill"></i>
                      <i class="ri-star-fill fill"></i>
                      <i class="ri-star-line"></i>
                    </div>
                    <button onClick={() => dispatch(addToCart(elem))}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  ) : (
    <Loader />
  );
};

export default Home;
