import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

import logo from '../../images/vueling-logo.svg'
import ViewModeToggle from './ViewModeToggle';
import { useViewMode } from '../context/ViewModeContext';

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
    const { isAirline, isSupplier } = useViewMode();

    // Airline navigation items
    const airlineNavItems = [
        { title: "orders", to: "/" },
        { title: "create order", to: "/create-order" },
    ];

    // Supplier navigation items
    const supplierNavItems = [
        { title: "orders", to: "/" },
    ];

    const navItems = isAirline ? airlineNavItems : supplierNavItems;

    return (
        <nav className="w-full py-4">
            <div className="w-full max-w-[1600px] mx-auto px-4 flex justify-between items-center">
                <div className='flex-initial justify-center items-center'>
                    <Link to="/">
                        <img src={logo} alt="Vueling logo" className="w-32 cursor-pointer"/>
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                <div className="md:flex hidden items-center gap-4">
                    <ul className='text-black flex list-none flex-row justify-between items-center vueling-lowercase'>
                        {navItems.map((item, index) => (
                            <NavbarItem key={index} title={item.title} to={item.to} />
                        ))}
                    </ul>

                    {/* View Mode Toggle - visible on desktop */}
                    <ViewModeToggle />
                </div>

                {/* Mobile Menu Button */}
                <div className="flex relative md:hidden">
                    {toggleMenu
                        ? <AiOutlineClose fontSize={28} className='text-black cursor-pointer' onClick={() => setToggleMenu(false)} />
                        : <HiMenuAlt4 fontSize={28} className='text-black cursor-pointer' onClick={() => setToggleMenu(true)} /> }

                    {toggleMenu && (
                        <ul
                        className='z-10 fixed top-0 right-2 p-3 w-[70vw] h-screen shadow-2xl list-none
                            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-black animate-slide-in
                        '
                        >
                            <li className='text-xl w-full my-2'>
                                <AiOutlineClose onClick={() => setToggleMenu(false)} />
                            </li>
                            
                            {/* Mobile View Mode Toggle */}
                            <li className='my-4 w-full flex justify-end'>
                                <ViewModeToggle />
                            </li>
                            
                            {navItems.map((item, index) => (
                                <NavbarItem 
                                    key={index} 
                                    title={item.title} 
                                    to={item.to} 
                                    classProps='my-2 text-lg vueling-lowercase' 
                                />
                            ))}
                        </ul>
                    )
                    }
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
