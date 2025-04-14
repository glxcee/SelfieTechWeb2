import {useState, useEffect} from 'react';
import { address } from '../../utils.js';
import { Link } from 'react-router-dom';

export default function NotesPreview(){

    const [book, setBook] = useState([]);

    useEffect(() => {
        fetch(address+"api/notes")
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setBook(data.notes);
            })
    },[])

    return(   
        <Link to="/selfie/notes" className="w-full bg-white shadow-lg rounded-2xl hover:bg-gray-300 transition-all duration-300">
            <div className='flex justify-between items-center'>
            <p class="p-4 font-bold text-black text-md dark:text-white">
                Latest note
                <span class="ml-2 text-sm text-gray-500">
                    ({book.length} total)
                </span>
            </p>
            <svg className='h-8 w-8 pr-3' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#b3b3b3"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 10L21 3M21 3H16.5M21 3V7.5M10 14L3 21M3 21H7.5M3 21L3 16.5" className='stroke-gray-300' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>   
            </div>
                <div className='flex justify-center items-center'>
                    {
                        book.length > 0 ?
                        <p className='p-4 text-black text-md'>{book[0].title}</p> :
                        <p className='p-4 text-gray-700 text-md'>Still nothing here..</p>
                    }
                </div>
                
                
        </Link>
    )
}