import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

import logo from '../../images/logo.png'

const NavbarItem = ({title, classProps, to }) => {
    if (to) {
        return (
            <li className={`mx-4 cursor-pointer ${classProps}`}>
                <Link to={to}>{title}</Link>
            </li>
        );
    }
    return (
        <li className={`mx-4 cursor-pointer ${classProps}`}>
            {title}
        </li>
    );
}

const Navbar = () => {
    const [toggleMenu, setToggleMenu] = useState(false);

    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className='md:flex-[0.5] flex-initial justify-center items-center'>
                <img src={logo} alt="logo" className = "w-32 cursor-pointer"/>
            </div>
            <ul className='text-black md:flex hidden list-none flex-row justify-between items-center flex-initial vueling-lowercase'>
                <NavbarItem title="home" to="/" />
                <NavbarItem title="create order" to="/create-order" />
                <NavbarItem title="orders" to="/orders" />
            </ul>
            <div className="flex relative">
                {toggleMenu
                    ? <AiOutlineClose fontSize={28} className='text-black md:hidden cursor-pointer' onClick={() => setToggleMenu(false)} />
                    : <HiMenuAlt4 fontSize={28} className='text-black md:hidden cursor-pointer' onClick={() => setToggleMenu(true)} /> }

                {toggleMenu && (
                    <ul
                    className='z-10 fixed top-0 right-2 p-3 w-[70wv] h-screen shadow-2x1 list-none
                        flex flex-col justify-start items-end rounded-md blue-glassmorphism text-black animate-slide-in
                    '
                    >
                        <li className='text-xl w-full my-2'>
                            <AiOutlineClose onClick={() => setToggleMenu(false)} />
                        </li>
                        <NavbarItem title="home" to="/" classProps='my-2 text-lg vueling-lowercase' />
                        <NavbarItem title="create order" to="/create-order" classProps='my-2 text-lg vueling-lowercase' />
                        <NavbarItem title="orders" to="/orders" classProps='my-2 text-lg vueling-lowercase' />
                    </ul>
                )
                }
            </div>
        </nav>
    );
}

export default Navbar;