import { useEffect, useState } from 'react';
import Logo from '../../assets/images/Logo.png';
const Preloader = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Simulate loading complete after some delay
    const timeout = setTimeout(() => {
      setShow(false);
    }, 300); // adjust the delay as needed

    return () => clearTimeout(timeout);
  }, []);

  return (
    show && (
      <div
        id="preloader"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#fff',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1,
          transition: 'opacity 0.6s ease',
        }}
      ><div className='align-middle text-center'>
         <img src={Logo} width={200} className='d-block'/>
       <div className="loader-new" ></div>
      </div>
      
      </div>
    )
  );
};

export default Preloader;
