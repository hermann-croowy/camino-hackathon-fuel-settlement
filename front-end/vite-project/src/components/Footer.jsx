import logo from '../../images/logo.png';

const Footer = () => {
    return (
        <div className='w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer'>
            <div className='w-full flex sm:flex-row flex-col justify-between items-center my-4'>
                <div className='flex flex-[0.5] justify-center items-center '>
                    <img src={logo} alt="logo" className='w-32' />
                </div>
                <div className='flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full vueling-lowercase'>
                    <p className='text-black text-base text-center mx-2 cursor-pointer'> market </p>
                    <p className='text-black text-base text-center mx-2 cursor-pointer'> exchange </p>
                    <p className='text-black text-base text-center mx-2 cursor-pointer'> tutorial </p>
                    <p className='text-black text-base text-center mx-2 cursor-pointer'> wallets </p>
                </div>
            </div>
            <div className='flex justify-center items-center flex-col mt-5 vueling-lowercase'>
                <p className='text-black text-sm text-center'> join us</p>
                <p className='text-black text-sm text-center'> info@ourapp.info </p>
            </div>
            <div className='sm:w-[90%] w-full h-[0.25px] bg-black opacity-20 mt-5' />
            <div className='sm:w-[90%] w-full flex justify-between items-center mt-3 vueling-lowercase'> 
            <p className='text-black text-sm text-center'> @ourapp.info </p>
            <p className='text-black text-sm text-center'> all rights reserved </p>
            </div>
        </div>
    );
}

export default Footer;