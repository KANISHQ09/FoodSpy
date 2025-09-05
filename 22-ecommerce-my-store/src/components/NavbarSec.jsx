import React from 'react'
import { Link } from 'react-router-dom'
import 'remixicon/fonts/remixicon.css'


const NavbarSec = () => {
    return (
        <>
            <nav className='sec-nav'>
                <Link><i class="ri-macbook-line"></i><span>Electronics</span></Link>
                <Link><i class="ri-t-shirt-fill"></i><span>Fashion</span></Link>
                <Link><i class="ri-home-2-line"></i><span>Home & Garden</span></Link>
                <Link><i class="ri-flower-fill"></i><span>Beauty</span></Link>
                
            </nav>
            
        </>
    )
}

export default NavbarSec
