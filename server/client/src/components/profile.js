import { useEffect, useRef, useState } from "react"
import {Link} from "react-router-dom"

export default function ProfilePage(props) {

    function formatBirth(date) {
        const day = date.toISOString().split('T')[0]
        return day
    }

    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [birth, setBirth] = useState(formatBirth(new Date()))

    const fileInputRef = useRef(null)
    const [selectedFile, setSelectedFile] = useState(null);

    
    useEffect(() => {
      fetch("http://localhost:3001/api/profile")
      .then(res => res.json())
      .then(data => {
        setName(data.name)
        setSurname(data.surname)
        setBirth(data.birth)
        //console.log(data.birth, birth)
      })
    },[])

    function handleSave() {
      //console.log("test")
      fetch("http://localhost:3001/api/profile",{
        method:'POST',
        headers: {
           'Content-Type': 'application/json',
         },
        body: JSON.stringify({ name, surname, birth})
      }).then(res => {
        console.log(res)
      })

      const formData = new FormData();
      formData.append('image', selectedFile);
      fetch('http://localhost:3001/api/profile/pic', {
        method: 'POST',
        body: formData,
      })
      .then(res => console.log(res))
    }

    return (
        <div className="p-3">
  <form className="container max-w-xl mx-auto my-auto shadow-md md:w-3/4 border-b-2 rounded-lg">
    <div className="p-4 border-t-2 border-indigo-400 rounded-lg bg-gray-100/5 ">
      <div className="max-w-sm mx-auto md:w-full md:mx-0">
        <div className="flex items-center space-x-4 justify-center">
          <div  className="relative block">
            <img
              alt="profil"
              src="/propic.png"
              className="mx-auto object-cover rounded-full h-48 w-48"
            />
          </div>
          <input type="file" onChange={e=>setSelectedFile(e.target.files[0])} ref={fileInputRef} style={{display:"none"}} />
          <div className="text-center md:w-3/12">
          <button
            type="button"
            onClick={()=>fileInputRef.current.click()}
            className="py-2 px-4 text-indigo-700 bg-white border border-indigo-700 hover:bg-indigo-700 hover:text-white focus:ring-indigo-500 focus:ring-offset-indigo-200 w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
          >
            Change Selfie
          </button>
        </div>
        </div>
      </div>
    </div>
    <div className="space-y-6 bg-white border-b-2 rounded-lg">
      <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
        <h2 className="max-w-sm mx-auto md:w-1/3">Account Username: </h2>
        <div className="max-w-sm mx-auto md:w-2/3">
          <div className=" relative ">
            <span className="font-bold">{props.user}</span>
          </div>
        </div>
      </div>
      <hr />
      <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
        <h2 className="max-w-sm mx-auto md:w-1/3">Personal info</h2>
        <div className="max-w-sm mx-auto space-y-5 md:w-2/3">
          <div>
            <div className=" relative ">
              <input
                type="text"
                onChange={e => setName(e.target.value)}
                value={name}
                id="user-info-name"
                className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Name"
              />
            </div>
          </div>
          <div>
            <div className=" relative ">
              <input
                type="text"
                onChange={e => setSurname(e.target.value)}
                value={surname}
                id="user-info-surname"
                className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Surname"
              />
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
        <h2 className="max-w-sm mx-auto md:w-1/3">Birthday</h2>
        <div className="max-w-sm mx-auto md:w-2/3">
          <div className=" relative ">
            <input
              type="date"
              onChange={e => {setBirth(e.target.value)}}
              value={birth}
              max={formatBirth(new Date())}
              id="user-info-birth"
              className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <hr />
      <div className="flex justify-between items-center w-full px-4 pb-4 text-gray-500 md:w-full">
        <Link to="/">
          <button
            type="button"
            className="py-2 px-10 bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-blue-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          >
            Logout
          </button>
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="py-2 px-10 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
        >
          Save
        </button>
</div>

    </div>
  </form>

        </div>
    )
}