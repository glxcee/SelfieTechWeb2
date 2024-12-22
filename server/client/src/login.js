import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { address } from "./utils"

function LoginPage(props) {
    const [sign, setSign] = useState(false)
    const [obscured, setObs] = useState(true)
    const [wrong, setWrong] = useState(false)
    const navigate = useNavigate()
  
    function handleSubmit(e) {
      e.preventDefault()
      const username = e.target[0].value
      const password = e.target[1].value

      console.log(username, password)

      fetch(address+"api/"+(sign ? "register" : "login"),{
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password})
      }).then(res => {
        console.log(res)
        if(res.ok) {
          props.setUser(username)
          navigate('/selfie')
        }
        else setWrong(true)
      })
    }

    
  
    return (
      <div className="min-h-full">
      <div className="flex justify-center content-center mt-32">
        <div className="flex flex-col w-full max-w-md px-4 py-8 bg-white rounded-lg shadow  sm:px-6 md:px-8 lg:px-10">
          <div className="self-center mb-6 text-xl font-light text-gray-600 sm:text-2xl ">
            {sign ? "Register" : "Log into"} Your <span className='font-bold'>Selfie</span> Account
          </div>
          <div className="mt-8">
            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="flex flex-col mb-2">
                <div className="flex relative ">
                  <span className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                  <svg
                      width={15}
                      fill="currentColor"
                      height={15}
                      className="text-gray-800"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1523 1339q-22-155-87.5-257.5t-184.5-118.5q-67 74-159.5 115.5t-195.5 41.5-195.5-41.5-159.5-115.5q-119 16-184.5 118.5t-87.5 257.5q106 150 271 237.5t356 87.5 356-87.5 271-237.5zm-243-699q0-159-112.5-271.5t-271.5-112.5-271.5 112.5-112.5 271.5 112.5 271.5 271.5 112.5 271.5-112.5 112.5-271.5zm512 256q0 182-71 347.5t-190.5 286-285.5 191.5-349 71q-182 0-348-71t-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"></path>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="sign-in-user"
                    className=" rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Your username"
                  />
                </div>
              </div>
              <div className="flex flex-col mb-6">
                <div className="flex relative ">
                  <span className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b border-gray-300 text-gray-500 shadow-sm text-sm">
                  <svg
                      width={15}
                      height={15}
                      fill="currentColor"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z"></path>
                    </svg>
                  </span>
                  <input
                    type={obscured ? "password" : "text"}
                    id="sign-in-password"
                    className=" rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Your password"
                  />
                </div>
                
                <label className="flex items-center m-2 space-x-2">
    <input
      onChange={() => setObs(!obscured)}
      type="checkbox"
      name="checked-demo"
      className="bg-white bg-check h-3 w-3 border border-gray-300 rounded-md checked:bg-blue-500 checked:border-transparent focus:outline-none"
    />
    <span className="text-xs text-gray-400 ">Show password</span>
  </label>
              <div className={"flex justify-center items-center"+(wrong ? "" : " hidden")}>
                <span className="text-red-600">Wrong username or password.</span>
              </div>
  
              </div>

              
              
  
              <div className="mb-5">
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input onChange={() => setSign(!sign)} type="checkbox" name="toggle" id="Blue" className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label htmlFor="Blue" className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer">
                  </label>
              </div>
              <span className="font-medium text-gray-400">
                  Register
              </span>
          </div>
              <div className="flex w-full">
                <button
                  type="submit"
                  className="py-2 px-4  bg-blue-500 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                >
                  {sign ? "Register" : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
  
      </div>
      </div>
    );
  }
  
  export default LoginPage;