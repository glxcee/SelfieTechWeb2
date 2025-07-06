import {useState, useEffect} from 'react';
import { address } from '../../utils.js';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';

export default function NotesPreview(){

    const [book, setBook] = useState([]);
    const [sort, setSort] = useState("latest");

    useEffect(() => {
        fetch(address+"api/notes")
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setBook(data.notes);
            })
    },[])

    useEffect(() => {
        if(sort === "latest"){
            setBook(prev => [...prev].sort((a, b) => new Date(b.modified) - new Date(a.modified)))
        } else if(sort === "oldest"){
            setBook(prev => [...prev].sort((a, b) => new Date(a.created) - new Date(b.created)))
        } else if(sort === "longest"){
            setBook(prev => [...prev].sort((a, b) => b.content.length - a.content.length))
        }
    }, [sort])

    return(   
        <div className="w-full xl:max-w-3xl md:max-w-lg sm:max-w-md bg-amber-100 shadow-lg rounded-2xl divide-y divide-gray-400 hover:divide-amber-300 ">
            <div class="p-4 font-bold text-black text-md dark:text-white">
                <select className='bg-amber-100 text-md font-semibold' onChange={(e) => setSort(e.target.value)}>
                    <option value="latest">Latest note</option>
                    <option value="oldest">Oldest note</option>
                    <option value="longest">Longest note</option>
                </select>
                <span class="ml-2 text-sm text-gray-500">
                    ({book.length} total)
                </span>
            </div>
                <Link to="/selfie/notes" className='flex justify-center items-left flex-col w-full gap-2 overflow-x-auto rounded-lg hover:bg-amber-300 transition-all duration-300'>
                    <div className='flex items-center justify-between'>
                        <div className='flex justify-start items-center w-full gap pl-3'>
                            <span className='text-xl p-3 font-semibold text-ellipsis'>
                                {book[0]?.title}
                            </span>
                            <div className='text-sm font-semibold'>
                                {book[0]?.categories.map((category, index) => (
                                    <span key={index} className='bg-amber-200 text-amber-800 text-xs font-semibold mr-1 px-2.5 py-0.5 rounded dark:bg-amber-900 dark:text-amber-300'>
                                        #{category}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <svg className='h-10 w-10 pr-3 stroke-gray-500 hover:scale-110' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 10L21 3M21 3H16.5M21 3V7.5M10 14L3 21M3 21H7.5M3 21L3 16.5" className='stroke-gray-500' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </div>
                    <div className='flex justify-start items-center w-full gap-2 pl-6 pb-5'>
                        <Markdown children={book[0]?.content.length > 500 ? book[0]?.content.slice(0, 500) + "..." : book[0]?.content} />
                    </div>
                </Link>
                
                
        </div>
    )
}