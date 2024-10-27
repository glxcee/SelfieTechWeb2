import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Header(props) {
  const navigate = useNavigate();

  const handleClickHome = () => {
    navigate('/selfie');
  };

    return (
            <header>
  <nav className="bg-white shadow py-4 ">
    <div className="px-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between h-16">
        <div className=" flex items-center">
        <Link className="flex-shrink-0" to="/selfie">
        <button
                    type="button"
                    className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700  hover:bg-gray-50  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                  >
          
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-house-door-fill" viewBox="0 0 16 16">
            <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
          </svg>
          
          </button>
          </Link>
        </div>
        <div className="block">
          <div className="flex items-center ml-4 md:ml-6">
            <div className="relative ml-3">
              <div className="relative inline-block text-left">
                <div>
                <Link to="/selfie/profile">
                  <button
                    type="button"
                    className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                  >
                    <svg
                      width={30}
                      fill="currentColor"
                      height={30}
                      className="text-gray-800"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1523 1339q-22-155-87.5-257.5t-184.5-118.5q-67 74-159.5 115.5t-195.5 41.5-195.5-41.5-159.5-115.5q-119 16-184.5 118.5t-87.5 257.5q106 150 271 237.5t356 87.5 356-87.5 271-237.5zm-243-699q0-159-112.5-271.5t-271.5-112.5-271.5 112.5-112.5 271.5 112.5 271.5 271.5 112.5 271.5-112.5 112.5-271.5zm512 256q0 182-71 347.5t-190.5 286-285.5 191.5-349 71q-182 0-348-71t-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"></path>
                    </svg>
                    
                  </button>
                  </Link>
                </div>
                
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </nav>

        </header>
    )
}