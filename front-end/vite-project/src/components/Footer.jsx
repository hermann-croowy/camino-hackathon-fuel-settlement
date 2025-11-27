import logo from '../../images/vueling-logo.svg';

const Footer = () => {
    return (
        <div className='w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer'>
            <div className='w-full flex sm:flex-row flex-col justify-between items-center my-4'>
                <div className='flex flex-[0.5] justify-center items-center '>
                    <img src={logo} alt="Vueling logo" className='w-32' />
                </div>
                <div className='flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full vueling-lowercase'>
                    <a href='https://www.vueling.com/en/we-are-vueling/about-us' target='_blank' rel='noopener noreferrer' className='text-black text-base text-center mx-2 cursor-pointer hover:opacity-70 transition-opacity'> knowledge base </a>
                    <a href='https://github.com/hermann-croowy/camino-hackathon-fuel-settlement' target='_blank' rel='noopener noreferrer' className='text-black text-base text-center mx-2 cursor-pointer hover:opacity-70 transition-opacity'> documentation </a>
                    <a href='https://www.vueling.com/' target='_blank' rel='noopener noreferrer' className='text-black text-base text-center mx-2 cursor-pointer hover:opacity-70 transition-opacity'> vueling </a>
                </div>
            </div>
            <div className='flex justify-center items-center flex-col mt-5 vueling-lowercase'>
                <p className='text-black text-sm text-center'> join us</p>
                <p className='text-black text-sm text-center'> info@fuely.info </p>
            </div>
            <div className='sm:w-[90%] w-full h-[0.25px] bg-black opacity-20 mt-5' />
            <div className='sm:w-[90%] w-full flex justify-between items-center mt-3 vueling-lowercase'> 
            <p className='text-black text-sm text-center'> @fuely.info </p>
            <p className='text-black text-sm text-center'> all rights reserved </p>
            </div>
        </div>
    );
}

export default Footer;