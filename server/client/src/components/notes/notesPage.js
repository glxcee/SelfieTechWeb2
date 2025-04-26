import Markdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { address } from '../../utils.js';


export default function NotesPage(){
    const [content, setContent] = useState('');
    const [render, setRender] = useState(true);
    const [focus, setFocus] = useState(false);

    const [mobile, setMobile] = useState(false);

    const [book, setBook] = useState([]);
    
        useEffect(() => {
            fetch(address+"api/notes")
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    setBook(data.notes);
                })
        },[])

    function handleSave() {
        console.log(content)
        fetch(address+'api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: content })
        })
    }

    return(
        <div className={"flex justify-center items-center h-screen transition-all duration-300 bg-amber-" + (focus ? "100" : "200")}>
            <div className={(mobile ? "" : "hidden") + " w-full sm:w-1/3 bg-yellow-700 h-full rounded-xl text-white sm:flex flex-col items-center p-3"} onClick={() => setRender(true)}>
                <span className='text-xl font-bold text-center'>All Notes</span>
            </div>
            <div className={(mobile ? "hidden" : "") + " w-full h-full flex flex-col justify-center items-center"}>
                <div className='w-full flex items-center justify-between p-3' onClick={() => setRender(true)}>
                    <button onClick={() => setMobile(true)} className="sm:hidden bg-yellow-700 p-2 rounded-lg border-yellow-700 border-2 transition duration-300 hover:bg-yellow-600 hover:border-yellow-600">
                        <svg viewBox="0 0 24 24" className='w-8 h-8 stroke-white' fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <path
                                d="M20 8.25V18C20 21 18.21 22 16 22H8C5.79 22 4 21 4 18V8.25C4 5 5.79 4.25 8 4.25C8 4.87 8.24997 5.43 8.65997 5.84C9.06997 6.25 9.63 6.5 10.25 6.5H13.75C14.99 6.5 16 5.49 16 4.25C18.21 4.25 20 5 20 8.25Z"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M16 4.25C16 5.49 14.99 6.5 13.75 6.5H10.25C9.63 6.5 9.06997 6.25 8.65997 5.84C8.24997 5.43 8 4.87 8 4.25C8 3.01 9.01 2 10.25 2H13.75C14.37 2 14.93 2.25 15.34 2.66C15.75 3.07 16 3.63 16 4.25Z"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M8 13H12"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                                <path
                                d="M8 17H16"
                                
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />{" "}
                            </g>
                        </svg>

                    </button>
                    <button onClick={() => handleSave()} className="bg-amber-100 text-yellow-700 p-2 rounded-lg border-yellow-700 border-2 transition duration-300 hover:bg-yellow-700 hover:text-white">
                        Save
                    </button>
                </div>
                <div onMouseEnter={() => setFocus(true)} onMouseLeave={() => setFocus(false)} className='w-full h-full px-3'>
                {
                    !render ?
                    <div className='w-full h-full p-4 bg-amber-100 rounded-lg'>
                    <textarea className="w-full h-full bg-amber-100 outline-none rounded-lg"
                        placeholder="Write your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)} /> 
                    </div>
                        :
                    <div onClick={() => setRender(false)} 
                        className={'w-full h-full p-4 bg-amber-100 hover:bg-amber-200 rounded-lg transition duration-300 ' + (content ? "" : "text-gray-500")}>
                        <Markdown>
                            {content ? content : "*Still nothing..*"}
                        </Markdown>
                    </div>
                }
                </div>
            </div>
        </div>
    )
}