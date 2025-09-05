import React from 'react'
import { Link } from 'react-router-dom'
import 'remixicon/fonts/remixicon.css'

const NavbarFirst = () => {

  return (
    <>
      <nav className='first-nav'>
        <Link to="/">TechMart</Link>

        <div className="links">
          <Link id='darkMode'><i class="ri-moon-fill"></i></Link>

          <Link to="/addToCard"><i class="ri-shopping-cart-2-fill"></i></Link>
          <Link><i class="ri-account-circle-line"></i></Link>
        </div>
      </nav>
    </>
  )
}

export default NavbarFirst
