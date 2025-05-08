import Markdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { address } from '../../utils.js';
import { v4 as uuidv4 } from 'uuid';

export default function NotesPage(){
    const [content, setContent] = useState('');
    const [noteId, setNoteId] = useState('');
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [singleCategory, setSingleCategory] = useState('');

    const [render, setRender] = useState(true);
    const [renderedContent, setRenderedContent] = useState('');
    const [focus, setFocus] = useState(true);

    const [mobile, setMobile] = useState(false);

    const [book, setBook] = useState([]);
    const [sort, setSort] = useState('date');
    
    function newNote(arr) {
        arr.push({
            id: uuidv4(),
            title: "New note",
            categories: [],
            content: "*Still nothing..*",
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        })
        return arr
    }

        useEffect(() => {
            fetch(address+"api/notes")
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    if(data.notes.length == 0){
                        data.notes = newNote(data.notes)
                    }
                    setBook(data.notes);
                    setNoteId(data.notes[0].id)
                })
        },[])

        function saveContent() {
            let temp = [...book]
            temp.find((note, index) => {
                if(note.id === noteId){
                    temp[index].content = content
                    temp[index].title = title
                    temp[index].categories = categories
                    return true
                }
            })
            setBook(temp)
        }

        useEffect(() => {
            setRenderedContent(content.replace(/(?<!  )\n/g, '  \n'));
        },[content])

        useEffect(() => {
            console.log(noteId)
            if(noteId !== ""){
                book.find((note, index) => {
                    if(note.id === noteId){
                        setContent(note.content)
                        setTitle(note.title)
                        setCategories(note.categories)
                        return true
                    }
                })
            }
        }, [noteId])

        function updateModified() {
            let temp = [...book]
            temp.find((note, index) => {
                if(note.id === noteId){
                    temp[index].modified = new Date().toISOString()
                    return true
                }
            })
            sortBook(temp)
        }

        useEffect(() => {
            if(book.length > 1) 
                sortBook(book)
        }, [sort])

        function sortBook(currBook) {
            if(currBook.length > 1) {
                let temp = [...currBook]
                temp.sort((a, b) => {
                    if(sort === "date"){
                        return new Date(b.modified) - new Date(a.modified)
                    } else if(sort === "title"){
                        return a.title.localeCompare(b.title)
                    } else if(sort === "content"){
                        return b.content.length - a.content.length
                    }
                })
                setBook(temp)
            }
        }

    function handleSave() {
        saveContent()
        console.log(book)

        let finalBook = [...book]
        finalBook.sort((a, b) => {
                return new Date(b.modified) - new Date(a.modified)
        })

        fetch(address+'api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: finalBook })
        }).then(res => console.log(res))
    }

    function handleNewNote() {
        saveContent()

        let temp = [...book]
        temp = newNote(temp)
        
        sortBook(temp)
        setNoteId(temp[temp.length - 1].id)
    }

    function handleDuplicate() {
        saveContent()

        let temp = [...book]
        temp = newNote(temp)
        temp[temp.length - 1].title = title + " (copy)"
        temp[temp.length - 1].content = content
        temp[temp.length - 1].categories = categories

        sortBook(temp)
        setNoteId(temp[temp.length - 1].id)

        //sortBook()
    }

    function handleDelete() {
        if(book.length === 1) {
            alert("You can't delete the last note")
            return
        }
        saveContent()

        let temp = [...book]
        temp = temp.filter(note => note.id !== noteId)
        setBook(temp)
        setNoteId(temp[0].id)
    }

    function handleCategory(cat) {

        if(cat[cat.length - 1] === " "){
            updateModified()

            cat = cat.slice(0, -1)
            let temp = [...categories]
            temp.push(cat)
            setCategories(temp)
            setSingleCategory('')
        }
        else 
            setSingleCategory(cat)
    }

    function deleteCategory(index) {
        let temp = [...categories]
        temp.splice(index, 1)
        setCategories(temp)
    }

    return(
        <div className={"flex justify-center items-start min-h-screen h-max transition-all duration-300 " + (focus ? "bg-amber-100" : "bg-amber-200")}>
            <div className={(mobile ? "" : "hidden") + " w-full sm:w-1/3 bg-yellow-700 h-full min-h-screen rounded-none sm:rounded-r-xl text-white sm:flex flex-col items-center p-3"} onClick={() => setRender(true)}>
                <div className='w-full flex items-center justify-between p-3'>
                    <div>
                        <span className='text-2xl font-bold text-center'>All Notes</span>
                        <div>
                            <label htmlFor='sort' className='text-sm'>Sort by</label>
                            <select onChange={e => setSort(e.target.value)} className='bg-yellow-700 text-white outline-none rounded-lg p-1' name="sort">
                                <option value="date">Most recent</option>
                                <option value="title">Title</option>
                                <option value="content">Longest</option>
                            </select>
                        </div>
                    </div>
                    <svg onClick={() => handleNewNote()} className='w-16 h-16 cursor-pointer transition-all duration-300 hover:scale-110'
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                            className='stroke-white'
                            d="M10 12H14M12 10V14M19.9592 15H16.6C16.0399 15 15.7599 15 15.546 15.109C15.3578 15.2049 15.2049 15.3578 15.109 15.546C15 15.7599 15 16.0399 15 16.6V19.9592M20 14.1031V7.2C20 6.07989 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H14.1031C14.5923 20 14.8369 20 15.067 19.9447C15.2711 19.8957 15.4662 19.8149 15.6451 19.7053C15.847 19.5816 16.0199 19.4086 16.3658 19.0627L19.0627 16.3658C19.4086 16.0199 19.5816 15.847 19.7053 15.6451C19.8149 15.4662 19.8957 15.2711 19.9447 15.067C20 14.8369 20 14.5923 20 14.1031Z"
                            
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />{" "}
                        </g>
                    </svg>

                </div>
                <div className='w-full h-full flex flex-col justify-start items-center p-3 gap-2 overflow-y-auto divide-white divide-y-2 transition-all duration-300'>
                    {
                    book.map((note, index) => {

                        return (
                        <div key={index} onClick={() => {saveContent(); setNoteId(note.id); setMobile(false); window.scrollTo({ top: 0, behavior: 'smooth' })}} className={'w-full sm:overflow-hidden p-3 rounded-lg cursor-pointer '+ (noteId === note.id ? "bg-yellow-900" : "")}>
                            <p className='text-lg pl-2 font-semibold overflow-ellipsis overflow-hidden'>{note.title}</p>
                            <p className='text-xs overflow-ellipsis overflow-hidden'>{note?.content?.length > 200 ? note.content.slice(0, 200) + "..." : note.content}</p>
                        </div>
                    )})
                    }
                </div>
            </div>
            <div className={(mobile ? "hidden" : "") + " w-full min-h-screen flex flex-col justify-start items-center p-3 gap-2"}>
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
                    
                    <div className='flex items-center justify-center gap-2'>
                    <svg onClick={() => handleDuplicate()} title="Duplicate" className='h-14 w-14 fill-yellow-700 transition-all duration-300 hover:scale-110'  viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                                <g id="SVGRepo_iconCarrier">
                                    {" "}
                                    <path
                                    d="M47.81 91.725c0-8.328 6.539-15.315 15.568-15.33 9.03-.016 14.863.015 14.863.015s-.388-8.9-.388-15.978c0-7.08 6.227-14.165 15.262-14.165s92.802-.26 101.297.37c8.495.63 15.256 5.973 15.256 14.567 0 8.594-.054 93.807-.054 101.7 0 7.892-7.08 15.063-15.858 15.162-8.778.1-14.727-.1-14.727-.1s.323 9.97.323 16.094c0 6.123-7.12 15.016-15.474 15.016s-93.117.542-101.205.542c-8.088 0-15.552-7.116-15.207-15.987.345-8.871.345-93.58.345-101.906zm46.06-28.487l-.068 98.164c0 1.096.894 1.99 1.999 1.984l95.555-.51a2.007 2.007 0 0 0 1.998-2.01l-.064-97.283a2.01 2.01 0 0 0-2.01-2.007l-95.4-.326a1.99 1.99 0 0 0-2.01 1.988zM63.268 95.795l.916 96.246a2.007 2.007 0 0 0 2.02 1.982l94.125-.715a3.976 3.976 0 0 0 3.953-4.026l-.137-11.137s-62.877.578-71.054.578-15.438-7.74-15.438-16.45c0-8.71.588-68.7.588-68.7.01-1.1-.874-1.99-1.976-1.975l-9.027.13a4.025 4.025 0 0 0-3.97 4.067z"
                                    fillRule="evenodd"
                                    />{" "}
                                </g>
                            </svg>
                            <svg onClick={() => handleDelete()} title="Delete" className='h-12 w-12 stroke-yellow-700 transition-all duration-300 hover:scale-110 hover:stroke-red-600' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                                <g id="SVGRepo_iconCarrier">
                                    {" "}
                                    <path
                                    d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />{" "}
                                </g>
                            </svg>

                    </div>
                </div>
                <div onClick={() => setRender(true)} className='w-full bg-amber-100 rounded-lg p-4'> 
                    <input className='bg-amber-100 outline-none text-2xl w-full' type="text" value={title} onChange={e => {updateModified(); setTitle(e.target.value)}} placeholder='Title' />
                </div>
                <div onClick={() => setRender(true)} className='w-full flex text-sm justify-center items-center bg-amber-100 rounded-lg p-4 gap-2'> 
                    <div className='flex items-center justify-center gap-1'>
                        {
                            categories.map((category, index) => {
                                return (
                                    <span onClick={() => deleteCategory(index)} key={index} className='bg-yellow-700 hover:bg-red-600 hover:line-through text-white rounded-lg p-1 cursor-pointer transition-all duration-300'>#{category}</span>
                                )
                            })
                        }
                    </div>
                    <input className='bg-amber-100 outline-none w-full' type="text" value={singleCategory} onChange={e => handleCategory(e.target.value)} placeholder='Categories (divide by spacebar)' />
                </div>
                <div onMouseEnter={() => setFocus(true)} onMouseLeave={() => setFocus(false)} className='w-full min-h-screen h-max '>
                {
                    !render ?
                    <div className='w-full h-full bg-amber-100 p-4 rounded-lg'>
                        <textarea className="w-full h-screen bg-amber-100 resize-none outline-none rounded-lg"
                            placeholder="Write your note here..."
                            value={content}
                            onChange={(e) => {updateModified(); setContent(e.target.value)}} /> 
                    </div>
                        :
                    <div id="markdown-p" onClick={() => setRender(false)} 
                        className={'w-full overflow-x-scroll min-h-screen h-full bg-amber-100 p-4 hover:bg-amber-200 rounded-lg transition duration-300 ' + (content ? "" : "text-gray-400")}>
                        <Markdown>
                            {content ? renderedContent : "*Write your note here...*"}
                        </Markdown>
                    </div>
                }
                </div>
            </div>
        </div>
    )
}